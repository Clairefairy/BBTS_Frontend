// Tokenization functionality
class TokenizationManager {
    constructor() {
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

    loadTokenizationPage() {
        const pageElement = document.getElementById('tokenization-page');
        if (pageElement) {
            pageElement.innerHTML = this.generateTokenizationHTML();
            this.setupEventListeners();
        }
    }

    generateTokenizationHTML() {
        const totalValue = this.tokenData.balance * 40; // Assuming 40 per token

        return `
            <div class="page-title">
                <h1>Tokenização de Créditos</h1>
                <button class="btn btn-primary" onclick="tokenizationManager.showIssueTokensModal()">
                    <i class="fas fa-plus"></i> Emitir Tokens
                </button>
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
                    <div class="stat-value">R$ ${this.formatCurrency(totalValue)}</div>
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
                            <th>Descrição</th>
                            <th>Status</th>
                            <th>Hash</th>
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
                    <button class="btn btn-primary" onclick="tokenizationManager.showBuyTokensModal()">
                        <i class="fas fa-shopping-cart"></i> Comprar Tokens
                    </button>
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
                                <label class="form-label">Tipo de Projeto</label>
                                <select class="form-control" id="project-type" required>
                                    <option value="">Selecionar tipo...</option>
                                    <option value="solar">Energia Solar</option>
                                    <option value="wind">Energia Eólica</option>
                                    <option value="reforestation">Reflorestamento</option>
                                    <option value="efficiency">Eficiência Energética</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Nome do Projeto</label>
                                <input type="text" class="form-control" id="project-name" required placeholder="Ex: Fazenda Solar Minas Gerais">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Redução de Emissões (kg CO₂)</label>
                                <input type="number" class="form-control" id="emission-reduction" min="0" step="0.01" required placeholder="Ex: 5000">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Quantidade de Tokens</label>
                                <input type="number" class="form-control" id="token-amount" min="1" max="1000" required>
                                <small class="form-text">1 token = 1000 kg CO₂ reduzidos</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Documentação</label>
                                <input type="file" class="form-control" id="project-docs" accept=".pdf,.doc,.docx,.jpg,.png">
                                <small class="form-text">Upload de relatórios de verificação (opcional)</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="tokenizationManager.issueTokens()">
                            <i class="fas fa-coins"></i> Emitir Tokens
                        </button>
                    </div>
                </div>
            </div>

            <!-- Buy Tokens Modal -->
            <div id="buy-tokens-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Comprar Créditos de Carbono</h3>
                        <button class="modal-close" onclick="tokenizationManager.hideBuyTokensModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="buy-tokens-form">
                            <div class="form-group">
                                <label class="form-label">Projeto</label>
                                <select class="form-control" id="selected-project" required>
                                    <option value="">Selecionar projeto...</option>
                                    ${this.tokenData.projects.map(project => `
                                        <option value="${project.id}" data-price="${project.pricePerToken}" data-available="${project.tokensAvailable}">
                                            ${project.name} - R$ ${project.pricePerToken}/token
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Quantidade de Tokens</label>
                                <input type="number" class="form-control" id="purchase-amount" min="1" max="100" required>
                                <small class="form-text" id="available-tokens">Tokens disponíveis: 0</small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Valor Total</label>
                                <input type="text" class="form-control" id="purchase-total" readonly>
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
                        <button type="button" class="btn btn-success" onclick="tokenizationManager.buyTokens()">
                            <i class="fas fa-shopping-cart"></i> Comprar Tokens
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
                    <td colspan="6" class="text-center">
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
                          transaction.type === 'purchase' ? 'Compra' : 'Transferência'}
                    </span>
                </td>
                <td class="${transaction.amount > 0 ? 'text-success' : 'text-danger'}">
                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
                </td>
                <td>${transaction.description}</td>
                <td>
                    <span class="badge badge-${transaction.status === 'completed' || transaction.status === 'minted' ? 'success' : 'warning'}">
                        ${transaction.status === 'completed' ? 'Concluído' :
                          transaction.status === 'minted' ? 'Cunhado' : 'Pendente'}
                    </span>
                </td>
                <td>
                    <a href="#" class="transaction-hash" onclick="tokenizationManager.viewTokenTransaction('${transaction.hash}')">
                        0x${transaction.hash}...
                    </a>
                </td>
            </tr>
        `).join('');
    }

    generateProjectsHTML() {
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
                        onclick="tokenizationManager.selectProject(${project.id})"
                        ${project.tokensAvailable === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i> Comprar Tokens
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
        const projectSelect = document.getElementById('selected-project');
        const selectedOption = projectSelect.options[projectSelect.selectedIndex];
        
        if (selectedOption && selectedOption.value) {
            const price = parseFloat(selectedOption.dataset.price);
            const total = amount * price;
            document.getElementById('purchase-total').value = 
                `R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
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

    showBuyTokensModal() {
        document.getElementById('buy-tokens-modal').classList.add('active');
    }

    hideBuyTokensModal() {
        document.getElementById('buy-tokens-modal').classList.remove('active');
        document.getElementById('buy-tokens-form').reset();
    }

    async issueTokens() {
        const form = document.getElementById('issue-tokens-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        try {
            window.app.showNotification('Emitindo tokens na blockchain...', 'info');

            const amount = parseInt(document.getElementById('token-amount').value);
            const projectName = document.getElementById('project-name').value;
            const projectType = document.getElementById('project-type').value;
            
            // Add to history
            this.tokenData.history.unshift({
                date: new Date().toISOString().split('T')[0],
                type: 'emission',
                amount: amount,
                description: `Tokens emitidos - ${projectName}`,
                status: 'minted',
                hash: '0x' + Math.random().toString(16).substr(2, 16)
            });

            // Update balance
            this.tokenData.balance += amount;

            this.hideIssueTokensModal();
            window.app.showNotification(`${amount} tokens emitidos com sucesso!`, 'success');
            this.loadTokenizationPage();
        } catch (error) {
            window.app.showNotification('Erro ao emitir tokens.', 'error');
        }
    }

    async buyTokens() {
        const form = document.getElementById('buy-tokens-form');
        if (!form.checkValidity()) {
            window.app.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        try {
            window.app.showNotification('Processando compra de tokens...', 'info');

            const projectId = parseInt(document.getElementById('selected-project').value);
            const amount = parseInt(document.getElementById('purchase-amount').value);
            const project = this.tokenData.projects.find(p => p.id === projectId);
            
            if (!project) {
                window.app.showNotification('Projeto não encontrado.', 'error');
                return;
            }

            if (amount > project.tokensAvailable) {
                window.app.showNotification('Quantidade solicitada indisponível.', 'error');
                return;
            }

            // Add to history
            this.tokenData.history.unshift({
                date: new Date().toISOString().split('T')[0],
                type: 'purchase',
                amount: amount,
                description: `Compra de tokens - ${project.name}`,
                status: 'completed',
                hash: '0x' + Math.random().toString(16).substr(2, 16)
            });

            // Update balance and project availability
            this.tokenData.balance += amount;
            project.tokensAvailable -= amount;

            this.hideBuyTokensModal();
            window.app.showNotification(`Compra de ${amount} tokens realizada com sucesso!`, 'success');
            this.loadTokenizationPage();
        } catch (error) {
            window.app.showNotification('Erro ao processar compra.', 'error');
        }
    }

    selectProject(projectId) {
        this.showBuyTokensModal();
        // Set the project in the select
        setTimeout(() => {
            document.getElementById('selected-project').value = projectId;
            this.updateAvailableTokens();
            this.calculatePurchaseTotal();
        }, 100);
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