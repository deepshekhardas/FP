const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe;
if (stripeKey) {
    stripe = require('stripe')(stripeKey);
} else {
    console.warn("⚠️ STRIPE_SECRET_KEY missing. Payment features will be mocked.");
    stripe = {
        customers: {
            create: async () => ({ id: 'mock_cust_id' }),
            retrieve: async () => ({ metadata: {} })
        },
        checkout: {
            sessions: { create: async () => ({ id: 'mock_session', url: '#' }) }
        },
        webhooks: {
            constructEvent: () => { throw new Error('Webhook signature verification failed (Mock)'); }
        },
        subscriptions: {
            list: async () => ({ data: [] }),
            update: async () => { },
            retrieve: async () => ({})
        }
    };
}
const User = require('../models/User');

const PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly'
};

// @desc    Create checkout session
// @route   POST /api/payment/create-checkout
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { tier } = req.body;
        const user = req.user;

        if (!['pro', 'premium'].includes(tier)) {
            return res.status(400).json({ message: 'Invalid subscription tier' });
        }

        // Create or get Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            customerId = customer.id;
            await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: PRICE_IDS[tier],
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `${process.env.APP_URL || 'http://localhost:3000'}/#/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/#/pricing`,
            metadata: {
                userId: user._id.toString(),
                tier
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ message: 'Failed to create checkout session' });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public (Stripe)
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata.userId;
            const tier = session.metadata.tier;

            // Update user subscription
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            const expiryDate = new Date(subscription.current_period_end * 1000);

            await User.findByIdAndUpdate(userId, {
                subscriptionTier: tier,
                subscriptionExpiry: expiryDate
            });

            console.log(`✅ User ${userId} upgraded to ${tier}`);
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer);
            const userId = customer.metadata.userId;

            if (subscription.status === 'active') {
                const expiryDate = new Date(subscription.current_period_end * 1000);
                await User.findByIdAndUpdate(userId, { subscriptionExpiry: expiryDate });
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer);
            const userId = customer.metadata.userId;

            await User.findByIdAndUpdate(userId, {
                subscriptionTier: 'free',
                subscriptionExpiry: null
            });

            console.log(`⚠️ User ${userId} subscription cancelled`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};

// @desc    Get subscription status
// @route   GET /api/payment/subscription
// @access  Private
const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('subscriptionTier subscriptionExpiry stripeCustomerId');

        let subscriptionDetails = null;
        if (user.stripeCustomerId) {
            try {
                const subscriptions = await stripe.subscriptions.list({
                    customer: user.stripeCustomerId,
                    status: 'active',
                    limit: 1
                });

                if (subscriptions.data.length > 0) {
                    const sub = subscriptions.data[0];
                    subscriptionDetails = {
                        status: sub.status,
                        currentPeriodEnd: new Date(sub.current_period_end * 1000),
                        cancelAtPeriodEnd: sub.cancel_at_period_end
                    };
                }
            } catch (stripeError) {
                console.error('Stripe fetch error:', stripeError);
            }
        }

        res.json({
            tier: user.subscriptionTier || 'free',
            expiry: user.subscriptionExpiry,
            details: subscriptionDetails
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cancel subscription
// @route   POST /api/payment/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.stripeCustomerId) {
            return res.status(400).json({ message: 'No active subscription found' });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.status(400).json({ message: 'No active subscription found' });
        }

        // Cancel at period end (let them use until expiry)
        await stripe.subscriptions.update(subscriptions.data[0].id, {
            cancel_at_period_end: true
        });

        res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    getSubscriptionStatus,
    cancelSubscription
};
