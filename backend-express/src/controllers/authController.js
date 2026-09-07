const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiry }
  );
}

function sanitizeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) throw new ApiError(409, 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1,$2,$3,$4,$5)
     RETURNING id, name, email, role, phone, created_at`,
    [name, email, passwordHash, role, phone || null]
  );
  const user = rows[0];

  // Create the role-specific empty profile shell so downstream routes never 404.
  if (role === 'student') {
    await db.query('INSERT INTO student_profiles (user_id) VALUES ($1)', [user.id]);
  } else if (role === 'industry') {
    await db.query('INSERT INTO companies (user_id, name) VALUES ($1,$2)', [user.id, `${name}'s Company`]);
  } else if (role === 'faculty') {
    await db.query('INSERT INTO faculty_profiles (user_id) VALUES ($1)', [user.id]);
  } else if (role === 'institution') {
    await db.query('INSERT INTO institutions (user_id, name) VALUES ($1,$2)', [user.id, `${name}`]);
  }

  const token = signToken(user);
  ok(res, { user, token }, undefined, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!rows.length) throw new ApiError(401, 'Invalid email or password.');
  const user = rows[0];
  if (!user.is_active) throw new ApiError(403, 'This account has been deactivated.');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password.');

  const token = signToken(user);
  ok(res, { user: sanitizeUser(user), token });
});

const me = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows.length) throw new ApiError(404, 'User not found.');
  ok(res, rows[0]);
});

module.exports = { register, login, me };
