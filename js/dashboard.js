// Dashboard functionality
class DashboardManager {
    constructor() {
        this.statsData = {
            energyEmissions: 1250,
            fleetEmissions: 2180,
            availableTokens: 15,
            compensatedEmissions: 850,
            monthlyTrend: [1200, 1350, 1100, 1250, 1400, 1300],
            recentActivities: [
                {
                    date: '2023-06-15',
                    type: 'Registro',
                    description: 'Emissões de energia - Junho',
                    value: '1,250 kg CO₂',
                    status: 'success'
                },
                {
                    date: '2023-06-10',
                    type: 'Tokenização',
                    description: 'Créditos por energia solar',
                    value: '5 tokens',
                    status: 'success'
                },
                {
                    date: '2023-06-05',
                    type: 'Compensação',
                    description: 'Compra de créditos de reflorestamento',
                    value: '850 kg CO₂',
                    status: 'success'
                },
                {
                    date: '2023-06-01',
                    type: 'Monitoramento',
                    description: 'Emissões da frota - Maio',
                    value: '2,180 kg CO₂',
                    status: 'warning'
                }
            ]
        };
        
        // Carrega imediatamente se já estiver na página
        if (document.getElementById('dashboard-page')?.classList.contains('active')) {
            setTimeout(() => this.loadDashboard(), 100);
        }
    }

    loadDashboard() {
        const dashboardElement = document.getElementById('dashboard-page');
        if (dashboardElement) {
            dashboardElement.innerHTML = this.generateDashboardHTML();
            this.renderCharts();
            this.setupEventListeners();
        }
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
        return this.statsData.recentActivities.map(activity => `
            <tr>
                <td>${this.formatDate(activity.date)}</td>
                <td>${activity.type}</td>
                <td>${activity.description}</td>
                <td>${activity.value}</td>
                <td>
                    <span class="badge badge-${activity.status}">
                        ${activity.status === 'success' ? 'Concluído' : 
                          activity.status === 'warning' ? 'Pendente' : 'Erro'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    renderCharts() {
        // This would integrate with a charting library like Chart.js
        // For now, we'll just display a placeholder
        const chartElement = document.getElementById('emissions-chart');
        if (chartElement) {
            // Simulate chart data
            const data = this.statsData.monthlyTrend;
            chartElement.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: var(--bb-blue);">
                        Tendência de Emissões (kg CO₂)
                    </div>
                    <div style="display: flex; align-items: end; justify-content: center; height: 200px; gap: 10px;">
                        ${data.map((value, index) => `
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div style="background: var(--bb-blue); width: 30px; height: ${(value / 1500) * 180}px; border-radius: 4px 4px 0 0;"></div>
                                <div style="margin-top: 5px; font-size: 0.8rem;">Mês ${index + 1}</div>
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