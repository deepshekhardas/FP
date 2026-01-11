const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Exercise name is required'],
        trim: true,
        unique: true
    },
    muscleGroup: {
        type: String,
        required: true,
        enum: ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Cardio', 'Core', 'Full Body']
    },
    equipment: {
        type: String,
        required: true,
        enum: ['None', 'Dumbbells', 'Barbell', 'Treadmill', 'Machine', 'Kettlebell', 'Resistance Bands', 'Other'],
        default: 'None'
    },
    description: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    instructions: [{
        type: String
    }],
    imageUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Text index for search
exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ muscleGroup: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
