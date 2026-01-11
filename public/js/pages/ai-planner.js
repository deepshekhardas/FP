import api from '../services/api.js';
import { showToast } from '../utils/helpers.js';

export const initAIPlanner = () => {
    // 1. Duration Selection Logic
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('ai-duration').value = e.target.dataset.val;
        });
    });

    // 2. Form Submission
    document.getElementById('ai-planner-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI States
        const resultCard = document.getElementById('ai-result-card');
        const placeholder = document.getElementById('ai-placeholder');
        const loading = document.getElementById('ai-loading');
        const result = document.getElementById('ai-plan-result');
        const btn = document.getElementById('generate-btn');

        placeholder.style.display = 'none';
        result.style.display = 'none';
        loading.style.display = 'block';
        btn.disabled = true;

        // Gather Data
        const data = {
            goal: document.getElementById('ai-goal').value,
            equipment: document.getElementById('ai-equipment').value,
            experience: document.getElementById('ai-experience').value,
            duration: document.getElementById('ai-duration').value
        };

        try {
            // Artificial Delay for "Effect" (1.5s)
            await new Promise(r => setTimeout(r, 1500));

            // Call Backend (We need to add this to api.js first)
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            const responseData = await res.json();

            if (responseData.success) {
                renderPlan(responseData.plan);
                loading.style.display = 'none';
                result.style.display = 'block';
            } else {
                throw new Error(responseData.message || 'Generation failed');
            }

        } catch (error) {
            console.error('AI Error:', error);
            showToast('Failed to generate plan', 'error');
            loading.style.display = 'none';
            placeholder.style.display = 'block';
        } finally {
            btn.disabled = false;
        }
    });

    document.getElementById('save-ai-plan').addEventListener('click', () => {
        showToast('Workout Plan Saved to History!', 'success');
        // Logic to actually save would go here (skip for MVP, just redirect)
        setTimeout(() => window.location.hash = '#/dashboard', 1000);
    });
};

const renderPlan = (plan) => {
    document.getElementById('plan-title').innerText = plan.title;
    document.getElementById('plan-duration').innerText = plan.duration;
    document.getElementById('plan-level').innerText = plan.level;

    const list = document.getElementById('ai-exercises-list');
    list.innerHTML = plan.exercises.map(item => `
        <li style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <strong style="display: block; font-size: 1rem;">${item.exercise.name}</strong>
                <small class="text-secondary">${item.sets} Sets x ${item.reps} Reps</small>
            </div>
            <span style="font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">Rest: ${item.rest}</span>
        </li>
    `).join('');
};
