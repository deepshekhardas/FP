const Tenant = require('../models/Tenant');

// @desc    Create new tenant (Super Admin only)
// @route   POST /api/tenants
// @access  Super Admin
const createTenant = async (req, res) => {
    try {
        const { name, subdomain, theme } = req.body;

        const tenantExists = await Tenant.findOne({
            $or: [{ name }, { subdomain }]
        });

        if (tenantExists) {
            return res.status(400).json({ message: 'Tenant name or subdomain already exists' });
        }

        const tenant = await Tenant.create({
            name,
            subdomain,
            theme,
            ownerId: req.user._id
        });

        res.status(201).json(tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current tenant details
// @route   GET /api/tenants/current
// @access  Public (matches subdomain)
const getCurrentTenant = async (req, res) => {
    try {
        if (!req.tenant) {
            return res.json({ message: 'Main Platform (No Tenant)' });
        }
        res.json(req.tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTenant,
    getCurrentTenant
};
