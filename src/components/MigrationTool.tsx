"use client"

import { useState } from "react"
import { storageUtils } from "@/lib/storage"

export default function MigrationTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [dbInitialized, setDbInitialized] = useState(false)

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

  const handleInitDb = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (response.ok) {
        alert('Database tables created successfully!')
        setDbInitialized(true)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error initializing database:', error)
      alert('Failed to initialize database')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      })

      const result = await response.json()

      if (response.ok) {
        alert('Admin user created successfully! You can now log in.')
        setShowAdminForm(false)
        setAdminData({ username: "", email: "", password: "" })
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      alert('Failed to create admin user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          1. Initialize Database
        </h3>
        <p className="text-sm text-red-700 mb-4">
          First time setup: Create the database tables (users, traits, units, components, items).
        </p>
        
        <button
          onClick={handleInitDb}
          disabled={isLoading || dbInitialized}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {isLoading ? 'Creating Tables...' : dbInitialized ? '✓ Database Initialized' : 'Initialize Database'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">
          2. Setup Admin User
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Create your admin account to access user management and admin features.
        </p>
        
        {!showAdminForm ? (
          <button
            onClick={() => setShowAdminForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Admin User
          </button>
        ) : (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={adminData.username}
                onChange={(e) => setAdminData(prev => ({ ...prev, username: e.target.value }))}
                className="p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={adminData.email}
                onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                className="p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={adminData.password}
                onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                className="p-2 border border-gray-300 rounded-md"
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {isLoading ? 'Creating...' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdminForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          3. Database Migration Tool
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
    </div>
  )
}