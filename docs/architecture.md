# System Architecture

## Enterprise-Grade Infrastructure

Risk Guardian employs a modern, scalable architecture designed for institutional-grade DeFi risk management, processing real-time market data and delivering predictive analytics with 99.9% uptime reliability.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Risk Guardian                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  Backend (FastAPI)  │  AI/ML Engine     │
│  ┌─────────────────┐ │ ┌─────────────────┐ │ ┌───────────────┐  │
│  │   Dashboard     │ │ │   API Gateway   │ │ │ Risk Analyzer │  │
│  │   Portfolio     │ │ │   Auth Service  │ │ │ Anomaly Det.  │  │
│  │   Alerts        │ │ │   Data Service  │ │ │ Prophet Model │  │
│  └─────────────────┘ │ └─────────────────┘ │ └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Reflector  │  │   Stellar   │  │   Redis     │             │
│  │   Oracle    │  │   Horizon   │  │   Cache     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components

### 1. Frontend Layer (Next.js + TypeScript)

**Component Structure:**
```
frontend/
├── pages/                    # Next.js pages
├── components/
│   ├── dashboard/           # Dashboard components
│   ├── portfolio/           # Portfolio management
│   └── common/              # Shared components
├── hooks/                   # Custom React hooks
└── utils/                   # Utility functions
```

**Technologies:**
- Next.js 15.5.2 with App Router and TypeScript
- Tailwind CSS v4 for styling
- Recharts for data visualization
- React Query for state management
- Axios for HTTP requests
- pnpm for package management

### 2. Backend Layer (FastAPI + Python)

**Service Structure:**
```
backend/
├── app/
│   ├── main.py             # Application entry point
│   ├── core/               # Core configurations
│   ├── api/v1/             # API endpoints
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   └── utils/              # Helper functions
```

**Technologies:**
- FastAPI for web framework
- SQLAlchemy for ORM
- Celery for background tasks
- Redis for caching
- Pydantic for data validation
- Stellar SDK 13.0.0 for blockchain integration

### 3. AI/ML Engine

**Models:**
- **Isolation Forest**: Anomaly detection
- **Prophet**: Time series forecasting
- **Monte Carlo**: VaR calculation
- **Statistical Models**: Risk metrics

**Technologies:**
- Scikit-learn for ML algorithms
- Pandas for data manipulation
- NumPy for numerical computing
- Prophet for forecasting

### 4. Blockchain Integration

**Stellar SDK Integration:**
```python
class StellarClient:
    async def get_account_balances(account_id: str)
    async def get_trustlines(account_id: str)
    async def get_transaction_history(account_id: str)
```

**Reflector Oracle Integration:**
```python
class ReflectorClient:
    async def get_asset_price(asset_code: str) -> float
    async def get_price_history(asset_code: str, period: str) -> List[dict]
    async def get_supported_assets() -> List[dict]
```

## 🗄️ Data Architecture

### Database Schema
```sql
-- Core Tables
users (id, wallet_address, risk_tolerance, created_at)
portfolios (id, user_id, asset_code, balance, target_allocation)
price_history (id, asset_code, price_usd, timestamp, source)
risk_alerts (id, user_id, alert_type, severity, message, triggered_at)
risk_metrics (id, user_id, portfolio_value, var_95, volatility, calculated_at)
rebalance_history (id, user_id, old_allocation, new_allocation, executed_at)
```

### Caching Strategy
```python
CACHE_STRATEGY = {
    "price_data": {"ttl": 30, "key_prefix": "price:"},
    "risk_metrics": {"ttl": 300, "key_prefix": "risk:"},
    "portfolio_data": {"ttl": 60, "key_prefix": "portfolio:"},
    "ml_predictions": {"ttl": 600, "key_prefix": "ml:"}
}
```

## 🔄 Data Flow

### 1. Data Collection
```
Reflector Oracle → Backend API → Redis Cache → Database
     ↓
Stellar Horizon → Price Monitor → Risk Calculator
```

### 2. AI Processing
```
Historical Data → ML Models → Risk Analysis → Alerts
     ↓
Real-time Data → Anomaly Detection → WebSocket → Frontend
```

### 3. User Interface
```
User Action → Frontend → Backend API → Database Update
     ↓
Real-time Updates → WebSocket → Frontend State → UI Update
```

## 🚀 Deployment Architecture

### Development
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │   Redis     │
│ (Frontend)  │    │  (Backend)  │    │   Cloud     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Production
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │   Redis     │
│ (Frontend)  │    │  (Backend)  │    │   Cloud     │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │    │ PostgreSQL  │    │   Docker    │
│   (CI/CD)   │    │   (DB)      │    │ (Containers)│
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔒 Security

### Authentication & Authorization
- JWT tokens for stateless authentication
- Rate limiting for abuse protection
- CORS restrictive configuration
- Input validation and sanitization

### Data Security
- HTTPS for encrypted communication
- Environment variables for secrets
- Database encryption for sensitive data
- Automatic API key rotation

## 📊 Monitoring

### Performance Metrics
- Response time and latency
- Requests per second
- Error rates
- Cache hit rates

### Logs & Alerts
- Structured application logs
- Error tracking (Sentry)
- Health check monitoring
- Uptime monitoring

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for business logic
- Integration tests for APIs
- Database migration tests
- Performance tests

### Frontend Testing
- Component unit tests
- Integration tests
- End-to-end tests
- Visual regression tests

### AI/ML Testing
- Model accuracy tests
- Data validation tests
- Performance benchmarks
- A/B testing framework

---

## Scalability & Performance

**Enterprise Metrics:**
- **99.9% Uptime SLA** with automatic failover
- **< 100ms API Response Time** for critical risk calculations  
- **10M+ Transactions/Day** processing capacity
- **Auto-scaling** infrastructure handling traffic spikes

**Growth Projections:**
- Current: 500+ concurrent users
- 6 months: 1K+ institutional clients  
- 12 months: Cross-chain support for major protocols
- 18 months: Multi-region deployment with sub-50ms global latency