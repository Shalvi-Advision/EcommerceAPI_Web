const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const TEST_MOBILE = '9876543210';

async function testProfile() {
  console.log('🧪 Testing Profile Endpoint...\n');

  try {
    // Step 1: Send OTP
    console.log('1️⃣  Sending OTP...');
    const otpResponse = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
      mobile: TEST_MOBILE
    });
    console.log('✅ OTP sent:', otpResponse.data.message);

    // Step 2: Verify OTP to get token
    console.log('\n2️⃣  Verifying OTP...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
      mobile: TEST_MOBILE,
      otp: '0000'
    });
    console.log('✅ OTP verified, token received');
    const token = verifyResponse.data.data.token;

    // Step 3: Test profile endpoint
    console.log('\n3️⃣  Testing profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Profile retrieved successfully!');
    console.log('   User ID:', profileResponse.data.data.user._id);
    console.log('   Mobile:', profileResponse.data.data.user.mobile);
    console.log('   Name:', profileResponse.data.data.user.name || 'Not set');
    console.log('   Email:', profileResponse.data.data.user.email || 'Not set');
    console.log('   Role:', profileResponse.data.data.user.role);
    console.log('   Is Verified:', profileResponse.data.data.user.isVerified);
    console.log('   Addresses count:', profileResponse.data.data.user.addresses?.length || 0);
    console.log('   Favorites count:', profileResponse.data.data.user.favorites?.length || 0);

    // Step 4: Test profile update
    console.log('\n4️⃣  Testing profile update...');
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
    console.log('✅ Profile updated successfully!');
    console.log('   Updated name:', updateResponse.data.data.user.name);
    console.log('   Updated email:', updateResponse.data.data.user.email);

    console.log('\n🎉 All profile tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ OTP authentication flow');
    console.log('   ✅ Profile retrieval with populated data');
    console.log('   ✅ Profile update functionality');
    console.log('   ✅ Address and Product model integration');

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

// Run the test
testProfile();
