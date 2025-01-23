/*
  # Add Phone Authentication Support

  1. User Table Changes
    - Add phone number fields
    - Add phone verification status

  2. Security
    - Update existing policies
*/

-- Add phone verification fields to users if not exists
DO $$ BEGIN
  ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone_number text UNIQUE,
    ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create phone verifications table if not exists
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS phone_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number text NOT NULL,
    code text NOT NULL,
    expires_at timestamptz NOT NULL,
    attempts integer DEFAULT 0,
    verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS if not already enabled
DO $$ BEGIN
  ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can create phone verifications" ON phone_verifications;
  DROP POLICY IF EXISTS "Users can view own phone verifications" ON phone_verifications;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone_v2 ON phone_verifications(phone_number);
  CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_v2 ON phone_verifications(expires_at);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create or replace function to verify phone number
CREATE OR REPLACE FUNCTION verify_phone_number(
  p_phone_number text,
  p_code text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification phone_verifications;
BEGIN
  -- Get latest verification
  SELECT * INTO v_verification
  FROM phone_verifications
  WHERE phone_number = p_phone_number
    AND verified = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if verification exists and code matches
  IF v_verification IS NULL OR v_verification.code != p_code THEN
    -- Increment attempts
    UPDATE phone_verifications
    SET attempts = attempts + 1
    WHERE id = v_verification.id;
    
    RETURN false;
  END IF;

  -- Mark as verified
  UPDATE phone_verifications
  SET verified = true
  WHERE id = v_verification.id;

  -- Update user
  UPDATE users
  SET phone_verified = true
  WHERE phone_number = p_phone_number;

  RETURN true;
END;
$$;