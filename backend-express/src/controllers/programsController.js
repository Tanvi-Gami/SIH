const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { q, difficulty, skill } = req.query;
  const conditions = [];
  const values = [];
  let i = 1;
  if (q) { conditions.push(`(lp.title ILIKE $${i} OR lp.description ILIKE $${i})`); values.push(`%${q}%`); i++; }
  if (difficulty) { conditions.push(`lp.difficulty = $${i++}`); values.push(difficulty); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let query = `SELECT lp.*, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
               FROM learning_programs lp
               LEFT JOIN program_skills ps ON ps.program_id = lp.id
               LEFT JOIN skills s ON s.id = ps.skill_id
               ${where}
               GROUP BY lp.id`;

  if (skill) {
    query = `SELECT lp.*, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
              FROM learning_programs lp
              JOIN program_skills ps ON ps.program_id = lp.id
              JOIN skills s ON s.id = ps.skill_id
              ${conditions.length ? where + ' AND' : 'WHERE'} s.name ILIKE $${i++}
              GROUP BY lp.id`;
    values.push(`%${skill}%`);
  }
  query += ' ORDER BY lp.title';

  const { rows } = await db.query(query, values);
  ok(res, rows);
});

const get = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT lp.*, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM learning_programs lp
     LEFT JOIN program_skills ps ON ps.program_id = lp.id
     LEFT JOIN skills s ON s.id = ps.skill_id
     WHERE lp.id = $1 GROUP BY lp.id`,
    [req.params.id]
  );
  if (!rows.length) throw new ApiError(404, 'Learning program not found.');
  ok(res, rows[0]);
});

module.exports = { list, get };
