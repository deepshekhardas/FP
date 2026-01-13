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

/**
 * @swagger
 * /api/stats/weekly:
 *   get:
 *     summary: Get weekly workout stats
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly stats
 */
router.get('/weekly', protect, getWeeklyStats);

router.get('/monthly', protect, getMonthlyStats);

/**
 * @swagger
 * /api/stats/progress:
 *   get:
 *     summary: Get overall progress stats
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress stats
 */
router.get('/progress', protect, getProgressStats);

router.get('/pr', protect, getPersonalRecords);
router.get('/muscle-distribution', protect, getMuscleDistribution);
router.get('/streak', protect, getStreak);

module.exports = router;
