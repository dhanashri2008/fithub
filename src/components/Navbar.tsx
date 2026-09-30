import React, { useState } from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  CalendarDays,
  LineChart,
  History,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  adminUser: any | null;
  onLogout: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  adminUser,
  onLogout,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Dumbbell, show: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: !!currentUser },
    { id: 'plan', label: 'Workout Plan', icon: CalendarDays, show: !!currentUser },
    { id: 'progress', label: 'Progress', icon: LineChart, show: !!currentUser },
    { id: 'history', label: 'History', icon: History, show: !!currentUser },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Dumbbell className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  FITBUDDY
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Personal Fitness Companion
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {adminUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('admin_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    currentView === 'admin_dashboard'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/40 border border-amber-700/50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Admin Panel
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Admin Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('admin_login')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 px-2.5 py-1.5 rounded-md transition-colors"
                title="Admin Login"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {currentUser.goal}
                    </p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('onboarding')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Create My Plan
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-2">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-400" />
                  {item.label}
                </button>
              );
            })}

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {currentUser ? (
              <>
                <div className="px-3.5 py-2 text-xs text-slate-400">
                  Signed in as <span className="text-white font-medium">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onNavigate('onboarding');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-emerald-500 text-slate-950"
                >
                  Create My Fitness Plan
                </button>
              </div>
            )}

            {adminUser ? (
              <button
                onClick={() => {
                  onNavigate('admin_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/40"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('admin_login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
