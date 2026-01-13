const nodemailer = require('nodemailer');

// Create transporter - uses Ethereal (fake SMTP) for development
let transporter;

const initTransporter = async () => {
    if (process.env.SMTP_HOST) {
        // Production: Use real SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Development: Use Ethereal (fake SMTP for testing)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('📧 Email: Using Ethereal test account. Emails will be captured at https://ethereal.email');
    }
};

// Initialize on module load
initTransporter();

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        if (!transporter) await initTransporter();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"FitnessPro" <noreply@fitnesspro.com>',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '')
        });

        console.log('📧 Email sent:', info.messageId);

        // For development, log the preview URL
        if (!process.env.SMTP_HOST) {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('📧 Email error:', error);
        return { success: false, error: error.message };
    }
};

const sendVerificationEmail = async (user, token) => {
    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    return sendEmail({
        to: user.email,
        subject: 'Verify Your FitnessPro Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #6366f1;">Welcome to FitnessPro! 🏋️</h1>
                <p>Hi ${user.name},</p>
                <p>Thanks for signing up! Please verify your email address to get started.</p>
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Verify My Email
                </a>
                <p style="color: #666; font-size: 0.9rem;">Or copy this link: ${verifyUrl}</p>
                <p style="color: #999; font-size: 0.8rem;">This link expires in 24 hours.</p>
            </div>
        `
    });
};

const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    return sendEmail({
        to: user.email,
        subject: 'Reset Your FitnessPro Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #6366f1;">Password Reset Request</h1>
                <p>Hi ${user.name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password.</p>
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Reset Password
                </a>
                <p style="color: #666; font-size: 0.9rem;">Or copy this link: ${resetUrl}</p>
                <p style="color: #999; font-size: 0.8rem;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
        `
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};
