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

        // Filter based on equipment if specified
        let candidateExercises = allExercises;
        if (equipment && equipment !== 'gym') { // If gym, assume all access
            candidateExercises = allExercises.filter(ex =>
                ex.equipment.toLowerCase().includes(equipment.toLowerCase()) ||
                ex.equipment === 'None'
            );
        }

        // Prioritize compound movements for strength
        if (goal === 'strength') {
            const compounds = candidateExercises.filter(ex =>
                ['Chest', 'Back', 'Legs'].includes(ex.muscleGroup) &&
                ['Hard', 'Medium'].includes(ex.difficulty)
            );
            // Ensure good base of compounds
            selectedExercises.push(...compounds.sort(() => 0.5 - Math.random()).slice(0, Math.ceil(exerciseCount / 2)));
        }

        // Fill the rest with random selection from remaining candidates to ensure variety
        const remainingNeeded = exerciseCount - selectedExercises.length;
        if (remainingNeeded > 0) {
            const remainingCandidates = candidateExercises.filter(ex => !selectedExercises.includes(ex));
            selectedExercises.push(...remainingCandidates.sort(() => 0.5 - Math.random()).slice(0, remainingNeeded));
        }

        // Fallback if not enough exercises
        if (selectedExercises.length < exerciseCount) {
            const extraNeeded = exerciseCount - selectedExercises.length;
            const others = allExercises.filter(ex => !selectedExercises.includes(ex));
            selectedExercises.push(...others.slice(0, extraNeeded));
        }

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
