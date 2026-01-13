const Tenant = require('../models/Tenant');

const tenantMiddleware = async (req, res, next) => {
    try {
        // 1. Check for x-tenant-id header (API usage)
        const tenantId = req.headers['x-tenant-id'];

        if (tenantId) {
            const tenant = await Tenant.findOne({ _id: tenantId, isActive: true });
            if (!tenant) {
                return res.status(404).json({ message: 'Tenant not found or inactive' });
            }
            req.tenant = tenant;
            return next();
        }

        // 2. Check for subdomain (Browser usage)
        // Host: goldswest.fitnesspro.com
        const host = req.get('host');
        // Simple logic: extract 'goldswest' if host exists
        // This regex assumes standard 3-part domain or localhost with subdomain
        if (host && !host.includes('localhost') && !host.startsWith('www.')) {
            const subdomain = host.split('.')[0];
            // If main domain (e.g. fitnesspro.com), subdomain matches main
            if (subdomain && subdomain !== 'fitnesspro' && subdomain !== 'app') {
                const tenant = await Tenant.findOne({ subdomain, isActive: true });
                if (tenant) {
                    req.tenant = tenant;
                }
            }
        }

        next();
    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        // Continue without tenant (default platform) or fail safe?
        // Usually safe to continue as "default platform" if error isn't critical
        next();
    }
};

module.exports = tenantMiddleware;
