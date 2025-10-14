// Animation d'entrée au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Animation des éléments du header
    const header = document.querySelector('header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        header.style.transition = 'all 0.6s ease-out';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 100);

    // Animation des éléments flottants
    const elements = document.querySelectorAll('.element');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px) scale(0.8)';
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        }, 300 + index * 200);
    });

    // Animation du texte du héros
    const heroText = document.querySelector('.hero-content h1');
    const heroParagraph = document.querySelector('.hero-content p');
    const heroButtons = document.querySelector('.hero-buttons');

    [heroText, heroParagraph, heroButtons].forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 600 + index * 200);
    });
});

// Gestion des onglets
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Ajouter la classe active au bouton cliqué
        button.classList.add('active');

        // Cacher tous les panneaux
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Afficher le panneau correspondant
        const tabId = button.getAttribute('data-tab');
        const targetPane = document.getElementById(tabId);
        targetPane.classList.add('active');
    });
});

// Animation au défilement
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les sections pour l'animation au défilement
const sections = document.querySelectorAll('.features, .docs, .help');
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// Observer les éléments de fonctionnalité
const featureItems = document.querySelectorAll('.feature-item');
featureItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease-out';
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
});

// Observer les éléments de docs et help
const docsItems = document.querySelectorAll('.docs-info, .docs-buttons');
docsItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease-out';
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
});

const helpItems = document.querySelectorAll('.help-item');
helpItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease-out';
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
});

// Navigation fluide
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Ajustement pour le header fixe
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Effet de survol pour les boutons d'invitation
const inviteButtons = document.querySelectorAll('.invite-btn');
inviteButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animation des éléments flottants continus
function animateFloatingElements() {
    const elements = document.querySelectorAll('.element');
    elements.forEach((element, index) => {
        const delay = index * 2000; // Délai différent pour chaque élément
        setTimeout(() => {
            element.style.animation = 'floatElement 6s ease-in-out infinite';
        }, delay);
    });
}

animateFloatingElements();

// Effet de particules en arrière-plan (optionnel)
function createParticles() {
    const heroSection = document.querySelector('.hero');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        heroSection.appendChild(particle);
    }
}

// Ajouter des styles CSS pour les particules
const particleStyles = `
.particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(99, 102, 241, 0.3);
    border-radius: 50%;
    pointer-events: none;
    animation: particleFloat linear infinite;
}

@keyframes particleFloat {
    0% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}
`;

// Injecter les styles des particules
const styleSheet = document.createElement('style');
styleSheet.textContent = particleStyles;
document.head.appendChild(styleSheet);

// Créer les particules après un court délai
setTimeout(createParticles, 1000);

// Gestion du menu mobile (si nécessaire à l'avenir)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Écouter les changements de taille d'écran pour ajuster les animations
window.addEventListener('resize', function() {
    // Réinitialiser les animations si nécessaire
    if (window.innerWidth <= 768) {
        // Ajustements pour mobile
        const elements = document.querySelectorAll('.element');
        elements.forEach(element => {
            element.style.width = '60px';
            element.style.height = '60px';
        });
    } else {
        // Ajustements pour desktop
        const elements = document.querySelectorAll('.element');
        elements.forEach(element => {
            element.style.width = '80px';
            element.style.height = '80px';
        });
    }
});
