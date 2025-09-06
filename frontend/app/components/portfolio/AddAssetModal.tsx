'use client'

import { useState } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import { api } from '../../utils/api'
import { useToast } from '../common/ToastProvider'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
  onAssetAdded: () => void
}

export function AddAssetModal({ isOpen, onClose, walletAddress, onAssetAdded }: AddAssetModalProps) {
  const [formData, setFormData] = useState({
    asset_code: '',
    asset_issuer: '',
    balance: '',
    target_allocation: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.asset_code.trim()) {
      newErrors.asset_code = 'Asset code is required'
    }
    
    if (!formData.balance.trim() || isNaN(Number(formData.balance)) || Number(formData.balance) <= 0) {
      newErrors.balance = 'Valid balance is required'
    }
    
    if (!formData.target_allocation.trim() || isNaN(Number(formData.target_allocation)) || Number(formData.target_allocation) < 0 || Number(formData.target_allocation) > 100) {
      newErrors.target_allocation = 'Target allocation must be between 0 and 100'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      await api.addAsset(walletAddress, {
        asset_code: formData.asset_code.trim().toUpperCase(),
        asset_issuer: formData.asset_issuer.trim() || undefined,
        balance: Number(formData.balance),
        target_allocation: Number(formData.target_allocation)
      })
      
      toast.showSuccess('Asset Added', 'Asset has been added to your portfolio successfully!')
      onAssetAdded()
      handleClose()
      
    } catch (error: any) {
      console.error('Error adding asset:', error)
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.showError('Portfolio Not Found', 'Please create a portfolio first by connecting your wallet.')
      } else if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail || 'Invalid asset data'
        toast.showError('Invalid Data', errorDetail)
      } else {
        toast.showError('Add Asset Error', error.response?.data?.detail || 'Failed to add asset. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      asset_code: '',
      asset_issuer: '',
      balance: '',
      target_allocation: ''
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Asset</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Asset Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Code *
            </label>
            <input
              type="text"
              value={formData.asset_code}
              onChange={(e) => handleInputChange('asset_code', e.target.value.toUpperCase())}
              placeholder="e.g., XLM, USDC, BTC"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 text-gray-900 ${
                errors.asset_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.asset_code && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.asset_code}
              </p>
            )}
          </div>

          {/* Asset Issuer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Issuer (Optional)
            </label>
            <input
              type="text"
              value={formData.asset_issuer}
              onChange={(e) => handleInputChange('asset_issuer', e.target.value)}
              placeholder="e.g., GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 text-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for native Stellar assets (XLM)
            </p>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Balance *
            </label>
            <input
              type="number"
              step="0.0000001"
              value={formData.balance}
              onChange={(e) => handleInputChange('balance', e.target.value)}
              placeholder="e.g., 1000.50"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 text-gray-900 ${
                errors.balance ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.balance && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.balance}
              </p>
            )}
          </div>

          {/* Target Allocation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Allocation (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.target_allocation}
              onChange={(e) => handleInputChange('target_allocation', e.target.value)}
              placeholder="e.g., 25.0"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400 text-gray-900 ${
                errors.target_allocation ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.target_allocation && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.target_allocation}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Percentage of portfolio this asset should represent
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
