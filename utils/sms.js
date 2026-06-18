const axios = require('axios');

// Multi-tenant SMS gateway client. Each call takes the TENANT's gateway config
// (resolved via integrations/sms.js -> smsConfigFor(req.tenant)); there is no
// module-load shared account any more.
//
// The `2786` backdoor OTP is preserved (owner removes it later) and is sourced
// from SMS_DEFAULT_OTP so it isn't hard-coded per tenant.
const DEFAULT_OTP = process.env.SMS_DEFAULT_OTP || '2786'; // Backdoor OTP from PHP script

/**
 * Send OTP via the tenant's SMS Gateway.
 * @param {{baseUrl,userId,password,senderId,clientName}} cfg tenant SMS config
 * @param {string} mobile Mobile number (10 digits)
 * @returns {Promise<Object>} Response from gateway
 */
const sendOtp = async (cfg, mobile) => {
    try {
        // Format mobile with 91 prefix if not present
        const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

        // Construct message template - note the escaped $otp$ which the provider replaces
        const msg = `Dear ${cfg.clientName} Customer $otp$ is the One Time Password (OTP) for verifying your Mobile number. - Team SHALVI.`;

        // Construct params
        const params = new URLSearchParams();
        params.append('userid', cfg.userId);
        params.append('password', cfg.password);
        params.append('mobile', formattedMobile);
        params.append('msg', msg);
        params.append('senderid', cfg.senderId);
        params.append('msgType', 'text');
        params.append('format', 'json');
        params.append('sendMethod', 'generate');
        params.append('renew', 'true');
        params.append('codeType', 'num');
        params.append('codeExpiry', '300'); // 5 minutes
        params.append('codeLength', '4');

        const response = await axios.post(cfg.baseUrl, params);
        return response.data;
    } catch (error) {
        console.error('SMS Send Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Verify OTP via the tenant's SMS Gateway.
 * @param {{baseUrl,userId,password}} cfg tenant SMS config
 * @param {string} mobile Mobile number (10 digits)
 * @param {string} otp OTP to verify
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
const verifyOtp = async (cfg, mobile, otp) => {
    try {
        // Check backdoor OTP
        if (otp === DEFAULT_OTP) {
            return true;
        }

        // Format mobile with 91 prefix
        const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

        const params = new URLSearchParams();
        params.append('userid', cfg.userId);
        params.append('password', cfg.password);
        params.append('mobile', formattedMobile);
        params.append('otp', otp);
        params.append('sendMethod', 'verify');
        params.append('format', 'json');

        const response = await axios.post(cfg.baseUrl, params);

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
