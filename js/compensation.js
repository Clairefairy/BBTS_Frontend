// Compensation functionality
class CompensationManager {
    constructor() {
        this.apiBaseUrl = 'https://back-end-blockchain.onrender.com';
        this.userEmissions = [];
        this.fontesMap = {};
        this.projectsMap = {};
        this.compensationData = {
            history: [],
            availableProjects: []
        };
        this.TOKEN_PRICE = 45.50; // Preço por token
    }

    getCurrentUserId() {
        const userData = localStorage.getItem('bbts_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id || user._id || user.idUsuario || user.userId;
        }
        return null;
    }

    async loadCompensationPage() {
        const pageElement = document.getElementById('compensation-page');
        if (pageElement) {
            // Mostrar loading
            pageElement.innerHTML = `
                <div class="page-title">
                    <h1>Compensação de Emissões</h1>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Carregando...</h3>
                    </div>
                    <p><i class="fas fa-spinner fa-spin"></i> Buscando dados...</p>
                </div>
            `;

            // Carregar dados da API em paralelo
            await Promise.all([
                this.loadProjectsFromAPI(),
                this.loadUserEmissions(),
                this.loadFontes(),
                this.loadTransactionHistory()
            ]);

            pageElement.innerHTML = this.generateCompensationHTML();
            this.setupEventListeners();
        }
    }

