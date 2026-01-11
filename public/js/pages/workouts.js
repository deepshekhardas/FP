import api from '../services/api.js';
import { showToast, formatDate } from '../utils/helpers.js';

export const initWorkouts = async () => {
    const container = document.getElementById('workouts-list');

    // Show Skeletons
    container.innerHTML = Array(3).fill(0).map(() => `
        <div class="card skeleton skeleton-card" style="margin-bottom: 15px;"></div>
    `).join('');

    try {
        const res = await api.getWorkouts();

        if (!res.success) {
            throw new Error(res.error);
        }

        const workouts = res.data;

        // Update Stats
        const totalWorkoutsEl = document.getElementById('total-workouts');
        const totalCaloriesEl = document.getElementById('total-calories');

        if (totalWorkoutsEl) totalWorkoutsEl.innerText = workouts.length;

        const totalCalories = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
        if (totalCaloriesEl) totalCaloriesEl.innerText = totalCalories;

        if (workouts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No workouts found. Start your journey today!</p>';
            return;
        }

        container.innerHTML = workouts.map((w, index) => `
            <div class="card slide-up" style="animation-delay: ${index * 0.1}s; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 4px; color: var(--primary-color);">${formatDate(w.date)}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            <i class="fas fa-dumbbell" style="margin-right: 6px;"></i> ${w.exercises.length} Exercises
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: rgba(99, 102, 241, 0.2); color: var(--primary-color); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 4px;">
                            ${w.totalDuration || 0} mins
                        </span>
                        <p style="font-weight: 700; color: var(--warning-color); font-size: 0.95rem;">
                            <i class="fas fa-fire-alt"></i> ${w.caloriesBurned || 0} kcal
                        </p>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0;">
                        ${w.exercises.map(e => e.exerciseId ? e.exerciseId.name : 'Unknown Exercise').slice(0, 5).join(' • ')}
                        ${w.exercises.length > 5 ? '...' : ''}
                    </p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `<p class="text-danger">Error loading workouts: ${error.message}</p>`;
        showToast(error.message, 'error');
    }
};
