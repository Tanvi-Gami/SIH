import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import * as studentsApi from '../../api/students';
import * as aiApi from '../../api/ai';
import DataState from '../../components/DataState';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import OpportunityCard from '../../components/OpportunityCard';
import { proficiencyColor } from '../../utils/format';

export default function StudentDashboard() {
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        studentsApi.getProfile(),
        studentsApi.listSkills(),
        aiApi.getSkillGap().catch(() => ({ gaps: [] })),
        aiApi.getRecommendations('internship').catch(() => ({ recommendations: [] })),
        aiApi.getRecommendations('course').catch(() => ({ recommendations: [] })),
        studentsApi.applicationsSummary(),
      ]),
    []
  );

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {([profile, skills, skillGap, internshipRecs, courseRecs, appSummary]) => (
        <div className="space-y-6">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">Welcome back, {profile.name?.split(' ')[0]}</h1>
                <p className="text-brand-100 text-sm mt-1">
                  Career goal: <span className="font-medium text-white">{profile.career_goal || 'Not set yet'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold">{profile.readiness_score || 0}%</p>
                <p className="text-brand-100 text-xs">Career readiness</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Applied" value={appSummary.applied} icon="📤" />
            <StatCard label="Shortlisted" value={appSummary.shortlisted} icon="⭐" accent="amber" />
            <StatCard label="Interviews" value={appSummary.interview} icon="🗣️" accent="brand" />
            <StatCard label="Selected" value={appSummary.selected} icon="🎉" accent="emerald" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Skill overview</h2>
                <Link to="/student/skill-gap" className="text-sm text-brand-600 hover:underline">
                  See skill gap →
                </Link>
              </div>
              {skills.length === 0 ? (
                <p className="text-sm text-slate-500">No skills tracked yet. Take an assessment to get started.</p>
              ) : (
                <div className="space-y-3">
                  {skills.slice(0, 6).map((s) => (
                    <ProgressBar key={s.id} label={s.name} sublabel={`${s.proficiency}%`} value={s.proficiency} color={proficiencyColor(s.proficiency)} />
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Your skill gaps</h2>
              </div>
              {!skillGap.gaps || skillGap.gaps.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {profile.career_goal
                    ? "You're covering the core skills for your target career well. 🎉"
                    : 'Set a career goal on your profile to see skill gap analysis.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillGap.gaps.map((g) => (
                    <span key={g.skill} className="badge bg-red-50 text-red-700">
                      {g.skill}
                    </span>
                  ))}
                </div>
              )}
              <Link to="/student/learning" className="btn-secondary text-sm">
                Improve skills →
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recommended internships</h2>
              <Link to="/student/opportunities" className="text-sm text-brand-600 hover:underline">
                View all →
              </Link>
            </div>
            {internshipRecs.recommendations?.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {internshipRecs.recommendations.slice(0, 3).map((r) => (
                  <OpportunityCard
                    key={r.opportunity_id}
                    type="internship"
                    opportunity={{ id: r.opportunity_id, title: r.title, company_name: r.company_name, location: r.location, deadline: r.deadline }}
                    matchScore={r.match_score}
                    matchedSkills={r.matched_skills}
                    missingSkills={r.missing_skills}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recommendations yet — add skills or a career goal to unlock these.</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recommended learning</h2>
              <Link to="/student/learning" className="text-sm text-brand-600 hover:underline">
                View all →
              </Link>
            </div>
            {courseRecs.recommendations?.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {courseRecs.recommendations.slice(0, 3).map((c) => (
                  <div key={c.id} className="card p-4">
                    <p className="text-xs text-slate-400 uppercase font-medium">{c.provider}</p>
                    <h3 className="font-semibold text-slate-900 mt-0.5">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {c.duration} · {c.difficulty}
                    </p>
                    {c.matched_gap_skill && <span className="badge bg-brand-50 text-brand-700 mt-2">Closes gap: {c.matched_gap_skill}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No course recommendations right now.</p>
            )}
          </div>
        </div>
      )}
    </DataState>
  );
}
