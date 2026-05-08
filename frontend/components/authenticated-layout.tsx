"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SidebarNavigation } from "./sidebar-navigation"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Страница торговли выводится во всю ширину без левого меню.
  const isAuthenticatedPage = [
    "/dashboard",
    "/portfolio",
    "/transactions",
    "/buy",
    "/sell",
    "/deposit",
    "/withdraw",
    "/profile",
    "/settings",
    "/referral",
    "/support",
  ].some((path) => pathname.startsWith(path))

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticatedPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="flex-1 ml-64 overflow-auto">{children}</div>
    </div>
  )
}
