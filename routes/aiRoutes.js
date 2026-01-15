const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateWorkout, getAdvice, getAIStatus } = require('../controllers/aiController');

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
 *               equipment: { type: string }
 *               duration: { type: string }
 *               experience: { type: string }
 *     responses:
 *       200:
 *         description: Generated workout plan
 */
router.post('/generate', protect, generateWorkout);

/**
 * @swagger
 * /api/ai/advice:
 *   post:
 *     summary: Get AI fitness advice
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
 *               question: { type: string }
 *     responses:
 *       200:
 *         description: AI-generated fitness advice
 */
router.post('/advice', protect, getAdvice);

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Check AI service status
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI service status
 */
router.get('/status', getAIStatus);

module.exports = router;

