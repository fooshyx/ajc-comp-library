"use client"

import { useState } from "react"
import { storageUtils } from "@/lib/storage"

export default function MigrationTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    try {
      // Get all localStorage data
      const localData = {
        traits: storageUtils.getTraits(),
        units: storageUtils.getUnits(),
        components: storageUtils.getComponents(),
        items: storageUtils.getItems()
      }

      // Send to migration API
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData)
      })

      const result = await response.json()
      setResults(result)

      if (response.ok) {
        alert('Migration completed successfully! Check the results below.')
      } else {
        alert(`Migration failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Migration error:', error)
      alert('Migration failed due to network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-yellow-800 mb-2">
        Database Migration Tool
      </h3>
      <p className="text-sm text-yellow-700 mb-4">
        This tool will migrate your localStorage data to the Postgres database. 
        Run this once after setting up the database.
      </p>
      
      <button
        onClick={handleMigration}
        disabled={isLoading}
        className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        {isLoading ? 'Migrating...' : 'Migrate to Database'}
      </button>

      {results && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">Migration Results:</h4>
          <div className="text-sm space-y-1">
            <div>Traits: {results.results?.traits?.success || 0} success, {results.results?.traits?.failed || 0} failed</div>
            <div>Units: {results.results?.units?.success || 0} success, {results.results?.units?.failed || 0} failed</div>
            <div>Components: {results.results?.components?.success || 0} success, {results.results?.components?.failed || 0} failed</div>
            <div>Items: {results.results?.items?.success || 0} success, {results.results?.items?.failed || 0} failed</div>
          </div>
        </div>
      )}
    </div>
  )
}