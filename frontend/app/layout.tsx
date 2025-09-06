import type { Metadata } from 'next'
import './globals.css'
import { Header } from './components/common/Header'
import { ToastProvider } from './components/common/ToastProvider'
import { NavigationProvider } from './contexts/NavigationContext'

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
      <body className="antialiased pt-16" suppressHydrationWarning={true}>
        <NavigationProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </NavigationProvider>
      </body>
    </html>
  )
}
