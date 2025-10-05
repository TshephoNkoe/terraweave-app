// Authentication JavaScript
class TerraWeaveAuth {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormHandling();
        this.setupAnimations();
        this.setupInputEffects();
    }

    setupFormHandling() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate API call - replace with actual API endpoint
            const response = await this.mockLoginAPI(email, password);
            
            if (response.success) {
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Store session data
                if (remember) {
                    localStorage.setItem('terraweave_remember', 'true');
                    localStorage.setItem('terraweave_email', email);
                }
                
                sessionStorage.setItem('terraweave_token', response.token);
                sessionStorage.setItem('terraweave_user', JSON.stringify(response.user));
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showMessage(response.message || 'Login failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
            console.error('Login error:', error);
        } finally {
            this.setLoadingState(false);
        }
    }

    async mockLoginAPI(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock validation - in real app, this would be a server call
        const validUsers = {
            'admin@terraweave.com': 'password123',
            'nasa@example.com': 'nasa2024',
            'user@example.com': 'user123'
        };

        if (validUsers[email] && validUsers[email] === password) {
            return {
                success: true,
                token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9),
                user: {
                    id: 1,
                    email: email,
                    name: email.split('@')[0],
                    organization: 'NASA'
                }
            };
        } else {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
    }

    setLoadingState(isLoading) {
        const submitButton = document.querySelector('.auth-btn');
        const originalText = submitButton.innerHTML;
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            submitButton.style.opacity = '1';
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles if not already added
        this.addMessageStyles();

        // Insert message
        const form = document.querySelector('.auth-form');
        form.insertBefore(messageEl, form.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    addMessageStyles() {
        if (document.querySelector('#auth-message-styles')) return;

        const styles = `
            .auth-message {
                padding: 1rem;
                border-radius: 10px;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 500;
                animation: slideDown 0.3s ease-out;
            }
            
            .auth-message-success {
                background: rgba(0, 212, 170, 0.1);
                border: 1px solid rgba(0, 212, 170, 0.3);
                color: #00d4aa;
            }
            
            .auth-message-error {
                background: rgba(255, 46, 99, 0.1);
                border: 1px solid rgba(255, 46, 99, 0.3);
                color: #ff2e63;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'auth-message-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupAnimations() {
        // Add entrance animations for auth card
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.opacity = '0';
            authCard.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                authCard.style.transition = 'all 0.6s ease-out';
                authCard.style.opacity = '1';
                authCard.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    setupInputEffects() {
        const inputs = document.querySelectorAll('.input-with-icon input');
        
        inputs.forEach(input => {
            // Add focus effects
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
            
            // Add input validation styling
            input.addEventListener('input', function() {
                if (this.value.length > 0) {
                    this.parentElement.classList.add('has-value');
                } else {
                    this.parentElement.classList.remove('has-value');
                }
            });
        });
        
        // Add input value styles
        const inputStyles = `
            .input-with-icon {
                transition: transform 0.3s ease;
            }
            
            .input-with-icon.has-value input {
                border-color: var(--primary);
                background: rgba(0, 243, 255, 0.08);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = inputStyles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TerraWeaveAuth();
    
    // Check for remembered email
    const rememberedEmail = localStorage.getItem('terraweave_email');
    if (rememberedEmail && localStorage.getItem('terraweave_remember') === 'true') {
        document.getElementById('email').value = rememberedEmail;
        document.querySelector('input[name="remember"]').checked = true;
    }
});
