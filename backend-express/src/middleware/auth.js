const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/** Verifies the JWT and attaches { id, role, email, name } to req.user. */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Authentication required. Please log in.'));
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired session. Please log in again.'));
  }
}

/** Restricts a route to one or more roles. Use after `authenticate`. */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required.'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `This action requires role: ${roles.join(' or ')}.`));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
