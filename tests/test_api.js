const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_MOBILE = '9876543210';

async function testAPI() {
  console.log('🚀 Testing Patel E-commerce API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣  Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);
    console.log('   Environment:', healthResponse.data.environment);

    // Test 2: Send OTP
    console.log('\n2️⃣  Testing send OTP...');
    const otpResponse = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
      mobile: TEST_MOBILE
    });
    console.log('✅ OTP sent successfully');
    console.log('   Response:', otpResponse.data.message);
    if (otpResponse.data.otp) {
      console.log('   Test OTP:', otpResponse.data.otp);
    }

    // Test 3: Verify OTP
    console.log('\n3️⃣  Testing verify OTP...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
      mobile: TEST_MOBILE,
      otp: '0000'
    });
    console.log('✅ OTP verified successfully');
    console.log('   User created/logged in:', verifyResponse.data.data.user.mobile);
    console.log('   Token received (length):', verifyResponse.data.data.token.length);

    // Store token for next test
    const token = verifyResponse.data.data.token;

    // Test 4: Get profile (protected route)
    console.log('\n4️⃣  Testing get profile (protected)...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('   User name:', profileResponse.data.data.user.name || 'Not set');
    console.log('   User role:', profileResponse.data.data.user.role);

    // Test 5: Update profile (protected route)
    console.log('\n5️⃣  Testing update profile (protected)...');
    const updateResponse = await axios.put(`${BASE_URL}/api/auth/profile`,
      {
        name: 'Test User',
        email: 'test@example.com'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('✅ Profile updated successfully');
    console.log('   Updated name:', updateResponse.data.data.user.name);

    // Test 6: Logout (protected route)
    console.log('\n6️⃣  Testing logout (protected)...');
    const logoutResponse = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Logged out successfully');

    console.log('\n🎉 All tests passed! API is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Server health check');
    console.log('   ✅ OTP sending');
    console.log('   ✅ OTP verification & login');
    console.log('   ✅ Protected route access');
    console.log('   ✅ Profile retrieval');
    console.log('   ✅ Profile update');
    console.log('   ✅ Logout');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    console.error('\n💡 Make sure the server is running: npm start');
  }
}

// Run tests
testAPI();
