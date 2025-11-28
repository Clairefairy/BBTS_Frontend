// Notifications functionality
class NotificationsManager {
    constructor() {
        this.notifications = [
            {
                id: 1,
                type: 'alert',
                priority: 'high',
                title: 'Emissões acima do limite',
                message: 'Suas emissões de energia deste mês excederam o limite estabelecido em 15%.',
                date: '2023-06-18T10:30:00',
                read: false,
                action: 'monitoring'
            },
            {
                id: 2,
                type: 'info',
                priority: 'medium',
                title: 'Novo projeto de compensação disponível',
                message: 'Projeto de reflorestamento na Amazônia com créditos verificados.',
                date: '2023-06-15T14:20:00',
                read: true,
                action: 'compensation'
            },
            {
                id: 3,
                type: 'success',
                priority: 'low',
                title: 'Registro na blockchain confirmado',
                message: 'Seu último registro de emissões foi confirmado na blockchain Ethereum.',
                date: '2023-06-12T09:15:00',
                read: true,
                action: 'registry'
            },
            {
                id: 4,
                type: 'warning',
                priority: 'medium',
                title: 'Tokens prestes a expirar',
                message: '5 dos seus tokens de carbono expiram em 30 dias.',
                date: '2023-06-10T16:45:00',
                read: false,
                action: 'tokenization'
            },
            {
                id: 5,
                type: 'info',
                priority: 'low',
                title: 'Atualização do sistema',
                message: 'Nova versão da plataforma disponível com melhorias no dashboard.',
                date: '2023-06-08T11:00:00',
                read: true,
                action: null
            },
            {
                id: 6,
                type: 'success',
                priority: 'low',
                title: 'Compensação realizada com sucesso',
                message: 'Sua compensação de 850 kg CO₂ foi registrada na blockchain.',
                date: '2023-06-05T14:30:00',
                read: true,
                action: 'compensation'
            }
        ];
    }

    loadNotificationsPage() {
        const pageElement = document.getElementById('notifications-page');
        if (pageElement) {
            pageElement.innerHTML = this.generateNotificationsHTML();
            this.setupEventListeners();
            this.updateNotificationBadge();
        }
    }

    generateNotificationsHTML() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const highPriorityCount = this.notifications.filter(n => n.priority === 'high' && !n.read).length;
        
