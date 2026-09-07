import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as oppApi from '../../api/opportunities';
import * as aiApi from '../../api/ai';
import * as applicationsApi from '../../api/applications';
import DataState from '../../components/DataState';
import { MatchScoreBadge } from '../../components/Badge';
import { formatDate } from '../../utils/format';
import { Spinner } from '../../components/States';

export default function StudentOpportunityDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [match, setMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const { data, loading, error, reload } = useAsync(() => (type === 'internship' ? oppApi.getInternship(id) : oppApi.getJob(id)), [type, id]);

  useEffect(() => {
    let cancelled = false;
    setMatchLoading(true);
    aiApi
      .matchPreview(id, type)
      .then((result) => !cancelled && setMatch(result))
      .catch(() => !cancelled && setMatch(null))
      .finally(() => !cancelled && setMatchLoading(false));
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationsApi.apply({ opportunity_id: id, opportunity_type: type });
      setApplied(true);
      push('Application submitted!', 'success');
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {(o) => (
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700">
            ← Back
          </button>

          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">{o.company_name}</p>
                <h1 className="text-xl font-bold text-slate-900 mt-1">{o.title}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {o.location} · Deadline {formatDate(o.deadline)}
                  {type === 'internship' && o.stipend ? ` · ${o.stipend}` : ''}
                  {type === 'job' && o.salary_range ? ` · ${o.salary_range}` : ''}
                </p>
              </div>
              {match && <MatchScoreBadge score={match.score} />}
            </div>

            <p className="text-sm text-slate-700 mt-4 whitespace-pre-line">{o.description}</p>

            {o.eligibility && (
              <div className="mt-4 text-sm">
                <span className="font-medium text-slate-700">Eligibility: </span>
                <span className="text-slate-500">{o.eligibility}</span>
              </div>
            )}

            {o.required_skills?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Required skills</p>
                <div className="flex flex-wrap gap-2">
                  {o.required_skills.map((s) => (
                    <span key={s.id} className={`badge ${match?.matched_skills?.includes(s.name) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {match?.matched_skills?.includes(s.name) ? '✓ ' : ''}
                      {s.name} ({s.required_proficiency}%{s.importance === 'preferred' ? ', preferred' : ''})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100">
              {applied ? (
                <span className="badge bg-emerald-50 text-emerald-700 text-sm px-3 py-1.5">✓ Application submitted</span>
              ) : (
                <button className="btn-primary" onClick={handleApply} disabled={applying}>
                  {applying ? 'Submitting…' : `Apply for this ${type}`}
                </button>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Why this matches you</h2>
            {matchLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Spinner /> Calculating your match…
              </div>
            ) : match ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-700">{match.explanation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  {Object.entries({
                    Skill: match.breakdown.skill,
                    Semantic: match.breakdown.semantic,
                    Interest: match.breakdown.interest,
                    Experience: match.breakdown.experience,
                    Eligibility: match.breakdown.eligibility,
                  }).map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-slate-50 py-2">
                      <p className="text-sm font-bold text-slate-800">{val}%</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
                {match.missing_skills?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Skill gap for this role</p>
                    <div className="flex flex-wrap gap-2">
                      {match.missing_skills.map((s) => (
                        <span key={s} className="badge bg-red-50 text-red-600">
                          {s}
                        </span>
                      ))}
                    </div>
                    <Link to="/student/learning" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
                      Find courses to close this gap →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Complete your profile and skills to see a personalized match score.</p>
            )}
          </div>
        </div>
      )}
    </DataState>
  );
}
