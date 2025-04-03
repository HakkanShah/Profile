// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Mouse Trailer
const mouseTrailer = document.querySelector('.mouse-trailer');
let mouseX = 0;
let mouseY = 0;
let trailerX = 0;
let trailerY = 0;

// Mobile Menu
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuItems = document.querySelectorAll('.mobile-menu .menu-item');

    if (!mobileMenuToggle || !mobileMenu) return;

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
}

// Initialize mouse trailer
function initMouseTrailer() {
    if (!mouseTrailer) return;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateTrailer() {
        const dx = mouseX - trailerX;
        const dy = mouseY - trailerY;
        
        trailerX += dx * 0.1;
        trailerY += dy * 0.1;
        
        mouseTrailer.style.transform = `translate(${trailerX - 15}px, ${trailerY - 15}px)`;
        requestAnimationFrame(animateTrailer);
    }

    animateTrailer();

    // Mouse down effect
    document.addEventListener('mousedown', () => {
        mouseTrailer.style.transform = 'scale(0.8)';
    });

    document.addEventListener('mouseup', () => {
        mouseTrailer.style.transform = 'scale(1)';
    });
}

// Theme Switch
function initThemeSwitch() {
    const themeSwitch = document.querySelector('.theme-switch');
    const body = document.body;

    if (!themeSwitch) return;

    themeSwitch.addEventListener('click', () => {
        body.dataset.theme = body.dataset.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', body.dataset.theme);
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.dataset.theme = savedTheme;
    }
}

// Profile Card 3D Effect
function initProfileCard() {
    const profileCard = document.querySelector('.profile-card');
    let isTilted = false;

    if (!profileCard) return;

    profileCard.addEventListener('mousemove', (e) => {
        if (!isTilted) return;
        
        const rect = profileCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        profileCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    profileCard.addEventListener('mouseenter', () => {
        isTilted = true;
        profileCard.style.transition = 'transform 0.1s ease-out';
    });

    profileCard.addEventListener('mouseleave', () => {
        isTilted = false;
        profileCard.style.transition = 'transform 0.5s ease-out';
        profileCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
}

// Floating Tech Pills
function initTechPills() {
    const techPills = document.querySelectorAll('.tech-pill');

    techPills.forEach((pill, index) => {
        gsap.to(pill, {
            y: 20,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.2
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1
        });
    });
}

// Form Interactions
function initForm() {
    const form = document.querySelector('.contact-form');
    const inputs = document.querySelectorAll('.input-container input, .input-container textarea');

    if (!form || !inputs.length) return;

    // Input animations
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const label = input.nextElementSibling;
            const line = label.nextElementSibling;
            
            gsap.to(label, {
                y: -20,
                scale: 0.8,
                color: 'var(--primary)',
                duration: 0.3
            });
            
            gsap.to(line, {
                scaleX: 0,
                duration: 0.3
            });
        });
        
        input.addEventListener('blur', () => {
            const label = input.nextElementSibling;
            const line = label.nextElementSibling;
            
            if (!input.value) {
                gsap.to(label, {
                    y: 0,
                    scale: 1,
                    color: 'var(--text-secondary)',
                    duration: 0.3
                });
                
                gsap.to(line, {
                    scaleX: 1,
                    duration: 0.3
                });
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Message sent successfully!';
        form.appendChild(successMessage);
        
        gsap.from(successMessage, {
            y: 20,
            opacity: 0,
            duration: 0.5
        });
        
        // Reset form
        form.reset();
        submitButton.disabled = false;
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            gsap.to(successMessage, {
                y: -20,
                opacity: 0,
                duration: 0.5,
                onComplete: () => successMessage.remove()
            });
        }, 3000);
    });
}

// Hover Effects
function initHoverEffects() {
    // Social Icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            const glow = icon.querySelector('.icon-glow');
            gsap.to(glow, {
                opacity: 1,
                scale: 1.2,
                duration: 0.3
            });
        });
        
        icon.addEventListener('mouseleave', () => {
            const glow = icon.querySelector('.icon-glow');
            gsap.to(glow, {
                opacity: 0,
                scale: 1,
                duration: 0.3
            });
        });
    });

    // Skill Tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            gsap.to(tag, {
                y: -5,
                scale: 1.05,
                duration: 0.3
            });
        });
        
        tag.addEventListener('mouseleave', () => {
            gsap.to(tag, {
                y: 0,
                scale: 1,
                duration: 0.3
            });
        });
    });

    // Buttons
    const buttons = document.querySelectorAll('.cta-button, .submit-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const particles = button.querySelector('.button-particles');
            if (particles) {
                gsap.to(particles, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        });
        
        button.addEventListener('mouseleave', () => {
            const particles = button.querySelector('.button-particles');
            if (particles) {
                gsap.to(particles, {
                    opacity: 0,
                    duration: 0.3
                });
            }
        });
    });
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initMouseTrailer();
    initThemeSwitch();
    initProfileCard();
    initTechPills();
    initScrollAnimations();
    initForm();
    initHoverEffects();
});