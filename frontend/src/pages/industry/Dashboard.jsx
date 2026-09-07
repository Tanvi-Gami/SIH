import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import * as companiesApi from '../../api/companies';
import * as oppApi from '../../api/opportunities';
import * as applicationsApi from '../../api/applications';
import DataState from '../../components/DataState';
import StatCard from '../../components/StatCard';

const FUNNEL_STAGES = ['Applications', 'Shortlisted', 'Interviews', 'Selected'];

/** Turns per-status snapshot counts into a cumulative, narrowing funnel:
 * "reached at least this stage" (shortlisted+interview+selected all count
 * towards "Shortlisted", etc.) — rejections still count towards the total
 * received but don't count as having reached any later stage. */
function buildCumulativeFunnel(funnel) {
  const total = Object.values(funnel).reduce((a, b) => a + b, 0);
  const shortlistedPlus = funnel.shortlisted + funnel.interview + funnel.selected;
  const interviewPlus = funnel.interview + funnel.selected;
  return [total, shortlistedPlus, interviewPlus, funnel.selected];
}

export default function IndustryDashboard() {
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([companiesApi.getMyCompany(), oppApi.myOpportunities(), applicationsApi.recruitmentFunnel()]),
    []
  );

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {([company, myOpps, funnel]) => {
        const openJobs = myOpps.jobs.filter((j) => j.status === 'open').length;
        const openInternships = myOpps.internships.filter((i) => i.status === 'open').length;
        const funnelValues = buildCumulativeFunnel(funnel);
        const totalApplications = funnelValues[0];
        const maxFunnel = Math.max(1, funnelValues[0]);

        return (
          <div className="space-y-6">
            <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
              <h1 className="text-xl font-bold">{company.name}</h1>
              <p className="text-brand-100 text-sm mt-1">{company.industry}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Active jobs" value={openJobs} icon="💼" />
              <StatCard label="Active internships" value={openInternships} icon="🧑‍💻" accent="brand" />
              <StatCard label="Total applications" value={totalApplications} icon="📥" accent="amber" />
              <StatCard label="Selected" value={funnel.selected} icon="🎉" accent="emerald" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Recruitment funnel</h2>
                <div className="space-y-3">
                  {FUNNEL_STAGES.map((label, i) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-medium text-slate-800">{funnelValues[i]}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(funnelValues[i] / maxFunnel) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Quick actions</h2>
                <div className="space-y-2">
                  <Link to="/industry/opportunities" className="btn-secondary w-full justify-start">
                    💼 Manage jobs & internships
                  </Link>
                  <Link to="/industry/applicants" className="btn-secondary w-full justify-start">
                    📋 Review applicants
                  </Link>
                  <Link to="/industry/candidates" className="btn-secondary w-full justify-start">
                    🔍 Search candidates
                  </Link>
                  <Link to="/industry/company" className="btn-secondary w-full justify-start">
                    🏢 Update company profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
