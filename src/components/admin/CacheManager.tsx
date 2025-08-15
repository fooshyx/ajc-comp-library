"use client"

import { useState, useEffect } from "react"
import { hybridStorage } from "@/lib/hybridStorage"

export default function CacheManager() {
  const [cacheStatus, setCacheStatus] = useState<{
    units: { valid: boolean, lastUpdated?: string }
    traits: { valid: boolean, lastUpdated?: string }
    components: { valid: boolean, lastUpdated?: string }
    items: { valid: boolean, lastUpdated?: string }
  }>({
    units: { valid: false },
    traits: { valid: false },
    components: { valid: false },
    items: { valid: false }
  })
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Update cache status
  const updateCacheStatus = () => {
    const status = hybridStorage.getCacheStatus()
    setCacheStatus(status)
  }

  useEffect(() => {
    updateCacheStatus()
  }, [])

  const handleRefreshCache = async () => {
    setIsRefreshing(true)
    try {
      await hybridStorage.refreshCache()
      updateCacheStatus()
      alert('Cache refreshed successfully! Users will now see the latest data.')
    } catch (error) {
      console.error('Error refreshing cache:', error)
      alert('Failed to refresh cache')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClearCache = () => {
    setIsClearing(true)
    try {
      hybridStorage.clearCache()
      updateCacheStatus()
      alert('Cache cleared successfully! Users will fetch fresh data on their next visit.')
    } catch (error) {
      console.error('Error clearing cache:', error)
      alert('Failed to clear cache')
    } finally {
      setIsClearing(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (valid: boolean) => {
    return valid ? 'text-green-600' : 'text-red-600'
  }

  const getStatusText = (valid: boolean) => {
    return valid ? 'Valid' : 'Invalid/Expired'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cache Management</h2>
        <p className="text-gray-600 mb-6">
          Manage the performance cache that stores game data (traits, units, components, items) 
          locally for users. When you update game data, refresh the cache to ensure users see the latest information.
        </p>

        {/* Cache Status */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Cache Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(cacheStatus).map(([key, status]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{key}</h4>
                  <span className={`text-sm font-medium ${getStatusColor(status.valid)}`}>
                    {getStatusText(status.valid)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Last Updated:</div>
                  <div className="font-mono text-xs">
                    {formatDate(status.lastUpdated)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefreshCache}
                disabled={isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Cache'}
              </button>
              
              <button
                onClick={updateCacheStatus}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Check Status
              </button>
              
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {isClearing ? 'Clearing...' : 'Clear Cache'}
              </button>
            </div>
          </div>

          {/* Action Descriptions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Action Guide</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div>
                <strong>Refresh Cache:</strong> Fetches the latest data from the database and updates 
                the cache. Use this after making changes to game data to ensure users see updates immediately.
              </div>
              <div>
                <strong>Check Status:</strong> Updates the cache status display to show current cache validity.
              </div>
              <div>
                <strong>Clear Cache:</strong> Completely removes all cached data. Users will fetch 
                fresh data on their next visit. Use this for troubleshooting or major data changes.
              </div>
            </div>
          </div>

          {/* Performance Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Performance Benefits</h4>
            <div className="text-sm text-green-800 space-y-1">
              <div>• <strong>Fast Filtering:</strong> Unit cost filters work instantly with cached data</div>
              <div>• <strong>Quick Search:</strong> Searching through units/traits/items is near-instant</div>
              <div>• <strong>Reduced Server Load:</strong> Less database queries for game data</div>
              <div>• <strong>Better UX:</strong> Composition builder loads faster and feels more responsive</div>
              <div>• <strong>Offline Capable:</strong> Cached data works even when offline</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}