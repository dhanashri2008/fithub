import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ArrowDown,
  Layers,
  CheckCircle2,
  Clock,
  Dumbbell,
  HeartPulse,
  Feather,
  Home,
  StretchHorizontal,
} from 'lucide-react';
import { CompleteFitnessPlan } from '../types';

interface FeedbackSectionProps {
  originalPlan: CompleteFitnessPlan;
  updatedPlan: CompleteFitnessPlan | null;
  latestFeedback?: string | null;
  onSubmitFeedback: (feedback: string) => Promise<void>;
  isUpdating: boolean;
}

const PRESET_FEEDBACK = [
  { label: 'Add more cardio', icon: HeartPulse },
  { label: 'Make the workouts easier', icon: Feather },
  { label: 'I have less time (30 min)', icon: Clock },
  { label: 'Include more rest days', icon: Layers },
  { label: "I don't have gym equipment", icon: Home },
  { label: 'Add more flexibility exercises', icon: StretchHorizontal },
];

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  originalPlan,
  updatedPlan,
  latestFeedback,
  onSubmitFeedback,
  isUpdating,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = feedbackText.trim() || selectedPreset;
    if (!text || isUpdating) return;
    await onSubmitFeedback(text);
    setFeedbackText('');
    setSelectedPreset(null);
  };

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setFeedbackText(preset);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Improve & Adapt My Plan
          </h3>
          <p className="text-xs text-slate-400">
            Tell FitBuddy what needs adjusting. Gemini will re-calibrate your 7-day schedule while keeping your original baseline safe.
          </p>
        </div>
      </div>

      {/* Preset suggestions */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Quick Feedback Suggestions:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_FEEDBACK.map((item) => {
            const Icon = item.icon;
            const isSelected = feedbackText === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelectPreset(item.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom feedback input */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="e.g., 'I feel knee discomfort during deep squats, please swap with lower impact quad builders' or 'I prefer 4 days instead of 5'..."
            rows={3}
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-slate-500 resize-none transition-all outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={(!feedbackText.trim() && !selectedPreset) || isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.01]"
          >
            {isUpdating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Re-calibrating Plan with Gemini...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Submit Feedback & Adapt Plan</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Pipeline Visualizer as specified in Section 8:
          ORIGINAL PLAN
                ↓
          USER FEEDBACK
                ↓
          UPDATED AI PLAN */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>AI Adaptation Pipeline</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {updatedPlan ? 'Active Version: Adapted' : 'Active Version: Original'}
          </span>
        </div>

        <div className="flex flex-col items-center space-y-2 py-2">
          {/* 1. ORIGINAL PLAN */}
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
              <Dumbbell className="w-3.5 h-3.5 text-teal-400" />
              <span>ORIGINAL BASELINE PLAN</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {originalPlan.plan_title || '7-Day Personalized Foundation'}
            </p>
          </div>

          {/* DOWN ARROW */}
          <div className="flex items-center justify-center text-emerald-400 animate-bounce">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* 2. USER FEEDBACK */}
          <div
            className={`w-full max-w-md border rounded-lg p-3 text-center transition-colors ${
              latestFeedback || updatedPlan?.feedback_applied
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 border-dashed'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-0.5">
              USER FEEDBACK
            </div>
            <p className="text-[11px] italic">
              {latestFeedback || updatedPlan?.feedback_applied ? (
                `"${latestFeedback || updatedPlan?.feedback_applied}"`
              ) : (
                'Submit feedback above to generate an adaptation'
              )}
            </p>
          </div>

          {/* DOWN ARROW */}
          <div className="flex items-center justify-center text-emerald-400 animate-bounce">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* 3. UPDATED AI PLAN */}
          <div
            className={`w-full max-w-md border rounded-lg p-3 text-center transition-all ${
              updatedPlan
                ? 'bg-emerald-950/30 border-emerald-500/60 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 border-dashed'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold">
              {updatedPlan ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">UPDATED AI PLAN (ACTIVE)</span>
                </>
              ) : (
                <span>UPDATED AI PLAN (PENDING FEEDBACK)</span>
              )}
            </div>
            {updatedPlan && (
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {updatedPlan.summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
