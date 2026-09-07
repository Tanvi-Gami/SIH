import { useAsync } from '../../hooks/useAsync';
import * as facultyApi from '../../api/faculty';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';
import { StatusBadge } from '../../components/Badge';
import { titleCase } from '../../utils/format';

export default function FacultyApplications() {
  const { data, loading, error, reload } = useAsync(() => facultyApi.myApplications(), []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">My Applications</h1>
      <DataState loading={loading} error={error} data={data} onRetry={reload} empty={<EmptyState icon="📋" title="You haven't applied to any opportunities yet." />}>
        {(apps) => (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Opportunity</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                    <td className="px-4 py-3 text-slate-500">{a.company_name}</td>
                    <td className="px-4 py-3 text-slate-500">{titleCase(a.type)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataState>
    </div>
  );
}
