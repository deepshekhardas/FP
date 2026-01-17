// Auto-detect API URL based on environment
const isProduction = window.location.hostname !== 'localhost';
export const API_URL = isProduction
    ? `${window.location.origin}/api`
    : 'http://localhost:3005/api';
export const APP_NAME = 'FitnessPro';
export const ROUTES = {
    LOGIN: '#/login',
    REGISTER: '#/register',
    DASHBOARD: '#/dashboard',
    WORKOUTS: '#/workouts',
    LOG_WORKOUT: '#/log-workout',
    PROFILE: '#/profile',
    AI_PLANNER: '#/ai-planner',
    SETTINGS: '#/settings'
};
