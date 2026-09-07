const db = require('../config/db');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  ok(res, rows);
});

const markRead = asyncHandler(async (req, res) => {
  await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  ok(res, { updated: true });
});

const markAllRead = asyncHandler(async (req, res) => {
  await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
  ok(res, { updated: true });
});

module.exports = { list, markRead, markAllRead };
