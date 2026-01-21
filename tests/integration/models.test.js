const mongoose = require('mongoose');
const { User, UserProfile, Exercise, WorkoutLog } = require('../../db');
require('dotenv').config();

describe('Database Models Integration', () => {
    beforeAll(async () => {
        // Use a distinct test DB to avoid wiping dev data
        const testURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/fitness_tracker_test';
        await mongoose.connect(testURI);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        // Optional: clear collections between tests
        await User.deleteMany({});
        await UserProfile.deleteMany({});
        await Exercise.deleteMany({});
        await WorkoutLog.deleteMany({});
    });

    it('should perform full user flow', async () => {
        // 1. Create User
        const uniqueEmail = `int_${Date.now()}@test.com`;
        const user = await User.create({ name: 'Integration Test', email: uniqueEmail, password: 'hash' });
        expect(user._id).toBeDefined();

        // 2. Create Profile
        const profile = await UserProfile.create({
            userId: user._id,
            height: 180,
            weight: 75,
            age: 30,
            goalWeight: 70,
            fitnessLevel: 'Intermediate'
        });
        expect(parseFloat(profile.bmi)).toBeCloseTo(23.15, 1);

        // 3. Create Exercise
        const exercise = await Exercise.create({
            name: 'Test Pushup',
            muscleGroup: 'Chest',
            description: 'Push it',
            difficulty: 'Easy'
        });
        expect(exercise._id).toBeDefined();

        // 4. Log Workout
        const log = await WorkoutLog.create({
            userId: user._id,
            date: new Date(),
            exercises: [{ exerciseId: exercise._id, setsCompleted: 3, reps: 10 }],
            totalDuration: 30
        });
        expect(log.exercises).toHaveLength(1);
    });
});
