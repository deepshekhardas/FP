const OpenAI = require('openai');

let openai = null;
let isConfigured = false;

/**
 * Initialize OpenAI client
 */
const initOpenAI = () => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ OPENAI_API_KEY not set. AI features will use fallback algorithm.');
        isConfigured = false;
        return;
    }

    try {
        openai = new OpenAI({ apiKey });
        isConfigured = true;
        console.log('✅ OpenAI initialized');
    } catch (error) {
        console.error('❌ OpenAI initialization failed:', error.message);
        isConfigured = false;
    }
};

/**
 * Generate a personalized workout plan using OpenAI
 * @param {Object} params - Workout parameters
 * @param {string} params.goal - Fitness goal (strength, muscle, weight_loss, endurance)
 * @param {string} params.equipment - Available equipment
 * @param {string} params.duration - Workout duration in minutes
 * @param {string} params.experience - User experience level
 * @param {Array} params.availableExercises - List of exercises from database
 * @returns {Object|null} - Generated workout plan or null if failed
 */
const generateWorkoutWithAI = async ({ goal, equipment, duration, experience, availableExercises }) => {
    if (!isConfigured || !openai) {
        return null; // Fallback to algorithm
    }

    try {
        const exerciseNames = availableExercises.map(ex =>
            `${ex.name} (${ex.muscleGroup}, ${ex.equipment}, ${ex.difficulty})`
        ).join('\n');

        const prompt = `You are a professional fitness trainer. Create a personalized ${duration}-minute workout plan.

User Profile:
- Goal: ${goal}
- Experience Level: ${experience}
- Available Equipment: ${equipment}

Available Exercises:
${exerciseNames}

Instructions:
1. Select ${duration === '30' ? '4-5' : duration === '45' ? '5-6' : '6-8'} exercises from the list above
2. Specify sets, reps, and rest time for each
3. Order exercises logically (warm-up to cool-down)
4. Match difficulty to experience level

Respond ONLY with valid JSON in this exact format:
{
    "title": "Workout title here",
    "description": "Brief motivational description",
    "warmup": "2-3 minute warmup suggestion",
    "exercises": [
        {
            "name": "Exercise Name",
            "sets": 3,
            "reps": 12,
            "rest": "60 seconds",
            "notes": "Form tip or modification"
        }
    ],
    "cooldown": "Stretching suggestion"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a certified fitness trainer. Always respond with valid JSON only, no markdown or extra text.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            console.error('OpenAI returned empty response');
            return null;
        }

        // Parse JSON response
        const parsed = JSON.parse(content);

        // Map AI exercise names to database exercises
        const mappedExercises = parsed.exercises.map(aiEx => {
            const dbExercise = availableExercises.find(
                ex => ex.name.toLowerCase() === aiEx.name.toLowerCase()
            );

            return {
                exercise: dbExercise || { name: aiEx.name, muscleGroup: 'Unknown' },
                sets: aiEx.sets,
                reps: aiEx.reps,
                rest: aiEx.rest,
                notes: aiEx.notes
            };
        });

        return {
            title: parsed.title,
            description: parsed.description,
            warmup: parsed.warmup,
            duration: `${duration} Minutes`,
            level: experience,
            exercises: mappedExercises,
            cooldown: parsed.cooldown,
            generatedBy: 'OpenAI GPT-3.5'
        };

    } catch (error) {
        console.error('OpenAI generation error:', error.message);
        return null; // Fallback to algorithm
    }
};

/**
 * Generate fitness advice using OpenAI
 * @param {string} question - User's fitness question
 * @returns {string} - AI-generated advice
 */
const getFitnessAdvice = async (question) => {
    if (!isConfigured || !openai) {
        return 'AI advisor is not available. Please check your OpenAI configuration.';
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful fitness advisor. Give concise, practical advice. Keep responses under 200 words.'
                },
                { role: 'user', content: question }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        return response.choices[0]?.message?.content || 'Unable to generate advice.';
    } catch (error) {
        console.error('OpenAI advice error:', error.message);
        return 'AI advisor encountered an error. Please try again later.';
    }
};

/**
 * Check if OpenAI is configured and ready
 */
const isOpenAIReady = () => isConfigured;

module.exports = {
    initOpenAI,
    generateWorkoutWithAI,
    getFitnessAdvice,
    isOpenAIReady
};
