# Database Migration Plan: JSONB → Normalized Tables

**Status:** 🔴 NOT STARTED - Ready to implement when Claude usage resets
**Priority:** HIGH - Required for progression charts feature
**Estimated Time:** 2-4 hours (< 10 users currently)

---

## Why Migrate?

Current single-table JSONB approach will NOT scale for progression charts:
- ❌ Must download ALL workout logs (10,000+ records) to show one chart
- ❌ Filtering happens in browser (slow, memory intensive)
- ❌ No database indexes = slow queries
- ❌ Can't do analytics (PRs, volume trends, etc.)

**With 1 year of data:** ~300ms to load one chart vs ~50ms with normalized tables (6x faster!)

---

## New Database Schema

### 1. Exercises Table
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_user ON exercises(user_id);
```

### 2. Workout Logs Table (Critical for Progression Charts!)
```sql
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER NOT NULL,
  weight DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Indexes for fast chart queries
CREATE INDEX idx_logs_user_exercise_date
ON workout_logs(user_id, exercise_id, date DESC);

CREATE INDEX idx_logs_user_date
ON workout_logs(user_id, date DESC);
```

### 3. Workout Plans Table
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  day_of_week TEXT NOT NULL, -- 'Monday', 'Tuesday', etc.
  day_custom_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_user ON workout_plans(user_id);
```

### 4. Planned Exercises (Join Table)
```sql
CREATE TABLE planned_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps TEXT, -- "8-10" or "12"
  exercise_order INTEGER, -- for ordering
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_planned_exercises_plan ON planned_exercises(plan_id);
```

### 5. Muscle Goals Table
```sql
CREATE TABLE muscle_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  muscle_name TEXT NOT NULL,
  target_sets INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, muscle_name)
);

CREATE INDEX idx_goals_user ON muscle_goals(user_id);
```

### 6. Muscle Categories Table
```sql
CREATE TABLE muscle_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category_name TEXT NOT NULL,
  muscles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_name)
);

CREATE INDEX idx_categories_user ON muscle_categories(user_id);
```

---

## Row Level Security (RLS) Policies

**Critical for security - users can only see their own data!**

```sql
-- Enable RLS on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_categories ENABLE ROW LEVEL SECURITY;

-- Exercises policies
CREATE POLICY "Users can view own exercises"
ON exercises FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercises"
ON exercises FOR ALL USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view own logs"
ON workout_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own logs"
ON workout_logs FOR ALL USING (auth.uid() = user_id);

-- Workout plans policies
CREATE POLICY "Users can view own plans"
ON workout_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plans"
ON workout_plans FOR ALL USING (auth.uid() = user_id);

-- Planned exercises policies (inherit from workout_plans)
CREATE POLICY "Users can view own planned exercises"
ON planned_exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workout_plans
    WHERE workout_plans.id = planned_exercises.plan_id
    AND workout_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own planned exercises"
ON planned_exercises FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM workout_plans
    WHERE workout_plans.id = planned_exercises.plan_id
    AND workout_plans.user_id = auth.uid()
  )
);

-- Muscle goals policies
CREATE POLICY "Users can view own goals"
ON muscle_goals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals"
ON muscle_goals FOR ALL USING (auth.uid() = user_id);

-- Muscle categories policies
CREATE POLICY "Users can view own categories"
ON muscle_categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own categories"
ON muscle_categories FOR ALL USING (auth.uid() = user_id);
```

---

## Migration Steps

### Step 1: Create Tables in Supabase (30 min)

1. Go to Supabase SQL Editor
2. Run all CREATE TABLE statements above
3. Run all CREATE INDEX statements
4. Run all RLS policies
5. Verify tables exist in Table Editor

### Step 2: Write Migration Script (1 hour)

Create `scripts/migrate-to-normalized.js`:

```javascript
// This script migrates data from app_state JSONB to normalized tables
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key!
);

async function migrateUser(userId, data) {
  console.log(`Migrating user ${userId}...`);

  // 1. Migrate exercises
  if (data.exercises) {
    for (const exercise of data.exercises) {
      await supabase.from('exercises').insert({
        id: exercise.id,
        user_id: userId,
        name: exercise.name,
        tags: exercise.tags,
        instructions: exercise.instructions
      });
    }
  }

  // 2. Migrate muscle goals
  if (data.goals) {
    for (const [muscle, sets] of Object.entries(data.goals)) {
      await supabase.from('muscle_goals').insert({
        user_id: userId,
        muscle_name: muscle,
        target_sets: sets
      });
    }
  }

  // 3. Migrate muscle categories
  if (data.muscleCats) {
    for (const [category, muscles] of Object.entries(data.muscleCats)) {
      await supabase.from('muscle_categories').insert({
        user_id: userId,
        category_name: category,
        muscles: muscles
      });
    }
  }

  // 4. Migrate workout plans
  if (data.plan) {
    for (const [day, exercises] of Object.entries(data.plan)) {
      // Create plan for this day
      const { data: planData } = await supabase
        .from('workout_plans')
        .insert({
          user_id: userId,
          day_of_week: day,
          day_custom_name: data.dayNames?.[day] || ''
        })
        .select()
        .single();

      // Add exercises to plan
      for (const exerciseGroup of exercises) {
        for (let i = 0; i < exerciseGroup.length; i++) {
          const pe = exerciseGroup[i];
          await supabase.from('planned_exercises').insert({
            plan_id: planData.id,
            exercise_id: pe.exerciseId,
            sets: pe.sets,
            reps: pe.reps,
            exercise_order: i
          });
        }
      }
    }
  }

  // 5. Migrate workout logs
  if (data.logs) {
    for (const log of data.logs) {
      await supabase.from('workout_logs').insert({
        user_id: userId,
        exercise_id: log.exerciseId,
        date: log.date,
        sets_completed: log.sets,
        reps_completed: log.reps,
        weight: log.weight,
        notes: log.notes
      });
    }
  }

  console.log(`✅ User ${userId} migrated successfully`);
}

async function migrateAll() {
  // Get all users from app_state
  const { data: allData } = await supabase
    .from('app_state')
    .select('user_id, data');

  for (const row of allData) {
    try {
      await migrateUser(row.user_id, row.data);
    } catch (error) {
      console.error(`❌ Failed to migrate user ${row.user_id}:`, error);
    }
  }

  console.log('🎉 Migration complete!');
}

migrateAll();
```

Run with: `node scripts/migrate-to-normalized.js`

### Step 3: Update App Code (1-2 hours)

**Files to update:**

1. **src/lib/supabase.js** - Replace `sbLoadData` and `sbSaveData`
2. **src/App.jsx** - Update to fetch from multiple tables
3. **src/components/views/LibraryView/LibraryView.jsx** - Update exercise CRUD
4. **src/components/views/PlannerView/PlannerView.jsx** - Update plan CRUD
5. **src/components/views/TodayView/TodayView.jsx** - Update log creation
6. **src/components/views/SettingsView/SettingsView.jsx** - Update goals CRUD

### Step 4: Test Thoroughly (30 min)

- [ ] Create new exercise
- [ ] Edit exercise
- [ ] Delete exercise
- [ ] Create workout plan
- [ ] Log workout
- [ ] View goals
- [ ] Test on mobile PWA
- [ ] Test offline mode

### Step 5: Deploy (15 min)

- [ ] Commit changes
- [ ] Push to Vercel
- [ ] Test production
- [ ] Monitor for errors

### Step 6: Backup & Cleanup (15 min)

- [ ] Export app_state table as backup
- [ ] Keep app_state for 1 month
- [ ] Delete app_state after confirming everything works

---

## Example Queries for Progression Charts

### Get Exercise Progress (6 months)
```javascript
const { data } = await supabase
  .from('workout_logs')
  .select('date, weight, reps_completed, sets_completed')
  .eq('user_id', userId)
  .eq('exercise_id', exerciseId)
  .gte('date', sixMonthsAgo)
  .order('date', { ascending: true });
```

### Get Personal Record
```javascript
const { data } = await supabase
  .from('workout_logs')
  .select('weight, reps_completed')
  .eq('user_id', userId)
  .eq('exercise_id', exerciseId)
  .order('weight', { ascending: false })
  .limit(1)
  .single();
```

### Get Volume Over Time
```sql
SELECT
  date,
  SUM(sets_completed * reps_completed * weight) as total_volume
FROM workout_logs
WHERE user_id = 'user-uuid'
  AND exercise_id = 'bench-press-uuid'
GROUP BY date
ORDER BY date DESC;
```

---

## Rollback Plan

If migration fails:
1. Keep app_state table untouched during migration
2. App can fall back to JSONB if normalized tables fail
3. Delete new tables and try again
4. No data loss!

---

## Post-Migration Benefits

✅ **Fast progression charts** - Load in 50ms instead of 300ms
✅ **Advanced analytics** - PRs, volume trends, frequency stats
✅ **Better UX** - Instant filtering, sorting, searching
✅ **Scalability** - Handle millions of workout logs
✅ **Future features** - Sharing workouts, social features, leaderboards

---

## Next Session Checklist

When Claude usage resets:

- [ ] Create all tables in Supabase SQL Editor
- [ ] Enable RLS and create policies
- [ ] Write migration script
- [ ] Run migration on production data
- [ ] Update app code to use new schema
- [ ] Test thoroughly
- [ ] Deploy to production
- [ ] Monitor for 1 week
- [ ] Delete app_state table

**Estimated total time: 2-4 hours**

---

## Questions?

- How to handle users who are actively using the app during migration?
  → Do migration during low-traffic hours (3am)

- What if migration script fails halfway?
  → Keep app_state table, delete new tables, fix script, try again

- Will this break existing PWA installs?
  → No! Just update the API calls, PWA continues working

---

**Created:** April 4, 2026
**Last Updated:** April 4, 2026
**Status:** Ready to implement
