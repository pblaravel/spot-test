import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "CryptoSpot - Торговля криптовалютами",
  description: "Современная платформа для торговли криптовалютами. Безопасно, быстро и с минимальными комиссиями.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
