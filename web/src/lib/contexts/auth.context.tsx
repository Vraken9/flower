// ============================================
//  AUTH CONTEXT & PROVIDER  
//  Global authentication state management
// ============================================

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { type User, type AuthSession, type LoginData, type RegisterData, type AuthResponse } from '@/lib/types/auth'

interface AuthContextType {
  // State
  user: User | null
  session: AuthSession | null
  loading: boolean
  
  // Actions
  login: (data: LoginData) => Promise<{ success: boolean; message: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (data: Partial<Pick<User, 'full_name' | 'avatar_url'>>) => Promise<{ success: boolean; message: string }>
  
  // Utilities
  hasPermission: (permission: string) => boolean
  isRole: (role: User['role']) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : 'https://your-production-api.com/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // ──────────────────────────────────────────
  //  RESTORE SESSION FROM LOCALSTORAGE
  // ──────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem('flower-auth-session')
        if (!stored) {
          setLoading(false)
          return
        }

        const parsedSession: AuthSession = JSON.parse(stored)
        
        // Check if token expired
        if (Date.now() >= parsedSession.expires_at * 1000) {
          localStorage.removeItem('flower-auth-session')
          setLoading(false)
          return
        }

        // Verify token dengan backend
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${parsedSession.access_token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUser(result.data)
            setSession(parsedSession)
          } else {
            localStorage.removeItem('flower-auth-session')
          }
        } else {
          localStorage.removeItem('flower-auth-session')
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('flower-auth-session')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ──────────────────────────────────────────
  //  LOGIN
  // ──────────────────────────────────────────
  const login = async (data: LoginData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.data) {
        const newSession: AuthSession = {
          user: result.data.user,
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
          expires_at: result.data.session.expires_at,
        }

        setUser(result.data.user)
        setSession(newSession)
        localStorage.setItem('flower-auth-session', JSON.stringify(newSession))

        return { success: true, message: result.message }
      }

      return { success: false, message: result.message }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Terjadi kesalahan saat login' }
    }
  }

  // ──────────────────────────────────────────
  //  REGISTER  
  // ──────────────────────────────────────────
  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: AuthResponse = await response.json()
      return { success: result.success, message: result.message }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Terjadi kesalahan saat registrasi' }
    }
  }

  // ──────────────────────────────────────────
  //  LOGOUT
  // ──────────────────────────────────────────
  const logout = () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('flower-auth-session')
  }

  // ──────────────────────────────────────────
  //  UPDATE PROFILE
  // ──────────────────────────────────────────
  const updateProfile = async (data: Partial<Pick<User, 'full_name' | 'avatar_url'>>): Promise<{ success: boolean; message: string }> => {
    if (!session) return { success: false, message: 'Not authenticated' }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success && user) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        
        // Update session in localStorage
        const updatedSession = { ...session, user: updatedUser }
        setSession(updatedSession)
        localStorage.setItem('flower-auth-session', JSON.stringify(updatedSession))
      }

      return { success: result.success, message: result.message }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Terjadi kesalahan saat update profil' }
    }
  }

  // ──────────────────────────────────────────
  //  UTILITIES
  // ──────────────────────────────────────────
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    const rolePermissions = {
      user: ['canBrowse', 'canPurchase', 'canViewProfile', 'canUpdateProfile'],
      owner: ['canBrowse', 'canPurchase', 'canViewProfile', 'canUpdateProfile', 'canCreateShop', 'canManageOwnShop', 'canManageOwnProducts', 'canViewDashboard'],
      admin: ['canBrowse', 'canPurchase', 'canViewProfile', 'canUpdateProfile', 'canCreateShop', 'canManageOwnShop', 'canManageOwnProducts', 'canViewDashboard', 'canViewAdminPanel', 'canManageAllShops', 'canManageAllUsers', 'canViewStats', 'canDeleteShops']
    }

    return rolePermissions[user.role]?.includes(permission) ?? false
  }

  const isRole = (role: User['role']): boolean => {
    return user?.role === role
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    isRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ──────────────────────────────────────────
//  USEAUTH HOOK
// ──────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}