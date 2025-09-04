# DeFi Risk Guardian - Frontend

Modern frontend for the DeFi risk management system, built with Next.js, TypeScript and Tailwind CSS.

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### 2. Configuration

```bash
# Copy the example file
cp env.local.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Run in Development

```bash
# Development mode
npm run dev
# or
yarn dev

# Access http://localhost:3000
```

### 4. Build for Production

```bash
# Build
npm run build
# or
yarn build

# Run build
npm start
# or
yarn start
```

## 🏗️ Project Structure

```
frontend/
├── pages/
│   ├── _app.tsx              # App wrapper
│   ├── index.tsx             # Home page
│   ├── portfolio.tsx         # Portfolio management
│   ├── alerts.tsx            # Alert center
│   └── settings.tsx          # Settings
├── components/
│   ├── common/
│   │   ├── Header.tsx        # Header
│   │   ├── LoadingSpinner.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── PortfolioCard.tsx
│   │   ├── RiskMetrics.tsx
│   │   └── AlertTimeline.tsx
│   └── portfolio/
│       ├── AssetCard.tsx
│       ├── RebalanceModal.tsx
│       └── AllocationSlider.tsx
├── hooks/
│   ├── useWebSocket.ts       # WebSocket connection
│   ├── usePortfolio.ts       # Portfolio state
│   └── useRiskAnalysis.ts    # Risk analysis
├── utils/
│   ├── api.ts                # API client
│   ├── formatters.ts         # Data formatting
│   └── constants.ts          # Constants
├── styles/
│   └── globals.css           # Global styles
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## 🎨 Design System

### Colors
- **Primary**: Blue (600, 700, 800)
- **Success**: Green (500, 600, 700)
- **Warning**: Orange (500, 600, 700)
- **Danger**: Red (500, 600, 700)
- **Stellar**: Blue variants

### Components
- **Cards**: `card`, `card-hover`
- **Buttons**: `btn`, `btn-primary`, `btn-secondary`
- **Badges**: `badge`, `badge-success`, `badge-warning`
- **Risk Indicators**: `risk-indicator`, `risk-low`, `risk-high`

### Typography
- **Font Family**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

## 📱 Responsiveness

- **Mobile First**: Mobile-optimized design
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid + Flexbox
- **Touch Friendly**: Optimized buttons and controls

## 🔧 Features

### Main Dashboard
- ✅ Portfolio overview
- ✅ Real-time risk metrics
- ✅ Alert timeline
- ✅ Interactive charts

### Portfolio Management
- ✅ Asset list
- ✅ Current vs target allocation
- ✅ Add/remove assets
- ✅ Configure allocations

### Alert System
- ✅ Real-time alerts
- ✅ Severity filters
- ✅ Resolve/ignore alerts
- ✅ Alert history

### Risk Analysis
- ✅ Advanced metrics (VaR, Sharpe, Beta)
- ✅ Overall risk score
- ✅ AI recommendations
- ✅ Scenario simulation

## 🎯 Main Components

### PortfolioCard
```tsx
<PortfolioCard 
  portfolio={portfolio} 
  onAddAsset={handleAddAsset}
  onEditAllocation={handleEditAllocation}
/>
```

### RiskMetrics
```tsx
<RiskMetrics 
  riskAnalysis={riskAnalysis}
  onRefresh={handleRefresh}
/>
```

### AlertTimeline
```tsx
<AlertTimeline 
  alerts={alerts}
  onResolveAlert={handleResolveAlert}
  onDeleteAlert={handleDeleteAlert}
/>
```

## 🔌 API Integration

### HTTP Client
```tsx
import { api } from '../utils/api'

// Get portfolio
const portfolio = await api.getPortfolio(walletAddress)

// Risk analysis
const riskAnalysis = await api.analyzeRisk(walletAddress)

// Alerts
const alerts = await api.getAlerts(walletAddress)
```

### React Query
```tsx
import { useQuery } from 'react-query'

const { data: portfolio, isLoading, error } = useQuery(
  ['portfolio', walletAddress],
  () => api.getPortfolio(walletAddress),
  { enabled: !!walletAddress }
)
```

## 🎨 Customization

### Theme
Edit `tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Animations

### Components
All components are modular and reusable:
- TypeScript typed props
- Tailwind CSS styles
- State managed with React Query

## 📊 Charts

### Recharts
```tsx
import { PieChart, LineChart, BarChart } from 'recharts'

<PieChart width={400} height={300}>
  <Pie data={data} dataKey="value" />
</PieChart>
```

### Chart Types
- **Pie Chart**: Asset distribution
- **Line Chart**: Price evolution
- **Bar Chart**: Risk metrics
- **Area Chart**: Historical performance

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy with custom domain
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy 'out' folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📱 PWA (Progressive Web App)

### Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // config
})
```

### PWA Features
- ✅ Offline support
- ✅ Push notifications
- ✅ Install prompt
- ✅ App-like experience

## 🔒 Security

- **HTTPS**: Required in production
- **CSP**: Content Security Policy
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Security tokens

## 📈 Performance

### Optimizations
- **Code Splitting**: Component lazy loading
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `@next/bundle-analyzer`
- **Caching**: React Query + SWR

### Metrics
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.