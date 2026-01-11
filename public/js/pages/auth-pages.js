import api from '../services/api.js';
import { showToast } from '../utils/helpers.js';
import { ROUTES } from '../config.js';

export const initLogin = () => {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const res = await api.login(email, password);
        if (res.success) {
            showToast('Login successful!', 'success');
            window.location.hash = ROUTES.DASHBOARD;
        } else {
            showToast(res.error, 'error');
        }
    });
};

export const initRegister = () => {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const res = await api.register(name, email, password);
        if (res.success) {
            showToast('Registration successful!', 'success');
            window.location.hash = ROUTES.DASHBOARD;
        } else {
            showToast(res.error, 'error');
        }
    });
};
