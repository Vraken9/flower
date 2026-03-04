// ============================================
//  RESPONSE HELPERS
//  Format standar untuk semua API response
// ============================================

/**
 * Kirim response sukses
 * @param {object} res     - Express response
 * @param {*}      data    - Data yang dikirim
 * @param {string} message - Pesan sukses
 * @param {number} statusCode - HTTP status code
 */
const success = (res, data = null, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

/**
 * Kirim response error
 * @param {object} res        - Express response
 * @param {string} message    - Pesan error
 * @param {number} statusCode - HTTP status code
 * @param {*}      errors     - Detail error (opsional)
 */
const error = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  }

  if (errors) response.errors = errors

  return res.status(statusCode).json(response)
}

module.exports = { success, error }
