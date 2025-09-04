# DeFi Risk Guardian - Backend

Backend API para o sistema de gestão de risco em DeFi, construído com FastAPI e integração com Stellar/Reflector.

## 🚀 Quick Start

### 1. Setup do Ambiente

```bash
# Clone o repositório
cd backend

# Crie um ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instale as dependências
pip install -r requirements.txt
```

### 2. Configuração

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite as variáveis de ambiente
nano .env
```

### 3. Banco de Dados

```bash
# Instale PostgreSQL e Redis
# Ubuntu/Debian:
sudo apt-get install postgresql redis-server

# macOS:
brew install postgresql redis

# Crie o banco de dados
createdb defi_risk

# Execute as migrações (quando disponíveis)
alembic upgrade head
```

### 4. Executar a Aplicação

```bash
# Desenvolvimento
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Estrutura do Projeto

```
backend/
├── app/
│   ├── main.py                 # Entry point da aplicação
│   ├── core/
│   │   ├── config.py          # Configurações
│   │   ├── database.py        # Conexão com banco
│   │   └── security.py        # Autenticação
│   ├── api/
│   │   └── v1/
│   │       ├── portfolio.py   # Endpoints de portfólio
│   │       ├── risk.py        # Análise de risco
│   │       ├── alerts.py      # Sistema de alertas
│   │       └── rebalance.py   # Rebalanceamento
│   ├── services/
│   │   ├── reflector.py       # Cliente Reflector Oracle
│   │   ├── stellar.py         # Cliente Stellar SDK
│   │   └── risk_analyzer.py   # Análise de risco
│   ├── models/
│   │   ├── database.py        # Modelos SQLAlchemy
│   │   └── schemas.py         # Pydantic schemas
│   └── utils/
│       └── helpers.py         # Funções auxiliares
├── tests/                     # Testes
├── requirements.txt           # Dependências Python
└── README.md                  # Este arquivo
```

## 🔧 Endpoints Principais

### Portfolio
- `POST /api/v1/portfolio/users` - Criar usuário
- `GET /api/v1/portfolio/{wallet_address}` - Buscar portfólio
- `POST /api/v1/portfolio/{wallet_address}/assets` - Adicionar ativo

### Risk Analysis
- `POST /api/v1/risk/analyze` - Análise completa de risco
- `GET /api/v1/risk/{wallet_address}/metrics` - Métricas de risco

### Alerts
- `GET /api/v1/alerts/{wallet_address}` - Buscar alertas
- `GET /api/v1/alerts/{wallet_address}/active` - Alertas ativos
- `POST /api/v1/alerts/{wallet_address}` - Criar alerta

### Rebalancing
- `POST /api/v1/rebalance/suggest` - Sugerir rebalanceamento
- `POST /api/v1/rebalance/execute` - Executar rebalanceamento
- `GET /api/v1/rebalance/{wallet_address}/history` - Histórico

## 🧪 Testes

```bash
# Executar todos os testes
pytest

# Executar com coverage
pytest --cov=app

# Executar testes específicos
pytest tests/test_portfolio.py
```

## 🐳 Docker

```bash
# Build da imagem
docker build -t defi-risk-guardian-backend .

# Executar container
docker run -p 8000:8000 defi-risk-guardian-backend
```

## 📊 Monitoramento

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (quando implementado)
- **Logs**: Estruturados com loguru

## 🔒 Segurança

- **CORS**: Configurado para frontend
- **Rate Limiting**: Implementado
- **Input Validation**: Pydantic schemas
- **SQL Injection**: Protegido com SQLAlchemy

## 🚀 Deploy

### Railway/Render
```bash
# Configure as variáveis de ambiente
# DATABASE_URL, REDIS_URL, REFLECTOR_API_KEY

# Deploy automático via Git
git push origin main
```

### Docker Compose
```bash
# Executar stack completo
docker-compose up -d
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - veja [LICENSE](../LICENSE) para detalhes.
