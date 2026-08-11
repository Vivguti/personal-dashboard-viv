-- Migration 2: RLS Policies
-- Enables Row Level Security and creates policies for all tables.

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'profiles', 'life_areas', 'clients', 'goals', 'projects', 'tasks',
        'calendar_events', 'hydration_logs', 'meals', 'workouts',
        'workout_exercises', 'sleep_logs', 'supplements', 'supplement_logs',
        'supplement_reminders', 'habits', 'habit_completions', 'accounts',
        'income', 'expenses', 'budgets', 'financial_goals', 'recurring_expenses',
        'allocation_rules', 'cash_flow_forecasts', 'business_projects',
        'leads', 'business_tasks', 'business_revenue', 'business_expenses',
        'business_goals', 'reminders'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- profiles
CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profiles" ON profiles FOR DELETE USING (auth.uid() = id);

-- Generate user_id policies for standard tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'life_areas', 'clients', 'goals', 'projects', 'tasks',
        'calendar_events', 'hydration_logs', 'meals', 'workouts',
        'sleep_logs', 'supplements', 'supplement_logs',
        'supplement_reminders', 'habits', 'habit_completions', 'accounts',
        'income', 'expenses', 'budgets', 'financial_goals', 'recurring_expenses',
        'allocation_rules', 'cash_flow_forecasts', 'business_projects',
        'leads', 'business_tasks', 'business_revenue', 'business_expenses',
        'business_goals', 'reminders'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('CREATE POLICY "Users can view own %I" ON %I FOR SELECT USING (auth.uid() = user_id);', t, t);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id);', t, t);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON %I FOR UPDATE USING (auth.uid() = user_id);', t, t);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON %I FOR DELETE USING (auth.uid() = user_id);', t, t);
    END LOOP;
END $$;

-- workout_exercises (uses workout_id instead of user_id directly)
CREATE POLICY "Users can view own workout_exercises" ON workout_exercises FOR SELECT
USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));

CREATE POLICY "Users can insert own workout_exercises" ON workout_exercises FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));

CREATE POLICY "Users can update own workout_exercises" ON workout_exercises FOR UPDATE
USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));

CREATE POLICY "Users can delete own workout_exercises" ON workout_exercises FOR DELETE
USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
