-- Add subscription-based copyright features
ALTER TABLE subscription_plans 
ADD COLUMN includes_copyright boolean DEFAULT false,
ADD COLUMN copyright_quota integer DEFAULT 0;

-- Update existing plans with copyright features
UPDATE subscription_plans
SET includes_copyright = true,
    copyright_quota = CASE 
      WHEN interval = 'yearly' THEN -1 -- Unlimited
      ELSE 10 -- 10 songs per month
    END
WHERE type = 'artist';

-- Create copyright usage tracking
CREATE TABLE copyright_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions ON DELETE SET NULL,
  songs_registered integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add copyright protection level
ALTER TABLE copyright_registrations
ADD COLUMN protection_level text CHECK (protection_level IN ('basic', 'standard', 'premium')) DEFAULT 'basic';

-- Create function to check copyright quota
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