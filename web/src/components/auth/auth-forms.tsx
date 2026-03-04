// ============================================
//  LOGIN/REGISTER FORM COMPONENTS
//  Reusable form components for authentication
// ============================================

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth.context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ──────────────────────────────────────────
//  LOGIN FORM
// ──────────────────────────────────────────
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Min. 6 karakter"
        />

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
  const [fullName, setFullName] = useState('')
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

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Min. 6 karakter"
          helperText="Password minimal 6 karakter"
        />

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
        Dengan mendaftar, Anda akan mendapat role <strong>"user"</strong> (pembeli).
        <br />
        Untuk jadi pemilik toko, buat toko di Dashboard setelah login.
      </div>
    </div>
  )
}