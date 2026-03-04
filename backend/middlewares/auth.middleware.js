// ============================================
//  AUTH MIDDLEWARE
//  Verifikasi JWT token dari Supabase Auth
// ============================================

const { supabaseAdmin } = require('../config/supabase')
const { error } = require('../utils/response')

/**
 * Middleware untuk memverifikasi autentikasi user.
 * Mengambil token dari header Authorization: Bearer <token>
 * lalu verifikasi melalui Supabase dan ambil profil user.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Ambil token dari header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.', 401)
    }

    const token = authHeader.split(' ')[1]

    // 2. Verifikasi token melalui Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return error(res, 'Token tidak valid atau sudah expired.', 401)
    }

    // 3. Ambil profil user (termasuk role)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return error(res, 'Profil user tidak ditemukan.', 404)
    }

    // 4. Simpan user info di req untuk dipakai di controller
    req.user = {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
    }

    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    return error(res, 'Gagal memverifikasi autentikasi.', 500)
  }
}

module.exports = authenticate
