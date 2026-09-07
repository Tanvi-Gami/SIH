const fs = require('fs');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { callAI } = require('../services/fastapiClient');

/**
 * Upload + AI-analyze a resume in one step.
 * The file is stored (so it appears in the student's documents/portfolio)
 * and its bytes are forwarded to the FastAPI service for extraction.
 * Nothing is written to student_profiles/skills yet — the frontend shows
 * the extraction for the student to confirm via /ai/resume/confirm.
 */
const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No resume file was uploaded.');

  const relativeUrl = `/uploads/resumes/${req.file.filename}`;
  await db.query(
    `INSERT INTO documents (user_id, doc_type, filename, url, mime_type, size_bytes)
     VALUES ($1,'resume',$2,$3,$4,$5)`,
    [req.user.id, req.file.originalname, relativeUrl, req.file.mimetype, req.file.size]
  );
  await db.query('UPDATE student_profiles SET resume_url = $1, updated_at = now() WHERE user_id = $2', [relativeUrl, req.user.id]);

  const fileBuffer = fs.readFileSync(req.file.path);
  const result = await callAI('/ai/resume/analyze', {
    body: {
      student_id: req.user.id,
      filename: req.file.originalname,
      mime_type: req.file.mimetype,
      content_base64: fileBuffer.toString('base64'),
    },
  });

  ok(res, result);
});

/**
 * Persists the student-confirmed subset of an AI resume extraction.
 * Never blindly overwrites — only adds skills/projects/certifications the
 * student explicitly confirmed in the review step.
 */
const confirmResumeData = asyncHandler(async (req, res) => {
  const { skills = [], projects = [], certifications = [], career_goal } = req.body;

  for (const skillName of skills) {
    let skillRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skillName]);
    let skillId;
    if (skillRes.rows.length) {
      skillId = skillRes.rows[0].id;
    } else {
      const inserted = await db.query('INSERT INTO skills (name, category) VALUES ($1,$2) RETURNING id', [skillName, 'technical']);
      skillId = inserted.rows[0].id;
    }
    await db.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency, source)
       VALUES ($1,$2,60,'resume_ai')
       ON CONFLICT (student_id, skill_id) DO UPDATE SET source = 'resume_ai', updated_at = now()`,
      [req.user.id, skillId]
    );
  }

  for (const p of projects) {
    const title = typeof p === 'string' ? p : p.title;
    const description = typeof p === 'string' ? '' : (p.description || '');
    await db.query(
      `INSERT INTO projects (student_id, title, description, technologies) VALUES ($1,$2,$3,$4)`,
      [req.user.id, title, description, (typeof p === 'object' && p.technologies) || []]
    );
  }

  for (const c of certifications) {
    const name = typeof c === 'string' ? c : c.name;
    await db.query(
      `INSERT INTO certifications (student_id, name, issuer, verification_status) VALUES ($1,$2,$3,'pending')`,
      [req.user.id, name, (typeof c === 'object' && c.issuer) || null]
    );
  }

  if (career_goal) {
    await db.query('UPDATE student_profiles SET career_goal = $1, updated_at = now() WHERE user_id = $2', [career_goal, req.user.id]);
  }

  ok(res, { confirmed: true, skills_added: skills.length, projects_added: projects.length, certifications_added: certifications.length });
});

const skillGap = asyncHandler(async (req, res) => {
  const studentId = req.query.student_id || req.user.id;
  const careerTrack = req.query.career_track;
  const result = await callAI('/ai/skill-gap', { method: 'GET', query: { student_id: studentId, career_track: careerTrack } });
  ok(res, result);
});

const recommendations = asyncHandler(async (req, res) => {
  const studentId = req.query.student_id || req.user.id;
  const type = req.query.type || 'internship'; // internship | job | course
  const result = await callAI('/ai/recommendations', { method: 'GET', query: { student_id: studentId, type } });
  ok(res, result);
});

const matchPreview = asyncHandler(async (req, res) => {
  const { opportunity_id, opportunity_type } = req.body;
  if (!opportunity_id || !opportunity_type) throw new ApiError(400, 'opportunity_id and opportunity_type are required.');
  const result = await callAI('/ai/match', { body: { student_id: req.user.id, opportunity_id, opportunity_type } });
  ok(res, result);
});

const careerGuidance = asyncHandler(async (req, res) => {
  const studentId = req.body.student_id || req.user.id;
  const result = await callAI('/ai/career-guidance', { body: { student_id: studentId } });
  ok(res, result);
});

const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw new ApiError(400, 'message is required.');

  await db.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1,'user',$2)`, [req.user.id, message]);

  const history = await db.query(
    `SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [req.user.id]
  );

  const result = await callAI('/ai/chat', {
    body: { student_id: req.user.id, message, history: history.rows.reverse() },
  });

  await db.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1,'assistant',$2)`, [req.user.id, result.reply]);

  ok(res, result);
});

const chatHistory = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
    [req.user.id]
  );
  ok(res, rows);
});

const industrySkillAnalysis = asyncHandler(async (req, res) => {
  const result = await callAI('/ai/industry-skill-analysis', { method: 'GET' });
  ok(res, result);
});

const semanticSearch = asyncHandler(async (req, res) => {
  const { q, type = 'internship' } = req.query;
  if (!q) throw new ApiError(400, 'q (query) is required.');
  const result = await callAI('/ai/search', { method: 'GET', query: { q, type } });
  ok(res, result);
});

module.exports = {
  analyzeResume, confirmResumeData, skillGap, recommendations, matchPreview, careerGuidance,
  chat, chatHistory, industrySkillAnalysis, semanticSearch,
};
