const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { getCompanyIdForUser } = require('./opportunitiesController');

const getMyCompany = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM companies WHERE user_id = $1', [req.user.id]);
  if (!rows.length) throw new ApiError(404, 'Company profile not found.');
  ok(res, rows[0]);
});

const updateMyCompany = asyncHandler(async (req, res) => {
  const allowed = ['name', 'industry', 'description', 'website', 'location', 'logo_url', 'size'];
  const fields = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); values.push(req.body[key]); }
  }
  if (!fields.length) throw new ApiError(400, 'No valid fields provided.');
  values.push(req.user.id);
  const { rows } = await db.query(
    `UPDATE companies SET ${fields.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values
  );
  if (!rows.length) throw new ApiError(404, 'Company profile not found.');
  ok(res, rows[0]);
});

const getCompany = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
  if (!rows.length) throw new ApiError(404, 'Company not found.');
  ok(res, rows[0]);
});

const listCompanies = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM companies ORDER BY name');
  ok(res, rows);
});

/**
 * Candidate search & compatibility scoring for recruiters.
 * Eligibility filtering happens in SQL; skill-match scoring happens in JS
 * (fast, deterministic — the deeper semantic/AI explanation is a separate,
 * on-demand call to the FastAPI service from the frontend when a recruiter
 * opens a specific candidate).
 */
const searchCandidates = asyncHandler(async (req, res) => {
  await getCompanyIdForUser(req.user.id); // ensures caller is a recruiter with a company
  const { branch, degree, min_grad_year, career_goal, opportunity_id, opportunity_type, q } = req.query;

  const conditions = [];
  const values = [];
  let i = 1;
  if (branch) { conditions.push(`sp.branch ILIKE $${i++}`); values.push(`%${branch}%`); }
  if (degree) { conditions.push(`sp.degree ILIKE $${i++}`); values.push(`%${degree}%`); }
  if (min_grad_year) { conditions.push(`sp.graduation_year >= $${i++}`); values.push(min_grad_year); }
  if (career_goal) { conditions.push(`sp.career_goal ILIKE $${i++}`); values.push(`%${career_goal}%`); }
  if (q) { conditions.push(`u.name ILIKE $${i++}`); values.push(`%${q}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: students } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, sp.* FROM users u
     JOIN student_profiles sp ON sp.user_id = u.id
     ${where}
     ORDER BY sp.readiness_score DESC NULLS LAST
     LIMIT 100`,
    values
  );

  let requiredSkills = [];
  if (opportunity_id && opportunity_type) {
    const { rows } = await db.query(
      `SELECT skill_id, required_proficiency, importance FROM opportunity_skills
       WHERE opportunity_id = $1 AND opportunity_type = $2`,
      [opportunity_id, opportunity_type]
    );
    requiredSkills = rows;
  }

  const studentIds = students.map((s) => s.id);
  let skillsByStudent = {};
  if (studentIds.length) {
    const { rows } = await db.query(
      `SELECT student_id, skill_id, proficiency FROM student_skills WHERE student_id = ANY($1::uuid[])`,
      [studentIds]
    );
    for (const r of rows) {
      skillsByStudent[r.student_id] = skillsByStudent[r.student_id] || {};
      skillsByStudent[r.student_id][r.skill_id] = r.proficiency;
    }
  }

  const results = students.map((s) => {
    let matchScore = null;
    let matched = 0, missing = 0;
    if (requiredSkills.length) {
      const owned = skillsByStudent[s.id] || {};
      let weightedScore = 0;
      let totalWeight = 0;
      for (const rs of requiredSkills) {
        const weight = rs.importance === 'required' ? 2 : 1;
        totalWeight += weight;
        const prof = owned[rs.skill_id] || 0;
        if (prof >= rs.required_proficiency) matched++; else missing++;
        weightedScore += weight * Math.min(1, prof / Math.max(rs.required_proficiency, 1));
      }
      matchScore = totalWeight ? Math.round((weightedScore / totalWeight) * 100) : null;
    }
    return { ...s, match_score: matchScore, skills_matched: matched, skills_missing: missing };
  });

  if (requiredSkills.length) results.sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1));

  ok(res, results);
});

module.exports = { getMyCompany, updateMyCompany, getCompany, listCompanies, searchCandidates };
