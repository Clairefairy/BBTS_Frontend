// Blockchain Registry functionality
class BlockchainManager {
    constructor() {
        this.registryData = [];
        this.loadRegistryData();
    }

    loadRegistryData() {
        // Simulate blockchain registry data
        this.registryData = [
            {
                hash: '0x1a2b3c4d5e6f7890abcdef1234567890',
                date: '2023-06-15',
                type: 'energy',
                description: 'Emissões de energia - Junho',
                emissions: 1250,
                status: 'confirmed',
                block: 17543210,
                gasUsed: 21000,
                timestamp: '2023-06-15T14:30:00Z'
            },
            {
                hash: '0x2b3c4d5e6f7890abcdef12345678901',
                date: '2023-05-15',
                type: 'energy',
                description: 'Emissões de energia - Maio',
                emissions: 1150,
                status: 'confirmed',
                block: 17432109,
                gasUsed: 21000,
                timestamp: '2023-05-15T13:25:00Z'
            },
            {
                hash: '0x3c4d5e6f7890abcdef123456789012',
                date: '2023-06-10',
                type: 'fleet',
                description: 'Emissões da frota - Junho',
                emissions: 2180,
                status: 'pending',
                block: null,
                gasUsed: null,
                timestamp: '2023-06-10T09:15:00Z'
            },
            {
                hash: '0x4d5e6f7890abcdef1234567890123',
                date: '2023-04-20',
                type: 'compensation',
                description: 'Compensação via reflorestamento',
                emissions: -850,
                status: 'confirmed',
                block: 17321098,
                gasUsed: 45000,
                timestamp: '2023-04-20T16:45:00Z'
            }
        ];
    }

    loadRegistryPage() {
        const pageElement = document.getElementById('registry-page');
        if (pageElement) {
            pageElement.innerHTML = this.generateRegistryHTML();
            this.setupEventListeners();
        }
    }

