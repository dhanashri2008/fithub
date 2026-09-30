import React, { useEffect, useState } from 'react';
import {
  X,
  User as UserIcon,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Dumbbell,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { User, WorkoutPlanRecord } from '../types';
import { api } from '../services/api';

interface AdminUserModalProps {
  userId: string | null;
  onClose: () => void;
  onUserDeleted?: () => void;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
  userId,
  onClose,
  onUserDeleted,
}) => {
  const [data, setData] = useState<{
    user: User;
    plans: WorkoutPlanRecord[];
    feedback: any[];
    progress: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'plans' | 'feedback' | 'progress'>('profile');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }

    setLoading(true);
    api
      .getAdminUserDetail(userId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Error fetching admin user detail:', err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete athlete "${userId}" and all associated data?`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteUser(userId);
      if (onUserDeleted) onUserDeleted();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const user = data?.user;
  const plans = data?.plans || [];
  const latestPlan = plans[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {user?.name || userId}
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  @{userId}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Registered: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete User'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold bg-slate-950/30">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Biometrics & Profile
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Workout Plans</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800">
              {plans.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Feedback Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800">
              {data?.feedback?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'progress'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Activity & Progress</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800">
              {data?.progress?.length || 0}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs">Loading athlete records...</p>
            </div>
          ) : !data || !user ? (
            <p className="text-slate-400 text-center py-10">User details not found.</p>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Email</span>
                      <span className="text-xs font-semibold text-slate-200 truncate block">
                        {user.email}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Age / Weight</span>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {user.age} yrs • {user.weight} kg
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Goal</span>
                      <span className="text-xs font-bold text-emerald-400 block">
                        {user.goal}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Experience</span>
                      <span className="text-xs font-bold text-cyan-400 block">
                        {user.experience}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Intensity</span>
                      <span className="text-xs font-bold text-amber-400 block">
                        {user.intensity}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Workout Time</span>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {user.available_time || '45 min'}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Equipment</span>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {user.equipment || 'Full Gym'}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Dietary</span>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {user.dietary_preference || 'Balanced'}
                      </span>
                    </div>
                  </div>

                  {latestPlan && (
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-emerald-400" />
                        <span>Active Plan Status</span>
                      </h4>
                      <p className="text-xs text-slate-300 mb-1">
                        <strong>Plan Title:</strong> {latestPlan.original_plan.plan_title}
                      </p>
                      <p className="text-xs text-slate-400">
                        <strong>Adapted Version:</strong>{' '}
                        {latestPlan.updated_plan ? (
                          <span className="text-emerald-400 font-semibold">
                            Yes (Active)
                          </span>
                        ) : (
                          <span className="text-slate-500">Original Plan only</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Plans Tab: Shows Original AND Updated Plans */}
              {activeTab === 'plans' && (
                <div className="space-y-6">
                  {plans.length === 0 ? (
                    <p className="text-xs text-slate-400">No workout plans generated yet.</p>
                  ) : (
                    plans.map((p, pIdx) => (
                      <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-xs font-bold text-emerald-400">Plan #{p.id}</span>
                            <h4 className="font-bold text-sm text-white">
                              {p.original_plan.plan_title}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Created: {new Date(p.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Side-by-side or comparison: Original Plan vs Updated Plan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Original Plan */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-2">
                              <Dumbbell className="w-3.5 h-3.5" />
                              <span>Original Workout Plan</span>
                            </div>
                            <p className="text-xs text-slate-300 mb-3">{p.original_plan.summary}</p>
                            <div className="space-y-1.5 text-[11px] text-slate-400">
                              {p.original_plan.weekly_plan?.slice(0, 4).map((d) => (
                                <div key={d.day} className="flex justify-between border-b border-slate-800/40 pb-1">
                                  <span className="font-semibold text-slate-300">Day {d.day}:</span>
                                  <span>{d.focus}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Updated Plan */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Updated AI Plan</span>
                            </div>
                            {p.updated_plan ? (
                              <>
                                <p className="text-xs text-slate-300 mb-3">{p.updated_plan.summary}</p>
                                <div className="space-y-1.5 text-[11px] text-slate-400">
                                  {p.updated_plan.weekly_plan?.slice(0, 4).map((d) => (
                                    <div key={d.day} className="flex justify-between border-b border-slate-800/40 pb-1">
                                      <span className="font-semibold text-slate-300">Day {d.day}:</span>
                                      <span>{d.focus}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-slate-500 italic py-4 text-center">
                                No feedback adaptation submitted for this plan yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Feedback History Tab */}
              {activeTab === 'feedback' && (
                <div className="space-y-3">
                  {(!data.feedback || data.feedback.length === 0) ? (
                    <p className="text-xs text-slate-400">No feedback submitted by this user.</p>
                  ) : (
                    data.feedback.map((fb: any) => (
                      <div key={fb.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Feedback Record #{fb.id}
                          </span>
                          <span>{new Date(fb.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-200 italic">
                          "{fb.feedback}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Progress History Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-2">
                  {(!data.progress || data.progress.length === 0) ? (
                    <p className="text-xs text-slate-400">No logged workout completions yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Day Number</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Athlete Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {data.progress.map((pr: any) => (
                            <tr key={pr.id} className="hover:bg-slate-950/40">
                              <td className="p-2.5 text-slate-300">{pr.workout_date}</td>
                              <td className="p-2.5 font-bold text-white">Day {pr.day_number}</td>
                              <td className="p-2.5">
                                {pr.workout_completed ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                                    Missed
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-400">{pr.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
