import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Eye,
  LogOut,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, AdminUserListItem } from '../types';
import { AdminUserModal } from '../components/AdminUserModal';

interface AdminDashboardPageProps {
  adminUser: any;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminUser,
  onLogout,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Selected user for modal
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers({
          search: search.trim() || undefined,
          goal: goalFilter,
          intensity: intensityFilter,
          sort: sortBy,
        }),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [goalFilter, intensityFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete athlete ${name} (${userId})? This will delete all workout plans, progress and feedback.`)) {
      return;
    }
    try {
      await api.deleteUser(userId);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-600/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Head Coach & Admin Console
                </span>
                <span className="text-xs text-slate-400">Authenticated: {adminUser?.name || 'Administrator'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                FitBuddy Global Administration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats as required by Section 14:
          Total Users, Active Users, Total Plans, Updated Plans, Completed Workouts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
            <span>Total Athletes</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.total_users ?? '—'}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Registered Users</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
            <span>Active Athletes</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400">
            {stats?.active_users ?? '—'}
          </div>
          <span className="text-[10px] text-cyan-300 font-medium">100% Platform Health</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
            <span>Total Plans</span>
            <Dumbbell className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.total_plans ?? '—'}
          </div>
          <span className="text-[10px] text-teal-400 font-medium">7-Day Programs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
            <span>Updated Plans</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {stats?.updated_plans ?? '—'}
          </div>
          <span className="text-[10px] text-amber-300 font-medium">AI Feedback Adapted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
            <span>Completed Workouts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {stats?.completed_workouts ?? '—'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Logged in DB</span>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Controls: Search, Filter by goal, Filter by intensity, Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search athlete name, @user_id, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Filter by Goal */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold">Goal:</span>
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="bg-transparent text-white font-medium outline-none text-xs"
              >
                <option value="all" className="bg-slate-900">All Goals</option>
                <option value="Weight Loss" className="bg-slate-900">Weight Loss</option>
                <option value="Muscle Gain" className="bg-slate-900">Muscle Gain</option>
                <option value="General Wellness" className="bg-slate-900">General Wellness</option>
                <option value="Strength" className="bg-slate-900">Strength</option>
                <option value="Flexibility" className="bg-slate-900">Flexibility</option>
              </select>
            </div>

            {/* Filter by Intensity */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold">Intensity:</span>
              <select
                value={intensityFilter}
                onChange={(e) => setIntensityFilter(e.target.value)}
                className="bg-transparent text-white font-medium outline-none text-xs"
              >
                <option value="all" className="bg-slate-900">All Intensities</option>
                <option value="Low" className="bg-slate-900">Low</option>
                <option value="Medium" className="bg-slate-900">Medium</option>
                <option value="High" className="bg-slate-900">High</option>
              </select>
            </div>

            {/* Sort Users */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white font-medium outline-none text-xs"
              >
                <option value="date" className="bg-slate-900">Newest Created</option>
                <option value="name" className="bg-slate-900">Athlete Name</option>
                <option value="completed" className="bg-slate-900">Most Completed</option>
                <option value="plans" className="bg-slate-900">Most Plans</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table as required by Section 14:
            User ID, Name, Age, Weight, Goal, Intensity, Created Date, Plan Status, Actions */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading athlete directory...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No athletes match your query.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Age / Weight</th>
                  <th className="p-3">Goal</th>
                  <th className="p-3">Intensity</th>
                  <th className="p-3">Plan Status</th>
                  <th className="p-3">Completed</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => {
                  const hasPlan = u.plan_count > 0;
                  const hasUpdated = u.updated_count > 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-mono font-semibold text-emerald-400">
                        @{u.user_id}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        {u.age} yrs • {u.weight} kg
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {u.goal}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-amber-400 font-medium">
                          {u.intensity}
                        </span>
                      </td>
                      <td className="p-3">
                        {hasUpdated ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                            <Sparkles className="w-3 h-3" /> Adapted
                          </span>
                        ) : hasPlan ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-max block">
                            Original Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No Plan</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-200">
                        {u.completed_count} sessions
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectUserId(u.user_id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                            title="View Full Athlete Record & Plans"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.user_id, u.name)}
                            className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 transition-colors"
                            title="Delete Athlete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Admin User Modal for detailed inspection */}
      <AdminUserModal
        userId={inspectUserId}
        onClose={() => setInspectUserId(null)}
        onUserDeleted={() => {
          setInspectUserId(null);
          fetchDashboardData();
        }}
      />
    </div>
  );
};
