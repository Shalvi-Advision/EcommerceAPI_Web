const axios = require('axios');

// Configuration
const SMS_CONFIG = {
    baseUrl: process.env.SMS_BASE_URL || 'https://unify.smsgateway.center/SMSApi/otp',
    userId: process.env.SMS_USER_ID || 'shalviadvision',
    password: process.env.SMS_PASSWORD || 'Pall@vi1985',
    senderId: process.env.SMS_SENDER_ID || 'SHALVI',
    clientName: process.env.SMS_CLIENT_NAME || 'Pagariya Ecom', // Based on usage in PHP: "Dear SHALVI Customer..."
    defaultOtp: process.env.SMS_DEFAULT_OTP || '2786' // Backdoor OTP from PHP script
};

/**
 * Send OTP via SMS Gateway
 * Uses the provider's generate functionality
 * @param {string} mobile Mobile number (10 digits)
 * @returns {Promise<Object>} Response from gateway
 */
const sendOtp = async (mobile) => {
    try {
        // Format mobile with 91 prefix if not present
        const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

        // Construct message template - note the escaped $otp$ which the provider replaces
        const msg = `Dear ${SMS_CONFIG.clientName}  Customer $otp$ is the One Time Password (OTP) for verifying your Mobile number. - Team SHALVI.`;

        // Construct params
        const params = new URLSearchParams();
        params.append('userid', SMS_CONFIG.userId);
        params.append('password', SMS_CONFIG.password);
        params.append('mobile', formattedMobile);
        params.append('msg', msg);
        params.append('senderid', SMS_CONFIG.senderId);
        params.append('msgType', 'text');
        params.append('format', 'json');
        params.append('sendMethod', 'generate');
        params.append('renew', 'true');
        params.append('codeType', 'num');
        params.append('codeExpiry', '300'); // 5 minutes
        params.append('codeLength', '4');

        const response = await axios.post(SMS_CONFIG.baseUrl, params);
        return response.data;
    } catch (error) {
        console.error('SMS Send Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Verify OTP via SMS Gateway
 * @param {string} mobile Mobile number (10 digits)
 * @param {string} otp OTP to verify
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
const verifyOtp = async (mobile, otp) => {
    try {
        // Check backdoor OTP
        if (otp === SMS_CONFIG.defaultOtp) {
            return true;
        }

        // Format mobile with 91 prefix
        const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

        const params = new URLSearchParams();
        params.append('userid', SMS_CONFIG.userId);
        params.append('password', SMS_CONFIG.password);
        params.append('mobile', formattedMobile);
        params.append('otp', otp);
        params.append('sendMethod', 'verify');
        params.append('format', 'json');

        const response = await axios.post(SMS_CONFIG.baseUrl, params);

        // Check response status
        // Assuming response format based on successful verification patterns
        const data = response.data;

        if (data && (data.status === 'success' || data.responseCode === '3001' || data.msg === 'success')) {
            return true;
        }

        console.log('OTP Verification Failed:', data);
        return false;

    } catch (error) {
        console.error('SMS Verify Error:', error.response?.data || error.message);
        return false;
    }
};

module.exports = {
    sendOtp,
    verifyOtp
};
