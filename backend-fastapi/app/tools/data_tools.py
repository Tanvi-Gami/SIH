"""
Core data-access functions used by both the LangGraph workflows and the
LangChain-tool-calling chat agent. These are the single source of truth for
"what does the platform actually know" — nothing here is invented; every
function is a real query against PostgreSQL.
"""
from app.db import fetch, fetchrow


async def get_student_profile(student_id: str) -> dict:
    row = await fetchrow(
        """SELECT u.id, u.name, u.email, sp.degree, sp.branch, sp.college, sp.graduation_year,
                  sp.cgpa, sp.bio, sp.interests, sp.career_goal, sp.location, sp.readiness_score
           FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = $1""",
        student_id,
    )
    return dict(row) if row else {}


async def get_student_skills(student_id: str) -> list[dict]:
    rows = await fetch(
        """SELECT s.name, s.category, ss.proficiency FROM student_skills ss
           JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = $1 ORDER BY ss.proficiency DESC""",
        student_id,
    )
    return [dict(r) for r in rows]


async def get_career_track_requirements(track_name: str) -> list[dict]:
    rows = await fetch(
        """SELECT s.name, cts.required_proficiency, cts.weight FROM career_track_skills cts
           JOIN skills s ON s.id = cts.skill_id
           JOIN career_tracks ct ON ct.id = cts.track_id
           WHERE ct.name ILIKE $1 ORDER BY cts.required_proficiency DESC""",
        track_name,
    )
    return [dict(r) for r in rows]


async def get_skill_gaps(student_id: str, career_track: str | None = None) -> dict:
    profile = await get_student_profile(student_id)
    track = career_track or profile.get("career_goal")
    if not track:
        return {"career_track": None, "strong": [], "moderate": [], "gaps": []}

    student_skills = {s["name"]: s["proficiency"] for s in await get_student_skills(student_id)}
    requirements = await get_career_track_requirements(track)

    strong, moderate, gaps = [], [], []
    for req in requirements:
        have = student_skills.get(req["name"], 0)
        need = req["required_proficiency"]
        entry = {"skill": req["name"], "have": have, "required": need}
        if have >= need:
            strong.append(entry)
        elif have >= need * 0.5:
            moderate.append(entry)
        else:
            gaps.append(entry)

    return {"career_track": track, "strong": strong, "moderate": moderate, "gaps": gaps}


async def search_internships(query: str | None = None, location: str | None = None, limit: int = 10) -> list[dict]:
    conditions = ["i.status = 'open'"]
    params = []
    if query:
        params.append(f"%{query}%")
        conditions.append(f"(i.title ILIKE ${len(params)} OR i.description ILIKE ${len(params)})")
    if location:
        params.append(f"%{location}%")
        conditions.append(f"i.location ILIKE ${len(params)}")
    params.append(limit)
    rows = await fetch(
        f"""SELECT i.id, i.title, i.location, i.stipend, i.deadline, c.name AS company_name
            FROM internships i JOIN companies c ON c.id = i.company_id
            WHERE {' AND '.join(conditions)} ORDER BY i.created_at DESC LIMIT ${len(params)}""",
        *params,
    )
    return [dict(r) for r in rows]


async def search_jobs(query: str | None = None, location: str | None = None, limit: int = 10) -> list[dict]:
    conditions = ["j.status = 'open'"]
    params = []
    if query:
        params.append(f"%{query}%")
        conditions.append(f"(j.title ILIKE ${len(params)} OR j.description ILIKE ${len(params)})")
    if location:
        params.append(f"%{location}%")
        conditions.append(f"j.location ILIKE ${len(params)}")
    params.append(limit)
    rows = await fetch(
        f"""SELECT j.id, j.title, j.location, j.salary_range, j.deadline, c.name AS company_name
            FROM jobs j JOIN companies c ON c.id = j.company_id
            WHERE {' AND '.join(conditions)} ORDER BY j.created_at DESC LIMIT ${len(params)}""",
        *params,
    )
    return [dict(r) for r in rows]


async def search_courses(skill: str | None = None, limit: int = 10) -> list[dict]:
    if skill:
        rows = await fetch(
            """SELECT DISTINCT lp.id, lp.title, lp.provider, lp.difficulty, lp.duration
               FROM learning_programs lp JOIN program_skills ps ON ps.program_id = lp.id
               JOIN skills s ON s.id = ps.skill_id
               WHERE s.name ILIKE $1 LIMIT $2""",
            f"%{skill}%", limit,
        )
    else:
        rows = await fetch("SELECT id, title, provider, difficulty, duration FROM learning_programs LIMIT $1", limit)
    return [dict(r) for r in rows]


async def get_application_status(student_id: str) -> list[dict]:
    rows = await fetch(
        """SELECT a.status, a.match_score, a.applied_at,
                  CASE WHEN a.opportunity_type = 'job' THEN j.title ELSE i.title END AS title,
                  c.name AS company_name
           FROM applications a
           LEFT JOIN jobs j ON a.opportunity_type = 'job' AND a.opportunity_id = j.id
           LEFT JOIN internships i ON a.opportunity_type = 'internship' AND a.opportunity_id = i.id
           LEFT JOIN companies c ON c.id = COALESCE(j.company_id, i.company_id)
           WHERE a.student_id = $1 ORDER BY a.applied_at DESC""",
        student_id,
    )
    return [dict(r) for r in rows]


async def get_industry_demand(limit: int = 15) -> list[dict]:
    rows = await fetch(
        """SELECT s.name, COUNT(*)::int AS demand_count, ROUND(AVG(os.required_proficiency))::int AS avg_required_proficiency
           FROM opportunity_skills os JOIN skills s ON s.id = os.skill_id
           GROUP BY s.name ORDER BY demand_count DESC LIMIT $1""",
        limit,
    )
    return [dict(r) for r in rows]
