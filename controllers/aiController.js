const Exercise = require('../models/Exercise');

// @desc    Generate AI Workout Plan
// @route   POST /api/ai/generate
// @access  Private
const generateWorkout = async (req, res) => {
    try {
        const { goal, equipment, duration, experience } = req.body;

        // 1. Fetch Candidate Exercises
        // Simulating AI selection by filtering database
        let query = {};

        // Equipment Filter
        if (equipment === 'bodyweight') {
            query.equipment = 'Bodyweight'; // Assuming exact match in DB
        }
        // Note: For 'gym', we include everything. For 'dumbbells', we'd need complex queries, 
        // but for MVP we'll simplify: just fetch random mix and let 'AI' logic handle selection.

        const allExercises = await Exercise.find(); // Fetch all for in-memory filtering (faster for small datasets)

        // 2. "Smart" Selection Logic
        let selectedExercises = [];
        const exerciseCount = duration === '30' ? 4 : duration === '45' ? 6 : 8;

        // Shuffle Array (Fisher-Yates)
        const shuffled = allExercises.sort(() => 0.5 - Math.random());

        // Pick Exercises (Simple logic for MVP)
        selectedExercises = shuffled.slice(0, exerciseCount);

        // 3. Customize Sets/Reps based on Goal
        const plan = selectedExercises.map(ex => {
            let sets, reps;

            if (goal === 'strength') {
                sets = 5;
                reps = 5;
            } else if (goal === 'muscle') {
                sets = 3;
                reps = 10;
            } else { // weight_loss or endurance
                sets = 4;
                reps = 15;
            }

            return {
                exercise: ex,
                sets,
                reps,
                rest: goal === 'strength' ? '3 mins' : '60 secs'
            };
        });

        // 4. Mimic "AI" Processing Time (Optional, handled by frontend delay)

        res.json({
            success: true,
            plan: {
                title: `AI Generated ${goal.toUpperCase()} Plan`,
                duration: `${duration} Minutes`,
                level: experience,
                exercises: plan
            }
        });

    } catch (error) {
        console.error('AI Gen Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { generateWorkout };
