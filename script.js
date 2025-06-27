gsap.registerPlugin(ScrollTrigger);
function initCustomCursor() {
    const cursor = document.createElement('div');
    const follower = document.createElement('div');
    cursor.className = 'cursor';
    follower.className = 'cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;
 
    gsap.to({}, 0.016, {
        repeat: -1,
        onRepeat: function() {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;
            gsap.set(follower, {
                css: {
                    left: posX - 15,
                    top: posY - 15
               }
            });
            gsap.set(cursor, {
                css: {
                    left: mouseX,
                    top: mouseY
                }
            });
        }
    });
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mousedown', function() {
        gsap.to([cursor, follower], {
            scale: 0.8,
            duration: 0.3
        });
    });
    document.addEventListener('mouseup', function() {
        gsap.to([cursor, follower], {
            scale: 1,
            duration: 0.3
        });
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
           mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}
function initThemeSwitch() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
   
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function initScrollAnimations() {
    
    gsap.from('.hero-title', {
        duration: 1,
        y: 100,
        opacity: 0,
        ease: 'power4.out'
    });

    gsap.from('.hero-subtitle', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.3,
        ease: 'power4.out'
    });

    gsap.from('.hero-cta', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.6,
        ease: 'power4.out'
    });

    gsap.from('.tech-item', {
        scrollTrigger: {
            trigger: '.tech-stack',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power4.out'
    });
  
    gsap.from('.about-description', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power4.out'
    });

    gsap.from('.stat-card', {
        scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power4.out'
    });

    gsap.from('.skill-category', {
        scrollTrigger: {
            trigger: '.skills',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.3,
        ease: 'power4.out'
    });

    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        x: -50,
        opacity: 0,
        ease: 'power4.out'
    });

    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        x: 50,
        opacity: 0,
        ease: 'power4.out'
    });
}
function initForm() {
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
          
           
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
               
               form.reset();
                submitBtn.textContent = 'Message Sent!';
              
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
}
function initSkillProgress() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-progress');
        gsap.to(bar, {
            scrollTrigger: {
                trigger: bar,
                start: 'top center',
                toggleActions: 'play none none reverse'
            },
            width: width + '%',
            duration: 1,
            ease: 'power4.out'
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initMobileMenu();
    initThemeSwitch();
    initScrollAnimations();
    initForm();
    initSkillProgress();
});