import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as applicationsApi from '../../api/applications';
import { StatusBadge, MatchScoreBadge } from '../../components/Badge';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';
import { formatDate } from '../../utils/format';

const STATUS_OPTIONS = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];

export default function IndustryApplicants() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, error, reload } = useAsync(() => applicationsApi.listApplicants(statusFilter ? { status: statusFilter } : {}), [statusFilter]);
  const { push } = useToast();

  const updateStatus = async (id, status) => {
    try {
      await applicationsApi.updateApplicationStatus(id, status);
      push('Status updated.', 'success');
      reload();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900">Applicants</h1>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <DataState loading={loading} error={error} data={data} onRetry={reload} empty={<EmptyState icon="📋" title="No applicants yet." />}>
        {(apps) => (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Opportunity</th>
                  <th className="px-4 py-3 font-medium">Education</th>
                  <th className="px-4 py-3 font-medium">Match</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{a.student_name}</p>
                      <p className="text-xs text-slate-400">{a.student_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.opportunity_title}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {a.degree}, {a.branch} · CGPA {a.cgpa}
                    </td>
                    <td className="px-4 py-3">
                      <MatchScoreBadge score={a.match_score} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(a.applied_at)}</td>
                    <td className="px-4 py-3">
                      <select className="input py-1 text-xs" value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
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
