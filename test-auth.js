// ============================================
//  AUTHENTICATION TEST
//  Quick test to verify auth system is working
// ============================================

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUsers = {
  admin: { email: 'admin@flowermarket.com', password: 'admin123456' },
  owner: { email: 'owner.edelweis@gmail.com', password: 'owner123456' },
  user: { email: 'buyer@gmail.com', password: 'buyer123456' }
};

async function testLogin(userType, credentials) {
  try {
    console.log(`\n🧪 Testing ${userType} login...`);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${userType} login successful`);
      
      // Check if we have the expected data structure
      if (data.data?.user) {
        console.log(`   Email: ${data.data.user.email}`);
        console.log(`   Name: ${data.data.user.full_name}`);
        console.log(`   Role: ${data.data.user.role}`);
      }
      
      if (data.data?.session?.access_token) {
        const token = data.data.session.access_token;
        console.log(`   Token: ${token.substring(0, 30)}...`);
        // Test a protected endpoint
        await testProtectedEndpoint(token, userType);
      } else {
        console.log(`   Warning: No access token in response`);
      }
      
    } else {
      console.log(`❌ ${userType} login failed:`, data.message);
    }
  } catch (error) {
    console.log(`❌ ${userType} login error:`, error.message);
  }
}

async function testProtectedEndpoint(token, userType) {
  try {
    console.log(`   🔒 Testing protected endpoint for ${userType}...`);
    
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Protected endpoint accessible`);
    } else {
      console.log(`   ❌ Protected endpoint failed:`, data.message);
    }
  } catch (error) {
    console.log(`   ❌ Protected endpoint error:`, error.message);
  }
}

async function runTests() {
  console.log('🌸 BLOOM MARKETPLACE - AUTHENTICATION TEST');
  console.log('==========================================');
  
  // Test backend availability
  try {
    const response = await fetch(`${API_BASE}/auth/profile`);
    // We expect this to fail with 401 (no auth), but server should be responsive
    if (response.status === 401) {
      console.log('✅ Backend server is running');
    } else {
      console.log('❌ Backend server unexpected response:', response.status);
      return;
    }
  } catch (error) {
    console.log('❌ Backend server is not accessible:', error.message);
    return;
  }
  
  // Test each user type
  for (const [userType, credentials] of Object.entries(testUsers)) {
    await testLogin(userType, credentials);
  }
  
  console.log('\n🎉 Authentication tests completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Open http://localhost:3000 to test frontend');
  console.log('   2. Try logging in with any of the test accounts');
  console.log('   3. Check navbar for role-based navigation');
  console.log('   4. Test protected routes (dashboard, admin, profile)');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}