"""
LangGraph workflow: Career Guidance

    START -> get_student_profile -> analyze_skills -> identify_career_goal
          -> retrieve_required_skills -> calculate_skill_gap
          -> retrieve_learning_programs -> retrieve_internships
          -> generate_career_roadmap -> END
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END

from app.tools import data_tools
from app.services.ai_provider import get_ai_provider


class GuidanceState(TypedDict, total=False):
    student_id: str
    profile: dict
    skills: list[dict]
    career_goal: str | None
    skill_gap: dict
    learning_programs: list[dict]
    internships: list[dict]
    roadmap: str


async def node_get_profile(state: GuidanceState) -> dict:
    return {"profile": await data_tools.get_student_profile(state["student_id"])}


async def node_analyze_skills(state: GuidanceState) -> dict:
    return {"skills": await data_tools.get_student_skills(state["student_id"])}


async def node_identify_career_goal(state: GuidanceState) -> dict:
    return {"career_goal": state["profile"].get("career_goal")}


async def node_calculate_skill_gap(state: GuidanceState) -> dict:
    return {"skill_gap": await data_tools.get_skill_gaps(state["student_id"], state.get("career_goal"))}


async def node_retrieve_learning_programs(state: GuidanceState) -> dict:
    gap_skills = [g["skill"] for g in state["skill_gap"].get("gaps", [])][:4]
    programs, seen = [], set()
    for skill in gap_skills:
        for p in await data_tools.search_courses(skill, limit=3):
            if p["id"] not in seen:
                seen.add(p["id"])
                programs.append(p)
    return {"learning_programs": programs[:6]}


async def node_retrieve_internships(state: GuidanceState) -> dict:
    goal = state.get("career_goal") or ""
    keyword = goal.split()[0] if goal else None
    return {"internships": await data_tools.search_internships(query=keyword, limit=5)}


async def node_generate_roadmap(state: GuidanceState) -> dict:
    ai = get_ai_provider()
    roadmap = await ai.generate_roadmap(state["profile"], state["skill_gap"])
    return {"roadmap": roadmap}


def build_graph():
    graph = StateGraph(GuidanceState)
    graph.add_node("get_profile", node_get_profile)
    graph.add_node("analyze_skills", node_analyze_skills)
    graph.add_node("identify_career_goal", node_identify_career_goal)
    graph.add_node("calculate_skill_gap", node_calculate_skill_gap)
    graph.add_node("retrieve_learning_programs", node_retrieve_learning_programs)
    graph.add_node("retrieve_internships", node_retrieve_internships)
    graph.add_node("generate_roadmap", node_generate_roadmap)

    graph.set_entry_point("get_profile")
    graph.add_edge("get_profile", "analyze_skills")
    graph.add_edge("analyze_skills", "identify_career_goal")
    graph.add_edge("identify_career_goal", "calculate_skill_gap")
    graph.add_edge("calculate_skill_gap", "retrieve_learning_programs")
    graph.add_edge("retrieve_learning_programs", "retrieve_internships")
    graph.add_edge("retrieve_internships", "generate_roadmap")
    graph.add_edge("generate_roadmap", END)
    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


async def run_career_guidance(student_id: str) -> dict:
    graph = get_graph()
    result = await graph.ainvoke({"student_id": student_id})
    return {
        "profile": result["profile"],
        "skills": result["skills"],
        "career_goal": result["career_goal"],
        "skill_gap": result["skill_gap"],
        "learning_programs": result["learning_programs"],
        "internships": result["internships"],
        "roadmap": result["roadmap"],
    }
