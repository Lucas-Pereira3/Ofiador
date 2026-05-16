# Ofiador - Sistema de Gestão

Sistema de gestão integrado com backend em ASP.NET Core e frontend em React/Vite.

##  Pré-requisitos

- Docker e Docker Compose instalados
- `.NET SDK 10.0` (opcional, se quiser rodar localmente)
- PostgreSQL 15 (gerenciado via Docker)

##  Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/Lucas-Pereira3/Ofiador.git
cd Ofiador
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite `.env` com os valores desejados 


### 3. Subir os containers

```bash
docker-compose down -v  # Limpa volumes anteriores (primeira execução)
docker-compose up -d
```

Aguarde ~10 segundos para o PostgreSQL iniciar.

### 4. Aplicar migrations do banco de dados

```bash
docker exec -it ofiador_backend dotnet ef database update
```

**Saída esperada:**
```
Build started...
Build succeeded.
Applying migration '20260419130842_InitialCreate'.
Done.
```

### 5. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

---

## Arquitetura

```
Ofiador/
├── backend/
│   ├── Ofiador.API/              # Camada de apresentação (ASP.NET Core 10.0)
│   │   ├── Controllers/          # Endpoints da API
│   │   ├── DTOs/                 # Data Transfer Objects
│   │   ├── Program.cs            # Configuração da aplicação
│   │   └── Dockerfile
│   ├── Ofiador.Application/      # Serviços de aplicação e casos de uso
│   │   └── Services/             # Implementações da lógica de aplicação
│   ├── Ofiador.Domain/           # Entidades, agregados e regras de domínio
│   │   └── Models/
│   ├── Ofiador.Infrastructure/   # Persistência (EF Core), DbContext, Migrations
│   │   ├── Data/
│   │   └── Migrations/
│   └── Dockerfile
├── frontend/                      # React + Vite
│   ├── src/
│   ├── public/
│   └── Dockerfile
├── database/
│   └── init.sql                  # Scripts SQL (opcional)
├── docker-compose.yml            # Orquestração de containers
├── .env                          # Variáveis de ambiente
└── README.md                     # Este arquivo
```

---

## Stack Tecnológico

### Backend
- **Framework**: ASP.NET Core 10.0
- **ORM**: Entity Framework Core 10.0.6
- **Banco**: PostgreSQL 15
- **Autenticação**: JWT (configurado)
- **Criptografia**: BCrypt.Net-Next 4.1.0

### Frontend
- **Framework**: React/Vite
- **Porta**: 3000
- **Runtime**: Node.js

### Infraestrutura
- **Orquestração**: Docker Compose
- **Rede**: Bridge network (ofiador_network)
- **Persistência**: Volume nomeado (postgres_data)

---

## Principais Endpoints

### Health Check
```
GET /health
```

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
```

### WeatherForecast (exemplo)
```
GET /weatherforecast
```

---

## Operações Comuns

### Parar containers
```bash
docker-compose stop
```

### Reiniciar containers
```bash
docker-compose restart
```

### Ver logs do backend
```bash
docker-compose logs backend -f
```

### Ver logs do PostgreSQL
```bash
docker-compose logs postgres -f
```

### Conectar ao PostgreSQL
```bash
docker exec -it ofiador_db psql -U admin -d ofiador
```

### Listar tabelas do banco
```bash
docker exec -it ofiador_db psql -U admin -d ofiador -c "\dt"
```

### Remover tudo (containers + volumes)
```bash
docker-compose down -v
```

---

##  Adicionar Novas Migrations

Quando criar novos modelos/tabelas:

```bash
# 1. No seu PC (não no container)
cd backend/Ofiador.API
dotnet ef migrations add NomeDaMigracao

# 2. Dentro do container
docker exec -it ofiador_backend dotnet ef database update
```

---

## Segurança

- Senhas armazenadas com BCrypt (hash)
- CORS configurado
- JWT para autenticação
- Variáveis sensíveis em `.env` (não em `.csproj`)

---

##  Estrutura do Frontend

```
frontend/
├── src/
│   ├── assets/      # Imagens, fonts, CSS
│   ├── components/  # Componentes reutilizáveis
│   ├── pages/       # Páginas da aplicação
│   ├── services/    # APIs e chamadas HTTP
│   └── main.jsx     # Entrada da aplicação
├── .env             # Variáveis de ambiente
├── package.json
└── vite.config.js
```

---

##  Troubleshooting

### Erro: "Este host não é conhecido"
**Solução**: Certifique-se de que está usando `Host=postgres` no `.env` (não `localhost`).

### Erro: ".NET SDK não encontrado" ao rodar migrations
**Solução**: Use `docker exec -it ofiador_backend dotnet ef database update` (dentro do container).

### Porta 5432 já em uso
**Solução**: Altere a porta em `.env`:
```env
DB_PORT=5433
```
E em `docker-compose.yml`:
```yaml
ports:
  - "${DB_PORT}:5432"
```

### Container não inicia
**Solução**: Limpe volumes e recrie:
```bash
docker-compose down -v
docker-compose up -d
```



## Licença

Este projeto é licenciado sob a MIT License.

---

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

**Última atualização**: 2025
