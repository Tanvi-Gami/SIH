import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import * as aiApi from '../../api/ai';
import DataState from '../../components/DataState';
import { EmptyState } from '../../components/States';
import ProgressBar from '../../components/ProgressBar';

export default function StudentSkillGap() {
  const { data, loading, error, reload } = useAsync(() => aiApi.getSkillGap(), []);

  return (
    <DataState
      loading={loading}
      error={error}
      data={data}
      onRetry={reload}
      isEmpty={(d) => !d.career_track}
      empty={
        <EmptyState
          icon="🎯"
          title="Set a career goal to see your skill gap"
          description="Go to your profile and choose a target career to unlock a personalized skill gap analysis."
          action={
            <Link to="/student/profile" className="btn-primary">
              Set career goal
            </Link>
          }
        />
      }
    >
      {(gap) => (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Skill Gap Analysis</h1>
            <p className="text-sm text-slate-500 mt-1">
              Target career: <span className="font-medium text-slate-700">{gap.career_track}</span>
            </p>
          </div>

          <Section title="Strong" color="emerald" items={gap.strong} description="You already meet or exceed the required proficiency." />
          <Section title="Moderate" color="amber" items={gap.moderate} description="Halfway there — a bit more practice will close these." />
          <Section title="Skill Gaps" color="red" items={gap.gaps} description="Priority areas to focus your learning on." />

          {gap.gaps?.length > 0 && (
            <Link to="/student/learning" className="btn-primary inline-flex">
              See recommended courses for these gaps →
            </Link>
          )}
        </div>
      )}
    </DataState>
  );
}

function Section({ title, color, items, description }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className={`h-2 w-2 rounded-full bg-${color}-500`} style={{ backgroundColor: color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#ef4444' }} />
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <ProgressBar key={item.skill} label={item.skill} sublabel={`${item.have}% / ${item.required}% required`} value={item.have} color={color} />
        ))}
      </div>
    </div>
  );
}
