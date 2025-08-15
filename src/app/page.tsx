import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to TFT Composition Library
        </h1>
        <p className="text-center text-lg mb-8">
          Your Teamfight Tactics composition management app with high-performance caching.
        </p>
        
        <div className="flex justify-center gap-6">
          <Link
            href="/builder"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Build Composition
          </Link>
          
          <Link
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Admin Panel
          </Link>
        </div>
        
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-3">Performance Features</h2>
          <div className="text-green-800 space-y-2">
            <div>• <strong>Instant Filtering:</strong> Unit cost filters work immediately with cached data</div>
            <div>• <strong>Fast Search:</strong> Search through units, traits, and items with zero delay</div>
            <div>• <strong>Offline Support:</strong> Cached data works even when disconnected</div>
            <div>• <strong>Smart Caching:</strong> Automatically refreshes when admins update data</div>
          </div>
        </div>
      </div>
    </div>
  )
}