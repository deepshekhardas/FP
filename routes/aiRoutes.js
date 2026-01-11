const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateWorkout } = require('../controllers/aiController');

router.post('/generate', protect, generateWorkout);

module.exports = router;
