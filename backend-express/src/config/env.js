require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://sih_user:sih_password@localhost:5432/sih_platform',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  fastapiUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || require('path').join(__dirname, '..', 'uploads'),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
};
