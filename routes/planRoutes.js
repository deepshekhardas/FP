const express = require('express');
const router = express.Router();
const {
    getPlans,
    getPlanById,
    subscribeToPlan,
    getUserPlans,
    unsubscribeFromPlan
} = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/workout-plans', getPlans);
router.get('/workout-plans/:id', getPlanById);

// Protected routes
router.post('/user-plans', protect, subscribeToPlan);
router.get('/user-plans/:userId', protect, getUserPlans);
router.delete('/user-plans/:id', protect, unsubscribeFromPlan);

module.exports = router;
