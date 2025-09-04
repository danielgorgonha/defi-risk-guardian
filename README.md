# Risk Guardian 🔐

**Risk Guardian** is an intelligent system for **automated DeFi risk management**, developed for **Stellar Hacks: KALE x Reflector 2025**.

## 🚀 Overview

A smart risk dashboard that combines:
- 📊 **Reflector Oracle** for reliable price feeds
- 🤖 **AI/ML** for risk analysis and anomaly detection
- ⚡ **Stellar SDK** for native blockchain integration
- 🖥️ **Intuitive interface** for automated management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   Next.js       │◄──►│   FastAPI       │◄──►│   Stellar SDK   │
│   + Tailwind    │    │   + Python IA   │    │   + Reflector   │
│   + Recharts    │    │   + PostgreSQL  │    │   + KALE        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# Clone and start all services
git clone <repository-url>
cd defi-risk-guardian
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
pnpm install
pnpm run dev
```

## 📊 Key Features

- **🔍 Intelligent Risk Analysis**: VaR, Beta, Sharpe Ratio with Monte Carlo simulation
- **⚡ Real-time Alerts**: Volatility, anomalies, liquidation risks
- **🎯 Auto-Rebalancing**: Configurable thresholds and slippage control
- **📱 Modern Interface**: Responsive dashboard with interactive charts

## 👥 Team

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Daniel Gorgonha** | Software Engineer | Backend FastAPI, Stellar SDK, Frontend Next.js |
| **Isaque Coelho** | AI Engineer | ML Models, Risk Analysis, AI Explainability |

## 📚 Documentation

- [📋 Project Proposal](docs/proposal.md) - Detailed problem, solution, and MVP
- [🏗️ Architecture](docs/architecture.md) - Technical architecture and stack
- [🛣️ Roadmap](docs/roadmap.md) - 4-day development roadmap
- [👥 Team](docs/team.md) - Team roles and responsibilities
- [🔧 Backend Docs](backend/README.md) - Backend API documentation
- [🎨 Frontend Docs](frontend/README.md) - Frontend development guide

## 🏆 Competitive Advantages

1. **Explainable AI**: Transparent decision-making process
2. **Native Integration**: Built on Reflector + KALE foundation
3. **Intuitive UX**: Democratizes complex DeFi concepts
4. **Real-time**: Instant alerts and analysis
5. **Advanced Simulation**: Test scenarios before execution

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built with ❤️ for Stellar Hacks: KALE x Reflector 2025**

## 🎯 Current Status

### ✅ Completed
- **Frontend**: Next.js 15.5.2 with App Router, Tailwind CSS v4, pnpm
- **Backend**: FastAPI with Stellar SDK 13.0.0, PostgreSQL, Redis
- **Components**: Dashboard, Portfolio, Risk Metrics, Alerts
- **Architecture**: Docker Compose setup, API integration
- **Branding**: Updated to "Risk Guardian"

### 🚧 In Progress
- Backend API endpoints implementation
- Real-time WebSocket connections
- AI/ML models integration

### 📋 Next Steps
- Connect frontend with backend APIs
- Implement real-time data updates
- Add advanced risk analysis features