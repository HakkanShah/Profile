document.addEventListener('DOMContentLoaded', () => {
    const profileCard = document.getElementById('profileCard');
    
    profileCard.classList.add('visible');

    profileCard.addEventListener('click', (event) => {
        
        const isIconLink = event.target.closest('.icon-link');

        if (!isIconLink) {
            
            if (profileCard.classList.contains('flipping')) {
                return;
            }

            profileCard.classList.add('flipping');
            profileCard.addEventListener('animationend', () => {
                profileCard.classList.remove('flipping');
            }, { once: true }); // Use { once: true } to automatically remove the listener after it fires
        }
    });
});
