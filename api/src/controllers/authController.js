const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, studentId, department, batchYear, role, phone } = req.body;

        // Validate role
        const validRoles = ['student', 'admin'];
        const userRole = (role || 'student').toLowerCase();
        if (!validRoles.includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be student or admin'
            });
        }

        // Validate required fields based on role
        if (userRole === 'student' && !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required for student registration'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if studentId exists (for students)
        if (studentId) {
            const existingStudent = await User.findOne({ studentId });
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID already registered'
                });
            }
        }

        // Create user
        const user = await User.create({
            email,
            password,
            studentId,
            role: userRole,
            profile: {
                firstName,
                lastName,
                department,
                batchYear,
                phone
            }
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                profile: user.profile
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Create audit log
        await AuditLog.createEntry({
            action: 'user_login',
            category: 'auth',
            performedBy: user._id,
            performedByRole: user.role,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                profile: user.profile,
                isFirstLogin: user.isFirstLogin,
                requiresOnboarding: user.requiresOnboarding
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                profile: user.profile,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // Create audit log
        await AuditLog.createEntry({
            action: 'user_logout',
            category: 'auth',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
    }
};

// @desc    Update avatar
// @route   PUT /api/auth/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const user = await User.findById(req.user.id);

        const avatarPath = req.file.path.replace(/\\/g, '/');

        user.profile.avatar = avatarPath;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            data: avatarPath,
            message: 'Profile picture updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile picture',
            error: error.message
        });
    }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, department } = req.body;
        const user = await User.findById(req.user.id);
        
        if (firstName) user.profile.firstName = firstName;
        if (lastName) user.profile.lastName = lastName;
        if (department) user.profile.department = department;
        
        await user.save({ validateBeforeSave: false });
        
        res.status(200).json({
            success: true,
            user,
            message: 'Profile details updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile details',
            error: error.message
        });
    }
};

// @desc    Complete onboarding (set password & profile)
// @route   POST /api/auth/onboarding
// @access  Private
exports.completeOnboarding = async (req, res) => {
    try {
        const { firstName, lastName, newPassword } = req.body;

        if (!firstName || !lastName || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user.requiresOnboarding) {
            return res.status(400).json({
                success: false,
                message: 'User does not require onboarding'
            });
        }

        user.profile.firstName = firstName;
        user.profile.lastName = lastName;
        user.password = newPassword;
        user.isFirstLogin = false;
        user.requiresOnboarding = false;

        await user.save();

        // Create audit log
        await AuditLog.createEntry({
            action: 'onboarding_completed',
            category: 'user',
            performedBy: user._id,
            performedByRole: user.role,
            details: {
                description: 'User completed onboarding setup'
            },
            severity: 'info'
        });

        res.status(200).json({
            success: true,
            message: 'Onboarding completed successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                profile: user.profile,
                isFirstLogin: false,
                requiresOnboarding: false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing onboarding',
            error: error.message
        });
    }
};
