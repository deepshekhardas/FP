import api from '../services/api.js';

let currentPage = 1;
let usersData = [];

const loadStats = async () => {
    try {
        const stats = await api.get('/admin/stats');
        document.getElementById('stat-total-users').textContent = stats.totalUsers || 0;
        document.getElementById('stat-new-users').textContent = stats.newUsersThisMonth || 0;
        document.getElementById('stat-total-workouts').textContent = stats.totalWorkouts || 0;
        document.getElementById('stat-total-goals').textContent = stats.totalGoals || 0;
    } catch (error) {
        console.error('Failed to load admin stats:', error);
    }
};

const loadSignupsChart = async () => {
    try {
        const signups = await api.get('/admin/analytics/signups');
        const ctx = document.getElementById('signupsChart').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: signups.map(s => s._id),
                datasets: [{
                    label: 'New Signups',
                    data: signups.map(s => s.count),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch (error) {
        console.error('Failed to load signups chart:', error);
    }
};

const loadRecentUsers = async () => {
    try {
        const data = await api.get('/admin/users?limit=5');
        const tbody = document.getElementById('recent-users-table');

        if (data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = data.users.map(user => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">${user.name.charAt(0).toUpperCase()}</div>
                        <span>${user.name}</span>
                    </div>
                </td>
                <td style="padding: 12px 8px; color: var(--text-secondary);">${user.email}</td>
                <td style="padding: 12px 8px; color: var(--text-secondary);">${new Date(user.createdAt).toLocaleDateString()}</td>
                <td style="padding: 12px 8px; text-align: center;">
                    <span class="badge" style="background: ${user.subscriptionTier === 'premium' ? 'var(--gradient-primary)' : user.subscriptionTier === 'pro' ? 'var(--success-color)' : 'var(--text-muted)'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
                        ${user.subscriptionTier?.toUpperCase() || 'FREE'}
                    </span>
                </td>
                <td style="padding: 12px 8px; text-align: center;">
                    <a href="#/admin/users" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;">View</a>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load recent users:', error);
    }
};

window.exportData = () => {
    alert('Export functionality coming soon!');
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadSignupsChart();
    loadRecentUsers();
});

// Also run if page is loaded via SPA navigation
loadStats();
loadRecentUsers();
setTimeout(loadSignupsChart, 100);
