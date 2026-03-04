// ============================================
//  AUTH CONTROLLER
//  Register, Login, Profile
// ============================================

const { supabaseAdmin } = require('../config/supabase')
const { success, error } = require('../utils/response')
const { ROLES } = require('../utils/constants')

// ──────────────────────────────────────────
//  POST /api/auth/register
//  Daftarkan user baru
// ──────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body

    // Validasi input
    if (!email || !password || !full_name) {
      return error(res, 'Email, password, dan nama lengkap wajib diisi.', 400)
    }

    if (password.length < 6) {
      return error(res, 'Password minimal 6 karakter.', 400)
    }

    // Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (authError) {
      return error(res, authError.message, 400)
    }

    // Buat profil di tabel profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        role: ROLES.USER,
      })

    if (profileError) {
      // Rollback: hapus user auth jika profil gagal dibuat
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return error(res, 'Gagal membuat profil user.', 500)
    }

    return success(
      res,
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          role: ROLES.USER,
        },
      },
      'Registrasi berhasil!',
      201
    )
  } catch (err) {
    console.error('Register error:', err.message)
    return error(res, 'Gagal melakukan registrasi.', 500)
  }
}

// ──────────────────────────────────────────
//  POST /api/auth/login
//  Login user dan dapatkan token
// ──────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return error(res, 'Email dan password wajib diisi.', 400)
    }

    // Login via Supabase Auth
    const { data, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return error(res, 'Email atau password salah.', 401)
    }

    // Ambil profil user (termasuk role)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return success(res, {
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name,
        role: profile?.role || ROLES.USER,
        avatar_url: profile?.avatar_url,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    }, 'Login berhasil!')
  } catch (err) {
    console.error('Login error:', err.message)
    return error(res, 'Gagal melakukan login.', 500)
  }
}

// ──────────────────────────────────────────
//  GET /api/auth/profile
//  Ambil profil user yang sedang login
// ──────────────────────────────────────────
const getProfile = async (req, res) => {
  return success(res, req.user, 'Profil berhasil dimuat.')
}

// ──────────────────────────────────────────
//  PUT /api/auth/profile
//  Update profil user yang sedang login
// ──────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body
    const updateData = { updated_at: new Date().toISOString() }

    if (full_name) updateData.full_name = full_name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    const { data, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single()

    if (updateError) {
      return error(res, 'Gagal mengupdate profil.', 500)
    }

    return success(res, data, 'Profil berhasil diupdate.')
  } catch (err) {
    console.error('Update profile error:', err.message)
    return error(res, 'Gagal mengupdate profil.', 500)
  }
}

module.exports = { register, login, getProfile, updateProfile }
