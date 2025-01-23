/*
  # Subscription Plans and Copyright Features

  1. Updates
    - Add copyright features to subscription plans
    - Update existing plans with new features
    - Add copyright quota tracking

  2. Changes
    - Add copyright-related columns to subscription plans
    - Update plan features and pricing
*/

-- Add copyright features to subscription plans if not exists
DO $$ BEGIN
  ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS includes_copyright boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS copyright_quota integer DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Update existing plans with copyright features
UPDATE subscription_plans
SET includes_copyright = true,
    copyright_quota = CASE 
      WHEN name LIKE '%Pro%' AND interval = 'yearly' THEN -1 -- Unlimited
      WHEN name LIKE '%Pro%' AND interval = 'monthly' THEN 20
      WHEN name LIKE '%Basic%' AND interval = 'yearly' THEN 60
      WHEN name LIKE '%Basic%' AND interval = 'monthly' THEN 5
      ELSE 0
    END
WHERE type = 'artist'
  AND NOT EXISTS (
    SELECT 1 FROM subscription_plans 
    WHERE includes_copyright = true
  );

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

-- Enable RLS on copyright_usage if not already enabled
DO $$ BEGIN
  ALTER TABLE copyright_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own copyright usage" ON copyright_usage;

-- Create policy for copyright usage
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