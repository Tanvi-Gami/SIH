import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as aiApi from '../../api/ai';
import * as programsApi from '../../api/programs';
import Tabs from '../../components/Tabs';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';

export default function StudentLearning() {
  const [tab, setTab] = useState('recommended');
  const { data: recs, loading: recsLoading, error: recsError, reload: reloadRecs } = useAsync(() => aiApi.getRecommendations('course'), []);
  const { data: allPrograms, loading: allLoading, error: allError, reload: reloadAll } = useAsync(() => programsApi.listPrograms(), []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Learning & Training</h1>
      <Tabs
        tabs={[
          { value: 'recommended', label: 'Recommended for you' },
          { value: 'all', label: 'All programs' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'recommended' && (
        <DataState
          loading={recsLoading}
          error={recsError}
          data={recs}
          onRetry={reloadRecs}
          isEmpty={(d) => !d.recommendations || d.recommendations.length === 0}
          empty={<EmptyState icon="📚" title="No personalized recommendations yet." description="Take a skill assessment to unlock gap-based course recommendations." />}
        >
          {(d) => <ProgramGrid programs={d.recommendations} showGapBadge />}
        </DataState>
      )}

      {tab === 'all' && (
        <DataState loading={allLoading} error={allError} data={allPrograms} onRetry={reloadAll}>
          {(programs) => <ProgramGrid programs={programs} />}
        </DataState>
      )}
    </div>
  );
}

function ProgramGrid({ programs, showGapBadge }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {programs.map((p) => (
        <div key={p.id} className="card p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">{p.provider}</p>
          <h3 className="font-semibold text-slate-900 mt-0.5">{p.title}</h3>
          {p.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="badge bg-slate-100 text-slate-600 capitalize">{p.difficulty}</span>
            <span>{p.duration}</span>
          </div>
          {p.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {p.skills.slice(0, 3).map((s) => (
                <span key={s} className="badge bg-brand-50 text-brand-700">
                  {s}
                </span>
              ))}
            </div>
          )}
          {showGapBadge && p.matched_gap_skill && <span className="badge bg-red-50 text-red-600 mt-2">Closes gap: {p.matched_gap_skill}</span>}
        </div>
      ))}
    </div>
  );
}
