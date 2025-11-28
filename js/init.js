// Inicialização global da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicação BBTS Carbon...');
    
    // Verifica se estamos na página de login ou dashboard
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    
    // Inicializa todos os gerenciadores
    window.authManager = new AuthManager();
    window.dashboardManager = new DashboardManager();
    window.monitoringManager = new MonitoringManager();
    window.blockchainManager = new BlockchainManager();
    window.tokenizationManager = new TokenizationManager();
    window.compensationManager = new CompensationManager();
    window.notificationsManager = new NotificationsManager();
    
    console.log('Todos os gerenciadores inicializados:', {
        auth: window.authManager,
        dashboard: window.dashboardManager,
        monitoring: window.monitoringManager,
        blockchain: window.blockchainManager,
        tokenization: window.tokenizationManager,
        compensation: window.compensationManager,
        notifications: window.notificationsManager
    });
});