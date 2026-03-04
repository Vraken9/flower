// ============================================
//  AUTH TYPES & INTERFACES  
//  Types untuk autentikasi dan user management
// ============================================

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'owner' | 'admin'
  avatar_url?: string
  created_at: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    session: {
      access_token: string
      refresh_token: string
      expires_at: number
    }
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: any
}

// Role permissions
export const PERMISSIONS = {
  user: {
    canBrowse: true,
    canPurchase: true,
    canViewProfile: true,
    canUpdateProfile: true,
  },
  owner: {
    canBrowse: true,
    canPurchase: true,
    canViewProfile: true,
    canUpdateProfile: true,
    canCreateShop: true,
    canManageOwnShop: true,
    canManageOwnProducts: true,
    canViewDashboard: true,
  },
  admin: {
    canBrowse: true,
    canPurchase: true,
    canViewProfile: true,
    canUpdateProfile: true,
    canCreateShop: true,
    canManageOwnShop: true,
    canManageOwnProducts: true,
    canViewDashboard: true,
    canViewAdminPanel: true,
    canManageAllShops: true,
    canManageAllUsers: true,
    canViewStats: true,
    canDeleteShops: true,
  },
} as const

export type UserRole = keyof typeof PERMISSIONS
export type Permission = keyof typeof PERMISSIONS.admin