import { Link } from 'react-router-dom';
import { MatchScoreBadge } from './Badge';
import { formatDate } from '../utils/format';

export default function OpportunityCard({ opportunity, type, matchScore, matchedSkills, missingSkills, actions }) {
  const o = opportunity;
  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{o.company_name}</p>
          <h3 className="font-semibold text-slate-900 truncate">{o.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {o.location} {type === 'internship' && o.stipend ? `· ${o.stipend}` : ''}
            {type === 'job' && o.salary_range ? `· ${o.salary_range}` : ''}
          </p>
        </div>
        {matchScore !== undefined && <MatchScoreBadge score={matchScore} />}
      </div>

      {(matchedSkills?.length > 0 || missingSkills?.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {matchedSkills?.slice(0, 4).map((s) => (
            <span key={s} className="badge bg-emerald-50 text-emerald-700">
              ✓ {s}
            </span>
          ))}
          {missingSkills?.slice(0, 3).map((s) => (
            <span key={s} className="badge bg-red-50 text-red-600">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">Deadline: {formatDate(o.deadline)}</span>
        <div className="flex items-center gap-2">
          {actions || (
            <Link to={`/student/opportunities/${type}/${o.id}`} className="btn-secondary text-xs px-3 py-1.5">
              View details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
