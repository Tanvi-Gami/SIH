import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as facultyApi from '../../api/faculty';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';
import { formatDate, titleCase } from '../../utils/format';

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'fdp', label: 'FDP' },
  { value: 'industrial_training', label: 'Industrial Training' },
  { value: 'consultancy', label: 'Consultancy' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'research_collaboration', label: 'Research Collaboration' },
];

export default function FacultyOpportunities() {
  const [typeFilter, setTypeFilter] = useState('');
  const { data, loading, error, reload } = useAsync(() => facultyApi.listOpportunities(typeFilter ? { type: typeFilter } : {}), [typeFilter]);
  const { push } = useToast();
  const [appliedIds, setAppliedIds] = useState(new Set());

  const apply = async (id) => {
    try {
      await facultyApi.apply(id);
      setAppliedIds((s) => new Set([...s, id]));
      push('Applied successfully!', 'success');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900">Faculty Opportunities</h1>
        <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <DataState loading={loading} error={error} data={data} onRetry={reload} empty={<EmptyState icon="🎓" title="No opportunities found." />}>
        {(list) => (
          <div className="grid sm:grid-cols-2 gap-4">
            {list.map((o) => (
              <div key={o.id} className="card p-4">
                <p className="text-xs text-slate-400 uppercase font-medium">{o.company_name}</p>
                <h3 className="font-semibold text-slate-900 mt-0.5">{o.title}</h3>
                <span className="badge bg-brand-50 text-brand-700 mt-1">{titleCase(o.type)}</span>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{o.description}</p>
                {o.required_expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.required_expertise.map((e) => (
                      <span key={e} className="badge bg-slate-100 text-slate-600">
                        {e}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Deadline: {formatDate(o.deadline)}</span>
                  {appliedIds.has(o.id) ? (
                    <span className="badge bg-emerald-50 text-emerald-700">✓ Applied</span>
                  ) : (
                    <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => apply(o.id)}>
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DataState>
    </div>
  );
}
