// Main application JavaScript for landing page
class TerraWeaveApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupAnimations();
        this.setupInteractiveElements();
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe feature cards and other elements
        document.querySelectorAll('.feature-card, .demo-card').forEach(el => {
            observer.observe(el);
        });

        // Add CSS for animations
        this.addAnimationStyles();
    }

    addAnimationStyles() {
        const styles = `
            .feature-card, .demo-card {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .feature-card.animate-in, .demo-card.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .feature-card:nth-child(1) { transition-delay: 0.1s; }
            .feature-card:nth-child(2) { transition-delay: 0.2s; }
            .feature-card:nth-child(3) { transition-delay: 0.3s; }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupInteractiveElements() {
        // Interactive globe animation
        this.setupGlobeInteraction();
        
        // Demo data updates
        this.setupLiveDemo();
    }

    setupGlobeInteraction() {
        const globe = document.querySelector('.globe');
        if (!globe) return;

        let isAnimating = false;
        
        globe.addEventListener('mouseenter', () => {
            if (!isAnimating) {
                isAnimating = true;
                globe.style.animation = 'rotate 5s linear infinite';
            }
        });

        globe.addEventListener('mouseleave', () => {
            isAnimating = false;
            globe.style.animation = 'rotate 20s linear infinite';
        });
    }

    setupLiveDemo() {
        // Simulate live data updates for demo section
        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length === 0) return;

        setInterval(() => {
            metrics.forEach(metric => {
                const currentValue = metric.textContent;
                const number = parseFloat(currentValue);
                if (!isNaN(number)) {
                    // Small random fluctuation for demo effect
                    const fluctuation = (Math.random() - 0.5) * 0.1;
                    const newValue = number * (1 + fluctuation);
                    metric.textContent = newValue.toFixed(1) + (currentValue.includes('M') ? 'M' : '');
                }
            });
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TerraWeaveApp();
    
    // Add any additional initialization here
    console.log('TerraWeave+ initialized successfully');
});

// Utility functions
const TerraWeaveUtils = {
    // Format large numbers
    formatNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Generate random color
    getRandomColor: () => {
        const colors = ['#00f3ff', '#7b61ff', '#ff2e63', '#00d4aa', '#ffb800'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
