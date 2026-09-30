import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDb, queryAll, queryOne, runQuery } from './server/db.js';
import {
  generateWorkoutPlanWithGemini,
  updateWorkoutPlanWithGemini,
  generateNutritionAdviceWithGemini,
  UserFitnessProfile,
} from './server/gemini.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fitbuddy-super-secret-jwt-key-2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Dedicated API Router
const api = express.Router();

// Authentication Middlewares
interface AuthRequest extends Request {
  user?: any;
}

function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  verifyToken(req, res, () => {
    if (req.user && req.user.is_admin) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  });
}

// Seed default Admin user on startup if not present
async function seedDefaultData() {
  await getDb();
  const existingAdmin = await queryOne('SELECT * FROM users WHERE is_admin = 1');
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('FitBuddyAdmin2026!', 10);
    const now = new Date().toISOString();
    await runQuery(
      `INSERT INTO users (user_id, name, email, password_hash, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference, is_admin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        'admin',
        'FitBuddy Head Coach',
        'admin@fitbuddy.ai',
        adminPasswordHash,
        32,
        78,
        'Strength',
        'Advanced',
        'High',
        '60 minutes',
        '5 days/week',
        'Full Gym',
        'High Protein',
        now,
      ]
    );
    console.log('Seeded default admin user: admin@fitbuddy.ai (password: FitBuddyAdmin2026!)');
  }

  // Seed sample demo user if no regular users exist
  const existingUsers = await queryAll('SELECT * FROM users WHERE is_admin = 0');
  if (existingUsers.length === 0) {
    const demoPasswordHash = await bcrypt.hash('password123', 10);
    const now = new Date().toISOString();
    await runQuery(
      `INSERT INTO users (user_id, name, email, password_hash, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference, is_admin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        'alex_fit',
        'Alex Morgan',
        'alex@fitbuddy.demo',
        demoPasswordHash,
        28,
        72.5,
        'Muscle Gain',
        'Intermediate',
        'Medium',
        '45 minutes',
        'Mon, Wed, Fri, Sat',
        'Dumbbells & Pull-up Bar',
        'High Protein',
        now,
      ]
    );

    // Seed sample initial plan
    const sampleProfile: UserFitnessProfile = {
      name: 'Alex Morgan',
      age: 28,
      weight: 72.5,
      goal: 'Muscle Gain',
      experience: 'Intermediate',
      intensity: 'Medium',
      available_time: '45 minutes',
      preferred_days: 'Mon, Wed, Fri, Sat',
      equipment: 'Dumbbells & Pull-up Bar',
      dietary_preference: 'High Protein',
    };
    const samplePlan = await generateWorkoutPlanWithGemini(sampleProfile);
    await runQuery(
      `INSERT INTO workout_plans (user_id, original_plan, updated_plan, created_at, updated_at)
       VALUES (?, ?, null, ?, ?)`,
      ['alex_fit', JSON.stringify(samplePlan), now, now]
    );

    // Seed sample progress
    await runQuery(
      `INSERT INTO progress (user_id, workout_plan_id, day_number, workout_date, workout_completed, notes, created_at)
       VALUES (?, 1, 1, ?, 1, ?, ?)`,
      ['alex_fit', new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), 'Felt strong, solid dumbbell presses.', now]
    );
    await runQuery(
      `INSERT INTO progress (user_id, workout_plan_id, day_number, workout_date, workout_completed, notes, created_at)
       VALUES (?, 1, 2, ?, 1, ?, ?)`,
      ['alex_fit', new Date(Date.now() - 86400000).toISOString().slice(0, 10), 'Good quad pump on split squats.', now]
    );
  }
}

// API Routes Mounted on api router

