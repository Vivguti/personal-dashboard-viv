-- Migration 4: Triggers
-- Creates triggers for updated_at and user onboarding.

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'profiles', 'life_areas', 'clients', 'goals', 'projects', 'tasks',
        'calendar_events', 'supplements', 'habits', 'accounts',
        'budgets', 'financial_goals', 'recurring_expenses', 'allocation_rules',
        'business_projects', 'leads', 'business_tasks', 'business_goals', 'reminders'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('
            CREATE TRIGGER on_update_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION handle_updated_at();
        ', t, t);
    END LOOP;
END $$;


-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'display_name'
    );

    -- Create default life areas
    INSERT INTO public.life_areas (user_id, name, color, icon, sort_order)
    VALUES
        (NEW.id, 'School', '#4F46E5', 'book', 1),
        (NEW.id, 'Business', '#059669', 'briefcase', 2),
        (NEW.id, 'Health', '#EF4444', 'heart', 3),
        (NEW.id, 'Fitness', '#F59E0B', 'activity', 4),
        (NEW.id, 'Finance', '#10B981', 'dollar-sign', 5),
        (NEW.id, 'Personal', '#8B5CF6', 'user', 6),
        (NEW.id, 'Career', '#0EA5E9', 'award', 7),
        (NEW.id, 'Other', '#6B7280', 'more-horizontal', 8);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