        return `
            <div class="page-title">
                <h1>Notificações e Alertas</h1>
                <div>
                    <button class="btn btn-secondary" onclick="notificationsManager.markAllAsRead()">
                        <i class="fas fa-check-double"></i> Marcar Todas como Lidas
                    </button>
                    <button class="btn btn-danger" onclick="notificationsManager.clearAll()">
                        <i class="fas fa-trash"></i> Limpar Todas
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="stat-value">${this.notifications.length}</div>
                    <div class="stat-label">Total de Notificações</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="stat-value">${unreadCount}</div>
                    <div class="stat-label">Não Lidas</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-value">${highPriorityCount}</div>
                    <div class="stat-label">Alta Prioridade</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        Alertas do Sistema
                        ${unreadCount > 0 ? `<span class="badge badge-danger">${unreadCount} não lidas</span>` : ''}
                    </h3>
                    <div class="input-group">
                        <select class="form-control" id="filter-priority" style="width: auto;">
                            <option value="all">Todas as prioridades</option>
                            <option value="high">Alta prioridade</option>
                            <option value="medium">Média prioridade</option>
                            <option value="low">Baixa prioridade</option>
                        </select>
                        <select class="form-control" id="filter-status" style="width: auto;">
                            <option value="all">Todos os status</option>
                            <option value="unread">Não lidas</option>
                            <option value="read">Lidas</option>
                        </select>
                    </div>
                </div>
                
                <div id="notifications-list">
                    ${this.generateNotificationsListHTML()}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Preferências de Notificação</h3>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Frequência de Alertas</label>
                        <select class="form-control" id="alert-frequency">
                            <option value="realtime">Tempo real</option>
                            <option value="daily" selected>Diário</option>
                            <option value="weekly">Semanal</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Método de Envio</label>
                        <select class="form-control" id="delivery-method">
                            <option value="both">E-mail e Plataforma</option>
                            <option value="email">Apenas E-mail</option>
                            <option value="platform">Apenas Plataforma</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tipos de Notificação</label>
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
                    <div class="checkbox-group">
                        <input type="checkbox" id="notif-tokens" checked>
                        <label for="notif-tokens">Alertas de expiração de tokens</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="notif-system">
                        <label for="notif-system">Atualizações do sistema</label>
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="notificationsManager.savePreferences()">
                    <i class="fas fa-save"></i> Salvar Preferências
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Configurações de Alerta</h3>
                </div>
                <div class="form-group">
                    <label class="form-label">Limite de Emissões (kg CO₂/mês)</label>
                    <input type="number" class="form-control" id="emission-limit" value="3000" min="0">
                    <small class="form-text">Receba alertas quando suas emissões ultrapassarem este limite</small>
                </div>
                <div class="form-group">
                    <label class="form-label">Dias para Expiração de Tokens</label>
                    <input type="number" class="form-control" id="token-expiry-days" value="30" min="1">
                    <small class="form-text">Receba alertas quando tokens estiverem próximos de expirar</small>
                </div>
                <div class="form-group">
                    <label class="form-label">Horário para Resumo Diário</label>
                    <input type="time" class="form-control" id="daily-summary-time" value="09:00">
                    <small class="form-text">Horário para receber o resumo diário de atividades</small>
                </div>
            </div>
        `;
    }

    generateNotificationsListHTML() {
        if (this.notifications.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>Nenhuma notificação</p>
                    <p class="text-muted">Todas as notificações aparecerão aqui</p>
                </div>
            `;
        }

        return this.notifications.map(notification => `
            <div class="notification-item alert-${notification.priority} ${notification.read ? 'read' : 'unread'}" 
                 data-id="${notification.id}" data-priority="${notification.priority}" data-read="${notification.read}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)} ${this.getNotificationColor(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">
                        <strong>${notification.title}</strong>
                        ${!notification.read ? '<span class="badge badge-danger" style="margin-left: 10px;">Nova</span>' : ''}
                        <span class="badge badge-${notification.priority}" style="margin-left: 5px;">
                            ${this.getPriorityName(notification.priority)}
                        </span>
                    </div>
                    <p style="margin: 5px 0; color: #666;">${notification.message}</p>
                    <div class="notification-time">
                        <i class="fas fa-clock"></i> ${this.formatNotificationDate(notification.date)}
                    </div>
                </div>
                <div class="notification-actions">
                    ${notification.action ? `
                        <button class="btn btn-secondary btn-sm" onclick="notificationsManager.handleAction('${notification.action}')" title="Acessar">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    ` : ''}
                    ${!notification.read ? `
                        <button class="btn btn-success btn-sm" onclick="notificationsManager.markAsRead(${notification.id})" title="Marcar como lida">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : `
                        <button class="btn btn-warning btn-sm" onclick="notificationsManager.markAsUnread(${notification.id})" title="Marcar como não lida">
                            <i class="fas fa-envelope"></i>
                        </button>
                    `}
                    <button class="btn btn-danger btn-sm" onclick="notificationsManager.deleteNotification(${notification.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            alert: 'exclamation-triangle',
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-circle',
            error: 'times-circle'
        };
        return icons[type] || 'bell';
    }

    getNotificationColor(type) {
        const colors = {
            alert: 'text-danger',
            info: 'text-info',
            success: 'text-success',
            warning: 'text-warning',
            error: 'text-danger'
        };
        return colors[type] || 'text-secondary';
    }

    getPriorityName(priority) {
        const names = {
            high: 'Alta',
            medium: 'Média',
            low: 'Baixa'
        };
        return names[priority] || priority;
    }

    formatNotificationDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        
        return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }

    setupEventListeners() {
        const filterPriority = document.getElementById('filter-priority');
        const filterStatus = document.getElementById('filter-status');
        
        if (filterPriority) {
            filterPriority.addEventListener('change', (e) => {
                this.filterNotifications();
            });
        }
        
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.filterNotifications();
            });
        }
    }

    filterNotifications() {
        const priorityFilter = document.getElementById('filter-priority').value;
        const statusFilter = document.getElementById('filter-status').value;
        
        const notifications = document.querySelectorAll('.notification-item');
        
        notifications.forEach(notification => {
            const priority = notification.dataset.priority;
            const isRead = notification.dataset.read === 'true';
            
            let show = true;
            
            if (priorityFilter !== 'all' && priority !== priorityFilter) {
                show = false;
            }
            
            if (statusFilter === 'unread' && isRead) {
                show = false;
            } else if (statusFilter === 'read' && !isRead) {
                show = false;
            }
            
            notification.style.display = show ? 'flex' : 'none';
        });
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.loadNotificationsPage();
            window.app.showNotification('Notificação marcada como lida', 'success');
        }
    }

    markAsUnread(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = false;
            this.loadNotificationsPage();
            window.app.showNotification('Notificação marcada como não lida', 'success');
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.loadNotificationsPage();
        window.app.showNotification('Todas as notificações marcadas como lidas', 'success');
    }

    deleteNotification(notificationId) {
        if (confirm('Tem certeza que deseja excluir esta notificação?')) {
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.loadNotificationsPage();
            window.app.showNotification('Notificação excluída', 'success');
        }
    }

    clearAll() {
        if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
            this.notifications = [];
            this.loadNotificationsPage();
            window.app.showNotification('Todas as notificações foram limpas', 'success');
        }
    }

    handleAction(action) {
        // Navigate to the corresponding page
        switch(action) {
            case 'monitoring':
                window.app.showPage('monitoring-page');
                break;
            case 'compensation':
                window.app.showPage('compensation-page');
                break;
            case 'registry':
                window.app.showPage('registry-page');
                break;
            case 'tokenization':
                window.app.showPage('tokenization-page');
                break;
            default:
                window.app.showNotification('Ação não implementada', 'info');
        }
    }

    savePreferences() {
        window.app.showNotification('Preferências salvas com sucesso!', 'success');
        // In a real app, this would save to backend
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badgeElement = document.querySelector('.menu-item[data-page="notifications-page"] .badge');
        
        if (unreadCount > 0) {
            if (!badgeElement) {
                const menuItem = document.querySelector('.menu-item[data-page="notifications-page"]');
                if (menuItem) {
                    const badge = document.createElement('span');
                    badge.className = 'badge badge-danger';
                    badge.style.marginLeft = '10px';
                    badge.textContent = unreadCount;
                    menuItem.appendChild(badge);
                }
            } else {
                badgeElement.textContent = unreadCount;
            }
        } else if (badgeElement) {
            badgeElement.remove();
        }
    }

    // Method to add new notifications (could be called from other modules)
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            type: notification.type || 'info',
            priority: notification.priority || 'medium',
            title: notification.title,
            message: notification.message,
            date: new Date().toISOString(),
            read: false,
            action: notification.action || null
        };
        
        this.notifications.unshift(newNotification);
        this.updateNotificationBadge();
        
        // Show toast notification
        window.app.showNotification(notification.message, notification.type);
    }
}