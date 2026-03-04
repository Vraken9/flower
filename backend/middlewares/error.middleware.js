// ============================================
//  ERROR MIDDLEWARE
//  Global error handler untuk Express
// ============================================

const errorHandler = (err, _req, res, _next) => {
  console.error('❌ Error:', err.message)

  // Error dari Multer (upload file)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimum 5MB.',
      })
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    })
  }

  // Error format file dari fileFilter
  if (err.message?.includes('Format file')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // Error umum
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
  })
}

module.exports = errorHandler
