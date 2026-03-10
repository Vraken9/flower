// ============================================
//  ERROR MIDDLEWARE
//  Global error handler untuk Express
// ============================================

const errorHandler = (err, _req, res, _next) => {
  console.error('❌ Error:', err.message)

  // Error dari Multer (upload file)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      // Return 413 Payload Too Large untuk file yang melebihi batas
      return res.status(413).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimum 10MB.',
        code: 'FILE_TOO_LARGE',
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
