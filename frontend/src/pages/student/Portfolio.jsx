import { useAuth } from '../../hooks/useAuth';
import { useAsync } from '../../hooks/useAsync';
import * as studentsApi from '../../api/students';
import DataState from '../../components/DataState';
import ProgressBar from '../../components/ProgressBar';
import { proficiencyColor } from '../../utils/format';

export default function StudentPortfolio() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => studentsApi.getPortfolio(user.id), [user.id]);

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {(p) => (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-6 sm:p-8 text-center bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
            <div className="h-16 w-16 rounded-full bg-white/20 mx-auto flex items-center justify-center text-2xl font-bold">
              {p.profile.name?.[0]}
            </div>
            <h1 className="text-xl font-bold mt-3">{p.profile.name}</h1>
            <p className="text-brand-100 text-sm">
              {p.profile.degree} · {p.profile.branch} · {p.profile.college}
            </p>
            {p.profile.career_goal && <span className="badge bg-white/20 text-white mt-3">{p.profile.career_goal}</span>}
            <p className="text-sm text-brand-100 mt-3 max-w-lg mx-auto">{p.profile.bio}</p>
            <button
              className="btn-secondary mt-4 bg-white/10 text-white border-white/30 hover:bg-white/20"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
            >
              🔗 Copy portfolio link
            </button>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Skills</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {p.skills.map((s) => (
                <ProgressBar key={s.name} label={s.name} sublabel={`${s.proficiency}%`} value={s.proficiency} color={proficiencyColor(s.proficiency)} />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Projects</h2>
            {p.projects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects added yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {p.projects.map((proj) => (
                  <div key={proj.id} className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900">{proj.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(proj.technologies || []).map((t) => (
                        <span key={t} className="badge bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Certifications</h2>
            {p.certifications.length === 0 ? (
              <p className="text-sm text-slate-500">No certifications added yet.</p>
            ) : (
              <div className="space-y-2">
                {p.certifications.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.issuer}</p>
                    </div>
                    <span className={`badge ${c.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} capitalize`}>
                      {c.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DataState>
  );
}
