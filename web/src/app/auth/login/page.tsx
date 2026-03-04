// ============================================
//  LOGIN PAGE
//  /auth/login
// ============================================

import { Suspense } from 'react'
import Link from "next/link";
import { LoginForm } from '@/components/auth/auth-forms'
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Flower2 } from "lucide-react";

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-rose-600 hover:text-rose-700 transition-colors">
              <Flower2 className="h-8 w-8" />
              <span>Bloom</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Selamat datang kembali
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-rose-600 hover:text-rose-500 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
          
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export const metadata = {
  title: 'Masuk - Flower Marketplace',
  description: 'Masuk ke akun Flower Marketplace Anda'
}