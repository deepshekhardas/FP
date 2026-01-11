const { Exercise } = require('../db');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
const getExercises = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i'
                }
            }
            : {};

        const count = await Exercise.countDocuments({ ...keyword });
        const exercises = await Exercise.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ exercises, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Public
const getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (exercise) {
            res.json(exercise);
        } else {
            res.status(404).json({ message: 'Exercise not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get exercises by muscle group
// @route   GET /api/exercises/muscle-group/:group
// @access  Public
const getExercisesByMuscleGroup = async (req, res) => {
    try {
        const exercises = await Exercise.find({ muscleGroup: req.params.group });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new exercise
// @route   POST /api/exercises
// @access  Private/Admin
const createExercise = async (req, res) => {
    try {
        const { name, muscleGroup, equipment, description, difficulty, instructions, imageUrl } = req.body;

        const exerciseExists = await Exercise.findOne({ name });
        if (exerciseExists) {
            return res.status(400).json({ message: 'Exercise already exists' });
        }

        const exercise = await Exercise.create({
            name,
            muscleGroup,
            equipment,
            description,
            difficulty,
            instructions,
            imageUrl
        });

        res.status(201).json(exercise);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an exercise
// @route   PUT /api/exercises/:id
// @access  Private/Admin
const updateExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (exercise) {
            exercise.name = req.body.name || exercise.name;
            exercise.muscleGroup = req.body.muscleGroup || exercise.muscleGroup;
            exercise.equipment = req.body.equipment || exercise.equipment;
            exercise.description = req.body.description || exercise.description;
            exercise.difficulty = req.body.difficulty || exercise.difficulty;
            exercise.instructions = req.body.instructions || exercise.instructions;
            exercise.imageUrl = req.body.imageUrl || exercise.imageUrl;

            const updatedExercise = await exercise.save();
            res.json(updatedExercise);
        } else {
            res.status(404).json({ message: 'Exercise not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an exercise
// @route   DELETE /api/exercises/:id
// @access  Private/Admin
const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (exercise) {
            await exercise.deleteOne();
            res.json({ message: 'Exercise removed' });
        } else {
            res.status(404).json({ message: 'Exercise not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getExercises,
    getExerciseById,
    getExercisesByMuscleGroup,
    createExercise,
    updateExercise,
    deleteExercise
};
