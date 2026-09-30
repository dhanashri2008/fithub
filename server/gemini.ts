import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with server-side environment key
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export interface UserFitnessProfile {
  name: string;
  age: number;
  weight: number;
  goal: string;
  experience: string;
  intensity: string;
  available_time?: string;
  preferred_days?: string;
  equipment?: string;
  dietary_preference?: string;
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
  focus: string; // e.g., 'Full Body', 'Upper Body', 'Lower Body', 'Cardio', 'Core', 'Strength', 'Flexibility', 'Recovery', 'Rest Day'
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

const DEFAULT_DISCLAIMER =
  'FitBuddy provides general wellness information and is not a replacement for professional medical, nutrition, or fitness advice. Consult a healthcare provider before beginning any new exercise routine.';

export async function generateWorkoutPlanWithGemini(
  profile: UserFitnessProfile
): Promise<CompleteFitnessPlan> {
  const ai = getGeminiClient();

  const prompt = `You are FitBuddy's Senior Exercise Physiologist & Certified Sports Nutritionist.
Create a personalized, scientifically sound, safe, and progressive 7-day fitness plan and nutrition/recovery guidance for this user:

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age} years old
- Weight: ${profile.weight} kg
- Primary Fitness Goal: ${profile.goal}
- Experience Level: ${profile.experience} (Beginner / Intermediate / Advanced)
- Desired Workout Intensity: ${profile.intensity} (Low / Medium / High)
- Available Workout Time: ${profile.available_time || '45 minutes'}
- Preferred Workout Days: ${profile.preferred_days || '4-5 days/week'}
- Equipment Available: ${profile.equipment || 'Full Gym'}
- Dietary Preference: ${profile.dietary_preference || 'Balanced'}

REQUIREMENTS:
1. Generate exactly 7 days (Day 1 through Day 7).
2. For each day, include:
   - day: number (1 to 7)
   - focus: e.g., "Full Body", "Upper Body Strength", "Lower Body & Core", "Cardio & Stamina", "Active Recovery", "Rest Day", "Mobility & Flexibility".
   - warmup: 2-3 specific warm-up movements with duration/reps.
   - exercises: Array of 4-6 exercises with 'name', 'sets' (number), 'reps' (e.g. "8-10 reps" or "30 sec"), 'duration' (or null), 'rest' (e.g. "60s" or "90s"), and 'notes' (form/coaching cue). If it's a Rest Day, provide 1-2 light active recovery stretches or walk.
   - cooldown: 2-3 specific cool-down movements.
   - recovery: Specific recovery suggestion for that day (e.g., foam rolling, sleep focus, contrast shower, hydration).
3. Nutrition & Recovery:
   - nutrition_tip: Tailored to their goal of ${profile.goal} and dietary preference ${profile.dietary_preference || 'Balanced'}.
   - hydration_tip: Daily water intake guideline based on their ${profile.weight}kg body weight.
   - general_recovery_tip: Sleep and rest optimization.
   - healthy_eating_guidance: Wholesome, non-restrictive macronutrient advice.
4. SAFETY & ETHICS:
   - Avoid extreme calorie restriction, starvation, crash diets, unsafe supplements, or dangerous exercise challenges.
   - No medical diagnoses or treatment claims.
   - Ensure routines match their experience (${profile.experience}) and available equipment (${profile.equipment || 'Full Gym'}).

RETURN STRICTLY JSON conforming to this schema without markdown code fences if possible or with valid JSON:
{
  "plan_title": "string",
  "summary": "string",
  "weekly_plan": [
    {
      "day": 1,
      "focus": "string",
      "warmup": ["string"],
      "exercises": [
        {
          "name": "string",
          "sets": 3,
          "reps": "string",
          "duration": "string or null",
          "rest": "string",
          "notes": "string"
        }
      ],
      "cooldown": ["string"],
      "recovery": "string"
    }
  ],
  "nutrition_tip": "string",
  "hydration_tip": "string",
  "general_recovery_tip": "string",
  "healthy_eating_guidance": "string",
  "disclaimer": "${DEFAULT_DISCLAIMER}"
}`;

  if (!ai) {
    console.warn('GEMINI_API_KEY not configured or empty, using tailored algorithmic fitness plan generator fallback.');
    return generateLocalFallbackPlan(profile);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '';
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanedText) as CompleteFitnessPlan;
    if (!parsed.disclaimer) {
      parsed.disclaimer = DEFAULT_DISCLAIMER;
    }
    return parsed;
  } catch (err) {
    console.error('Gemini generation failed:', err);
    // If Gemini fails or times out, provide our rich adaptive fallback generator rather than failing user
    return generateLocalFallbackPlan(profile);
  }
}

