"""Unit tests for the pure hybrid-matching scoring functions (no DB required)."""
from app.services import matching


def test_skill_match_full_coverage():
    student_skills = {"Python": 90, "SQL": 80}
    required = [
        {"name": "Python", "required_proficiency": 70, "importance": "required"},
        {"name": "SQL", "required_proficiency": 60, "importance": "required"},
    ]
    result = matching.skill_match(student_skills, required)
    assert result["score"] == 100
    assert result["missing"] == []


def test_skill_match_partial_coverage_reports_missing():
    student_skills = {"Python": 90}
    required = [
        {"name": "Python", "required_proficiency": 70, "importance": "required"},
        {"name": "AWS", "required_proficiency": 50, "importance": "preferred"},
    ]
    result = matching.skill_match(student_skills, required)
    assert "AWS" in result["missing"]
    assert "Python" in result["matched"]
    assert 0 < result["score"] < 100


def test_skill_match_no_requirements_is_perfect_score():
    result = matching.skill_match({}, [])
    assert result["score"] == 100


def test_is_eligible_respects_min_cgpa():
    assert matching.is_eligible({"cgpa": 8.5}, {"min_cgpa": 7.0}) is True
    assert matching.is_eligible({"cgpa": 6.0}, {"min_cgpa": 7.0}) is False


def test_weighted_final_score_uses_configured_weights():
    breakdown = {"skill": 100, "semantic": 100, "interest": 100, "experience": 100, "eligibility": 100}
    assert matching.weighted_final_score(breakdown) == 100

    breakdown_zero = {"skill": 0, "semantic": 0, "interest": 0, "experience": 0, "eligibility": 0}
    assert matching.weighted_final_score(breakdown_zero) == 0
