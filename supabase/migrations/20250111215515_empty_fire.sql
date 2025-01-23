-- Add phone and provider fields to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number text UNIQUE,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS provider_id text,
ADD COLUMN IF NOT EXISTS provider_type text CHECK (provider_type IN ('google', 'phone', 'email'));

-- Create phone verifications table
CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create auth providers table
CREATE TABLE IF NOT EXISTS auth_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_type text NOT NULL CHECK (provider_type IN ('google', 'phone')),
  provider_id text NOT NULL,
  provider_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_type, provider_id)
);

-- Enable RLS
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_providers ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON phone_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_providers_user ON auth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_providers_provider ON auth_providers(provider_type, provider_id);

-- Create function to verify phone
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