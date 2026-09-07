"""
LangGraph workflow: Resume Analysis

    START -> extract_resume_text -> ai_extract_structured_data
          -> compare_industry_skills -> generate_skill_gaps
          -> generate_recommendations -> END
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END

from app.services.text_extraction import extract_text_from_upload
from app.services.ai_provider import get_ai_provider
from app.tools import data_tools


class ResumeState(TypedDict, total=False):
    student_id: str
    filename: str
    mime_type: str
    content_base64: str
    resume_text: str
    extracted: dict
    industry_demand: list[dict]
    skill_gaps: dict
    recommended_courses: list[dict]


async def node_extract_text(state: ResumeState) -> dict:
    text = extract_text_from_upload(state["content_base64"], state["mime_type"], state["filename"])
    return {"resume_text": text}


async def node_ai_extract(state: ResumeState) -> dict:
    ai = get_ai_provider()
    extracted = await ai.extract_resume(state["resume_text"])
    return {"extracted": extracted}


async def node_compare_industry_skills(state: ResumeState) -> dict:
    return {"industry_demand": await data_tools.get_industry_demand()}


async def node_generate_skill_gaps(state: ResumeState) -> dict:
    demand_names = {d["name"] for d in state["industry_demand"]}
    extracted_names = {s for s in state["extracted"].get("skills", [])}
    missing_in_demand = sorted(demand_names - extracted_names)
    return {"skill_gaps": {"resume_skills": sorted(extracted_names), "high_demand_missing": missing_in_demand[:8]}}


async def node_generate_recommendations(state: ResumeState) -> dict:
    courses = []
    seen = set()
    for skill in state["skill_gaps"]["high_demand_missing"][:4]:
        for c in await data_tools.search_courses(skill, limit=2):
            if c["id"] not in seen:
                seen.add(c["id"])
                courses.append(c)
    return {"recommended_courses": courses[:6]}


def build_graph():
    graph = StateGraph(ResumeState)
    graph.add_node("extract_resume_text", node_extract_text)
    graph.add_node("ai_extract_structured_data", node_ai_extract)
    graph.add_node("compare_industry_skills", node_compare_industry_skills)
    graph.add_node("generate_skill_gaps", node_generate_skill_gaps)
    graph.add_node("generate_recommendations", node_generate_recommendations)

    graph.set_entry_point("extract_resume_text")
    graph.add_edge("extract_resume_text", "ai_extract_structured_data")
    graph.add_edge("ai_extract_structured_data", "compare_industry_skills")
    graph.add_edge("compare_industry_skills", "generate_skill_gaps")
    graph.add_edge("generate_skill_gaps", "generate_recommendations")
    graph.add_edge("generate_recommendations", END)
    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


async def run_resume_analysis(student_id: str, filename: str, mime_type: str, content_base64: str) -> dict:
    graph = get_graph()
    result = await graph.ainvoke({
        "student_id": student_id, "filename": filename, "mime_type": mime_type, "content_base64": content_base64,
    })
    return {
        **result["extracted"],
        "resume_text_preview": result["resume_text"][:400],
        "high_demand_missing_skills": result["skill_gaps"]["high_demand_missing"],
        "recommended_courses": result["recommended_courses"],
    }
