export interface User {
  id: number;
  user_id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  goal: string;
  experience: string;
  intensity: string;
  available_time?: string;
  preferred_days?: string;
  equipment?: string;
  dietary_preference?: string;
  is_admin: boolean;
  created_at: string;
}

export interface ExerciseItem {
  name: string;
  sets: number | string;
  reps: string;
  duration?: string | null;
  rest: string;
  notes?: string;
}

export interface DayWorkoutPlan {
  day: number;
  focus: string;
  warmup: string[];
  exercises: ExerciseItem[];
  cooldown: string[];
  recovery: string;
}

export interface CompleteFitnessPlan {
  plan_title: string;
  summary: string;
  weekly_plan: DayWorkoutPlan[];
  nutrition_tip: string;
  hydration_tip: string;
  general_recovery_tip: string;
  healthy_eating_guidance: string;
  disclaimer: string;
  feedback_applied?: string;
}

export interface WorkoutPlanRecord {
  id: number;
  user_id: string;
  user?: Partial<User>;
  original_plan: CompleteFitnessPlan;
  updated_plan: CompleteFitnessPlan | null;
  latest_feedback?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackRecord {
  id: number;
  user_id: string;
  workout_plan_id?: number;
  feedback: string;
  created_at: string;
}

export interface ProgressRecord {
  id: number;
  user_id: string;
  workout_plan_id?: number;
  day_number: number;
  workout_date: string;
  workout_completed: number;
  notes?: string;
  created_at: string;
}

export interface UserProgressSummary {
  user_id: string;
  completed_workouts: number;
  weekly_target: number;
  weekly_progress: number;
  streak_days: number;
  recent_logs: ProgressRecord[];
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_plans: number;
  updated_plans: number;
  completed_workouts: number;
  total_feedback: number;
}

export interface AdminUserListItem extends User {
  plan_count: number;
  updated_count: number;
  completed_count: number;
  feedback_count: number;
}
