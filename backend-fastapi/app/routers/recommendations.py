from fastapi import APIRouter, HTTPException, Query

from app.tools import data_tools
from app.workflows.opportunity_recommendation import run_recommendations

router = APIRouter(prefix="/ai", tags=["recommendations"])


@router.get("/recommendations")
async def get_recommendations(student_id: str = Query(...), type: str = Query("internship")):
    if type not in ("internship", "job", "course"):
        raise HTTPException(status_code=400, detail="type must be internship, job, or course.")

    if type == "course":
        gap = await data_tools.get_skill_gaps(student_id)
        gap_skills = [g["skill"] for g in gap.get("gaps", [])] or [g["skill"] for g in gap.get("moderate", [])]
        courses, seen = [], set()
        for skill in gap_skills[:5]:
            for c in await data_tools.search_courses(skill, limit=3):
                if c["id"] not in seen:
                    seen.add(c["id"])
                    c["matched_gap_skill"] = skill
                    courses.append(c)
        if not courses:  # student has no tracked gaps yet — surface general popular programs
            courses = await data_tools.search_courses(limit=6)
        return {"type": "course", "career_track": gap.get("career_track"), "recommendations": courses[:8]}

    recs = await run_recommendations(student_id, type, limit=10)
    return {"type": type, "recommendations": recs}


@router.get("/skill-gap")
async def get_skill_gap(student_id: str = Query(...), career_track: str | None = Query(None)):
    return await data_tools.get_skill_gaps(student_id, career_track)
