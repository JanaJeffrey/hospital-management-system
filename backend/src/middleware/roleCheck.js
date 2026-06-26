// ============================================
// ROLE CHECK MIDDLEWARE
// ============================================
// This file checks if a user has the right role to access certain routes
// It works together with the authenticate middleware

/**
 * hasRole - Creates a middleware function that checks if the user has a specific role
 * 
 * @param {string[]} allowedRoles - Array of role names that are allowed (e.g., ['admin'])
 * @returns {Function} Express middleware function
 * 
 * How it works:
 * 1. The authenticate middleware runs first and attaches user info to req.user
 * 2. This middleware checks if the user's role is in the allowed list
 * 3. If yes, it calls next() to continue to the route handler
 * 4. If no, it returns a 403 Forbidden error
 */
export const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    // Get the user's role from the JWT token (attached by authenticate middleware)
    const userRole = req.user?.role?.toLowerCase();
    
    if (!userRole) {
      return res.status(401).json({ error: 'User role not found' });
    }
    
    // Check if the user's role is in the allowed list
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        yourRole: userRole,
        requiredRoles: allowedRoles
      });
    }
    
    // User has permission, continue to the route handler
    next();
  };
};

// ============================================
// PRE-MADE ROLE CHECKS
// ============================================
// These are convenience functions for common role checks

// Check if user is an admin
export const isAdmin = hasRole(['admin']);

// Check if user is a doctor
export const isDoctor = hasRole(['doctor']);

// Check if user is a patient
export const isPatient = hasRole(['patient']);

// Check if user is either a doctor or admin
export const isDoctorOrAdmin = hasRole(['doctor', 'admin']);