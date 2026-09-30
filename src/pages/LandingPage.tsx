import React from 'react';
import {
  Dumbbell,
  Sparkles,
  Calendar,
  Apple,
  RotateCcw,
  LineChart,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onLogin: () => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onLogin,
  onAdminLogin,
}) => {
  const featureCards = [
    {
      id: 1,
      title: 'AI Personalized Workouts',
      description:
        'Biometrically calibrated exercise programming tailored strictly to your age, weight, goal, and experience level.',
      icon: Sparkles,
      color: 'text-emerald-400',
      badge: 'Gemini 3.8 Flash',
    },
    {
      id: 2,
      title: '7-Day Fitness Plans',
      description:
        'Complete day-by-day routines with periodized splits, dynamic warm-ups, precise sets & reps, rest timers, and cool-downs.',
      icon: Calendar,
      color: 'text-cyan-400',
      badge: 'Full Week',
    },
    {
      id: 3,
      title: 'AI Nutrition & Recovery Tips',
      description:
        'Goal-aligned macronutrient targets, bodyweight hydration formulas, and deep restorative sleep guidance.',
      icon: Apple,
      color: 'text-amber-400',
      badge: 'Holistic Health',
    },
    {
      id: 4,
      title: 'Adaptive Workout Plans',
      description:
        'Life changes, and so does your plan. FitBuddy re-engineers your schedule whenever you submit feedback, preserving baseline history.',
      icon: RotateCcw,
      color: 'text-teal-400',
      badge: 'Zero Overwrite',
    },
    {
      id: 5,
      title: 'Progress Tracking',
      description:
        'Mark workouts complete with one tap, celebrate streak milestones, and track weekly consistency with visual rings.',
      icon: LineChart,
      color: 'text-indigo-400',
      badge: 'Streak Counter',
    },
    {
      id: 6,
      title: 'Smart Feedback System',
      description:
        'Prompt Gemini with real feedback ("add cardio", "less time", "home equipment") and watch your routines update dynamically.',
      icon: MessageSquare,
      color: 'text-emerald-400',
      badge: 'Conversational AI',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Brand Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Generation AI Fitness Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          FITBUDDY
          <span className="block text-2xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mt-2">
            Your AI-Powered Personal Fitness Companion
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
          Engineered with Google Gemini AI. Enter your biometrics and preferences to receive a tailored 7-day training schedule, targeted nutrition advice, and an adaptive feedback loop that evolves with you.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartOnboarding}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Create My Fitness Plan</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={onLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all hover:border-slate-600"
          >
            <span>Login to FitBuddy</span>
          </button>
        </div>

        {/* Live Metrics Showcase Teaser */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl">
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">7-Day</div>
            <div className="text-xs text-slate-400 font-medium">Custom Periodization</div>
          </div>
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">100%</div>
            <div className="text-xs text-slate-400 font-medium">Gemini AI Adaptive</div>
          </div>
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">0 Overwrites</div>
            <div className="text-xs text-slate-400 font-medium">Original Plans Preserved</div>
          </div>
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-teal-400">Real-Time</div>
            <div className="text-xs text-slate-400 font-medium">Streak & Progress Logs</div>
          </div>
        </div>
      </section>

      {/* 6 Feature Cards Section as specified in Section 3 */}
      <section className="py-16 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              Production Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Designed Like a Real Fitness Startup, Built for Real Human Results
            </h3>
            <p className="text-sm text-slate-400 mt-3">
              Explore the core pillars powering FitBuddy’s AI fitness planning engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                        <Icon className={`w-6 h-6 ${feat.color}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {feat.badge}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {feat.id}. {feat.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active in Engine</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety & Medical Disclaimer Banner as required by Section 7 & 18 */}
      <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
              General Wellness & Safety Protocol
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              FitBuddy provides general wellness information and is not a replacement for professional medical, nutrition, or fitness advice. Always consult a certified healthcare professional before beginning any intense physical training or dietary transition.
            </p>
          </div>
          <button
            onClick={onStartOnboarding}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};
