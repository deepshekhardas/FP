const mongoose = require('mongoose');

const checkDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/fitness_tracker', {
            serverSelectionTimeoutMS: 2000
        });
        console.log('MongoDB is RUNNING');
        process.exit(0);
    } catch (error) {
        console.log('MongoDB is NOT running');
        process.exit(1);
    }
};

checkDB();
