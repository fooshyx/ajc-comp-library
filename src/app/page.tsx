"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import CompositionsList from "@/components/CompositionsList"
import CompositionBuilderModal from "@/components/CompositionBuilderModal"

export default function Home() {
  const { data: session } = useSession()
  const [builderOpen, setBuilderOpen] = useState(false)

  const handleOpenBuilder = () => {
    setBuilderOpen(true)
  }

  const handleCloseBuilder = () => {
    setBuilderOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TFT Composition Library</h1>
        <p className="text-lg text-gray-600 mb-8">Discover and share powerful team compositions</p>
        
        <div className="flex justify-center gap-6">
          {session && (
            <button
              onClick={handleOpenBuilder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Build Composition
            </button>
          )}
          
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Compositions Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Published Compositions</h2>
          {session && (
            <div className="text-sm text-gray-600">
              Click any composition to open it in the builder
            </div>
          )}
        </div>
        
        <CompositionsList 
          showPublicOnly={true} 
          allowEdit={!!session?.user?.id} 
        />
      </div>

      {/* User's Own Compositions */}
      {session?.user?.id && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Compositions</h2>
            <button
              onClick={handleOpenBuilder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Create New
            </button>
          </div>
          <CompositionsList 
            showPublicOnly={false} 
            allowEdit={true} 
          />
        </div>
      )}

      {/* Getting Started Section */}
      {!session && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Get Started</h3>
          <p className="text-blue-700 mb-4">
            Sign in to create your own compositions and access the builder tools
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Builder Modal */}
      <CompositionBuilderModal
        isOpen={builderOpen}
        onClose={handleCloseBuilder}
        editComposition={null}
        onSave={handleCloseBuilder}
      />
    </div>
  )
}