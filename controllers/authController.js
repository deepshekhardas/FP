const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const tenantId = req.tenant ? req.tenant._id : null; // tenant from middleware

    try {
        // Check user existence WITHIN the tenant (or global if no tenant)
        const userExists = await User.findOne({ email, tenantId });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            tenantId
        });

        if (user) {
            // Generate verification token and send email
            const verificationToken = await Token.generateToken(user._id, 'email_verification', 24);
            await sendVerificationEmail(user, verificationToken);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isEmailVerified: user.isEmailVerified,
                tenantId: user.tenantId,
                token: generateToken(user._id),
                message: 'Registration successful! Please check your email to verify your account.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const tokenDoc = await Token.verifyToken(req.params.token, 'email_verification');

        if (!tokenDoc) {
            return res.status(400).json({ message: 'Invalid or expired verification link' });
        }

        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isEmailVerified = true;
        await user.save();
        await Token.deleteOne({ _id: tokenDoc._id });

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
        }

        const resetToken = await Token.generateToken(user._id, 'password_reset', 1);
        await sendPasswordResetEmail(user, resetToken);

        res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const tokenDoc = await Token.verifyToken(req.params.token, 'password_reset');

        if (!tokenDoc) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = password;
        await user.save();
        await Token.deleteOne({ _id: tokenDoc._id });

        res.json({ message: 'Password reset successful! You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isSuspended) {
            return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isEmailVerified: user.isEmailVerified,
                subscriptionTier: user.subscriptionTier,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isEmailVerified: user.isEmailVerified,
                subscriptionTier: user.subscriptionTier,
                subscriptionExpiry: user.subscriptionExpiry
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword
};

