const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createCheckoutSession,
    handleWebhook,
    getSubscriptionStatus,
    cancelSubscription
} = require('../controllers/paymentController');

// Webhook needs raw body, so it's handled specially
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
/**
 * @swagger
 * /api/payment/create-checkout:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tier]
 *             properties:
 *               tier: { type: string, enum: [pro, premium] }
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId: { type: string }
 *                 url: { type: string }
 */
router.post('/create-checkout', protect, createCheckoutSession);

/**
 * @swagger
 * /api/payment/subscription:
 *   get:
 *     summary: Get current subscription status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 */
router.get('/subscription', protect, getSubscriptionStatus);

/**
 * @swagger
 * /api/payment/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cancellation scheduled
 */
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
