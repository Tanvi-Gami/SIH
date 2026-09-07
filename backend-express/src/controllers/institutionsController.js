const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getMyInstitution = asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM institutions WHERE user_id = $1', [req.user.id]);
  if (!rows.length) throw new ApiError(404, 'Institution profile not found.');
  ok(res, rows[0]);
});

const updateMyInstitution = asyncHandler(async (req, res) => {
  const allowed = ['name', 'type', 'address', 'website', 'description'];
  const fields = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); values.push(req.body[key]); }
  }
  if (!fields.length) throw new ApiError(400, 'No valid fields provided.');
  values.push(req.user.id);
  const { rows } = await db.query(
    `UPDATE institutions SET ${fields.join(', ')} WHERE user_id = $${i} RETURNING *`,
    values
  );
  if (!rows.length) throw new ApiError(404, 'Institution profile not found.');
  ok(res, rows[0]);
});

async function institutionIdFor(userId) {
  const { rows } = await db.query('SELECT id FROM institutions WHERE user_id = $1', [userId]);
  if (!rows.length) throw new ApiError(404, 'Institution profile not found.');
  return rows[0].id;
}

const listStudents = asyncHandler(async (req, res) => {
  const institutionId = await institutionIdFor(req.user.id);
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, sp.degree, sp.branch, sp.graduation_year, sp.cgpa, sp.career_goal, sp.readiness_score
     FROM users u JOIN student_profiles sp ON sp.user_id = u.id
     WHERE sp.institution_id = $1 ORDER BY u.name`,
    [institutionId]
  );
  ok(res, rows);
});

/** Core institution analytics dashboard: counts, skill distribution, placement stats. */
const overview = asyncHandler(async (req, res) => {
  const institutionId = await institutionIdFor(req.user.id);

  const [totals, assessmentCompletion, applicationStats, skillDistribution] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_students,
              COUNT(*) FILTER (WHERE readiness_score > 0)::int AS assessed_students,
              ROUND(AVG(readiness_score))::int AS avg_readiness
       FROM student_profiles WHERE institution_id = $1`,
      [institutionId]
    ),
    db.query(
      `SELECT COUNT(DISTINCT ar.student_id)::int AS completed
       FROM assessment_results ar JOIN student_profiles sp ON sp.user_id = ar.student_id
       WHERE sp.institution_id = $1`,
      [institutionId]
    ),
    db.query(
      `SELECT a.status, a.opportunity_type, COUNT(*)::int AS count
       FROM applications a JOIN student_profiles sp ON sp.user_id = a.student_id
       WHERE sp.institution_id = $1 GROUP BY a.status, a.opportunity_type`,
      [institutionId]
    ),
    db.query(
      `SELECT s.name, ROUND(AVG(ss.proficiency))::int AS avg_proficiency, COUNT(*)::int AS student_count
       FROM student_skills ss
       JOIN student_profiles sp ON sp.user_id = ss.student_id
       JOIN skills s ON s.id = ss.skill_id
       WHERE sp.institution_id = $1
       GROUP BY s.name ORDER BY avg_proficiency DESC LIMIT 12`,
      [institutionId]
    ),
  ]);

  const applications = { total: 0, internship: 0, job: 0, placed: 0 };
  for (const r of applicationStats.rows) {
    applications.total += r.count;
    applications[r.opportunity_type] = (applications[r.opportunity_type] || 0) + r.count;
    if (r.status === 'selected') applications.placed += r.count;
  }

  const totalStudents = totals.rows[0].total_students || 0;
  const placementReadiness = totalStudents ? Math.round((applications.placed / totalStudents) * 100) : 0;

  ok(res, {
    total_students: totalStudents,
    assessment_completed: assessmentCompletion.rows[0].completed,
    avg_readiness: totals.rows[0].avg_readiness || 0,
    internships_applied: applications.internship,
    jobs_applied: applications.job,
    placed_students: applications.placed,
    placement_readiness_pct: placementReadiness,
    skill_distribution: skillDistribution.rows,
  });
});

/** Industry skill demand: aggregate required skills across all open jobs/internships platform-wide. */
const industryDemand = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.name, s.category, COUNT(*)::int AS demand_count,
            ROUND(AVG(os.required_proficiency))::int AS avg_required_proficiency
     FROM opportunity_skills os JOIN skills s ON s.id = os.skill_id
     GROUP BY s.name, s.category ORDER BY demand_count DESC LIMIT 20`
  );
  ok(res, rows);
});

/** Skill gap: skills in high industry demand but low average student proficiency at this institution. */
const skillGaps = asyncHandler(async (req, res) => {
  const institutionId = await institutionIdFor(req.user.id);
  const { rows } = await db.query(
    `SELECT s.name,
            COALESCE(demand.demand_count, 0) AS demand_count,
            COALESCE(student_avg.avg_proficiency, 0) AS student_avg_proficiency
     FROM skills s
     LEFT JOIN (
       SELECT skill_id, COUNT(*)::int AS demand_count FROM opportunity_skills GROUP BY skill_id
     ) demand ON demand.skill_id = s.id
     LEFT JOIN (
       SELECT ss.skill_id, ROUND(AVG(ss.proficiency))::int AS avg_proficiency
       FROM student_skills ss JOIN student_profiles sp ON sp.user_id = ss.student_id
       WHERE sp.institution_id = $1 GROUP BY ss.skill_id
     ) student_avg ON student_avg.skill_id = s.id
     WHERE COALESCE(demand.demand_count, 0) > 0
     ORDER BY demand_count DESC, student_avg_proficiency ASC
     LIMIT 15`,
    [institutionId]
  );
  ok(res, rows);
});

module.exports = {
  getMyInstitution, updateMyInstitution, listStudents, overview, industryDemand, skillGaps,
};
