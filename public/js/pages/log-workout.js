import api from '../services/api.js';
import { showToast } from '../utils/helpers.js';
import { ROUTES } from '../config.js';

let exercisesList = [];

export const initLogWorkout = async () => {
    // Set default date to today (YYYY-MM-DD)
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('date').value = formattedDate;

    // Load Exercises
    try {
        const res = await api.getExercises();
        if (res.success) {
            exercisesList = res.data.exercises;
            addExerciseField(); // Add first field
        }
    } catch (error) {
        showToast('Failed to load exercises', 'error');
    }

    // Event Listeners
    document.getElementById('add-exercise-btn').addEventListener('click', addExerciseField);

    document.getElementById('difficulty').addEventListener('input', (e) => updateSlider(e.target, 'difficulty-val'));
    document.getElementById('energy').addEventListener('input', (e) => updateSlider(e.target, 'energy-val'));

    document.getElementById('log-workout-form').addEventListener('submit', handleSubmit);
};

const addExerciseField = () => {
    const container = document.getElementById('exercise-list');
    const div = document.createElement('div');
    div.className = 'card slide-up';
    div.style.marginBottom = '16px';
    div.style.position = 'relative'; // For better button positioning if needed

    const options = exercisesList.length ? exercisesList.map(e => `<option value="${e._id}">${e.name}</option>`).join('') : '<option>Loading...</option>';

    div.innerHTML = `
        <div class="form-group">
            <label class="form-label">Exercise</label>
            <select class="form-control exercise-select">${options}</select>
        </div>
        <div style="display: flex; gap: 16px;">
            <div class="form-group" style="flex: 1;">
                <label class="form-label">Sets</label>
                <input type="number" class="form-control sets" value="3" placeholder=" ">
            </div>
            <div class="form-group" style="flex: 1;">
                <label class="form-label">Reps</label>
                <input type="number" class="form-control reps" value="10" placeholder=" ">
            </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm remove-exercise" style="width: 100%; margin-top: 8px;">
            <i class="fas fa-trash-alt"></i> Remove Exercise
        </button>
    `;

    div.querySelector('.remove-exercise').addEventListener('click', () => {
        div.style.opacity = '0';
        div.style.transform = 'scale(0.9)';
        setTimeout(() => div.remove(), 300);
    });
    container.appendChild(div);
};

const updateSlider = (input, labelId) => {
    const val = input.value;
    const label = document.getElementById(labelId);
    let emoji = '';
    if (labelId.includes('difficulty')) {
        emoji = val < 4 ? '😌' : val < 7 ? '😊' : '🥵';
    } else {
        emoji = val < 4 ? '🔋' : val < 7 ? '⚡' : '🔥';
    }
    label.innerText = `${val} ${emoji}`;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    btn.innerText = 'Saving...';

    const date = document.getElementById('date').value;

    if (!date) {
        showToast('Please select a date', 'error');
        btn.disabled = false;
        btn.innerText = 'Save Workout';
        return;
    }

    const difficulty = document.getElementById('difficulty').value;
    const energy = document.getElementById('energy').value;
    const exerciseSelects = document.querySelectorAll('.exercise-select');

    if (exerciseSelects.length === 0) {
        showToast('Please add at least one exercise', 'error');
        btn.disabled = false;
        btn.innerText = 'Save Workout';
        return;
    }
    const setsInputs = document.querySelectorAll('.sets');
    const repsInputs = document.querySelectorAll('.reps');

    const exercises = [];
    for (let i = 0; i < exerciseSelects.length; i++) {
        exercises.push({
            exerciseId: exerciseSelects[i].value,
            setsCompleted: parseInt(setsInputs[i].value),
            reps: parseInt(repsInputs[i].value)
        });
    }

    try {
        const res = await api.logWorkout({
            date,
            exercises,
            difficulty: parseInt(difficulty),
            energyLevel: parseInt(energy)
        });

        if (res.success) {
            showToast('Workout logged successfully!', 'success');
            window.location.hash = ROUTES.WORKOUTS;
        } else {
            showToast(res.error, 'error');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save Workout';
    }
};
