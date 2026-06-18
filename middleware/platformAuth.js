const jwt = require('jsonwebtoken');
const { PlatformAdmin } = require('../db/controlConnection');

// Gate control-plane routes (tenant list/suspend/resume, provisioning) to platform
// super-admins (plan §8). This is independent of resolveTenant and the tenant User
// model: it verifies the `platformAdmin` claim minted by controllers/platformAuth.js
// and loads the admin from the CONTROL database. A tenant user's token — which never
// carries `platformAdmin: true` — is rejected here.

const requirePlatformAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token is not valid.' });
    }

    if (!decoded.platformAdmin) {
      return res.status(403).json({ success: false, message: 'Platform admin access required.' });
    }

    const admin = await PlatformAdmin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Platform admin not found or inactive.' });
    }

    req.platformAdmin = admin;
    next();
  } catch (error) {
    console.error('Platform auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error in platform authentication' });
  }
};

// Scope guard: a platform admin with a non-empty allowedTenantSlugs may only act
// on those tenants. Empty/absent list = access to all. Use on tenant-scoped
// control routes that carry a :slug param.
const assertTenantAllowed = (req, res, next) => {
  const allowed = req.platformAdmin?.allowedTenantSlugs || [];
  const slug = req.params.slug;
  if (allowed.length === 0 || allowed.includes(slug)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Not permitted for this tenant.' });
};

module.exports = { requirePlatformAdmin, assertTenantAllowed };
