// ============================================
//  REGISTRATION TEST
//  Test user registration flow
// ============================================

require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRegistration() {
  console.log('\n🌸 TESTING USER REGISTRATION\n');
  console.log('==========================================\n');

  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'testpass123';
  const testFullName = 'Test User Registration';

  console.log('📝 Test credentials:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('   Full Name:', testFullName);
  console.log();

  // 1. Try to sign up
  console.log('🧪 Step 1: Signing up...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testFullName
      }
    }
  });

  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message);
    return;
  }

  console.log('✅ Sign up response received');
  console.log('   User ID:', signUpData.user?.id);
  console.log('   Email:', signUpData.user?.email);
  console.log('   Email confirmed:', signUpData.user?.email_confirmed_at ? 'YES' : 'NO');
  console.log('   User metadata:', JSON.stringify(signUpData.user?.user_metadata, null, 2));
  console.log();

  // 2. Check if user exists in auth.users (using admin client)
  console.log('🧪 Step 2: Checking auth.users table...');
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(signUpData.user.id);
  
  if (authError) {
    console.error('❌ Failed to fetch auth user:', authError.message);
  } else {
    console.log('✅ Found in auth.users:');
    console.log('   Email:', authUser.user.email);
    console.log('   Email confirmed:', authUser.user.email_confirmed_at ? 'YES' : 'NO');
    console.log('   Metadata:', JSON.stringify(authUser.user.user_metadata, null, 2));
  }
  console.log();

  // 3. Check profiles table
  console.log('🧪 Step 3: Checking profiles table...');
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile not found:', profileError.message);
  } else if (profile) {
    console.log('✅ Found in profiles table:');
    console.log('   ID:', profile.id);
    console.log('   Full Name:', profile.full_name);
    console.log('   Role:', profile.role);
    console.log('   Avatar:', profile.avatar_url);
  } else {
    console.log('⚠️  Profile row does not exist');
  }
  console.log();

  // 4. Try to login
  console.log('🧪 Step 4: Attempting to login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (loginError) {
    console.error('❌ Login failed:', loginError.message);
    console.error('   Error code:', loginError.status);
  } else {
    console.log('✅ Login successful!');
    console.log('   User:', loginData.user?.email);
    console.log('   Token exists:', !!loginData.session?.access_token);
  }
  console.log();

  // 5. Cleanup - delete test user
  console.log('🧹 Cleaning up test user...');
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
  
  if (deleteError) {
    console.error('⚠️  Could not delete test user:', deleteError.message);
  } else {
    console.log('✅ Test user deleted');
  }
  
  console.log();
  console.log('==========================================');
  console.log('🎉 Registration test completed!\n');
}

testRegistration().catch(console.error);
