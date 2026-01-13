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
    /**
     * @swagger
     * /api/workouts:
     *   post:
     *     summary: Log a new workout
     *     tags: [Workouts]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/WorkoutLog'
     *     responses:
     *       201:
     *         description: Workout logged
     */
    .post(protect, logWorkout)
    /**
     * @swagger
     * /api/workouts:
     *   get:
     *     summary: Get all workouts for user
     *     tags: [Workouts]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of workouts
     */
    .get(protect, getWorkouts);

/**
 * @swagger
 * /api/workouts/history:
 *   get:
 *     summary: Get workout history with stats
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout history
 */
router.get('/history', protect, getWorkoutHistory);

/**
 * @swagger
 * /api/workouts/date/{date}:
 *   get:
 *     summary: Get workouts by date
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Workouts for date
 */
router.get('/date/:date', protect, getWorkoutByDate);

router.route('/:id')
    /**
     * @swagger
     * /api/workouts/{id}:
     *   get:
     *     summary: Get workout by ID
     *     tags: [Workouts]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Workout details
     */
    .get(protect, getWorkoutById)
    .put(protect, updateWorkout)
    .delete(protect, deleteWorkout);

module.exports = router;
