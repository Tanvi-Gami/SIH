const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, sp.*
     FROM users u JOIN student_profiles sp ON sp.user_id = u.id
     WHERE u.id = $1`,
    [studentId]
  );
  if (!rows.length) throw new ApiError(404, 'Student profile not found.');
  ok(res, rows[0]);
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['degree', 'branch', 'college', 'graduation_year', 'cgpa', 'bio', 'interests', 'career_goal', 'location'];
  const fields = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = $${i++}`);
      values.push(req.body[key]);
    }
  }
  if (!fields.length) throw new ApiError(400, 'No valid fields provided.');
  values.push(req.user.id);
  fields.push('updated_at = now()');
  const { rows } = await db.query(
    `UPDATE student_profiles SET ${fields.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values
  );
  if (!rows.length) throw new ApiError(404, 'Student profile not found.');
  ok(res, rows[0]);
});

const listSkills = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  const { rows } = await db.query(
    `SELECT s.id, s.name, s.category, ss.proficiency, ss.assessment_score, ss.source, ss.updated_at
     FROM student_skills ss JOIN skills s ON s.id = ss.skill_id
     WHERE ss.student_id = $1 ORDER BY ss.proficiency DESC`,
    [studentId]
  );
  ok(res, rows);
});

const upsertSkill = asyncHandler(async (req, res) => {
  const { skill_name, proficiency, source = 'manual' } = req.body;
  if (!skill_name || proficiency === undefined) {
    throw new ApiError(400, 'skill_name and proficiency are required.');
  }
  let skillRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skill_name]);
  let skillId;
  if (skillRes.rows.length) {
    skillId = skillRes.rows[0].id;
  } else {
    const inserted = await db.query(
      'INSERT INTO skills (name, category) VALUES ($1,$2) RETURNING id',
      [skill_name, 'technical']
    );
    skillId = inserted.rows[0].id;
  }
  const { rows } = await db.query(
    `INSERT INTO student_skills (student_id, skill_id, proficiency, source)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (student_id, skill_id) DO UPDATE SET proficiency = $3, source = $4, updated_at = now()
     RETURNING *`,
    [req.user.id, skillId, proficiency, source]
  );
  ok(res, rows[0], undefined, 201);
});

const deleteSkill = asyncHandler(async (req, res) => {
  await db.query('DELETE FROM student_skills WHERE student_id = $1 AND skill_id = $2', [req.user.id, req.params.skillId]);
  ok(res, { deleted: true });
});

const listAllSkills = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT id, name, category FROM skills ORDER BY name');
  ok(res, rows);
});

const listCareerTracks = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT id, name, description FROM career_tracks ORDER BY name');
  ok(res, rows);
});

const getCareerTrackSkills = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.id, s.name, s.category, cts.required_proficiency, cts.weight
     FROM career_track_skills cts JOIN skills s ON s.id = cts.skill_id
     WHERE cts.track_id = $1 ORDER BY cts.required_proficiency DESC`,
    [req.params.trackId]
  );
  ok(res, rows);
});

// -------- Projects --------
const listProjects = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  const { rows } = await db.query('SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
  ok(res, rows);
});

const addProject = asyncHandler(async (req, res) => {
  const { title, description, technologies = [], project_url } = req.body;
  if (!title) throw new ApiError(400, 'Project title is required.');
  const { rows } = await db.query(
    `INSERT INTO projects (student_id, title, description, technologies, project_url)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user.id, title, description, technologies, project_url]
  );
  ok(res, rows[0], undefined, 201);
});

const deleteProject = asyncHandler(async (req, res) => {
  await db.query('DELETE FROM projects WHERE id = $1 AND student_id = $2', [req.params.projectId, req.user.id]);
  ok(res, { deleted: true });
});

// -------- Certifications --------
const listCertifications = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  const { rows } = await db.query('SELECT * FROM certifications WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
  ok(res, rows);
});

const addCertification = asyncHandler(async (req, res) => {
  const { name, issuer, issue_date, file_url } = req.body;
  if (!name) throw new ApiError(400, 'Certification name is required.');
  const { rows } = await db.query(
    `INSERT INTO certifications (student_id, name, issuer, issue_date, file_url)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user.id, name, issuer, issue_date || null, file_url]
  );
  ok(res, rows[0], undefined, 201);
});

