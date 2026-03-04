"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth.context";
import { Permission } from "@/lib/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'owner' | 'admin';
  allowedRoles?: ('user' | 'owner' | 'admin')[];
  requiredPermission?: Permission;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  requiredPermission,
  requireAuth = true,
  redirectTo = "/auth/login",
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-rose-200 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  )
}: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Still loading, wait
    if (loading) return;

    // Redirect unauthenticated users if authentication is required
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // Check role requirement
    const hasValidRole = (() => {
      if (requiredRole) {
        return user.role === requiredRole;
      }
      if (allowedRoles && allowedRoles.length > 0) {
        return allowedRoles.includes(user.role);
      }
      return true;
    })();

    if (user && !hasValidRole) {
      // Show forbidden message and redirect to appropriate page
      console.warn(`Access denied: User role '${user.role}' not authorized`);
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'owner':
          router.push('/dashboard');
          break;
        case 'user':
          router.push('/');
          break;
        default:
          router.push('/');
      }
      return;
    }

    // Check permission requirement
    if (user && requiredPermission && !hasPermission(requiredPermission)) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'owner':
          router.push('/dashboard');
          break;
        case 'user':
          router.push('/');
          break;
        default:
          router.push('/');
      }
      return;
    }

    // Redirect authenticated users from auth pages
    if (!requireAuth && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'owner':
          router.push('/dashboard');
          break;
        case 'user':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, loading, requiredRole, allowedRoles, requiredPermission, requireAuth, redirectTo, router, hasPermission]);

  // Calculate hasValidRole for render-time checks
  const hasValidRole = (() => {
    if (!user) return false;
    if (requiredRole) {
      return user.role === requiredRole;
    }
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }
    return true;
  })();

  // Show loading while checking auth
  if (loading) {
    return <>{fallback}</>;
  }

  // Don't render if user doesn't meet requirements (will redirect)
  if (requireAuth && !user) {
    return <>{fallback}</>;
  }

  if (user && !hasValidRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki izin untuk mengakses halaman ini. Role Anda: <span className="font-medium capitalize">{user.role}</span>
          </p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (user && requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Don't render auth pages if user is already authenticated (will redirect)
  if (!requireAuth && user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}