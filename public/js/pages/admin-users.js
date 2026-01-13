import api from '../services/api.js';

let currentPage = 1;
let totalPages = 1;
let userToDelete = null;

const loadUsers = async (page = 1) => {
    try {
        const searchQuery = document.getElementById('user-search')?.value || '';
        const tierFilter = document.getElementById('tier-filter')?.value || '';

        const data = await api.get(`/admin/users?page=${page}&limit=10`);
        currentPage = data.page;
        totalPages = data.pages;

        renderUsersTable(data.users);
        renderPagination();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
};

const renderUsersTable = (users) => {
    const tbody = document.getElementById('users-table-body');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 12px 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="avatar" style="width: 36px; height: 36px;">${user.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style="font-weight: 500;">${user.name}</div>
                        ${user.isAdmin ? '<span style="color: var(--primary-color); font-size: 0.75rem;">Admin</span>' : ''}
                    </div>
                </div>
            </td>
            <td style="padding: 12px 8px; color: var(--text-secondary);">${user.email}</td>
            <td style="padding: 12px 8px; color: var(--text-secondary);">${new Date(user.createdAt).toLocaleDateString()}</td>
            <td style="padding: 12px 8px; text-align: center;">
                <span class="tier-badge tier-${user.subscriptionTier || 'free'}">${(user.subscriptionTier || 'free').toUpperCase()}</span>
            </td>
            <td style="padding: 12px 8px; text-align: center;">
                ${user.isSuspended
            ? '<span style="color: var(--danger-color);">Suspended</span>'
            : '<span style="color: var(--success-color);">Active</span>'}
            </td>
            <td style="padding: 12px 8px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn btn-secondary" style="padding: 6px 10px;" onclick="toggleSuspend('${user._id}', ${!user.isSuspended})">
                        <i class="fas fa-${user.isSuspended ? 'check' : 'ban'}"></i>
                    </button>
                    <button class="btn" style="padding: 6px 10px; background: var(--danger-color); color: white;" onclick="showDeleteModal('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

const renderPagination = () => {
    const container = document.getElementById('pagination');
    let html = '';

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" style="padding: 8px 12px;" onclick="loadUsers(${i})">${i}</button>`;
    }

    container.innerHTML = html;
};

window.searchUsers = () => loadUsers(1);

window.toggleSuspend = async (userId, suspend) => {
    try {
        await api.put(`/admin/users/${userId}`, { isSuspended: suspend });
        loadUsers(currentPage);
    } catch (error) {
        console.error('Failed to update user:', error);
    }
};

window.showDeleteModal = (userId) => {
    userToDelete = userId;
    document.getElementById('delete-modal').style.display = 'block';
};

window.closeDeleteModal = () => {
    userToDelete = null;
    document.getElementById('delete-modal').style.display = 'none';
};

window.confirmDelete = async () => {
    if (!userToDelete) return;
    try {
        await api.delete(`/admin/users/${userToDelete}`);
        window.closeDeleteModal();
        loadUsers(currentPage);
    } catch (error) {
        console.error('Failed to delete user:', error);
    }
};

// Initialize
loadUsers();
