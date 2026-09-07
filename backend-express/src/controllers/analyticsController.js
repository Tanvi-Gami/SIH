const db = require('../config/db');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/** Public, platform-wide headline stats — used on the landing page. */
const platformStats = asyncHandler(async (req, res) => {
  const [students, companies, jobs, internships, placed, institutions] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS c FROM users WHERE role = 'student'`),
    db.query(`SELECT COUNT(*)::int AS c FROM companies`),
    db.query(`SELECT COUNT(*)::int AS c FROM jobs WHERE status = 'open'`),
    db.query(`SELECT COUNT(*)::int AS c FROM internships WHERE status = 'open'`),
    db.query(`SELECT COUNT(*)::int AS c FROM applications WHERE status = 'selected'`),
    db.query(`SELECT COUNT(*)::int AS c FROM institutions`),
  ]);
  ok(res, {
    students: students.rows[0].c,
    companies: companies.rows[0].c,
    open_jobs: jobs.rows[0].c,
    open_internships: internships.rows[0].c,
    students_placed: placed.rows[0].c,
    institutions: institutions.rows[0].c,
  });
});

module.exports = { platformStats };
