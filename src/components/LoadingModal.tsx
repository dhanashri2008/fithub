import React, { useEffect, useState } from 'react';
import { Sparkles, Dumbbell, Activity, CheckCircle2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
}

const STEPS = [
  'Analyzing metabolic profile, age & fitness goals...',
  'Engineering optimal 7-day training periodization...',
  'Calibrating volume, rep tempos & rest periods...',
  'Generating warmup mobility & post-workout cool-downs...',
  'Synthesizing personalized nutrition & hydration blueprint...',
  'Finalizing your FitBuddy AI training regimen...',
];

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = 'Creating your personalized FitBuddy plan...',
  subtitle = 'Gemini AI is tailoring a balanced, science-backed 7-day regimen for your goals.',
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Fitness Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-9 h-9 text-emerald-400 animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        </div>

        {/* Title & subtitle */}
        <h3 className="text-xl font-bold text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Live Step Progress */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-6 text-left">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>AI Generation Pipeline</span>
          </div>

          <div className="space-y-2">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'text-white font-medium scale-[1.01]'
                      : isPast
                      ? 'text-emerald-400/80'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span
                        className={`inline-block w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold ${
                          isCurrent
                            ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10'
                            : 'border-slate-700 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    )}
                  </span>
                  <span className="leading-tight">{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reassuring note */}
        <p className="text-[11px] text-slate-500 italic">
          High precision periodization in progress. Usually takes ~3-8 seconds.
        </p>
      </div>
    </div>
  );
};
