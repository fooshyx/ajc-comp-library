"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()
  return (
    <div className="flex flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm">
        
        <div className="flex justify-center gap-6">
          <Link
            href="/builder"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Build Composition
          </Link>
          
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
    </div>
  )
}