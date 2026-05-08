"use client"

import type React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react"
import { apiClient, type User } from "@/lib/api-client"

function extractAccessToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined
  const p = payload as Record<string, unknown>
  if (typeof p.accessToken === "string") return p.accessToken
  if (typeof p.token === "string") return p.token
  return undefined
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    email: string
    password: string
    username: string
    firstName?: string
    lastName?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token")
    apiClient.clearToken()
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const loadProfile = useCallback(
    async (token: string) => {
      try {
        const response = await apiClient.getProfile()
        if (response.data) {
          setAuthState({
            user: response.data,
            token,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          logout()
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
        logout()
      }
    },
    [logout],
  )

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      apiClient.setToken(token)
      void loadProfile(token)
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [loadProfile])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      if (response.data) {
        const token = extractAccessToken(response.data)
        const user = (response.data as { user: User }).user
        if (!token) {
          return { success: false as const, error: "No access token in response" }
        }
        localStorage.setItem("auth_token", token)
        apiClient.setToken(token)

        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        })

        return { success: true as const }
      }
      return { success: false as const, error: response.error }
    } catch {
      return { success: false as const, error: "Login failed" }
    }
  }, [])

  const register = useCallback(
    async (userData: {
      email: string
      password: string
      username: string
      firstName?: string
      lastName?: string
    }) => {
      try {
        const response = await apiClient.register(userData)
        if (response.data) {
          const token = extractAccessToken(response.data)
          const user = (response.data as { user: User }).user
          if (!token) {
            return { success: false as const, error: "No access token in response" }
          }
          localStorage.setItem("auth_token", token)
          apiClient.setToken(token)

          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          })

          return { success: true as const }
        }
        return { success: false as const, error: response.error }
      } catch {
        return { success: false as const, error: "Registration failed" }
      }
    },
    [],
  )

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userData)
      if (response.data) {
        const updated = response.data as User
        setAuthState((prev) => ({
          ...prev,
          user: updated,
        }))
        return { success: true as const }
      }
      return { success: false as const, error: response.error }
    } catch {
      return { success: false as const, error: "Profile update failed" }
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      login,
      register,
      logout,
      updateProfile,
    }),
    [authState, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
