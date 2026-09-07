import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import * as facultyApi from '../../api/faculty';
import DataState from '../../components/DataState';
import StatCard from '../../components/StatCard';
import { StatusBadge } from '../../components/Badge';

export default function FacultyDashboard() {
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([facultyApi.getProfile(), facultyApi.myApplications(), facultyApi.listOpportunities()]),
    []
  );

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {([profile, applications, opportunities]) => (
        <div className="space-y-6">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
            <h1 className="text-xl font-bold">Welcome, {profile.name}</h1>
            <p className="text-brand-100 text-sm mt-1">{profile.designation} · {profile.department}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Open opportunities" value={opportunities.length} icon="🎓" />
            <StatCard label="My applications" value={applications.length} icon="📋" accent="brand" />
            <StatCard label="Selected" value={applications.filter((a) => a.status === 'selected').length} icon="🎉" accent="emerald" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Recent opportunities</h2>
                <Link to="/faculty/opportunities" className="text-sm text-brand-600 hover:underline">
                  View all →
                </Link>
              </div>
              {opportunities.slice(0, 4).map((o) => (
                <div key={o.id} className="py-2 border-b border-slate-50 last:border-0">
                  <p className="text-sm font-medium text-slate-800">{o.title}</p>
                  <p className="text-xs text-slate-400">
                    {o.company_name} · {o.type.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">My recent applications</h2>
                <Link to="/faculty/applications" className="text-sm text-brand-600 hover:underline">
                  View all →
                </Link>
              </div>
              {applications.length === 0 ? (
                <p className="text-sm text-slate-500">No applications yet.</p>
              ) : (
                applications.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.company_name}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DataState>
  );
}
