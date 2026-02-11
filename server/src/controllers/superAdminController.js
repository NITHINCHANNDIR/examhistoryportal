const User = require('../models/User');
const AgentLog = require('../models/AgentLog');
const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/superadmin/audit-logs
// @access  Private (Super Admin)
exports.getAuditLogs = async (req, res) => {
    try {
        const {
            action,
            category,
            performedBy,
            severity,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const query = {};

        if (action) query.action = action;
        if (category) query.category = category;
        if (performedBy) query.performedBy = performedBy;
        if (severity) query.severity = severity;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .populate('performedBy', 'email profile.firstName profile.lastName role')
            .populate('targetUser', 'email profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs',
            error: error.message
        });
    }
};

// @desc    Get all users (role management)
// @route   GET /api/superadmin/users
// @access  Private (Super Admin)
exports.getUsers = async (req, res) => {
    try {
        const { role, isActive, search, page = 1, limit = 20 } = req.query;

        const query = {};

        // By default, only show admin and superadmin users (not students)
        if (role) {
            query.role = role;
        } else {
            query.role = { $in: ['admin', 'superadmin'] };
        }

        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) query.$text = { $search: search };

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Update user role
// @route   PUT /api/superadmin/users/:id/role
// @access  Private (Super Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const previousRole = user.role;
        user.role = role;
        await user.save({ validateBeforeSave: false });

        // Create audit log
        await AuditLog.createEntry({
            action: 'role_changed',
            category: 'user',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            targetUser: user._id,
            details: {
                previousValue: previousRole,
                newValue: role,
                description: `Changed role from ${previousRole} to ${role}`
            },
            severity: 'warning'
        });

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/superadmin/users/:id/status
// @access  Private (Super Admin)
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        // Create audit log
        await AuditLog.createEntry({
            action: 'user_updated',
            category: 'user',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            targetUser: user._id,
            details: {
                description: `User ${user.isActive ? 'activated' : 'deactivated'}`
            },
            severity: 'warning'
        });

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
};

// @desc    Ground Agent decision
// @route   POST /api/superadmin/agent/ground/:logId
// @access  Private (Super Admin)
exports.groundAgentDecision = async (req, res) => {
    try {
        const { reason } = req.body;

        const agentLog = await AgentLog.findById(req.params.logId);

        if (!agentLog) {
            return res.status(404).json({
                success: false,
                message: 'Agent log not found'
            });
        }

        agentLog.status = 'grounded';
        agentLog.groundedBy = req.user._id;
        agentLog.groundedAt = new Date();
        agentLog.groundingReason = reason;
        await agentLog.save();

        // Create audit log
        await AuditLog.createEntry({
            action: 'agent_grounded',
            category: 'agent',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            targetResource: {
                type: 'AgentLog',
                id: agentLog._id.toString()
            },
            details: {
                description: `Grounded agent task: ${agentLog.taskType}`,
                newValue: reason
            },
            severity: 'critical'
        });

        res.status(200).json({
            success: true,
            message: 'Agent decision grounded successfully',
            data: agentLog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error grounding agent decision',
            error: error.message
        });
    }
};

// @desc    Get system configuration
// @route   GET /api/superadmin/config
// @access  Private (Super Admin)
exports.getConfig = async (req, res) => {
    try {
        // In a real app, this would come from a Config model or env
        const config = {
            agentSettings: {
                anomalyDetectionEnabled: true,
                batchInsightsEnabled: true,
                integrityVerificationEnabled: true,
                autoArchivalEnabled: true,
                archivalThresholdYears: 5,
                anomalyThreshold: 0.15
            },
            systemSettings: {
                maxUploadSize: '10MB',
                allowedFileTypes: ['csv', 'json'],
                sessionTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days
            }
        };

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching configuration',
            error: error.message
        });
    }
};

// @desc    Update system configuration
// @route   PUT /api/superadmin/config
// @access  Private (Super Admin)
exports.updateConfig = async (req, res) => {
    try {
        const { agentSettings, systemSettings } = req.body;

        // In a real app, this would update a Config model
        // For now, we just log the action

        await AuditLog.createEntry({
            action: 'config_updated',
            category: 'system',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            details: {
                description: 'System configuration updated',
                newValue: { agentSettings, systemSettings }
            },
            severity: 'critical'
        });

        res.status(200).json({
            success: true,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating configuration',
            error: error.message
        });
    }
};

// @desc    Get Agent statistics
// @route   GET /api/superadmin/agent/stats
// @access  Private (Super Admin)
exports.getAgentStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await AgentLog.getStats(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        // Get recent activity
        const recentLogs = await AgentLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('triggeredByUser', 'email');

        res.status(200).json({
            success: true,
            data: {
                taskStats: stats,
                recentActivity: recentLogs
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching agent statistics',
            error: error.message
        });
    }
};

// @desc    Create admin user
// @route   POST /api/superadmin/users/admin
// @access  Private (Super Admin)
exports.createAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const user = await User.create({
            email,
            password: 'Admin@123', // Default password
            role: 'admin',
            profile: {
                firstName: 'New',
                lastName: 'Admin'
            },
            isFirstLogin: true,
            requiresOnboarding: true
        });

        await AuditLog.createEntry({
            action: 'user_created',
            category: 'user',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            targetUser: user._id,
            details: {
                description: `Created admin user: ${email}`
            },
            severity: 'warning'
        });

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating admin user',
            error: error.message
        });
    }
};

// @desc    Delete user (admin or student)
// @route   DELETE /api/superadmin/users/:id
// @access  Private (Super Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        await AuditLog.createEntry({
            action: 'user_deleted',
            category: 'user',
            performedBy: req.user._id,
            performedByRole: req.user.role,
            targetUser: user._id,
            details: {
                description: `Deleted user: ${user.email} (${user.role})`
            },
            severity: 'critical'
        });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};
