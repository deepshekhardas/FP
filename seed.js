const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, Exercise, WorkoutPlan, User } = require('./db');

dotenv.config();

const exercises = [
    // Chest
    { name: 'Pushups', muscleGroup: 'Chest', equipment: 'None', description: 'Standard pushup', difficulty: 'Easy' },
    { name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', description: 'Flat bench press', difficulty: 'Medium' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', description: 'Incline press', difficulty: 'Medium' },
    { name: 'Chest Fly', muscleGroup: 'Chest', equipment: 'Dumbbells', description: 'Dumbbell fly', difficulty: 'Medium' },
    { name: 'Cable Crossover', muscleGroup: 'Chest', equipment: 'Machine', description: 'Cable chest fly', difficulty: 'Medium' },

    // Back
    { name: 'Pullups', muscleGroup: 'Back', equipment: 'None', description: 'Standard pullup', difficulty: 'Hard' },
    { name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', description: 'Conventional deadlift', difficulty: 'Hard' },
    { name: 'Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', description: 'Barbell row', difficulty: 'Medium' },
    { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', description: 'Cable lat pulldown', difficulty: 'Easy' },
    { name: 'Seated Row', muscleGroup: 'Back', equipment: 'Machine', description: 'Cable seated row', difficulty: 'Medium' },

    // Legs
    { name: 'Squats', muscleGroup: 'Legs', equipment: 'None', description: 'Bodyweight squat', difficulty: 'Easy' },
    { name: 'Barbell Squat', muscleGroup: 'Legs', equipment: 'Barbell', description: 'Back squat', difficulty: 'Hard' },
    { name: 'Lunges', muscleGroup: 'Legs', equipment: 'None', description: 'Walking lunges', difficulty: 'Medium' },
    { name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', description: 'Machine leg press', difficulty: 'Medium' },
    { name: 'Calf Raises', muscleGroup: 'Legs', equipment: 'None', description: 'Standing calf raise', difficulty: 'Easy' },

    // Shoulders
    { name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', description: 'Standing overhead press', difficulty: 'Hard' },
    { name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', description: 'Side lateral raise', difficulty: 'Medium' },
    { name: 'Front Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', description: 'Front dumbbell raise', difficulty: 'Easy' },
    { name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Machine', description: 'Cable face pull', difficulty: 'Medium' },
    { name: 'Shrugs', muscleGroup: 'Shoulders', equipment: 'Dumbbells', description: 'Dumbbell shrugs', difficulty: 'Easy' },

    // Arms
    { name: 'Bicep Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', description: 'Standing bicep curl', difficulty: 'Easy' },
    { name: 'Tricep Dips', muscleGroup: 'Arms', equipment: 'None', description: 'Bench dips', difficulty: 'Medium' },
    { name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', description: 'Neutral grip curl', difficulty: 'Easy' },
    { name: 'Skullcrushers', muscleGroup: 'Arms', equipment: 'Barbell', description: 'Lying tricep extension', difficulty: 'Medium' },
    { name: 'Chin-ups', muscleGroup: 'Arms', equipment: 'None', description: 'Underhand pullup', difficulty: 'Hard' },

    // Cardio
    { name: 'Running', muscleGroup: 'Cardio', equipment: 'None', description: 'Outdoor running', difficulty: 'Medium' },
    { name: 'Cycling', muscleGroup: 'Cardio', equipment: 'Machine', description: 'Stationary bike', difficulty: 'Easy' },
    { name: 'Jump Rope', muscleGroup: 'Cardio', equipment: 'Other', description: 'Skipping rope', difficulty: 'Medium' },
    { name: 'Burpees', muscleGroup: 'Cardio', equipment: 'None', description: 'Full body cardio', difficulty: 'Hard' },
    { name: 'Rowing', muscleGroup: 'Cardio', equipment: 'Machine', description: 'Rowing machine', difficulty: 'Hard' },

    // Core
    { name: 'Plank', muscleGroup: 'Core', equipment: 'None', description: 'Static hold', difficulty: 'Medium' },
    { name: 'Crunches', muscleGroup: 'Core', equipment: 'None', description: 'Abdominal crunch', difficulty: 'Easy' },
    { name: 'Leg Raises', muscleGroup: 'Core', equipment: 'None', description: 'Lying leg raise', difficulty: 'Medium' },
    { name: 'Russian Twists', muscleGroup: 'Core', equipment: 'None', description: 'Seated twist', difficulty: 'Medium' },
    { name: 'Mountain Climbers', muscleGroup: 'Core', equipment: 'None', description: 'Dynamic plank', difficulty: 'Medium' }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Exercise.deleteMany({});
        await WorkoutPlan.deleteMany({});
        await User.deleteMany({});

        console.log('Data cleared...');

        // Create Admin User
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword', // In real app, hash this!
            isAdmin: true
        });
        console.log('Admin user created...');

        // Insert Exercises
        const createdExercises = await Exercise.insertMany(exercises);
        console.log(`Imported ${createdExercises.length} exercises...`);

        // Helper to find exercise ID by name
        const getExId = (name) => createdExercises.find(e => e.name === name)._id;

        // Create Workout Plans
        const plans = [
            {
                name: 'Beginner Full Body',
                description: 'A simple full body workout for beginners.',
                duration: 4,
                frequency: 3,
                targetAudience: 'Beginner',
                focusArea: 'General Fitness',
                exercises: [
                    { exerciseId: getExId('Squats'), sets: 3, reps: '12' },
                    { exerciseId: getExId('Pushups'), sets: 3, reps: '10' },
                    { exerciseId: getExId('Bent Over Row'), sets: 3, reps: '12' },
                    { exerciseId: getExId('Plank'), sets: 3, duration: 30 } // 30 seconds
                ]
            },
            {
                name: 'Upper Body Power',
                description: 'Focus on chest, back, and arms.',
                duration: 6,
                frequency: 4,
                targetAudience: 'Intermediate',
                focusArea: 'MuscleGain',
                exercises: [
                    { exerciseId: getExId('Bench Press'), sets: 4, reps: '8' },
                    { exerciseId: getExId('Pullups'), sets: 3, reps: 'Max' },
                    { exerciseId: getExId('Overhead Press'), sets: 3, reps: '10' },
                    { exerciseId: getExId('Bicep Curls'), sets: 3, reps: '12' },
                    { exerciseId: getExId('Tricep Dips'), sets: 3, reps: '12' }
                ]
            },
            {
                name: 'Leg Day Blast',
                description: 'Intense leg workout.',
                duration: 8,
                frequency: 2,
                targetAudience: 'Advanced',
                focusArea: 'Strength',
                exercises: [
                    { exerciseId: getExId('Barbell Squat'), sets: 5, reps: '5' },
                    { exerciseId: getExId('Deadlift'), sets: 5, reps: '5' },
                    { exerciseId: getExId('Lunges'), sets: 3, reps: '12 per leg' },
                    { exerciseId: getExId('Calf Raises'), sets: 4, reps: '20' }
                ]
            },
            {
                name: 'Cardio Burn',
                description: 'High intensity cardio.',
                duration: 4,
                frequency: 5,
                targetAudience: 'Beginner',
                focusArea: 'WeightLoss',
                exercises: [
                    { exerciseId: getExId('Running'), sets: 1, duration: 20 }, // 20 mins
                    { exerciseId: getExId('Burpees'), sets: 3, reps: '15' },
                    { exerciseId: getExId('Jump Rope'), sets: 5, duration: 60 } // 60 seconds
                ]
            }
        ];

        await WorkoutPlan.insertMany(plans);
        console.log('Workout plans imported...');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
