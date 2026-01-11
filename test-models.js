const mongoose = require('mongoose');
const { connectDB, UserProfile, Exercise, WorkoutPlan, WorkoutLog, Goal } = require('./db');
require('dotenv').config();

// Simple User Schema for testing reference
const userSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.model('User', userSchema);

const runTest = async () => {
    await connectDB();

    try {
        // 1. Create a Test User
        const user = await User.create({ name: 'Test User', email: 'test@example.com' });
        console.log('✅ User created:', user._id);

        // 2. Create UserProfile
        const profile = await UserProfile.create({
            userId: user._id,
            height: 180,
            weight: 75,
            age: 30,
            goalWeight: 70,
            fitnessLevel: 'Intermediate'
        });
        console.log('✅ UserProfile created. BMI:', profile.bmi); // Should be ~23.15

        // 3. Create Exercises
        const pushups = await Exercise.create({
            name: 'Pushups',
            muscleGroup: 'Chest',
            equipment: 'None',
            description: 'Standard pushup',
            difficulty: 'Easy',
            instructions: ['Plank position', 'Lower body', 'Push up']
        });
        console.log('✅ Exercise created:', pushups.name);

        const squats = await Exercise.create({
            name: 'Squats',
            muscleGroup: 'Legs',
            equipment: 'None',
            description: 'Bodyweight squat',
            difficulty: 'Medium'
        });
        console.log('✅ Exercise created:', squats.name);

        // 4. Create WorkoutPlan
        const plan = await WorkoutPlan.create({
            name: 'Beginner Full Body',
            duration: 4,
            frequency: 3,
            targetAudience: 'Beginner',
            focusArea: 'General Fitness',
            exercises: [
                { exerciseId: pushups._id, sets: 3, reps: '10-12' },
                { exerciseId: squats._id, sets: 3, reps: '15' }
            ]
        });
        console.log('✅ WorkoutPlan created:', plan.name);

        // 5. Log a Workout
        const log = await WorkoutLog.create({
            userId: user._id,
            date: new Date(),
            exercises: [
                { exerciseId: pushups._id, setsCompleted: 3, reps: 12, notes: 'Felt good' }
            ],
            totalDuration: 45,
            difficulty: 6,
            energyLevel: 8
        });
        console.log('✅ WorkoutLog created for user:', log.userId);

        // 6. Create a Goal
        const goal = await Goal.create({
            userId: user._id,
            type: 'Weight',
            name: 'Lose 5kg',
            targetValue: 70,
            currentValue: 75,
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
        console.log('✅ Goal created:', goal.name, 'Progress:', goal.progressPercentage + '%');

        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`   - ${key}: ${error.errors[key].message}`);
            });
        }
    } finally {
        // Cleanup
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        console.log('Database dropped and connection closed.');
    }
};

runTest();