export async function updateWorkoutPlanWithGemini(
  originalPlan: CompleteFitnessPlan,
  profile: UserFitnessProfile,
  feedback: string
): Promise<CompleteFitnessPlan> {
  const ai = getGeminiClient();

  const prompt = `You are FitBuddy's Senior Exercise Physiologist.
A user has received an original 7-day fitness plan and provided specific feedback to refine and adapt it.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Weight: ${profile.weight} kg
- Goal: ${profile.goal}
- Experience: ${profile.experience}
- Intensity: ${profile.intensity}
- Equipment: ${profile.equipment || 'Standard'}

USER'S FEEDBACK:
"${feedback}"

ORIGINAL WORKOUT PLAN SUMMARY:
${JSON.stringify(originalPlan.weekly_plan, null, 2)}

TASK:
Adapt the 7-day workout plan directly addressing the user's feedback (e.g. "${feedback}").
If they requested "more cardio", incorporate dynamic cardiovascular conditioning intervals.
If they asked to "make it easier", reduce sets, increase rest periods, or suggest lower impact regressions.
If they have "less time", optimize for supersets/efficient high-yield movements under 30 minutes.
If they have "no equipment", adapt all exercises to calisthenics/bodyweight movements.
If they asked for "more rest days", adjust the schedule to include additional recovery days.

REQUIREMENTS:
- Return the full updated 7-day plan with all 7 days.
- In 'summary', clearly describe what changed from the original plan in response to their feedback.
- Set 'feedback_applied' to "${feedback}".
- Retain safe, progressive, balanced guidance.

RETURN STRICTLY JSON matching this schema:
{
  "plan_title": "string (e.g., Adapted Plan: [Focus])",
  "summary": "Detailed explanation of changes made according to user feedback",
  "feedback_applied": "${feedback}",
  "weekly_plan": [
    {
      "day": 1,
      "focus": "string",
      "warmup": ["string"],
      "exercises": [
        {
          "name": "string",
          "sets": 3,
          "reps": "string",
          "duration": "string or null",
          "rest": "string",
          "notes": "string"
        }
      ],
      "cooldown": ["string"],
      "recovery": "string"
    }
  ],
  "nutrition_tip": "string",
  "hydration_tip": "string",
  "general_recovery_tip": "string",
  "healthy_eating_guidance": "string",
  "disclaimer": "${DEFAULT_DISCLAIMER}"
}`;

  if (!ai) {
    return generateLocalUpdatedFallbackPlan(originalPlan, profile, feedback);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '';
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanedText) as CompleteFitnessPlan;
    parsed.feedback_applied = feedback;
    if (!parsed.disclaimer) {
      parsed.disclaimer = DEFAULT_DISCLAIMER;
    }
    return parsed;
  } catch (err) {
    console.error('Gemini plan update failed:', err);
    return generateLocalUpdatedFallbackPlan(originalPlan, profile, feedback);
  }
}