    generateRegistryHTML() {
        const totalEmissions = this.getTotalEmissions();
        const confirmedCount = this.registryData.filter(r => r.status === 'confirmed').length;
        const pendingCount = this.registryData.filter(r => r.status === 'pending').length;

        return `
            <div class="page-title">
                <h1>Registro na Blockchain</h1>
                <button class="btn btn-primary" onclick="blockchainManager.verifyAllOnBlockchain()">
                    <i class="fab fa-ethereum"></i> Verificar Todos
                </button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="stat-value">${this.registryData.length}</div>
                    <div class="stat-label">Total de Registros</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-value">${confirmedCount}</div>
                    <div class="stat-label">Confirmados</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-value">${pendingCount}</div>
                    <div class="stat-label">Pendentes</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <div class="stat-value">${this.formatNumber(totalEmissions)}</div>
                    <div class="stat-label">Total CO₂ (kg)</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Registros Imutáveis</h3>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar transação..." id="search-transaction">
                        <button class="btn btn-secondary" onclick="blockchainManager.searchTransaction()">Buscar</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <p>Todos os registros de emissões são armazenados de forma imutável na blockchain, garantindo transparência e auditabilidade.</p>
                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Descrição</th>
                                <th>Emissões (kg CO₂)</th>
                                <th>Hash da Transação</th>
                                <th>Bloco</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateRegistryTableHTML()}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Verificação na Blockchain</h3>
                </div>
                <div class="form-group">
                    <label class="form-label">Hash da Transação</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="verify-hash" placeholder="Cole o hash da transação...">
                        <button class="btn btn-success" onclick="blockchainManager.verifyTransaction()">Verificar</button>
                    </div>
                </div>
                
                <div id="verification-result" style="display: none; margin-top: 20px; padding: 15px; border-radius: 6px;">
                    <h4>Resultado da Verificação</h4>
                    <div id="verification-details"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Informações da Rede</h3>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Rede Blockchain</label>
                        <select class="form-control" id="blockchain-network">
                            <option value="ethereum">Ethereum Mainnet</option>
                            <option value="polygon">Polygon</option>
                            <option value="bsc">Binance Smart Chain</option>
                            <option value="hyperledger">Hyperledger</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contrato Inteligente</label>
                        <input type="text" class="form-control" value="0x742d35Cc6634C0532925a3b8D4a2C3e8f6b5C3e8" readonly>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Endereço da Carteira</label>
                    <div class="blockchain-address">
                        ${window.app.currentUser?.walletAddress || 'Não conectada'}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Status da Rede</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 10px; height: 10px; background: var(--bb-green); border-radius: 50%;"></div>
                        <span>Conectado e Sincronizado</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateRegistryTableHTML() {
        if (this.registryData.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-database"></i>
                            <p>Nenhum registro na blockchain</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.registryData.map(record => `
            <tr>
                <td>${this.formatDate(record.date)}</td>
                <td>
                    <span class="badge ${
                        record.type === 'energy' ? 'badge-info' :
                        record.type === 'fleet' ? 'badge-warning' : 'badge-success'
                    }">
                        ${this.getTypeName(record.type)}
                    </span>
                </td>
                <td>${record.description}</td>
                <td class="${record.emissions < 0 ? 'text-success' : 'text-danger'}">
                    ${record.emissions < 0 ? '' : '+'}${this.formatNumber(record.emissions)}
                </td>
                <td>
                    <a href="#" class="transaction-hash" onclick="blockchainManager.viewTransactionDetails('${record.hash}')">
                        ${record.hash.substring(0, 10)}...${record.hash.substring(record.hash.length - 8)}
                    </a>
                </td>
                <td>${record.block ? `#${this.formatNumber(record.block)}` : '-'}</td>
                <td>
                    <span class="badge badge-${record.status === 'confirmed' ? 'success' : 'warning'}">
                        ${record.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="blockchainManager.viewTransactionDetails('${record.hash}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="blockchainManager.verifyOnBlockchain('${record.hash}')">
                        <i class="fab fa-ethereum"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getTotalEmissions() {
        return this.registryData.reduce((total, record) => total + record.emissions, 0);
    }

    getTypeName(type) {
        const names = {
            energy: 'Energia',
            fleet: 'Frota',
            compensation: 'Compensação'
        };
        return names[type] || type;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-transaction');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchTransaction();
                }
            });
        }

        const networkSelect = document.getElementById('blockchain-network');
        if (networkSelect) {
            networkSelect.addEventListener('change', (e) => {
                this.switchNetwork(e.target.value);
            });
        }
    }

    async verifyOnBlockchain(hash) {
        try {
            window.app.showNotification('Verificando transação na blockchain...', 'info');
            // Simulate verification result
            const record = this.registryData.find(r => r.hash === hash);
            if (record) {
                record.status = 'confirmed';
                record.block = Math.floor(Math.random() * 10000000) + 17000000;
                
                window.app.showNotification('Transação verificada e confirmada!', 'success');
                this.loadRegistryPage();
            }
        } catch (error) {
            window.app.showNotification('Erro ao verificar transação.', 'error');
        }
    }

    async verifyAllOnBlockchain() {
        try {
            window.app.showNotification('Verificando todas as transações...', 'info');
            // Simulate verifying all pending transactions
            this.registryData.forEach(record => {
                if (record.status === 'pending') {
                    record.status = 'confirmed';
                    record.block = Math.floor(Math.random() * 10000000) + 17000000;
                }
            });

            window.app.showNotification('Todas as transações verificadas!', 'success');
            this.loadRegistryPage();
        } catch (error) {
            window.app.showNotification('Erro ao verificar transações.', 'error');
        }
    }

    async verifyTransaction() {
        const hash = document.getElementById('verify-hash').value.trim();
        
        if (!hash) {
            window.app.showNotification('Digite um hash de transação.', 'error');
            return;
        }

        try {
            window.app.showNotification('Verificando transação...', 'info');

            const resultDiv = document.getElementById('verification-result');
            const detailsDiv = document.getElementById('verification-details');
            
            // Simulate verification
            const isVerified = Math.random() > 0.3; // 70% chance of success
            
            if (isVerified) {
                const fakeBlock = Math.floor(Math.random() * 10000000) + 17000000;
                detailsDiv.innerHTML = `
                    <div style="color: var(--bb-green); margin-bottom: 10px;">
                        <i class="fas fa-check-circle"></i> Transação verificada com sucesso!
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                        <strong>Detalhes da Transação:</strong><br>
                        <div style="margin-top: 10px;">
                            <strong>Hash:</strong> ${hash}<br>
                            <strong>Bloco:</strong> #${this.formatNumber(fakeBlock)}<br>
                            <strong>Status:</strong> <span class="badge badge-success">Confirmada</span><br>
                            <strong>Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                            <strong>Gas Utilizado:</strong> ${this.formatNumber(21000)}
                        </div>
                    </div>
                `;
                resultDiv.style.display = 'block';
                resultDiv.style.background = '#e6f7f0';
                resultDiv.style.border = '1px solid var(--bb-green)';
            } else {
                detailsDiv.innerHTML = `
                    <div style="color: var(--bb-red);">
                        <i class="fas fa-exclamation-triangle"></i> Transação não encontrada ou inválida
                    </div>
                    <div style="margin-top: 10px; font-size: 0.9rem;">
                        Verifique se o hash está correto e tente novamente.
                    </div>
                `;
                resultDiv.style.display = 'block';
                resultDiv.style.background = '#ffe6e6';
                resultDiv.style.border = '1px solid var(--bb-red)';
            }
        } catch (error) {
            window.app.showNotification('Erro ao verificar transação.', 'error');
        }
    }

    viewTransactionDetails(hash) {
        const record = this.registryData.find(r => r.hash === hash);
        if (record) {
            const modalHTML = `
                <div class="modal active" id="transaction-modal">
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header">
                            <h3 class="modal-title">Detalhes da Transação</h3>
                            <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                <div><strong>Hash:</strong></div>
                                <div class="blockchain-address">${record.hash}</div>
                                
                                <div><strong>Data:</strong></div>
                                <div>${this.formatDate(record.date)}</div>
                                
                                <div><strong>Tipo:</strong></div>
                                <div>${this.getTypeName(record.type)}</div>
                                
                                <div><strong>Descrição:</strong></div>
                                <div>${record.description}</div>
                                
                                <div><strong>Emissões:</strong></div>
                                <div class="${record.emissions < 0 ? 'text-success' : 'text-danger'}">
                                    ${record.emissions < 0 ? '' : '+'}${this.formatNumber(record.emissions)} kg CO₂
                                </div>
                                
                                <div><strong>Status:</strong></div>
                                <div>
                                    <span class="badge badge-${record.status === 'confirmed' ? 'success' : 'warning'}">
                                        ${record.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                    </span>
                                </div>
                                
                                ${record.block ? `
                                    <div><strong>Bloco:</strong></div>
                                    <div>#${this.formatNumber(record.block)}</div>
                                    
                                    <div><strong>Gas Utilizado:</strong></div>
                                    <div>${record.gasUsed ? this.formatNumber(record.gasUsed) : 'N/A'}</div>
                                    
                                    <div><strong>Timestamp:</strong></div>
                                    <div>${new Date(record.timestamp).toLocaleString('pt-BR')}</div>
                                ` : ''}
                            </div>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                                <strong>Informações Técnicas:</strong><br>
                                <div style="margin-top: 10px; font-size: 0.9rem;">
                                    • Rede: Ethereum Mainnet<br>
                                    • Contrato: 0x742d35Cc6634C0532925a3b8D4a2C3e8f6b5C3e8<br>
                                    • Método: ${record.type === 'compensation' ? 'transfer' : 'mint'}<br>
                                    • Confirmations: ${record.status === 'confirmed' ? '12' : '0'}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="blockchainManager.openBlockExplorer('${record.hash}')">
                                <i class="fas fa-external-link-alt"></i> Ver no Explorador
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    openBlockExplorer(hash) {
        const network = document.getElementById('blockchain-network')?.value || 'ethereum';
        const explorers = {
            ethereum: `https://etherscan.io/tx/${hash}`,
            polygon: `https://polygonscan.com/tx/${hash}`,
            bsc: `https://bscscan.com/tx/${hash}`,
            hyperledger: `#`
        };
        
        window.open(explorers[network], '_blank');
    }

    searchTransaction() {
        const query = document.getElementById('search-transaction').value.trim();
        if (!query) {
            window.app.showNotification('Digite um termo para buscar.', 'error');
            return;
        }
        
        const results = this.registryData.filter(record => 
            record.hash.includes(query) || 
            record.date.includes(query) ||
            record.type.includes(query) ||
            record.description.toLowerCase().includes(query.toLowerCase())
        );
        
        window.app.showNotification(`Encontradas ${results.length} transações.`, 'info');
    }

    switchNetwork(network) {
        const networkNames = {
            ethereum: 'Ethereum Mainnet',
            polygon: 'Polygon',
            bsc: 'Binance Smart Chain',
            hyperledger: 'Hyperledger'
        };
        window.app.showNotification(`Rede alterada para: ${networkNames[network]}`, 'info');
    }

    formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }
}