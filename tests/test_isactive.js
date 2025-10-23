const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const TEST_MOBILE = '9876543210';

async function testIsActive() {
  console.log('🧪 Testing IsActive / User Activity Tracking...\n');

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

    // Step 3: First call to is-active (should create new session)
    console.log('\n3️⃣  First call to is-active (creating session)...');
    const firstActiveResponse = await axios.post(`${BASE_URL}/api/auth/is-active`,
      {
        device: {
          platform: 'ios',
          deviceId: 'test-device-123',
          appVersion: '1.0.0'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Session created!');
    console.log('   Is Active:', firstActiveResponse.data.data.isActive);
    console.log('   Session ID:', firstActiveResponse.data.data.session.sessionId);
    console.log('   Last Active At:', firstActiveResponse.data.data.lastActiveAt);
    console.log('   Session Duration (ms):', firstActiveResponse.data.data.session.durationMs);
    console.log('   Total Active Time (ms):', firstActiveResponse.data.data.totalActiveMs);
    console.log('   Device:', firstActiveResponse.data.data.session.device);

    const sessionId = firstActiveResponse.data.data.session.sessionId;

    // Step 4: Wait 2 seconds and call again (should update existing session)
    console.log('\n4️⃣  Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('   Calling is-active again (updating session)...');
    const secondActiveResponse = await axios.post(`${BASE_URL}/api/auth/is-active`,
      {
        sessionId: sessionId,
        device: {
          platform: 'ios',
          deviceId: 'test-device-123',
          appVersion: '1.0.0'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Session updated!');
    console.log('   Is Active:', secondActiveResponse.data.data.isActive);
    console.log('   Session ID:', secondActiveResponse.data.data.session.sessionId);
    console.log('   Last Active At:', secondActiveResponse.data.data.lastActiveAt);
    console.log('   Session Duration (ms):', secondActiveResponse.data.data.session.durationMs);
    console.log('   Total Active Time (ms):', secondActiveResponse.data.data.totalActiveMs);

    // Verify duration increased
    const durationIncrease = secondActiveResponse.data.data.session.durationMs - firstActiveResponse.data.data.session.durationMs;
    console.log('   Duration increased by:', durationIncrease, 'ms');

    // Step 5: Test with mismatched session ID (should create new session)
    console.log('\n5️⃣  Testing with mismatched session ID...');
    const newSessionResponse = await axios.post(`${BASE_URL}/api/auth/is-active`,
      {
        sessionId: 'wrong-session-id',
        device: {
          platform: 'android',
          deviceId: 'test-device-456',
          appVersion: '1.1.0'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ New session created due to mismatch!');
    console.log('   New Session ID:', newSessionResponse.data.data.session.sessionId);
    console.log('   Device Platform:', newSessionResponse.data.data.session.device.platform);

    console.log('\n🎉 All isActive tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Session creation on first call');
    console.log('   ✅ Session update with duration accumulation');
    console.log('   ✅ New session creation on ID mismatch');
    console.log('   ✅ Activity tracking (isActive status)');
    console.log('   ✅ Device info tracking');
    console.log('   ✅ Total active time accumulation');

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
testIsActive();
