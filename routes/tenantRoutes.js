const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createTenant, getCurrentTenant } = require('../controllers/tenantController');

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant (Super Admin)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, subdomain]
 *             properties:
 *               name: { type: string }
 *               subdomain: { type: string }
 *               theme: { type: object }
 *     responses:
 *       201:
 *         description: Tenant created
 */
router.post('/', protect, admin, createTenant);

/**
 * @swagger
 * /api/tenants/current:
 *   get:
 *     summary: Get details of current tenant context
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: Current tenant details
 */
router.get('/current', getCurrentTenant);

module.exports = router;
