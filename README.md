# 🌱 BBTS - Sistema de Créditos de Carbono
![BBTS Logo](https://img.shields.io/badge/BBTS-Cr%C3%A9ditos%20de%20Carbono-00875F?style=for-the-badge&logo=leaf&logoColor=white)

**Plataforma de gestão de emissões de carbono, focada em Empresas, que utiliza Blockchain para garantir a rastreabilidade e a tokenização de créditos.**

[![Deploy Status](https://img.shields.io/badge/deploy-online-success?style=flat-square&logo=netlify)](https://bbtscompensacao.netlify.app/)[![Backend API](https://img.shields.io/badge/API-Render-000000?style=flat-square&logo=render)](https://back-end-blockchain.onrender.com/)[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[🌐 Acessar Aplicação](https://bbtscompensacao.netlify.app/) \| [🔗 Documentação da API (Swagger)](https://back-end-blockchain.onrender.com/api-docs/)

</div>

---

## 📋 Sobre o Projeto

O projeto consiste numa plataforma web completa desenvolvida para auxiliar **Empresas** no gerenciamento e rastreamento de suas emissões de carbono. A solução permite que as organizações monitorem detalhadamente sua pegada de carbono, tokenizem créditos de carbono e realizem a compensação ambiental através de projetos sustentáveis, tudo com a **transparência e imutabilidade da tecnologia blockchain**.

### 🎯 Objetivos

- **Monitoramento Preciso:** Rastrear emissões de fontes primárias como consumo de energia e frota de veículos.

- **Tokenização em Blockchain:** Converter reduções de emissão em ativos digitais (tokens) na **Blockchain**, garantindo sua autenticidade e rastreabilidade.

- **Compensação Eficaz:** Facilitar a compensação de emissões através de um catálogo de projetos ambientais verificados.

- **Transparência:** Fornecer dashboards e relatórios detalhados para auditoria e tomada de decisão.

---

## ✨ Funcionalidades Principais

A plataforma é estruturada em módulos que cobrem todo o ciclo de vida da gestão de carbono:

| Módulo | Descrição | Destaques |
| --- | --- | --- |
| **Dashboard** | Visão geral e indicadores chave de performance (KPIs). | Emissões totais, créditos tokenizados disponíveis, emissões compensadas. |
| **Monitoramento** | Registro e cálculo de emissões de CO₂. | Emissões de Energia (Rede, Solar, Eólica) e Emissões de Frota (Diesel, Gasolina, Etanol). |
| **Tokenização** | Gerenciamento de créditos de carbono como tokens. | Emissão de tokens (1 token = 1.000 kg CO₂), compra/venda e saldo de tokens. **Usa a Blockchain.** |
| **Compensação** | Seleção e execução de projetos de compensação. | Catálogo de projetos (Reflorestamento, Energia Limpa) e cálculo automático de tokens necessários. |
| **Registro Blockchain** | Visualização das transações registradas na rede. | Rastreabilidade e imutabilidade de todas as transações de tokenização e compensação. |

---

## 🛠️ Tecnologias Utilizadas

O projeto é uma aplicação *full-stack* dividida em Frontend e Backend:

### Frontend (Interface do Usuário)

| Tecnologia | Função |
| --- | --- |
| **HTML5, CSS3** | Estrutura e Estilização (Design Responsivo) |
| **JavaScript (ES6+)** | Lógica da Aplicação (SPA - Single Page Application) |
| **MetaMask** | Conexão com a carteira Ethereum para Tokenização |
| **Font Awesome** | Biblioteca de Ícones |

### Backend (API RESTful)

| Tecnologia | Função |
| --- | --- |
| **Node.js** | Ambiente de Execução |
| **Express** | Framework Web para Roteamento |
| **MongoDB (Mongoose)** | Banco de Dados NoSQL |
| **JWT** | Autenticação e Autorização de Usuários |
| **Ethereum** | Blockchain para registro de transações e tokenização |

### Deploy

- **Frontend:** [Netlify](https://bbtscompensacao.netlify.app/)

- **Backend:** [Render](https://back-end-blockchain.onrender.com/)

---

## 🔌 API Endpoints

A aplicação se comunica com a API RESTful hospedada em `https://back-end-blockchain.onrender.com/`.

A documentação completa e interativa da API está disponível no **Swagger**: [🔗 back-end-blockchain.onrender.com/api-docs/](https://back-end-blockchain.onrender.com/api-docs/)

| Módulo | Endpoints Principais | Descrição |
| --- | --- | --- |
| **Usuários** | `/api/usuario`, `/api/usuario/login` | Criação, Login e Gerenciamento de perfis. |
| **Emissões** | `/api/emissao`, `/api/consumoEnergia`, `/api/frotaVeiculo` | Registro e consulta de todas as fontes de emissão. |
| **Créditos** | `/api/creditoCarbono` | Gerenciamento e tokenização de créditos. |
| **Compensação** | `/api/transacaoCompensacao`, `/api/projeto` | Registro de transações de compensação e projetos disponíveis. |

---

## 🚀 Como Executar Localmente

Este repositório contém o código do **Frontend** (SPA).

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Edge).

- Um servidor HTTP local (opcional, mas recomendado para evitar problemas de CORS).

### Execução do Frontend

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/BBTS_Frontend.git # Use o link correto do seu repositório
   cd BBTS_Frontend
   ```

1. **Abra diretamente no navegador**

   ```bash
   # Basta abrir o arquivo index.html no navegador
   ```

   *Ou utilize um servidor local simples:*

   ```bash
   # Exemplo com Python (se instalado )
   python3 -m http.server 8080
   
   # Exemplo com Node.js (se instalado )
   npx serve
   ```

1. **Acesse a aplicação**

   ```
   http://localhost:8080
   ```

### Execução do Backend

O código do Backend está disponível em um repositório separado: [brandaowalison/back-end-blockchain](https://github.com/brandaowalison/back-end-blockchain).

Para rodar o backend localmente, siga as instruções no README.md do repositório:

1. Clone o repositório do backend.

1. Instale as dependências (`npm install`).

1. Configure o arquivo `.env` (PORT, MONGODB_URI, JWT_SECRET).

1. Execute a aplicação (`npm run dev` ou `node server.js`).

---

## 📊 Conversões e Cálculos

A plataforma utiliza fatores de emissão e conversão padronizados para calcular a pegada de carbono e a tokenização:

### Fatores de Emissão (Exemplos)

| Fonte | Fator (kg CO₂/unidade) |
| --- | --- |
| Rede Elétrica | 0.50 kg CO₂/kWh |
| Diesel | 2.68 kg CO₂/litro |

### Tokenização

- **1 Token** = 1.000 kg de CO₂ reduzido/compensado

- **Valor estimado:** R$ 45,50 por token

---

## 👥 Equipe e Licença

Projeto desenvolvido como parte da Residência de Software do **SENAC** em parceria com o **Banco do Brasil Tecnologia e Serviços**.

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 💚 para um futuro mais sustentável

[![Deploy on Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://bbtscompensacao.netlify.app/)

</div>
