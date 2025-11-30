// Tokenization functionality
class TokenizationManager {
    constructor() {
        this.apiBaseUrl = 'https://back-end-blockchain.onrender.com';
        this.tokenData = {
            balance: 15,
            totalValue: 600,
            history: [
                {
                    date: '2023-06-10',
                    type: 'emission',
                    amount: 5,
                    description: 'Créditos por energia solar',
                    status: 'minted',
                    hash: '0x1a2b3c4d5e6f7890'
                },
                {
                    date: '2023-05-15',
                    type: 'purchase',
                    amount: 10,
                    description: 'Compra inicial de créditos',
                    status: 'completed',
                    hash: '0x2b3c4d5e6f7890ab'
                },
                {
                    date: '2023-04-20',
                    type: 'transfer',
                    amount: -3,
                    description: 'Transferência para compensação',
                    status: 'completed',
                    hash: '0x3c4d5e6f7890abcd'
                },
                {
                    date: '2023-03-12',
                    type: 'emission',
                    amount: 3,
                    description: 'Créditos por eficiência energética',
                    status: 'minted',
                    hash: '0x4d5e6f7890abcdef'
                }
            ],
            projects: [
                {
                    id: 1,
                    name: 'Fazenda Solar Nordeste',
                    type: 'solar',
                    description: 'Geração de energia solar no Nordeste brasileiro',
                    tokensAvailable: 500,
                    pricePerToken: 45.50,
                    totalReduction: 500000,
                    verified: true,
                    location: 'Bahia, Brasil'
                },
                {
                    id: 2,
                    name: 'Projeto Reflorestamento Amazônia',
                    type: 'reforestation',
                    description: 'Recuperação de áreas degradadas na Amazônia',
                    tokensAvailable: 1200,
                    pricePerToken: 32.75,
                    totalReduction: 1200000,
                    verified: true,
                    location: 'Amazonas, Brasil'
                },
                {
                    id: 3,
                    name: 'Parque Eólico Sul',
                    type: 'wind',
                    description: 'Geração de energia eólica no Sul do Brasil',
                    tokensAvailable: 800,
                    pricePerToken: 38.20,
                    totalReduction: 800000,
                    verified: false,
                    location: 'Rio Grande do Sul, Brasil'
                },
                {
                    id: 4,
                    name: 'Programa de Eficiência Industrial',
                    type: 'efficiency',
                    description: 'Otimização de processos industriais',
                    tokensAvailable: 300,
                    pricePerToken: 28.90,
                    totalReduction: 300000,
                    verified: true,
                    location: 'São Paulo, Brasil'
                }
            ]
        };
    }

    async loadTokenizationPage() {
        const pageElement = document.getElementById('tokenization-page');
        if (pageElement) {
            // Mostrar loading
            pageElement.innerHTML = `
                <div class="page-title">
                    <h1>Tokenização de Créditos</h1>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Carregando...</h3>
                    </div>
                    <p><i class="fas fa-spinner fa-spin"></i> Buscando dados...</p>
                </div>
            `;

            // Carregar projetos, dados do usuário e transações da API
            await Promise.all([
                this.loadProjectsFromAPI(),
                this.loadUserTokenBalance(),
                this.loadTransactionHistory()
            ]);

            pageElement.innerHTML = this.generateTokenizationHTML();
            this.setupEventListeners();
        }
    }

