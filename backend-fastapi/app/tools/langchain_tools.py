"""
LangChain tool wrappers around app.tools.data_tools, scoped to one student per
chat session so the LLM never has to (and can never) query another student's
data — it can only call `get_my_*` / `search_*` for the student who is chatting.
"""
from langchain_core.tools import tool
from app.tools import data_tools


def build_student_tools(student_id: str) -> list:
    @tool
    async def get_my_profile() -> dict:
        """Get the current student's profile: degree, branch, college, graduation year, cgpa, career goal, interests."""
        return await data_tools.get_student_profile(student_id)

    @tool
    async def get_my_skills() -> list:
        """Get the current student's skills and proficiency scores (0-100)."""
        return await data_tools.get_student_skills(student_id)

    @tool
    async def get_my_skill_gaps(career_track: str = "") -> dict:
        """Get the current student's skill gap analysis against a career track (e.g. 'AI Engineer').
        If career_track is empty, uses the student's own stated career goal."""
        return await data_tools.get_skill_gaps(student_id, career_track or None)

    @tool
    async def search_internships(query: str = "", location: str = "") -> list:
        """Search open internships by keyword and/or location."""
        return await data_tools.search_internships(query or None, location or None)

    @tool
    async def search_jobs(query: str = "", location: str = "") -> list:
        """Search open full-time jobs by keyword and/or location."""
        return await data_tools.search_jobs(query or None, location or None)

    @tool
    async def search_courses(skill: str = "") -> list:
        """Search recommended learning programs/courses, optionally filtered by a skill name."""
        return await data_tools.search_courses(skill or None)

    @tool
    async def get_my_application_status() -> list:
        """Get the current student's job/internship application history and statuses."""
        return await data_tools.get_application_status(student_id)

    @tool
    async def get_industry_demand() -> list:
        """Get the most in-demand skills across all current job/internship postings platform-wide."""
        return await data_tools.get_industry_demand()

    return [
        get_my_profile, get_my_skills, get_my_skill_gaps,
        search_internships, search_jobs, search_courses,
        get_my_application_status, get_industry_demand,
    ]
