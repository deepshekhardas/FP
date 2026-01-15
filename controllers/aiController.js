const Exercise = require('../models/Exercise');
const { generateWorkoutWithAI, isOpenAIReady } = require('../utils/openaiService');

// @desc    Generate AI Workout Plan
// @route   POST /api/ai/generate
// @access  Private
const generateWorkout = async (req, res) => {
    try {
        const { goal, equipment, duration, experience } = req.body;

        // Fetch all exercises for AI context
        const allExercises = await Exercise.find();

        // Try OpenAI first if configured
        if (isOpenAIReady()) {
            console.log('🤖 Using OpenAI for workout generation...');

            const aiPlan = await generateWorkoutWithAI({
                goal,
                equipment,
                duration,
                experience,
                availableExercises: allExercises
            });

            if (aiPlan) {
                return res.json({
                    success: true,
                    plan: aiPlan
                });
            }

            console.log('⚠️ OpenAI failed, falling back to algorithm...');
        }

        // Fallback: Original algorithm-based generation
        console.log('📊 Using algorithm-based workout generation...');

        let selectedExercises = [];
        const exerciseCount = duration === '30' ? 4 : duration === '45' ? 6 : 8;

        // Filter based on equipment if specified
        let candidateExercises = allExercises;
        if (equipment && equipment !== 'gym') {
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
            selectedExercises.push(...compounds.sort(() => 0.5 - Math.random()).slice(0, Math.ceil(exerciseCount / 2)));
        }

        // Fill the rest with random selection
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

        // Customize Sets/Reps based on Goal
        const plan = selectedExercises.map(ex => {
            let sets, reps;

            if (goal === 'strength') {
                sets = 5;
                reps = 5;
            } else if (goal === 'muscle') {
                sets = 3;
                reps = 10;
            } else {
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

        res.json({
            success: true,
            plan: {
                title: `AI Generated ${goal.toUpperCase()} Plan`,
                duration: `${duration} Minutes`,
                level: experience,
                exercises: plan,
                generatedBy: 'Algorithm'
            }
        });

    } catch (error) {
        console.error('AI Gen Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get AI Fitness Advice
// @route   POST /api/ai/advice
// @access  Private
const getAdvice = async (req, res) => {
    const { getFitnessAdvice, isOpenAIReady } = require('../utils/openaiService');

    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        if (!isOpenAIReady()) {
            return res.status(503).json({
                message: 'AI advisor not available. OPENAI_API_KEY not configured.',
                available: false
            });
        }

        const advice = await getFitnessAdvice(question);

        res.json({
            success: true,
            question,
            advice,
            generatedBy: 'OpenAI GPT-3.5'
        });

    } catch (error) {
        console.error('AI Advice Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check AI Status
// @route   GET /api/ai/status
// @access  Public
const getAIStatus = (req, res) => {
    res.json({
        openai: isOpenAIReady(),
        algorithm: true,
        message: isOpenAIReady()
            ? 'OpenAI is configured and ready'
            : 'Using algorithm-based generation (OpenAI not configured)'
    });
};

module.exports = { generateWorkout, getAdvice, getAIStatus };
