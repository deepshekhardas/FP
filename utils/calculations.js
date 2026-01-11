/**
 * Calculate calories burned for a workout session
 * @param {Array} exercises - List of exercises performed
 * @returns {number} - Total calories burned
 */
const calculateCalories = (exercises) => {
    let totalCalories = 0;

    for (const item of exercises) {
        let calories = 0;

        // Base MET values (Metabolic Equivalent of Task)
        // Cardio: ~8 METs, Strength: ~3-6 METs
        // We'll use simplified formulas since we don't have user weight here yet
        // Assuming average weight of 70kg for base calculation if not available

        if (item.duration) {
            // Cardio-like calculation
            // ~5-10 calories per minute depending on intensity
            // Using 7 as a safe average for "moderate" intensity
            calories = item.duration * 7;
        } else {
            // Strength training calculation
            // Estimate duration if not provided: ~2 mins per set
            // ~3-5 calories per minute for strength training

            const sets = item.setsCompleted || 1;
            const reps = item.reps || 10;
            const weight = item.weight || 0;

            // Volume Load = sets * reps * weight
            // This is a very rough estimate. 
            // A better approach for strength is time-based if available.

            // If we assume 1 set takes ~2 minutes (including rest)
            const estimatedMinutes = sets * 2;

            // Base burn for the time
            let baseBurn = estimatedMinutes * 4; // ~4 cal/min

            // Additional burn for heavy lifting
            // Add 0.05 calorie per kg lifted total volume
            const volumeLoad = sets * reps * weight;
            const volumeBurn = volumeLoad * 0.01;

            calories = baseBurn + volumeBurn;
        }

        totalCalories += calories;
    }

    return Math.round(totalCalories);
};

/**
 * Estimate duration if not provided
 * @param {Array} exercises 
 * @returns {number} Total duration in minutes
 */
const calculateDuration = (exercises) => {
    let totalDuration = 0;

    for (const item of exercises) {
        if (item.duration) {
            totalDuration += item.duration;
        } else {
            // Estimate: 2 mins per set
            const sets = item.setsCompleted || 1;
            totalDuration += (sets * 2);
        }
    }

    return totalDuration;
};

module.exports = {
    calculateCalories,
    calculateDuration
};