// -------- Assessments --------
const submitAssessment = asyncHandler(async (req, res) => {
  const { career_track, skill_scores, overall_score } = req.body;
  if (!career_track || !skill_scores) throw new ApiError(400, 'career_track and skill_scores are required.');

  const { rows } = await db.query(
    `INSERT INTO assessment_results (student_id, career_track, skill_scores, overall_score)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, career_track, JSON.stringify(skill_scores), overall_score]
  );

  // Persist / update proficiency for each assessed skill.
  for (const [skillName, score] of Object.entries(skill_scores)) {
    let skillRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skillName]);
    let skillId;
    if (skillRes.rows.length) {
      skillId = skillRes.rows[0].id;
    } else {
      const inserted = await db.query('INSERT INTO skills (name, category) VALUES ($1,$2) RETURNING id', [skillName, 'technical']);
      skillId = inserted.rows[0].id;
    }
    await db.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency, assessment_score, source)
       VALUES ($1,$2,$3,$3,'assessment')
       ON CONFLICT (student_id, skill_id) DO UPDATE SET proficiency = $3, assessment_score = $3, source = 'assessment', updated_at = now()`,
      [req.user.id, skillId, Math.round(score)]
    );
  }

  // Update overall readiness score as a simple rolling average.
  await db.query(
    `UPDATE student_profiles SET readiness_score = $2, updated_at = now() WHERE user_id = $1`,
    [req.user.id, overall_score]
  );

  ok(res, rows[0], undefined, 201);
});

const listAssessments = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  const { rows } = await db.query(
    'SELECT * FROM assessment_results WHERE student_id = $1 ORDER BY taken_at DESC',
    [studentId]
  );
  ok(res, rows);
});

// -------- Applications summary --------
const applicationsSummary = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM applications WHERE student_id = $1 GROUP BY status`,
    [req.user.id]
  );
  const summary = { applied: 0, under_review: 0, shortlisted: 0, interview: 0, selected: 0, rejected: 0 };
  for (const r of rows) summary[r.status] = r.count;
  summary.total = Object.values(summary).reduce((a, b) => a + b, 0);
  ok(res, summary);
});

// -------- Portfolio (public-style aggregate view) --------
const getPortfolio = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;
  const profileRes = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, sp.* FROM users u
     JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = $1`,
    [studentId]
  );
  if (!profileRes.rows.length) throw new ApiError(404, 'Student not found.');

  const [skills, projects, certifications, applications] = await Promise.all([
    db.query(
      `SELECT s.name, s.category, ss.proficiency FROM student_skills ss
       JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = $1 ORDER BY ss.proficiency DESC`,
      [studentId]
    ),
    db.query('SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC', [studentId]),
    db.query('SELECT * FROM certifications WHERE student_id = $1 ORDER BY created_at DESC', [studentId]),
    db.query(
      `SELECT status, COUNT(*)::int AS count FROM applications WHERE student_id = $1 GROUP BY status`,
      [studentId]
    ),
  ]);

  ok(res, {
    profile: profileRes.rows[0],
    skills: skills.rows,
    projects: projects.rows,
    certifications: certifications.rows,
    applicationStats: applications.rows,
  });
});

module.exports = {
  getProfile, updateProfile, listSkills, upsertSkill, deleteSkill, listAllSkills, listCareerTracks, getCareerTrackSkills,
  listProjects, addProject, deleteProject, listCertifications, addCertification,
  submitAssessment, listAssessments, applicationsSummary, getPortfolio,
};
