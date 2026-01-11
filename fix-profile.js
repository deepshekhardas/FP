const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const UserProfile = require('./models/UserProfile');

dotenv.config({ path: '../.env' }); // Adjust path if needed

const fixProfile = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/fitness_tracker');
        console.log('MongoDB Connected');

        // 1. Find the user
        // We know the email is likely one of the few in the DB, or we find by the name "debbhdb" seen in screenshot
        const user = await User.findOne({ name: 'debbhdb' });

        if (!user) {
            console.log('User "debbhdb" not found! Listing all users to identify target...');
            const users = await User.find({});
            users.forEach(u => console.log(`- ${u.name} (${u.email}) ID: ${u._id}`));
            process.exit(1);
        }

        console.log(`Found User: ${user.name} (${user._id})`);

        // 2. Check Profile
        const profile = await UserProfile.findOne({ userId: user._id });
        if (profile) {
            console.log('Profile already exists! Deleting and recreating to ensuring it is valid...');
            await UserProfile.deleteOne({ userId: user._id });
        }

        // 3. Create Profile
        const newProfile = await UserProfile.create({
            userId: user._id,
            height: 175,
            weight: 75,
            age: 24,
            goalWeight: 70,
            fitnessLevel: 'Intermediate',
            bio: 'Fitness enthusiast',
            settings: {
                notifications: { dailyReminder: true },
                appearance: { darkMode: true }
            }
        });

        console.log('SUCCESS: Profile Created Manually!');
        console.log(newProfile);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

fixProfile();
