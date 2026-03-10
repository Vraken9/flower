// ============================================
//  ROLE MIDDLEWARE
//  Mengecek apakah user memiliki role yang sesuai
// ============================================

const { error } = require('../utils/response')

/**
 * Middleware untuk mengecek role user.
 * Harus dipanggil SETELAH auth middleware.
 *
 * @param  {...string} allowedRoles - Role yang diizinkan
 * @returns {Function} Express middleware
 *
 * @example
 * // Hanya admin yang bisa akses
 * router.get('/admin', auth, authorize('admin'), controller)
 *
 * // Owner dan admin bisa akses
 * router.get('/shop', auth, authorize('owner', 'admin'), controller)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user sudah terautentikasi
    if (!req.user) {
      return error(res, 'User belum terautentikasi.', 401)
    }

    // Cek apakah role user termasuk dalam allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        `Akses ditolak. Role "${req.user.role}" tidak memiliki izin untuk fitur ini.`,
        403
      )
    }

    next()
  }
}

module.exports = authorize
