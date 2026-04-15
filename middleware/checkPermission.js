/**
 * Granular permission middleware.
 * Must be used AFTER protect + authorize('admin') so req.user is guaranteed.
 */
const checkPermission = (section, action) => {
  return (req, res, next) => {
    // Super admins bypass all permission checks
    if (req.user.isSuperAdmin) return next();

    const sectionPerms = req.user.permissions?.[section];
    if (!sectionPerms || !sectionPerms[action]) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to ${action} in ${section}`
      });
    }

    next();
  };
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

module.exports = { checkPermission, requireSuperAdmin };
