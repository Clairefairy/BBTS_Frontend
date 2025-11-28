// Compensation functionality
class CompensationManager {
    constructor() {
        this.compensationData = {
            history: [
                {
                    id: 1,
                    date: '2023-06-05',
                    project: 'Reflorestamento Amazônia',
                    type: 'reforestation',
                    tokens: 3,
                    emissions: 850,
                    status: 'completed',
                    certificate: 'CER-2023-001',
                    cost: 98.25,
                    impact: '30 árvores plantadas'
                },
                {
                    id: 2,
                    date: '2023-04-12',
                    project: 'Fazenda Solar Nordeste',
                    type: 'solar',
                    tokens: 2,
                    emissions: 500,
                    status: 'completed',
                    certificate: 'CER-2023-002',
                    cost: 91.00,
                    impact: '500 kWh de energia limpa'
                },
                {
                    id: 3,
                    date: '2023-02-20',
                    project: 'Parque Eólico Sul',
                    type: 'wind',
                    tokens: 5,
                    emissions: 1250,
                    status: 'completed',
                    certificate: 'CER-2023-003',
                    cost: 191.00,
                    impact: '1250 kWh de energia eólica'
                }
            ],
            availableProjects: [
                {
                    id: 1,
                    name: 'Projeto Reflorestamento Amazônia',
                    type: 'reforestation',
                    description: 'Recuperação de áreas degradadas na Amazônia com espécies nativas',
                    costPerToken: 32.75,
                    availableTokens: 450,
                    impact: '1000 kg CO₂ por token | 10 árvores plantadas',
                    verified: true,
                    location: 'Amazonas, Brasil',
                    developer: 'Fundação Amazônia Sustentável'
                },
                {
                    id: 2,
                    name: 'Parque Eólico Nordeste',
                    type: 'wind',
                    description: 'Geração de energia limpa no Nordeste brasileiro',
                    costPerToken: 38.20,
                    availableTokens: 300,
                    impact: '1000 kg CO₂ por token | 250 kWh de energia limpa',
                    verified: true,
                    location: 'Rio Grande do Norte, Brasil',
                    developer: 'Eólica Brasil Energia'
                },
                {
                    id: 3,
                    name: 'Programa de Eficiência Energética',
                    type: 'efficiency',
                    description: 'Modernização de sistemas energéticos industriais',
                    costPerToken: 28.50,
                    availableTokens: 200,
                    impact: '800 kg CO₂ por token | 15% de eficiência',
                    verified: false,
                    location: 'São Paulo, Brasil',
                    developer: 'Instituto de Energia Sustentável'
                },
                {
                    id: 4,
                    name: 'Fazenda Solar Centro-Oeste',
                    type: 'solar',
                    description: 'Geração de energia solar fotovoltaica',
                    costPerToken: 45.50,
                    availableTokens: 600,
                    impact: '1000 kg CO₂ por token | 500 kWh de energia solar',
                    verified: true,
                    location: 'Goiás, Brasil',
                    developer: 'Solar Energy Brasil'
                }
            ]
        };
    }

