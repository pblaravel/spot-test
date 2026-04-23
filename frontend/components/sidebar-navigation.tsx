"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  PieChart,
  History,
  TrendingUp,
  Settings,
  User,
  CreditCard,
  Gift,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Wallet,
  BarChart3,
  ShoppingCart,
  Download,
  Bitcoin,
} from "lucide-react"

interface SidebarNavigationProps {
  isAuthenticated: boolean
  onLogout: () => void
}

export function SidebarNavigation({ isAuthenticated, onLogout }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  if (!isAuthenticated) return null

  const navigation = [
    {
      name: "Дашборд",
      href: "/dashboard",
      icon: Home,
      badge: null,
    },
    {
      name: "Портфель",
      href: "/portfolio",
      icon: PieChart,
      badge: null,
    },
    {
      name: "Торговля",
      href: "/trading",
      icon: TrendingUp,
      badge: null,
    },
    {
      name: "Транзакции",
      href: "/transactions",
      icon: History,
      badge: null,
    },
    {
      name: "Рынки",
      href: "/markets",
      icon: BarChart3,
      badge: null,
    },
  ]

  const quickActions = [
    {
      name: "Купить",
      href: "/buy",
      icon: ShoppingCart,
      badge: null,
    },
    {
      name: "Продать",
      href: "/sell",
      icon: Download,
      badge: null,
    },
    {
      name: "Пополнить",
      href: "/deposit",
      icon: CreditCard,
      badge: null,
    },
    {
      name: "Вывести",
      href: "/withdraw",
      icon: Wallet,
      badge: null,
    },
  ]

  const bottomNavigation = [
    {
      name: "Профиль",
      href: "/profile",
      icon: User,
      badge: null,
    },
    {
      name: "Настройки",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
    {
      name: "Реферальная программа",
      href: "/referral",
      icon: Gift,
      badge: "Новое",
    },
    {
      name: "Поддержка",
      href: "/support",
      icon: HelpCircle,
      badge: null,
    },
  ]

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CryptoSpot</span>
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <div className="px-3 mb-6">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Основное</h3>
            )}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {item.badge && (
                            <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">{item.badge}</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="px-3 mb-6">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Быстрые действия
              </h3>
            )}
            <nav className="space-y-1">
              {quickActions.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          {item.badge && (
                            <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">{item.badge}</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Notifications */}
          {!isCollapsed && (
            <div className="px-3 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Новые функции</h4>
                    <p className="text-xs text-blue-700 mt-1">Попробуйте автоинвестирование и получите бонус!</p>
                    <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      Узнать больше
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 p-3">
          <nav className="space-y-1">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3">{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-auto bg-green-500 text-white text-xs px-1.5 py-0.5">{item.badge}</Badge>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Выйти</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
