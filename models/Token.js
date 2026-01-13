const mongoose = require('mongoose');
const crypto = require('crypto');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email_verification', 'password_reset'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for auto-cleanup of expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate a new token
tokenSchema.statics.generateToken = async function (userId, type, expiryHours = 24) {
    // Remove any existing tokens of this type for this user
    await this.deleteMany({ userId, type });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const newToken = await this.create({
        userId,
        token,
        type,
        expiresAt
    });

    return newToken.token;
};

// Static method to verify a token
tokenSchema.statics.verifyToken = async function (token, type) {
    const tokenDoc = await this.findOne({
        token,
        type,
        expiresAt: { $gt: new Date() }
    });

    return tokenDoc;
};

module.exports = mongoose.model('Token', tokenSchema);
