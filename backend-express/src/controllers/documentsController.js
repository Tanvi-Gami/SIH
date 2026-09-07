const path = require('path');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const DOC_TYPES = new Set(['resume', 'certificate', 'academic', 'project']);

const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file was uploaded.');
  const docType = req.body.doc_type || 'resume';
  if (!DOC_TYPES.has(docType)) throw new ApiError(400, `doc_type must be one of: ${[...DOC_TYPES].join(', ')}`);

  const relativeUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;
  const { rows } = await db.query(
    `INSERT INTO documents (user_id, doc_type, filename, url, mime_type, size_bytes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, docType, req.file.originalname, relativeUrl, req.file.mimetype, req.file.size]
  );

  if (docType === 'resume') {
    await db.query('UPDATE student_profiles SET resume_url = $1, updated_at = now() WHERE user_id = $2', [relativeUrl, req.user.id]);
  }

  ok(res, rows[0], undefined, 201);
});

const listMine = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC', [req.user.id]);
  ok(res, rows);
});

module.exports = { upload, listMine };
