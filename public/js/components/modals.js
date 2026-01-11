export const showModal = (content) => {
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <span class="modal-close">&times;</span>
                <div id="modal-content"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Close handlers
        const closeBtn = overlay.querySelector('.modal-close');
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    document.getElementById('modal-content').innerHTML = content;
    overlay.classList.add('show');
};

export const closeModal = () => {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
};
