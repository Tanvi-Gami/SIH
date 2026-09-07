// Wraps an async route handler so rejected promises are forwarded to Express error middleware.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
