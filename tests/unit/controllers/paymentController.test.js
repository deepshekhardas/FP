const { createCheckoutSession, handleWebhook, getSubscriptionStatus, cancelSubscription } = require('../../../controllers/paymentController');
const User = require('../../../models/User');

const mockStripe = {
    customers: {
        create: jest.fn(),
        retrieve: jest.fn()
    },
    checkout: {
        sessions: {
            create: jest.fn()
        }
    },
    webhooks: {
        constructEvent: jest.fn()
    },
    subscriptions: {
        retrieve: jest.fn(),
        list: jest.fn(),
        update: jest.fn()
    }
};

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        customers: {
            create: jest.fn().mockImplementation((...args) => mockStripe.customers.create(...args)),
            retrieve: jest.fn().mockImplementation((...args) => mockStripe.customers.retrieve(...args))
        },
        checkout: {
            sessions: {
                create: jest.fn().mockImplementation((...args) => mockStripe.checkout.sessions.create(...args))
            }
        },
        webhooks: {
            constructEvent: jest.fn().mockImplementation((...args) => mockStripe.webhooks.constructEvent(...args))
        },
        subscriptions: {
            retrieve: jest.fn().mockImplementation((...args) => mockStripe.subscriptions.retrieve(...args)),
            list: jest.fn().mockImplementation((...args) => mockStripe.subscriptions.list(...args)),
            update: jest.fn().mockImplementation((...args) => mockStripe.subscriptions.update(...args))
        }
    }));
});
jest.mock('../../../models/User');

describe('Payment Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { _id: 'user123', email: 'test@example.com', name: 'Test User' },
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createCheckoutSession', () => {
        it('should create a checkout session for valid tier', async () => {
            req.body.tier = 'pro';
            mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' });
            mockStripe.checkout.sessions.create.mockResolvedValue({ id: 'sess_123', url: 'http://test.url' });
            User.findByIdAndUpdate.mockResolvedValue({});

            await createCheckoutSession(req, res);

            expect(mockStripe.checkout.sessions.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ sessionId: 'sess_123', url: 'http://test.url' });
        });

        it('should return 400 for invalid tier', async () => {
            req.body.tier = 'invalid';
            await createCheckoutSession(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('handleWebhook', () => {
        it('should handle checkout.session.completed', async () => {
            req.headers = { 'stripe-signature': 'sig' };
            const event = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        metadata: { userId: 'user123', tier: 'pro' },
                        subscription: 'sub_123'
                    }
                }
            };
            mockStripe.webhooks.constructEvent.mockReturnValue(event);
            mockStripe.subscriptions.retrieve.mockResolvedValue({ current_period_end: 1234567890 });

            await handleWebhook(req, res);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', expect.objectContaining({
                subscriptionTier: 'pro'
            }));
            expect(res.json).toHaveBeenCalledWith({ received: true });
        });
    });

    describe('getSubscriptionStatus', () => {
        it('should return subscription details', async () => {
            const mockUser = {
                subscriptionTier: 'pro',
                subscriptionExpiry: new Date(),
                stripeCustomerId: 'cus_123'
            };
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [{ status: 'active', current_period_end: 1234567890, cancel_at_period_end: false }]
            });

            await getSubscriptionStatus(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                tier: 'pro',
                details: expect.objectContaining({ status: 'active' })
            }));
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel subscription', async () => {
            User.findById.mockResolvedValue({ stripeCustomerId: 'cus_123' });
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [{ id: 'sub_123' }]
            });

            await cancelSubscription(req, res);

            expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_123', { cancel_at_period_end: true });
            expect(res.json).toHaveBeenCalled();
        });
    });
});
