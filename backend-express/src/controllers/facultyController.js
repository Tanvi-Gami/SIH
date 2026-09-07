const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const facultyId = req.params.facultyId || req.user.id;
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, fp.*
     FROM users u JOIN faculty_profiles fp ON fp.user_id = u.id WHERE u.id = $1`,
    [facultyId]
  );
  if (!rows.length) throw new ApiError(404, 'Faculty profile not found.');
  ok(res, rows[0]);
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['designation', 'department', 'qualifications', 'expertise', 'research_interests', 'experience_years', 'bio'];
  const fields = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); values.push(req.body[key]); }
  }
  if (!fields.length) throw new ApiError(400, 'No valid fields provided.');
  values.push(req.user.id);
  fields.push('updated_at = now()');
  const { rows } = await db.query(
    `UPDATE faculty_profiles SET ${fields.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values
  );
  if (!rows.length) throw new ApiError(404, 'Faculty profile not found.');
  ok(res, rows[0]);
});

const listOpportunities = asyncHandler(async (req, res) => {
  const { type, q } = req.query;
  const conditions = [`fo.status = 'open'`];
  const values = [];
  let i = 1;
  if (type) { conditions.push(`fo.type = $${i++}`); values.push(type); }
  if (q) { conditions.push(`(fo.title ILIKE $${i} OR fo.description ILIKE $${i})`); values.push(`%${q}%`); i++; }
  const { rows } = await db.query(
    `SELECT fo.*, c.name AS company_name, c.logo_url
     FROM faculty_opportunities fo JOIN companies c ON c.id = fo.company_id
     WHERE ${conditions.join(' AND ')} ORDER BY fo.created_at DESC`,
    values
  );
  ok(res, rows);
});

const getOpportunity = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT fo.*, c.name AS company_name, c.description AS company_description
     FROM faculty_opportunities fo JOIN companies c ON c.id = fo.company_id WHERE fo.id = $1`,
    [req.params.id]
  );
  if (!rows.length) throw new ApiError(404, 'Opportunity not found.');
  ok(res, rows[0]);
});

const createOpportunity = asyncHandler(async (req, res) => {
  const { rows: companyRows } = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
  if (!companyRows.length) throw new ApiError(404, 'Company profile not found for this account.');
  const { type, title, description, required_expertise = [], location, deadline } = req.body;
  if (!type || !title) throw new ApiError(400, 'type and title are required.');
  const { rows } = await db.query(
    `INSERT INTO faculty_opportunities (company_id, type, title, description, required_expertise, location, deadline)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [companyRows[0].id, type, title, description, required_expertise, location, deadline]
  );
  ok(res, rows[0], undefined, 201);
});

const apply = asyncHandler(async (req, res) => {
  const { opportunity_id } = req.body;
  if (!opportunity_id) throw new ApiError(400, 'opportunity_id is required.');
  const existing = await db.query(
    'SELECT id FROM faculty_applications WHERE faculty_id = $1 AND opportunity_id = $2',
    [req.user.id, opportunity_id]
  );
  if (existing.rows.length) throw new ApiError(409, 'You have already applied to this opportunity.');
  const { rows } = await db.query(
    `INSERT INTO faculty_applications (faculty_id, opportunity_id) VALUES ($1,$2) RETURNING *`,
    [req.user.id, opportunity_id]
  );
  ok(res, rows[0], undefined, 201);
});

const myApplications = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT fa.*, fo.title, fo.type, c.name AS company_name
     FROM faculty_applications fa
     JOIN faculty_opportunities fo ON fo.id = fa.opportunity_id
     JOIN companies c ON c.id = fo.company_id
     WHERE fa.faculty_id = $1 ORDER BY fa.applied_at DESC`,
    [req.user.id]
  );
  ok(res, rows);
});

const listApplicantsForCompany = asyncHandler(async (req, res) => {
  const { rows: companyRows } = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
  if (!companyRows.length) throw new ApiError(404, 'Company profile not found for this account.');
  const { rows } = await db.query(
    `SELECT fa.*, u.name AS faculty_name, u.email AS faculty_email, fp.designation, fp.department, fp.expertise,
            fo.title AS opportunity_title
     FROM faculty_applications fa
     JOIN users u ON u.id = fa.faculty_id
     JOIN faculty_profiles fp ON fp.user_id = u.id
     JOIN faculty_opportunities fo ON fo.id = fa.opportunity_id
     WHERE fo.company_id = $1 ORDER BY fa.applied_at DESC`,
    [companyRows[0].id]
  );
  ok(res, rows);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { rows: companyRows } = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
  if (!companyRows.length) throw new ApiError(404, 'Company profile not found for this account.');
  const allowed = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  const { rows } = await db.query(
    `UPDATE faculty_applications fa SET status = $1
     WHERE fa.id = $2 AND fa.opportunity_id IN (SELECT id FROM faculty_opportunities WHERE company_id = $3)
     RETURNING fa.*`,
    [req.body.status, req.params.id, companyRows[0].id]
  );
  if (!rows.length) throw new ApiError(404, 'Application not found or not owned by this company.');
  ok(res, rows[0]);
});

module.exports = {
  getProfile, updateProfile, listOpportunities, getOpportunity, createOpportunity,
  apply, myApplications, listApplicantsForCompany, updateApplicationStatus,
};
