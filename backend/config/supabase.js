const { createClient } = require('@supabase/supabase-js')

// ============================================
//  SUPABASE CLIENTS
//  - supabase    → anon key (operasi public)
//  - supabaseAdmin → service role (operasi backend)
// ============================================

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  throw new Error('❌ Variabel SUPABASE belum lengkap di file .env')
}

/** Client dengan anon key (untuk verifikasi token) */
const supabase = createClient(supabaseUrl, supabaseKey)

/** Client dengan service role key (bypass RLS, untuk operasi backend) */
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

module.exports = { supabase, supabaseAdmin }
