const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message, errors: err.errors });
  }

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'This record already exists.' });
  }
  // Postgres FK violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Related record not found.' });
  }

  console.error('Unhandled error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again shortly.',
    ...(isProd ? {} : { debug: err.message }),
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
