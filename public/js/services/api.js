import { API_URL } from '../config.js';
import { showToast } from '../utils/helpers.js';

const api = {
    // --- Token Management ---
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    },

    clearToken() {
        localStorage.removeItem('token');
    },

    // --- Core Request Method ---
    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);

            // Handle 401 Unauthorized (Token Expired/Invalid)
            if (response.status === 401) {
                this.clearToken();
                showToast('Session expired. Please login again.', 'error');
                // Optional: Redirect to login if not already there
                if (!window.location.hash.includes('login')) {
                    window.location.hash = '#/login';
                }
                return { success: false, error: 'Unauthorized', status: 401 };
            }

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Something went wrong';
                showToast(errorMessage, 'error');
                return {
                    success: false,
                    error: errorMessage,
                    status: response.status
                };
            }

            return { success: true, data: data };

        } catch (error) {
            console.error('API Request Error:', error);
            showToast('Network error. Is the backend running?', 'error');
            return {
                success: false,
                error: 'Network error. Please check your connection.',
                status: 500
            };
        }
    },

    // --- Authentication Functions ---
    async login(email, password) {
        const res = await this.request('/auth/login', 'POST', { email, password });
        if (res.success && res.data.token) {
            this.setToken(res.data.token);
        }
        return res;
    },

    async register(name, email, password) {
        const res = await this.request('/auth/register', 'POST', { name, email, password });
        if (res.success && res.data.token) {
            this.setToken(res.data.token);
        }
        return res;
    },

    logout() {
        this.clearToken();
        return { success: true };
    },

    async getMe() {
        return this.request('/auth/me');
    },

    async refreshToken() {
        // Implementation depends on backend refresh token logic
        // For now, just a placeholder or re-verify current token
        return this.getMe();
    },

    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/password', 'PUT', { currentPassword, newPassword });
    },

    async deleteAccount() {
        return this.request('/auth/me', 'DELETE');
    },

    // --- Profile Functions ---
    getProfile() {
        return this.request('/profile');
    },

    updateProfile(data) {
        return this.request('/profile', 'PUT', data);
    },

    createProfile(data) {
        return this.request('/profile', 'POST', data);
    },

    getBMI() {
        return this.request('/profile/bmi');
    },

    // --- Workout Functions ---
    logWorkout(data) {
        // data: { date, exercises: [], difficulty, energyLevel, ... }
        return this.request('/workouts', 'POST', data);
    },

    getWorkouts(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/workouts?${query}`);
    },

    getWorkoutByDate(date) {
        return this.request(`/workouts/date/${date}`);
    },

    updateWorkout(id, data) {
        return this.request(`/workouts/${id}`, 'PUT', data);
    },

    deleteWorkout(id) {
        return this.request(`/workouts/${id}`, 'DELETE');
    },

    getWorkoutHistory(startDate, endDate) {
        return this.request(`/workouts/history?startDate=${startDate}&endDate=${endDate}`);
    },

    // --- Exercise Functions ---
    getExercises(page = 1, keyword = '') {
        return this.request(`/exercises?pageNumber=${page}&keyword=${keyword}`);
    },

    searchExercises(query) {
        return this.request(`/exercises/search?q=${query}`);
    },

    getExercisesByMuscleGroup(group) {
        return this.request(`/exercises/muscle/${group}`);
    },

    getExerciseDetail(id) {
        return this.request(`/exercises/${id}`);
    },

    // --- Plan Functions ---
    getWorkoutPlans() {
        return this.request('/workout-plans');
    },

    getUserPlans(userId) {
        return this.request(`/user-plans/${userId}`);
    },

    subscribeToPlan(planId) {
        return this.request('/user-plans', 'POST', { planId });
    },

    unsubscribeFromPlan(planId) {
        return this.request(`/user-plans/${planId}`, 'DELETE');
    },

    // --- Stats Functions ---
    getWeeklyStats() {
        return this.request('/stats/weekly');
    },

    getMonthlyStats() {
        return this.request('/stats/monthly');
    },

    getProgressStats() {
        return this.request('/stats/progress');
    },

    getPersonalRecords() {
        return this.request('/stats/pr');
    },

    getMuscleDistribution() {
        return this.request('/stats/muscle-distribution');
    },

    getStreak() {
        return this.request('/stats/streak');
    },

    // --- Goal Functions ---
    createGoal(goalData) {
        return this.request('/goals', 'POST', goalData);
    },

    getGoals(filter = {}) {
        const query = new URLSearchParams(filter).toString();
        return this.request(`/goals?${query}`);
    },

    updateGoal(id, data) {
        return this.request(`/goals/${id}`, 'PUT', data);
    },

    deleteGoal(id) {
        return this.request(`/goals/${id}`, 'DELETE');
    },

    getGoalProgress(id) {
        return this.request(`/goals/${id}/progress`);
    },

    // --- Notification Functions ---
    getNotificationPreferences() {
        return this.request('/notifications/preferences');
    },

    updateNotificationPreferences(prefs) {
        return this.request('/notifications/preferences', 'PUT', prefs);
    },

    getNotifications() {
        return this.request('/notifications');
    },

    markAsRead(notificationId) {
        return this.request(`/notifications/${notificationId}/read`, 'PUT');
    },

    scheduleReminders() {
        // This might be a client-side logic or backend trigger
        return this.request('/notifications/schedule', 'POST');
    }
};

export default api;
