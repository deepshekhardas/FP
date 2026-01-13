const { User, WorkoutLog, Goal } = require('../db');

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            users,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkouts = await WorkoutLog.countDocuments();
        const totalGoals = await Goal.countDocuments();

        // Users registered this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

        // Workouts this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const workoutsThisWeek = await WorkoutLog.countDocuments({ createdAt: { $gte: startOfWeek } });

        res.json({
            totalUsers,
            totalWorkouts,
            totalGoals,
            newUsersThisMonth,
            workoutsThisWeek
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user (suspend, promote)
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isAdmin = req.body.isAdmin ?? user.isAdmin;
        user.isSuspended = req.body.isSuspended ?? user.isSuspended;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isSuspended: updatedUser.isSuspended
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user analytics (signups over time)
// @route   GET /api/admin/analytics/signups
// @access  Admin
const getSignupAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const signups = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(signups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    getAdminStats,
    updateUser,
    deleteUser,
    getSignupAnalytics
};
