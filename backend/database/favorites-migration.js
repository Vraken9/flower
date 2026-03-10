// ============================================
//  🌱 FAVORITES MIGRATION
//  Membuat tabel favorites untuk user
// ============================================

require('dotenv').config()
const { supabaseAdmin } = require('../config/supabase')

async function createFavoritesTable() {
  console.log('🔄 Creating favorites table...')
  
  try {
    // Create favorites table using RPC or raw SQL if needed
    const { data, error } = await supabaseAdmin.rpc('create_favorites_table_if_not_exists')
    
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Error creating favorites table:', error)
      
      // Try alternative approach with direct SQL
      console.log('📝 Trying direct SQL approach...')
      
      // Note: This would typically be done through Supabase dashboard or SQL editor
      console.log(`
      -- Run this SQL in Supabase SQL Editor:
      
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Ensure user can only favorite a product once
        UNIQUE(user_id, product_id)
      );
      
      -- Add RLS policies
      ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
      
      -- Users can only see their own favorites
      CREATE POLICY "Users can view own favorites" ON favorites
        FOR SELECT USING (auth.uid() = user_id);
      
      -- Users can create their own favorites
      CREATE POLICY "Users can create own favorites" ON favorites
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      -- Users can delete their own favorites  
      CREATE POLICY "Users can delete own favorites" ON favorites
        FOR DELETE USING (auth.uid() = user_id);
      
      -- Create index for better performance
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
      `)
      
      return false
    }
    
    console.log('✅ Favorites table created successfully')
    return true
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    return false
  }
}

async function addFavoritesColumn() {
  console.log('🔄 Alternative: Adding favorites to profiles table...')
  
  try {
    // Check if favorites column exists
    const { data: existingColumns, error: columnsError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (columnsError) {
      console.error('❌ Error checking profiles table:', columnsError)
      return false
    }
    
    // Add favorites as JSONB array in profiles table
    console.log(`
    -- Alternative approach: Add favorites column to profiles table
    -- Run this SQL in Supabase SQL Editor:
    
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS favorites JSONB DEFAULT '[]'::jsonb;
    
    -- Add index for JSONB queries
    CREATE INDEX IF NOT EXISTS idx_profiles_favorites ON profiles USING GIN(favorites);
    `)
    
    console.log('✅ Favorites column instructions provided')
    return true
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function runMigration() {
  console.log('🌸 FAVORITES SYSTEM MIGRATION')
  console.log('==============================')
  
  // Try creating favorites table first
  const tableCreated = await createFavoritesTable()
  
  if (!tableCreated) {
    // Fall back to adding column to profiles
    await addFavoritesColumn()
  }
  
  console.log('\n📝 Manual Steps Required:')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Run the provided SQL commands above')
  console.log('3. Test favorites functionality')
  console.log('\n🔧 After running SQL, test with:')
  console.log('   node database/test-favorites.js')
}

if (require.main === module) {
  runMigration()
}

module.exports = {
  createFavoritesTable,
  addFavoritesColumn
}