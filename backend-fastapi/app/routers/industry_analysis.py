from fastapi import APIRouter

from app.db import fetch

router = APIRouter(prefix="/ai", tags=["industry-analysis"])


@router.get("/industry-skill-analysis")
async def industry_skill_analysis():
    """Aggregated skill demand across all job/internship postings, for institution curriculum planning."""
    demand = await fetch(
        """SELECT s.name, s.category, COUNT(*)::int AS demand_count,
                  ROUND(AVG(os.required_proficiency))::int AS avg_required_proficiency
           FROM opportunity_skills os JOIN skills s ON s.id = os.skill_id
           GROUP BY s.name, s.category ORDER BY demand_count DESC LIMIT 20"""
    )
    emerging = await fetch(
        """SELECT s.name, COUNT(*)::int AS demand_count
           FROM opportunity_skills os JOIN skills s ON s.id = os.skill_id
           JOIN (SELECT id, created_at, 'job' AS t FROM jobs UNION ALL SELECT id, created_at, 'internship' FROM internships) o
             ON o.id = os.opportunity_id
           WHERE o.created_at > now() - interval '120 days'
           GROUP BY s.name ORDER BY demand_count DESC LIMIT 10"""
    )
    return {
        "top_demand_skills": [dict(r) for r in demand],
        "emerging_skills": [dict(r) for r in emerging],
    }
