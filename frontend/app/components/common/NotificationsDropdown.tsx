'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  X,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useNavigation } from '../../contexts/NavigationContext'

interface Notification {
  id: string
  type: 'risk' | 'success' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { isDemoMode } = useNavigation()

  // Demo notifications for DeFi Risk Guardian
  const demoNotifications: Notification[] = [
    {
      id: '1',
      type: 'risk',
      title: 'High Risk Detected',
      message: 'Portfolio concentration risk increased to 85% in volatile assets. Consider rebalancing.',
      timestamp: '2 min ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'success',
      title: 'Risk Mitigation Successful',
      message: 'Automated rebalancing reduced portfolio risk by 12% while maintaining yield.',
      timestamp: '15 min ago',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Market Volatility Alert',
      message: 'Stellar network experiencing increased volatility. Monitor your positions closely.',
      timestamp: '1 hour ago',
      isRead: true,
      priority: 'high'
    },
    {
      id: '4',
      type: 'info',
      title: 'Yield Optimization',
      message: 'New yield farming opportunity detected: 15.2% APY on USDC/XLM pool.',
      timestamp: '2 hours ago',
      isRead: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'success',
      title: 'Portfolio Protected',
      message: 'AI Guardian prevented $2,847 loss during market dip. Risk management active.',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'medium'
    },
    {
      id: '6',
      type: 'warning',
      title: 'Liquidity Warning',
      message: 'Low liquidity detected in AQUA/XLM pair. Consider reducing position size.',
      timestamp: '4 hours ago',
      isRead: true,
      priority: 'medium'
    }
  ]

  useEffect(() => {
    if (isDemoMode) {
      setNotifications(demoNotifications)
      setUnreadCount(demoNotifications.filter(n => !n.isRead).length)
    } else {
      // In real mode, you would fetch notifications from API
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isDemoMode])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-blue-500'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 relative group notification-bell"
        title={isDemoMode ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <div className="relative">
          <Bell className="h-5 w-5 transition-all duration-200 group-hover:text-white" />
          {isDemoMode && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px] shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {isDemoMode ? 'Notifications' : 'Notifications'}
              </h3>
              {isDemoMode && unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {!isDemoMode ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Connect a wallet to receive notifications</p>
                  <p className="text-xs text-gray-400 mt-1">Real-time risk alerts and updates</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-white'
                    } hover:bg-gray-50 transition-colors cursor-pointer`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {isDemoMode && notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium w-full text-center">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
