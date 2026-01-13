const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getUsers,
    getAdminStats,
    updateUser,
    deleteUser,
    getSignupAnalytics
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect, admin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform stats
 */
router.get('/stats', getAdminStats);

router.get('/analytics/signups', getSignupAnalytics);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user status (suspend/admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/users/:id', updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', deleteUser);

module.exports = router;