    async loadUserTokenBalance() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.log('Usuário não logado');
                return;
            }

            const response = await this.apiCall(`/api/usuario/${userId}`, { method: 'GET' });
            
            if (response.ok) {
                const userData = await response.json();
                console.log('Dados do usuário carregados:', userData);
                
                // Atualizar saldo de tokens com saldoCompra
                this.tokenData.balance = userData.saldoCompra || 0;
            }
        } catch (error) {
            console.error('Erro ao carregar saldo do usuário:', error);
        }
    }

    async loadTransactionHistory() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.log('Usuário não logado para carregar histórico');
                return;
            }

            // Buscar transações e projetos em paralelo
            const [transacaoResponse, projetoResponse] = await Promise.all([
                this.apiCall('/api/transacao', { method: 'GET' }),
                this.apiCall('/api/projeto', { method: 'GET' })
            ]);

            if (!transacaoResponse.ok || !projetoResponse.ok) {
                console.error('Erro ao buscar transações ou projetos');
                return;
            }

            const transacoes = await transacaoResponse.json();
            const projetos = await projetoResponse.json();

            // Criar mapa de projetos para acesso rápido
            const projetosMap = {};
            projetos.forEach(p => {
                const id = p.id || p._id;
                projetosMap[id] = p.nome || 'Projeto';
            });

            // Filtrar transações do usuário atual
            const userTransactions = transacoes.filter(t => t.idUsuarioFK === userId);

            console.log('Transações do usuário:', userTransactions);

            // Mapear transações para o formato do histórico
            this.tokenData.history = userTransactions.map(t => {
                const tipo = t.tipotransacao || '';
                let quantidade = 0;
                
                // Calcular quantidade de tokens
                const co2 = t.quantidadeutilizada || 0;
                
                if (tipo === 'compensacao') {
                    // Compensação: negativo, arredondar para cima (cada 1000kg ou fração = 1 token)
                    quantidade = -Math.ceil(co2 / 1000);
                } else {
                    // Venda e Compra: positivo, descartar frações
                    quantidade = Math.floor(co2 / 1000);
                }

                // Converter tipo para exibição
                let tipoExibicao = 'outro';
                if (tipo === 'venda') {
                    tipoExibicao = 'emission'; // Venda = Emissão
                } else if (tipo === 'compra') {
                    tipoExibicao = 'purchase';
                } else if (tipo === 'compensacao') {
                    tipoExibicao = 'transfer';
                }

                // Obter nome do projeto
                const nomeProjeto = projetosMap[t.idProjetoFK] || 'Projeto não identificado';

                return {
                    date: t.datacompensacao ? t.datacompensacao.split('T')[0] : new Date().toISOString().split('T')[0],
                    type: tipoExibicao,
                    amount: quantidade,
                    project: nomeProjeto,
                    tipoOriginal: tipo
                };
            });

            console.log('Histórico de transações formatado:', this.tokenData.history);
        } catch (error) {
            console.error('Erro ao carregar histórico de transações:', error);
        }
    }

    getCurrentUserId() {
        const userData = localStorage.getItem('bbts_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id || user._id || user.idUsuario || user.userId;
        }
        return null;
    }

    async loadProjectsFromAPI() {
        try {
            const response = await this.apiCall('/api/projeto', { method: 'GET' });
            
            if (response.ok) {
                const projetos = await response.json();
                console.log('Projetos carregados da API:', projetos);
                
                // Mapear projetos da API para o formato usado no frontend
                this.tokenData.projects = projetos.map(p => ({
                    id: p.id || p._id,
                    name: p.nome || p.name,
                    type: p.tipo,
                    description: p.descricao,
                    tokensAvailable: p.saldoToken || 0,
                    pricePerToken: p.preco ? p.preco / 100 : 0, // Converter de centavos para reais
                    totalReduction: p.reducao || 0,
                    verified: p.status === 'verificado',
                    location: p.local || ''
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
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

    generateTokenizationHTML() {
        const totalValue = this.tokenData.balance * 45.50; // R$ 45,50 por token

        return `
            <div class="page-title">
                <h1>Tokenização de Créditos</h1>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="tokenizationManager.showNewProjectModal()">
                        <i class="fas fa-plus"></i> Cadastrar Novo Projeto
                    </button>
                    <button class="btn btn-primary" onclick="tokenizationManager.showIssueTokensModal()">
                        <i class="fas fa-coins"></i> Emitir Tokens
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="stat-value">${this.tokenData.balance}</div>
                    <div class="stat-label">Saldo de Tokens</div>
                    <div class="stat-subtitle">ERC-20</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="stat-value">${this.formatCurrency(totalValue)}</div>
                    <div class="stat-label">Valor Estimado</div>
                    <div class="stat-subtitle">Cotação atual</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tree"></i>
                    </div>
                    <div class="stat-value">${this.formatNumber(this.tokenData.balance * 1000)}</div>
                    <div class="stat-label">CO₂ Compensado (kg)</div>
                    <div class="stat-subtitle">Equivalente</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-value">+12%</div>
                    <div class="stat-label">Valorização</div>
                    <div class="stat-subtitle">Últimos 30 dias</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Histórico de Tokenização</h3>
                    <button class="btn btn-secondary" onclick="tokenizationManager.exportTokenHistory()">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Quantidade</th>
                            <th>Projeto Associado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateTokenHistoryHTML()}
                    </tbody>
                </table>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Mercado de Créditos</h3>
                </div>
                <div class="token-grid">
                    ${this.generateProjectsHTML()}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Informações do Token</h3>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Símbolo</label>
                        <input type="text" class="form-control" value="BBTS-CARBON" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Padrão</label>
                        <input type="text" class="form-control" value="ERC-20" readonly>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Contrato</label>
                        <input type="text" class="form-control" value="0x742d35Cc6634C0532925a3b8D4a2C3e8f6b5C3e8" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Decimais</label>
                        <input type="text" class="form-control" value="18" readonly>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Equivalência</label>
                    <input type="text" class="form-control" value="1 Token = 1000 kg CO₂ reduzidos" readonly>
                </div>
            </div>

            <!-- Issue Tokens Modal -->
            <div id="issue-tokens-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Emitir Novos Tokens</h3>
                        <button class="modal-close" onclick="tokenizationManager.hideIssueTokensModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="issue-tokens-form">
                            <div class="form-group">
                                <label class="form-label">Selecionar Projeto</label>
                                <select class="form-control" id="issue-project-select" required>
                                    <option value="">Selecionar projeto...</option>
                                    ${this.tokenData.projects.map(project => `
                                        <option value="${project.id}">${project.name}</option>
                                    `).join('')}
                                </select>
                                <a href="#" onclick="tokenizationManager.switchToNewProjectModal(); return false;" 
                                   style="display: block; margin-top: 8px; color: var(--bb-blue); font-size: 0.9rem;">
                                    <i class="fas fa-plus-circle"></i> ... Ou cadastre um novo projeto
                                </a>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Redução de Emissões (kg CO₂)</label>
                                <input type="number" class="form-control" id="emission-reduction" min="0" step="1" required placeholder="Ex: 5000" oninput="tokenizationManager.convertCO2ToTokens()">
                                <small class="form-text">Para cada 1000 kg CO₂ = 1 token</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Quantidade de Tokens</label>
                                <input type="number" class="form-control" id="token-amount" min="1" required placeholder="Ex: 5" oninput="tokenizationManager.convertTokensToCO2()">
                                <small class="form-text">Para cada 1 token = 1000 kg CO₂</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Documentação</label>
                                <input type="file" class="form-control" id="project-docs" accept=".pdf,.doc,.docx,.jpg,.png">
                                <small class="form-text">Upload de relatórios de verificação (opcional)</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="tokenizationManager.issueTokens()" id="issue-tokens-btn">
                            <i class="fas fa-coins"></i> Emitir Tokens
                        </button>
                    </div>
                </div>
            </div>

            <!-- Buy Tokens Modal -->
            <div id="buy-tokens-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Comprar Tokens</h3>
                        <button class="modal-close" onclick="tokenizationManager.hideBuyTokensModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="buy-project-info" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 id="buy-project-name" style="margin: 0 0 10px 0;"></h4>
                            <p style="margin: 0; color: #666;">
                                <span>Preço por token: </span>
                                <strong id="buy-project-price"></strong>
                            </p>
                            <p style="margin: 5px 0 0 0; color: #666;">
                                <span>Tokens disponíveis: </span>
                                <strong id="buy-project-available"></strong>
                            </p>
                        </div>
                        
                        <form id="buy-tokens-form">
                            <input type="hidden" id="buy-project-id">
                            <input type="hidden" id="buy-project-price-value">
                            
                            <div class="form-group">
                                <label class="form-label">Quantidade de Tokens</label>
                                <input type="number" class="form-control" id="purchase-amount" min="1" required placeholder="Ex: 5">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Valor Total</label>
                                <input type="text" class="form-control" id="purchase-total" readonly style="font-size: 1.2rem; font-weight: bold; color: var(--bb-green);">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Método de Pagamento</label>
                                <select class="form-control" id="payment-method" required>
                                    <option value="">Selecionar método...</option>
                                    <option value="crypto">Criptomoeda (ETH)</option>
                                    <option value="pix">PIX</option>
                                    <option value="card">Cartão de Crédito</option>
                                    <option value="transfer">Transferência Bancária</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="tokenizationManager.hideBuyTokensModal()">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-success" onclick="tokenizationManager.buyTokens()" id="buy-tokens-btn">
                            <i class="fas fa-shopping-cart"></i> Confirmar Compra
                        </button>
                    </div>
                </div>
            </div>

            <!-- New Project Modal -->
            <div id="new-project-modal" class="modal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Cadastrar Novo Projeto</h3>
                        <button class="modal-close" onclick="tokenizationManager.hideNewProjectModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="new-project-form">
                            <div class="form-group">
                                <label class="form-label">Nome do Projeto</label>
                                <input type="text" class="form-control" id="new-project-name" required placeholder="Ex: Fazenda Solar Minas Gerais">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-control" id="new-project-type" required>
                                    <option value="">Selecionar tipo...</option>
                                    <option value="solar">Energia Solar</option>
                                    <option value="eolica">Energia Eólica</option>
                                    <option value="reflorestamento">Reflorestamento</option>
                                    <option value="eficiencia">Eficiência Energética</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Descrição</label>
                                <textarea class="form-control" id="new-project-description" rows="3" required placeholder="Descreva o projeto..."></textarea>
                            </div>
                            
                            <div class="form-row" style="display: flex; gap: 15px;">
                                <div class="form-group" style="flex: 1;">
                                    <label class="form-label">Redução (kg CO₂)</label>
                                    <input type="number" class="form-control" id="new-project-reduction" min="0" required placeholder="Ex: 50000">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label class="form-label">Saldo de Tokens</label>
                                    <input type="number" class="form-control" id="new-project-tokens" min="0" required placeholder="Ex: 500">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Local</label>
                                <input type="text" class="form-control" id="new-project-location" required placeholder="Ex: Bahia, Brasil">
                            </div>
                            
                            <div class="form-row" style="display: flex; gap: 15px;">
                                <div class="form-group" style="flex: 1;">
                                    <label class="form-label">Preço do Token (R$)</label>
                                    <input type="text" class="form-control" id="new-project-price" required placeholder="Ex: 45,50">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label class="form-label">Status</label>
                                    <select class="form-control" id="new-project-status" required>
                                        <option value="">Selecionar status...</option>
                                        <option value="verificado">Verificado</option>
                                        <option value="pendente">Pendente</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="tokenizationManager.hideNewProjectModal()">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="tokenizationManager.saveNewProject()" id="save-project-btn">
                            <i class="fas fa-save"></i> Salvar Projeto
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateTokenHistoryHTML() {
        if (this.tokenData.history.length === 0) {
            return `
                <tr>
                    <td colspan="4" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-coins"></i>
                            <p>Nenhuma transação de tokens</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.tokenData.history.map(transaction => `
            <tr>
                <td>${this.formatDate(transaction.date)}</td>
                <td>
                    <span class="badge ${
                        transaction.type === 'emission' ? 'badge-success' :
                        transaction.type === 'purchase' ? 'badge-info' : 'badge-warning'
                    }">
                        ${transaction.type === 'emission' ? 'Emissão' :
                          transaction.type === 'purchase' ? 'Compra' : 'Compensação'}
                    </span>
                </td>
                <td class="${transaction.amount > 0 ? 'text-success' : 'text-danger'}">
                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
                </td>
                <td>${transaction.project || '-'}</td>
            </tr>
        `).join('');
    }

    generateProjectsHTML() {
        if (this.tokenData.projects.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; color: #ccc;"></i>
                    <p style="font-size: 1.1rem; margin-bottom: 15px;">Nenhum projeto disponível no momento.</p>
                    <button class="btn btn-primary" onclick="tokenizationManager.showNewProjectModal()">
                        <i class="fas fa-plus"></i> Cadastrar Primeiro Projeto
                    </button>
                </div>
            `;
        }

        return this.tokenData.projects.map(project => `
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
                        <span>${project.tokensAvailable.toLocaleString()} tokens</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><i class="fas fa-dollar-sign"></i> Preço:</span>
                        <span>R$ ${project.pricePerToken.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><i class="fas fa-leaf"></i> Redução:</span>
                        <span>${this.formatNumber(project.totalReduction)} kg CO₂</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span><i class="fas fa-map-marker-alt"></i> Local:</span>
                        <span>${project.location}</span>
                    </div>
                </div>
                
                <div class="token-value" style="font-size: 1.5rem; text-align: center; margin: 15px 0; color: ${project.tokensAvailable > 0 ? 'var(--bb-green)' : 'var(--bb-red)'}">
                    ${project.tokensAvailable > 0 ? 'Disponível' : 'Esgotado'}
                </div>
                
                <button class="btn btn-primary btn-block" 
                        onclick="tokenizationManager.selectProject('${project.id}')"
                        ${project.tokensAvailable === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i> Comprar Tokens
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
            // Manter compatibilidade com valores antigos
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
            // Manter compatibilidade com valores antigos
            wind: 'wind',
            reforestation: 'tree',
            efficiency: 'bolt'
        };
        return icons[type] || 'leaf';
    }

    setupEventListeners() {
        // Purchase amount calculation
        const purchaseAmount = document.getElementById('purchase-amount');
        const selectedProject = document.getElementById('selected-project');
        
        if (purchaseAmount && selectedProject) {
            purchaseAmount.addEventListener('input', this.calculatePurchaseTotal.bind(this));
            selectedProject.addEventListener('change', this.updateAvailableTokens.bind(this));
        }
    }

    calculatePurchaseTotal() {
        const amount = parseInt(document.getElementById('purchase-amount').value) || 0;
        const price = parseFloat(document.getElementById('buy-project-price-value').value) || 0;
        
        if (amount > 0 && price > 0) {
            const total = amount * price;
            document.getElementById('purchase-total').value = 
                `R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        } else {
            document.getElementById('purchase-total').value = '';
        }
    }

    updateAvailableTokens() {
        const projectSelect = document.getElementById('selected-project');
        const selectedOption = projectSelect.options[projectSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const available = parseInt(selectedOption.dataset.available);
            document.getElementById('available-tokens').textContent = 
                `Tokens disponíveis: ${available}`;
        }
    }

    showIssueTokensModal() {
        document.getElementById('issue-tokens-modal').classList.add('active');
    }

    hideIssueTokensModal() {
        document.getElementById('issue-tokens-modal').classList.remove('active');
        document.getElementById('issue-tokens-form').reset();
    }

    convertCO2ToTokens() {
        const co2Input = document.getElementById('emission-reduction');
        const tokensInput = document.getElementById('token-amount');
        
        const co2Value = parseInt(co2Input.value) || 0;
        
        if (co2Value > 0) {
            // Para cada 1000 kg CO₂ = 1 token (arredondar para baixo)
            const tokens = Math.floor(co2Value / 1000);
            tokensInput.value = tokens > 0 ? tokens : '';
        }
    }

    convertTokensToCO2() {
        const co2Input = document.getElementById('emission-reduction');
        const tokensInput = document.getElementById('token-amount');
        
        const tokensValue = parseInt(tokensInput.value) || 0;
        
        if (tokensValue > 0) {
            // Para cada 1 token = 1000 kg CO₂
            const co2 = tokensValue * 1000;
            co2Input.value = co2;
        }
    }

    switchToNewProjectModal() {
        this.hideIssueTokensModal();
        this.showNewProjectModal();
    }

    showBuyTokensModal() {
        document.getElementById('buy-tokens-modal').classList.add('active');
    }

    hideBuyTokensModal() {
        document.getElementById('buy-tokens-modal').classList.remove('active');
        document.getElementById('buy-tokens-form').reset();
    }

    showNewProjectModal() {
        document.getElementById('new-project-modal').classList.add('active');
        
        // Configurar máscara de preço
        const priceInput = document.getElementById('new-project-price');
        if (priceInput) {
            priceInput.addEventListener('input', this.formatPriceInput.bind(this));
        }
    }

    hideNewProjectModal() {
        document.getElementById('new-project-modal').classList.remove('active');
        document.getElementById('new-project-form').reset();
    }

    formatPriceInput(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (value.length > 0) {
            // Adiciona zeros à esquerda se necessário
            value = value.padStart(3, '0');
            
            // Separa centavos
            const cents = value.slice(-2);
            const reais = value.slice(0, -2).replace(/^0+/, '') || '0';
            
            // Formata com separador de milhar
            const formattedReais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            
            e.target.value = `${formattedReais},${cents}`;
        }
    }

    async saveNewProject() {
        const form = document.getElementById('new-project-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Pegar valores
        const nome = document.getElementById('new-project-name').value.trim();
        const tipo = document.getElementById('new-project-type').value;
        const descricao = document.getElementById('new-project-description').value.trim();
        const reducao = parseInt(document.getElementById('new-project-reduction').value) || 0;
        const saldoToken = parseInt(document.getElementById('new-project-tokens').value) || 0;
        const local = document.getElementById('new-project-location').value.trim();
        const status = document.getElementById('new-project-status').value;
        
        // Converter preço: remover pontos e vírgulas, pegar apenas dígitos
        const precoStr = document.getElementById('new-project-price').value;
        const preco = parseInt(precoStr.replace(/\D/g, '')) || 0;

        // Validações
        if (!nome || !tipo || !descricao || !local || !status || preco === 0) {
            window.app.showNotification('Preencha todos os campos corretamente.', 'error');
            return;
        }

        // Feedback visual
        const saveBtn = document.getElementById('save-project-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            const requestBody = {
                nome: nome,
                tipo: tipo,
                descricao: descricao,
                reducao: reducao,
                saldoToken: saldoToken,
                local: local,
                preco: preco,
                status: status
            };

            console.log('Enviando projeto para API:', requestBody);

            const response = await this.apiCall('/api/projeto', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log('Resposta da API (status:', response.status, '):', responseText);

            let responseData = {};
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.log('Resposta não é JSON:', responseText);
            }

            if (response.ok) {
                this.hideNewProjectModal();
                window.app.showNotification('Projeto cadastrado com sucesso!', 'success');
                await this.loadTokenizationPage();
            } else {
                const errorMessage = responseData.message || responseData.error || responseData.erro || 'Erro ao cadastrar projeto.';
                window.app.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            window.app.showNotification('Erro ao salvar projeto. Verifique sua conexão.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    async issueTokens() {
        const form = document.getElementById('issue-tokens-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const projectId = document.getElementById('issue-project-select').value;
        const additionalReduction = parseInt(document.getElementById('emission-reduction').value) || 0;
        const additionalTokens = parseInt(document.getElementById('token-amount').value) || 0;

        if (!projectId) {
            window.app.showNotification('Por favor, selecione um projeto.', 'error');
            return;
        }

        if (additionalReduction <= 0 && additionalTokens <= 0) {
            window.app.showNotification('Informe a redução de emissões ou quantidade de tokens.', 'error');
            return;
        }

        // Encontrar o projeto selecionado (para pegar o nome)
        const projectLocal = this.tokenData.projects.find(p => p.id === projectId);
        const projectName = projectLocal ? projectLocal.name : 'Projeto';

        // Feedback visual
        const issueBtn = document.getElementById('issue-tokens-btn');
        const originalText = issueBtn.innerHTML;
        issueBtn.disabled = true;
        issueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Emitindo...';

        try {
            // Buscar dados atuais do projeto da API para garantir valores corretos
            const getResponse = await this.apiCall(`/api/projeto/${projectId}`, { method: 'GET' });
            
            if (!getResponse.ok) {
                window.app.showNotification('Erro ao buscar dados do projeto.', 'error');
                issueBtn.disabled = false;
                issueBtn.innerHTML = originalText;
                return;
            }

            const projetoAtual = await getResponse.json();
            console.log('Projeto atual da API:', projetoAtual);

            // Calcular novos valores (adicionar aos existentes da API)
            const reducaoAtual = projetoAtual.reducao || 0;
            const saldoTokenAtual = projetoAtual.saldoToken || 0;
            
            const novaReducao = reducaoAtual + additionalReduction;
            const novoSaldoToken = saldoTokenAtual + additionalTokens;

            console.log(`Saldo atual: ${saldoTokenAtual}, Adicionando: ${additionalTokens}, Novo saldo: ${novoSaldoToken}`);

            const requestBody = {
                reducao: novaReducao,
                saldoToken: novoSaldoToken
            };

            console.log('Atualizando projeto com novos tokens:', requestBody);

            const response = await this.apiCall(`/api/projeto/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log('Resposta da API (status:', response.status, '):', responseText);

            if (response.ok) {
                // Registrar transação na API
                await this.registerTokenTransaction(projectId, additionalReduction);

                // Adicionar ao histórico local
                this.tokenData.history.unshift({
                    date: new Date().toISOString().split('T')[0],
                    type: 'emission',
                    amount: additionalTokens,
                    description: `Tokens emitidos - ${projectName}`,
                    status: 'minted',
                    hash: '0x' + Math.random().toString(16).substr(2, 16)
                });

                // Atualizar saldo local
                this.tokenData.balance += additionalTokens;

                this.hideIssueTokensModal();
                window.app.showNotification(`${additionalTokens} tokens emitidos com sucesso para ${projectName}!`, 'success');
                await this.loadTokenizationPage();
            } else {
                let responseData = {};
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {}
                const errorMessage = responseData.message || responseData.error || 'Erro ao emitir tokens.';
                window.app.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro ao emitir tokens:', error);
            window.app.showNotification('Erro ao emitir tokens. Verifique sua conexão.', 'error');
        } finally {
            issueBtn.disabled = false;
            issueBtn.innerHTML = originalText;
        }
    }

    async registerTokenTransaction(projectId, reducaoEmissoes) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.error('Usuário não encontrado para registrar transação');
                return;
            }

            // Buscar emissões do usuário para encontrar uma com quantidadeCo2 <= 0.5
            const emissaoResponse = await this.apiCall('/api/emissao', { method: 'GET' });
            
            if (!emissaoResponse.ok) {
                console.error('Erro ao buscar emissões');
                return;
            }

            const emissoes = await emissaoResponse.json();
            
            // Filtrar emissões do usuário e encontrar a primeira com quantidadeCo2 <= 0.5
            const emissaoEncontrada = emissoes.find(e => 
                e.idUsuarioFK === userId && (e.quantidadeCo2 || 0) <= 0.5
            );

            if (!emissaoEncontrada) {
                console.log('Nenhuma emissão encontrada com quantidadeCo2 <= 0.5');
                // Continuar sem idEmissaoFK se não encontrar
            }

            const emissaoId = emissaoEncontrada ? (emissaoEncontrada.id || emissaoEncontrada._id) : null;

            // Criar transação
            const transacaoBody = {};
            transacaoBody.idProjetoFK = projectId;
            transacaoBody.idUsuarioFK = userId;
            transacaoBody.quantidadeutilizada = reducaoEmissoes;
            transacaoBody.datacompensacao = new Date().toISOString();
            transacaoBody.tipotransacao = 'venda';
            
            if (emissaoId) {
                transacaoBody.idEmissaoFK = emissaoId;
            }

            console.log('Registrando transação de compra:', transacaoBody);

            const transacaoResponse = await fetch(`${this.apiBaseUrl}/api/transacao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('bbts_token')}`
                },
                body: JSON.stringify(transacaoBody)
            });

            if (transacaoResponse.ok) {
                console.log('Transação de venda registrada com sucesso');
            } else {
                const errorData = await transacaoResponse.json().catch(() => ({}));
                console.error('Erro ao registrar transação:', errorData);
            }
        } catch (error) {
            console.error('Erro ao registrar transação de venda:', error);
        }
    }

    async registerBuyTransaction(projectId, quantidadeTokens) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.error('Usuário não encontrado para registrar transação');
                return;
            }

            // Buscar emissões do usuário para encontrar uma com quantidadeCo2 <= 0.5
            const emissaoResponse = await this.apiCall('/api/emissao', { method: 'GET' });
            
            if (!emissaoResponse.ok) {
                console.error('Erro ao buscar emissões');
                return;
            }

            const emissoes = await emissaoResponse.json();
            
            // Filtrar emissões do usuário e encontrar a primeira com quantidadeCo2 <= 0.5
            const emissaoEncontrada = emissoes.find(e => 
                e.idUsuarioFK === userId && (e.quantidadeCo2 || 0) <= 0.5
            );

            if (!emissaoEncontrada) {
                console.log('Nenhuma emissão encontrada com quantidadeCo2 <= 0.5');
            }

            const emissaoId = emissaoEncontrada ? (emissaoEncontrada.id || emissaoEncontrada._id) : null;

            // Calcular quantidade utilizada (tokens * 1000 kg CO2 por token)
            const quantidadeUtilizada = quantidadeTokens * 1000;

            // Criar transação
            const transacaoBody = {};
            transacaoBody.idProjetoFK = projectId;
            transacaoBody.idUsuarioFK = userId;
            transacaoBody.quantidadeutilizada = quantidadeUtilizada;
            transacaoBody.datacompensacao = new Date().toISOString();
            transacaoBody.tipotransacao = 'compra';
            
            if (emissaoId) {
                transacaoBody.idEmissaoFK = emissaoId;
            }

            console.log('Registrando transação de compra:', transacaoBody);

            const transacaoResponse = await fetch(`${this.apiBaseUrl}/api/transacao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('bbts_token')}`
                },
                body: JSON.stringify(transacaoBody)
            });

            if (transacaoResponse.ok) {
                console.log('Transação de compra registrada com sucesso');
            } else {
                const errorData = await transacaoResponse.json().catch(() => ({}));
                console.error('Erro ao registrar transação de compra:', errorData);
            }
        } catch (error) {
            console.error('Erro ao registrar transação de compra:', error);
        }
    }

    async buyTokens() {
        const form = document.getElementById('buy-tokens-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const projectId = document.getElementById('buy-project-id').value;
        const amount = parseInt(document.getElementById('purchase-amount').value) || 0;
        const paymentMethod = document.getElementById('payment-method').value;
        const availableTokens = parseInt(document.getElementById('buy-project-available').textContent) || 0;
        const projectName = document.getElementById('buy-project-name').textContent;

        // Validações
        if (!projectId) {
            window.app.showNotification('Projeto não identificado.', 'error');
            return;
        }

        if (amount <= 0) {
            window.app.showNotification('Informe uma quantidade válida.', 'error');
            return;
        }

        if (amount > availableTokens) {
            window.app.showNotification(`Quantidade indisponível. Máximo: ${availableTokens} tokens.`, 'error');
            return;
        }

        if (!paymentMethod) {
            window.app.showNotification('Selecione um método de pagamento.', 'error');
            return;
        }

        // Feedback visual
        const buyBtn = document.getElementById('buy-tokens-btn');
        const originalText = buyBtn.innerHTML;
        buyBtn.disabled = true;
        buyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                window.app.showNotification('Usuário não identificado. Faça login novamente.', 'error');
                buyBtn.disabled = false;
                buyBtn.innerHTML = originalText;
                return;
            }

            // 1. Buscar dados atuais do projeto
            const projetoResponse = await this.apiCall(`/api/projeto/${projectId}`, { method: 'GET' });
            if (!projetoResponse.ok) {
                throw new Error('Erro ao buscar dados do projeto');
            }
            const projetoAtual = await projetoResponse.json();
            
            // 2. Buscar dados atuais do usuário
            const usuarioResponse = await this.apiCall(`/api/usuario/${userId}`, { method: 'GET' });
            if (!usuarioResponse.ok) {
                throw new Error('Erro ao buscar dados do usuário');
            }
            const usuarioAtual = await usuarioResponse.json();

            // 3. Calcular novos valores
            const novoSaldoTokenProjeto = (projetoAtual.saldoToken || 0) - amount;
            const novoSaldoCompraUsuario = (usuarioAtual.saldoCompra || 0) + amount;

            console.log(`Projeto: ${projetoAtual.saldoToken} - ${amount} = ${novoSaldoTokenProjeto}`);
            console.log(`Usuário: ${usuarioAtual.saldoCompra} + ${amount} = ${novoSaldoCompraUsuario}`);

            // 4. Atualizar projeto na API (subtrair tokens)
            const updateProjetoResponse = await this.apiCall(`/api/projeto/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify({ saldoToken: novoSaldoTokenProjeto })
            });

            if (!updateProjetoResponse.ok) {
                throw new Error('Erro ao atualizar projeto');
            }

            // 5. Atualizar usuário na API (adicionar ao saldoCompra)
            const updateUsuarioResponse = await this.apiCall(`/api/usuario/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ saldoCompra: novoSaldoCompraUsuario })
            });

            if (!updateUsuarioResponse.ok) {
                throw new Error('Erro ao atualizar saldo do usuário');
            }

            // Registrar transação na API
            await this.registerBuyTransaction(projectId, amount);

            // Sucesso!
            this.hideBuyTokensModal();
            window.app.showNotification(`Compra de ${amount} tokens de "${projectName}" realizada com sucesso!`, 'success');
            
            // Recarregar a página para mostrar os novos dados
            await this.loadTokenizationPage();

        } catch (error) {
            console.error('Erro ao processar compra:', error);
            window.app.showNotification('Erro ao processar compra. Tente novamente.', 'error');
        } finally {
            buyBtn.disabled = false;
            buyBtn.innerHTML = originalText;
        }
    }

    selectProject(projectId) {
        // Encontrar o projeto
        const project = this.tokenData.projects.find(p => p.id === projectId || p.id === String(projectId));
        
        if (!project) {
            window.app.showNotification('Projeto não encontrado.', 'error');
            return;
        }

        // Preencher informações do projeto no modal
        document.getElementById('buy-project-id').value = project.id;
        document.getElementById('buy-project-price-value').value = project.pricePerToken;
        document.getElementById('buy-project-name').textContent = project.name;
        document.getElementById('buy-project-price').textContent = `R$ ${project.pricePerToken.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('buy-project-available').textContent = project.tokensAvailable;
        
        // Limpar campos
        document.getElementById('purchase-amount').value = '';
        document.getElementById('purchase-amount').max = project.tokensAvailable;
        document.getElementById('purchase-total').value = '';
        document.getElementById('payment-method').value = '';
        
        // Adicionar listener para calcular valor total
        const purchaseAmountInput = document.getElementById('purchase-amount');
        purchaseAmountInput.oninput = () => this.calculatePurchaseTotal();
        
        this.showBuyTokensModal();
    }

    exportTokenHistory() {
        window.app.showNotification('Exportando histórico de tokens...', 'info');
        
        // Simulate export
        setTimeout(() => {
            const data = this.tokenData.history.map(t => 
                `${t.date},${t.type},${t.amount},${t.description},${t.status}`
            ).join('\n');
            
            const blob = new Blob(['Data,Tipo,Quantidade,Descrição,Status\n' + data], 
                { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historico_tokens_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.app.showNotification('Histórico exportado com sucesso!', 'success');
        }, 1000);
    }

    viewTokenTransaction(hash) {
        window.app.showNotification(`Visualizando transação ${hash}`, 'info');
        // Implementation would show transaction details
    }

    formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }
}