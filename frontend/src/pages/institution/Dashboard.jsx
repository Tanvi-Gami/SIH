import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import * as institutionsApi from '../../api/institutions';
import DataState from '../../components/DataState';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import { proficiencyColor } from '../../utils/format';

export default function InstitutionDashboard() {
  const { data, loading, error, reload } = useAsync(() => Promise.all([institutionsApi.getMyInstitution(), institutionsApi.overview()]), []);

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {([institution, overview]) => (
        <div className="space-y-6">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
            <h1 className="text-xl font-bold">{institution.name}</h1>
            <p className="text-brand-100 text-sm mt-1">{institution.type}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total students" value={overview.total_students} icon="👥" />
            <StatCard label="Assessments completed" value={overview.assessment_completed} icon="🎯" accent="brand" />
            <StatCard label="Placement readiness" value={`${overview.placement_readiness_pct}%`} icon="📈" accent="amber" />
            <StatCard label="Students placed" value={overview.placed_students} icon="🎉" accent="emerald" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Top student skills</h2>
              <div className="space-y-3">
                {overview.skill_distribution.slice(0, 6).map((s) => (
                  <ProgressBar key={s.name} label={s.name} sublabel={`${s.avg_proficiency}%`} value={s.avg_proficiency} color={proficiencyColor(s.avg_proficiency)} />
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Quick links</h2>
              <div className="space-y-2">
                <Link to="/institution/analytics" className="btn-secondary w-full justify-start">
                  📈 View full analytics
                </Link>
                <Link to="/institution/students" className="btn-secondary w-full justify-start">
                  👥 View students
                </Link>
                <Link to="/institution/profile" className="btn-secondary w-full justify-start">
                  🏛️ Update institution profile
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <StatCard label="Internship applications" value={overview.internships_applied} icon="🧑‍💻" />
                <StatCard label="Job applications" value={overview.jobs_applied} icon="💼" />
              </div>
            </div>
          </div>
        </div>
      )}
    </DataState>
  );
}
