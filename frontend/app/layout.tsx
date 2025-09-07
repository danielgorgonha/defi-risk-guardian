import type { Metadata } from 'next'
import './globals.css'
import { Header } from './components/common/Header'
import { ToastProvider } from './components/common/ToastProvider'
import { NavigationProvider } from './contexts/NavigationContext'
import { WalletProvider } from './contexts/WalletContext'

export const metadata: Metadata = {
  title: 'Risk Guardian',
  description: 'Intelligent DeFi risk management system powered by AI and Stellar blockchain',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased pt-16 min-h-screen" suppressHydrationWarning={true}>
        <NavigationProvider>
          <ToastProvider>
            <WalletProvider>
              <Header />
              {children}
            </WalletProvider>
          </ToastProvider>
        </NavigationProvider>
      </body>
    </html>
  )
}