// Health check
api.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'FitBuddy – AI Fitness Plan Generator',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// POST /api/register
api.post('/register', async (req, res) => {
  try {
    const {
      user_id,
      name,
      email,
      password,
      age,
      weight,
      goal,
      experience,
      intensity,
      available_time,
      preferred_days,
      equipment,
      dietary_preference,
      is_admin,
    } = req.body;

    if (!name || !email || !password || !age || !weight || !goal || !experience || !intensity) {
      return res.status(400).json({ error: 'Please provide all required profile fields.' });
    }

    const cleanUserId = (user_id || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    // Check duplicate
    const existing = await queryOne('SELECT * FROM users WHERE email = ? OR user_id = ?', [email.toLowerCase(), cleanUserId]);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email or User ID already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO users (user_id, name, email, password_hash, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference, is_admin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanUserId,
        name.trim(),
        email.toLowerCase().trim(),
        password_hash,
        Number(age),
        Number(weight),
        goal,
        experience,
        intensity,
        available_time || '45 minutes',
        preferred_days || '4 days/week',
        equipment || 'Full Gym',
        dietary_preference || 'Balanced',
        is_admin ? 1 : 0,
        now,
      ]
    );

    const user = await queryOne('SELECT id, user_id, name, email, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference, is_admin, created_at FROM users WHERE user_id = ?', [cleanUserId]);
    const token = jwt.sign({ id: user.id, user_id: user.user_id, email: user.email, is_admin: !!user.is_admin }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token, message: 'Account registered successfully!' });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// POST /api/login
api.post('/login', async (req, res) => {
  try {
    const { email_or_user_id, password } = req.body;
    if (!email_or_user_id || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password.' });
    }

    const cleanInput = email_or_user_id.trim().toLowerCase();
    const user = await queryOne(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(user_id) = ?',
      [cleanInput, cleanInput]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, email: user.email, is_admin: !!user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      age: user.age,
      weight: user.weight,
      goal: user.goal,
      experience: user.experience,
      intensity: user.intensity,
      available_time: user.available_time,
      preferred_days: user.preferred_days,
      equipment: user.equipment,
      dietary_preference: user.dietary_preference,
      is_admin: !!user.is_admin,
      created_at: user.created_at,
    };

    res.json({ user: safeUser, token, message: 'Login successful' });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/admin/login
api.post('/admin/login', async (req, res) => {
  try {
    const { email_or_username, password } = req.body;
    if (!email_or_username || !password) {
      return res.status(400).json({ error: 'Please enter admin username/email and password.' });
    }

    const cleanInput = email_or_username.trim().toLowerCase();
    const user = await queryOne(
      'SELECT * FROM users WHERE (LOWER(email) = ? OR LOWER(user_id) = ?) AND is_admin = 1',
      [cleanInput, cleanInput]
    );

    if (!user) {
      return res.status(401).json({ error: 'Access denied: Admin credentials not recognized.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Access denied: Incorrect admin password.' });
    }

    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, email: user.email, is_admin: true },
      JWT_SECRET,
      { expiresIn: '2d' }
    );

    const safeUser = {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      is_admin: true,
    };

    res.json({ admin: safeUser, token, message: 'Admin authentication verified.' });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during admin authentication.' });
  }
});

// GET /api/me
api.get('/me', verifyToken, async (req: AuthRequest, res) => {
  try {
    const user = await queryOne(
      'SELECT id, user_id, name, email, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference, is_admin, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// POST /api/generate-workout
api.post('/generate-workout', async (req, res) => {
  try {
    const { user_id, profile } = req.body;

    let targetProfile: UserFitnessProfile;
    let targetUserId = user_id;

    if (user_id) {
      const user = await queryOne('SELECT * FROM users WHERE user_id = ?', [user_id]);
      if (user) {
        targetProfile = {
          name: user.name,
          age: user.age,
          weight: user.weight,
          goal: user.goal,
          experience: user.experience,
          intensity: user.intensity,
          available_time: user.available_time,
          preferred_days: user.preferred_days,
          equipment: user.equipment,
          dietary_preference: user.dietary_preference,
        };
      } else if (profile) {
        targetProfile = profile;
      } else {
        return res.status(404).json({ error: 'User not found and no profile provided.' });
      }
    } else if (profile) {
      targetProfile = profile;
      targetUserId = profile.user_id || 'guest_' + Date.now();
    } else {
      return res.status(400).json({ error: 'User ID or profile details required.' });
    }

    const plan = await generateWorkoutPlanWithGemini(targetProfile);
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO workout_plans (user_id, original_plan, updated_plan, created_at, updated_at)
       VALUES (?, ?, null, ?, ?)`,
      [targetUserId, JSON.stringify(plan), now, now]
    );

    const createdRecord = await queryOne(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [targetUserId]
    );

    res.json({
      plan_id: createdRecord.id,
      user_id: targetUserId,
      plan,
      created_at: now,
      message: '7-Day AI Workout Plan generated successfully!',
    });
  } catch (err: any) {
    console.error('Generate workout error:', err);
    res.status(500).json({
      error: "We couldn't generate your plan right now. Please try again.",
    });
  }
});

// POST /api/generate-nutrition
api.post('/generate-nutrition', async (req, res) => {
  try {
    const { user_id, profile } = req.body;
    let targetProfile: UserFitnessProfile;

    if (user_id) {
      const user = await queryOne('SELECT * FROM users WHERE user_id = ?', [user_id]);
      if (user) {
        targetProfile = {
          name: user.name,
          age: user.age,
          weight: user.weight,
          goal: user.goal,
          experience: user.experience,
          intensity: user.intensity,
          available_time: user.available_time,
          preferred_days: user.preferred_days,
          equipment: user.equipment,
          dietary_preference: user.dietary_preference,
        };
      } else if (profile) {
        targetProfile = profile;
      } else {
        return res.status(404).json({ error: 'User not found.' });
      }
    } else if (profile) {
      targetProfile = profile;
    } else {
      return res.status(400).json({ error: 'Profile required.' });
    }

    const nutrition = await generateNutritionAdviceWithGemini(targetProfile);
    res.json(nutrition);
  } catch (err: any) {
    console.error('Nutrition generation error:', err);
    res.status(500).json({ error: 'Failed to generate nutrition advice.' });
  }
});

// POST /api/submit-feedback
api.post('/submit-feedback', async (req, res) => {
  try {
    const { user_id, workout_plan_id, feedback } = req.body;
    if (!user_id || !feedback) {
      return res.status(400).json({ error: 'user_id and feedback are required.' });
    }
    const now = new Date().toISOString();
    await runQuery(
      `INSERT INTO feedback (user_id, workout_plan_id, feedback, created_at)
       VALUES (?, ?, ?, ?)`,
      [user_id, workout_plan_id || null, feedback.trim(), now]
    );

    res.json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (err: any) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// POST /api/update-plan/:user_id
api.post('/update-plan/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { feedback, workout_plan_id } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ error: 'Feedback message is required.' });
    }

    const user = await queryOne('SELECT * FROM users WHERE user_id = ?', [user_id]);
    const profile: UserFitnessProfile = user
      ? {
          name: user.name,
          age: user.age,
          weight: user.weight,
          goal: user.goal,
          experience: user.experience,
          intensity: user.intensity,
          available_time: user.available_time,
          preferred_days: user.preferred_days,
          equipment: user.equipment,
          dietary_preference: user.dietary_preference,
        }
      : {
          name: 'Athlete',
          age: 30,
          weight: 70,
          goal: 'General Wellness',
          experience: 'Intermediate',
          intensity: 'Medium',
        };

    // Find the workout plan to update
    let planRow = null;
    if (workout_plan_id) {
      planRow = await queryOne('SELECT * FROM workout_plans WHERE id = ? AND user_id = ?', [workout_plan_id, user_id]);
    }
    if (!planRow) {
      planRow = await queryOne('SELECT * FROM workout_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user_id]);
    }

    if (!planRow) {
      return res.status(404).json({ error: 'No workout plan found for this user to improve.' });
    }

    const originalPlan = JSON.parse(planRow.original_plan);

    // Save feedback log
    const now = new Date().toISOString();
    await runQuery(
      `INSERT INTO feedback (user_id, workout_plan_id, feedback, created_at)
       VALUES (?, ?, ?, ?)`,
      [user_id, planRow.id, feedback.trim(), now]
    );

    // Generate updated plan using Gemini, strictly preserving original_plan
    const updatedPlan = await updateWorkoutPlanWithGemini(originalPlan, profile, feedback.trim());

    // Update the record with updated_plan without touching original_plan
    await runQuery(
      `UPDATE workout_plans SET updated_plan = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(updatedPlan), now, planRow.id]
    );

    res.json({
      plan_id: planRow.id,
      user_id,
      original_plan: originalPlan,
      user_feedback: feedback.trim(),
      updated_plan: updatedPlan,
      updated_at: now,
      message: 'Plan successfully adapted by FitBuddy AI!',
    });
  } catch (err: any) {
    console.error('Update plan error:', err);
    res.status(500).json({ error: "We couldn't adapt your plan right now. Please try again." });
  }
});

// GET /api/workout/:user_id
api.get('/workout/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const planRow = await queryOne(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user_id]
    );

    if (!planRow) {
      return res.status(404).json({ error: 'No workout plan found for this user.' });
    }

    const user = await queryOne(
      'SELECT id, user_id, name, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference FROM users WHERE user_id = ?',
      [user_id]
    );

    const latestFeedback = await queryOne(
      'SELECT * FROM feedback WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user_id]
    );

    res.json({
      id: planRow.id,
      user_id: planRow.user_id,
      user,
      original_plan: JSON.parse(planRow.original_plan),
      updated_plan: planRow.updated_plan ? JSON.parse(planRow.updated_plan) : null,
      latest_feedback: latestFeedback ? latestFeedback.feedback : null,
      created_at: planRow.created_at,
      updated_at: planRow.updated_at,
    });
  } catch (err: any) {
    console.error('Get workout error:', err);
    res.status(500).json({ error: 'Failed to fetch workout plan.' });
  }
});

// GET /api/history/:user_id
api.get('/history/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const plans = await queryAll('SELECT * FROM workout_plans WHERE user_id = ? ORDER BY id DESC', [user_id]);
    const feedbackList = await queryAll('SELECT * FROM feedback WHERE user_id = ? ORDER BY id DESC', [user_id]);
    const progressList = await queryAll('SELECT * FROM progress WHERE user_id = ? ORDER BY id DESC', [user_id]);

    const formattedPlans = plans.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      original_plan: JSON.parse(p.original_plan),
      updated_plan: p.updated_plan ? JSON.parse(p.updated_plan) : null,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    res.json({
      user_id,
      total_plans: plans.length,
      plans: formattedPlans,
      feedback: feedbackList,
      progress: progressList,
    });
  } catch (err: any) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch user history.' });
  }
});

