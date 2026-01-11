const express = require('express');
const router = express.Router();
const {
    logWorkout,
    getWorkouts,
    getWorkoutById,
    getWorkoutByDate,
    getWorkoutHistory,
    updateWorkout,
    deleteWorkout
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, logWorkout)
    .get(protect, getWorkouts);

router.get('/history', protect, getWorkoutHistory);
router.get('/date/:date', protect, getWorkoutByDate);

router.route('/:id')
    .get(protect, getWorkoutById)
    .put(protect, updateWorkout)
    .delete(protect, deleteWorkout);

module.exports = router;
