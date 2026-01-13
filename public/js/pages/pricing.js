import api from '../services/api.js';

window.subscribe = async (tier) => {
    try {
        const button = event.target;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const response = await api.post('/payment/create-checkout', { tier });

        if (response.url) {
            window.location.href = response.url;
        } else {
            alert('Failed to create checkout session');
            button.disabled = false;
            button.innerHTML = tier === 'pro'
                ? '<i class="fas fa-rocket"></i> Upgrade to Pro'
                : '<i class="fas fa-crown"></i> Go Premium';
        }
    } catch (error) {
        console.error('Subscription error:', error);
        alert(error.message || 'Failed to start checkout');
    }
};

// Check current subscription and update UI
const checkSubscription = async () => {
    try {
        const status = await api.get('/payment/subscription');
        console.log('Subscription status:', status);

        // Update buttons based on current tier
        if (status.tier === 'pro' || status.tier === 'premium') {
            // User is subscribed, update UI accordingly
            const buttons = document.querySelectorAll('.btn-primary');
            buttons.forEach(btn => {
                if (btn.textContent.includes(status.tier)) {
                    btn.textContent = 'Current Plan';
                    btn.disabled = true;
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-secondary');
                }
            });
        }
    } catch (error) {
        // User not logged in or error - just show default pricing
        console.log('Could not fetch subscription status');
    }
};

checkSubscription();
