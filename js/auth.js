// Authentication-specific functionality
class AuthManager {
    constructor() {
        this.setupWalletConnection();
    }

    setupWalletConnection() {
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectMetaMask());
        }
    }

    async connectMetaMask() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask não está instalado. Por favor, instale a extensão.');
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                const walletAddress = accounts[0];
                
                // Pre-fill registration form with wallet info
                const registerForm = document.getElementById('register-form');
                if (registerForm) {
                    const emailField = document.getElementById('register-email');
                    if (emailField && !emailField.value) {
                        emailField.value = `wallet_${walletAddress.slice(2, 10)}@blockchain.com`;
                    }
                }

                window.app.showNotification('Carteira conectada com sucesso!', 'success');
                return walletAddress;
            }
        } catch (error) {
            console.error('Erro ao conectar MetaMask:', error);
            window.app.showNotification('Erro ao conectar carteira.', 'error');
        }
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});