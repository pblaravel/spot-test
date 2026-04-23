"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarNavigation } from "./sidebar-navigation"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Проверяем, находимся ли мы на странице для авторизованных пользователей
  const isAuthenticatedPage = [
    "/dashboard",
    "/portfolio",
    "/trading",
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

  useEffect(() => {
    // В реальном приложении здесь будет проверка токена авторизации
    // Для демо устанавливаем true если пользователь на защищенной странице
    if (isAuthenticatedPage) {
      setIsAuthenticated(true)
    }
  }, [isAuthenticatedPage])

  const handleLogout = () => {
    setIsAuthenticated(false)
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
