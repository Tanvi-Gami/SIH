"""
Pure scoring functions for the hybrid recommendation engine (STEP 1-4 of the
spec's pipeline). STEP 5 (AI explanation) lives in ai_provider.explain_match.

    Final Match Score =
        40% Skill Match + 25% Semantic Similarity + 15% Career Interest
        + 10% Experience + 10% Eligibility

Weights are configurable in app.config.MATCH_WEIGHTS.
"""
from app.config import MATCH_WEIGHTS
from app.db import fetch


def is_eligible(student: dict, opportunity: dict) -> bool:
    min_cgpa = opportunity.get("min_cgpa")
    if min_cgpa and student.get("cgpa") is not None and float(student["cgpa"]) < float(min_cgpa):
        return False
    return True


def skill_match(student_skills: dict[str, int], required_skills: list[dict]) -> dict:
    """required_skills: [{"name", "required_proficiency", "importance"}]"""
    if not required_skills:
        return {"score": 100, "matched": [], "missing": []}
    matched, missing = [], []
    weighted_total, weighted_have = 0.0, 0.0
    for req in required_skills:
        weight = 2.0 if req.get("importance") == "required" else 1.0
        weighted_total += weight
        have = student_skills.get(req["name"], 0)
        needed = req["required_proficiency"] or 1
        weighted_have += weight * min(1.0, have / needed)
        (matched if have >= needed else missing).append(req["name"])
    score = round((weighted_have / weighted_total) * 100) if weighted_total else 100
    return {"score": score, "matched": matched, "missing": missing}


def interest_score(student: dict, opportunity_text: str) -> int:
    interests = " ".join(student.get("interests") or []).lower()
    goal = (student.get("career_goal") or "").lower()
    text = opportunity_text.lower()
    hits = sum(1 for token in set(interests.split() + goal.split()) if token and len(token) > 3 and token in text)
    return min(100, hits * 25) if hits else 0


def experience_score(project_count: int, certification_count: int) -> int:
    return min(100, project_count * 20 + certification_count * 15)


async def get_student_skill_map(student_id: str) -> dict[str, int]:
    rows = await fetch(
        """SELECT s.name, ss.proficiency FROM student_skills ss
           JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = $1""",
        student_id,
    )
    return {r["name"]: r["proficiency"] for r in rows}


async def get_required_skills(opportunity_id: str, opportunity_type: str) -> list[dict]:
    rows = await fetch(
        """SELECT s.name, os.required_proficiency, os.importance FROM opportunity_skills os
           JOIN skills s ON s.id = os.skill_id
           WHERE os.opportunity_id = $1 AND os.opportunity_type = $2""",
        opportunity_id, opportunity_type,
    )
    return [dict(r) for r in rows]


async def get_experience_counts(student_id: str) -> tuple[int, int]:
    projects = await fetch("SELECT COUNT(*)::int AS c FROM projects WHERE student_id = $1", student_id)
    certs = await fetch("SELECT COUNT(*)::int AS c FROM certifications WHERE student_id = $1", student_id)
    return projects[0]["c"], certs[0]["c"]


def weighted_final_score(breakdown: dict) -> int:
    return round(
        breakdown.get("skill", 0) * MATCH_WEIGHTS["skill"]
        + breakdown.get("semantic", 0) * MATCH_WEIGHTS["semantic"]
        + breakdown.get("interest", 0) * MATCH_WEIGHTS["interest"]
        + breakdown.get("experience", 0) * MATCH_WEIGHTS["experience"]
        + breakdown.get("eligibility", 0) * MATCH_WEIGHTS["eligibility"]
    )
