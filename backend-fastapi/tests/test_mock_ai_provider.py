"""
Unit tests for the offline MockAIProvider — these never touch the database
or the network, so they run in CI with no extra services required.
"""
import asyncio

from app.services.ai_provider import MockAIProvider


def run(coro):
    return asyncio.run(coro)


def test_extract_resume_finds_known_skills():
    provider = MockAIProvider()
    text = "Experienced with Python, React, FastAPI and SQL. Also familiar with Docker."
    result = run(provider.extract_resume(text))
    assert "Python" in result["skills"]
    assert "React" in result["skills"]
    assert "FastAPI" in result["skills"]
    assert isinstance(result["career_roles"], list)
    assert len(result["career_roles"]) >= 1


def test_extract_resume_ignores_section_headers_as_certifications():
    provider = MockAIProvider()
    text = "CERTIFICATIONS\nCertification: AWS Cloud Practitioner, Amazon Web Services, 2025"
    result = run(provider.extract_resume(text))
    assert "CERTIFICATIONS" not in result["certifications"]
    assert any("AWS Cloud Practitioner" in c for c in result["certifications"])


def test_explain_match_mentions_gap_and_strength():
    provider = MockAIProvider()
    student_ctx = {"career_goal": "AI Engineer"}
    opportunity_ctx = {"title": "AI Engineer Intern", "company_name": "TechNova Solutions"}
    breakdown = {"score": 72, "matched_skills": ["Python", "Machine Learning"], "missing_skills": ["AWS"]}
    explanation = run(provider.explain_match(student_ctx, opportunity_ctx, breakdown))
    assert "Python" in explanation
    assert "AWS" in explanation


def test_generate_roadmap_handles_no_gaps():
    provider = MockAIProvider()
    roadmap = run(provider.generate_roadmap({"career_goal": "Data Analyst"}, {"gaps": [], "strong": [{"skill": "SQL"}]}))
    assert "Data Analyst" in roadmap
