const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Weight', 'Exercise', 'Frequency', 'Strength', 'Endurance'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    targetValue: {
        type: Number,
        required: true
    },
    currentValue: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    targetDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['InProgress', 'Completed', 'Failed'],
        default: 'InProgress'
    },
    milestones: [{
        value: Number,
        description: String,
        achieved: {
            type: Boolean,
            default: false
        },
        dateAchieved: Date
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function () {
    if (this.targetValue === 0) return 0;
    // Simple calculation assuming starting from 0. 
    // For weight loss, logic might need to be inverted or based on startValue (not currently in schema but implied)
    // For now, implementing basic percentage based on current/target
    let percentage = (this.currentValue / this.targetValue) * 100;
    return Math.min(Math.max(percentage, 0), 100).toFixed(2);
});

goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
