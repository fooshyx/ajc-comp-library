import type { Metadata } from "next"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"
import Header from "@/components/Header"
import { ThemeProvider } from "@/context/ThemeContext"

export const metadata: Metadata = {
  title: "TFT Composition Library",
  description: "A library for Teamfight Tactics compositions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}