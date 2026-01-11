const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    height: {
        type: Number,
        required: [true, 'Height is required (in cm)']
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required (in kg)']
    },
    age: {
        type: Number,
        required: [true, 'Age is required']
    },
    goalWeight: {
        type: Number
    },
    fitnessLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    bio: {
        type: String,
        default: ''
    },
    settings: {
        notifications: {
            dailyReminder: { type: Boolean, default: false },
            reminderTime: { type: String, default: '09:00' },
            achievement: { type: Boolean, default: true },
            weeklySummary: { type: Boolean, default: true },
            goalReminders: { type: Boolean, default: true },
            restDayAlerts: { type: Boolean, default: true }
        },
        privacy: {
            profileVisibility: { type: String, enum: ['Public', 'Private', 'Friends'], default: 'Public' },
            showHistory: { type: Boolean, default: true },
            allowFriendRequests: { type: Boolean, default: true }
        },
        appearance: {
            darkMode: { type: Boolean, default: false },
            fontSize: { type: String, enum: ['Small', 'Normal', 'Large'], default: 'Normal' },
            accentColor: { type: String, default: 'blue' }
        },
        units: {
            weight: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
            distance: { type: String, enum: ['km', 'miles'], default: 'km' },
            timezone: { type: String, default: 'UTC' },
            language: { type: String, default: 'en' }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for BMI
userProfileSchema.virtual('bmi').get(function () {
    if (this.height && this.weight) {
        const heightInMeters = this.height / 100;
        return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return null;
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
