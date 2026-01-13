import api from '../services/api.js';
import { showToast } from '../utils/helpers.js';
import { showModal, closeModal } from '../components/modals.js';
import { logout } from '../utils/auth.js';

export const initProfile = async () => {
    const container = document.getElementById('profile-content');

    try {
        const [userRes, bmiRes] = await Promise.all([api.getMe(), api.getBMI()]);

        if (!userRes.success || !bmiRes.success) {
            throw new Error(userRes.error || bmiRes.error);
        }

        const user = userRes.data;
        const bmiData = bmiRes.data;

        // Render Tabs
        const renderTab = (tab) => {
            if (tab === 'profile') {
                renderProfileTab(container, user, bmiData);
            } else {
                renderSettingsTab(container, user, bmiData);
            }
        };

        document.getElementById('tab-profile').addEventListener('click', (e) => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderTab('profile');
        });

        document.getElementById('tab-settings').addEventListener('click', (e) => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderTab('settings');
        });

        // Initial Render
        renderTab('profile');

    } catch (error) {
        container.innerHTML = `<p class="text-danger">Error loading profile: ${error.message}</p>`;
    }
};

const renderProfileTab = (container, user, bmiData) => {
    container.innerHTML = `
        <div class="card fade-in">
            <div class="profile-header">
                <div class="profile-avatar-container">
                    <img src="${user.avatar || 'https://via.placeholder.com/150'}" class="profile-avatar" id="avatar-img">
                    <label for="avatar-upload" class="avatar-upload-btn">
                        <i class="fas fa-camera"></i>
                    </label>
                    <input type="file" id="avatar-upload" style="display: none;" accept="image/*">
                </div>
                <h2 class="profile-name">${user.name}</h2>
                <p class="profile-email">${user.email}</p>
                <div class="profile-badges">
                    <span class="badge-pill">Member since ${new Date(user.createdAt).getFullYear()}</span>
                    <span class="badge-pill" style="background: var(--warning-color); color: #000;">Premium</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: var(--bg-body); padding: 10px; border-radius: 5px; text-align: center;">
                    <small>Height</small>
                    <p><strong>${bmiData.height || '-'} cm</strong></p>
                </div>
                <div style="background: var(--bg-body); padding: 10px; border-radius: 5px; text-align: center;">
                    <small>Weight</small>
                    <p><strong>${bmiData.weight || '-'} kg</strong></p>
                </div>
                <div style="background: var(--bg-body); padding: 10px; border-radius: 5px; text-align: center;">
                    <small>BMI</small>
                    <p><strong style="color: var(--warning-color);">${bmiData.bmi || '-'}</strong></p>
                </div>
            </div>

            <div class="form-group">
                <textarea class="form-control" id="bio" rows="3" placeholder=" ">${bmiData.bio || ''}</textarea>
                <label class="form-label">Bio</label>
            </div>

            <button class="btn btn-secondary btn-block" id="edit-profile-btn">Edit Profile Details</button>
        </div>

        <!-- BMI Calculator Tool -->
        <div class="card fade-in" style="margin-top: 20px;">
            <h3>BMI Calculator ⚖️</h3>
            <p class="text-secondary" style="margin-bottom: 20px;">Check your Body Mass Index</p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Height (cm)</label>
                    <input type="number" id="calc-height" class="form-control" value="${bmiData.height || ''}">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Weight (kg)</label>
                    <input type="number" id="calc-weight" class="form-control" value="${bmiData.weight || ''}">
                </div>
            </div>
            
            <button id="calculate-bmi-btn" class="btn btn-primary btn-block">Calculate BMI</button>
            
            <div id="bmi-result" style="margin-top: 20px; display: none; text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                <h2 id="bmi-score" style="margin-bottom: 5px; color: var(--primary-color);">0.0</h2>
                <p id="bmi-category" style="margin-bottom: 0px; font-weight: bold;">Normal</p>
            </div>
        </div>
    `;

    // BMI Calculator Logic
    document.getElementById('calculate-bmi-btn').addEventListener('click', () => {
        const h = parseFloat(document.getElementById('calc-height').value);
        const w = parseFloat(document.getElementById('calc-weight').value);

        if (!h || !w) return showToast('Please enter both height and weight', 'error');

        const bmi = (w / ((h / 100) * (h / 100))).toFixed(2);
        let category = '', color = '';

        if (bmi < 18.5) { category = 'Underweight'; color = '#34d399'; }
        else if (bmi < 24.9) { category = 'Normal Weight'; color = '#22d3ee'; }
        else if (bmi < 29.9) { category = 'Overweight'; color = '#fbbf24'; }
        else { category = 'Obese'; color = '#f87171'; }

        const resDiv = document.getElementById('bmi-result');
        const scoreEl = document.getElementById('bmi-score');
        const catEl = document.getElementById('bmi-category');

        resDiv.style.display = 'block';
        scoreEl.innerText = bmi;
        catEl.innerText = category;
        catEl.style.color = color;
    });

    // Avatar Upload
    document.getElementById('avatar-upload').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target.result;
                document.getElementById('avatar-img').src = base64;
                const res = await api.updateProfile({ avatar: base64 });
                if (res.success) showToast('Avatar updated!', 'success');
                else showToast(res.error, 'error');
            };
            reader.readAsDataURL(file);
        }
    });

    // Bio Auto-save
    let bioTimeout;
    document.getElementById('bio').addEventListener('input', (e) => {
        clearTimeout(bioTimeout);
        bioTimeout = setTimeout(async () => {
            const res = await api.updateProfile({ bio: e.target.value });
            if (res.success) showToast('Bio saved', 'success');
            else showToast(res.error, 'error');
        }, 1000);
    });

    // Edit Profile Modal
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        showModal(`
            <h2>Edit Profile</h2>
            <form id="edit-profile-form">
                <div class="form-group">
                    <input type="number" id="edit-height" class="form-control" required value="${bmiData.height || ''}">
                    <label class="form-label">Height (cm)</label>
                </div>
                <div class="form-group">
                    <input type="number" id="edit-weight" class="form-control" required value="${bmiData.weight || ''}">
                    <label class="form-label">Weight (kg)</label>
                </div>
                <div class="form-group">
                    <input type="number" id="edit-age" class="form-control" required value="${bmiData.age || ''}">
                    <label class="form-label">Age</label>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Save Profile</button>
            </form>
        `);

        document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const height = document.getElementById('edit-height').value;
            const weight = document.getElementById('edit-weight').value;
            const age = document.getElementById('edit-age').value;

            const res = await api.createProfile({ height, weight, age });
            if (res.success) {
                showToast('Profile updated!', 'success');
                closeModal();
                initProfile(); // Reload
            } else {
                showToast(res.error, 'error');
            }
        });
    });
};

