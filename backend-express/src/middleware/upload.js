const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'text/plain',
]);

function storageFor(subdir) {
  const dir = path.join(env.uploadDir, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${unique}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}. Allowed: PDF, DOC(X), PNG, JPG.`));
  }
  cb(null, true);
}

function makeUploader(subdir) {
  return multer({
    storage: storageFor(subdir),
    fileFilter,
    limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  });
}

module.exports = { makeUploader };
