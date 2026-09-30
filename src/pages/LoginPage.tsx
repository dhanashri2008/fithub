import React, { useState } from 'react';
import { Dumbbell, ShieldCheck, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  isAdminPortal?: boolean;
  onSuccessUser: (user: User) => void;
  onSuccessAdmin: (admin: any) => void;
  onSwitchToRegister: () => void;
  onCancel: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  isAdminPortal = false,
  onSuccessUser,
  onSuccessAdmin,
  onSwitchToRegister,
  onCancel,
}) => {
  const [isAdmin, setIsAdmin] = useState(isAdminPortal);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide both your credential and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isAdmin) {
        const res = await api.adminLogin({
          email_or_username: identifier.trim(),
          password,
        });
        onSuccessAdmin(res.admin);
      } else {
        const res = await api.login({
          email_or_user_id: identifier.trim(),
          password,
        });
        onSuccessUser(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setIsAdmin(false);
    setIdentifier('alex_fit');
    setPassword('password123');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setIsAdmin(true);
    setIdentifier('admin@fitbuddy.ai');
    setPassword('FitBuddyAdmin2026!');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            {isAdmin ? (
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            ) : (
              <Dumbbell className="w-6 h-6 text-slate-950 font-bold" />
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isAdmin ? 'Admin Authorization' : 'Welcome to FitBuddy'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? 'Authorized coaches & platform administrators only'
              : 'Sign in to access your workouts, streaks & AI plans'}
          </p>
        </div>

        {/* Portal switcher tab */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isAdmin
                ? 'bg-slate-800 text-white shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Athlete Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isAdmin
                ? 'bg-amber-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Portal
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {isAdmin ? 'Admin Email / Username' : 'Email or User ID'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isAdmin ? 'admin@fitbuddy.ai' : 'alex_fit or email'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
              />
              <UserIcon className="w-4 h-4 text-slate-600 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
              />
              <Lock className="w-4 h-4 text-slate-600 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAdmin
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isAdmin ? 'Enter Admin Dashboard' : 'Sign In to FitBuddy'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Buttons for Seamless Testing */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500 text-center uppercase tracking-wider mb-2">
            Quick-Fill Demo Credentials:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-emerald-400 border border-slate-800 transition-colors"
            >
              Demo Athlete
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-amber-400 border border-slate-800 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {!isAdmin ? (
            <p>
              Don't have a plan yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-emerald-400 font-bold hover:underline"
              >
                Create My Fitness Plan
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-300"
            >
              Return to Athlete View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
