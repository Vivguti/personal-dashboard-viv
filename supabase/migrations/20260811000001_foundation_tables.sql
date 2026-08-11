-- Migration 1: Foundation Tables
-- Creates all base tables for the Personal OS application.

-- 1. profiles
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    display_name text,
    timezone text DEFAULT 'America/Chicago',
    preferred_start_time time DEFAULT '08:00',
    preferred_end_time time DEFAULT '22:00',
    default_task_duration integer DEFAULT 30,
    daily_work_capacity integer DEFAULT 480,
    weekly_work_capacity integer DEFAULT 2400,
    preferred_training_days text[] DEFAULT '{monday,wednesday,friday}',
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. life_areas
CREATE TABLE life_areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text,
    icon text,
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 26. clients (Needed before business_projects)
CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    company text,
    notes text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. goals
CREATE TABLE goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    category text,
    life_area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
    priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    target_value numeric,
    current_value numeric DEFAULT 0,
    unit text,
    target_date date,
    status text CHECK (status IN ('active','completed','paused','cancelled')) DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. projects
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    life_area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
    status text CHECK (status IN ('planning','active','on_hold','completed','cancelled')) DEFAULT 'planning',
    priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    deadline timestamptz,
    estimated_minutes integer,
    completed_minutes integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. tasks
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    life_area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
    priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    status text CHECK (status IN ('inbox','planned','in_progress','completed','deferred','cancelled')) DEFAULT 'inbox',
    estimated_minutes integer,
    actual_minutes integer,
    energy_required text CHECK (energy_required IN ('low','medium','high')) DEFAULT 'medium',
    deadline timestamptz,
    scheduled_start timestamptz,
    scheduled_end timestamptz,
    recurring boolean DEFAULT false,
    recurrence_rule text,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. calendar_events
CREATE TABLE calendar_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    location text,
    event_type text CHECK (event_type IN ('class','meeting','appointment','deadline','training','personal','business','other')) DEFAULT 'personal',
    life_area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
    source text CHECK (source IN ('manual','google_calendar','ai_suggested')) DEFAULT 'manual',
    external_id text,
    is_fixed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. hydration_logs
CREATE TABLE hydration_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount numeric(8,2) NOT NULL CHECK (amount > 0),
    unit text CHECK (unit IN ('oz','ml')) DEFAULT 'oz',
    timestamp timestamptz DEFAULT now(),
    source text CHECK (source IN ('manual','quick_add','ai')) DEFAULT 'manual',
    notes text
);

-- 8. meals
CREATE TABLE meals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_type text CHECK (meal_type IN ('breakfast','lunch','dinner','snack','other')) NOT NULL,
    name text NOT NULL,
    timestamp timestamptz DEFAULT now(),
    calories integer CHECK (calories >= 0),
    protein numeric(8,2) CHECK (protein >= 0),
    carbohydrates numeric(8,2) CHECK (carbohydrates >= 0),
    fat numeric(8,2) CHECK (fat >= 0),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 9. workouts
CREATE TABLE workouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    workout_type text CHECK (workout_type IN ('strength','cardio','wrestling','jiu_jitsu','mobility','recovery','other')) NOT NULL,
    scheduled_time timestamptz,
    duration_minutes integer,
    intensity text CHECK (intensity IN ('low','medium','high')),
    completed boolean DEFAULT false,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 10. workout_exercises
CREATE TABLE workout_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_name text NOT NULL,
    sets integer,
    reps integer,
    weight numeric(8,2),
    duration_minutes integer,
    distance numeric(8,2),
    rpe numeric(3,1) CHECK (rpe >= 1 AND rpe <= 10),
    notes text,
    sort_order integer DEFAULT 0
);

-- 11. sleep_logs
CREATE TABLE sleep_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_start timestamptz NOT NULL,
    sleep_end timestamptz NOT NULL,
    duration_minutes integer,
    sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 12. supplements
CREATE TABLE supplements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    brand text,
    serving_size text,
    amount numeric(8,2),
    unit text,
    frequency text CHECK (frequency IN ('daily','twice_daily','weekly','as_needed','other')) DEFAULT 'daily',
    preferred_time time,
    with_food boolean DEFAULT false,
    start_date date,
    end_date date,
    active boolean DEFAULT true,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 13. supplement_logs
CREATE TABLE supplement_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    supplement_id uuid NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_time timestamptz,
    taken_time timestamptz,
    status text CHECK (status IN ('scheduled','taken','skipped','snoozed')) DEFAULT 'scheduled',
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 14. supplement_reminders
CREATE TABLE supplement_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplement_id uuid NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
    reminder_time time NOT NULL,
    days_of_week text[] DEFAULT '{monday,tuesday,wednesday,thursday,friday,saturday,sunday}',
    enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 15. habits