    loadCompensationPage() {
        const pageElement = document.getElementById('compensation-page');
        if (pageElement) {
            pageElement.innerHTML = this.generateCompensationHTML();
            this.setupEventListeners();
        }
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
                                <select class="form-control" id="compensation-project" required>
                                    <option value="">Selecionar projeto...</option>
                                    ${this.compensationData.availableProjects.map(project => `
                                        <option value="${project.id}" data-cost="${project.costPerToken}" data-available="${project.availableTokens}">
                                            ${project.name} - R$ ${project.costPerToken}/token
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Quantidade de Tokens</label>
                                <input type="number" class="form-control" id="compensation-tokens" 
                                       min="1" max="100" required 
                                       onchange="compensationManager.calculateCompensation()">
                                <small class="form-text" id="tokens-available">Tokens disponíveis no projeto: 0</small>
                                <small class="form-text">Tokens disponíveis na sua carteira: ${window.tokenizationManager?.tokenData.balance || 0}</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Emissões a Compensar</label>
                                <input type="text" class="form-control" id="compensation-emissions" readonly>
                                <small class="form-text">1 token = 1000 kg CO₂</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Custo Total</label>
                                <input type="text" class="form-control" id="compensation-cost" readonly>
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
                        compensation.type === 'reforestation' ? 'badge-success' :
                        compensation.type === 'solar' ? 'badge-warning' : 
                        compensation.type === 'wind' ? 'badge-info' : 'badge-secondary'
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
                    <button class="btn btn-secondary btn-sm" onclick="compensationManager.viewDetails(${compensation.id})">
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
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span><i class="fas fa-building"></i> Desenvolvedor:</span>
                        <span style="font-size: 0.8rem; text-align: right;">${project.developer}</span>
                    </div>
                </div>
                
                <button class="btn btn-primary btn-block" 
                        onclick="compensationManager.selectProjectForCompensation(${project.id})"
                        ${project.availableTokens === 0 ? 'disabled' : ''}>
                    <i class="fas fa-leaf"></i> Selecionar Projeto
                </button>
            </div>
        `).join('');
    }

    getProjectTypeName(type) {
        const names = {
            solar: 'Energia Solar',
            wind: 'Energia Eólica',
            reforestation: 'Reflorestamento',
            efficiency: 'Eficiência Energética'
        };
        return names[type] || type;
    }

    getProjectIcon(type) {
        const icons = {
            solar: 'sun',
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

        const tokensInput = document.getElementById('compensation-tokens');
        const projectSelect = document.getElementById('compensation-project');
        const paymentSelect = document.getElementById('compensation-payment');
        
        if (tokensInput && projectSelect) {
            tokensInput.addEventListener('input', this.calculateCompensation.bind(this));
            projectSelect.addEventListener('change', this.updateProjectDetails.bind(this));
        }

        if (paymentSelect) {
            paymentSelect.addEventListener('change', this.togglePaymentDetails.bind(this));
        }
    }

    calculateCompensation() {
        const tokens = parseInt(document.getElementById('compensation-tokens').value) || 0;
        const projectSelect = document.getElementById('compensation-project');
        const selectedOption = projectSelect.options[projectSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const costPerToken = parseFloat(selectedOption.dataset.cost);
            const emissions = tokens * 1000; // 1 token = 1000 kg CO₂
            const totalCost = tokens * costPerToken;
            
            document.getElementById('compensation-emissions').value = 
                `-${this.formatNumber(emissions)} kg CO₂`;
            document.getElementById('compensation-cost').value = 
                `R$ ${this.formatCurrency(totalCost)}`;
        }
    }

    updateProjectDetails() {
        const projectSelect = document.getElementById('compensation-project');
        const selectedOption = projectSelect.options[projectSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const available = parseInt(selectedOption.dataset.available);
            document.getElementById('tokens-available').textContent = 
                `Tokens disponíveis no projeto: ${available}`;
            this.calculateCompensation();
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
    }

    hideCompensationModal() {
        document.getElementById('compensation-modal').classList.remove('active');
        document.getElementById('compensation-form').reset();
        document.getElementById('payment-details').style.display = 'none';
    }

    selectProjectForCompensation(projectId) {
        this.showCompensationModal();
        // Set the project in the select
        setTimeout(() => {
            document.getElementById('compensation-project').value = projectId;
            this.updateProjectDetails();
            this.calculateCompensation();
        }, 100);
    }

    async processCompensation() {
        const form = document.getElementById('compensation-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const projectId = parseInt(document.getElementById('compensation-project').value);
        const tokens = parseInt(document.getElementById('compensation-tokens').value);
        const paymentMethod = document.getElementById('compensation-payment').value;
        
        const project = this.compensationData.availableProjects.find(p => p.id === projectId);
        const availableTokens = window.tokenizationManager?.tokenData.balance || 0;

        if (paymentMethod === 'tokens' && tokens > availableTokens) {
            window.app.showNotification('Tokens insuficientes para compensação.', 'error');
            return;
        }

        if (tokens > project.availableTokens) {
            window.app.showNotification('Quantidade de tokens indisponível no projeto.', 'error');
            return;
        }

        try {
            window.app.showNotification('Processando compensação...', 'info');

            // Create compensation record
            const newCompensation = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                project: project.name,
                type: project.type,
                tokens: tokens,
                emissions: tokens * 1000,
                status: 'completed',
                certificate: `CER-${new Date().getFullYear()}-${String(this.compensationData.history.length + 1).padStart(3, '0')}`,
                cost: tokens * project.costPerToken,
                impact: this.generateImpactDescription(project.type, tokens)
            };

            this.compensationData.history.unshift(newCompensation);
            
            // Update token balance if using existing tokens
            if (paymentMethod === 'tokens' && window.tokenizationManager) {
                window.tokenizationManager.tokenData.balance -= tokens;
                
                // Add to token history
                window.tokenizationManager.tokenData.history.unshift({
                    date: new Date().toISOString().split('T')[0],
                    type: 'transfer',
                    amount: -tokens,
                    description: `Compensação - ${project.name}`,
                    status: 'completed',
                    hash: '0x' + Math.random().toString(16).substr(2, 16)
                });
            }

            // Update project availability
            project.availableTokens -= tokens;

            this.hideCompensationModal();
            window.app.showNotification(`Compensação de ${tokens * 1000} kg CO₂ realizada com sucesso!`, 'success');
            this.loadCompensationPage();
        } catch (error) {
            window.app.showNotification('Erro ao processar compensação.', 'error');
        }
    }

    generateImpactDescription(type, tokens) {
        const impacts = {
            solar: `${tokens * 500} kWh de energia solar gerada`,
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