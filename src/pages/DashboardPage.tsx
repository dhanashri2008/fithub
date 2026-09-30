import React from 'react';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Apple,
  MessageSquare,
  Clock,
  Dumbbell,
  ShieldCheck,
  RotateCcw,
  Target,
} from 'lucide-react';
import { User, WorkoutPlanRecord, UserProgressSummary } from '../types';

interface DashboardPageProps {
  user: User;
  workoutPlan: WorkoutPlanRecord | null;
  progress: UserProgressSummary | null;
  onNavigate: (view: string) => void;
  onStartOnboarding: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  workoutPlan,
  progress,
  onNavigate,
  onStartOnboarding,
}) => {
  const completedWorkouts = progress?.completed_workouts || 0;
  const streakDays = progress?.streak_days || 0;
  const weeklyTarget = 7;
  const weeklyProgress = progress?.weekly_progress || 0;
  const progressPercent = Math.min(Math.round((weeklyProgress / weeklyTarget) * 100), 100);

  const activePlan = workoutPlan?.updated_plan || workoutPlan?.original_plan;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FitBuddy Athlete Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Targeting <strong className="text-emerald-400">{user.goal}</strong> at {user.intensity} intensity with {user.equipment || 'Full Gym'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {workoutPlan ? (
              <button
                onClick={() => onNavigate('plan')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Dumbbell className="w-4 h-4 text-slate-950" />
                <span>Open Active Workout Plan</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <button
                onClick={onStartOnboarding}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Your First Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid (Weekly Progress, Completed Workouts, Streak, Current Goal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-white">{weeklyProgress}</span>
            <span className="text-xs text-slate-400 font-semibold">/ {weeklyTarget} workouts</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
            <span>{progressPercent}% completed</span>
            <span>{Math.max(0, weeklyTarget - weeklyProgress)} remaining</span>
          </div>
        </div>

        {/* Workout Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workout Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-amber-400">{streakDays}</span>
            <span className="text-xs text-slate-400 font-semibold">days active 🔥</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {streakDays > 0 ? 'Consistent momentum! Keep crushing your goals.' : 'Log today’s session to spark your streak!'}
          </p>
        </div>

        {/* Total Completed Workouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Sessions
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-cyan-400">{completedWorkouts}</span>
            <span className="text-xs text-slate-400 font-semibold">total sessions</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Recorded in persistent SQLite database.
          </p>
        </div>

        {/* Current Goal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Goal
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white truncate mb-1">
            {user.goal}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300">
              {user.experience}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">
              {user.intensity} Intensity
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Plan Preview & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Plan Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Current 7-Day Plan
                  </h3>
                  <p className="text-xs text-slate-400">
                    {workoutPlan?.updated_plan ? 'Adapted with feedback' : 'Original Baseline'}
                  </p>
                </div>
              </div>

              {activePlan && (
                <button
                  onClick={() => onNavigate('plan')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>View All 7 Days</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activePlan ? (
              <div className="space-y-4">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-1">
                    {activePlan.plan_title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {activePlan.summary}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {activePlan.weekly_plan?.slice(0, 4).map((d) => (
                      <div
                        key={d.day}
                        onClick={() => onNavigate('plan')}
                        className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                          Day {d.day}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5">
                          {d.focus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Schedule: {user.preferred_days || '4-5 days/week'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('plan')}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Improve Plan
                    </button>
                    <button
                      onClick={() => onNavigate('plan')}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                    >
                      Start Today's Workout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400 mb-3">No active workout plan generated yet.</p>
                <button
                  onClick={onStartOnboarding}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
                >
                  Generate Plan with Gemini
                </button>
              </div>
            )}
          </div>

          {/* Plan Update History Card as required by Section 11 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Plan Update History</span>
            </div>

            {workoutPlan ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Original Baseline Plan</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Preserved
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Created on {new Date(workoutPlan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('plan')}
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    View
                  </button>
                </div>

                {workoutPlan.updated_plan && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400">Adaptive AI Update</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Feedback Applied: "{workoutPlan.updated_plan.feedback_applied || 'Custom tuning'}"
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('plan')}
                      className="text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No version history yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Latest Nutrition & Latest Feedback as required by Section 11 */}
        <div className="space-y-6">
          {/* Latest Nutrition Tip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Apple className="w-4 h-4 text-emerald-400" />
              <span>Latest Nutrition Tip</span>
            </div>

            {activePlan?.nutrition_tip ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activePlan.nutrition_tip}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hydration:</span>
                  <span className="font-semibold text-cyan-400 truncate max-w-[150px]">
                    {activePlan.hydration_tip?.slice(0, 30)}...
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Generate a plan to reveal nutrition advice.</p>
            )}
          </div>

          {/* Latest Feedback */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-xs font-bold uppercase tracking-wider text-teal-400">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Latest User Feedback</span>
            </div>

            {workoutPlan?.latest_feedback || workoutPlan?.updated_plan?.feedback_applied ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-amber-300 italic mb-2">
                  "{workoutPlan.latest_feedback || workoutPlan.updated_plan?.feedback_applied}"
                </p>
                <span className="text-[10px] text-slate-500 block">
                  Processed by Gemini AI adaptive engine
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <p className="text-xs text-slate-400 mb-2">No feedback submitted yet.</p>
                <button
                  onClick={() => onNavigate('plan')}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  Give Feedback on Active Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
