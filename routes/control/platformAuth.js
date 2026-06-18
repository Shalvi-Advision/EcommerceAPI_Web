const express = require('express');

const router = express.Router();

const platformAuth = require('../../controllers/platformAuth');
const { requirePlatformAdmin } = require('../../middleware/platformAuth');

// Platform super-admin auth (plan §8). Mounted on /api/admin/platform BEFORE
// resolveTenant — platform admins have no tenant context. OTP login against the
// control-plane PlatformAdmin model; the issued JWT carries `platformAdmin:true`.

router.post('/send-otp', platformAuth.sendOtp);
router.post('/verify-otp', platformAuth.verifyOtp);
router.get('/me', requirePlatformAdmin, platformAuth.me);

module.exports = router;
