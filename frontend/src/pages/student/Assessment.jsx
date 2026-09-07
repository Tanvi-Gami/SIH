import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as studentsApi from '../../api/students';
import DataState from '../../components/DataState';
import ProgressBar from '../../components/ProgressBar';
import { proficiencyColor, proficiencyLabel } from '../../utils/format';
import { QUESTION_BANK, SITUATIONAL_QUESTIONS, SITUATIONAL_SKILLS } from '../../data/questionBank';

const EMPLOYABILITY_SKILLS = ['Communication', 'Problem Solving', 'Teamwork'];

export default function StudentAssessment() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { data: tracks, loading, error, reload } = useAsync(() => studentsApi.getCareerTracks(), []);
  const [step, setStep] = useState('select'); // select -> quiz -> result
  const [track, setTrack] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const startAssessment = async (t) => {
    setTrack(t);
    const requiredSkills = await studentsApi.getCareerTrackSkills(t.id);
    // Build a question set: top 6 track skills + the 3 core employability skills, deduped.
    const skillNames = [...new Set([...requiredSkills.map((s) => s.name).slice(0, 6), ...EMPLOYABILITY_SKILLS])];
    const built = skillNames.map((skill) => {
      if (SITUATIONAL_SKILLS.includes(skill) && SITUATIONAL_QUESTIONS[skill]) {
        return { skill, type: 'mcq', question: SITUATIONAL_QUESTIONS[skill] };
      }
      if (QUESTION_BANK[skill]) {
        return { skill, type: 'mcq', question: QUESTION_BANK[skill][0] };
      }
      return { skill, type: 'self-rating' };
    });
    setQuestions(built);
    setAnswers({});
    setStep('quiz');
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const skillScores = {};
      for (const item of questions) {
        if (item.type === 'mcq') {
          const chosen = answers[item.skill]?.mcq;
          const selfRating = answers[item.skill]?.selfRating ?? 60;
          const correct = chosen === item.question.answer ? 100 : 30;
          skillScores[item.skill] = Math.round(correct * 0.6 + selfRating * 0.4);
        } else {
          skillScores[item.skill] = answers[item.skill]?.selfRating ?? 50;
        }
      }
      const overall = Math.round(Object.values(skillScores).reduce((a, b) => a + b, 0) / Object.values(skillScores).length);
      const saved = await studentsApi.submitAssessment({ career_track: track.name, skill_scores: skillScores, overall_score: overall });
      setResult({ ...saved, skill_scores: skillScores, overall_score: overall });
      setStep('result');
      push('Assessment submitted!', 'success');
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = questions.every((item) =>
    item.type === 'mcq' ? answers[item.skill]?.mcq && answers[item.skill]?.selfRating !== undefined : answers[item.skill]?.selfRating !== undefined
  );

  return (
    <DataState loading={loading} error={error} data={tracks} onRetry={reload}>
      {(trackList) => (
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-xl font-bold text-slate-900">Skill Assessment</h1>

          {step === 'select' && (
            <div className="card p-5">
              <p className="text-sm text-slate-500 mb-4">Choose a career track to generate a relevant skill assessment.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {trackList.map((t) => (
                  <button key={t.id} onClick={() => startAssessment(t)} className="text-left border border-slate-200 rounded-lg p-4 hover:border-brand-400 hover:bg-brand-50/40 transition-colors">
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'quiz' && (
            <div className="space-y-4">
              <div className="card p-4 bg-brand-50 border-brand-100">
                <p className="text-sm text-brand-800">
                  Assessment for <span className="font-semibold">{track.name}</span> — {questions.length} skills
                </p>
              </div>
              {questions.map((item) => (
                <div key={item.skill} className="card p-5">
                  <h3 className="font-medium text-slate-900 mb-3">{item.skill}</h3>
                  {item.type === 'mcq' && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 mb-2">{item.question.q}</p>
                      <div className="space-y-2">
                        {item.question.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={item.skill}
                              checked={answers[item.skill]?.mcq === opt}
                              onChange={() => setAnswers((a) => ({ ...a, [item.skill]: { ...a[item.skill], mcq: opt } }))}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-slate-600">
                      Self-rate your proficiency: {answers[item.skill]?.selfRating ?? 50}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={answers[item.skill]?.selfRating ?? 50}
                      onChange={(e) => setAnswers((a) => ({ ...a, [item.skill]: { ...a[item.skill], selfRating: Number(e.target.value) } }))}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
              <button className="btn-primary w-full" disabled={!allAnswered || submitting} onClick={submitQuiz}>
                {submitting ? 'Submitting…' : 'Submit assessment'}
              </button>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-4">
              <div className="card p-5 text-center">
                <p className="text-sm text-slate-500">Overall score</p>
                <p className="text-4xl font-extrabold text-brand-600 mt-1">{result.overall_score}%</p>
              </div>
              <div className="card p-5 space-y-3">
                <h3 className="font-medium text-slate-900 mb-1">Your skill profile</h3>
                {Object.entries(result.skill_scores).map(([skill, score]) => (
                  <ProgressBar key={skill} label={skill} sublabel={`${score}% · ${proficiencyLabel(score)}`} value={score} color={proficiencyColor(score)} />
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={() => navigate('/student/skill-gap')}>
                  View skill gap analysis
                </button>
                <button className="btn-secondary" onClick={() => setStep('select')}>
                  Take another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DataState>
  );
}
