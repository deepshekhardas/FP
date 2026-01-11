import api from '../services/api.js';
import { ROUTES } from '../config.js';

export const isAuthenticated = () => {
    return !!api.getToken();
};

export const logout = () => {
    api.clearToken();
    window.location.hash = ROUTES.LOGIN;
};

export const checkAuth = () => {
    if (!isAuthenticated()) {
        window.location.hash = ROUTES.LOGIN;
        return false;
    }
    return true;
};
