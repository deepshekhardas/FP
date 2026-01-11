export const initSidebar = () => {
    const updateActiveLink = () => {
        const hash = window.location.hash || '#/dashboard';

        // Sidebar links
        document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
            }
        });

        // Bottom nav links
        document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
            }
        });
    };

    window.addEventListener('hashchange', updateActiveLink);
    updateActiveLink(); // Initial check

    // Mobile Sidebar Toggles
    const menuToggle = document.getElementById('menu-toggle');
    const drawerClose = document.getElementById('drawer-close');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');

    const toggleDrawer = (show) => {
        if (show) {
            mobileDrawer.classList.add('open');
            drawerOverlay?.classList.add('show');
        } else {
            mobileDrawer.classList.remove('open');
            drawerOverlay?.classList.remove('show');
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => toggleDrawer(true));
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', () => toggleDrawer(false));
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', () => toggleDrawer(false));
    }

    // Close on link click
    document.querySelectorAll('.drawer-menu li').forEach(item => {
        item.addEventListener('click', () => toggleDrawer(false));
    });
};
