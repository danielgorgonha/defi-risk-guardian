# DeFi Risk Guardian - Frontend

Frontend moderno para o sistema de gestão de risco em DeFi, construído com Next.js, TypeScript e Tailwind CSS.

## 🚀 Quick Start

### 1. Instalação

```bash
# Navegue para o diretório frontend
cd frontend

# Instale as dependências
npm install
# ou
yarn install
```

### 2. Configuração

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite as variáveis de ambiente
nano .env.local
```

### 3. Executar em Desenvolvimento

```bash
# Modo desenvolvimento
npm run dev
# ou
yarn dev

# Acesse http://localhost:3000
```

### 4. Build para Produção

```bash
# Build
npm run build
# ou
yarn build

# Executar build
npm start
# ou
yarn start
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── pages/
│   ├── _app.tsx              # App wrapper
│   ├── index.tsx             # Página inicial
│   ├── portfolio.tsx         # Gestão de portfólio
│   ├── alerts.tsx            # Centro de alertas
│   └── settings.tsx          # Configurações
├── components/
│   ├── common/
│   │   ├── Header.tsx        # Cabeçalho
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
│   ├── useWebSocket.ts       # Conexão WebSocket
│   ├── usePortfolio.ts       # Estado do portfólio
│   └── useRiskAnalysis.ts    # Análise de risco
├── utils/
│   ├── api.ts                # Cliente API
│   ├── formatters.ts         # Formatação de dados
│   └── constants.ts          # Constantes
├── styles/
│   └── globals.css           # Estilos globais
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## 🎨 Design System

### Cores
- **Primary**: Blue (600, 700, 800)
- **Success**: Green (500, 600, 700)
- **Warning**: Orange (500, 600, 700)
- **Danger**: Red (500, 600, 700)
- **Stellar**: Blue variants

### Componentes
- **Cards**: `card`, `card-hover`
- **Buttons**: `btn`, `btn-primary`, `btn-secondary`
- **Badges**: `badge`, `badge-success`, `badge-warning`
- **Risk Indicators**: `risk-indicator`, `risk-low`, `risk-high`

### Tipografia
- **Font Family**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

## 📱 Responsividade

- **Mobile First**: Design otimizado para mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid + Flexbox
- **Touch Friendly**: Botões e controles otimizados

## 🔧 Funcionalidades

### Dashboard Principal
- ✅ Visão geral do portfólio
- ✅ Métricas de risco em tempo real
- ✅ Timeline de alertas
- ✅ Gráficos interativos

### Gestão de Portfólio
- ✅ Lista de ativos
- ✅ Alocação atual vs target
- ✅ Adicionar/remover ativos
- ✅ Configurar alocações

### Sistema de Alertas
- ✅ Alertas em tempo real
- ✅ Filtros por severidade
- ✅ Resolver/ignorar alertas
- ✅ Histórico de alertas

### Análise de Risco
- ✅ Métricas avançadas (VaR, Sharpe, Beta)
- ✅ Score de risco geral
- ✅ Recomendações de IA
- ✅ Simulação de cenários

## 🎯 Componentes Principais

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

## 🔌 Integração com API

### Cliente HTTP
```tsx
import { api } from '../utils/api'

// Buscar portfólio
const portfolio = await api.getPortfolio(walletAddress)

// Análise de risco
const riskAnalysis = await api.analyzeRisk(walletAddress)

// Alertas
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

## 🎨 Customização

### Tema
Edite `tailwind.config.js` para personalizar:
- Cores
- Fontes
- Espaçamentos
- Animações

### Componentes
Todos os componentes são modulares e reutilizáveis:
- Props tipadas com TypeScript
- Estilos com Tailwind CSS
- Estados gerenciados com React Query

## 📊 Gráficos

### Recharts
```tsx
import { PieChart, LineChart, BarChart } from 'recharts'

<PieChart width={400} height={300}>
  <Pie data={data} dataKey="value" />
</PieChart>
```

### Tipos de Gráficos
- **Pie Chart**: Distribuição de ativos
- **Line Chart**: Evolução de preços
- **Bar Chart**: Métricas de risco
- **Area Chart**: Performance histórica

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy com domínio customizado
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy pasta 'out'
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

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📱 PWA (Progressive Web App)

### Configuração
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

### Features PWA
- ✅ Offline support
- ✅ Push notifications
- ✅ Install prompt
- ✅ App-like experience

## 🔒 Segurança

- **HTTPS**: Obrigatório em produção
- **CSP**: Content Security Policy
- **XSS Protection**: Sanitização de inputs
- **CSRF Protection**: Tokens de segurança

## 📈 Performance

### Otimizações
- **Code Splitting**: Lazy loading de componentes
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `@next/bundle-analyzer`
- **Caching**: React Query + SWR

### Métricas
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - veja [LICENSE](../LICENSE) para detalhes.
