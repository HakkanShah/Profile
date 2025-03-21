// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

document.addEventListener('mousedown', () => {
    cursor.style.width = '6px';
    cursor.style.height = '6px';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
});

// Particles Background
const particles = document.querySelector('.particles');
for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'float-element';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.textContent = '✨';
    particles.appendChild(particle);
}

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// 3D Mouse Trailer
const mouseTrailer = document.querySelector('.mouse-trailer');
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseTrailer.style.opacity = '1';
});

// Smooth mouse trailer movement
function updateMouseTrailer() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    
    currentX += dx * 0.1;
    currentY += dy * 0.1;
    
    mouseTrailer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateX(${dy * 0.05}deg) rotateY(${-dx * 0.05}deg)`;
    
    requestAnimationFrame(updateMouseTrailer);
}

updateMouseTrailer();

// Animated Background
const gradientSphere = document.querySelector('.gradient-sphere');
let sphereX = 0;
let sphereY = 0;

document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
    
    gsap.to(gradientSphere, {
        x: moveX,
        y: moveY,
        duration: 1,
        ease: 'power2.out'
    });
});

// Theme Switch
const themeSwitch = document.querySelector('.theme-switch');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Animate theme transition
    gsap.to('body', {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
        duration: 0.5
    });
}

themeSwitch.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Check saved theme preference
const savedTheme = localStorage.getItem('theme') || 
                  (prefersDarkScheme.matches ? 'dark' : 'light');
setTheme(savedTheme);

// Navigation Menu
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        gsap.to(mouseTrailer, {
            scale: 2,
            duration: 0.3
        });
    });
    
    item.addEventListener('mouseleave', () => {
        gsap.to(mouseTrailer, {
            scale: 1,
            duration: 0.3
        });
    });
});

// Hero Section Animations
gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.hero-title .gradient-text, .hero-title .glitch-text', {
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.5
});

// Typing Animation
const typewriter = document.querySelector('.typewriter');
const typewriterText = typewriter.textContent;
typewriter.textContent = '';

function typeText(element, text, i = 0) {
    if (i < text.length) {
        element.textContent += text.charAt(i);
        setTimeout(() => typeText(element, text, i + 1), 50);
    }
}

setTimeout(() => typeText(typewriter, typewriterText), 1500);

// Profile Card Animation
const profileCard = document.querySelector('.profile-card');
const profileImage = document.querySelector('.profile-image-wrapper');

profileCard.addEventListener('mousemove', (e) => {
    const rect = profileCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = -((x - centerX) / centerX) * 15;
    const rotateX = ((y - centerY) / centerY) * 15;
    
    gsap.to(profileImage, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.5,
        ease: 'power2.out'
    });
});

profileCard.addEventListener('mouseleave', () => {
    gsap.to(profileImage, {
        rotateX: 0,
        rotateY: -15,
        duration: 0.5,
        ease: 'power2.out'
    });
});

// Floating Tech Pills
const techPills = document.querySelectorAll('.tech-pill');

techPills.forEach((pill, index) => {
    gsap.set(pill, {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100
    });
    
    gsap.to(pill, {
        x: '+=50',
        y: '+=50',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: index * 0.2
    });
});

// Scroll Animations
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    });
});

// Skill Tags Animation
const skillTags = document.querySelectorAll('.skill-tag');

skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
        gsap.to(tag, {
            y: -5,
            scale: 1.1,
            duration: 0.3
        });
        
        gsap.to(mouseTrailer, {
            scale: 1.5,
            duration: 0.3
        });
    });
    
    tag.addEventListener('mouseleave', () => {
        gsap.to(tag, {
            y: 0,
            scale: 1,
            duration: 0.3
        });
        
        gsap.to(mouseTrailer, {
            scale: 1,
            duration: 0.3
        });
    });
});

// Experience Cards Animation
const expCards = document.querySelectorAll('.exp-card');

expCards.forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: index * 0.2,
        ease: 'power3.out'
    });
});

// Contact Form Animations
const formInputs = document.querySelectorAll('.input-container input, .input-container textarea');

formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        gsap.to(input.nextElementSibling, {
            y: -20,
            scale: 0.8,
            color: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
            duration: 0.3
        });
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            gsap.to(input.nextElementSibling, {
                y: 0,
                scale: 1,
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                duration: 0.3
            });
        }
    });
});

// Form Submission
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = contactForm.querySelector('.submit-button');
    
    // Disable button and show loading state
    submitButton.disabled = true;
    gsap.to(submitButton, {
        opacity: 0.7,
        duration: 0.3
    });
    
    try {
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Log form data (replace with your API endpoint)
        console.log('Form submitted:', data);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Message sent successfully!';
        
        gsap.from(successMessage, {
            opacity: 0,
            y: 20,
            duration: 0.5
        });
        
        contactForm.appendChild(successMessage);
        contactForm.reset();
        
        // Remove success message
        setTimeout(() => {
            gsap.to(successMessage, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                onComplete: () => successMessage.remove()
            });
        }, 3000);
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        gsap.to(submitButton, {
            opacity: 1,
            duration: 0.3
        });
    }
});

// Social Icons Animation
const socialIcons = document.querySelectorAll('.social-icon');

socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        gsap.to(icon, {
            y: -5,
            duration: 0.3
        });
        
        gsap.to(icon.querySelector('.icon-glow'), {
            opacity: 1,
            duration: 0.3
        });
    });
    
    icon.addEventListener('mouseleave', () => {
        gsap.to(icon, {
            y: 0,
            duration: 0.3
        });
        
        gsap.to(icon.querySelector('.icon-glow'), {
            opacity: 0,
            duration: 0.3
        });
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.transform = 'translateY(0)';
        return;
    }
    
    if (currentScroll > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.about-text, .about-stats, .contact-content > *').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
});

// Typing Animation
const typingText = document.querySelector('.typing-text');
if (typingText) {
    const text = typingText.textContent;
    typingText.textContent = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    typeWriter();
}

// Parallax Effect
window.addEventListener('scroll', () => {
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(window.pageYOffset * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Social Links Hover Effect
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'rotate(360deg)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'rotate(0deg)';
    });
});

// Stat Circle Animation
const statCircles = document.querySelectorAll('.stat-circle');
statCircles.forEach(circle => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                circle.style.animation = 'rotate 2s linear infinite';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(circle);
});
