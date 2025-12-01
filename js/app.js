// Main Application Controller
class BBTSCarbonApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard-page';
        this.apiBaseUrl = 'https://back-end-blockchain.onrender.com';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadInitialData();
        this.loadInitialPageContent();
        // Verificar expiração do token a cada 5 minutos
        this.startTokenExpiryCheck();
    }

    startTokenExpiryCheck() {
        // Verificar expiração do token a cada 5 minutos
        setInterval(() => {
            if (this.currentUser && !this.isTokenValid()) {
                console.log('Token expirado detectado. Fazendo logout...');
                this.clearAuthData();
                this.showLogin();
                this.showNotification('Sua sessão expirou. Por favor, faça login novamente.', 'info');
            }
        }, 5 * 60 * 1000); // Verificar a cada 5 minutos
    }

    checkAuthentication() {
        const userData = localStorage.getItem('bbts_user');
        const tokenData = localStorage.getItem('bbts_token');
        const tokenExpiry = localStorage.getItem('bbts_token_expiry');
        
        if (userData && tokenData && tokenExpiry) {
            // Verificar se o token expirou (24 horas)
            const now = Date.now();
            const expiryTime = parseInt(tokenExpiry);
            
            if (now < expiryTime) {
                // Token ainda válido
                this.currentUser = JSON.parse(userData);
                this.showDashboard();
            } else {
                // Token expirado - limpar dados e fazer logout
                console.log('Token JWT expirado. Fazendo logout...');
                this.clearAuthData();
                this.showLogin();
                this.showNotification('Sua sessão expirou. Por favor, faça login novamente.', 'info');
            }
        } else {
            // Sem dados de autenticação
            this.clearAuthData();
            this.showLogin();
        }
    }

    clearAuthData() {
        this.currentUser = null;
        localStorage.removeItem('bbts_user');
        localStorage.removeItem('bbts_token');
        localStorage.removeItem('bbts_token_expiry');
    }

    isTokenValid() {
        const tokenExpiry = localStorage.getItem('bbts_token_expiry');
        if (!tokenExpiry) return false;
        
        const now = Date.now();
        const expiryTime = parseInt(tokenExpiry);
        return now < expiryTime;
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.menu-item')) {
                const menuItem = e.target.closest('.menu-item');
                if (menuItem.id === 'logout-btn') {
                    this.logout();
                    return;
                }
                const page = menuItem.dataset.page;
                if (page) this.showPage(page);
            }

            if (e.target.closest('.tab')) {
                const tab = e.target.closest('.tab');
                this.switchTab(tab.dataset.tab);
            }
        });

        // Form submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));

        // User menu
        this.setupUserMenu();
    }

    setupUserMenu() {
        const userInfo = document.querySelector('.user-info');
        const userMenu = document.querySelector('.user-menu');
        
        if (userInfo && userMenu) {
            userInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });

            // Fecha o menu ao clicar fora
            document.addEventListener('click', () => {
                userMenu.classList.remove('active');
            });
        }
    }

    showLogin() {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        
        // Update user info
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.querySelector('.user-company').textContent = this.currentUser.company || 'Empresa';
        }
        
        this.setupUserMenu();
        this.showPage('dashboard-page');
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;

            // Add active class to corresponding menu item
            const menuItem = document.querySelector(`[data-page="${pageId}"]`);
            if (menuItem) menuItem.classList.add('active');

            // Update page title
            this.updatePageTitle(pageId);

            // Load page-specific content
            this.loadPageContent(pageId);
        }
    }

    updatePageTitle(pageId) {
        const titles = {
            'dashboard-page': 'Dashboard',
            'monitoring-page': 'Monitoramento de Emissões',
            'registry-page': 'Registro na Blockchain',
            'tokenization-page': 'Tokenização de Créditos',
            'compensation-page': 'Compensação de Emissões',
            'notifications-page': 'Notificações e Alertas',
            'profile-page': 'Configurações do Perfil'
        };

        document.getElementById('page-title').textContent = titles[pageId] || 'Dashboard';
    }

    loadPageContent(pageId) {
        switch(pageId) {
            case 'dashboard-page':
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
                break;
            case 'monitoring-page':
                if (window.monitoringManager) {
                    window.monitoringManager.loadMonitoringPage();
                }
                break;
            case 'registry-page':
                if (window.blockchainManager) {
                    window.blockchainManager.loadRegistryPage();
                }
                break;
            case 'tokenization-page':
                if (window.tokenizationManager) {
                    window.tokenizationManager.loadTokenizationPage();
                }
                break;
            case 'compensation-page':
                if (window.compensationManager) {
                    window.compensationManager.loadCompensationPage();
                }
                break;
            case 'notifications-page':
                if (window.notificationsManager) {
                    window.notificationsManager.loadNotificationsPage();
                }
                break;
            case 'profile-page':
                this.loadProfilePage();
                break;
        }
    }

    loadInitialPageContent() {
        // Garante que o conteúdo da página atual seja carregado
        if (this.currentPage) {
            this.loadPageContent(this.currentPage);
        } else {
            this.loadPageContent('dashboard-page');
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const tabElement = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContentElement = document.getElementById(`${tabName}-tab`);
        
        if (tabElement) {
            tabElement.classList.add('active');
        }
        
        if (tabContentElement) {
            tabContentElement.classList.add('active');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        // Obter valores diretamente dos elementos
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        // Validação de campos obrigatórios
        if (!email || !email.trim()) {
            this.showNotification('Por favor, preencha o e-mail.', 'error');
            return;
        }

        if (!password || !password.trim()) {
            this.showNotification('Por favor, preencha a senha.', 'error');
            return;
        }

        // Feedback visual: desabilitar botão e mostrar loading
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

        try {
            const requestBody = {
                email: email.trim(),
                senha: password
            };

            const response = await this.apiCall('/api/usuario/login', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json().catch(async () => {
                // Se não conseguir fazer parse do JSON, tentar ler como texto
                const text = await response.text();
                console.error('Resposta não é JSON:', text);
                return { error: text || 'Erro desconhecido' };
            });

            if (response.ok) {
                // Debug: ver o que a API retorna
                console.log('Resposta do login:', responseData);
                
                // Capturar ID do usuário - verificar múltiplos nomes possíveis
                const userId = responseData.id || 
                               responseData._id || 
                               responseData.idUsuario || 
                               responseData.userId || 
                               responseData.user_id ||
                               responseData.usuario?.id ||
                               responseData.usuario?._id;
                
                console.log('ID do usuário capturado:', userId);
                
                this.currentUser = {
                    id: userId,
                    name: responseData.nome || responseData.name || responseData.usuario?.nome,
                    email: responseData.email || responseData.usuario?.email,
                    company: responseData.empresa || responseData.usuario?.empresa || '',
                    walletAddress: responseData.walletAddress || responseData.usuario?.walletAddress || ''
                };
                
                // Armazenar token JWT se fornecido pelo backend
                const token = responseData.token || responseData.accessToken || responseData.jwt;
                if (token) {
                    localStorage.setItem('bbts_token', token);
                    // Definir expiração de 24 horas (86400000 ms)
                    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
                    localStorage.setItem('bbts_token_expiry', expiryTime.toString());
                } else {
                    // Se o backend não retornar token, criar um timestamp de expiração baseado no login
                    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
                    localStorage.setItem('bbts_token_expiry', expiryTime.toString());
                }
                
                localStorage.setItem('bbts_user', JSON.stringify(this.currentUser));
                this.showNotification('Login realizado com sucesso!', 'success');
                this.showDashboard();
            } else {
                console.error('Erro na resposta:', responseData);
                // Tentar diferentes formatos de mensagem de erro
                const errorMessage = responseData.message || 
                                   responseData.error || 
                                   responseData.erro ||
                                   (typeof responseData === 'string' ? responseData : 'Erro ao fazer login. Verifique suas credenciais.');
                this.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showNotification('Erro ao fazer login. Verifique sua conexão e tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        // Obter valores diretamente dos elementos
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const perfilInput = document.getElementById('register-perfil');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        
        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const perfil = perfilInput ? perfilInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        // Validação de campos obrigatórios
        if (!name || !name.trim()) {
            this.showNotification('Por favor, preencha o nome completo.', 'error');
            return;
        }

        if (!email || !email.trim()) {
            this.showNotification('Por favor, preencha o e-mail.', 'error');
            return;
        }

        if (!perfil) {
            this.showNotification('Por favor, selecione um perfil.', 'error');
            return;
        }

        if (!password || !password.trim()) {
            this.showNotification('Por favor, preencha a senha.', 'error');
            return;
        }

        if (!confirmPassword || !confirmPassword.trim()) {
            this.showNotification('Por favor, confirme a senha.', 'error');
            return;
        }

        // Validação de senha
        if (password !== confirmPassword) {
            this.showNotification('As senhas não coincidem.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        // Feedback visual: desabilitar botão e mostrar loading
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';

        try {
            const requestBody = {
                nome: name.trim(),
                email: email.trim(),
                perfil: perfil,
                senha: password
            };

            console.log('Enviando dados de cadastro:', { ...requestBody, senha: '***' });

            const response = await this.apiCall('/api/usuario', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            console.log('Resposta do servidor:', response.status, response.statusText);

            const responseData = await response.json().catch(async () => {
                // Se não conseguir fazer parse do JSON, tentar ler como texto
                const text = await response.text();
                console.error('Resposta não é JSON:', text);
                return { error: text || 'Erro desconhecido' };
            });

            if (response.ok) {
                this.showNotification('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
                
                // Limpar formulário
                e.target.reset();
                
                // Aguardar um pouco antes de mudar de tab para o usuário ver a mensagem
                setTimeout(() => {
                    this.switchTab('login');
                    // Preencher o email no campo de login
                    const loginEmailField = document.getElementById('login-email');
                    if (loginEmailField) {
                        loginEmailField.value = email.trim();
                    }
                }, 1500);
            } else {
                console.error('Erro na resposta:', responseData);
                // Tentar diferentes formatos de mensagem de erro
                const errorMessage = responseData.message || 
                                   responseData.error || 
                                   responseData.erro ||
                                   (typeof responseData === 'string' ? responseData : 'Erro ao realizar cadastro. Tente novamente.');
                this.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            this.showNotification('Erro ao realizar cadastro. Verifique sua conexão e tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    logout() {
        this.clearAuthData();
        this.showLogin();
        this.showNotification('Logout realizado com sucesso!', 'success');
    }

    async loadProfilePage() {
        const pageElement = document.getElementById('profile-page');
        if (!pageElement) return;

        // Mostrar loading inicial
        pageElement.innerHTML = `
            <div class="page-title">
                <h1>Configurações do Perfil</h1>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Carregando...</h3>
                </div>
                <p>Buscando informações do perfil...</p>
            </div>
        `;

        // Debug: ver dados do usuário atual
        console.log('Dados do currentUser:', this.currentUser);
        
        // Obter ID do usuário atual - verificar múltiplos nomes possíveis
        const userId = this.currentUser?.id || 
                       this.currentUser?._id || 
                       this.currentUser?.idUsuario || 
                       this.currentUser?.userId;
        
        console.log('ID do usuário para buscar perfil:', userId);

        let userData = null;
        let loadedFromApi = false;

        // Se temos ID, tentar buscar da API
        if (userId) {
            try {
            const response = await this.apiCall(`/api/usuario/${userId}`, {
                method: 'GET'
            });

            if (response.ok) {
                userData = await response.json();
                    loadedFromApi = true;
                    console.log('Dados carregados da API:', userData);
                }
            } catch (error) {
                console.warn('Erro ao buscar dados da API:', error);
            }
        }

        // Se não conseguiu da API, usar dados locais
        if (!userData) {
            console.log('Usando dados do localStorage');
            userData = this.currentUser || {};
        }

        // Pegar nome e email (tentar múltiplos campos possíveis)
        const userName = userData?.nome || userData?.name || this.currentUser?.name || '';
        const userEmail = userData?.email || this.currentUser?.email || '';

        // Renderizar página com dados do usuário
            pageElement.innerHTML = `
                <div class="page-title">
                    <h1>Configurações do Perfil</h1>
                </div>
            
            ${!userId ? `
            <div class="card" style="background: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Para carregar seus dados da API, por favor <strong>faça logout e login novamente</strong>.
                </p>
            </div>
            ` : ''}
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Informações da Conta</h3>
                    </div>
                    <form id="profile-form">
                        <div class="form-group">
                            <label class="form-label" for="profile-name">Nome</label>
                        <input type="text" class="form-control" id="profile-name" value="${userName}">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="profile-email">E-mail</label>
                        <input type="email" class="form-control" id="profile-email" value="${userEmail}">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="profile-wallet">Carteira Blockchain</label>
                            <input type="text" class="form-control" id="profile-wallet" value="${this.currentUser?.walletAddress || 'Não conectada'}" readonly>
                            <button type="button" class="btn btn-secondary mt-1" onclick="app.connectWallet()">
                                <i class="fab fa-ethereum"></i> Conectar Carteira
                            </button>
                        </div>
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                    </form>
                </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Segurança</h3>
                </div>
                <div class="form-group">
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">
                        Mantenha sua conta segura alterando sua senha regularmente.
                    </p>
                    <button type="button" class="btn btn-secondary" onclick="app.showChangePasswordModal()">
                        <i class="fas fa-key"></i> Alterar Senha
                    </button>
                </div>
            </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Preferências de Notificação</h3>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="notif-emissions" checked>
                            <label for="notif-emissions">Alertas de emissões acima do limite</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="notif-opportunities" checked>
                            <label for="notif-opportunities">Oportunidades de compensação</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="notif-blockchain" checked>
                            <label for="notif-blockchain">Confirmações de transações blockchain</label>
                        </div>
                    </div>
                </div>
            `;

            // Atualizar dados do usuário atual com os dados da API
        if (loadedFromApi && userData) {
                this.currentUser = {
                id: userData.id || userData._id || userId,
                    name: userData.nome || userData.name,
                    email: userData.email,
                    company: this.currentUser?.company || userData.empresa || '',
                    walletAddress: this.currentUser?.walletAddress || userData.walletAddress || ''
                };
                localStorage.setItem('bbts_user', JSON.stringify(this.currentUser));
            }

            document.getElementById('profile-form')?.addEventListener('submit', (e) => this.updateProfile(e));
    }

    async updateProfile(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const nome = document.getElementById('profile-name')?.value?.trim();
        const email = document.getElementById('profile-email')?.value?.trim();
        
        // Validação básica
        if (!nome) {
            this.showNotification('Por favor, preencha o nome.', 'error');
            return;
        }
        
        if (!email) {
            this.showNotification('Por favor, preencha o e-mail.', 'error');
            return;
        }
        
        // Obter ID do usuário
        const userId = this.currentUser?.id || 
                       this.currentUser?._id || 
                       this.currentUser?.idUsuario || 
                       this.currentUser?.userId;
        
        if (!userId) {
            this.showNotification('ID do usuário não encontrado. Faça login novamente.', 'error');
            return;
        }
        
        // Feedback visual: desabilitar botão e mostrar loading
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        
        try {
            const requestBody = {
                nome: nome,
                email: email
            };
            
            console.log('Atualizando perfil:', requestBody);
            
            const response = await this.apiCall(`/api/usuario/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(requestBody)
            });
            
            const responseData = await response.json().catch(() => ({}));
            
            if (response.ok) {
                // Atualizar dados locais
                this.currentUser = {
                    ...this.currentUser,
                    id: userId,
                    name: nome,
                    email: email
                };
                localStorage.setItem('bbts_user', JSON.stringify(this.currentUser));
                
                // Atualizar nome no header
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = nome;
                }
                
                this.showNotification('Perfil atualizado com sucesso!', 'success');
            } else {
                const errorMessage = responseData.message || 
                                   responseData.error || 
                                   responseData.erro ||
                                   'Erro ao atualizar perfil.';
                this.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            this.showNotification('Erro ao atualizar perfil. Verifique sua conexão.', 'error');
        } finally {
            // Restaurar botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    showChangePasswordModal() {
        // Remover modal existente se houver
        const existingModal = document.getElementById('change-password-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'change-password-modal';
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: #ffffff;
                border-radius: 12px;
                padding: 30px;
                width: 100%;
                max-width: 450px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: #333333;">
                        <i class="fas fa-key" style="color: var(--bb-blue); margin-right: 10px;"></i>
                        Alterar Senha
                    </h3>
                    <button type="button" onclick="app.closeChangePasswordModal()" style="
                        background: none;
                        border: none;
                        color: #666666;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                    ">&times;</button>
                </div>
                
                <form id="change-password-form">
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label" for="current-password">Senha Atual</label>
                        <div style="position: relative;">
                            <input type="password" class="form-control" id="current-password" required 
                                   style="padding-right: 45px;">
                            <button type="button" onclick="app.togglePasswordVisibility('current-password')" style="
                                position: absolute;
                                right: 10px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: none;
                                border: none;
                                color: #666666;
                                cursor: pointer;
                            "><i class="fas fa-eye"></i></button>
                    </div>
                        </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label" for="new-password">Nova Senha</label>
                        <div style="position: relative;">
                            <input type="password" class="form-control" id="new-password" required 
                                   style="padding-right: 45px;" minlength="6">
                            <button type="button" onclick="app.togglePasswordVisibility('new-password')" style="
                                position: absolute;
                                right: 10px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: none;
                                border: none;
                                color: #666666;
                                cursor: pointer;
                            "><i class="fas fa-eye"></i></button>
                        </div>
                        <small style="color: #666666; font-size: 0.8rem;">
                            Mínimo de 6 caracteres
                        </small>
                        </div>
                    
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label class="form-label" for="confirm-new-password">Confirmar Nova Senha</label>
                        <div style="position: relative;">
                            <input type="password" class="form-control" id="confirm-new-password" required 
                                   style="padding-right: 45px;" minlength="6">
                            <button type="button" onclick="app.togglePasswordVisibility('confirm-new-password')" style="
                                position: absolute;
                                right: 10px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: none;
                                border: none;
                                color: #666666;
                                cursor: pointer;
                            "><i class="fas fa-eye"></i></button>
                        </div>
                </div>
                
                    <div id="password-error" style="
                        display: none;
                        background: rgba(220, 53, 69, 0.1);
                        border: 1px solid var(--bb-red);
                        border-radius: 6px;
                        padding: 10px 15px;
                        margin-bottom: 20px;
                        color: var(--bb-red);
                        font-size: 0.9rem;
                    ">
                        <i class="fas fa-exclamation-circle"></i>
                        <span id="password-error-message"></span>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="app.closeChangePasswordModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary" id="change-password-btn">
                            <i class="fas fa-key"></i> Alterar Senha
                        </button>
                        </div>
                </form>
                </div>
            `;

        document.body.appendChild(modal);

        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeChangePasswordModal();
            }
        });

        // Adicionar evento de submit
        document.getElementById('change-password-form').addEventListener('submit', (e) => this.handleChangePassword(e));

        // Focar no primeiro campo
        document.getElementById('current-password').focus();
    }

    closeChangePasswordModal() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.parentElement.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    showPasswordError(message) {
        const errorDiv = document.getElementById('password-error');
        const errorMessage = document.getElementById('password-error-message');
        if (errorDiv && errorMessage) {
            errorMessage.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hidePasswordError() {
        const errorDiv = document.getElementById('password-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    async handleChangePassword(e) {
        e.preventDefault();
        this.hidePasswordError();

        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmNewPassword = document.getElementById('confirm-new-password')?.value;

        // Validações
        if (!currentPassword) {
            this.showPasswordError('Por favor, informe sua senha atual.');
            return;
        }

        if (!newPassword) {
            this.showPasswordError('Por favor, informe a nova senha.');
            return;
        }

        if (newPassword.length < 6) {
            this.showPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.showPasswordError('As senhas não coincidem.');
            return;
        }

        if (currentPassword === newPassword) {
            this.showPasswordError('A nova senha deve ser diferente da senha atual.');
            return;
        }

        // Obter ID do usuário
        const userId = this.currentUser?.id || 
                       this.currentUser?._id || 
                       this.currentUser?.idUsuario || 
                       this.currentUser?.userId;

        if (!userId) {
            this.showPasswordError('ID do usuário não encontrado. Faça login novamente.');
            return;
        }

        // Feedback visual
        const submitButton = document.getElementById('change-password-btn');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Alterando...';

        try {
            const requestBody = {
                senhaAtual: currentPassword,
                senha: newPassword
            };

            console.log('Alterando senha do usuário:', userId);

            const response = await this.apiCall(`/api/usuario/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json().catch(() => ({}));

            if (response.ok) {
                this.closeChangePasswordModal();
                this.showNotification('Senha alterada com sucesso!', 'success');
            } else {
                const errorMessage = responseData.message || 
                                   responseData.error || 
                                   responseData.erro ||
                                   'Erro ao alterar senha. Verifique sua senha atual.';
                this.showPasswordError(errorMessage);
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            this.showPasswordError('Erro ao alterar senha. Verifique sua conexão.');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    async connectWallet() {
        try {
            // Simulação de conexão de carteira (pode ser implementada com MetaMask depois)
            const walletAddress = '0x' + Array.from({length: 40}, () => 
                Math.floor(Math.random() * 16).toString(16)).join('');
            
            this.currentUser.walletAddress = walletAddress;
            localStorage.setItem('bbts_user', JSON.stringify(this.currentUser));
            
            document.getElementById('profile-wallet').value = walletAddress;
            this.showNotification('Carteira conectada com sucesso!', 'success');
        } catch (error) {
            this.showNotification('Erro ao conectar carteira.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--bb-green)' : 
                        type === 'error' ? 'var(--bb-red)' : 'var(--bb-light-blue)'};
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check' : 
                               type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    async apiCall(endpoint, options = {}) {
        // Verificar se o token ainda é válido antes de fazer a requisição
        if (!this.isTokenValid() && endpoint !== '/api/usuario/login' && endpoint !== '/api/usuario') {
            console.log('Token expirado. Redirecionando para login...');
            this.clearAuthData();
            this.showLogin();
            this.showNotification('Sua sessão expirou. Por favor, faça login novamente.', 'info');
            throw new Error('Token expirado');
        }

        const url = `${this.apiBaseUrl}${endpoint}`;
        const token = localStorage.getItem('bbts_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Adicionar token JWT no header se disponível (exceto para login e cadastro)
        if (token && endpoint !== '/api/usuario/login' && endpoint !== '/api/usuario') {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        return fetch(url, finalOptions);
    }

    loadInitialData() {
        // Carrega dados iniciais se necessário
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BBTSCarbonApp();
});