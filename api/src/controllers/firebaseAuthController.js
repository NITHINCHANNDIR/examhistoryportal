const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client("807328919677-ehcpsgja6bsrmb5gun84cid9fqqll54e.apps.googleusercontent.com");

// Generate standard backend JWT Token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Google Login/Registration via OAuth2
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID token is required' });
        }

        // Verify the token sent by the frontend securely using Google library
        const ticket = await client.verifyIdToken({
            idToken,
            audience: "807328919677-ehcpsgja6bsrmb5gun84cid9fqqll54e.apps.googleusercontent.com",
        });
        const decodedToken = ticket.getPayload();

        const { email, name, picture, sub } = decodedToken;
        const uid = sub;

        // Check if user exists in database
        let user = await User.findOne({ email });

        if (!user) {
            // Create user automatically using Google Profile info
            const userRole = (role || 'student').toLowerCase();
            const nameParts = name ? name.split(' ') : ['Google', 'User'];
            
            user = await User.create({
                email,
                password: uid, // Use Firebase UID or sub as dummy password
                role: userRole,
                profile: {
                    firstName: nameParts[0],
                    lastName: nameParts.slice(1).join(' ') || '',
                    avatar: picture
                },
                isFirstLogin: true,
                requiresOnboarding: true
            });
        }

        // Check active status
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

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
        console.error('Firebase Auth Error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired Google token',
            error: error.message
        });
    }
};