// GET /api/progress/:user_id
api.get('/progress/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const progressRecords = await queryAll(
      'SELECT * FROM progress WHERE user_id = ? ORDER BY workout_date DESC',
      [user_id]
    );

    // Calculate completed count and streak
    const completedCount = progressRecords.filter((p) => p.workout_completed === 1).length;

    // Calculate streak
    const uniqueDates = Array.from(new Set(progressRecords.map((p) => p.workout_date))).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (uniqueDates.length > 0) {
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        let currentDate = new Date(uniqueDates[0]);
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      user_id,
      completed_workouts: completedCount,
      weekly_target: 7,
      weekly_progress: Math.min(completedCount % 7 || (completedCount > 0 ? 7 : 0), 7),
      streak_days: streak,
      recent_logs: progressRecords.slice(0, 15),
    });
  } catch (err: any) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to retrieve progress.' });
  }
});

// POST /api/progress/:user_id
api.post('/progress/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { workout_plan_id, day_number, workout_completed, notes, workout_date } = req.body;
    const dateStr = workout_date || new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO progress (user_id, workout_plan_id, day_number, workout_date, workout_completed, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, workout_plan_id || null, day_number || 1, dateStr, workout_completed !== undefined ? (workout_completed ? 1 : 0) : 1, notes || '', now]
    );

    res.json({ success: true, message: 'Workout progress logged!' });
  } catch (err: any) {
    console.error('Log progress error:', err);
    res.status(500).json({ error: 'Failed to log progress.' });
  }
});

