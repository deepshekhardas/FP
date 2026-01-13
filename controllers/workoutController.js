const { WorkoutLog } = require('../db');
const { calculateCalories, calculateDuration } = require('../utils/calculations');

// @desc    Log a new workout
// @route   POST /api/workouts
// @access  Private
const logWorkout = async (req, res) => {
    try {
        const { date, exercises, difficulty, energyLevel, notes } = req.body;
        const userId = req.user.id;

        // Validation
        if (!exercises || exercises.length === 0) {
            return res.status(400).json({ message: 'No exercises provided' });
        }

        // Check for duplicate workout on same date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingWorkout = await WorkoutLog.findOne({
            userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingWorkout) {
            return res.status(400).json({ message: 'Workout already logged for this date' });
        }

        // Calculate totals and validate exercises
        // Calculate totals
        const totalDuration = calculateDuration(exercises);
        const totalCalories = calculateCalories(exercises);

        const workout = await WorkoutLog.create({
            userId,
            date: date || Date.now(),
            exercises,
            totalDuration,
            caloriesBurned: Math.round(totalCalories),
            difficulty,
            energyLevel,
            notes
        });

        res.status(201).json(workout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
    try {
        const workouts = await WorkoutLog.find({ userId: req.user.id })
            .sort({ date: -1 })
            .populate('exercises.exerciseId', 'name muscleGroup');
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
    try {
        const workout = await WorkoutLog.findById(req.params.id)
            .populate('exercises.exerciseId');

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workout.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get workout by date
// @route   GET /api/workouts/date/:date
// @access  Private
const getWorkoutByDate = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const workout = await WorkoutLog.findOne({
            userId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('exercises.exerciseId');

        if (!workout) {
            return res.status(404).json({ message: 'No workout found for this date' });
        }

        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get workout history (date range)
// @route   GET /api/workouts/history
// @access  Private
const getWorkoutHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = { userId: req.user.id };
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const workouts = await WorkoutLog.find(query)
            .sort({ date: 1 })
            .select('date totalDuration caloriesBurned difficulty');

        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
    try {
        const workout = await WorkoutLog.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workout.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedWorkout = await WorkoutLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('exercises.exerciseId');

        res.json(updatedWorkout);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
    try {
        const workout = await WorkoutLog.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workout.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await workout.deleteOne();
        res.json({ message: 'Workout removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    logWorkout,
    getWorkouts,
    getWorkoutById,
    getWorkoutByDate,
    getWorkoutHistory,
    updateWorkout,
    deleteWorkout
};
