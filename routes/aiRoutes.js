const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateWorkout } = require('../controllers/aiController');

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: Generate an AI workout plan
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal: { type: string }
 *               equipment: { type: array, items: { type: string } }
 *               duration: { type: number }
 *     responses:
 *       200:
 *         description: Generated workout plan
 */
router.post('/generate', protect, generateWorkout);

module.exports = router;
