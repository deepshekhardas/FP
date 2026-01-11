const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true
        },
        setsCompleted: {
            type: Number,
            required: true
        },
        reps: {
            type: Number
        },
        weight: {
            type: Number // In kg
        },
        duration: {
            type: Number // In minutes
        },
        notes: String
    }],
    totalDuration: {
        type: Number, // In minutes
        default: 0
    },
    caloriesBurned: {
        type: Number,
        default: 0
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 10
    },
    energyLevel: {
        type: Number,
        min: 1,
        max: 10
    }
}, {
    timestamps: true
});

// Index for querying logs by user and date
workoutLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
