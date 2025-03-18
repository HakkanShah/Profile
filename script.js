document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeIcon.textContent = '🌛';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.textContent = '🌞';
        }
    });
});