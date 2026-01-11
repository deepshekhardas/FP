const { WorkoutPlan, UserPlan } = require('../db');

// @desc    Get all workout plans
// @route   GET /api/workout-plans
// @access  Public
const getPlans = async (req, res) => {
    try {
        const plans = await WorkoutPlan.find({});
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single workout plan
// @route   GET /api/workout-plans/:id
// @access  Public
const getPlanById = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id).populate('exercises.exerciseId');

        if (plan) {
            res.json(plan);
        } else {
            res.status(404).json({ message: 'Plan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Subscribe to a plan
// @route   POST /api/user-plans
// @access  Private
const subscribeToPlan = async (req, res) => {
    try {
        const { planId } = req.body;

        const plan = await WorkoutPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        const subscriptionExists = await UserPlan.findOne({
            userId: req.user.id,
            planId
        });

        if (subscriptionExists) {
            return res.status(400).json({ message: 'Already subscribed to this plan' });
        }

        const userPlan = await UserPlan.create({
            userId: req.user.id,
            planId
        });

        res.status(201).json(userPlan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's subscribed plans
// @route   GET /api/user-plans/:userId
// @access  Private
const getUserPlans = async (req, res) => {
    try {
        // Ensure user requests their own plans
        if (req.params.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const plans = await UserPlan.find({ userId: req.params.userId })
            .populate({
                path: 'planId',
                populate: { path: 'exercises.exerciseId' }
            });

        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Unsubscribe from plan
// @route   DELETE /api/user-plans/:id
// @access  Private
const unsubscribeFromPlan = async (req, res) => {
    try {
        const userPlan = await UserPlan.findById(req.params.id);

        if (!userPlan) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (userPlan.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await userPlan.deleteOne();
        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPlans,
    getPlanById,
    subscribeToPlan,
    getUserPlans,
    unsubscribeFromPlan
};
