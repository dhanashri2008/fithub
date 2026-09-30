import React, { useState } from 'react';
import {
  User as UserIcon,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Target,
  Flame,
  Clock,
  Calendar,
  Utensils,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface OnboardingPageProps {
  onPlanGenerated: (user: User, planData: any) => void;
  onCancel: () => void;
  onSetLoading: (loading: boolean) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onPlanGenerated,
  onCancel,
  onSetLoading,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Account
    name: '',
    user_id: '',
    email: '',
    password: '',
    age: '28',
    weight: '72',

    // Step 2: Fitness Info
    goal: 'Muscle Gain', // Weight Loss, Muscle Gain, General Wellness, Strength, Flexibility
    experience: 'Intermediate', // Beginner, Intermediate, Advanced
    intensity: 'Medium', // Low, Medium, High

    // Step 3: Preferences
    available_time: '45 minutes',
    preferred_days: 'Mon, Wed, Fri, Sat',
    equipment: 'Full Gym', // Full Gym, Dumbbells only, Bodyweight only, Resistance Bands
    dietary_preference: 'Balanced', // Balanced, High Protein, Vegetarian, Vegan, Keto, Low Carb
  });

  const goals = [
    { id: 'Weight Loss', label: 'Weight Loss', desc: 'Caloric burn & metabolic conditioning' },
    { id: 'Muscle Gain', label: 'Muscle Gain', desc: 'Hypertrophy & progressive overload' },
    { id: 'General Wellness', label: 'General Wellness', desc: 'Energy, mobility & cardiovascular health' },
    { id: 'Strength', label: 'Strength', desc: 'Neuromuscular power & heavier resistance' },
    { id: 'Flexibility', label: 'Flexibility', desc: 'Joint mobility, posture & active lengthening' },
  ];

  const experiences = [
    { id: 'Beginner', label: 'Beginner', desc: '0 - 1 year of consistent training' },
    { id: 'Intermediate', label: 'Intermediate', desc: '1 - 3 years of structured gym work' },
    { id: 'Advanced', label: 'Advanced', desc: '3+ years of mastery & high intensity' },
  ];

  const intensities = [
    { id: 'Low', label: 'Low Intensity', desc: 'Gentle pacing, longer recovery' },
    { id: 'Medium', label: 'Medium Intensity', desc: 'Balanced aerobic & resistance effort' },
    { id: 'High', label: 'High Intensity', desc: 'Challenging loads, demanding work capacity' },
  ];

  const equipmentOptions = [
    'Full Gym (Barbells, Cables, Machines)',
    'Dumbbells & Bench',
    'Bodyweight Only (Calisthenics / Home)',
    'Resistance Bands & Pull-up Bar',
    'Kettlebells & Free Weights',
  ];

  const dietaryOptions = [
    'Balanced (Whole Foods)',
    'High Protein (Fitness Focus)',
    'Plant-Based / Vegan',
    'Vegetarian',
    'Keto / Low Carb',
    'Mediterranean Diet',
  ];

  const timeOptions = ['30 minutes', '45 minutes', '60 minutes', '75+ minutes'];

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Please enter your full name.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Please provide a valid email address.';
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters.';
    const ageNum = Number(formData.age);
    if (!ageNum || ageNum < 14 || ageNum > 95) return 'Please enter a valid age between 14 and 95.';
    const weightNum = Number(formData.weight);
    if (!weightNum || weightNum < 30 || weightNum > 300) return 'Please enter a realistic weight in kg (30 - 300).';
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onSetLoading(true);

    try {
      // 1. Register the user account in the SQLite DB
      const cleanUserId = formData.user_id.trim() || formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const regRes = await api.register({
        ...formData,
        user_id: cleanUserId,
        age: Number(formData.age),
        weight: Number(formData.weight),
      });

      // 2. Generate the 7-day workout plan using Gemini
      const planRes = await api.generateWorkout({
        user_id: regRes.user.user_id,
        profile: {
          name: regRes.user.name,
          age: regRes.user.age,
          weight: regRes.user.weight,
          goal: regRes.user.goal,
          experience: regRes.user.experience,
          intensity: regRes.user.intensity,
          available_time: regRes.user.available_time,
          preferred_days: regRes.user.preferred_days,
          equipment: regRes.user.equipment,
          dietary_preference: regRes.user.dietary_preference,
        },
      });

      onPlanGenerated(regRes.user, planRes);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setError(err.message || 'We could not generate your plan right now. Please try again.');
    } finally {
      onSetLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Wizard Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto relative mb-3">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[
            { num: 1, label: 'Biometrics', icon: UserIcon },
            { num: 2, label: 'Fitness Goal', icon: Target },
            { num: 3, label: 'Preferences', icon: Sliders },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30'
                      : isDone
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    isCurrent ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Personal & Biometrics */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Step 1: Personal & Biometrics
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  FitBuddy uses your weight, age, and profile to calculate workload limits and hydration requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    User ID (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. jordan_fit (optional)"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="95"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Weight in KG *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="300"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Fitness Information */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Step 2: Fitness Goals & Experience
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select your primary objective, training familiarity, and desired intensity level.
                </p>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Fitness Goal *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {goals.map((g) => {
                    const isSelected = formData.goal === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setFormData({ ...formData, goal: g.id })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{g.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{g.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Experience Level *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {experiences.map((exp) => {
                    const isSelected = formData.experience === exp.id;
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setFormData({ ...formData, experience: exp.id })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500 text-white ring-1 ring-cyan-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{exp.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{exp.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Workout Intensity *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {intensities.map((item) => {
                    const isSelected = formData.intensity === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setFormData({ ...formData, intensity: item.id })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{item.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preferences & Schedule */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Step 3: Schedule, Equipment & Diet
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ensure your plan fits seamlessly into your daily lifestyle and available equipment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Available Workout Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeOptions.map((time) => {
                      const isSelected = formData.available_time === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, available_time: time })}
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Preferred Workout Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_days}
                    onChange={(e) => setFormData({ ...formData, preferred_days: e.target.value })}
                    placeholder="e.g. 4 days/week (Mon, Wed, Fri, Sat)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gemini schedules full rest or active recovery around this rhythm.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Equipment Available
                  </label>
                  <select
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  >
                    {equipmentOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Dietary Preference
                  </label>
                  <select
                    value={formData.dietary_preference}
                    onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  >
                    {dietaryOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Safety notice disclaimer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                FitBuddy provides general exercise & wellness guidance. We do not make medical diagnoses. If you have chronic cardiovascular conditions or recent surgeries, consult your physician.
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate My Plan</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
