const { Goal } = require('../db');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
    const { name, targetValue, currentValue, targetDate, type } = req.body;

    try {
        const goal = await Goal.create({
            userId: req.user._id,
            name,
            targetValue,
            currentValue,
            targetDate,
            type
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (goal && goal.userId.toString() === req.user._id.toString()) {
            goal.name = req.body.name || goal.name;
            goal.targetValue = req.body.targetValue || goal.targetValue;
            goal.currentValue = req.body.currentValue || goal.currentValue;
            goal.targetDate = req.body.targetDate || goal.targetDate;
            goal.status = req.body.status || goal.status;

            const updatedGoal = await goal.save();
            res.json(updatedGoal);
        } else {
            res.status(404).json({ message: 'Goal not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (goal && goal.userId.toString() === req.user._id.toString()) {
            await goal.deleteOne();
            res.json({ message: 'Goal removed' });
        } else {
            res.status(404).json({ message: 'Goal not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal
};
