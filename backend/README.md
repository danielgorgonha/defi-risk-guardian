# DeFi Risk Guardian - Backend

Backend API for the DeFi risk management system, built with FastAPI and Stellar/Reflector integration.

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone the repository
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy the example file
cp env.example .env

# Edit environment variables
nano .env
```

### 3. Database

```bash
# Install PostgreSQL and Redis
# Ubuntu/Debian:
sudo apt-get install postgresql redis-server

# macOS:
brew install postgresql redis

# Create the database
createdb defi_risk

# Run migrations (when available)
alembic upgrade head
```

### 4. Run the Application

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

After starting the server, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── main.py                 # Application entry point
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database connection
│   │   └── security.py        # Authentication
│   ├── api/
│   │   └── v1/
│   │       ├── portfolio.py   # Portfolio endpoints
│   │       ├── risk.py        # Risk analysis
│   │       ├── alerts.py      # Alert system
│   │       └── rebalance.py   # Rebalancing
│   ├── services/
│   │   ├── reflector.py       # Reflector Oracle client
│   │   ├── stellar.py         # Stellar SDK client
│   │   └── risk_analyzer.py   # Risk analysis
│   ├── models/
│   │   ├── database.py        # SQLAlchemy models
│   │   └── schemas.py         # Pydantic schemas
│   └── utils/
│       └── helpers.py         # Helper functions
├── tests/                     # Tests
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🔧 Main Endpoints

### Portfolio
- `POST /api/v1/portfolio/users` - Create user
- `GET /api/v1/portfolio/{wallet_address}` - Get portfolio
- `POST /api/v1/portfolio/{wallet_address}/assets` - Add asset

### Risk Analysis
- `POST /api/v1/risk/analyze` - Complete risk analysis
- `GET /api/v1/risk/{wallet_address}/metrics` - Risk metrics

### Alerts
- `GET /api/v1/alerts/{wallet_address}` - Get alerts
- `GET /api/v1/alerts/{wallet_address}/active` - Active alerts
- `POST /api/v1/alerts/{wallet_address}` - Create alert

### Rebalancing
- `POST /api/v1/rebalance/suggest` - Suggest rebalancing
- `POST /api/v1/rebalance/execute` - Execute rebalancing
- `GET /api/v1/rebalance/{wallet_address}/history` - History

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific tests
pytest tests/test_portfolio.py
```

## 🐳 Docker

```bash
# Build image
docker build -t defi-risk-guardian-backend .

# Run container
docker run -p 8000:8000 defi-risk-guardian-backend
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (when implemented)
- **Logs**: Structured with loguru

## 🔒 Security

- **CORS**: Configured for frontend
- **Rate Limiting**: Implemented
- **Input Validation**: Pydantic schemas
- **SQL Injection**: Protected with SQLAlchemy

## 🚀 Deployment

### Railway/Render
```bash
# Configure environment variables
# DATABASE_URL, REDIS_URL, REFLECTOR_API_KEY

# Automatic deployment via Git
git push origin main
```

### Docker Compose
```bash
# Run complete stack
docker-compose up -d
```

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.
