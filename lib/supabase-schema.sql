-- Create tables for the AI fine-tuning platform

-- Models table to store information about fine-tuned models
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  base_model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'training',
  tuned_model_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage table to track API usage
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_count INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_usage_user_id ON usage(user_id);
CREATE INDEX idx_usage_model_id ON usage(model_id);
CREATE INDEX idx_usage_date ON usage(date);

-- Create a unique constraint for usage tracking
CREATE UNIQUE INDEX idx_usage_unique ON usage(model_id, user_id, date);

-- Create RLS policies for security

-- Models table policies
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

CREATE POLICY models_select_policy ON models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY models_insert_policy ON models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY models_update_policy ON models
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY models_delete_policy ON models
  FOR DELETE USING (auth.uid() = user_id);

-- Usage table policies
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_select_policy ON usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY usage_insert_policy ON usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY usage_update_policy ON usage
  FOR UPDATE USING (auth.uid() = user_id);