const renderSettingsTab = (container, user, bmiData) => {
    const settings = bmiData.settings || {};
    const notifications = settings.notifications || {};

    container.innerHTML = `
        <div class="fade-in">
            <!-- Notifications -->
            <div class="settings-section">
                <h3>Notifications</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Daily Reminder</h4>
                        <p>Get reminded to workout every day</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="dailyReminder" ${notifications.dailyReminder ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <!-- Account -->
            <div class="settings-section danger-zone">
                <h3>Account</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Change Password</h4>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="change-password-btn">Update</button>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Delete Account</h4>
                    </div>
                    <button class="btn btn-danger btn-sm" id="delete-account-btn">Delete</button>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn btn-danger" id="logout-btn">Logout</button>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('dailyReminder').addEventListener('change', async (e) => {
        const currentSettings = bmiData.settings || {};
        if (!currentSettings.notifications) currentSettings.notifications = {};
        currentSettings.notifications.dailyReminder = e.target.checked;

        const res = await api.updateProfile({ settings: currentSettings });
        if (res.success) showToast('Settings saved', 'success');
        else showToast(res.error, 'error');
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    document.getElementById('change-password-btn').addEventListener('click', () => {
        showModal(`
            <h2>Change Password</h2>
            <form id="change-password-form">
                <div class="form-group">
                    <input type="password" id="current-password" class="form-control" required placeholder="Current Password">
                </div>
                <div class="form-group">
                    <input type="password" id="new-password" class="form-control" required placeholder="New Password">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Update</button>
            </form>
        `);

        document.getElementById('change-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const current = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;

            const res = await api.changePassword(current, newPass);
            if (res.success) {
                showToast('Password updated', 'success');
                closeModal();
            } else {
                showToast(res.error, 'error');
            }
        });
    });

    document.getElementById('delete-account-btn').addEventListener('click', () => {
        showModal(`
            <h2 class="text-danger">Delete Account</h2>
            <p>Are you sure? This cannot be undone.</p>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-secondary btn-block" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger btn-block" id="confirm-delete-btn">Delete</button>
            </div>
        `);

        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            const res = await api.deleteAccount();
            if (res.success) {
                showToast('Account deleted', 'success');
                closeModal();
                logout();
            } else {
                showToast(res.error, 'error');
            }
        });
    });
};
