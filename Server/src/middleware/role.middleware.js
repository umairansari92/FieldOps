/**
 * Role-based access control middleware factory.
 * Usage: router.get('/route', auth, role('ADMIN', 'TECHNICIAN'), handler)
 */
const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route requires one of: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = role;
