from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import fetchrow
from app.services import matching
from app.services.vector_provider import get_vector_provider
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/ai", tags=["match"])

TABLE = {"job": "jobs", "internship": "internships"}


class MatchRequest(BaseModel):
    student_id: str
    opportunity_id: str
    opportunity_type: str


@router.post("/match")
async def match_single_opportunity(payload: MatchRequest):
    if payload.opportunity_type not in TABLE:
        raise HTTPException(status_code=400, detail="opportunity_type must be job or internship.")

    profile_row = await fetchrow(
        "SELECT sp.*, u.name FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.user_id = $1",
        payload.student_id,
    )
    if not profile_row:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    profile = dict(profile_row)

    table = TABLE[payload.opportunity_type]
    opp_row = await fetchrow(
        f"""SELECT o.*, c.name AS company_name FROM {table} o JOIN companies c ON c.id = o.company_id WHERE o.id = $1""",
        payload.opportunity_id,
    )
    if not opp_row:
        raise HTTPException(status_code=404, detail="Opportunity not found.")
    opportunity = dict(opp_row)

    student_skills = await matching.get_student_skill_map(payload.student_id)
    required = await matching.get_required_skills(payload.opportunity_id, payload.opportunity_type)
    sm = matching.skill_match(student_skills, required)

    projects, certs = await matching.get_experience_counts(payload.student_id)
    opp_text = f"{opportunity['title']} {opportunity.get('description', '')}"

    vector_provider = get_vector_provider()
    query_text = f"{profile.get('career_goal', '')} {' '.join(profile.get('interests') or [])}"
    ranked = await vector_provider.semantic_rank(query_text or "general", [{"id": opportunity["id"], "text": opp_text}])
    semantic = round((ranked[0]["semantic_score"] if ranked else 0) * 100)

    breakdown = {
        "skill": sm["score"],
        "semantic": semantic,
        "interest": matching.interest_score(profile, opp_text),
        "experience": matching.experience_score(projects, certs),
        "eligibility": 100 if matching.is_eligible(profile, opportunity) else 0,
        "matched_skills": sm["matched"],
        "missing_skills": sm["missing"],
    }
    final_score = matching.weighted_final_score(breakdown)
    breakdown["score"] = final_score

    ai = get_ai_provider()
    explanation = await ai.explain_match(profile, opportunity, breakdown)

    return {
        "score": final_score,
        "breakdown": breakdown,
        "matched_skills": sm["matched"],
        "missing_skills": sm["missing"],
        "eligible": matching.is_eligible(profile, opportunity),
        "explanation": explanation,
    }
