import React, { useState } from 'react';
import {
  Printer,
  Download,
  BookmarkCheck,
  CheckCircle,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Heart,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompleteFitnessPlan, DayWorkoutPlan, User } from '../types';

interface PlanViewerProps {
  originalPlan: CompleteFitnessPlan;
  updatedPlan: CompleteFitnessPlan | null;
  user?: Partial<User> | null;
  onMarkComplete: (dayNumber: number) => Promise<void>;
  completedDays?: number[]; // e.g. [1, 2]
  onSaveNotification?: () => void;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({
  originalPlan,
  updatedPlan,
  user,
  onMarkComplete,
  completedDays = [],
  onSaveNotification,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeVersion, setActiveVersion] = useState<'updated' | 'original'>(
    updatedPlan ? 'updated' : 'original'
  );
  const [completingDay, setCompletingDay] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentPlan = activeVersion === 'updated' && updatedPlan ? updatedPlan : originalPlan;
  const days: DayWorkoutPlan[] = currentPlan.weekly_plan || [];
  const selectedDay: DayWorkoutPlan | undefined = days[selectedDayIndex] || days[0];

  const handleComplete = async (dayNumber: number) => {
    setCompletingDay(dayNumber);
    try {
      await onMarkComplete(dayNumber);
      // Trigger joyful celebration confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#14b8a6', '#06b6d4', '#eab308'],
      });
    } finally {
      setCompletingDay(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `FITBUDDY AI FITNESS PLAN
Athlete: ${user?.name || 'Athlete'}
Goal: ${user?.goal || 'General Fitness'} | Experience: ${user?.experience || 'All'} | Intensity: ${user?.intensity || 'Medium'}
Weight: ${user?.weight || '--'} kg | Age: ${user?.age || '--'} yrs
Plan Title: ${currentPlan.plan_title}
Version: ${activeVersion.toUpperCase()}

==================================================
SUMMARY
${currentPlan.summary}

==================================================
NUTRITION & RECOVERY GUIDANCE
Nutrition: ${currentPlan.nutrition_tip}
Hydration: ${currentPlan.hydration_tip}
Recovery: ${currentPlan.general_recovery_tip}
Healthy Habits: ${currentPlan.healthy_eating_guidance}

==================================================
7-DAY WORKOUT SCHEDULE
${days
  .map(
    (d) => `
DAY ${d.day}: ${d.focus.toUpperCase()}
Warm-up:
${d.warmup.map((w) => `  - ${w}`).join('\n')}

Exercises:
${d.exercises
  .map(
    (ex, i) =>
      `  ${i + 1}. ${ex.name} | ${ex.sets} sets x ${ex.reps || ex.duration} | Rest: ${ex.rest} ${
        ex.notes ? `(${ex.notes})` : ''
      }`
  )
  .join('\n')}

Cool-down:
${d.cooldown.map((c) => `  - ${c}`).join('\n')}

Daily Recovery:
  ${d.recovery}
`
  )
  .join('\n--------------------------------------------------\n')}

DISCLAIMER:
${currentPlan.disclaimer}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FitBuddy_${user?.name?.replace(/\s+/g, '_') || 'Plan'}_Day1-7.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    if (onSaveNotification) onSaveNotification();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* User Information Banner at top as required by Section 6 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                FitBuddy Active Plan
              </span>
              <span className="text-xs text-slate-400">7-Day Periodization</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentPlan.plan_title || 'Personalized Fitness Plan'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              {currentPlan.summary}
            </p>
          </div>

          {/* Action buttons (Print, Download, Save) */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Print Plan"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Download Plan"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                savedSuccess
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Plan Saved!' : 'Save Plan'}</span>
            </button>
          </div>
        </div>

        {/* User Biometrics Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Athlete</span>
            <span className="text-xs font-bold text-white truncate block">
              {user?.name || 'Athlete'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Age</span>
            <span className="text-xs font-bold text-white block">
              {user?.age ? `${user.age} yrs` : '28 yrs'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Weight</span>
            <span className="text-xs font-bold text-white block">
              {user?.weight ? `${user.weight} kg` : '72 kg'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Goal</span>
            <span className="text-xs font-bold text-emerald-400 block truncate">
              {user?.goal || 'Fitness'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Experience</span>
            <span className="text-xs font-bold text-cyan-400 block">
              {user?.experience || 'Intermediate'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Intensity</span>
            <span className="text-xs font-bold text-amber-400 block">
              {user?.intensity || 'Medium'}
            </span>
          </div>
        </div>

        {/* Version Switcher if an updated plan exists */}
        {updatedPlan && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Two versions available:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveVersion('updated')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeVersion === 'updated'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Updated AI Plan (Adapted)
              </button>
              <button
                onClick={() => setActiveVersion('original')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeVersion === 'original'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                Original Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Selector Bar */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Training Day:
          </span>
          <span className="text-xs text-emerald-400 font-semibold">
            {completedDays.length} / 7 Completed This Week
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isCompleted = completedDays.includes(day.day);
            const isRest = day.focus.toLowerCase().includes('rest') || day.focus.toLowerCase().includes('recovery');

            return (
              <button
                key={day.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`group relative p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Completed badge */}
                {isCompleted && (
                  <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 fill-slate-950" />
                  </div>
                )}

                <div className="text-[11px] font-bold uppercase tracking-wider block">
                  Day {day.day}
                </div>
                <div
                  className={`text-[10px] font-medium truncate mt-0.5 ${
                    isRest ? 'text-cyan-400' : isSelected ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {day.focus}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Full Card View (Required by Section 6:
          Each day should have:
          Workout Focus, Warm-up, Exercise cards, Sets, Reps/Duration, Rest, Cool-down, Recovery) */}
      {selectedDay && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Day Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                  DAY {selectedDay.day}
                </span>
                <span className="text-lg font-bold text-white">
                  {selectedDay.focus}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estimated Duration: {user?.available_time || '45-50 min'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleComplete(selectedDay.day)}
                disabled={completingDay === selectedDay.day}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  completedDays.includes(selectedDay.day)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02]'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${completedDays.includes(selectedDay.day) ? 'text-emerald-400' : 'text-slate-950'}`} />
                <span>
                  {completedDays.includes(selectedDay.day)
                    ? 'Workout Completed!'
                    : completingDay === selectedDay.day
                    ? 'Logging...'
                    : 'Mark Workout Complete'}
                </span>
              </button>
            </div>
          </div>

          {/* Warm-Up Section */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Dynamic Warm-Up (5-8 Mins)</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {selectedDay.warmup.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercises Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Core Training Circuit ({selectedDay.exercises.length} Exercises)</span>
              </h4>
              <span className="text-[11px] text-slate-500">Focus on strict form over ego weight</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {selectedDay.exercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/40 transition-all rounded-xl p-4 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                          {exIdx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          {ex.name}
                        </h5>
                      </div>
                    </div>

                    {ex.notes && (
                      <p className="text-[11px] text-slate-400 italic mb-3 pl-8">
                        "{ex.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Sets</span>
                        <span className="font-mono font-bold text-white">{ex.sets}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Reps / Time</span>
                        <span className="font-mono font-bold text-emerald-400">{ex.reps || ex.duration}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Rest</span>
                        <span className="font-mono font-semibold text-slate-300">{ex.rest}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cool-Down Section */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Cool-Down & Lengthening (5 Mins)</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {selectedDay.cooldown.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recovery Suggestion */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
            <Heart className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                Target Daily Recovery Protocol
              </h5>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedDay.recovery}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All 7 Days Overview cards for print / quick scan as required by Section 6 */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Full 7-Day Plan Overview</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {days.map((d) => {
            const isCompleted = completedDays.includes(d.day);
            return (
              <div
                key={d.day}
                className={`bg-slate-900/80 border rounded-xl p-4 transition-all ${
                  isCompleted ? 'border-emerald-500/40 bg-slate-900' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400">DAY {d.day}</span>
                  {isCompleted && (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Done
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-white mb-2">{d.focus}</h4>
                <div className="space-y-1 mb-3 text-xs text-slate-400">
                  <div className="truncate">
                    <strong>Ex:</strong> {d.exercises.map((e) => e.name).slice(0, 3).join(', ')}...
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    <strong>Rec:</strong> {d.recovery}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDayIndex(d.day - 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
