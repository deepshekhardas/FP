// Mock Notifications for now
const getNotifications = async (req, res) => {
    res.json([
        { _id: '1', message: 'Welcome to FitnessPro!', read: false, date: new Date() },
        { _id: '2', message: 'Don\'t forget to log your workout today.', read: false, date: new Date() }
    ]);
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
