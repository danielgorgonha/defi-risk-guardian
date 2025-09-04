import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'
import { useQuery } from 'react-query'
import { api } from '../utils/api'
import { PortfolioCard } from '../components/dashboard/PortfolioCard'
import { RiskMetrics } from '../components/dashboard/RiskMetrics'
import { AlertTimeline } from '../components/dashboard/AlertTimeline'
import { Header } from '../components/common/Header'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Home() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Demo data
  const demoWalletAddress = 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  // Fetch portfolio data
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = useQuery(
    ['portfolio', walletAddress],
    () => api.getPortfolio(walletAddress),
    {
      enabled: !!walletAddress,
      retry: false,
    }
  )

  // Fetch risk analysis
  const { data: riskAnalysis, isLoading: riskLoading } = useQuery(
    ['risk-analysis', walletAddress],
    () => api.analyzeRisk(walletAddress),
    {
      enabled: !!walletAddress,
      retry: false,
    }
  )

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery(
    ['alerts', walletAddress],
    () => api.getAlerts(walletAddress),
    {
      enabled: !!walletAddress,
      retry: false,
    }
  )

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address')
      return
    }
    
    try {
      // Try to create user if doesn't exist
      await api.createUser(walletAddress)
      toast.success('Wallet connected successfully!')
    } catch (error) {
      // User might already exist, that's ok
      console.log('User might already exist')
    }
  }

  const handleDemoMode = () => {
    setWalletAddress(demoWalletAddress)
    setIsDemoMode(true)
    toast.success('Demo mode activated!')
  }

  const features = [
    {
      icon: Shield,
      title: 'Intelligent Risk Analysis',
      description: 'Advanced AI to detect anomalies and calculate real-time risk metrics',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Auto-Rebalancing',
      description: 'Automatic rebalancing based on customizable thresholds',
      color: 'text-green-600'
    },
    {
      icon: AlertTriangle,
      title: 'Proactive Alerts',
      description: 'Instant notifications about risk changes and opportunities',
      color: 'text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Intuitive Dashboard',
      description: 'Modern and responsive interface for portfolio management',
      color: 'text-purple-600'
    }
  ]

  if (portfolioError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>DeFi Risk Guardian - Erro</title>
          <meta name="description" content="Sistema de gestão de risco em DeFi" />
        </Head>
        
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Error loading portfolio
            </h2>
            <p className="mt-2 text-gray-600">
              Please check if the wallet address is correct and try again.
            </p>
            <button
              onClick={() => setWalletAddress('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>DeFi Risk Guardian - Intelligent DeFi Risk Management</title>
        <meta name="description" content="Intelligent DeFi risk management system using AI and Reflector Oracle data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {!walletAddress ? (
        // Landing Page
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 rounded-full">
                <Shield className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              DeFi Risk Guardian
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Intelligent DeFi risk management system using AI, 
              Reflector Oracle data and Stellar infrastructure
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <form onSubmit={handleWalletSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your Stellar address..."
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-80"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  Connect
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              
              <button
                onClick={handleDemoMode}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Demo Mode
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Por que escolher o DeFi Risk Guardian?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Combinamos inteligência artificial, dados confiáveis e automação 
                para proteger seus investimentos DeFi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
                  <div className={`p-3 bg-gray-100 rounded-lg w-fit mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-blue-600 rounded-2xl text-center text-white">
            <Zap className="h-12 w-12 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para proteger seu portfólio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Conecte sua wallet Stellar e comece a usar o sistema de gestão de risco mais avançado
            </p>
            <button
              onClick={() => document.querySelector('input')?.focus()}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Começar Agora
            </button>
          </div>
        </div>
      ) : (
        // Dashboard
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isDemoMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Modo Demo Ativo</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Você está visualizando dados de demonstração. Conecte uma wallet real para usar o sistema completo.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              {portfolioLoading ? (
                <LoadingSpinner />
              ) : portfolio ? (
                <PortfolioCard portfolio={portfolio} />
              ) : null}
            </div>

            {/* Risk Metrics */}
            <div>
              {riskLoading ? (
                <LoadingSpinner />
              ) : riskAnalysis ? (
                <RiskMetrics riskAnalysis={riskAnalysis} />
              ) : null}
            </div>
          </div>

          {/* Alerts */}
          <div className="mt-8">
            {alertsLoading ? (
              <LoadingSpinner />
            ) : alerts ? (
              <AlertTimeline alerts={alerts} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
