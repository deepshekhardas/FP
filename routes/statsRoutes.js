const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getWeeklyStats,
    getMonthlyStats,
    getProgressStats,
    getPersonalRecords,
    getMuscleDistribution,
    getStreak
} = require('../controllers/statsController');

router.get('/weekly', protect, getWeeklyStats);
router.get('/monthly', protect, getMonthlyStats);
router.get('/progress', protect, getProgressStats);
router.get('/pr', protect, getPersonalRecords);
router.get('/muscle-distribution', protect, getMuscleDistribution);
router.get('/streak', protect, getStreak);

module.exports = router;
