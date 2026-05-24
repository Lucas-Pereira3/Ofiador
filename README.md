# OFIADOR - Sistema de Controle de Vendas Fiado

O OFIADOR é um sistema desenvolvido para gerenciamento de vendas realizadas no fiado, permitindo o controle de clientes, compras, parcelas, faturas, pagamentos e relatórios financeiros.

O projeto foi desenvolvido como atividade prática da disciplina de C#/.NET – Desenvolvimento de API, simulando um ambiente real de mercado com separação de responsabilidades entre Backend, Frontend, QA e Análise de Projetos.

---

# Funcionalidades Principais

- Cadastro de usuários
- Autenticação JWT
- Cadastro de empresas
- Cadastro de clientes
- Controle de limite de crédito
- Registro de compras no fiado
- Geração automática de parcelas
- Geração de faturas mensais
- Registro de pagamentos
- Atualização automática de status
- Relatórios de contas a receber
- Consulta por período
- Consulta de dívida por cliente

---

# Tecnologias Utilizadas

## Backend
- ASP.NET Core 10
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- BCrypt
- Swagger/OpenAPI
- Docker

## Frontend
- React
- Vite
- JavaScript
- CSS

## Banco de Dados
- PostgreSQL 15

## Infraestrutura
- Docker Compose

## Testes
- xUnit
- dotnet test
- Swagger
- Postman

---

# Arquitetura do Projeto

O sistema foi desenvolvido utilizando arquitetura em camadas, separando responsabilidades entre API, regras de negócio, domínio e persistência.

```text
Ofiador/
├── backend/
│
│   ├── Ofiador.API/
│   │   ├── Controllers/
│   │   ├── DTOs/
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   └── Dockerfile
│
│   ├── Ofiador.Application/
│   │   ├── Services/
│   │   └── Interfaces/
│
│   ├── Ofiador.Domain/
│   │   ├── Entities/
│   │   ├── Models/
│   │   └── Rules/
│
│   ├── Ofiador.Infrastructure/
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Migrations/
│
│   └── Tests/
│       ├── UnitTests/
│       └── IntegrationTests/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── docker-compose.yml
├── .env
└── README.md
Banco de Dados

O sistema utiliza PostgreSQL como banco de dados relacional.

Principais Tabelas
Usuarios
Empresas
Clientes
Compras
Faturas
Pagamentos
compra_parcela
Estrutura das Entidades
Usuários

Responsável pela autenticação e acesso ao sistema.

Empresas

Representa a empresa responsável pelo gerenciamento das vendas fiado.

Clientes

Armazena os dados dos clientes e o limite de crédito.

Compras

Registra as compras realizadas pelos clientes.

Faturas

Agrupa compras e controla valores pendentes.

Pagamentos

Controla pagamentos realizados nas faturas.

Compra_Parcela

Controla parcelamento, vencimento e status de pagamento das parcelas.

Pré-requisitos

Antes de iniciar o projeto, é necessário possuir instalado:

Docker
Docker Compose
.NET SDK 10 (opcional)
Node.js
PostgreSQL (caso não utilize Docker)
Instalação e Execução
1. Clonar o repositório
git clone https://github.com/Lucas-Pereira3/Ofiador.git
cd Ofiador
2. Configurar variáveis de ambiente

Copie o arquivo:

cp .env.example .env

Configure as variáveis conforme necessário.

3. Subir containers Docker
docker-compose down -v
docker-compose up -d
4. Aplicar migrations
docker exec -it ofiador_backend dotnet ef database update
5. Executar aplicação
Frontend
http://localhost:3000
Backend
http://localhost:8080
Swagger
http://localhost:8080/swagger
Autenticação JWT

O sistema utiliza autenticação JWT para proteção das rotas privadas.

Endpoints de autenticação
POST /api/auth/register
POST /api/auth/login

Após autenticação, o token JWT deve ser enviado no header:

Authorization: Bearer TOKEN
Principais Endpoints da API
Usuários
POST /api/auth/register
POST /api/auth/login
Empresas
GET /api/empresas
GET /api/empresas/{id}
POST /api/empresas
PUT /api/empresas/{id}
DELETE /api/empresas/{id}
Clientes
GET /api/clientes
GET /api/clientes/{id}
POST /api/clientes
PUT /api/clientes/{id}
DELETE /api/clientes/{id}
Compras
GET /api/compras
GET /api/compras/{clienteId}
POST /api/compras
Faturas
POST /api/faturas
GET /api/faturas/{clienteId}
PATCH /api/faturas/{id}/pagar
Relatórios
GET /api/relatorios/contas-a-receber
GET /api/relatorios/contas-a-receber?dataInicio=&dataFim=
Regras de Negócio
RN01

Cada cliente pertence a uma empresa.

RN02

Toda compra deve estar vinculada a um cliente.

RN03

O sistema deve validar limite de crédito do cliente antes da compra.

RN04

Compras podem ser parceladas.

RN05

As parcelas devem possuir vencimento individual.

RN06

Pagamentos atualizam automaticamente os valores pendentes.

RN07

Toda fatura gerada inicia com status "Pendente".

RN08

Faturas podem ser atualizadas para "Paga".

RN09

O sistema deve controlar quantidade total e parcelas pagas.

RN10

Consultas financeiras devem permitir filtro por período.

Processo de Testes

O projeto possui plano de testes estruturado contendo:

Testes funcionais
Testes de integração
Testes unitários
Testes de autenticação JWT
Testes de validação
Testes de relatórios
Executar testes
dotnet test
Fluxo do Sistema
Frontend → API → Services → Repositories → PostgreSQL
Segurança
Senhas criptografadas com BCrypt
Autenticação JWT
Rotas protegidas
Variáveis sensíveis em .env
Versionamento

O projeto utiliza GitHub para versionamento e controle de Pull Requests.

Repositório:

https://github.com/Lucas-Pereira3/Ofiador
Equipe do Projeto
Integrante	Função
Matheus Sossai	Analista de Projetos
Pedro Henrique	Backend
João Victor	Backend
Lucas Pereira	Frontend
Vitória	Frontend
Charles	QA
Possíveis Melhorias Futuras
Dashboard financeiro
Notificações automáticas
Controle de inadimplência
Exportação PDF/Excel
Histórico detalhado de pagamentos
Relatórios gráficos
Controle de permissões
Troubleshooting
Docker não inicia
docker-compose down -v
docker-compose up -d
Erro de migration
docker exec -it ofiador_backend dotnet ef database update
Porta PostgreSQL ocupada

Alterar no .env:

DB_PORT=5433
Licença

Projeto acadêmico desenvolvido para fins educacionais.

Última atualização

2026
