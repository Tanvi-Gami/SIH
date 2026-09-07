"""
LangGraph workflow: Opportunity Recommendation

    START -> get_student_profile -> eligibility_filter -> skill_matching
          -> pinecone_semantic_search -> ranking -> generate_explanation -> END

Produces a ranked, explainable list of job/internship recommendations for one
student. Used by GET /ai/recommendations and (single-candidate) by /ai/match.
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END

from app.db import fetch
from app.services import matching
from app.services.vector_provider import get_vector_provider
from app.services.ai_provider import get_ai_provider

TABLE = {"job": "jobs", "internship": "internships"}


class RecommendationState(TypedDict, total=False):
    student_id: str
    opportunity_type: str
    limit: int
    profile: dict
    candidates: list[dict]
    scored: list[dict]
    explained: list[dict]


async def node_get_profile(state: RecommendationState) -> dict:
    row = await fetch(
        """SELECT sp.*, u.name FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.user_id = $1""",
        state["student_id"],
    )
    return {"profile": dict(row[0]) if row else {}}


async def node_eligibility_filter(state: RecommendationState) -> dict:
    table = TABLE[state["opportunity_type"]]
    rows = await fetch(
        f"""SELECT o.*, c.name AS company_name FROM {table} o JOIN companies c ON c.id = o.company_id
            WHERE o.status = 'open' ORDER BY o.created_at DESC LIMIT 50"""
    )
    profile = state["profile"]
    candidates = [dict(r) for r in rows if matching.is_eligible(profile, dict(r))]
    return {"candidates": candidates}


async def node_skill_matching(state: RecommendationState) -> dict:
    student_skills = await matching.get_student_skill_map(state["student_id"])
    projects, certs = await matching.get_experience_counts(state["student_id"])
    exp_score = matching.experience_score(projects, certs)

    scored = []
    for opp in state["candidates"]:
        required = await matching.get_required_skills(opp["id"], state["opportunity_type"])
        sm = matching.skill_match(student_skills, required)
        opp_text = f"{opp['title']} {opp.get('description', '')}"
        breakdown = {
            "skill": sm["score"],
            "interest": matching.interest_score(state["profile"], opp_text),
            "experience": exp_score,
            "eligibility": 100,  # already filtered
            "matched_skills": sm["matched"],
            "missing_skills": sm["missing"],
        }
        scored.append({**opp, "breakdown": breakdown, "text": opp_text})
    return {"scored": scored}


async def node_semantic_search(state: RecommendationState) -> dict:
    profile = state["profile"]
    query_text = f"{profile.get('career_goal', '')} {' '.join(profile.get('interests') or [])} {profile.get('bio', '')}"
    vector_provider = get_vector_provider()
    ranked = await vector_provider.semantic_rank(query_text or "general", [
        {"id": s["id"], "text": s["text"]} for s in state["scored"]
    ])
    semantic_by_id = {r["id"]: r["semantic_score"] for r in ranked}
    for s in state["scored"]:
        s["breakdown"]["semantic"] = round(semantic_by_id.get(s["id"], 0.0) * 100)
    return {"scored": state["scored"]}


async def node_ranking(state: RecommendationState) -> dict:
    for s in state["scored"]:
        s["final_score"] = matching.weighted_final_score(s["breakdown"])
    ranked = sorted(state["scored"], key=lambda s: s["final_score"], reverse=True)
    limit = state.get("limit", 10)
    return {"scored": ranked[:limit]}


async def node_generate_explanation(state: RecommendationState) -> dict:
    ai = get_ai_provider()
    explained = []
    for opp in state["scored"]:
        breakdown = {**opp["breakdown"], "score": opp["final_score"]}
        explanation = await ai.explain_match(state["profile"], opp, breakdown)
        explained.append({
            "opportunity_id": opp["id"],
            "opportunity_type": state["opportunity_type"],
            "title": opp["title"],
            "company_name": opp.get("company_name"),
            "location": opp.get("location"),
            "deadline": str(opp.get("deadline")) if opp.get("deadline") else None,
            "match_score": opp["final_score"],
            "breakdown": opp["breakdown"],
            "matched_skills": opp["breakdown"]["matched_skills"],
            "missing_skills": opp["breakdown"]["missing_skills"],
            "explanation": explanation,
        })
    return {"explained": explained}


def build_graph():
    graph = StateGraph(RecommendationState)
    graph.add_node("get_profile", node_get_profile)
    graph.add_node("eligibility_filter", node_eligibility_filter)
    graph.add_node("skill_matching", node_skill_matching)
    graph.add_node("semantic_search", node_semantic_search)
    graph.add_node("ranking", node_ranking)
    graph.add_node("generate_explanation", node_generate_explanation)

    graph.set_entry_point("get_profile")
    graph.add_edge("get_profile", "eligibility_filter")
    graph.add_edge("eligibility_filter", "skill_matching")
    graph.add_edge("skill_matching", "semantic_search")
    graph.add_edge("semantic_search", "ranking")
    graph.add_edge("ranking", "generate_explanation")
    graph.add_edge("generate_explanation", END)
    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


async def run_recommendations(student_id: str, opportunity_type: str, limit: int = 10) -> list[dict]:
    graph = get_graph()
    result = await graph.ainvoke({"student_id": student_id, "opportunity_type": opportunity_type, "limit": limit})
    return result["explained"]
