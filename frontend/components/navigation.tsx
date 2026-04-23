"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bitcoin, Menu, X } from "lucide-react"
import { useAuth } from '@/hooks/use-auth'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()

  // Скрываем навигацию на страницах авторизованных пользователей
  const authPaths = [
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
  ]
  const hideNavigation =
    (isAuthenticated && authPaths.some((path) => pathname.startsWith(path))) ||
    pathname.startsWith("/trading")

  if (hideNavigation) return null

  const navigation = [
    { name: "Главная", href: "/" },
    { name: "Торговля", href: "/trading" },
    { name: "Рынки", href: "/markets" },
    { name: "Обучение", href: "/learn" },
    { name: "О нас", href: "/about" },
  ]

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CryptoSpot</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  pathname === item.href ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user && (
                  <span className="text-gray-700 font-medium">
                    {user.firstName || user.username || user.email}
                  </span>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Кабинет
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Профиль
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Войти
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-black text-white hover:bg-gray-800">Регистрация</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t">
            <nav className="flex flex-col space-y-4 mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors ${
                    pathname === item.href ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    {user && (
                      <span className="text-gray-700 font-medium px-3 py-1">
                        {user.firstName || user.username || user.email}
                      </span>
                    )}
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="justify-start text-gray-600 hover:text-gray-900 w-full">
                        Кабинет
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="justify-start text-gray-600 hover:text-gray-900 w-full">
                        Профиль
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="justify-start text-gray-600 hover:text-gray-900 w-full"
                    >
                      Выйти
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="justify-start text-gray-600 hover:text-gray-900 w-full">
                        Войти
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="justify-start bg-black text-white hover:bg-gray-800 w-full">
                        Регистрация
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
