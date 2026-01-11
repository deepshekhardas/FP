const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration in weeks is required']
    },
    frequency: {
        type: Number,
        required: [true, 'Frequency (workouts per week) is required']
    },
    targetAudience: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    focusArea: {
        type: String,
        enum: ['WeightLoss', 'MuscleGain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'],
        required: true
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true
        },
        sets: {
            type: Number,
            default: 3
        },
        reps: {
            type: String, // String to allow ranges like "8-12"
            default: "10"
        },
        duration: {
            type: Number, // In seconds or minutes, depending on context
            default: 0
        },
        notes: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