    async loadUserEmissions() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) return;

            const response = await this.apiCall('/api/emissao', { method: 'GET' });
            
            if (response.ok) {
                const emissoes = await response.json();
                // Filtrar apenas emissões do usuário atual
                this.userEmissions = emissoes.filter(e => e.idUsuarioFK === userId);
                console.log('Emissões do usuário carregadas:', this.userEmissions);
            }
        } catch (error) {
            console.error('Erro ao carregar emissões:', error);
        }
    }

    async loadFontes() {
        try {
            const response = await this.apiCall('/api/fonteEmissao', { method: 'GET' });
            
            if (response.ok) {
                const fontes = await response.json();
                // Criar mapa de fontes por id
                this.fontesMap = {};
                fontes.forEach(fonte => {
                    const fonteId = fonte.id || fonte._id;
                    this.fontesMap[fonteId] = fonte;
                });
                console.log('Fontes carregadas:', this.fontesMap);
            }
        } catch (error) {
            console.error('Erro ao carregar fontes:', error);
        }
    }

    getEmissionLabel(emissao) {
        const fonte = this.fontesMap[emissao.idFonteFk];
        const tipoFonte = fonte ? fonte.descricao : 'Desconhecido';
        const data = new Date(emissao.dataRegistro).toLocaleDateString('pt-BR');
        const co2 = emissao.quantidadeCo2 || 0;
        return `${this.formatNumber(co2)} kg CO₂ de ${tipoFonte} em ${data}`;
    }

    async loadTransactionHistory() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) return;

            const response = await this.apiCall('/api/transacao', { method: 'GET' });
            
            if (response.ok) {
                const transacoes = await response.json();
                console.log('Transações carregadas:', transacoes);
                
                // Filtrar apenas transações do usuário atual e do tipo compensacao
                const userTransactions = transacoes.filter(t => 
                    t.idUsuarioFK === userId && t.tipotransacao === 'compensacao'
                );
                
                // Criar mapa de projetos para referência rápida
                await this.buildProjectsMap();
                
                // Mapear transações para o formato do histórico
                this.compensationData.history = userTransactions.map((t, index) => {
                    const projeto = this.projectsMap[t.idProjetoFK] || {};
                    const co2 = t.quantidadeutilizada || 0;
                    const tokensUsed = Math.ceil(co2 / 1000); // 1 token = 1000 kg CO₂
                    const investimento = tokensUsed * this.TOKEN_PRICE;
                    
                    return {
                        id: t.id || t._id,
                        date: t.datacompensacao || new Date().toISOString(),
                        project: projeto.nome || 'Projeto',
                        type: projeto.tipo || 'desconhecido',
                        tokens: tokensUsed,
                        emissions: co2,
                        status: 'completed',
                        certificate: `CER-${new Date(t.datacompensacao).getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                        cost: investimento,
                        impact: this.generateImpactDescription(projeto.tipo, tokensUsed)
                    };
                });
                
                console.log('Histórico de compensação:', this.compensationData.history);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de transações:', error);
        }
    }

    async buildProjectsMap() {
        // Se já temos os projetos carregados, usar eles
        if (this.compensationData.availableProjects.length > 0) {
            this.compensationData.availableProjects.forEach(p => {
                this.projectsMap[p.id] = {
                    nome: p.name,
                    tipo: p.type
                };
            });
        }
        
        // Também buscar da API para garantir
        try {
            const response = await this.apiCall('/api/projeto', { method: 'GET' });
            if (response.ok) {
                const projetos = await response.json();
                projetos.forEach(p => {
                    const id = p.id || p._id;
                    this.projectsMap[id] = {
                        nome: p.nome,
                        tipo: p.tipo
                    };
                });
            }
        } catch (error) {
            console.error('Erro ao construir mapa de projetos:', error);
        }
    }

    async loadProjectsFromAPI() {
        try {
            const response = await this.apiCall('/api/projeto', { method: 'GET' });
            
            if (response.ok) {
                const projetos = await response.json();
                console.log('Projetos de compensação carregados da API:', projetos);
                
                // Mapear projetos da API para o formato usado no frontend
                this.compensationData.availableProjects = projetos.map(p => ({
                    id: p.id || p._id,
                    name: p.nome || p.name,
                    type: p.tipo,
                    description: p.descricao,
                    costPerToken: p.preco ? p.preco / 100 : 0,
                    availableTokens: p.saldoToken || 0,
                    impact: this.getProjectImpact(p.tipo),
                    verified: p.status === 'verificado',
                    location: p.local || ''
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    }

    getProjectImpact(type) {
        const impacts = {
            'reflorestamento': '1000 kg CO₂ por token | 10 árvores plantadas',
            'eolica': '1000 kg CO₂ por token | 250 kWh de energia limpa',
            'eficiencia': '800 kg CO₂ por token | 15% de eficiência',
            'solar': '1000 kg CO₂ por token | 500 kWh de energia solar'
        };
        return impacts[type] || '1000 kg CO₂ por token';
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const token = localStorage.getItem('bbts_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
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

    generateCompensationHTML() {
        const totalCompensated = this.compensationData.history.reduce((sum, item) => sum + item.emissions, 0);
        const totalCost = this.compensationData.history.reduce((sum, item) => sum + item.cost, 0);
        const totalTokens = this.compensationData.history.reduce((sum, item) => sum + item.tokens, 0);
        
        return `
            <div class="page-title">
                <h1>Compensação de Emissões</h1>
                <button class="btn btn-primary" onclick="compensationManager.showCompensationModal()">
                    <i class="fas fa-leaf"></i> Nova Compensação
                </button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tree"></i>
                    </div>
                    <div class="stat-value">${this.formatNumber(totalCompensated)}</div>
                    <div class="stat-label">CO₂ Compensado (kg)</div>
                    <div class="stat-subtitle">Total</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <div class="stat-value">${this.compensationData.history.length}</div>
                    <div class="stat-label">Certificados</div>
                    <div class="stat-subtitle">Emitidos</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="stat-value">${totalTokens}</div>
                    <div class="stat-label">Tokens Utilizados</div>
                    <div class="stat-subtitle">Total</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-value">R$ ${this.formatCurrency(totalCost)}</div>
                    <div class="stat-label">Investimento Total</div>
                    <div class="stat-subtitle">Em projetos sustentáveis</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Histórico de Compensação</h3>
                    <button class="btn btn-secondary" onclick="compensationManager.exportCompensationHistory()">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Projeto</th>
                            <th>Tipo</th>
                            <th>Tokens</th>
                            <th>CO₂ (kg)</th>
                            <th>Investimento</th>
                            <th>Certificado</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateCompensationHistoryHTML()}
                    </tbody>
                </table>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Projetos de Compensação Disponíveis</h3>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar projetos..." id="search-projects">
                        <button class="btn btn-secondary" onclick="compensationManager.searchProjects()">Buscar</button>
                    </div>
                </div>
                <div class="token-grid">
                    ${this.generateProjectsHTML()}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Impacto Ambiental</h3>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Equivalente a Árvores Plantadas</label>
                        <input type="text" class="form-control" value="${Math.round(totalCompensated / 28.5)} árvores" readonly>
                        <small class="form-text">1 árvore absorve ~28.5 kg CO₂/ano</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Energia Limpa Gerada</label>
                        <input type="text" class="form-control" value="${this.formatNumber(totalCompensated * 2)} kWh" readonly>
                        <small class="form-text">Equivalente em energia renovável</small>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Metas de Compensação</label>
                    <div style="background: #f0f0f0; border-radius: 10px; height: 20px; margin: 10px 0;">
                        <div style="background: var(--bb-green); height: 100%; width: 65%; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">
                            65% da meta anual
                        </div>
                    </div>
                    <small class="form-text">Meta: 5000 kg CO₂ compensados em 2023</small>
                </div>
            </div>

            <!-- Compensation Modal -->
            <div id="compensation-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Compensar Emissões</h3>
                        <button class="modal-close" onclick="compensationManager.hideCompensationModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="compensation-form">
                            <div class="form-group">
                                <label class="form-label">Projeto de Compensação</label>
                                <select class="form-control" id="compensation-project" required onchange="compensationManager.updateProjectInfo()">
                                    <option value="">Selecionar projeto...</option>
                                    ${this.compensationData.availableProjects.map(project => `
                                        <option value="${project.id}" data-cost="${project.costPerToken}" data-available="${project.availableTokens}">
                                            ${project.name} - ${project.availableTokens} tokens disponíveis
                                        </option>
                                    `).join('')}
                                </select>
                                <small class="form-text" id="project-tokens-info"></small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Emissão a Compensar</label>
                                <select class="form-control" id="compensation-emission" required onchange="compensationManager.calculateTokensNeeded()">
                                    <option value="">Selecionar emissão...</option>
                                    ${this.userEmissions.map(emissao => `
                                        <option value="${emissao.id || emissao._id}" data-co2="${emissao.quantidadeCo2}">
                                            ${this.getEmissionLabel(emissao)}
                                        </option>
                                    `).join('')}
                                </select>
                                <small class="form-text">1 token compensa até 1000 kg CO₂</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">CO₂ a Compensar</label>
                                <input type="text" class="form-control" id="compensation-co2" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Custo Total em Tokens</label>
                                <input type="text" class="form-control" id="compensation-tokens-cost" readonly>
                                <small class="form-text" id="user-balance-info"></small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Método de Pagamento</label>
                                <select class="form-control" id="compensation-payment" required>
                                    <option value="">Selecionar método...</option>
                                    <option value="tokens">Usar Tokens Existentes</option>
                                    <option value="purchase">Comprar Novos Tokens</option>
                                    <option value="crypto">Pagamento em Cripto</option>
                                    <option value="pix">PIX</option>
                                </select>
                            </div>

                            <div id="payment-details" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label" id="payment-label">Detalhes do Pagamento</label>
                                    <input type="text" class="form-control" id="payment-info" placeholder="Preencha conforme o método selecionado">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" onclick="compensationManager.processCompensation()">
                            <i class="fas fa-leaf"></i> Compensar Emissões
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateCompensationHistoryHTML() {
        if (this.compensationData.history.length === 0) {
            return `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-leaf"></i>
                            <p>Nenhuma compensação realizada</p>
                            <button class="btn btn-primary mt-2" onclick="compensationManager.showCompensationModal()">
                                Realizar Primeira Compensação
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.compensationData.history.map(compensation => `
            <tr>
                <td>${this.formatDate(compensation.date)}</td>
                <td>${compensation.project}</td>
                <td>
                    <span class="badge ${
                        compensation.type === 'reflorestamento' || compensation.type === 'reforestation' ? 'badge-success' :
                        compensation.type === 'solar' ? 'badge-warning' : 
                        compensation.type === 'eolica' || compensation.type === 'wind' ? 'badge-info' : 'badge-secondary'
                    }">
                        ${this.getProjectTypeName(compensation.type)}
                    </span>
                </td>
                <td>${compensation.tokens}</td>
                <td class="text-success">-${this.formatNumber(compensation.emissions)}</td>
                <td>R$ ${this.formatCurrency(compensation.cost)}</td>
                <td>
                    <a href="#" onclick="compensationManager.viewCertificate('${compensation.certificate}')" class="certificate-link">
                        ${compensation.certificate}
                    </a>
                </td>
                <td>
                    <span class="badge badge-${compensation.status === 'completed' ? 'success' : 'warning'}">
                        ${compensation.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="compensationManager.viewDetails('${compensation.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="compensationManager.downloadCertificate('${compensation.certificate}')">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    generateProjectsHTML() {
        if (this.compensationData.availableProjects.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; color: #ccc;"></i>
                    <p style="font-size: 1.1rem;">Nenhum projeto disponível no momento.</p>
                </div>
            `;
        }

        return this.compensationData.availableProjects.map(project => `
            <div class="token-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4 style="margin: 0; flex: 1;">${project.name}</h4>
                    ${project.verified ? 
                        '<span class="badge badge-success" style="margin-left: 10px;">Verificado</span>' : 
                        '<span class="badge badge-warning">Em Verificação</span>'
                    }
                </div>
                
                <div style="margin-bottom: 15px; color: #666; font-size: 0.9rem;">
                    ${project.description}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><i class="fas fa-${this.getProjectIcon(project.type)}"></i> Tipo:</span>
                        <span>${this.getProjectTypeName(project.type)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><i class="fas fa-coins"></i> Disponível:</span>
                        <span>${project.availableTokens.toLocaleString()} tokens</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><i class="fas fa-dollar-sign"></i> Custo:</span>
                        <span>R$ ${project.costPerToken.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/token</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><i class="fas fa-leaf"></i> Impacto:</span>
                        <span style="font-size: 0.8rem; text-align: right;">${project.impact}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span><i class="fas fa-map-marker-alt"></i> Local:</span>
                        <span>${project.location}</span>
                    </div>
                </div>
                
                <button class="btn btn-primary btn-block" 
                        onclick="compensationManager.selectProjectForCompensation('${project.id}')"
                        ${project.availableTokens === 0 ? 'disabled' : ''}>
                    <i class="fas fa-leaf"></i> Selecionar Projeto
                </button>
            </div>
        `).join('');
    }

    getProjectTypeName(type) {
        const names = {
            solar: 'Energia Solar',
            eolica: 'Energia Eólica',
            reflorestamento: 'Reflorestamento',
            eficiencia: 'Eficiência Energética',
            // Compatibilidade com valores antigos
            wind: 'Energia Eólica',
            reforestation: 'Reflorestamento',
            efficiency: 'Eficiência Energética'
        };
        return names[type] || type;
    }

    getProjectIcon(type) {
        const icons = {
            solar: 'sun',
            eolica: 'wind',
            reflorestamento: 'tree',
            eficiencia: 'bolt',
            // Compatibilidade com valores antigos
            wind: 'wind',
            reforestation: 'tree',
            efficiency: 'bolt'
        };
        return icons[type] || 'leaf';
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-projects');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProjects();
                }
            });
        }

        const projectSelect = document.getElementById('compensation-project');
        const emissionSelect = document.getElementById('compensation-emission');
        const paymentSelect = document.getElementById('compensation-payment');
        
        if (projectSelect) {
            projectSelect.addEventListener('change', this.updateProjectInfo.bind(this));
        }

        if (emissionSelect) {
            emissionSelect.addEventListener('change', this.calculateTokensNeeded.bind(this));
        }

        if (paymentSelect) {
            paymentSelect.addEventListener('change', this.togglePaymentDetails.bind(this));
        }
    }

    calculateTokensNeeded() {
        const emissionSelect = document.getElementById('compensation-emission');
        const selectedOption = emissionSelect.options[emissionSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const co2 = parseFloat(selectedOption.dataset.co2) || 0;
            // 1 token = 1000 kg, arredonda para cima (fração = 1 token)
            const tokensNeeded = Math.ceil(co2 / 1000);
            
            document.getElementById('compensation-co2').value = `${this.formatNumber(co2)} kg CO₂`;
            document.getElementById('compensation-tokens-cost').value = `${tokensNeeded} token${tokensNeeded > 1 ? 's' : ''}`;
        } else {
            document.getElementById('compensation-co2').value = '';
            document.getElementById('compensation-tokens-cost').value = '';
        }
        
        // Atualizar info do saldo do usuário
        this.updateUserBalanceInfo();
    }

    updateProjectInfo() {
        const projectSelect = document.getElementById('compensation-project');
        const selectedOption = projectSelect.options[projectSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const available = parseInt(selectedOption.dataset.available) || 0;
            document.getElementById('project-tokens-info').textContent = 
                `Tokens disponíveis no projeto: ${available}`;
        }
        
        // Atualizar info do saldo do usuário
        this.updateUserBalanceInfo();
    }

    async updateUserBalanceInfo() {
        const userId = this.getCurrentUserId();
        if (!userId) return;
        
        try {
            const response = await this.apiCall(`/api/usuario/${userId}`, { method: 'GET' });
            if (response.ok) {
                const user = await response.json();
                const saldoCompra = user.saldoCompra || 0;
                const infoElement = document.getElementById('user-balance-info');
                if (infoElement) {
                    infoElement.textContent = `Seu saldo de tokens: ${saldoCompra}`;
                }
            }
        } catch (error) {
            console.error('Erro ao buscar saldo do usuário:', error);
        }
    }

    togglePaymentDetails() {
        const paymentMethod = document.getElementById('compensation-payment').value;
        const paymentDetails = document.getElementById('payment-details');
        const paymentLabel = document.getElementById('payment-label');
        const paymentInfo = document.getElementById('payment-info');
        
        if (paymentMethod && paymentMethod !== 'tokens') {
            paymentDetails.style.display = 'block';
            
            const labels = {
                purchase: 'Número do Cartão',
                crypto: 'Endereço da Carteira',
                pix: 'Chave PIX'
            };
            
            const placeholders = {
                purchase: '1234 5678 9012 3456',
                crypto: '0x...',
                pix: 'CPF, e-mail ou telefone'
            };
            
            paymentLabel.textContent = labels[paymentMethod] || 'Detalhes do Pagamento';
            paymentInfo.placeholder = placeholders[paymentMethod] || 'Informe os dados necessários';
        } else {
            paymentDetails.style.display = 'none';
        }
    }

    showCompensationModal() {
        document.getElementById('compensation-modal').classList.add('active');
        // Atualizar info do saldo do usuário
        this.updateUserBalanceInfo();
    }

    hideCompensationModal() {
        document.getElementById('compensation-modal').classList.remove('active');
        document.getElementById('compensation-form').reset();
        document.getElementById('payment-details').style.display = 'none';
        document.getElementById('compensation-co2').value = '';
        document.getElementById('compensation-tokens-cost').value = '';
        document.getElementById('project-tokens-info').textContent = '';
    }

    selectProjectForCompensation(projectId) {
        this.showCompensationModal();
        // Set the project in the select
        setTimeout(() => {
            document.getElementById('compensation-project').value = projectId;
            this.updateProjectInfo();
        }, 100);
    }

    async processCompensation() {
        const form = document.getElementById('compensation-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const projectSelect = document.getElementById('compensation-project');
        const emissionSelect = document.getElementById('compensation-emission');
        
        const projectId = projectSelect.value;
        const emissionId = emissionSelect.value;
        const paymentMethod = document.getElementById('compensation-payment').value;
        const userId = this.getCurrentUserId();

        console.log('Valores obtidos:', { projectId, emissionId, paymentMethod, userId });

        if (!projectId) {
            window.app.showNotification('Selecione um projeto.', 'error');
            return;
        }

        if (!emissionId) {
            window.app.showNotification('Selecione uma emissão para compensar.', 'error');
            return;
        }

        if (!paymentMethod) {
            window.app.showNotification('Selecione um método de pagamento.', 'error');
            return;
        }

        // Calcular tokens necessários
        const selectedEmission = emissionSelect.options[emissionSelect.selectedIndex];
        const co2 = parseFloat(selectedEmission.dataset.co2) || 0;
        const tokensNeeded = Math.ceil(co2 / 1000);
        
        const project = this.compensationData.availableProjects.find(p => String(p.id) === String(projectId));
        if (!project) {
            window.app.showNotification('Projeto não encontrado.', 'error');
            return;
        }

        try {
            window.app.showNotification('Processando compensação...', 'info');

            // Buscar dados atuais do usuário
            const userResponse = await this.apiCall(`/api/usuario/${userId}`, { method: 'GET' });
            if (!userResponse.ok) {
                throw new Error('Erro ao buscar dados do usuário');
            }
            const currentUser = await userResponse.json();
            const currentSaldoCompra = currentUser.saldoCompra || 0;

            // Verificar se tem tokens suficientes se estiver usando tokens existentes
            if (paymentMethod === 'tokens' && tokensNeeded > currentSaldoCompra) {
                window.app.showNotification(`Tokens insuficientes. Você tem ${currentSaldoCompra} tokens e precisa de ${tokensNeeded}.`, 'error');
                return;
            }

            // Buscar dados atuais do projeto
            const projectResponse = await this.apiCall(`/api/projeto/${projectId}`, { method: 'GET' });
            if (!projectResponse.ok) {
                throw new Error('Erro ao buscar dados do projeto');
            }
            const currentProject = await projectResponse.json();
            console.log('Projeto retornado pela API:', currentProject);

            // Criar transação de compensação na API
            // Usar o ID diretamente do select (que veio do projeto carregado)
            const transacaoBody = {};
            transacaoBody.idProjetoFK = projectId;
            transacaoBody.idUsuarioFK = userId;
            transacaoBody.idEmissaoFK = emissionId;
            transacaoBody.quantidadeutilizada = co2;
            transacaoBody.datacompensacao = new Date().toISOString();
            transacaoBody.tipotransacao = "compensacao";

            console.log('=== DEBUG TRANSAÇÃO ===');
            console.log('projectId:', projectId, 'tipo:', typeof projectId);
            console.log('userId:', userId, 'tipo:', typeof userId);
            console.log('emissionId:', emissionId, 'tipo:', typeof emissionId);
            console.log('transacaoBody:', transacaoBody);
            console.log('JSON a enviar:', JSON.stringify(transacaoBody));
            console.log('======================');

            const transacaoResponse = await fetch(`${this.apiBaseUrl}/api/transacao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('bbts_token')}`
                },
                body: JSON.stringify(transacaoBody)
            });

            if (!transacaoResponse.ok) {
                const errorData = await transacaoResponse.json().catch(() => ({}));
                console.error('Erro ao criar transação:', errorData);
                throw new Error('Erro ao registrar transação de compensação');
            }

            // Se estiver usando tokens existentes, subtrair do saldoCompra do usuário
            if (paymentMethod === 'tokens') {
                const novoSaldoCompra = currentSaldoCompra - tokensNeeded;
                await this.apiCall(`/api/usuario/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ saldoCompra: novoSaldoCompra })
                });
            }

            // Adicionar tokens ao saldoToken do projeto
            const novoSaldoTokenProjeto = (currentProject.saldoToken || 0) + tokensNeeded;
            await this.apiCall(`/api/projeto/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify({ saldoToken: novoSaldoTokenProjeto })
            });

            // Criar registro local de compensação para histórico
            const newCompensation = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                project: project.name,
                type: project.type,
                tokens: tokensNeeded,
                emissions: co2,
                status: 'completed',
                certificate: `CER-${new Date().getFullYear()}-${String(this.compensationData.history.length + 1).padStart(3, '0')}`,
                cost: tokensNeeded * project.costPerToken,
                impact: this.generateImpactDescription(project.type, tokensNeeded)
            };

            this.compensationData.history.unshift(newCompensation);

            this.hideCompensationModal();
            window.app.showNotification(`Compensação de ${this.formatNumber(co2)} kg CO₂ realizada com sucesso!`, 'success');
            await this.loadCompensationPage();
        } catch (error) {
            console.error('Erro ao processar compensação:', error);
            window.app.showNotification('Erro ao processar compensação: ' + error.message, 'error');
        }
    }

    generateImpactDescription(type, tokens) {
        const impacts = {
            solar: `${tokens * 500} kWh de energia solar gerada`,
            eolica: `${tokens * 250} kWh de energia eólica gerada`,
            reflorestamento: `${tokens * 10} árvores plantadas`,
            eficiencia: `Eficiência energética em ${tokens * 2} empresas`,
            // Compatibilidade com valores antigos
            wind: `${tokens * 250} kWh de energia eólica gerada`,
            reforestation: `${tokens * 10} árvores plantadas`,
            efficiency: `Eficiência energética em ${tokens * 2} empresas`
        };
        return impacts[type] || 'Impacto positivo no meio ambiente';
    }

    viewCertificate(certificateId) {
        const compensation = this.compensationData.history.find(c => c.certificate === certificateId);
        if (compensation) {
            const modalHTML = `
                <div class="modal active">
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header">
                            <h3 class="modal-title">Certificado de Compensação</h3>
                            <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div style="text-align: center; border: 2px solid var(--bb-green); padding: 30px; border-radius: 10px; background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);">
                                <div style="font-size: 2rem; color: var(--bb-green); margin-bottom: 20px;">
                                    <i class="fas fa-certificate"></i>
                                </div>
                                <h2 style="color: var(--bb-green); margin-bottom: 10px;">${certificateId}</h2>
                                <p style="font-size: 1.2rem; margin-bottom: 20px; font-weight: 600;">Certificado de Compensação de Carbono</p>
                                
                                <div style="text-align: left; max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>Empresa:</strong>
                                        <span>${window.app.currentUser?.company || 'N/A'}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>Data:</strong>
                                        <span>${this.formatDate(compensation.date)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>CO₂ Compensado:</strong>
                                        <span style="color: var(--bb-green);">-${this.formatNumber(compensation.emissions)} kg</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>Projeto:</strong>
                                        <span>${compensation.project}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>Impacto:</strong>
                                        <span>${compensation.impact}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <strong>Tokens:</strong>
                                        <span>${compensation.tokens} BBTS-CARBON</span>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                                    <div style="background: #f0f0f0; width: 100px; height: 100px; display: inline-block; border-radius: 8px;"></div>
                                    <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">
                                        QR Code para verificação
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-success" onclick="compensationManager.downloadCertificate('${certificateId}')">
                                <i class="fas fa-download"></i> Baixar Certificado
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    downloadCertificate(certificateId) {
        window.app.showNotification(`Baixando certificado ${certificateId}...`, 'info');
        
        // Simulate download
        setTimeout(() => {
            window.app.showNotification('Certificado baixado com sucesso!', 'success');
        }, 1000);
    }

    viewDetails(compensationId) {
        const compensation = this.compensationData.history.find(c => c.id === compensationId);
        if (compensation) {
            window.app.showNotification(`Visualizando detalhes da compensação ${compensationId}`, 'info');
        }
    }

    exportCompensationHistory() {
        window.app.showNotification('Exportando histórico de compensação...', 'info');
        
        // Simulate export
        setTimeout(() => {
            const data = this.compensationData.history.map(c => 
                `${c.date},${c.project},${c.type},${c.tokens},${c.emissions},${c.cost},${c.certificate},${c.status}`
            ).join('\n');
            
            const blob = new Blob(['Data,Projeto,Tipo,Tokens,CO₂ (kg),Custo,Certificado,Status\n' + data], 
                { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historico_compensacao_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.app.showNotification('Histórico exportado com sucesso!', 'success');
        }, 1000);
    }

    searchProjects() {
        const query = document.getElementById('search-projects').value.trim();
        if (!query) {
            window.app.showNotification('Digite um termo para buscar.', 'error');
            return;
        }
        
        const results = this.compensationData.availableProjects.filter(project => 
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description.toLowerCase().includes(query.toLowerCase()) ||
            project.type.toLowerCase().includes(query.toLowerCase())
        );
        
        window.app.showNotification(`Encontrados ${results.length} projetos.`, 'info');
    }

    formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }
}