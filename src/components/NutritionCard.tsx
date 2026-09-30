import React, { useState } from 'react';
import { Apple, Droplets, Moon, Utensils, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { CompleteFitnessPlan, User } from '../types';
import { api } from '../services/api';

interface NutritionCardProps {
  plan: CompleteFitnessPlan;
  user?: Partial<User> | null;
  onRefreshTip?: () => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ plan, user, onRefreshTip }) => {
  const [loadingFresh, setLoadingFresh] = useState(false);
  const [customNutrition, setCustomNutrition] = useState<{
    nutrition_tip?: string;
    hydration_tip?: string;
    general_recovery_tip?: string;
    healthy_eating_guidance?: string;
    macro_breakdown?: { protein: string; carbs: string; healthy_fats: string };
  } | null>(null);

  const handleRegenerate = async () => {
    setLoadingFresh(true);
    try {
      const res = await api.generateNutrition({
        user_id: user?.user_id,
        profile: user,
      });
      setCustomNutrition(res);
      if (onRefreshTip) onRefreshTip();
    } catch (err) {
      console.error('Failed to refresh nutrition:', err);
    } finally {
      setLoadingFresh(false);
    }
  };

  const nutritionTip = customNutrition?.nutrition_tip || plan.nutrition_tip;
  const hydrationTip = customNutrition?.hydration_tip || plan.hydration_tip;
  const recoveryTip = customNutrition?.general_recovery_tip || plan.general_recovery_tip;
  const eatingGuidance = customNutrition?.healthy_eating_guidance || plan.healthy_eating_guidance;
  const macros = customNutrition?.macro_breakdown;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/25 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative accent background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                AI Nutrition & Recovery Guide
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <Sparkles className="w-3 h-3" />
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized macro fuel & recovery protocols for <span className="text-emerald-400 font-semibold">{user?.goal || 'Optimal Vitality'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={loadingFresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingFresh ? 'animate-spin text-emerald-400' : ''}`} />
          {loadingFresh ? 'Analyzing...' : 'Refresh Tip'}
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Nutrition suggestion */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>Target Nutrition Strategy</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {nutritionTip}
          </p>
          {macros && (
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Macro Split Target:</span>
              <div className="flex gap-2 font-mono font-semibold">
                <span className="text-emerald-400">P: {macros.protein}</span>
                <span className="text-cyan-400">C: {macros.carbs}</span>
                <span className="text-amber-400">F: {macros.healthy_fats}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hydration reminder */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Hydration & Electrolytes</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {hydrationTip}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Pro-tip: Sip 300ml water 20 mins prior to training sessions.</span>
          </div>
        </div>

        {/* Recovery advice */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Cellular Recovery & Sleep</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {recoveryTip}
          </p>
        </div>

        {/* Healthy Eating Guidance */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
            <Apple className="w-4 h-4 text-teal-400" />
            <span>Sustainable Healthy Habits</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {eatingGuidance}
          </p>
        </div>
      </div>

      {/* Mandatory Safety Disclaimer as required by Section 7 & Section 18 */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-amber-300/90 leading-relaxed">
          <strong>Wellness Notice:</strong> FitBuddy provides general wellness information and is not a replacement for professional medical, nutrition, or fitness advice. Always consult a certified healthcare professional before making substantial dietary or exercise shifts.
        </p>
      </div>
    </div>
  );
};