CREATE TABLE habits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    category text,
    frequency text CHECK (frequency IN ('daily','weekly','monthly')) DEFAULT 'daily',
    target integer DEFAULT 1,
    reminder_time time,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 16. habit_completions
CREATE TABLE habit_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_at timestamptz DEFAULT now(),
    value integer DEFAULT 1,
    notes text
);

-- 17. accounts
CREATE TABLE accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    account_type text CHECK (account_type IN ('checking','savings','cash','business','other')) NOT NULL,
    current_balance numeric(12,2) DEFAULT 0,
    institution_name text,
    last_updated timestamptz DEFAULT now(),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 18. income
CREATE TABLE income (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source text NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    date date NOT NULL,
    frequency text CHECK (frequency IN ('one_time','weekly','biweekly','monthly')) DEFAULT 'one_time',
    category text CHECK (category IN ('job','business','freelance','gift','other')) DEFAULT 'job',
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 19. expenses
CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant text NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    date date NOT NULL,
    category text CHECK (category IN ('housing','food','transportation','school','business','health','fitness','entertainment','shopping','subscriptions','personal','other')) NOT NULL,
    recurring boolean DEFAULT false,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 20. budgets
CREATE TABLE budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category text NOT NULL,
    monthly_amount numeric(12,2) NOT NULL CHECK (monthly_amount > 0),
    start_date date NOT NULL,
    end_date date,
    warning_threshold numeric(5,2) DEFAULT 80.00 CHECK (warning_threshold > 0 AND warning_threshold <= 100),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 21. financial_goals
CREATE TABLE financial_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    target_amount numeric(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount numeric(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date date,
    priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    contribution_frequency text CHECK (contribution_frequency IN ('weekly','biweekly','monthly','one_time')) DEFAULT 'monthly',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 22. recurring_expenses
CREATE TABLE recurring_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant text NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    frequency text CHECK (frequency IN ('weekly','biweekly','monthly','quarterly','annually')) NOT NULL,
    next_due_date date NOT NULL,
    category text CHECK (category IN ('housing','food','transportation','school','business','health','fitness','entertainment','shopping','subscriptions','personal','other')),
    active boolean DEFAULT true,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 23. allocation_rules
CREATE TABLE allocation_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL,
    percentage numeric(5,2) CHECK (percentage >= 0 AND percentage <= 100),
    fixed_amount numeric(12,2) CHECK (fixed_amount >= 0),
    priority integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 24. cash_flow_forecasts
CREATE TABLE cash_flow_forecasts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    forecast_date date NOT NULL,
    projected_income numeric(12,2) DEFAULT 0,
    projected_expenses numeric(12,2) DEFAULT 0,
    projected_balance numeric(12,2) DEFAULT 0,
    generated_at timestamptz DEFAULT now(),
    notes text
);

-- 25. business_projects
CREATE TABLE business_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    status text CHECK (status IN ('planning','active','on_hold','completed','cancelled')) DEFAULT 'planning',
    priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    deadline timestamptz,
    estimated_minutes integer,
    completed_minutes integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 27. leads
CREATE TABLE leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    company text,
    source text,
    status text CHECK (status IN ('new','contacted','qualified','proposal','won','lost')) DEFAULT 'new',
    estimated_value numeric(12,2),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 28. business_tasks
CREATE TABLE business_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_project_id uuid REFERENCES business_projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text CHECK (status IN ('todo','in_progress','completed','cancelled')) DEFAULT 'todo',
    priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    deadline timestamptz,
    estimated_minutes integer,
    actual_minutes integer,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 29. business_revenue
CREATE TABLE business_revenue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_project_id uuid REFERENCES business_projects(id) ON DELETE SET NULL,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    date date NOT NULL,
    description text,
    category text,
    invoice_number text,
    linked_income_id uuid REFERENCES income(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 30. business_expenses
CREATE TABLE business_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_project_id uuid REFERENCES business_projects(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    date date NOT NULL,
    description text NOT NULL,
    category text,
    linked_expense_id uuid REFERENCES expenses(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 31. business_goals
CREATE TABLE business_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    target_value numeric,
    current_value numeric DEFAULT 0,
    unit text,
    target_date date,
    status text CHECK (status IN ('active','completed','paused','cancelled')) DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 32. reminders
CREATE TABLE reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text CHECK (type IN ('task','calendar','water','meal','workout','sleep','supplement','habit','bill','financial_goal','business','school')) NOT NULL,
    title text NOT NULL,
    message text,
    scheduled_time timestamptz NOT NULL,
    recurring_rule text,
    enabled boolean DEFAULT true,
    completed boolean DEFAULT false,
    snoozed_until timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
