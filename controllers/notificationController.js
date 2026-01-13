const { Goal } = require('../db');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id, status: 'InProgress' });
        const notifications = [];

        // System Welcome
        notifications.push({
            _id: 'welcome',
            message: 'Welcome to FitnessPro! Start by creating a workout plan.',
            read: false,
            date: new Date()
        });

        // Goal deadline reminders
        goals.forEach(goal => {
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7 && daysLeft > 0) {
                notifications.push({
                    _id: `goal-${goal._id}`,
                    message: `Only ${daysLeft} days left to achieve your goal: ${goal.name}!`,
                    read: false,
                    date: new Date()
                });
            } else if (daysLeft < 0) {
                notifications.push({
                    _id: `goal-overdue-${goal._id}`,
                    message: `Goal overdue: ${goal.name}. Time to review?`,
                    read: false,
                    date: new Date()
                });
            }
        });

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const markAsRead = async (req, res) => {
    res.json({ success: true });
};

const getNotificationPreferences = async (req, res) => {
    res.json({ dailyReminder: true, weeklySummary: false });
};

const updateNotificationPreferences = async (req, res) => {
    res.json({ success: true, preferences: req.body });
};

module.exports = {
    getNotifications,
    markAsRead,
    getNotificationPreferences,
    updateNotificationPreferences
};
