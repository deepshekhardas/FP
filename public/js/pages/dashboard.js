import api from '../services/api.js';
import { showToast } from '../utils/helpers.js';

export const initDashboard = async () => {
    // Show Skeletons
    const progressValue = document.querySelector('.progress-value');
    if (progressValue) {
        progressValue.innerHTML = '<div class="skeleton skeleton-text" style="width: 50px; height: 30px; margin: 0 auto;"></div>';
    }

    try {
        const [workoutsRes, goalsRes] = await Promise.all([
            api.getWorkouts(),
            api.getGoals()
        ]);

        if (workoutsRes.success) {
            const workouts = workoutsRes.data;
            const today = new Date().toISOString().split('T')[0];
            const todaysWorkout = workouts.find(w => w.date.startsWith(today));

            const progressCircle = document.querySelector('.progress-circle');
            const emptyState = document.querySelector('.empty-state');

            // Reset Progress Value
            if (progressValue) progressValue.innerText = '0%';

            if (todaysWorkout) {
                // Workout Logged: Update UI
                if (progressValue) progressValue.innerText = '100%';
                if (progressCircle) progressCircle.style.background = `conic-gradient(var(--success-color) 100%, #e0e0e0 100%)`;

                // Hide Empty State & Show Details
                if (emptyState) emptyState.style.display = 'none';

                // Create/Show Details (if not already there)
                let detailsDiv = document.getElementById('today-details');
                if (!detailsDiv) {
                    detailsDiv = document.createElement('div');
                    detailsDiv.id = 'today-details';
                    detailsDiv.style.textAlign = 'center';
                    detailsDiv.innerHTML = `
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">Great job! Workout completed.</p>
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">${todaysWorkout.exercises.length} Exercises</p>
                        <a href="#/workouts" class="btn btn-secondary btn-sm">View Details</a>
                    `;
                    if (progressCircle) progressCircle.after(detailsDiv);
                }
            } else {
                // No Workout: Show Empty State
                if (progressValue) progressValue.innerText = '0%';
                if (progressCircle) progressCircle.style.background = `conic-gradient(var(--primary-color) 0%, #e0e0e0 0%)`;
                if (emptyState) emptyState.style.display = 'block';
                const detailsDiv = document.getElementById('today-details');
                if (detailsDiv) detailsDiv.remove();
            }

            // --- Chart Implementation ---
            renderChart(workouts);

            // --- Water Tracker Implementation ---
            initWaterTracker();

        } else {
            console.warn('Dashboard data load failed:', workoutsRes.error);
        }

    } catch (error) {
        console.error('Dashboard Init Error:', error);
        showToast('Failed to load dashboard data', 'error');
    }
};

const initWaterTracker = () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `water_${today}`;
    let count = parseInt(localStorage.getItem(key) || '0');
    const goal = 8;

    const countEl = document.getElementById('water-count');
    const ringEl = document.getElementById('water-progress-ring');
    const circumference = 339.292;

    const updateUI = () => {
        countEl.innerText = count;
        const offset = circumference - (count / goal) * circumference;
        ringEl.style.strokeDashoffset = count > goal ? 0 : offset;
    };

    document.getElementById('add-water').addEventListener('click', () => {
        count++;
        localStorage.setItem(key, count);
        updateUI();
        if (count === goal) showToast('Hydration goal reached! 💧', 'success');
    });

    document.getElementById('remove-water').addEventListener('click', () => {
        if (count > 0) {
            count--;
            localStorage.setItem(key, count);
            updateUI();
        }
    });

    updateUI();
};

const renderChart = (workouts) => {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;

    // 1. Process Data: Last 7 Days
    const labels = [];
    const caloriesData = [];
    const durationData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' })); // Mon, Tue...

        // Find workout for this day
        const dayWorkout = workouts.find(w => w.date.startsWith(dateString));
        caloriesData.push(dayWorkout ? (dayWorkout.caloriesBurned || 0) : 0);
        durationData.push(dayWorkout ? (dayWorkout.totalDuration || 0) : 0);
    }

    // 2. Destroy existing chart if any (to prevent canvas overlap on reload)
    if (window.myActivityChart) {
        window.myActivityChart.destroy();
    }

    // 3. Create Gradient
    const chartContext = ctx.getContext('2d');
    const gradient = chartContext.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Primary color
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    const secondaryGradient = chartContext.createLinearGradient(0, 0, 0, 400);
    secondaryGradient.addColorStop(0, 'rgba(236, 72, 153, 0.5)'); // Secondary color
    secondaryGradient.addColorStop(1, 'rgba(236, 72, 153, 0.0)');

    // 4. Config
    const config = {
        type: 'line', // Start with line
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: caloriesData,
                backgroundColor: gradient,
                borderColor: '#6366f1',
                borderWidth: 2,
                tension: 0.4, // Smooth curve
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide legend for cleaner look
                },
                tooltip: {
                    backgroundColor: 'rgba(30,30,45, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    padding: 10,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return context.parsed.y + (document.getElementById('chart-filter').value === 'calories' ? ' kcal' : ' mins');
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    beginAtZero: true
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    };

    window.myActivityChart = new Chart(ctx, config);

    // Filter Logic
    const filterSelect = document.getElementById('chart-filter');
    filterSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'calories') {
            window.myActivityChart.data.datasets[0].label = 'Calories Burned';
            window.myActivityChart.data.datasets[0].data = caloriesData;
            window.myActivityChart.data.datasets[0].backgroundColor = gradient;
            window.myActivityChart.data.datasets[0].borderColor = '#6366f1';
            window.myActivityChart.data.datasets[0].pointBorderColor = '#6366f1';
        } else {
            window.myActivityChart.data.datasets[0].label = 'Duration (mins)';
            window.myActivityChart.data.datasets[0].data = durationData;
            window.myActivityChart.data.datasets[0].backgroundColor = secondaryGradient;
            window.myActivityChart.data.datasets[0].borderColor = '#ec4899';
            window.myActivityChart.data.datasets[0].pointBorderColor = '#ec4899';
        }
        window.myActivityChart.update();
    });
};
