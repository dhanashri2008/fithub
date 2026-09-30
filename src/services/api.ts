import {
  User,
  CompleteFitnessPlan,
  WorkoutPlanRecord,
  UserProgressSummary,
  AdminStats,
  AdminUserListItem,
} from '../types';

const TOKEN_KEY = 'fitbuddy_auth_token';
const USER_KEY = 'fitbuddy_user';
const ADMIN_TOKEN_KEY = 'fitbuddy_admin_token';
const ADMIN_USER_KEY = 'fitbuddy_admin_user';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User | null) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },

  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  removeAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),

  getAdminUser: (): any | null => {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setAdminUser: (admin: any | null) => {
    if (admin) localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    else localStorage.removeItem(ADMIN_USER_KEY);
  },

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};

async function request<T>(
  url: string,
  options: RequestInit = {},
  useAdminAuth = false
): Promise<T> {
  const token = useAdminAuth ? storage.getAdminToken() : storage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Check health
  async checkHealth() {
    return request<{ status: string; geminiConfigured: boolean }>('/api/health');
  },

  // Auth
  async register(profileData: any): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    storage.setToken(res.token);
    storage.setUser(res.user);
    return res;
  },

  async login(credentials: { email_or_user_id: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    storage.setToken(res.token);
    storage.setUser(res.user);
    return res;
  },

  async adminLogin(credentials: { email_or_username: string; password: string }): Promise<{ admin: any; token: string }> {
    const res = await request<{ admin: any; token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    storage.setAdminToken(res.token);
    storage.setAdminUser(res.admin);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/me');
  },

  // Workout Generation
  async generateWorkout(params: { user_id?: string; profile?: any }): Promise<{
    plan_id: number;
    user_id: string;
    plan: CompleteFitnessPlan;
    created_at: string;
  }> {
    return request('/api/generate-workout', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async generateNutrition(params: { user_id?: string; profile?: any }) {
    return request<any>('/api/generate-nutrition', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Feedback & Plan Adaptation
  async submitFeedback(user_id: string, feedback: string, workout_plan_id?: number) {
    return request('/api/submit-feedback', {
      method: 'POST',
      body: JSON.stringify({ user_id, feedback, workout_plan_id }),
    });
  },

  async updatePlan(user_id: string, feedback: string, workout_plan_id?: number): Promise<{
    plan_id: number;
    user_id: string;
    original_plan: CompleteFitnessPlan;
    user_feedback: string;
    updated_plan: CompleteFitnessPlan;
    updated_at: string;
    message: string;
  }> {
    return request(`/api/update-plan/${encodeURIComponent(user_id)}`, {
      method: 'POST',
      body: JSON.stringify({ feedback, workout_plan_id }),
    });
  },

  // Retrieval
  async getWorkoutPlan(user_id: string): Promise<WorkoutPlanRecord> {
    return request(`/api/workout/${encodeURIComponent(user_id)}`);
  },

  async getHistory(user_id: string): Promise<{
    user_id: string;
    total_plans: number;
    plans: WorkoutPlanRecord[];
    feedback: any[];
    progress: any[];
  }> {
    return request(`/api/history/${encodeURIComponent(user_id)}`);
  },

  // Progress
  async getProgress(user_id: string): Promise<UserProgressSummary> {
    return request(`/api/progress/${encodeURIComponent(user_id)}`);
  },

  async logProgress(user_id: string, data: { day_number: number; workout_plan_id?: number; notes?: string }) {
    return request(`/api/progress/${encodeURIComponent(user_id)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markWorkoutComplete(workout_id: number, user_id: string, day_number: number, notes?: string) {
    return request(`/api/workout/${workout_id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ user_id, day_number, notes }),
    });
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    return request('/api/admin/stats', {}, true);
  },

  async getAdminUsers(params: { search?: string; goal?: string; intensity?: string; sort?: string } = {}): Promise<{
    users: AdminUserListItem[];
  }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.goal) query.append('goal', params.goal);
    if (params.intensity) query.append('intensity', params.intensity);
    if (params.sort) query.append('sort', params.sort);
    return request(`/api/admin/users?${query.toString()}`, {}, true);
  },

  async getAdminUserDetail(user_id: string): Promise<{
    user: User;
    plans: WorkoutPlanRecord[];
    feedback: any[];
    progress: any[];
  }> {
    return request(`/api/admin/users/${encodeURIComponent(user_id)}`, {}, true);
  },

  async deleteUser(user_id: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/admin/users/${encodeURIComponent(user_id)}`, {
      method: 'DELETE',
    }, true);
  },
};
