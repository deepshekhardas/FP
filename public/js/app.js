import { ROUTES } from './config.js';
import api from './services/api.js';
import { checkAuth, isAuthenticated } from './utils/auth.js';
import { initNavbar, updateNavbar } from './components/navbar.js';
import { initSidebar } from './components/sidebar.js';

// Page Initializers
import { initLogin, initRegister } from './pages/auth-pages.js';
import { initDashboard } from './pages/dashboard.js';
import { initWorkouts } from './pages/workouts.js';
import { initLogWorkout } from './pages/log-workout.js';
import { initProfile } from './pages/profile.js';
import { initAIPlanner } from './pages/ai-planner.js';

const app = document.getElementById('app');

const routes = {
    [ROUTES.LOGIN]: { template: 'pages/login.html', init: initLogin, public: true },
    [ROUTES.REGISTER]: { template: 'pages/register.html', init: initRegister, public: true },
    [ROUTES.DASHBOARD]: { template: 'pages/dashboard.html', init: initDashboard },
    [ROUTES.WORKOUTS]: { template: 'pages/workouts.html', init: initWorkouts },
    [ROUTES.LOG_WORKOUT]: { template: 'pages/log-workout.html', init: initLogWorkout },
    [ROUTES.PROFILE]: { template: 'pages/profile.html', init: initProfile },
    [ROUTES.AI_PLANNER]: { template: 'pages/ai-planner.html', init: initAIPlanner },
    // Static Pages
    '/privacy': { template: 'pages/privacy.html' },
    '/terms': { template: 'pages/terms.html' },
};

const router = async () => {
    const hash = window.location.hash || ROUTES.DASHBOARD;
    const route = routes[hash] || routes[ROUTES.DASHBOARD];

    // Auth Check
    if (!route.public && !checkAuth()) {
        return;
    }

    // If logged in and trying to access public page (login/register), redirect to dashboard
    if (route.public && isAuthenticated()) {
        window.location.hash = ROUTES.DASHBOARD;
        return;
    }

    // Update UI State (Sidebar, Navbar visibility)
    updateLayout(route.public);

    // Load Template
    try {
        const res = await fetch(route.template);
        const html = await res.text();
        app.innerHTML = html;

        // Initialize Page Logic
        if (route.init) {
            await route.init();
        }
    } catch (error) {
        console.error('Route Load Error:', error);
        app.innerHTML = '<p>Error loading page.</p>';
    }
};

const updateLayout = (isPublic) => {
    const sidebar = document.getElementById('sidebar');
    const desktopHeader = document.getElementById('desktop-header');
    const mobileTopBar = document.getElementById('mobile-top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    const desktopFooter = document.getElementById('desktop-footer');
    const mainContent = document.getElementById('main-content');

    const elements = [sidebar, desktopHeader, mobileTopBar, bottomNav, desktopFooter];

    if (isPublic) {
        elements.forEach(el => el && el.classList.add('hidden'));
        if (mainContent) mainContent.style.marginLeft = '0';
    } else {
        elements.forEach(el => el && el.classList.remove('hidden'));
        if (mainContent && window.innerWidth > 768) {
            mainContent.style.marginLeft = 'var(--sidebar-width)';
        }
    }
};

const initApp = async () => {
    // Global Components
    initNavbar();
    initSidebar();

    // Check Auth & Load User
    if (isAuthenticated()) {
        try {
            const res = await api.getMe();
            if (res.success) {
                updateNavbar(res.data);
            }
        } catch (error) {
            console.error('User Fetch Error:', error);
        }
    }

    // Handle Navigation
    window.addEventListener('hashchange', router);
    window.addEventListener('load', router);

    // Initial Route
    router();
};

initApp();
