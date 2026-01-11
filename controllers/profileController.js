const { UserProfile } = require('../db');

// @desc    Create user profile
// @route   POST /api/profile
// @access  Private
const createProfile = async (req, res) => {
    try {
        const { height, weight, age, goalWeight, fitnessLevel, bio, settings } = req.body;
        const userId = req.user.id;

        // Validation
        if (!height || !weight || !age) {
            return res.status(400).json({ message: 'Please provide height, weight, and age' });
        }
        if (height <= 0 || weight <= 0) {
            return res.status(400).json({ message: 'Height and weight must be positive numbers' });
        }
        if (age < 13 || age > 150) {
            return res.status(400).json({ message: 'Age must be between 13 and 150' });
        }

        // Check if profile exists
        const profileExists = await UserProfile.findOne({ userId });
        if (profileExists) {
            return res.status(409).json({ message: 'User profile already exists' });
        }

        const profile = await UserProfile.create({
            userId,
            height,
            weight,
            age,
            goalWeight,
            fitnessLevel,
            bio,
            settings
        });

        res.status(201).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        let profile = await UserProfile.findOne({ userId: req.user.id });

        if (!profile) {
            // Auto-create default profile if missing
            console.log(`Profile missing for user ${req.user.id}. Creating default profile.`);
            profile = await UserProfile.create({
                userId: req.user.id,
                height: 170, // Default cm
                weight: 70,  // Default kg
                age: 25,     // Default age
                goalWeight: 70,
                fitnessLevel: 'Beginner',
                bio: 'Ready to start my fitness journey!'
            });
        }

        res.json(profile);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // If avatar is provided, update User model
        if (req.body.avatar) {
            const { User } = require('../db');
            await User.findByIdAndUpdate(req.user.id, { avatar: req.body.avatar });
        }

        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update metrics (height, weight, age)
// @route   PUT /api/profile/metrics
// @access  Private
const updateMetrics = async (req, res) => {
    try {
        const { height, weight, age } = req.body;

        // Validation
        if (height && height <= 0) return res.status(400).json({ message: 'Height must be positive' });
        if (weight && weight <= 0) return res.status(400).json({ message: 'Weight must be positive' });
        if (age && (age < 13 || age > 150)) return res.status(400).json({ message: 'Age must be between 13 and 150' });

        const profile = await UserProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        if (height) profile.height = height;
        if (weight) profile.weight = weight;
        if (age) profile.age = age;

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get BMI
// @route   GET /api/profile/bmi
// @access  Private
const calculateBMI = async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // BMI is a virtual field, so it's already calculated
        res.json({
            bmi: profile.bmi,
            height: profile.height,
            weight: profile.weight
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile,
    updateMetrics,
    calculateBMI
};
