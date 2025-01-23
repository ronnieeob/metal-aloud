-- Create subscription plans table if not exists
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('artist', 'user')),
    interval text NOT NULL CHECK (interval IN ('monthly', 'yearly')),
    price decimal(10,2) NOT NULL,
    features jsonb NOT NULL,
    includes_copyright boolean DEFAULT false,
    copyright_quota integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Clear existing plans and insert new ones
TRUNCATE subscription_plans CASCADE;

-- Insert subscription plans
INSERT INTO subscription_plans (name, type, interval, price, features, includes_copyright, copyright_quota) VALUES
-- Artist Plans
('Artist Basic Monthly', 'artist', 'monthly', 9.99, 
  '["Upload up to 50 songs", "Basic analytics", "Standard support", "Manual copyright registration"]'::jsonb,
  true, 5),
('Artist Pro Monthly', 'artist', 'monthly', 29.99,
  '["Unlimited song uploads", "Advanced analytics", "Priority support", "Automatic copyright registration", "Custom artist profile"]'::jsonb,
  true, 20),
('Artist Basic Yearly', 'artist', 'yearly', 99.99,
  '["Upload up to 50 songs", "Basic analytics", "Standard support", "Manual copyright registration", "2 months free"]'::jsonb,
  true, 60),
('Artist Pro Yearly', 'artist', 'yearly', 299.99,
  '["Unlimited song uploads", "Advanced analytics", "Priority support", "Automatic copyright registration", "Custom artist profile", "2 months free"]'::jsonb,
  true, -1), -- -1 means unlimited

-- User Plans
('Premium Monthly', 'user', 'monthly', 4.99,
  '["Ad-free listening", "Offline mode", "High-quality audio", "Exclusive content"]'::jsonb,
  false, 0),
('Premium Yearly', 'user', 'yearly', 49.99,
  '["Ad-free listening", "Offline mode", "High-quality audio", "Exclusive content", "2 months free"]'::jsonb,
  false, 0);

-- Create user subscriptions table if not exists
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users ON DELETE CASCADE,
    plan_id uuid REFERENCES subscription_plans ON DELETE RESTRICT,
    status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    current_period_start timestamptz NOT NULL,
    current_period_end timestamptz NOT NULL,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create copyright usage tracking if not exists
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS copyright_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id uuid REFERENCES users ON DELETE CASCADE,
    subscription_id uuid REFERENCES user_subscriptions ON DELETE SET NULL,
    songs_registered integer DEFAULT 0,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS if not already enabled
DO $$ BEGIN
  ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE copyright_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
  DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
  DROP POLICY IF EXISTS "Users can view own copyright usage" ON copyright_usage;
END $$;

-- Create policies
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own copyright usage"
  ON copyright_usage FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

-- Create or replace function to check copyright quota
CREATE OR REPLACE FUNCTION check_copyright_quota(
  p_artist_id uuid,
  p_subscription_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quota integer;
  v_used integer;
BEGIN
  -- Get quota from subscription plan
  SELECT sp.copyright_quota INTO v_quota
  FROM subscription_plans sp
  JOIN user_subscriptions us ON us.plan_id = sp.id
  WHERE us.id = p_subscription_id;

  -- Unlimited quota
  IF v_quota = -1 THEN
    RETURN true;
  END IF;

  -- Get usage for current period
  SELECT songs_registered INTO v_used
  FROM copyright_usage
  WHERE artist_id = p_artist_id
    AND subscription_id = p_subscription_id
    AND now() BETWEEN period_start AND period_end;

  RETURN COALESCE(v_used, 0) < v_quota;
END;
$$;