// Monitoring functionality
class MonitoringManager {
    constructor() {
        this.apiBaseUrl = 'https://back-end-blockchain.onrender.com';
        this.emissionData = {
            energy: [],
            fleet: [],
            factors: {
                energy: {
                    grid: 0.5, // kg CO₂ per kWh
                    solar: 0.05,
                    wind: 0.01,
                    hydro: 0.02
                },
                fleet: {
                    diesel: 2.68, // kg CO₂ per liter
                    gasoline: 2.31,
                    ethanol: 1.51,
                    cng: 2.75
                }
            }
        };
    }

    async loadHistoricalData() {
        // Carregar dados da API
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.log('Usuário não logado, não é possível carregar histórico');
                return;
            }

            // Buscar emissões e fontes de emissão em paralelo
            const [emissaoResponse, fonteResponse] = await Promise.all([
                this.apiCall('/api/emissao', { method: 'GET' }),
                this.apiCall('/api/fonteEmissao', { method: 'GET' })
            ]);

            if (emissaoResponse.ok && fonteResponse.ok) {
                const emissoes = await emissaoResponse.json();
                const fontes = await fonteResponse.json();
                
                console.log('Emissões carregadas da API:', emissoes);
                console.log('Fontes carregadas da API:', fontes);
                
                // Criar mapa de fontes por id para acesso rápido
                const fontesMap = {};
                fontes.forEach(fonte => {
                    const fonteId = fonte.id || fonte._id;
                    fontesMap[fonteId] = fonte;
                });
                
                // Filtrar emissões do usuário atual
                const userEmissions = emissoes.filter(e => e.idUsuarioFK === userId);
                
                // Separar emissões por tipo de fonte
                this.emissionData.energy = [];
                this.emissionData.fleet = [];
                
                userEmissions.forEach(emissao => {
                    const fonteId = emissao.idFonteFk;
                    const fonte = fontesMap[fonteId];
                    
                    if (fonte) {
                        const tipoFonte = fonte.tipoFonte ? fonte.tipoFonte.toLowerCase() : '';
                        
                        const emissaoFormatada = {
                            id: emissao.id || emissao._id,
                            date: emissao.dataRegistro,
                            type: fonte.descricao || 'Desconhecido',
                            consumption: emissao.consumo || 0,
                            emissions: emissao.quantidadeCo2,
                            status: 'registered',
                            fonteId: fonteId
                        };
                        
                        if (tipoFonte === 'energia') {
                            this.emissionData.energy.push(emissaoFormatada);
                        } else if (tipoFonte === 'frota de veículos') {
                            this.emissionData.fleet.push(emissaoFormatada);
                        }
                    }
                });
                
                console.log('Emissões de energia:', this.emissionData.energy);
                console.log('Emissões de frota:', this.emissionData.fleet);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de emissões:', error);
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

    async loadMonitoringPage() {
        const pageElement = document.getElementById('monitoring-page');
        if (pageElement) {
            // Mostrar loading
            pageElement.innerHTML = `
                <div class="page-title">
                    <h1>Monitoramento de Emissões</h1>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Carregando...</h3>
                    </div>
                    <p><i class="fas fa-spinner fa-spin"></i> Buscando dados de emissões...</p>
                </div>
            `;

            // Carregar dados da API
            await this.loadHistoricalData();

            // Renderizar página
            pageElement.innerHTML = this.generateMonitoringHTML();
            this.setupEventListeners();
        }
    }

    generateMonitoringHTML() {
        return `
            <div class="page-title">
                <h1>Monitoramento de Emissões</h1>
                <div style="display: flex; gap: 10px;">
                    <!-- Botão temporário para gerenciar fontes de energia (comentado para uso futuro)
                    <button class="btn btn-secondary" onclick="monitoringManager.showSourcesModal()">
                        <i class="fas fa-list"></i> Fontes de Energia
                    </button>
                    -->
                <button class="btn btn-primary" onclick="monitoringManager.showManualEntryModal()">
                    <i class="fas fa-plus"></i> Nova Entrada
                </button>
                </div>
            </div>

            <div class="content-tabs">
                <div class="content-tab active" data-tab="energy">Emissões de Energia</div>
                <div class="content-tab" data-tab="fleet">Emissões da Frota</div>
                <div class="content-tab" data-tab="integrations">Integrações</div>
            </div>

            <div id="energy-tab" class="tab-content active">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Histórico de Emissões de Energia</h3>
                        <div class="input-group">
                            <input type="month" class="form-control" id="energy-filter-month" value="${new Date().toISOString().slice(0,7)}">
                            <button class="btn btn-secondary" onclick="monitoringManager.filterEnergyData()">Filtrar</button>
                        </div>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Fonte</th>
                                <th>Consumo (kWh)</th>
                                <th>Emissões (kg CO₂)</th>
                                <th>Fator</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateEnergyHistoryHTML()}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="fleet-tab" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Histórico de Emissões da Frota</h3>
                        <div class="input-group">
                            <input type="month" class="form-control" id="fleet-filter-month" value="${new Date().toISOString().slice(0,7)}">
                            <button class="btn btn-secondary" onclick="monitoringManager.filterFleetData()">Filtrar</button>
                        </div>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Combustível</th>
                                <th>Consumo (L)</th>
                                <th>Distância (km)</th>
                                <th>Emissões (kg CO₂)</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateFleetHistoryHTML()}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="integrations-tab" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Integrações Automáticas</h3>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Concessionária de Energia</label>
                        <select class="form-control" id="energy-provider">
                            <option value="">Selecionar concessionária...</option>
                            <option value="cpfl">CPFL Energia</option>
                            <option value="enel">Enel</option>
                            <option value="light">Light</option>
                            <option value="cemig">Cemig</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Sistema de Gestão de Frota</label>
                        <select class="form-control" id="fleet-system">
                            <option value="">Selecionar sistema...</option>
                            <option value="fleetmind">FleetMind</option>
                            <option value="omnis">Omnis</option>
                            <option value="vertele">Vertele</option>
                        </select>
                    </div>
                    <button class="btn btn-success" onclick="monitoringManager.connectIntegrations()">
                        <i class="fas fa-plug"></i> Conectar Integrações
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Dispositivos IoT</h3>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="iot-energy" checked>
                            <label for="iot-energy">Medidores Inteligentes de Energia</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="iot-fleet">
                            <label for="iot-fleet">Sensores de Combustível em Veículos</label>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="monitoringManager.configureIoT()">
                        <i class="fas fa-satellite-dish"></i> Configurar IoT
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Status das Integrações</h3>
                    </div>
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                            <span>Concessionária de Energia</span>
                            <span class="badge badge-warning">Não Conectado</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                            <span>Sistema de Frota</span>
                            <span class="badge badge-warning">Não Conectado</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <span>Dispositivos IoT</span>
                            <span class="badge badge-success">Ativo</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Manual Entry Modal -->
            <div id="manual-entry-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Registrar Emissões</h3>
                        <button class="modal-close" onclick="monitoringManager.hideManualEntryModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="manual-entry-form">
                            <div class="form-group">
                                <label class="form-label">Tipo de Emissão</label>
                                <select class="form-control" id="emission-type" required>
                                    <option value="">Selecionar tipo...</option>
                                    <option value="energy">Energia</option>
                                    <option value="fleet">Frota de Veículos</option>
                                </select>
                            </div>
                            
                            <div id="energy-fields" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label" for="energy-consumption">Consumo de Energia (kWh)</label>
                                    <input type="number" class="form-control" id="energy-consumption" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="energy-source">Fonte de Energia</label>
                                    <select class="form-control" id="energy-source">
                                        <option value="">Carregando fontes...</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="fleet-fields" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label" for="fuel-type">Tipo de Combustível</label>
                                    <select class="form-control" id="fuel-type">
                                        <option value="">Carregando combustíveis...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="fuel-consumption">Consumo de Combustível (litros)</label>
                                    <input type="number" class="form-control" id="fuel-consumption" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="distance">Distância Percorrida (km)</label>
                                    <input type="number" class="form-control" id="distance" step="0.01" min="0">
                                </div>
                            </div>
                            
                            <div id="common-fields" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label" for="emission-date">Data da Emissão</label>
                                    <input type="date" class="form-control" id="emission-date" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="collection-method">Método de Coleta de Dados</label>
                                    <select class="form-control" id="collection-method" required>
                                        <option value="manual">Manual</option>
                                        <option value="API">API</option>
                                        <option value="Iot">Dispositivo IoT</option>
                                    </select>
                                </div>
                                
                                <div id="calculation-result" style="display: none; padding: 15px; background: #f0f8ff; border-radius: 6px; margin-bottom: 15px;">
                                    <h4>Resultado do Cálculo</h4>
                                    <p>Emissões calculadas: <strong id="calculated-emissions">0</strong> kg CO₂</p>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div id="modal-footer-buttons" class="modal-footer" style="display: none;">
                        <button type="button" class="btn btn-secondary" onclick="monitoringManager.calculateEmissions()">
                            Calcular Emissões
                        </button>
                        <button type="button" class="btn btn-primary" onclick="monitoringManager.saveEmission()" id="save-emission-btn" disabled>
                            Salvar e Registrar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateEnergyHistoryHTML() {
        // Filtrar emissões com consumo > 1.00 kWh
        const filteredEnergy = this.emissionData.energy.filter(entry => {
            const factor = this.getEnergyFactor(entry.type);
            const calculatedConsumption = entry.emissions / factor;
            return calculatedConsumption > 1.00;
        });

        if (filteredEnergy.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-chart-line"></i>
                            <p>Nenhum dado de energia registrado</p>
                            <button class="btn btn-primary mt-2" onclick="monitoringManager.showManualEntryModal()">
                                Adicionar Primeira Entrada
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return filteredEnergy.map(entry => {
            const factor = this.getEnergyFactor(entry.type);
            // Calcular consumo a partir das emissões: consumo = emissões / fator
            const calculatedConsumption = entry.emissions / factor;
            
            return `
                <tr>
                    <td>${this.formatDate(entry.date)}</td>
                    <td>${entry.type}</td>
                    <td>${this.formatNumber(calculatedConsumption)}</td>
                    <td>${this.formatNumber(entry.emissions)}</td>
                    <td>${factor} kg CO₂/kWh</td>
                    <td>
                        <span class="badge badge-${entry.status === 'registered' ? 'success' : 'warning'}">
                            ${entry.status === 'registered' ? 'Registrado' : 'Pendente'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="monitoringManager.editEntry('energy', '${entry.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${entry.status !== 'registered' ? `
                            <button class="btn btn-success btn-sm" onclick="monitoringManager.registerEntry('energy', '${entry.id}')">
                                <i class="fas fa-database"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    getEnergyFactor(type) {
        const typeText = (type || '').toLowerCase();
        if (typeText.includes('solar')) return 0.05;
        if (typeText.includes('eólica') || typeText.includes('eolica')) return 0.01;
        if (typeText.includes('hidrelétrica') || typeText.includes('hidreletrica')) return 0.02;
        return 0.5; // Padrão: Rede Elétrica
    }

    generateFleetHistoryHTML() {
        if (this.emissionData.fleet.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-truck"></i>
                            <p>Nenhum dado de frota registrado</p>
                            <button class="btn btn-primary mt-2" onclick="monitoringManager.showManualEntryModal()">
                                Adicionar Primeira Entrada
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.emissionData.fleet.map(entry => {
            const factor = this.getFleetFactor(entry.type);
            // Calcular consumo a partir das emissões: consumo = emissões / fator
            const calculatedConsumption = entry.emissions / factor;
            
            return `
                <tr>
                    <td>${this.formatDate(entry.date)}</td>
                    <td>${entry.type}</td>
                    <td>${this.formatNumber(calculatedConsumption)}</td>
                    <td>-</td>
                    <td>${this.formatNumber(entry.emissions)}</td>
                    <td>
                        <span class="badge badge-${entry.status === 'registered' ? 'success' : 'warning'}">
                            ${entry.status === 'registered' ? 'Registrado' : 'Pendente'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="monitoringManager.editEntry('fleet', '${entry.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${entry.status !== 'registered' ? `
                            <button class="btn btn-success btn-sm" onclick="monitoringManager.registerEntry('fleet', '${entry.id}')">
                                <i class="fas fa-database"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFleetFactor(type) {
        const typeText = (type || '').toLowerCase();
        if (typeText.includes('gasolina')) return 2.31;
        if (typeText.includes('etanol')) return 1.51;
        if (typeText.includes('gnv')) return 2.75;
        return 2.68; // Padrão: Diesel
    }

    getEnergySourceName(type) {
        const names = {
            grid: 'Rede Elétrica',
            solar: 'Energia Solar',
            wind: 'Energia Eólica',
            hydro: 'Hidrelétrica'
        };
        return names[type] || type;
    }

    getFuelTypeName(type) {
        const names = {
            diesel: 'Diesel',
            gasoline: 'Gasolina',
            ethanol: 'Etanol',
            cng: 'GNV'
        };
        return names[type] || type;
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchMonitoringTab(tabName);
            });
        });

        // Emission type change
        const emissionTypeSelect = document.getElementById('emission-type');
        if (emissionTypeSelect) {
            emissionTypeSelect.addEventListener('change', (e) => {
                this.toggleEmissionFields(e.target.value);
            });
        }

        // Form changes for real-time calculation
        ['energy-consumption', 'fuel-consumption'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.calculateEmissions();
                });
            }
        });

