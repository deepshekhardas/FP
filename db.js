const mongoose = require('mongoose');
// const logger = require('./utils/logger');

// Import Models
const User = require('./models/User');
const UserProfile = require('./models/UserProfile');
const Exercise = require('./models/Exercise');
const WorkoutPlan = require('./models/WorkoutPlan');
const WorkoutLog = require('./models/WorkoutLog');
const Goal = require('./models/Goal');
const UserPlan = require('./models/UserPlan');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_tracker', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = {
    connectDB,
    User,
    UserProfile,
    Exercise,
    WorkoutPlan,
    WorkoutLog,
    Goal,
    UserPlan
};
