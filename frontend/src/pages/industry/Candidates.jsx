import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as companiesApi from '../../api/companies';
import * as oppApi from '../../api/opportunities';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';
import { MatchScoreBadge } from '../../components/Badge';

export default function IndustryCandidates() {
  const [filters, setFilters] = useState({ branch: '', career_goal: '', opportunity_key: '' });
  const { data: myOpps } = useAsync(() => oppApi.myOpportunities(), []);

  const opportunityOptions = myOpps
    ? [
        ...myOpps.internships.map((i) => ({ key: `internship:${i.id}`, label: `${i.title} (Internship)` })),
        ...myOpps.jobs.map((j) => ({ key: `job:${j.id}`, label: `${j.title} (Job)` })),
      ]
    : [];

  const [opportunity_type, opportunity_id] = filters.opportunity_key ? filters.opportunity_key.split(':') : [undefined, undefined];

  const { data, loading, error, reload } = useAsync(
    () =>
      companiesApi.searchCandidates({
        branch: filters.branch || undefined,
        career_goal: filters.career_goal || undefined,
        opportunity_id,
        opportunity_type,
      }),
    [filters.branch, filters.career_goal, filters.opportunity_key]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Candidate Search</h1>

      <div className="card p-4 grid sm:grid-cols-3 gap-3">
        <input
          className="input"
          placeholder="Filter by branch…"
          value={filters.branch}
          onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Filter by career goal…"
          value={filters.career_goal}
          onChange={(e) => setFilters((f) => ({ ...f, career_goal: e.target.value }))}
        />
        <select className="input" value={filters.opportunity_key} onChange={(e) => setFilters((f) => ({ ...f, opportunity_key: e.target.value }))}>
          <option value="">Score against opportunity…</option>
          {opportunityOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <DataState loading={loading} error={error} data={data} onRetry={reload} empty={<EmptyState icon="🔍" title="No candidates match these filters." />}>
        {(candidates) => (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.degree}, {c.branch}
                    </p>
                  </div>
                  {filters.opportunity_key && <MatchScoreBadge score={c.match_score} />}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {c.college} · Class of {c.graduation_year}
                </p>
                {c.career_goal && <span className="badge bg-brand-50 text-brand-700 mt-2">{c.career_goal}</span>}
                {filters.opportunity_key && (
                  <p className="text-xs text-slate-500 mt-2">
                    ✓ {c.skills_matched} matched · {c.skills_missing} missing
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DataState>
    </div>
  );
}
