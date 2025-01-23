-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create phone verifications" ON phone_verifications;
DROP POLICY IF EXISTS "Users can view own phone verifications" ON phone_verifications;

-- Create policies for phone verifications
CREATE POLICY "Anyone can create phone verifications"
  ON phone_verifications FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own phone verifications"
  ON phone_verifications FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create function to handle phone verification
CREATE OR REPLACE FUNCTION handle_phone_verification(
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

  -- Update user if exists
  UPDATE users
  SET phone_verified = true
  WHERE phone_number = p_phone_number;

  RETURN true;
END;
$$;