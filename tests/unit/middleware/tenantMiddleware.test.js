const tenantMiddleware = require('../../../middleware/tenantMiddleware');
const Tenant = require('../../../models/Tenant');

jest.mock('../../../models/Tenant');

describe('Tenant Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            get: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should resolve tenant from x-tenant-id header', async () => {
        req.headers['x-tenant-id'] = 'tenant123';
        const mockTenant = { _id: 'tenant123', name: 'GoldGym' };
        Tenant.findOne.mockResolvedValue(mockTenant);

        await tenantMiddleware(req, res, next);

        expect(Tenant.findOne).toHaveBeenCalledWith({ _id: 'tenant123', isActive: true });
        expect(req.tenant).toEqual(mockTenant);
        expect(next).toHaveBeenCalled();
    });

    it('should return 404 if tenant id in header is not found', async () => {
        req.headers['x-tenant-id'] = 'invalid';
        Tenant.findOne.mockResolvedValue(null);

        await tenantMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    it('should resolve tenant from subdomain', async () => {
        req.get.mockReturnValue('goldswest.fitnesspro.com');
        const mockTenant = { _id: 'tenant123', subdomain: 'goldswest' };
        Tenant.findOne.mockResolvedValue(mockTenant);

        await tenantMiddleware(req, res, next);

        expect(Tenant.findOne).toHaveBeenCalledWith({ subdomain: 'goldswest', isActive: true });
        expect(req.tenant).toEqual(mockTenant);
        expect(next).toHaveBeenCalled();
    });

    it('should ignore standard domains (fitnesspro, app, localhost)', async () => {
        req.get.mockReturnValue('fitnesspro.com');
        await tenantMiddleware(req, res, next);
        expect(Tenant.findOne).not.toHaveBeenCalled();
        expect(req.tenant).toBeUndefined();
        expect(next).toHaveBeenCalled();
    });

    it('should handle errors gracefully and call next', async () => {
        req.get.mockImplementation(() => { throw new Error('Host Error'); });

        await tenantMiddleware(req, res, next);

        // Should catch error and proceed as default tenant (safe failover)
        expect(next).toHaveBeenCalled();
    });
});
