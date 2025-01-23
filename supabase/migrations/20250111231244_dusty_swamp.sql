/*
  # Add Email Authentication Support

  1. User Table Changes
    - Add email verification status
    - Add email verification token fields

  2. Security
    - Add policies for email verification
*/

-- Add email verification fields to users if not exists
DO $$ BEGIN
  ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verification_token text,
    ADD COLUMN IF NOT EXISTS email_verification_sent_at timestamptz;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create email verifications table if not exists
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS email_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamptz NOT NULL,
    verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS if not already enabled
DO $$ BEGIN
  ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can create email verifications" ON email_verifications;
  DROP POLICY IF EXISTS "Users can view own email verifications" ON email_verifications;
END $$;

-- Create policies
CREATE POLICY "Anyone can create email verifications"
  ON email_verifications FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own email verifications"
  ON email_verifications FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
  CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create function to verify email
CREATE OR REPLACE FUNCTION verify_email(
  p_email text,
  p_token text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification email_verifications;
BEGIN
  -- Get latest verification
  SELECT * INTO v_verification
  FROM email_verifications
  WHERE email = p_email
    AND verified = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if verification exists and token matches
  IF v_verification IS NULL OR v_verification.token != p_token THEN
    RETURN false;
  END IF;

  -- Mark as verified
  UPDATE email_verifications
  SET verified = true
  WHERE id = v_verification.id;

  -- Update user
  UPDATE users
  SET email_verified = true
  WHERE email = p_email;

  RETURN true;
END;
$$;