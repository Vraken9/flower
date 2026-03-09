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
  const redirectTo = searchParams.get('redirect') || '/auth/login'

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
      setTimeout(() => {
        router.push(redirectTo + (redirectTo.includes('?') ? '&' : '?') + 'message=registered')
      }, 2000)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="mx-auto max-w-sm space-y-6 text-center">
        <div className="text-6xl">✅</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-green-600">Registrasi Berhasil!</h1>
          <p className="text-gray-600">
            Akun Anda telah dibuat. Anda akan diarahkan ke halaman login...
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