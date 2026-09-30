import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoadingModal } from './components/LoadingModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PlanViewer } from './components/PlanViewer';
import { NutritionCard } from './components/NutritionCard';
import { FeedbackSection } from './components/FeedbackSection';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { api, storage } from './services/api';
import { User, WorkoutPlanRecord, UserProgressSummary } from './types';
import { Dumbbell, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [activePlan, setActivePlan] = useState<WorkoutPlanRecord | null>(null);
  const [progress, setProgress] = useState<UserProgressSummary | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // UI state
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add Toast helper
  const addToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load: check local storage and verify token
  useEffect(() => {
    const cachedUser = storage.getUser();
    const cachedToken = storage.getToken();
    const cachedAdmin = storage.getAdminUser();

    if (cachedAdmin) {
      setAdminUser(cachedAdmin);
    }

    if (cachedUser && cachedToken) {
      setCurrentUser(cachedUser);
      loadUserData(cachedUser.user_id);
      setCurrentView('dashboard');
    }
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [planData, progressData] = await Promise.allSettled([
        api.getWorkoutPlan(userId),
        api.getProgress(userId),
      ]);

      if (planData.status === 'fulfilled') {
        setActivePlan(planData.value);
      } else {
        setActivePlan(null);
      }

      if (progressData.status === 'fulfilled') {
        setProgress(progressData.value);
        // Find completed days for current plan
        const completed = progressData.value.recent_logs
          .filter((l) => l.workout_completed === 1)
          .map((l) => l.day_number);
        setCompletedDays(Array.from(new Set(completed)));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Handle plan generated from onboarding
  const handlePlanGenerated = (user: User, planResponse: any) => {
    setCurrentUser(user);
    const newRecord: WorkoutPlanRecord = {
      id: planResponse.plan_id,
      user_id: user.user_id,
      user,
      original_plan: planResponse.plan,
      updated_plan: null,
      created_at: planResponse.created_at || new Date().toISOString(),
      updated_at: planResponse.created_at || new Date().toISOString(),
    };
    setActivePlan(newRecord);
    loadUserData(user.user_id);
    setCurrentView('plan');
    addToast('success', 'Your custom 7-day plan has been engineered by Gemini AI!', 'Plan Ready!');
  };

  // Handle User Login
  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.user_id);
    setCurrentView('dashboard');
    addToast('success', `Welcome back, ${user.name}!`, 'Logged In');
  };

  // Handle Admin Login
  const handleAdminLogin = (admin: any) => {
    setAdminUser(admin);
    setCurrentView('admin_dashboard');
    addToast('success', 'Admin session established with secure token.', 'Admin Access Granted');
  };

  // Logout Handlers
  const handleLogout = () => {
    storage.removeToken();
    storage.setUser(null);
    setCurrentUser(null);
    setActivePlan(null);
    setProgress(null);
    setCurrentView('landing');
    addToast('info', 'You have been signed out.');
  };

  const handleAdminLogout = () => {
    storage.removeAdminToken();
    storage.setAdminUser(null);
    setAdminUser(null);
    setCurrentView(currentUser ? 'dashboard' : 'landing');
    addToast('info', 'Admin logged out.');
  };

  // Mark workout complete
  const handleMarkComplete = async (dayNumber: number) => {
    if (!currentUser || !activePlan) return;
    try {
      await api.markWorkoutComplete(activePlan.id, currentUser.user_id, dayNumber);
      setCompletedDays((prev) => Array.from(new Set([...prev, dayNumber])));
      // Refresh progress summary
      const newProgress = await api.getProgress(currentUser.user_id);
      setProgress(newProgress);
      addToast('success', `Day ${dayNumber} completed! Great dedication to your fitness goals.`, 'Workout Logged! 🔥');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to log workout completion.');
    }
  };

  // Submit feedback to adapt plan
  const handleSubmitFeedback = async (feedback: string) => {
    if (!currentUser || !activePlan) return;
    setIsUpdatingPlan(true);

    try {
      const res = await api.updatePlan(currentUser.user_id, feedback, activePlan.id);
      setActivePlan((prev) =>
        prev
          ? {
              ...prev,
              updated_plan: res.updated_plan,
              latest_feedback: feedback,
              updated_at: res.updated_at,
            }
          : null
      );
      addToast('success', 'Gemini AI has re-calibrated your 7-day schedule based on your feedback!', 'Plan Adapted!');
    } catch (err: any) {
      console.error('Update error:', err);
      addToast('error', err.message || 'Could not adapt plan at this time.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        currentUser={currentUser}
        adminUser={adminUser}
        onLogout={handleLogout}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentView === 'landing' && (
          <LandingPage
            onStartOnboarding={() => setCurrentView('onboarding')}
            onLogin={() => setCurrentView('login')}
            onAdminLogin={() => setCurrentView('admin_login')}
          />
        )}

        {currentView === 'onboarding' && (
          <OnboardingPage
            onPlanGenerated={handlePlanGenerated}
            onCancel={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
            onSetLoading={setIsLoadingPlan}
          />
        )}

        {(currentView === 'login' || currentView === 'admin_login') && (
          <LoginPage
            isAdminPortal={currentView === 'admin_login'}
            onSuccessUser={handleUserLogin}
            onSuccessAdmin={handleAdminLogin}
            onSwitchToRegister={() => setCurrentView('onboarding')}
            onCancel={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <DashboardPage
            user={currentUser}
            workoutPlan={activePlan}
            progress={progress}
            onNavigate={(view) => setCurrentView(view)}
            onStartOnboarding={() => setCurrentView('onboarding')}
          />
        )}

        {currentView === 'plan' && currentUser && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {activePlan ? (
              <>
                {/* 7-Day Plan Viewer Component */}
                <PlanViewer
                  originalPlan={activePlan.original_plan}
                  updatedPlan={activePlan.updated_plan}
                  user={currentUser}
                  onMarkComplete={handleMarkComplete}
                  completedDays={completedDays}
                  onSaveNotification={() => addToast('success', 'Workout plan safely saved to your FitBuddy profile!')}
                />

                {/* AI Nutrition & Recovery Card */}
                <NutritionCard
                  plan={activePlan.updated_plan || activePlan.original_plan}
                  user={currentUser}
                />

                {/* Improve My Plan: Feedback Component */}
                <FeedbackSection
                  originalPlan={activePlan.original_plan}
                  updatedPlan={activePlan.updated_plan}
                  latestFeedback={activePlan.latest_feedback}
                  onSubmitFeedback={handleSubmitFeedback}
                  isUpdating={isUpdatingPlan}
                />
              </>
            ) : (
              <div className="max-w-md mx-auto text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <Dumbbell className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Workout Plan</h3>
                <p className="text-xs text-slate-400 mb-6">
                  You haven't generated a plan yet. Let Gemini tailor a routine for your biometrics!
                </p>
                <button
                  onClick={() => setCurrentView('onboarding')}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  Generate Plan Now
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'progress' && currentUser && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardPage
              user={currentUser}
              workoutPlan={activePlan}
              progress={progress}
              onNavigate={(view) => setCurrentView(view)}
              onStartOnboarding={() => setCurrentView('onboarding')}
            />
          </div>
        )}

        {currentView === 'history' && currentUser && (
          <HistoryPage
            user={currentUser}
            onSelectPlan={(plan) => {
              setActivePlan(plan);
              setCurrentView('plan');
            }}
          />
        )}

        {currentView === 'admin_dashboard' && adminUser && (
          <AdminDashboardPage
            adminUser={adminUser}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-white tracking-tight">FITBUDDY</span>
            <span>– Your AI-Powered Personal Fitness Companion</span>
          </div>

          <p className="text-[11px] text-slate-600">
            Powered by Google Gemini 3.8 Flash • SQLite Persistent Architecture • Production Grade
          </p>
        </div>
      </footer>

      {/* Global Loading Modal during Plan Generation */}
      <LoadingModal
        isOpen={isLoadingPlan}
        title="Creating your personalized FitBuddy plan..."
        subtitle="Gemini AI is analyzing your goals, biomechanics & weekly cadence."
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
