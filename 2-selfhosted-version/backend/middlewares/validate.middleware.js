// ============================================
//  VALIDATE MIDDLEWARE
//  Validasi request body dengan Zod schema
// ============================================

const { ZodError } = require('zod')

/**
 * Middleware factory untuk validasi request body menggunakan Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema untuk validasi
 * @returns {import('express').RequestHandler} Express middleware
 *
 * @example
 * const { createProductSchema } = require('../utils/schemas')
 * router.post('/products', validate(createProductSchema), createProduct)
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse dan validasi request body
      const validatedData = await schema.parseAsync(req.body)

      // Ganti req.body dengan data yang sudah divalidasi dan di-transform
      req.body = validatedData

      next()
    } catch (err) {
      if (err instanceof ZodError) {
        // Format error dari Zod menjadi response yang user-friendly
        // ZodError uses .issues (not .errors)
        const errors = (err.issues || err.errors || []).map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        return res.status(400).json({
          success: false,
          message: 'Validasi gagal. Periksa kembali data yang dikirim.',
          errors,
        })
      }

      // Error lain yang tidak terduga
      console.error('Validate middleware error:', err.message)
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat validasi data.',
      })
    }
  }
}

/**
 * Middleware untuk validasi query parameters
 * @param {import('zod').ZodSchema} schema - Zod schema untuk validasi
 * @returns {import('express').RequestHandler} Express middleware
 */
const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.query)
      req.query = validatedData
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = (err.issues || err.errors || []).map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        return res.status(400).json({
          success: false,
          message: 'Parameter query tidak valid.',
          errors,
        })
      }

      console.error('ValidateQuery middleware error:', err.message)
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat validasi query.',
      })
    }
  }
}

/**
 * Middleware untuk validasi route parameters
 * @param {import('zod').ZodSchema} schema - Zod schema untuk validasi
 * @returns {import('express').RequestHandler} Express middleware
 */
const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.params)
      req.params = validatedData
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = (err.issues || err.errors || []).map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        return res.status(400).json({
          success: false,
          message: 'Parameter URL tidak valid.',
          errors,
        })
      }

      console.error('ValidateParams middleware error:', err.message)
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat validasi parameter.',
      })
    }
  }
}

module.exports = { validate, validateQuery, validateParams }
