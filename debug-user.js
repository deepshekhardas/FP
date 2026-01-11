const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness_tracker');
        console.log('Connected to DB');

        const email = '23f1000863@ds.study.iitm.ac.in';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.email}`);
            console.log(`Is Admin: ${user.isAdmin}`);
            console.log('Password hash exists:', !!user.password);
        } else {
            console.log(`User ${email} NOT found in database.`);
        }

        const allUsers = await User.find({});
        console.log('Total users in DB:', allUsers.length);
        allUsers.forEach(u => console.log(`- ${u.email} (${u.name})`));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