        // Dropdown changes for real-time calculation
        ['energy-source', 'fuel-type'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.calculateEmissions();
                });
            }
        });
    }

    switchMonitoringTab(tabName) {
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    showManualEntryModal() {
        document.getElementById('manual-entry-modal').classList.add('active');
        // Set default date to today
        document.getElementById('emission-date').value = new Date().toISOString().split('T')[0];
    }

    hideManualEntryModal() {
        document.getElementById('manual-entry-modal').classList.remove('active');
        document.getElementById('manual-entry-form').reset();
        document.getElementById('calculation-result').style.display = 'none';
        document.getElementById('save-emission-btn').disabled = true;
    }

    // ========== FONTES DE ENERGIA ==========
    
    async showSourcesModal() {
        // Remover modal existente se houver
        const existingModal = document.getElementById('sources-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'sources-modal';
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
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #333333;">
                        <i class="fas fa-list" style="color: var(--bb-blue); margin-right: 10px;"></i>
                        Fontes de Energia
                    </h3>
                    <button type="button" onclick="monitoringManager.closeSourcesModal()" style="
                        background: none;
                        border: none;
                        color: #666666;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                    ">&times;</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="monitoringManager.showNewSourceForm()" id="btn-new-source">
                        <i class="fas fa-plus"></i> Nova Fonte
                    </button>
                </div>
                
                <div id="new-source-form" style="display: none; background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Nova Fonte de Energia</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label class="form-label" for="new-source-tipo">Tipo de Fonte</label>
                        <input type="text" class="form-control" id="new-source-tipo" placeholder="Ex: Energia Solar, Rede Elétrica...">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label class="form-label" for="new-source-desc">Descrição</label>
                        <input type="text" class="form-control" id="new-source-desc" placeholder="Descrição da fonte de emissão">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="monitoringManager.hideNewSourceForm()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="monitoringManager.saveNewSource()" id="btn-save-new-source">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                    </div>
                </div>
                
                <div id="sources-list" style="min-height: 100px;">
                    <p style="text-align: center; color: #666;">
                        <i class="fas fa-spinner fa-spin"></i> Carregando fontes de energia...
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSourcesModal();
            }
        });

        // Carregar fontes da API
        await this.loadSources();
    }

    closeSourcesModal() {
        const modal = document.getElementById('sources-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
    }

    showNewSourceForm() {
        document.getElementById('new-source-form').style.display = 'block';
        document.getElementById('btn-new-source').style.display = 'none';
        document.getElementById('new-source-tipo').focus();
    }

    hideNewSourceForm() {
        document.getElementById('new-source-form').style.display = 'none';
        document.getElementById('btn-new-source').style.display = 'inline-flex';
        document.getElementById('new-source-tipo').value = '';
        document.getElementById('new-source-desc').value = '';
    }

    async saveNewSource() {
        const tipoFonte = document.getElementById('new-source-tipo').value.trim();
        const descricao = document.getElementById('new-source-desc').value.trim();

        if (!tipoFonte) {
            window.app.showNotification('O tipo de fonte é obrigatório.', 'error');
            return;
        }

        // Feedback visual
        const saveBtn = document.getElementById('btn-save-new-source');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            const requestBody = {
                tipoFonte: tipoFonte,
                descricao: descricao
            };

            console.log('Criando nova fonte:', requestBody);

            const response = await this.apiCall('/api/fonteEmissao', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                window.app.showNotification('Fonte criada com sucesso!', 'success');
                this.hideNewSourceForm();
                await this.loadSources();
            } else {
                const responseData = await response.json().catch(() => ({}));
                const errorMessage = responseData.message || responseData.error || 'Erro ao criar fonte.';
                window.app.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar nova fonte:', error);
            window.app.showNotification('Erro ao salvar. Verifique sua conexão.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    async loadSources() {
        const listContainer = document.getElementById('sources-list');
        
        try {
            const response = await this.apiCall('/api/fonteEmissao', {
                method: 'GET'
            });

            if (response.ok) {
                const sources = await response.json();
                console.log('Fontes de emissão carregadas:', sources);

                if (sources.length === 0) {
                    listContainer.innerHTML = `
                        <p style="text-align: center; color: #666; padding: 20px;">
                            <i class="fas fa-info-circle"></i> Nenhuma fonte de energia cadastrada.
                        </p>
                    `;
                } else {
                    listContainer.innerHTML = `
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Tipo de Fonte</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Descrição</th>
                                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; width: 120px;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sources.map(source => `
                                    <tr id="source-row-${source.id || source._id}" style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px;" id="source-tipo-${source.id || source._id}">${source.tipoFonte || '-'}</td>
                                        <td style="padding: 12px;" id="source-desc-${source.id || source._id}">${source.descricao || '-'}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <button class="btn btn-secondary btn-sm" onclick="monitoringManager.editSource('${source.id || source._id}')" style="margin-right: 5px;">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm" onclick="monitoringManager.deleteSource('${source.id || source._id}')" style="background: var(--bb-red); color: white;">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                }
            } else {
                listContainer.innerHTML = `
                    <p style="text-align: center; color: var(--bb-red); padding: 20px;">
                        <i class="fas fa-exclamation-triangle"></i> Erro ao carregar fontes de energia.
                    </p>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar fontes:', error);
            listContainer.innerHTML = `
                <p style="text-align: center; color: var(--bb-red); padding: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> Erro ao conectar com a API.
                </p>
            `;
        }
    }

    editSource(sourceId) {
        const tipoCell = document.getElementById(`source-tipo-${sourceId}`);
        const descCell = document.getElementById(`source-desc-${sourceId}`);
        const row = document.getElementById(`source-row-${sourceId}`);
        
        if (!tipoCell || !descCell || !row) return;

        const currentTipo = tipoCell.textContent;
        const currentDesc = descCell.textContent;

        // Substituir células por inputs
        tipoCell.innerHTML = `<input type="text" id="edit-tipo-${sourceId}" class="form-control" value="${currentTipo !== '-' ? currentTipo : ''}" style="width: 100%;">`;
        descCell.innerHTML = `<input type="text" id="edit-desc-${sourceId}" class="form-control" value="${currentDesc !== '-' ? currentDesc : ''}" style="width: 100%;">`;

        // Substituir botões por salvar/cancelar
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.innerHTML = `
            <button class="btn btn-success btn-sm" onclick="monitoringManager.saveSourceEdit('${sourceId}')" style="margin-right: 5px;">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="monitoringManager.cancelSourceEdit('${sourceId}', '${currentTipo}', '${currentDesc}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Focar no primeiro input
        document.getElementById(`edit-tipo-${sourceId}`).focus();
    }

    cancelSourceEdit(sourceId, originalTipo, originalDesc) {
        const tipoCell = document.getElementById(`source-tipo-${sourceId}`);
        const descCell = document.getElementById(`source-desc-${sourceId}`);
        const row = document.getElementById(`source-row-${sourceId}`);
        
        if (!tipoCell || !descCell || !row) return;

        // Restaurar valores originais
        tipoCell.innerHTML = originalTipo;
        descCell.innerHTML = originalDesc;

        // Restaurar botões
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="monitoringManager.editSource('${sourceId}')" style="margin-right: 5px;">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm" onclick="monitoringManager.deleteSource('${sourceId}')" style="background: var(--bb-red); color: white;">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }

    async saveSourceEdit(sourceId) {
        const tipoInput = document.getElementById(`edit-tipo-${sourceId}`);
        const descInput = document.getElementById(`edit-desc-${sourceId}`);
        
        if (!tipoInput || !descInput) return;

        const tipoFonte = tipoInput.value.trim();
        const descricao = descInput.value.trim();

        if (!tipoFonte) {
            window.app.showNotification('O tipo de fonte é obrigatório.', 'error');
            return;
        }

        // Feedback visual
        const row = document.getElementById(`source-row-${sourceId}`);
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        try {
            const requestBody = {
                tipoFonte: tipoFonte,
                descricao: descricao
            };

            console.log('Atualizando fonte:', sourceId, requestBody);

            const response = await this.apiCall(`/api/fonteEmissao/${sourceId}`, {
                method: 'PUT',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                window.app.showNotification('Fonte atualizada com sucesso!', 'success');
                // Recarregar lista
                await this.loadSources();
            } else {
                const responseData = await response.json().catch(() => ({}));
                const errorMessage = responseData.message || responseData.error || 'Erro ao atualizar fonte.';
                window.app.showNotification(errorMessage, 'error');
                // Recarregar para restaurar estado
                await this.loadSources();
            }
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
            window.app.showNotification('Erro ao salvar. Verifique sua conexão.', 'error');
            await this.loadSources();
        }
    }

    async deleteSource(sourceId) {
        if (!confirm('Tem certeza que deseja excluir esta fonte de energia?')) {
            return;
        }

        // Feedback visual
        const row = document.getElementById(`source-row-${sourceId}`);
        if (row) {
            row.style.opacity = '0.5';
        }

        try {
            console.log('Excluindo fonte:', sourceId);

            const response = await this.apiCall(`/api/fonteEmissao/${sourceId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                window.app.showNotification('Fonte excluída com sucesso!', 'success');
                // Remover linha da tabela
                if (row) {
                    row.remove();
                }
                // Verificar se ainda há fontes
                const tbody = document.querySelector('#sources-list tbody');
                if (tbody && tbody.children.length === 0) {
                    await this.loadSources();
                }
            } else {
                const responseData = await response.json().catch(() => ({}));
                const errorMessage = responseData.message || responseData.error || 'Erro ao excluir fonte.';
                window.app.showNotification(errorMessage, 'error');
                if (row) {
                    row.style.opacity = '1';
                }
            }
        } catch (error) {
            console.error('Erro ao excluir fonte:', error);
            window.app.showNotification('Erro ao excluir. Verifique sua conexão.', 'error');
            if (row) {
                row.style.opacity = '1';
            }
        }
    }

    // ========== FIM FONTES DE ENERGIA ==========

    toggleEmissionFields(type) {
        const commonFields = document.getElementById('common-fields');
        const footerButtons = document.getElementById('modal-footer-buttons');
        
        if (type === 'energy') {
            document.getElementById('energy-fields').style.display = 'block';
            document.getElementById('fleet-fields').style.display = 'none';
            commonFields.style.display = 'block';
            footerButtons.style.display = 'flex';
            // Carregar fontes de energia da API
            this.loadEnergySourcesDropdown();
        } else if (type === 'fleet') {
            document.getElementById('energy-fields').style.display = 'none';
            document.getElementById('fleet-fields').style.display = 'block';
            commonFields.style.display = 'block';
            footerButtons.style.display = 'flex';
            // Carregar tipos de combustível da API
            this.loadFuelTypesDropdown();
        } else {
            // Nenhum tipo selecionado - ocultar tudo
            document.getElementById('energy-fields').style.display = 'none';
            document.getElementById('fleet-fields').style.display = 'none';
            commonFields.style.display = 'none';
            footerButtons.style.display = 'none';
        }
        this.calculateEmissions();
    }

    async loadEnergySourcesDropdown() {
        const select = document.getElementById('energy-source');
        if (!select) return;

        // Mostrar loading
        select.innerHTML = '<option value="">Carregando fontes...</option>';
        select.disabled = true;

        try {
            const response = await this.apiCall('/api/fonteEmissao', {
                method: 'GET'
            });

            if (response.ok) {
                const sources = await response.json();
                console.log('Fontes de emissão para dropdown:', sources);

                // Filtrar apenas fontes com tipoFonte = "Energia"
                const energySources = sources.filter(s => 
                    s.tipoFonte && s.tipoFonte.toLowerCase() === 'energia'
                );

                if (energySources.length === 0) {
                    select.innerHTML = '<option value="">Nenhuma fonte de energia cadastrada</option>';
                } else {
                    select.innerHTML = '<option value="">Selecione uma fonte...</option>' +
                        energySources.map(source => 
                            `<option value="${source.id || source._id}">${source.descricao}</option>`
                        ).join('');
                }
            } else {
                select.innerHTML = '<option value="">Erro ao carregar fontes</option>';
            }
        } catch (error) {
            console.error('Erro ao carregar fontes de energia:', error);
            select.innerHTML = '<option value="">Erro ao carregar fontes</option>';
        } finally {
            select.disabled = false;
        }
    }

    async loadFuelTypesDropdown() {
        const select = document.getElementById('fuel-type');
        if (!select) return;

        // Mostrar loading
        select.innerHTML = '<option value="">Carregando combustíveis...</option>';
        select.disabled = true;

        try {
            const response = await this.apiCall('/api/fonteEmissao', {
                method: 'GET'
            });

            if (response.ok) {
                const sources = await response.json();
                console.log('Fontes de emissão para dropdown de frota:', sources);

                // Filtrar apenas fontes com tipoFonte = "Frota de Veículos"
                const fleetSources = sources.filter(s => 
                    s.tipoFonte && s.tipoFonte.toLowerCase() === 'frota de veículos'
                );

                if (fleetSources.length === 0) {
                    select.innerHTML = '<option value="">Nenhum combustível cadastrado</option>';
                } else {
                    select.innerHTML = '<option value="">Selecione um combustível...</option>' +
                        fleetSources.map(source => 
                            `<option value="${source.id || source._id}">${source.descricao}</option>`
                        ).join('');
                }
            } else {
                select.innerHTML = '<option value="">Erro ao carregar combustíveis</option>';
            }
        } catch (error) {
            console.error('Erro ao carregar tipos de combustível:', error);
            select.innerHTML = '<option value="">Erro ao carregar combustíveis</option>';
        } finally {
            select.disabled = false;
        }
    }

    calculateEmissions() {
        const type = document.getElementById('emission-type').value;
        let emissions = 0;

        if (type === 'energy') {
            const consumption = parseFloat(document.getElementById('energy-consumption').value) || 0;
            const sourceSelect = document.getElementById('energy-source');
            const selectedOption = sourceSelect.options[sourceSelect.selectedIndex];
            const sourceText = selectedOption ? selectedOption.text.toLowerCase() : '';
            
            // Determinar fator baseado na descrição da fonte
            let factor = 0.5; // Padrão: Rede Elétrica
            if (sourceText.includes('solar')) {
                factor = 0.05;
            } else if (sourceText.includes('eólica') || sourceText.includes('eolica')) {
                factor = 0.01;
            } else if (sourceText.includes('hidrelétrica') || sourceText.includes('hidreletrica')) {
                factor = 0.02;
            }
            
            emissions = consumption * factor;
            console.log(`Cálculo: ${consumption} kWh x ${factor} = ${emissions} kg CO₂ (Fonte: ${sourceText})`);
        } else if (type === 'fleet') {
            const consumption = parseFloat(document.getElementById('fuel-consumption').value) || 0;
            const fuelSelect = document.getElementById('fuel-type');
            const selectedOption = fuelSelect.options[fuelSelect.selectedIndex];
            const fuelText = selectedOption ? selectedOption.text.toLowerCase() : '';
            
            // Determinar fator baseado na descrição do combustível
            let factor = 2.68; // Padrão: Diesel
            if (fuelText.includes('gasolina')) {
                factor = 2.31;
            } else if (fuelText.includes('etanol')) {
                factor = 1.51;
            } else if (fuelText.includes('gnv')) {
                factor = 2.75;
            }
            
            emissions = consumption * factor;
            console.log(`Cálculo: ${consumption} L x ${factor} = ${emissions} kg CO₂ (Combustível: ${fuelText})`);
        }

        if (emissions > 0) {
            document.getElementById('calculated-emissions').textContent = this.formatNumber(emissions);
            document.getElementById('calculation-result').style.display = 'block';
            document.getElementById('save-emission-btn').disabled = false;
        } else {
            document.getElementById('calculation-result').style.display = 'none';
            document.getElementById('save-emission-btn').disabled = true;
        }

        return emissions;
    }

    async saveEmission() {
        const type = document.getElementById('emission-type').value;
        const date = document.getElementById('emission-date').value;
        const emissions = this.calculateEmissions();

        if (emissions <= 0) {
            window.app.showNotification('Calcule as emissões antes de salvar.', 'error');
            return;
        }

        // Obter ID do usuário
        const userId = this.getCurrentUserId();
        if (!userId) {
            window.app.showNotification('Usuário não identificado. Faça login novamente.', 'error');
            return;
        }

        // Feedback visual no botão
        const saveBtn = document.getElementById('save-emission-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            if (type === 'energy') {
                // Preparar dados para a API
                const metodoColeta = document.getElementById('collection-method').value;
                const idFonteFK = document.getElementById('energy-source').value;
                
                // Validar se uma fonte foi selecionada
                if (!idFonteFK) {
                    window.app.showNotification('Por favor, selecione uma fonte de energia.', 'error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                    return;
                }
                
                const requestBody = {
                    idUsuarioFK: userId,
                    quantidadeCo2: emissions,
                    dataRegistro: date,
                    metodoColeta: metodoColeta,
                    idFonteFk: idFonteFK
                };

                console.log('Enviando emissão para API:', requestBody);

                const response = await this.apiCall('/api/emissao', {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });

                // Ler resposta como texto primeiro para debug
                const responseText = await response.text();
                console.log('Resposta da API (status:', response.status, '):', responseText);

                let responseData = {};
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    console.log('Resposta não é JSON:', responseText);
                }

                if (response.ok) {
                    this.hideManualEntryModal();
                    window.app.showNotification('Emissão de energia registrada com sucesso!', 'success');
                    
                    // Recarregar a página para mostrar os novos dados
                    await this.loadMonitoringPage();
                } else {
                    console.error('Erro da API:', responseData);
                    const errorMessage = responseData.message || responseData.error || responseData.erro || 'Erro ao registrar emissão.';
                    window.app.showNotification(errorMessage, 'error');
                }
            } else if (type === 'fleet') {
                // Preparar dados para a API
                const metodoColeta = document.getElementById('collection-method').value;
                const idFonteFK = document.getElementById('fuel-type').value;
                
                // Validar se um combustível foi selecionado
                if (!idFonteFK) {
                    window.app.showNotification('Por favor, selecione um tipo de combustível.', 'error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                    return;
                }
                
                const requestBody = {
                    idUsuarioFK: userId,
                    quantidadeCo2: emissions,
                    dataRegistro: date,
                    metodoColeta: metodoColeta,
                    idFonteFk: idFonteFK
                };

                console.log('Enviando emissão de frota para API:', requestBody);

                const response = await this.apiCall('/api/emissao', {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });

                // Ler resposta como texto primeiro para debug
                const responseText = await response.text();
                console.log('Resposta da API (status:', response.status, '):', responseText);

                let responseData = {};
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    console.log('Resposta não é JSON:', responseText);
            }

                if (response.ok) {
            this.hideManualEntryModal();
                    window.app.showNotification('Emissão de frota registrada com sucesso!', 'success');
            
                    // Recarregar a página para mostrar os novos dados
                    await this.loadMonitoringPage();
                } else {
                    console.error('Erro da API:', responseData);
                    const errorMessage = responseData.message || responseData.error || responseData.erro || 'Erro ao registrar emissão.';
                    window.app.showNotification(errorMessage, 'error');
                }
            }
        } catch (error) {
            console.error('Erro ao salvar emissão:', error);
            window.app.showNotification('Erro ao salvar emissão. Verifique sua conexão.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    editEntry(category, date) {
        window.app.showNotification(`Editando entrada de ${category} de ${date}`, 'info');
        // Implement edit functionality
    }

    async registerEntry(category, date) {
        try {
            window.app.showNotification('Emissão registrada na blockchain!', 'success');
            
            // Update status in local data
            const dataArray = category === 'energy' ? this.emissionData.energy : this.emissionData.fleet;
            const entry = dataArray.find(e => e.date === date);
            if (entry) {
                entry.status = 'registered';
            }
            
            this.loadMonitoringPage();
        } catch (error) {
            window.app.showNotification('Erro ao registrar na blockchain.', 'error');
        }
    }

    filterEnergyData() {
        const month = document.getElementById('energy-filter-month').value;
        window.app.showNotification(`Filtrando dados de energia para ${month}`, 'info');
    }

    filterFleetData() {
        const month = document.getElementById('fleet-filter-month').value;
        window.app.showNotification(`Filtrando dados de frota para ${month}`, 'info');
    }

    connectIntegrations() {
        window.app.showNotification('Integrações conectadas com sucesso!', 'success');
    }

    configureIoT() {
        window.app.showNotification('Configuração IoT aplicada!', 'success');
    }

    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }
}