const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;
let isConfigured = false;

/**
 * Initialize Gemini client
 */
const initGemini = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ GEMINI_API_KEY not set. AI features will use fallback algorithm.');
        isConfigured = false;
        return;
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash for speed and cost efficiency
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        isConfigured = true;
        console.log('✅ Google Gemini initialized');
    } catch (error) {
        console.error('❌ Gemini initialization failed:', error.message);
        isConfigured = false;
    }
};

/**
 * Generate a personalized workout plan using Gemini
 * @param {Object} params - Workout parameters
 * @returns {Object|null} - Generated workout plan or null if failed
 */
const generateWorkoutWithAI = async ({ goal, equipment, duration, experience, availableExercises }) => {
    if (!isConfigured || !model) {
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

Available Exercises (Database):
${exerciseNames}

Instructions:
1. Select ${duration === '30' ? '4-5' : duration === '45' ? '5-6' : '6-8'} exercises from the list above.
2. Specify sets, reps, and rest time for each.
3. Order exercises logically (warm-up to cool-down).
4. Match difficulty to experience level.

Output format: JSON ONLY. Do not include any markdown formatting (like \`\`\`json).
Structure:
{
    "title": "Workout title",
    "description": "Brief description",
    "warmup": "Warmup routine",
    "exercises": [
        {
            "name": "Exercise Name (Must match one from the provided list exactly if possible)",
            "sets": 3,
            "reps": 12,
            "rest": "60 seconds",
            "notes": "Tips"
        }
    ],
    "cooldown": "Cooldown routine"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if Gemini adds it despite instructions
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(text);

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
            generatedBy: 'Google Gemini'
        };

    } catch (error) {
        console.error('Gemini generation error:', error.message);
        return null; // Fallback to algorithm
    }
};

/**
 * Generate fitness advice using Gemini
 * @param {string} question - User's fitness question
 * @returns {string} - AI-generated advice
 */
const getFitnessAdvice = async (question) => {
    if (!isConfigured || !model) {
        return 'AI advisor is not available. Please check your Gemini configuration.';
    }

    try {
        const prompt = `You are a helpful fitness advisor. Give concise, practical advice to the following question. Keep response under 200 words.
        
Question: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini advice error:', error.message);
        return 'AI advisor encountered an error. Please try again later.';
    }
};

/**
 * Check if Gemini is configured and ready
 */
const isGeminiReady = () => isConfigured;

module.exports = {
    initGemini,
    generateWorkoutWithAI,
    getFitnessAdvice,
    isGeminiReady
};
