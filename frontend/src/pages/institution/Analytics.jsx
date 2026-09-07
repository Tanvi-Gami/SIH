import { useAsync } from '../../hooks/useAsync';
import * as institutionsApi from '../../api/institutions';
import DataState from '../../components/DataState';
import ProgressBar from '../../components/ProgressBar';
import { proficiencyColor } from '../../utils/format';

export default function InstitutionAnalytics() {
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([institutionsApi.overview(), institutionsApi.industryDemand(), institutionsApi.skillGaps()]),
    []
  );

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {([overview, demand, gaps]) => {
        const maxDemand = Math.max(...demand.map((d) => d.demand_count), 1);
        return (
          <div className="space-y-6">
            <h1 className="text-xl font-bold text-slate-900">Analytics</h1>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Student skill distribution</h2>
                <div className="space-y-3">
                  {overview.skill_distribution.map((s) => (
                    <ProgressBar key={s.name} label={s.name} sublabel={`${s.avg_proficiency}% avg`} value={s.avg_proficiency} color={proficiencyColor(s.avg_proficiency)} />
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Industry skill demand</h2>
                <p className="text-xs text-slate-400 mb-3">Frequency of skills required across all open postings platform-wide.</p>
                <div className="space-y-2.5">
                  {demand.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="w-32 text-sm text-slate-600 shrink-0 truncate">{d.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(d.demand_count / maxDemand) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-6 text-right">{d.demand_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-1">Priority skill gaps</h2>
              <p className="text-xs text-slate-400 mb-4">High industry demand, low average student proficiency — good curriculum/training targets.</p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {gaps.map((g) => (
                  <div key={g.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{g.name}</span>
                    <span className="text-slate-500">
                      Demand: <span className="font-medium text-slate-800">{g.demand_count}</span> · Student avg:{' '}
                      <span className="font-medium text-red-600">{g.student_avg_proficiency}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
