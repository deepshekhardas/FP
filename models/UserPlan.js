const mongoose = require('mongoose');

const userPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutPlan',
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Prevent duplicate subscriptions to the same plan
userPlanSchema.index({ userId: 1, planId: 1 }, { unique: true });

module.exports = mongoose.model('UserPlan', userPlanSchema);
