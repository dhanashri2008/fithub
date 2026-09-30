import React, { useEffect, useState } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Dumbbell,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { User, WorkoutPlanRecord } from '../types';

interface HistoryPageProps {
  user: User;
  onSelectPlan: (plan: WorkoutPlanRecord) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ user, onSelectPlan }) => {
  const [historyData, setHistoryData] = useState<{
    total_plans: number;
    plans: WorkoutPlanRecord[];
    feedback: any[];
    progress: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getHistory(user.user_id)
      .then((res) => setHistoryData(res))
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, [user.user_id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading training archive...</p>
      </div>
    );
  }

  const plans = historyData?.plans || [];
  const feedbackList = historyData?.feedback || [];
  const progressLogs = historyData?.progress || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Workout & Adaptation History
            </h1>
            <p className="text-xs text-slate-400">
              Complete historical record of generated routines, user feedback adaptations, and completed sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Generated 7-Day Plans ({plans.length})</span>
        </h2>

        {plans.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No saved workout plans yet.
          </div>
        ) : (
          plans.map((p) => {
            const hasUpdated = !!p.updated_plan;
            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        Plan #{p.id}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(p.created_at).toLocaleDateString()} at{' '}
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {p.original_plan.plan_title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onSelectPlan(p)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
                  >
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plan Details & Version Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Plan Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-2">
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Original Plan (Preserved)</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                      {p.original_plan.summary}
                    </p>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      {p.original_plan.weekly_plan?.slice(0, 3).map((d) => (
                        <div key={d.day} className="flex justify-between">
                          <span className="font-semibold text-slate-300">Day {d.day}:</span>
                          <span>{d.focus}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Updated Plan Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Updated AI Plan</span>
                    </div>
                    {hasUpdated ? (
                      <>
                        <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                          {p.updated_plan!.summary}
                        </p>
                        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 italic mb-2">
                          Feedback: "{p.updated_plan!.feedback_applied || 'Adapted by Gemini'}"
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-4 text-center">
                        No adaptation requested for this plan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Workouts Log Table as required by Section 12 */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>Completed Workout Sessions Log ({progressLogs.length})</span>
        </h2>

        {progressLogs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            No completed workouts recorded yet. Mark a day complete on your active plan!
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Day Number</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Athlete Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {progressLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3.5 font-mono text-slate-300">{log.workout_date}</td>
                    <td className="p-3.5 font-bold text-white">Day {log.day_number}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Completed
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 italic">
                      {log.notes || 'Day completed successfully.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
