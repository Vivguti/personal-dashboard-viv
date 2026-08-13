-- Migration 6: Notifications & PWA
-- Adds web push subscriptions, notification logs, and profile preferences

-- 1. Extend profiles with notification preferences
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS morning_summary_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS morning_summary_time time DEFAULT '07:30',
ADD COLUMN IF NOT EXISTS event_reminders_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS default_reminder_minutes integer DEFAULT 30;

-- 2. Web Push Subscriptions
CREATE TABLE push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_agent text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(endpoint) -- Prevent duplicate subscriptions
);

-- 3. Notification Logs (prevent duplicate sends)
CREATE TABLE notification_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type text NOT NULL, -- e.g., 'morning_summary', 'event_reminder'
    reference_id text, -- e.g., the event ID
    sent_at timestamptz DEFAULT now(),
    UNIQUE(user_id, notification_type, reference_id)
);

-- 4. RLS Policies

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view own push_subscriptions" ON push_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push_subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push_subscriptions" ON push_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push_subscriptions" ON push_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own notification logs
CREATE POLICY "Users can view own notification_logs" ON notification_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Service role will insert notification logs, but let's allow users to insert/update just in case
CREATE POLICY "Users can insert own notification_logs" ON notification_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_type_ref ON notification_logs(notification_type, reference_id);

-- Update trigger for push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
