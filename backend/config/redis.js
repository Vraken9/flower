// ============================================
//  REDIS CONFIG (UPSTASH)
//  Koneksi ke Upstash Redis untuk token blocklist
// ============================================

const { Redis } = require('@upstash/redis')

// Konfigurasi Upstash Redis dari environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Test koneksi
redis.ping().then(() => {
  console.log('✅ Upstash Redis connected successfully')
}).catch((err) => {
  console.error('❌ Upstash Redis connection error:', err.message)
})

// ══════════════════════════════════════════
//  TOKEN BLOCKLIST FUNCTIONS
// ══════════════════════════════════════════

/** Prefix untuk key blocklist token */
const BLOCKLIST_PREFIX = 'token_blocklist:'

/**
 * Menambahkan token ke blocklist
 * @param {string} token - JWT token yang akan di-block
 * @param {number} ttlSeconds - Waktu expired token dalam detik (default: 24 jam)
 */
const addToBlocklist = async (token, ttlSeconds = 86400) => {
  try {
    const key = `${BLOCKLIST_PREFIX}${token}`
    await redis.setex(key, ttlSeconds, 'blocked')
    return true
  } catch (err) {
    console.error('Redis addToBlocklist error:', err.message)
    return false
  }
}

/**
 * Mengecek apakah token ada di blocklist
 * @param {string} token - JWT token yang akan dicek
 * @returns {Promise<boolean>} true jika token ada di blocklist
 */
const isTokenBlocked = async (token) => {
  try {
    const key = `${BLOCKLIST_PREFIX}${token}`
    const result = await redis.get(key)
    return result !== null
  } catch (err) {
    console.error('Redis isTokenBlocked error:', err.message)
    // Jika Redis error, return false untuk tidak memblokir user
    return false
  }
}

/**
 * Menghapus token dari blocklist (jika diperlukan)
 * @param {string} token - JWT token yang akan dihapus dari blocklist
 */
const removeFromBlocklist = async (token) => {
  try {
    const key = `${BLOCKLIST_PREFIX}${token}`
    await redis.del(key)
    return true
  } catch (err) {
    console.error('Redis removeFromBlocklist error:', err.message)
    return false
  }
}

module.exports = {
  redis,
  addToBlocklist,
  isTokenBlocked,
  removeFromBlocklist,
}
