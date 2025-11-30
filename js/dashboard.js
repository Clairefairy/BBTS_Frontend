// Dashboard functionality
class DashboardManager {
    constructor() {
        this.apiBaseUrl = 'https://back-end-blockchain.onrender.com';
        this.fontesMap = {};
        this.statsData = {
            energyEmissions: 1250,
            fleetEmissions: 2180,
            availableTokens: 15,
            compensatedEmissions: 850,
            monthlyTrend: [1200, 1350, 1100, 1250, 1400, 1300],
            recentActivities: []
        };
        
        // Carrega imediatamente se já estiver na página
        if (document.getElementById('dashboard-page')?.classList.contains('active')) {
            setTimeout(() => this.loadDashboard(), 100);
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

    async loadDashboard() {
        const dashboardElement = document.getElementById('dashboard-page');
        if (dashboardElement) {
            // Mostrar loading
            dashboardElement.innerHTML = `
                <div class="page-title">
                    <h1>Visão Geral</h1>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Carregando...</h3>
                    </div>
                    <p><i class="fas fa-spinner fa-spin"></i> Buscando dados...</p>
                </div>
            `;

            // Carregar todos os dados da API
            await this.loadAllDashboardData();

            dashboardElement.innerHTML = this.generateDashboardHTML();
            this.renderCharts();
            this.setupEventListeners();
        }
    }

    async loadAllDashboardData() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                console.log('Usuário não logado');
                return;
            }

            // Buscar todos os dados necessários em paralelo
            const [transacaoResponse, emissaoResponse, fonteResponse, usuarioResponse] = await Promise.all([
                this.apiCall('/api/transacao', { method: 'GET' }),
                this.apiCall('/api/emissao', { method: 'GET' }),
                this.apiCall('/api/fonteEmissao', { method: 'GET' }),
                this.apiCall(`/api/usuario/${userId}`, { method: 'GET' })
            ]);

            if (!transacaoResponse.ok || !emissaoResponse.ok || !fonteResponse.ok) {
                console.error('Erro ao buscar dados das APIs');
                return;
            }

            const transacoes = await transacaoResponse.json();
            const emissoes = await emissaoResponse.json();
            const fontes = await fonteResponse.json();
            const usuario = usuarioResponse.ok ? await usuarioResponse.json() : {};

            // Criar mapa de fontes para acesso rápido
            this.fontesMap = {};
            fontes.forEach(fonte => {
                const id = fonte.id || fonte._id;
                this.fontesMap[id] = fonte;
            });

            // Filtrar dados do usuário
            const userTransacoes = transacoes.filter(t => t.idUsuarioFK === userId);
            const userEmissoes = emissoes.filter(e => e.idUsuarioFK === userId);

            // Calcular estatísticas
            this.calculateStats(userEmissoes, userTransacoes, usuario);

            // Calcular tendência de emissões
            this.calculateEmissionsTrend(userEmissoes);

            // Carregar atividades recentes
            this.loadActivitiesFromData(userTransacoes, userEmissoes);

            console.log('Dados do dashboard carregados:', this.statsData);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        }
    }

    calculateStats(emissoes, transacoes, usuario) {
        // Emissões de Energia (tipoFonte = "Energia")
        let energyEmissions = 0;
        let fleetEmissions = 0;

        emissoes.forEach(e => {
            const fonte = this.fontesMap[e.idFonteFk];
            if (fonte) {
                const tipoFonte = (fonte.tipoFonte || '').toLowerCase();
                const co2 = e.quantidadeCo2 || 0;

                if (tipoFonte === 'energia') {
                    energyEmissions += co2;
                } else if (tipoFonte === 'frota de veículos') {
                    fleetEmissions += co2;
                }
            }
        });

        // Tokens disponíveis (saldoCompra do usuário)
        const availableTokens = usuario.saldoCompra || 0;

        // CO₂ Compensado (soma de quantidadeutilizada das transações de compensação)
        let compensatedEmissions = 0;
        transacoes.forEach(t => {
            if (t.tipotransacao === 'compensacao') {
                compensatedEmissions += t.quantidadeutilizada || 0;
            }
        });

        // Atualizar statsData
        this.statsData.energyEmissions = energyEmissions;
        this.statsData.fleetEmissions = fleetEmissions;
        this.statsData.availableTokens = availableTokens;
        this.statsData.compensatedEmissions = compensatedEmissions;
    }

    calculateEmissionsTrend(emissoes) {
        // Agrupar emissões por mês (últimos 6 meses)
        const now = new Date();
        const monthlyData = {};

        // Inicializar os últimos 6 meses com 0
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = 0;
        }

        // Somar emissões por mês
        emissoes.forEach(e => {
            if (e.dataRegistro) {
                const date = new Date(e.dataRegistro);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (monthlyData.hasOwnProperty(key)) {
                    monthlyData[key] += e.quantidadeCo2 || 0;
                }
            }
        });

        // Converter para array ordenado
        const sortedKeys = Object.keys(monthlyData).sort();
        this.statsData.monthlyTrend = sortedKeys.map(key => monthlyData[key]);
        this.statsData.monthlyLabels = sortedKeys.map(key => {
            const [year, month] = key.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return monthNames[parseInt(month) - 1];
        });

        console.log('Tendência de emissões:', this.statsData.monthlyTrend, this.statsData.monthlyLabels);
    }

    loadActivitiesFromData(transacoes, emissoes) {
        const atividades = [];

        // Processar transações (Tokenização e Compensação)
        transacoes.forEach(t => {
            const tipo = t.tipotransacao || '';
            let tipoExibicao = '';
            let descricao = '';

            if (tipo === 'compra') {
                tipoExibicao = 'Tokenização';
                descricao = 'Compra de Tokens de Projeto';
            } else if (tipo === 'venda') {
                tipoExibicao = 'Tokenização';
                descricao = 'Emissão de Tokens';
            } else if (tipo === 'compensacao') {
                tipoExibicao = 'Compensação';
                descricao = 'Compensação de Carbono';
            } else {
                return;
            }

            atividades.push({
                date: t.datacompensacao || new Date().toISOString(),
                type: tipoExibicao,
                description: descricao,
                value: `${this.formatNumber(t.quantidadeutilizada || 0)} kg CO₂`,
                status: 'success'
            });
        });

        // Processar emissões
        emissoes.forEach(e => {
            const fonte = this.fontesMap[e.idFonteFk];
            const tipoFonte = fonte ? fonte.tipoFonte : 'Desconhecido';

            atividades.push({
                date: e.dataRegistro || new Date().toISOString(),
                type: 'Emissão',
                description: `Registro de Emissão de ${tipoFonte}`,
                value: `${this.formatNumber(e.quantidadeCo2 || 0)} kg CO₂`,
                status: 'success'
            });
        });

        // Ordenar por data (mais recentes primeiro)
        atividades.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Pegar apenas as últimas 4
        this.statsData.recentActivities = atividades.slice(0, 4);
    }

    generateDashboardHTML() {
        return `
            <div class="page-title">
                <h1>Visão Geral</h1>
                <div>
                    <button class="btn btn-secondary" onclick="dashboardManager.generateReport()">
                        <i class="fas fa-download"></i> Gerar Relatório
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card stat-energy">
                    <div class="stat-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="stat-value">${this.formatNumber(this.statsData.energyEmissions)}</div>
                    <div class="stat-label">Emissões de Energia (kg CO₂)</div>
                    <div class="stat-subtitle">Este mês</div>
                </div>
                
                <div class="stat-card stat-fleet">
                    <div class="stat-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="stat-value">${this.formatNumber(this.statsData.fleetEmissions)}</div>
                    <div class="stat-label">Emissões da Frota (kg CO₂)</div>
                    <div class="stat-subtitle">Este mês</div>
                </div>
                
                <div class="stat-card stat-tokens">
                    <div class="stat-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="stat-value">${this.statsData.availableTokens}</div>
                    <div class="stat-label">Créditos Tokenizados</div>
                    <div class="stat-subtitle">Disponíveis</div>
                </div>
                
                <div class="stat-card stat-compensated">
                    <div class="stat-icon">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <div class="stat-value">${this.formatNumber(this.statsData.compensatedEmissions)}</div>
                    <div class="stat-label">Emissões Compensadas (kg CO₂)</div>
                    <div class="stat-subtitle">Total</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tendência de Emissões</h3>
                    <div>
                        <select class="form-control" id="trend-period" style="width: auto;">
                            <option value="6months">Últimos 6 meses</option>
                            <option value="1year">Último ano</option>
                            <option value="all">Desde o início</option>
                        </select>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-placeholder" id="emissions-chart">
                        Gráfico de Tendência de Emissões
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Atividades Recentes</h3>
                    <button class="btn btn-secondary" onclick="dashboardManager.viewAllActivities()">
                        Ver Todas
                    </button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateActivitiesHTML()}
                    </tbody>
                </table>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Metas de Sustentabilidade</h3>
                </div>
                <div class="form-group">
                    <label class="form-label">Progresso da Meta de Redução (20% até final do ano)</label>
                    <div style="background: #f0f0f0; border-radius: 10px; height: 20px; margin: 10px 0;">
                        <div style="background: var(--bb-green); height: 100%; width: 35%; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">
                            35%
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Próximas Ações Recomendadas</label>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <i class="fas fa-check-circle text-success"></i> Implementar energia solar
                        </li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                            <i class="fas fa-clock text-warning"></i> Otimizar rotas da frota
                        </li>
                        <li style="padding: 8px 0;">
                            <i class="fas fa-clock text-warning"></i> Substituir veículos por elétricos
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    generateActivitiesHTML() {
        if (this.statsData.recentActivities.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <p>Nenhuma atividade recente</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.statsData.recentActivities.map(activity => {
            // Definir badge de acordo com o tipo
            let badgeClass = 'badge-secondary';
            if (activity.type === 'Tokenização') {
                badgeClass = 'badge-info';
            } else if (activity.type === 'Compensação') {
                badgeClass = 'badge-success';
            } else if (activity.type === 'Emissão') {
                badgeClass = 'badge-warning';
            }

            return `
                <tr>
                    <td>${this.formatDate(activity.date)}</td>
                    <td><span class="badge ${badgeClass}">${activity.type}</span></td>
                    <td>${activity.description}</td>
                    <td>${activity.value}</td>
                    <td>
                        <span class="badge badge-success">Concluído</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderCharts() {
        const chartElement = document.getElementById('emissions-chart');
        if (chartElement) {
            const data = this.statsData.monthlyTrend || [];
            const labels = this.statsData.monthlyLabels || [];
            
            // Encontrar o valor máximo para escalar as barras
            const maxValue = Math.max(...data, 1);

            if (data.length === 0 || data.every(v => v === 0)) {
                chartElement.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 15px; color: #ccc;"></i>
                        <p>Nenhum dado de emissão nos últimos 6 meses</p>
                    </div>
                `;
                return;
            }

            chartElement.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: var(--bb-blue);">
                        Tendência de Emissões (kg CO₂) - Últimos 6 meses
                    </div>
                    <div style="display: flex; align-items: end; justify-content: center; height: 200px; gap: 15px;">
                        ${data.map((value, index) => `
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div style="font-size: 0.75rem; margin-bottom: 5px; color: #666;">${this.formatNumber(value)}</div>
                                <div style="background: linear-gradient(180deg, var(--bb-blue) 0%, var(--bb-dark-blue) 100%); width: 40px; height: ${Math.max((value / maxValue) * 150, 5)}px; border-radius: 4px 4px 0 0;"></div>
                                <div style="margin-top: 8px; font-size: 0.85rem; font-weight: 500;">${labels[index] || `Mês ${index + 1}`}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        const periodSelect = document.getElementById('trend-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.updateTrendChart(e.target.value);
            });
        }
    }

    updateTrendChart(period) {
        // Simulate data update based on period
        window.app.showNotification(`Período atualizado para: ${period}`, 'info');
        this.renderCharts();
    }

    generateReport() {
        window.app.showNotification('Relatório sendo gerado...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            window.app.showNotification('Relatório gerado com sucesso!', 'success');
            
            // Create a dummy download
            const blob = new Blob(['Relatório de Emissões BBTS'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_emissoes_bbts.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);
    }

    viewAllActivities() {
        window.app.showPage('monitoring-page');
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