export async function generateNutritionAdviceWithGemini(
  profile: UserFitnessProfile
): Promise<{
  nutrition_tip: string;
  hydration_tip: string;
  general_recovery_tip: string;
  healthy_eating_guidance: string;
  macro_breakdown: { protein: string; carbs: string; healthy_fats: string };
  disclaimer: string;
}> {
  const ai = getGeminiClient();

  const prompt = `As a Sports Nutritionist, provide a personalized nutrition and recovery recommendation for:
- Name: ${profile.name}
- Goal: ${profile.goal}
- Weight: ${profile.weight} kg
- Intensity: ${profile.intensity}
- Dietary Preference: ${profile.dietary_preference || 'Balanced'}

Provide evidence-based, safe nutrition advice. Avoid restrictive crash diets, dangerous supplements, or medical claims.
Include:
- nutrition_tip
- hydration_tip
- general_recovery_tip
- healthy_eating_guidance
- macro_breakdown (approximate % protein, carbs, healthy_fats)
- disclaimer ("FitBuddy provides general wellness information and is not a replacement for professional medical, nutrition, or fitness advice.")

Return JSON:
{
  "nutrition_tip": "...",
  "hydration_tip": "...",
  "general_recovery_tip": "...",
  "healthy_eating_guidance": "...",
  "macro_breakdown": {
    "protein": "30%",
    "carbs": "45%",
    "healthy_fats": "25%"
  },
  "disclaimer": "${DEFAULT_DISCLAIMER}"
}`;

  if (!ai) {
    return {
      nutrition_tip: `For ${profile.goal}, prioritize whole lean proteins (~1.6g-2.0g per kg of body weight = ~${Math.round(profile.weight * 1.8)}g daily), complex carbohydrates around workouts, and micronutrient-dense leafy greens.`,
      hydration_tip: `Aim for approximately ${Math.max(2.5, Math.round(profile.weight * 0.035 * 10) / 10)} liters of water daily, adding an extra 500ml on ${profile.intensity} intensity workout days.`,
      general_recovery_tip: `Prioritize 7.5 to 9 hours of restorative sleep. Magnesium-rich foods and evening mobility work will significantly accelerate muscular repair.`,
      healthy_eating_guidance: `Follow an 80/20 lifestyle: 80% whole nutrient-dense foods (poultry, fish, tofu, quinoa, oats, berries, olive oil) and 20% mindful flexibility to maintain consistency.`,
      macro_breakdown: {
        protein: profile.goal === 'Muscle Gain' ? '30%' : profile.goal === 'Weight Loss' ? '35%' : '25%',
        carbs: profile.goal === 'Muscle Gain' ? '45%' : profile.goal === 'Weight Loss' ? '35%' : '45%',
        healthy_fats: profile.goal === 'Weight Loss' ? '30%' : '25%',
      },
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.disclaimer) parsed.disclaimer = DEFAULT_DISCLAIMER;
    return parsed;
  } catch (err) {
    console.error('Gemini nutrition advice error:', err);
    return {
      nutrition_tip: `Target nutrient timing: consume a balanced protein and carbohydrate meal within 90 minutes post-training to replenish glycogen and trigger muscle protein synthesis.`,
      hydration_tip: `Consume at least ${Math.round(profile.weight * 0.035)}L of water daily.`,
      general_recovery_tip: `Schedule at least 1-2 complete rest or active recovery days every week to avoid overtraining syndrome.`,
      healthy_eating_guidance: `Emphasize fiber-rich produce, lean protein sources, and healthy fats while limiting ultra-processed sugars.`,
      macro_breakdown: { protein: '30%', carbs: '45%', healthy_fats: '25%' },
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }
}

// High-fidelity fallback generators ensuring immediate reliable functionality
function generateLocalFallbackPlan(profile: UserFitnessProfile): CompleteFitnessPlan {
  const isBeginner = profile.experience?.toLowerCase() === 'beginner';
  const isMuscle = profile.goal === 'Muscle Gain' || profile.goal === 'Strength';
  const isWeightLoss = profile.goal === 'Weight Loss';
  const hasNoEquipment = profile.equipment?.toLowerCase().includes('bodyweight');

  const days: DayWorkoutPlan[] = [
    {
      day: 1,
      focus: isMuscle ? 'Upper Body Strength' : 'Full Body Conditioning',
      warmup: ['Arm circles & chest openers (2 mins)', 'Cat-cow mobility (1 min)', 'Jumping jacks or march in place (2 mins)'],
      exercises: hasNoEquipment
        ? [
            { name: 'Standard / Incline Push-Ups', sets: 3, reps: isBeginner ? '8-10' : '12-15', rest: '60s', notes: 'Maintain a tight core and neutral spine' },
            { name: 'Bodyweight Air Squats', sets: 3, reps: '15 reps', rest: '45s', notes: 'Full depth, drive through heels' },
            { name: 'Inverted Row / Doorframe Pulls', sets: 3, reps: '10-12', rest: '60s', notes: 'Squeeze shoulder blades together' },
            { name: 'Plank Hold', sets: 3, reps: '30-45 sec', rest: '45s', notes: 'Glutes engaged, don’t let lower back sag' },
          ]
        : [
            { name: 'Dumbbell Bench Press / Floor Press', sets: 3, reps: isBeginner ? '10' : '8-12', rest: '75s', notes: 'Controlled tempo 3 seconds down' },
            { name: 'Goblet Squats', sets: 3, reps: '10-12', rest: '60s', notes: 'Keep elbows tucked and chest proud' },
            { name: 'Dumbbell Bent-Over Row', sets: 3, reps: '10-12 each', rest: '60s', notes: 'Hinge at hips, pull elbow to hip' },
            { name: 'Standing Overhead Dumbbell Press', sets: 3, reps: '10 reps', rest: '60s', notes: 'Brace abdominals before pressing' },
          ],
      cooldown: ['Overhead tricep stretch (30s each)', 'Child’s pose (60s)', 'Deep belly breathing (2 mins)'],
      recovery: 'Focus on post-workout protein intake and gentle shoulder mobility before sleep.',
    },
    {
      day: 2,
      focus: isMuscle ? 'Lower Body & Core' : isWeightLoss ? 'HIIT & Core Burn' : 'Lower Body & Balance',
      warmup: ['Leg swings forward and lateral (1 min each)', 'Glute bridges (15 reps)', 'High knees (2 mins)'],
      exercises: hasNoEquipment
        ? [
            { name: 'Walking Lunges', sets: 3, reps: '12 per leg', rest: '60s', notes: '90-degree angles in both knees' },
            { name: 'Single-Leg Romanian Deadlift (Bodyweight)', sets: 3, reps: '10 per leg', rest: '45s', notes: 'Find a focal point on the floor for balance' },
            { name: 'Glute Bridges', sets: 3, reps: '15 reps', rest: '45s', notes: 'Hold top squeeze for 2 seconds' },
            { name: 'Mountain Climbers', sets: 3, reps: '30 sec', rest: '45s', notes: 'Quick tempo while maintaining plank' },
          ]
        : [
            { name: 'Dumbbell Romanian Deadlifts', sets: 3, reps: '10-12', rest: '75s', notes: 'Feel hamstring stretch, keep back flat' },
            { name: 'Dumbbell Bulgarian Split Squats', sets: 3, reps: '8-10 per leg', rest: '60s', notes: 'Rear foot elevated on bench or chair' },
            { name: 'Standing Calf Raises', sets: 3, reps: '15-20', rest: '45s', notes: 'Full extension at the top' },
            { name: 'Hanging / Lying Leg Raises', sets: 3, reps: '12 reps', rest: '45s', notes: 'Initiate movement from lower abdominals' },
          ],
      cooldown: ['Standing quad stretch (30s each)', 'Pigeon pose / seated figure-4 (60s each)', 'Calf stretch (30s each)'],
      recovery: 'Elevate legs for 10 minutes to support venous return and drink 500ml water with electrolytes.',
    },
    {
      day: 3,
      focus: 'Active Recovery & Mobility Flow',
      warmup: ['Neck rolls and shoulder shrugs (2 mins)', 'Wrist & ankle mobility (2 mins)'],
      exercises: [
        { name: 'World’s Greatest Stretch', sets: 2, reps: '5 per side', rest: '30s', notes: 'Open up hips and thoracic spine smoothly' },
        { name: 'Cat-Cow into Bird-Dog', sets: 3, reps: '8 reps per side', rest: '30s', notes: 'Focus on balance and lumbar stability' },
        { name: 'Brisk Outdoor Walk / Light Stationary Cycle', sets: 1, reps: '25-30 min', rest: 'N/A', notes: 'Zone 2 conversational heart rate' },
      ],
      cooldown: ['Deep diaphragmatic breathing (3 mins)', 'Full body relaxation scan'],
      recovery: 'Take an Epsom salt bath or warm shower to release muscular tension and reduce cortisol.',
    },
    {
      day: 4,
      focus: 'Upper Body Hypertrophy & Pulling',
      warmup: ['Band pull-aparts or towel pulls (15 reps)', 'Arm windmills (1 min)', 'Torso twists (1 min)'],
      exercises: [
        { name: 'Dumbbell / Bodyweight Pulls', sets: 3, reps: '10-12 reps', rest: '60s', notes: 'Control both concentric and eccentric phases' },
        { name: 'Push-Up Variations / Incline Press', sets: 3, reps: '10-12 reps', rest: '60s', notes: 'Keep neck in neutral alignment' },
        { name: 'Lateral Deltoid Raises', sets: 3, reps: '12-15 reps', rest: '45s', notes: 'Lead with elbows, avoid swinging weights' },
        { name: 'Bicep Curls to Hammer Curls Superset', sets: 3, reps: '10-12 reps', rest: '60s', notes: 'Squeeze biceps firmly at top' },
      ],
      cooldown: ['Cross-body shoulder stretch (40s each)', 'Doorway chest stretch (45s each)'],
      recovery: 'Adequate hydration is critical today; aim for consistent water intake throughout the afternoon.',
    },
    {
      day: 5,
      focus: isWeightLoss ? 'Metabolic Conditioning & Core' : 'Lower Body Power & Posterior Chain',
      warmup: ['Inchworms (6 reps)', 'High knees and butt kicks (2 mins)', 'Hip openers (1 min)'],
      exercises: [
        { name: 'Dumbbell Front Squats / Squat Pulses', sets: 3, reps: '12 reps', rest: '60s', notes: 'Keep torso upright throughout the lift' },
        { name: 'Step-Ups with Knee Drive', sets: 3, reps: '10 each leg', rest: '45s', notes: 'Push through lead heel, soft landing' },
        { name: 'Kettlebell / Dumbbell Swings', sets: 3, reps: '15 reps', rest: '60s', notes: 'Explosive hip snap, do not squat the weight' },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 total reps', rest: '45s', notes: 'Slow and controlled, touch opposite elbow to knee' },
      ],
      cooldown: ['Seated hamstring stretch (45s each)', 'Butterfly inner thigh stretch (60s)'],
      recovery: 'Consume a magnesium-rich evening snack (e.g. pumpkin seeds or banana) for muscle relaxation.',
    },
    {
      day: 6,
      focus: 'Cardiovascular Endurance & Core Stability',
      warmup: ['Dynamic lateral lunges (10 each)', 'Arm swings & torso rotations (2 mins)'],
      exercises: [
        { name: 'Interval Jog / Fast Power Walk', sets: 5, reps: '2 min work / 1 min walk', rest: '60s', notes: 'Maintain steady rhythmic breathing' },
        { name: 'Side Plank Holds', sets: 3, reps: '30 sec per side', rest: '45s', notes: 'Keep hips lifted high in line with shoulders' },
        { name: 'Deadbug Movement', sets: 3, reps: '12 reps per side', rest: '45s', notes: 'Press lower back firmly into the floor' },
      ],
      cooldown: ['Child’s pose with side reach (60s)', 'Standing side reach stretch (30s each)'],
      recovery: 'Pre-hydrate for tomorrow and enjoy nutrient-dense complex carbohydrates to replenish glycogen.',
    },
    {
      day: 7,
      focus: 'Full Rest & Cellular Regeneration',
      warmup: ['Gentle morning neck and spinal mobilization (3 mins)'],
      exercises: [
        { name: 'Gentle Restorative Nature Walk', sets: 1, reps: '20-30 mins', rest: 'Self-paced', notes: 'Relax the nervous system and clear mental fatigue' },
        { name: 'Full-Body Foam Rolling / Static Stretches', sets: 1, reps: '15 mins', rest: 'Gentle', notes: 'Spend 60 seconds on any tight muscle groups' },
      ],
      cooldown: ['5 minutes of quiet mindfulness or meditation'],
      recovery: 'Prep healthy meals for the upcoming week and ensure a consistent bedtime.',
    },
  ];

  return {
    plan_title: `${profile.goal} Blueprint (${profile.experience})`,
    summary: `A personalized 7-day routine engineered specifically for ${profile.name} focusing on ${profile.goal} with ${profile.intensity} intensity and ${profile.equipment || 'accessible equipment'}.`,
    weekly_plan: days,
    nutrition_tip: `Given your goal of ${profile.goal}, prioritize 1.6-2.0g protein/kg of body weight (~${Math.round(profile.weight * 1.8)}g/day) to sustain lean muscle mass and optimize tissue recovery.`,
    hydration_tip: `Aim for approximately ${(profile.weight * 0.035).toFixed(1)} liters of clean water daily, adding an extra 500ml on training days.`,
    general_recovery_tip: `Target 7-9 hours of continuous sleep. Recovery is when muscle adaptation and fat oxidation actually occur!`,
    healthy_eating_guidance: `Anchor every meal with a palm-sized lean protein, 2 cupped hands of colorful vegetables, and complex carbohydrates around workout windows.`,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}

function generateLocalUpdatedFallbackPlan(
  originalPlan: CompleteFitnessPlan,
  profile: UserFitnessProfile,
  feedback: string
): CompleteFitnessPlan {
  const updatedWeekly = JSON.parse(JSON.stringify(originalPlan.weekly_plan)) as DayWorkoutPlan[];
  const lowerFeedback = feedback.toLowerCase();

  // Adapt based on keywords
  if (lowerFeedback.includes('cardio')) {
    updatedWeekly.forEach((day) => {
      if (day.focus !== 'Rest Day') {
        day.exercises.push({
          name: 'HIIT Cardio Finisher (Jumping Jacks / Burpees / High Knees)',
          sets: 3,
          reps: '45 sec on / 15 sec off',
          rest: '45s',
          notes: 'Added per user request to boost cardiovascular endurance and calorie expenditure',
        });
      }
    });
  } else if (lowerFeedback.includes('easier') || lowerFeedback.includes('light')) {
    updatedWeekly.forEach((day) => {
      day.exercises.forEach((ex) => {
        if (typeof ex.sets === 'number' && ex.sets > 2) ex.sets = 2;
        ex.rest = '90 seconds';
        ex.notes = `Modified for gentler progression: focus on smooth form without muscle failure.`;
      });
    });
  } else if (lowerFeedback.includes('less time') || lowerFeedback.includes('time') || lowerFeedback.includes('quick')) {
    updatedWeekly.forEach((day) => {
      day.exercises = day.exercises.slice(0, 3);
      day.exercises.forEach((ex) => {
        ex.notes = `Time-efficient superset protocol: complete back-to-back to finish in under 30 minutes.`;
      });
    });
  } else if (lowerFeedback.includes('rest') || lowerFeedback.includes('sore')) {
    if (updatedWeekly[2]) {
      updatedWeekly[2].focus = 'Full Rest & Muscle Regeneration';
      updatedWeekly[2].exercises = [
        { name: 'Light Mobility & Gentle Walking', sets: 1, reps: '20 mins', rest: 'Gentle', notes: 'Scheduled additional rest day per feedback.' },
      ];
    }
    if (updatedWeekly[4]) {
      updatedWeekly[4].focus = 'Active Recovery & Stretching';
    }
  } else if (lowerFeedback.includes('equipment') || lowerFeedback.includes('home') || lowerFeedback.includes('no gym')) {
    updatedWeekly.forEach((day) => {
      day.exercises = day.exercises.map((ex) => ({
        ...ex,
        name: `Bodyweight Calisthenics: ${ex.name.replace(/Dumbbell|Barbell|Bench|Cable/gi, 'Bodyweight')}`,
        notes: 'Adapted strictly for zero gym equipment / home setting.',
      }));
    });
  } else if (lowerFeedback.includes('flexibility') || lowerFeedback.includes('stretch') || lowerFeedback.includes('yoga')) {
    updatedWeekly.forEach((day) => {
      day.cooldown.push('Extended 10-minute deep hamstring, hip flexor & spinal mobility sequence');
    });
  }

  return {
    plan_title: `Adapted Plan: ${originalPlan.plan_title}`,
    summary: `Plan updated specifically based on your feedback: "${feedback}". Modifications have been seamlessly incorporated while safeguarding your overall fitness progression.`,
    feedback_applied: feedback,
    weekly_plan: updatedWeekly,
    nutrition_tip: originalPlan.nutrition_tip,
    hydration_tip: originalPlan.hydration_tip,
    general_recovery_tip: originalPlan.general_recovery_tip,
    healthy_eating_guidance: originalPlan.healthy_eating_guidance,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
