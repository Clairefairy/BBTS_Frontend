# 🌱 BBTS - Sistema de Créditos de Carbono

<div align="center">

![BBTS Logo](https://img.shields.io/badge/BBTS-Créditos%20de%20Carbono-00875F?style=for-the-badge&logo=leaf&logoColor=white)

**Plataforma de gestão de emissões de carbono com tokenização em blockchain**

[![Deploy Status](https://img.shields.io/badge/deploy-online-success?style=flat-square&logo=netlify)](https://bbtscompensacao.netlify.app/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[🌐 Acessar Aplicação](https://bbtscompensacao.netlify.app/)

</div>

---

## 📋 Sobre o Projeto

O **BBTS** é uma plataforma web desenvolvida para gerenciar e rastrear emissões de carbono, permitindo que empresas monitorem suas emissões, tokenizem créditos de carbono e compensem sua pegada ambiental através de projetos sustentáveis.

### 🎯 Objetivos

- Monitorar emissões de energia e frota de veículos
- Tokenizar créditos de carbono usando tecnologia blockchain
- Facilitar a compensação de emissões através de projetos ambientais
- Fornecer dashboards e relatórios para tomada de decisão

---

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das emissões de energia e frota
- Gráfico de tendência de emissões (últimos 6 meses)
- Exibição de créditos tokenizados disponíveis
- Histórico de atividades recentes (emissões, tokenizações, compensações)

### 📈 Monitoramento de Emissões
- **Emissões de Energia**: Registro de consumo de energia (kWh) com cálculo automático de CO₂
  - Fontes: Rede Elétrica, Energia Solar, Energia Eólica, Hidrelétrica
  - Fatores de conversão específicos por fonte
- **Emissões de Frota**: Registro de consumo de combustível com cálculo automático de CO₂
  - Combustíveis: Diesel, Gasolina, Etanol, GNV
  - Fatores de emissão específicos por combustível
- Histórico completo de emissões por categoria
- Métodos de coleta: Manual, API, Dispositivo IoT

### 🪙 Tokenização
- **Mercado de Créditos**: Visualização de projetos disponíveis
- **Emissão de Tokens**: Conversão de reduções de emissão em tokens (1000 kg CO₂ = 1 token)
- **Compra de Tokens**: Aquisição de tokens de projetos verificados
- **Saldo de Tokens**: Exibição do saldo e valor estimado
- Cadastro de novos projetos (solar, eólica, reflorestamento, eficiência)

### 🌿 Compensação
- Catálogo de projetos de compensação
- Seleção de emissões específicas para compensar
- Cálculo automático de tokens necessários
- Tipos de projetos com impactos específicos:
  - Reflorestamento: 10 árvores plantadas por token
  - Energia Eólica: 250 kWh de energia limpa por token
  - Energia Solar: 500 kWh de energia solar por token
  - Eficiência Energética: 15% de eficiência por token
- Histórico completo de compensações

### 👤 Perfil do Usuário
- Visualização e edição de dados pessoais
- Alteração de senha com validação
- Integração com autenticação JWT

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização com variáveis CSS e design responsivo
- **JavaScript (ES6+)** - Lógica da aplicação com classes e async/await
- **Font Awesome** - Ícones

### Backend (API)
- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB** - Banco de dados
- **JWT** - Autenticação

### Deploy
- **Frontend**: [Netlify](https://netlify.com)
- **Backend**: [Render](https://render.com)

---

## 📁 Estrutura do Projeto

```
BBTS/
├── css/
│   ├── style.css          # Estilos principais
│   └── responsive.css     # Media queries para responsividade
├── js/
│   ├── app.js             # Controlador principal da aplicação
│   ├── auth.js            # Lógica de autenticação
│   ├── blockchain.js      # Integração com blockchain
│   ├── compensation.js    # Módulo de compensação
│   ├── dashboard.js       # Módulo do dashboard
│   ├── init.js            # Inicialização da aplicação
│   ├── monitoring.js      # Módulo de monitoramento
│   ├── notifications.js   # Sistema de notificações
│   └── tokenization.js    # Módulo de tokenização
├── Imagens/               # Assets de imagem
├── index.html             # Página principal (SPA)
└── README.md              # Documentação
```

---

## 🔌 API Endpoints

A aplicação se conecta à API em `https://back-end-blockchain.onrender.com/`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/usuario` | GET/POST/PUT | Gerenciamento de usuários |
| `/api/emissao` | GET/POST | Registro de emissões |
| `/api/fonteEmissao` | GET | Fontes de emissão (energia/frota) |
| `/api/projeto` | GET/POST/PUT | Projetos de compensação |
| `/api/transacao` | GET/POST | Transações (compra/venda/compensação) |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Edge)
- Servidor HTTP local (opcional)

### Execução

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/BBTS.git
cd BBTS
```

2. **Abra diretamente no navegador**
```bash
# Basta abrir o arquivo index.html no navegador
```

Ou use um servidor local:
```bash
# Com Python
python -m http.server 8080

# Com Node.js (npx)
npx serve
```

3. **Acesse a aplicação**
```
http://localhost:8080
```

---

## 📱 Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela:
- 📱 Mobile (até 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (acima de 1024px)

---

## 🔐 Autenticação

O sistema utiliza autenticação JWT (JSON Web Token):
- Tokens armazenados no `localStorage`
- Verificação de expiração automática
- Logout automático em caso de token inválido

---

## 🎨 Tema e Cores

O design utiliza a paleta de cores do Banco do Brasil com foco em sustentabilidade:

| Cor | Código | Uso |
|-----|--------|-----|
| Azul BB | `#004B8D` | Cor primária |
| Azul Escuro | `#003366` | Destaques |
| Verde | `#00875F` | Indicadores positivos |
| Amarelo | `#FCFC30` | Alertas e CTAs |

---

## 📊 Conversões e Cálculos

### Fatores de Emissão (Energia)
| Fonte | Fator (kg CO₂/kWh) |
|-------|-------------------|
| Rede Elétrica | 0.50 |
| Energia Solar | 0.05 |
| Energia Eólica | 0.01 |
| Hidrelétrica | 0.02 |

### Fatores de Emissão (Combustíveis)
| Combustível | Fator (kg CO₂/litro) |
|-------------|---------------------|
| Diesel | 2.68 |
| Gasolina | 2.31 |
| Etanol | 1.51 |
| GNV | 2.75 |

### Tokenização
- **1 Token** = 1.000 kg de CO₂ reduzido/compensado
- **Valor estimado**: R$ 45,50 por token

---

## 👥 Equipe

Projeto desenvolvido como parte da Residência de Software do **SENAC** em parceria com o **Banco do Brasil**.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 💚 para um futuro mais sustentável

[![Deploy on Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://bbtscompensacao.netlify.app/)

</div>
