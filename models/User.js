const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    subscriptionTier: {
        type: String,
        enum: ['free', 'pro', 'premium'],
        default: 'free'
    },
    subscriptionExpiry: {
        type: Date,
        default: null
    },
    stripeCustomerId: {
        type: String, // For payment processing
        default: null
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        default: null // Null means "fitnesspro" (default platform)
    }
}, {
    timestamps: true
});

// Compound index for unique email PER TENANT (optional, but good for SaaS)
// userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
