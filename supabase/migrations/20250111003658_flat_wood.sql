/*
  # Subscription and Copyright Integration

  1. New Features
    - Add subscription status tracking
    - Add copyright verification status
    - Add automatic copyright protection levels

  2. Changes
    - Add verification status to copyright registrations
    - Add protection level tracking
    - Add subscription status tracking
*/

-- Add verification status to copyright registrations if not exists
DO $$ BEGIN
  ALTER TABLE copyright_registrations 
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verification_date timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create subscription status tracking if not exists
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS subscription_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users ON DELETE CASCADE,
    subscription_id uuid REFERENCES user_subscriptions ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('active', 'grace_period', 'expired')),
    grace_period_end timestamptz,
    last_checked timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on subscription status
ALTER TABLE subscription_status ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription status
CREATE POLICY "Users can view own subscription status"
  ON subscription_status FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT 
    CASE
      WHEN us.current_period_end > now() THEN 'active'
      WHEN us.current_period_end + interval '7 days' > now() THEN 'grace_period'
      ELSE 'expired'
    END INTO v_status
  FROM user_subscriptions us
  WHERE us.user_id = check_subscription_status.user_id
  AND us.status = 'active'
  ORDER BY us.current_period_end DESC
  LIMIT 1;

  RETURN COALESCE(v_status, 'expired');
END;
$$;

-- Create function to automatically determine copyright protection level
CREATE OR REPLACE FUNCTION determine_protection_level(
  subscription_type text,
  is_automatic boolean
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN CASE
    WHEN subscription_type = 'pro' AND is_automatic THEN 'premium'
    WHEN subscription_type = 'pro' THEN 'standard'
    ELSE 'basic'
  END;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_status_user 
  ON subscription_status(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status_subscription 
  ON subscription_status(subscription_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verification 
  ON copyright_registrations(verification_status);

-- Create trigger to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO subscription_status (
    user_id,
    subscription_id,
    status,
    grace_period_end
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    CASE
      WHEN NEW.current_period_end > now() THEN 'active'
      WHEN NEW.current_period_end + interval '7 days' > now() THEN 'grace_period'
      ELSE 'expired'
    END,
    NEW.current_period_end + interval '7 days'
  )
  ON CONFLICT (user_id, subscription_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    grace_period_end = EXCLUDED.grace_period_end,
    last_checked = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_subscriptions
DROP TRIGGER IF EXISTS tr_update_subscription_status 
  ON user_subscriptions;

CREATE TRIGGER tr_update_subscription_status
  AFTER INSERT OR UPDATE
  ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();