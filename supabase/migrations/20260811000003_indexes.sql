-- Migration 3: Indexes
-- Creates standard and composite indexes for common queries.

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
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_id ON %I(user_id);', t, t);
    END LOOP;
END $$;

-- tasks
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_id_status_deadline ON tasks(user_id, status, deadline);

-- projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_user_id_status ON projects(user_id, status);

-- goals
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_user_id_status ON goals(user_id, status);

-- calendar_events
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_user_id_start_time ON calendar_events(user_id, start_time);

-- hydration_logs
CREATE INDEX idx_hydration_logs_timestamp ON hydration_logs(timestamp);
CREATE INDEX idx_hydration_logs_user_id_timestamp ON hydration_logs(user_id, timestamp);

-- meals
CREATE INDEX idx_meals_timestamp ON meals(timestamp);
CREATE INDEX idx_meals_user_id_timestamp ON meals(user_id, timestamp);

-- workouts
CREATE INDEX idx_workouts_scheduled_time ON workouts(scheduled_time);
CREATE INDEX idx_workouts_user_id_scheduled_time ON workouts(user_id, scheduled_time);

-- sleep_logs
CREATE INDEX idx_sleep_logs_sleep_start ON sleep_logs(sleep_start);
CREATE INDEX idx_sleep_logs_user_id_sleep_start ON sleep_logs(user_id, sleep_start);

-- supplement_logs
CREATE INDEX idx_supplement_logs_scheduled_time ON supplement_logs(scheduled_time);
CREATE INDEX idx_supplement_logs_user_id_scheduled_time ON supplement_logs(user_id, scheduled_time);

-- habits
CREATE INDEX idx_habits_user_id_active ON habits(user_id, active);

-- habit_completions
CREATE INDEX idx_habit_completions_habit_id_completed_at ON habit_completions(habit_id, completed_at);

-- income
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_user_id_date ON income(user_id, date);

-- expenses
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_user_id_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_user_id_category ON expenses(user_id, category);

-- budgets
CREATE INDEX idx_budgets_user_id_category ON budgets(user_id, category);

-- recurring_expenses
CREATE INDEX idx_recurring_expenses_next_due_date ON recurring_expenses(next_due_date);
CREATE INDEX idx_recurring_expenses_user_id_active ON recurring_expenses(user_id, active);

-- reminders
CREATE INDEX idx_reminders_scheduled_time ON reminders(scheduled_time);
CREATE INDEX idx_reminders_user_id_enabled_scheduled_time ON reminders(user_id, enabled, scheduled_time);

-- business_projects
CREATE INDEX idx_business_projects_user_id_status ON business_projects(user_id, status);

-- business_tasks
CREATE INDEX idx_business_tasks_business_project_id ON business_tasks(business_project_id);
CREATE INDEX idx_business_tasks_user_id_status ON business_tasks(user_id, status);

-- business_revenue
CREATE INDEX idx_business_revenue_user_id_date ON business_revenue(user_id, date);

-- business_expenses
CREATE INDEX idx_business_expenses_user_id_date ON business_expenses(user_id, date);

-- life_areas
-- idx_life_areas_user_id is already created by the loop above.
