const express = require('express');
const router = express.Router();
const {
    createProfile,
    getProfile,
    updateProfile,
    updateMetrics,
    calculateBMI
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    /**
     * @swagger
     * /api/profile:
     *   post:
     *     summary: Create or update user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               age: { type: number }
     *               gender: { type: string }
     *               weight: { type: number }
     *               height: { type: number }
     *               goal: { type: string }
     *               activityLevel: { type: string }
     *     responses:
     *       200:
     *         description: Profile updated
     */
    .post(protect, createProfile)
    /**
     * @swagger
     * /api/profile:
     *   get:
     *     summary: Get current user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile found
     *       404:
     *         description: Profile not found
     */
    .get(protect, getProfile)
    .put(protect, updateProfile);

/**
 * @swagger
 * /api/profile/metrics:
 *   put:
 *     summary: Update specific profile metrics (weight, height)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight: { type: number }
 *               height: { type: number }
 *     responses:
 *       200:
 *         description: Metrics updated
 */
router.put('/metrics', protect, updateMetrics);

/**
 * @swagger
 * /api/profile/bmi:
 *   get:
 *     summary: Calculate BMI
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: BMI calculation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bmi: { type: number }
 *                 message: { type: string }
 */
router.get('/bmi', protect, calculateBMI);

module.exports = router;
