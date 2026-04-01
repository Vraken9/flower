// ============================================
//  LOGIN/REGISTER FORM COMPONENTS
//  Reusable form components for authentication
// ============================================

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth.context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

// ──────────────────────────────────────────
//  GOOGLE OAUTH BUTTON
// ──────────────────────────────────────────
function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Google OAuth error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {loading ? 'Menghubungkan...' : 'Masuk dengan Google'}
    </button>
  )
}

// ──────────────────────────────────────────
//  DIVIDER
// ──────────────────────────────────────────
function OrDivider() {
  return (
    <div className="relative flex items-center">
      <div className="grow border-t border-gray-200" />
      <span className="mx-4 shrink-0 text-xs text-gray-400">atau masuk dengan email</span>
      <div className="grow border-t border-gray-200" />
    </div>
  )
}

// ──────────────────────────────────────────
//  LOGIN FORM
// ──────────────────────────────────────────
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login({ email, password })

    if (result.success) {
      router.push(redirectTo)
      router.refresh()
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Masuk</h1>
        <p className="text-gray-500">Masuk ke akun Flower Marketplace Anda</p>
      </div>

      {/* Google OAuth */}
      <GoogleLoginButton />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="nama@email.com"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 6 karakter"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      <div className="text-center text-sm">
        Belum punya akun?{' '}
        <Link 
          href={`/auth/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}
          className="text-green-600 hover:underline font-medium"
        >
          Daftar disini
        </Link>
      </div>

      {/* Demo Accounts */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium text-sm text-gray-700 mb-2">🧪 Demo Accounts:</p>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Admin:</strong> admin@flowermarket.com / admin123456</div>
          <div><strong>Owner:</strong> owner.edelweis@gmail.com / owner123456</div>
          <div><strong>User:</strong> buyer@gmail.com / buyer123456</div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
//  REGISTER FORM
// ──────────────────────────────────────────
export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validate password match
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    const result = await register({ email, password, full_name: fullName })

    if (result.success) {
      setSuccess(true)
      // User is auto-logged-in after registration, redirect to home or requested page
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 2000)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="mx-auto max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Registrasi Berhasil</h1>
          <p className="text-gray-600">
            Akun Anda telah dibuat dan Anda sudah login. Mengalihkan ke halaman utama...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Daftar</h1>
        <p className="text-gray-500">Buat akun Flower Marketplace baru</p>
      </div>

      {/* Google OAuth */}
      <GoogleLoginButton />
      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Nama Lengkap"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Nama lengkap Anda"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="nama@email.com"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 6 karakter"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">Password minimal 6 karakter</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Konfirmasi Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ketik ulang password"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-rose-400 focus:ring-rose-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-600">Password tidak cocok</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </Button>
      </form>

      <div className="text-center text-sm">
        Sudah punya akun?{' '}
        <Link 
          href={`/auth/login${redirectTo !== '/auth/login' ? `?redirect=${redirectTo}` : ''}`}
          className="text-green-600 hover:underline font-medium"
        >
          Masuk disini
        </Link>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Dengan mendaftar, Anda akan mendapat role <strong>&quot;user&quot;</strong> (pembeli).
        <br />
        Untuk jadi pemilik toko, buat toko di Dashboard setelah login.
      </div>
    </div>
  )
}