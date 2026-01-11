import { logout } from '../utils/auth.js';
import { showToast } from '../utils/helpers.js';

export const initNavbar = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const drawerClose = document.getElementById('drawer-close');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const mobileDrawer = document.getElementById('mobile-drawer');

    const toggleDrawer = () => {
        mobileDrawer.classList.toggle('open');
        drawerOverlay.classList.toggle('show');
    };

    const closeDrawer = () => {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('show');
    };

    if (menuToggle) menuToggle.addEventListener('click', toggleDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // Logout handlers
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });

    // Notification Toggle
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', () => {
            // Simple toggle for now, can be expanded to a dropdown
            const badge = notificationIcon.querySelector('.badge');
            if (badge) {
                badge.style.display = badge.style.display === 'none' ? 'block' : 'none';
                showToast('Notifications marked as read', 'success');
            }
        });
    }
};

export const updateNavbar = (user) => {
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && user) {
        nameDisplay.textContent = user.name;
    }
};