// POST /api/workout/:workout_id/complete
api.post('/workout/:workout_id/complete', async (req, res) => {
  try {
    const { workout_id } = req.params;
    const { user_id, day_number, notes } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO progress (user_id, workout_plan_id, day_number, workout_date, workout_completed, notes, created_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [user_id, Number(workout_id), Number(day_number) || 1, today, notes || `Day ${day_number || 1} completed!`, now]
    );

    res.json({
      success: true,
      message: `Day ${day_number || 1} marked as complete! Great work!`,
      completed_at: now,
    });
  } catch (err: any) {
    console.error('Complete workout error:', err);
    res.status(500).json({ error: 'Failed to mark workout complete.' });
  }
});

// ADMIN ROUTES

// GET /api/admin/stats
api.get('/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const users = await queryAll('SELECT id, user_id FROM users WHERE is_admin = 0');
    const plans = await queryAll('SELECT id, updated_plan FROM workout_plans');
    const completedProgress = await queryAll('SELECT id FROM progress WHERE workout_completed = 1');
    const feedbacks = await queryAll('SELECT id FROM feedback');

    const totalUsers = users.length;
    const totalPlans = plans.length;
    const updatedPlans = plans.filter((p) => !!p.updated_plan).length;
    const completedWorkouts = completedProgress.length;
    const totalFeedback = feedbacks.length;

    res.json({
      total_users: totalUsers,
      active_users: totalUsers,
      total_plans: totalPlans,
      updated_plans: updatedPlans,
      completed_workouts: completedWorkouts,
      total_feedback: totalFeedback,
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// GET /api/admin/users
api.get('/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { search, goal, intensity, sort } = req.query;

    let query = `
      SELECT u.id, u.user_id, u.name, u.email, u.age, u.weight, u.goal, u.experience, u.intensity, u.available_time, u.preferred_days, u.equipment, u.dietary_preference, u.created_at,
             (SELECT COUNT(*) FROM workout_plans wp WHERE wp.user_id = u.user_id) as plan_count,
             (SELECT COUNT(*) FROM workout_plans wp WHERE wp.user_id = u.user_id AND wp.updated_plan IS NOT NULL) as updated_count,
             (SELECT COUNT(*) FROM progress pr WHERE pr.user_id = u.user_id AND pr.workout_completed = 1) as completed_count,
             (SELECT COUNT(*) FROM feedback fb WHERE fb.user_id = u.user_id) as feedback_count
      FROM users u
      WHERE u.is_admin = 0
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.user_id) LIKE ? OR LOWER(u.email) LIKE ?)`;
      const term = `%${String(search).toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (goal && goal !== 'all') {
      query += ` AND u.goal = ?`;
      params.push(goal);
    }

    if (intensity && intensity !== 'all') {
      query += ` AND u.intensity = ?`;
      params.push(intensity);
    }

    if (sort === 'name') {
      query += ` ORDER BY u.name ASC`;
    } else if (sort === 'completed') {
      query += ` ORDER BY completed_count DESC`;
    } else if (sort === 'plans') {
      query += ` ORDER BY plan_count DESC`;
    } else {
      query += ` ORDER BY u.created_at DESC`;
    }

    const users = await queryAll(query, params);
    res.json({ users });
  } catch (err: any) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// GET /api/admin/users/:user_id
api.get('/admin/users/:user_id', verifyAdmin, async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await queryOne(
      'SELECT id, user_id, name, email, age, weight, goal, experience, intensity, available_time, preferred_days, equipment, dietary_preference, created_at FROM users WHERE user_id = ?',
      [user_id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plans = await queryAll(
      'SELECT id, user_id, original_plan, updated_plan, created_at, updated_at FROM workout_plans WHERE user_id = ? ORDER BY id DESC',
      [user_id]
    );
    const parsedPlans = plans.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      original_plan: JSON.parse(p.original_plan),
      updated_plan: p.updated_plan ? JSON.parse(p.updated_plan) : null,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    const feedback = await queryAll('SELECT * FROM feedback WHERE user_id = ? ORDER BY id DESC', [user_id]);
    const progress = await queryAll('SELECT * FROM progress WHERE user_id = ? ORDER BY id DESC', [user_id]);

    res.json({
      user,
      plans: parsedPlans,
      feedback,
      progress,
    });
  } catch (err: any) {
    console.error('Admin get user error:', err);
    res.status(500).json({ error: 'Failed to retrieve detailed user profile.' });
  }
});

// DELETE /api/admin/users/:user_id
api.delete('/admin/users/:user_id', verifyAdmin, async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await queryOne('SELECT * FROM users WHERE user_id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.is_admin) {
      return res.status(400).json({ error: 'Cannot delete an administrator account.' });
    }

    await runQuery('DELETE FROM progress WHERE user_id = ?', [user_id]);
    await runQuery('DELETE FROM feedback WHERE user_id = ?', [user_id]);
    await runQuery('DELETE FROM workout_plans WHERE user_id = ?', [user_id]);
    await runQuery('DELETE FROM users WHERE user_id = ?', [user_id]);

    res.json({ success: true, message: `User ${user_id} and all associated records deleted successfully.` });
  } catch (err: any) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Mount /api routes strictly before any frontend/Vite middlewares
app.use('/api', api);

// Setup Vite or static serving for non-API routes
async function startServer() {
  await seedDefaultData();

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FitBuddy server:', err);
});
