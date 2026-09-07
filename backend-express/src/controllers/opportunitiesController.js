const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const TABLE = { job: 'jobs', internship: 'internships' };

async function getCompanyIdForUser(userId) {
  const { rows } = await db.query('SELECT id FROM companies WHERE user_id = $1', [userId]);
  if (!rows.length) throw new ApiError(404, 'Company profile not found for this account.');
  return rows[0].id;
}

async function attachSkills(opportunityId, opportunityType) {
  const { rows } = await db.query(
    `SELECT s.id, s.name, os.required_proficiency, os.importance
     FROM opportunity_skills os JOIN skills s ON s.id = os.skill_id
     WHERE os.opportunity_id = $1 AND os.opportunity_type = $2
     ORDER BY os.importance, os.required_proficiency DESC`,
    [opportunityId, opportunityType]
  );
  return rows;
}

function buildList(type) {
  return asyncHandler(async (req, res) => {
    const { q, location, status = 'open', company_id, min_cgpa_lte, page = 1, limit = 20 } = req.query;
    const table = TABLE[type];
    const conditions = [];
    const values = [];
    let i = 1;

    if (status) { conditions.push(`o.status = $${i++}`); values.push(status); }
    if (q) { conditions.push(`(o.title ILIKE $${i} OR o.description ILIKE $${i})`); values.push(`%${q}%`); i++; }
    if (location) { conditions.push(`o.location ILIKE $${i++}`); values.push(`%${location}%`); }
    if (company_id) { conditions.push(`o.company_id = $${i++}`); values.push(company_id); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);

    const { rows } = await db.query(
      `SELECT o.*, c.name AS company_name, c.logo_url, c.industry AS company_industry,
              COUNT(*) OVER() AS total_count
       FROM ${table} o JOIN companies c ON c.id = o.company_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      [...values, limit, offset]
    );

    const total = rows.length ? Number(rows[0].total_count) : 0;
    const opportunities = await Promise.all(
      rows.map(async (r) => {
        delete r.total_count;
        r.required_skills = await attachSkills(r.id, type);
        return r;
      })
    );

    ok(res, opportunities, { total, page: Number(page), limit: Number(limit) });
  });
}

function buildGet(type) {
  return asyncHandler(async (req, res) => {
    const table = TABLE[type];
    const { rows } = await db.query(
      `SELECT o.*, c.name AS company_name, c.logo_url, c.industry AS company_industry, c.description AS company_description
       FROM ${table} o JOIN companies c ON c.id = o.company_id WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows.length) throw new ApiError(404, `${type} not found.`);
    const opp = rows[0];
    opp.required_skills = await attachSkills(opp.id, type);
    ok(res, opp);
  });
}

function buildCreate(type) {
  const columnsByType = {
    job: ['title', 'description', 'location', 'employment_type', 'eligibility', 'min_cgpa', 'experience_required', 'salary_range', 'deadline'],
    internship: ['title', 'description', 'location', 'duration', 'eligibility', 'min_cgpa', 'stipend', 'deadline'],
  };
  return asyncHandler(async (req, res) => {
    const table = TABLE[type];
    const companyId = await getCompanyIdForUser(req.user.id);
    const cols = columnsByType[type];
    const values = cols.map((c) => (req.body[c] !== undefined ? req.body[c] : null));
    if (!req.body.title) throw new ApiError(400, 'Title is required.');

    const placeholders = cols.map((_, idx) => `$${idx + 2}`).join(',');
    const { rows } = await db.query(
      `INSERT INTO ${table} (company_id, ${cols.join(',')}) VALUES ($1,${placeholders}) RETURNING *`,
      [companyId, ...values]
    );
    const opportunity = rows[0];

    const requiredSkills = req.body.required_skills || []; // [{skill_name, required_proficiency, importance}]
    for (const skill of requiredSkills) {
      let skillRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skill.skill_name]);
      let skillId;
      if (skillRes.rows.length) {
        skillId = skillRes.rows[0].id;
      } else {
        const inserted = await db.query('INSERT INTO skills (name, category) VALUES ($1,$2) RETURNING id', [skill.skill_name, 'technical']);
        skillId = inserted.rows[0].id;
      }
      await db.query(
        `INSERT INTO opportunity_skills (opportunity_id, opportunity_type, skill_id, required_proficiency, importance)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (opportunity_id, skill_id) DO UPDATE SET required_proficiency = $4, importance = $5`,
        [opportunity.id, type, skillId, skill.required_proficiency || 50, skill.importance || 'required']
      );
    }
    opportunity.required_skills = await attachSkills(opportunity.id, type);
    ok(res, opportunity, undefined, 201);
  });
}

function buildUpdateStatus(type) {
  return asyncHandler(async (req, res) => {
    const table = TABLE[type];
    const companyId = await getCompanyIdForUser(req.user.id);
    const { status } = req.body;
    if (!['open', 'closed'].includes(status)) throw new ApiError(400, 'status must be open or closed.');
    const { rows } = await db.query(
      `UPDATE ${table} SET status = $1 WHERE id = $2 AND company_id = $3 RETURNING *`,
      [status, req.params.id, companyId]
    );
    if (!rows.length) throw new ApiError(404, `${type} not found or not owned by this company.`);
    ok(res, rows[0]);
  });
}

const listMyOpportunities = asyncHandler(async (req, res) => {
  const companyId = await getCompanyIdForUser(req.user.id);
  const [jobs, internships] = await Promise.all([
    db.query('SELECT *, \'job\' AS opportunity_type FROM jobs WHERE company_id = $1 ORDER BY created_at DESC', [companyId]),
    db.query('SELECT *, \'internship\' AS opportunity_type FROM internships WHERE company_id = $1 ORDER BY created_at DESC', [companyId]),
  ]);
  ok(res, { jobs: jobs.rows, internships: internships.rows });
});

module.exports = {
  listJobs: buildList('job'),
  listInternships: buildList('internship'),
  getJob: buildGet('job'),
  getInternship: buildGet('internship'),
  createJob: buildCreate('job'),
  createInternship: buildCreate('internship'),
  updateJobStatus: buildUpdateStatus('job'),
  updateInternshipStatus: buildUpdateStatus('internship'),
  listMyOpportunities,
  getCompanyIdForUser,
};
