const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { callAI } = require('../services/fastapiClient');
const { getCompanyIdForUser } = require('./opportunitiesController');

const TABLE = { job: 'jobs', internship: 'internships' };

async function loadOpportunity(id, type) {
  const table = TABLE[type];
  if (!table) throw new ApiError(400, 'opportunity_type must be job or internship.');
  const { rows } = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  if (!rows.length) throw new ApiError(404, 'Opportunity not found.');
  return rows[0];
}

const apply = asyncHandler(async (req, res) => {
  const { opportunity_id, opportunity_type, cover_note } = req.body;
  if (!opportunity_id || !opportunity_type) {
    throw new ApiError(400, 'opportunity_id and opportunity_type are required.');
  }
  await loadOpportunity(opportunity_id, opportunity_type);

  const existing = await db.query(
    'SELECT id FROM applications WHERE student_id = $1 AND opportunity_id = $2 AND opportunity_type = $3',
    [req.user.id, opportunity_id, opportunity_type]
  );
  if (existing.rows.length) throw new ApiError(409, 'You have already applied to this opportunity.');

  // Ask the AI service for an explainable match score computed at application time.
  let matchScore = null;
  let explanation = null;
  try {
    const match = await callAI('/ai/match', {
      body: { student_id: req.user.id, opportunity_id, opportunity_type },
    });
    matchScore = match.score ?? null;
    explanation = match.explanation ?? null;
  } catch {
    // AI service unavailable — application still proceeds without a score.
  }

  const { rows } = await db.query(
    `INSERT INTO applications (student_id, opportunity_id, opportunity_type, cover_note, match_score)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user.id, opportunity_id, opportunity_type, cover_note || null, matchScore]
  );

  ok(res, { ...rows[0], explanation }, undefined, 201);
});

const myApplications = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT a.*,
       CASE WHEN a.opportunity_type = 'job' THEN j.title ELSE i.title END AS title,
       CASE WHEN a.opportunity_type = 'job' THEN j.company_id ELSE i.company_id END AS company_id,
       c.name AS company_name, c.logo_url
     FROM applications a
     LEFT JOIN jobs j ON a.opportunity_type = 'job' AND a.opportunity_id = j.id
     LEFT JOIN internships i ON a.opportunity_type = 'internship' AND a.opportunity_id = i.id
     LEFT JOIN companies c ON c.id = COALESCE(j.company_id, i.company_id)
     WHERE a.student_id = $1
     ORDER BY a.applied_at DESC`,
    [req.user.id]
  );
  ok(res, rows);
});

// Industry: applicants for a specific opportunity (or all opportunities owned by the company)
const listApplicants = asyncHandler(async (req, res) => {
  const companyId = await getCompanyIdForUser(req.user.id);
  const { opportunity_id, opportunity_type, status } = req.query;

  const conditions = [`c.id = $1`];
  const values = [companyId];
  let i = 2;
  if (opportunity_id) { conditions.push(`a.opportunity_id = $${i++}`); values.push(opportunity_id); }
  if (opportunity_type) { conditions.push(`a.opportunity_type = $${i++}`); values.push(opportunity_type); }
  if (status) { conditions.push(`a.status = $${i++}`); values.push(status); }

  const { rows } = await db.query(
    `SELECT a.*, u.name AS student_name, u.email AS student_email,
       sp.degree, sp.branch, sp.college, sp.graduation_year, sp.cgpa, sp.career_goal,
       CASE WHEN a.opportunity_type = 'job' THEN j.title ELSE i.title END AS opportunity_title
     FROM applications a
     JOIN users u ON u.id = a.student_id
     JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN jobs j ON a.opportunity_type = 'job' AND a.opportunity_id = j.id
     LEFT JOIN internships i ON a.opportunity_type = 'internship' AND a.opportunity_id = i.id
     LEFT JOIN companies c ON c.id = COALESCE(j.company_id, i.company_id)
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.match_score DESC NULLS LAST, a.applied_at DESC`,
    values
  );
  ok(res, rows);
});

const updateStatus = asyncHandler(async (req, res) => {
  const companyId = await getCompanyIdForUser(req.user.id);
  const { status } = req.body;
  const allowed = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);

  // Ensure the application belongs to an opportunity owned by this company.
  const { rows } = await db.query(
    `UPDATE applications a SET status = $1, updated_at = now()
     WHERE a.id = $2
       AND (
         (a.opportunity_type = 'job' AND a.opportunity_id IN (SELECT id FROM jobs WHERE company_id = $3))
         OR (a.opportunity_type = 'internship' AND a.opportunity_id IN (SELECT id FROM internships WHERE company_id = $3))
       )
     RETURNING a.*`,
    [status, req.params.id, companyId]
  );
  if (!rows.length) throw new ApiError(404, 'Application not found or not owned by this company.');

  await db.query(
    `INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)`,
    [rows[0].student_id, 'Application status updated', `Your application status changed to "${status.replace('_', ' ')}".`]
  );

  ok(res, rows[0]);
});

const recruitmentFunnel = asyncHandler(async (req, res) => {
  const companyId = await getCompanyIdForUser(req.user.id);
  const { rows } = await db.query(
    `SELECT a.status, COUNT(*)::int AS count
     FROM applications a
     WHERE (a.opportunity_type = 'job' AND a.opportunity_id IN (SELECT id FROM jobs WHERE company_id = $1))
        OR (a.opportunity_type = 'internship' AND a.opportunity_id IN (SELECT id FROM internships WHERE company_id = $1))
     GROUP BY a.status`,
    [companyId]
  );
  const funnel = { applied: 0, under_review: 0, shortlisted: 0, interview: 0, selected: 0, rejected: 0 };
  for (const r of rows) funnel[r.status] = r.count;
  ok(res, funnel);
});

module.exports = { apply, myApplications, listApplicants, updateStatus, recruitmentFunnel };
