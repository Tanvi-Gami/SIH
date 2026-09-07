import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as institutionsApi from '../../api/institutions';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';

export default function InstitutionStudents() {
  const { data, loading, error, reload } = useAsync(() => institutionsApi.listStudents(), []);
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900">Students</h1>
        <input className="input w-64" placeholder="Search by name…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <DataState loading={loading} error={error} data={data} onRetry={reload} empty={<EmptyState icon="👥" title="No students found." />}>
        {(students) => {
          const filtered = students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
          return (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Degree / Branch</th>
                    <th className="px-4 py-3 font-medium">Graduation</th>
                    <th className="px-4 py-3 font-medium">CGPA</th>
                    <th className="px-4 py-3 font-medium">Career goal</th>
                    <th className="px-4 py-3 font-medium">Readiness</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.degree}, {s.branch}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{s.graduation_year}</td>
                      <td className="px-4 py-3 text-slate-500">{s.cgpa}</td>
                      <td className="px-4 py-3 text-slate-500">{s.career_goal || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-brand-50 text-brand-700">{s.readiness_score || 0}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </DataState>
    </div>
  );
}
