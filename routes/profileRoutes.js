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
    .post(protect, createProfile)
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.put('/metrics', protect, updateMetrics);
router.get('/bmi', protect, calculateBMI);

module.exports = router;
