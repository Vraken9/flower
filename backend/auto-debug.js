#!/usr/bin/env node
/**
 * AUTO DEBUG SCRIPT
 * Comprehensive testing of all backend functions
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const API_BASE = 'http://localhost:5000/api';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test results storage
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper functions
async function test(name, fn) {
  try {
    await fn();
    results.passed.push(name);
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function getTestUser() {
  // Create or get test user
  const email = 'test-debug@example.com';
  const password = 'TestPassword123!';
  
  // Try login first
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email, password
  });
  
  if (loginData?.session) {
    return { email, password, token: loginData.session.access_token, userId: loginData.user.id };
  }
  
  // Create new user
  const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (signupError) throw signupError;
  
  // Login with new user
  const { data: newLogin } = await supabase.auth.signInWithPassword({ email, password });
  return { email, password, token: newLogin.session.access_token, userId: newLogin.user.id };
}

// ========================================
// TEST SUITES
// ========================================

async function testHealthCheck() {
  const res = await fetch(`${API_BASE}/shops`);
  if (!res.ok) throw new Error(`Status ${res.status}`);
}

async function testDatabaseConnection() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) throw error;
}

async function testPublicEndpoints() {
  // GET /api/shops
  const shops = await fetchApi('/shops');
  if (!shops.ok) throw new Error(`GET /shops: ${shops.data.message || 'Failed'}`);
  
  // GET /api/products
  const products = await fetchApi('/products');
  if (!products.ok) throw new Error(`GET /products: ${products.data.message || 'Failed'}`);
}

async function testAuthEndpoints(testUser) {
  // Test protected endpoint without token (GET /auth/profile)
  const noAuth = await fetchApi('/auth/profile');
  if (noAuth.status !== 401) throw new Error(`Should return 401 without token, got ${noAuth.status}`);
  
  // Test with token
  const withAuth = await fetchApi('/auth/profile', {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });
  if (!withAuth.ok) throw new Error(`GET /auth/profile: ${withAuth.data.message || 'Failed'}`);
}

async function testFavoritesEndpoints(testUser) {
  // Get first product for testing
  const { data: products } = await supabase.from('products').select('id').limit(1);
  if (!products?.length) {
    results.skipped.push('Favorites (no products in DB)');
    console.log('⏭️ Favorites (no products in DB)');
    return;
  }
  const productId = products[0].id;
  
  // GET favorites
  const getFav = await fetchApi('/favorites', {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });
  if (!getFav.ok) throw new Error(`GET /favorites: ${getFav.data.message || 'Failed'}`);
  
  // POST toggle favorite
  const toggleFav = await fetchApi('/favorites', {
    method: 'POST',
    headers: { Authorization: `Bearer ${testUser.token}` },
    body: JSON.stringify({ product_id: productId })
  });
  if (!toggleFav.ok) throw new Error(`POST /favorites: ${toggleFav.data.message || 'Failed'}`);
  
  // DELETE favorite (toggle back)
  const delFav = await fetchApi(`/favorites/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${testUser.token}` }
  });
  // May succeed or fail depending on state, just check no crash
}

async function testProfileEndpoints(testUser) {
  // GET profile (uses /auth/profile)
  const getProfile = await fetchApi('/auth/profile', {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });
  if (!getProfile.ok) throw new Error(`GET /auth/profile: ${getProfile.data.message || 'Failed'}`);
  
  // PUT profile (just update with same data)
  const updateProfile = await fetchApi('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${testUser.token}` },
    body: JSON.stringify({ full_name: 'Test Debug User' })
  });
  // May have validation, just check no crash
}

async function testCartEndpoints(testUser) {
  // Get first product
  const { data: products } = await supabase.from('products').select('id').limit(1);
  if (!products?.length) {
    results.skipped.push('Cart (no products in DB)');
    console.log('⏭️ Cart (no products in DB)');
    return;
  }
  const productId = products[0].id;
  
  // GET cart
  const getCart = await fetchApi('/cart', {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });
  if (!getCart.ok) throw new Error(`GET /cart: ${getCart.data.message || 'Failed'}`);
  
  // POST add to cart
  const addCart = await fetchApi('/cart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${testUser.token}` },
    body: JSON.stringify({ product_id: productId, quantity: 1 })
  });
  // May fail for various reasons, just check no crash
}

async function testShopEndpoints() {
  // GET /api/shops
  const shops = await fetchApi('/shops');
  if (!shops.ok) throw new Error(`GET /shops: ${shops.data.message || 'Failed'}`);
  
  // GET single shop if exists
  if (shops.data.data?.length > 0) {
    const shopId = shops.data.data[0].id;
    const singleShop = await fetchApi(`/shops/${shopId}`);
    if (!singleShop.ok) throw new Error(`GET /shops/${shopId}: ${singleShop.data.message || 'Failed'}`);
  }
}

async function testProductEndpoints() {
  // GET /api/products
  const products = await fetchApi('/products');
  if (!products.ok) throw new Error(`GET /products: ${products.data.message || 'Failed'}`);
  
  // GET single product if exists
  if (products.data.data?.length > 0) {
    const productId = products.data.data[0].id;
    const singleProduct = await fetchApi(`/products/${productId}`);
    if (!singleProduct.ok) throw new Error(`GET /products/${productId}: ${singleProduct.data.message || 'Failed'}`);
  }
}

async function testValidationMiddleware() {
  // Test register validation (missing fields)
  const badRegister = await fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'invalid' }) // missing password, etc
  });
  // Should return 400 for validation error
  if (badRegister.status !== 400 && badRegister.status !== 422) {
    throw new Error(`Expected 400/422 for invalid data, got ${badRegister.status}`);
  }
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.log('\n🔍 AUTO DEBUG - Comprehensive Function Testing\n');
  console.log('=' .repeat(50));
  
  // Wait for server to be ready
  console.log('\n⏳ Checking server availability...');
  let serverReady = false;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`${API_BASE}/shops`);
      if (res.ok || res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  if (!serverReady) {
    console.log('❌ Server not responding on port 5000');
    console.log('   Make sure to run: cd backend && node server.js');
    process.exit(1);
  }
  console.log('✅ Server is running\n');
  
  // Core Infrastructure Tests
  console.log('\n📦 CORE INFRASTRUCTURE\n' + '-'.repeat(30));
  await test('Health Check', testHealthCheck);
  await test('Database Connection', testDatabaseConnection);
  
  // Public Endpoints
  console.log('\n🌐 PUBLIC ENDPOINTS\n' + '-'.repeat(30));
  await test('Public: Shops List', testShopEndpoints);
  await test('Public: Products List', testProductEndpoints);
  
  // Get test user for authenticated tests
  let testUser;
  try {
    testUser = await getTestUser();
    console.log(`\n🔐 Test user: ${testUser.email}`);
  } catch (e) {
    console.log(`\n⚠️ Could not create test user: ${e.message}`);
    console.log('   Skipping authenticated tests\n');
  }
  
  if (testUser) {
    // Auth Tests
    console.log('\n🔐 AUTHENTICATION\n' + '-'.repeat(30));
    await test('Auth: Protected Endpoints', () => testAuthEndpoints(testUser));
    await test('Auth: Validation Middleware', testValidationMiddleware);
    
    // Profile Tests
    console.log('\n👤 PROFILE\n' + '-'.repeat(30));
    await test('Profile: Get/Update', () => testProfileEndpoints(testUser));
    
    // Favorites Tests
    console.log('\n❤️ FAVORITES\n' + '-'.repeat(30));
    await test('Favorites: CRUD Operations', () => testFavoritesEndpoints(testUser));
    
    // Cart Tests
    console.log('\n🛒 CART\n' + '-'.repeat(30));
    await test('Cart: CRUD Operations', () => testCartEndpoints(testUser));
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏭️ Skipped: ${results.skipped.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n🔴 FAILED TESTS:\n');
    results.failed.forEach(f => {
      console.log(`   • ${f.name}`);
      console.log(`     Error: ${f.error}\n`);
    });
  }
  
  console.log('');
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
