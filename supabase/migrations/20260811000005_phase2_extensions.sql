-- Migration 5: Phase 2 Extensions (Task Dependencies)
-- Creates task_dependencies table to support task pre-requisites.

CREATE TABLE IF NOT EXISTS task_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    prerequisite_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT unique_task_dependency UNIQUE (task_id, prerequisite_task_id),
    CONSTRAINT no_self_dependency CHECK (task_id <> prerequisite_task_id)
);

-- Enable RLS
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own task dependencies"
    ON task_dependencies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task dependencies"
    ON task_dependencies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task dependencies"
    ON task_dependencies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task dependencies"
    ON task_dependencies FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_user_id ON task_dependencies(user_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_prereq ON task_dependencies(prerequisite_task_id);
