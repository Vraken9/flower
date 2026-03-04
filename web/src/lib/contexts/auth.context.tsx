// ============================================
//  AUTH CONTEXT & PROVIDER
//  Uses Supabase client directly – no Express backend
// ============================================

'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User, type AuthSession, type LoginData, type RegisterData } from '@/lib/types/auth'

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
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ──────────────────────────────────────────
//  Helper: build User from Supabase auth + profiles row
// ──────────────────────────────────────────
async function fetchProfile(supabase: ReturnType<typeof createClient>, authUserId: string, email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, created_at')
    .eq('id', authUserId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    email,
    full_name: data.full_name || '',
    role: data.role as User['role'],
    avatar_url: data.avatar_url ?? undefined,
    created_at: data.created_at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // ──────────────────────────────────────────
  //  RESTORE SESSION + LISTEN FOR CHANGES
  // ──────────────────────────────────────────
  useEffect(() => {
    // 1. Get existing session
    const initSession = async () => {
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession()

        if (sbSession?.user) {
          const profile = await fetchProfile(supabase, sbSession.user.id, sbSession.user.email!)
          if (profile) {
            setUser(profile)
            setSession({
              user: profile,
              access_token: sbSession.access_token,
              refresh_token: sbSession.refresh_token ?? '',
              expires_at: sbSession.expires_at ?? 0,
            })
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sbSession) => {
        if (event === 'SIGNED_OUT' || !sbSession) {
          setUser(null)
          setSession(null)
          return
        }

        if (sbSession?.user) {
          const profile = await fetchProfile(supabase, sbSession.user.id, sbSession.user.email!)
          if (profile) {
            setUser(profile)
            setSession({
              user: profile,
              access_token: sbSession.access_token,
              refresh_token: sbSession.refresh_token ?? '',
              expires_at: sbSession.expires_at ?? 0,
            })
          }
        }
      }
    )

    return () => { subscription.unsubscribe() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ──────────────────────────────────────────
  //  LOGIN
  // ──────────────────────────────────────────
  const login = async (data: LoginData): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: result, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) return { success: false, message: error.message }

      if (result.user) {
        // Ensure profile row exists
        await fetch('/api/profile/ensure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: result.user.id, full_name: '' }),
        })

        const profile = await fetchProfile(supabase, result.user.id, result.user.email!)
        if (profile) {
          setUser(profile)
          setSession({
            user: profile,
            access_token: result.session!.access_token,
            refresh_token: result.session!.refresh_token ?? '',
            expires_at: result.session!.expires_at ?? 0,
          })
        }
      }

      return { success: true, message: 'Login berhasil!' }
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
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.full_name } },
      })

      if (error) return { success: false, message: error.message }

      // Ensure profile row
      if (result.user) {
        await fetch('/api/profile/ensure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: result.user.id, full_name: data.full_name }),
        })
      }

      return { success: true, message: 'Registrasi berhasil! Silakan cek email untuk konfirmasi.' }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Terjadi kesalahan saat registrasi' }
    }
  }

  // ──────────────────────────────────────────
  //  LOGOUT
  // ──────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  // ──────────────────────────────────────────
  //  UPDATE PROFILE
  // ──────────────────────────────────────────
  const updateProfile = async (data: Partial<Pick<User, 'full_name' | 'avatar_url'>>): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

      if (error) return { success: false, message: error.message }

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      if (session) {
        setSession({ ...session, user: updatedUser })
      }

      return { success: true, message: 'Profil berhasil diperbarui' }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Terjadi kesalahan saat update profil' }
    }
  }

  // ──────────────────────────────────────────
  //  ACCESS TOKEN HELPER  (for API routes)
  // ──────────────────────────────────────────
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const { data: { session: s } } = await supabase.auth.getSession()
    return s?.access_token ?? null
  }, [supabase])

  // ──────────────────────────────────────────
  //  UTILITIES
  // ──────────────────────────────────────────
  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    const rolePermissions: Record<string, string[]> = {
      user: ['canBrowse', 'canPurchase', 'canViewProfile', 'canUpdateProfile'],
      owner: ['canBrowse', 'canPurchase', 'canViewProfile', 'canUpdateProfile', 'canCreateShop', 'canManageOwnShop', 'canManageOwnProducts', 'canViewDashboard'],
      admin: ['canBrowse', 'canPurchase', 'canViewProfile', 'canUpdateProfile', 'canCreateShop', 'canManageOwnShop', 'canManageOwnProducts', 'canViewDashboard', 'canViewAdminPanel', 'canManageAllShops', 'canManageAllUsers', 'canViewStats', 'canDeleteShops'],
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
    getAccessToken,
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