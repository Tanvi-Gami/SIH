import { useEffect, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as aiApi from '../../api/ai';
import * as oppApi from '../../api/opportunities';
import Tabs from '../../components/Tabs';
import OpportunityCard from '../../components/OpportunityCard';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';

export default function StudentOpportunities() {
  const [type, setType] = useState('internship');
  const [query, setQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const { data: recs, loading: recsLoading } = useAsync(() => aiApi.getRecommendations(type).catch(() => ({ recommendations: [] })), [type]);
  const { data: browse, loading: browseLoading, error: browseError, reload: reloadBrowse } = useAsync(
    () => (type === 'internship' ? oppApi.listInternships() : oppApi.listJobs()).then((r) => r.data),
    [type]
  );

  useEffect(() => setSemanticResults(null), [type]);

  const runSemanticSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSemanticResults(null);
      return;
    }
    setSearching(true);
    try {
      const result = await aiApi.semanticSearch(query, type);
      setSemanticResults(result.results);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Opportunities</h1>
        <form onSubmit={runSemanticSearch} className="flex gap-2 w-full sm:w-96">
          <input
            className="input"
            placeholder="Try: 'AI internship with backend work'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-secondary shrink-0" disabled={searching}>
            {searching ? '…' : '🔍'}
          </button>
        </form>
      </div>

      <Tabs
        tabs={[
          { value: 'internship', label: 'Internships' },
          { value: 'job', label: 'Jobs' },
        ]}
        active={type}
        onChange={setType}
      />

      {semanticResults && (
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Semantic search results</h2>
          {semanticResults.length === 0 ? (
            <p className="text-sm text-slate-500">No semantically relevant results found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {semanticResults.map((r) => (
                <div key={r.id} className="card p-4">
                  <p className="text-xs text-slate-400 font-medium uppercase">{r.company_name}</p>
                  <h3 className="font-semibold text-slate-900">{r.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{r.location}</p>
                  <span className="badge bg-brand-50 text-brand-700 mt-2">{r.relevance}% relevant</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!semanticResults && (
        <>
          <section>
            <h2 className="font-semibold text-slate-900 mb-3">Recommended for you</h2>
            {recsLoading ? (
              <p className="text-sm text-slate-400">Loading recommendations…</p>
            ) : recs?.recommendations?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recs.recommendations.map((r) => (
                  <OpportunityCard
                    key={r.opportunity_id}
                    type={type}
                    opportunity={{ id: r.opportunity_id, title: r.title, company_name: r.company_name, location: r.location, deadline: r.deadline }}
                    matchScore={r.match_score}
                    matchedSkills={r.matched_skills}
                    missingSkills={r.missing_skills}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Add skills or a career goal for personalized matches.</p>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-3">Browse all open {type === 'internship' ? 'internships' : 'jobs'}</h2>
            <DataState
              loading={browseLoading}
              error={browseError}
              data={browse}
              onRetry={reloadBrowse}
              empty={<EmptyState title="No open opportunities right now." />}
            >
              {(list) => (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((o) => (
                    <OpportunityCard key={o.id} type={type} opportunity={o} />
                  ))}
                </div>
              )}
            </DataState>
          </section>
        </>
      )}
    </div>
  );
}
