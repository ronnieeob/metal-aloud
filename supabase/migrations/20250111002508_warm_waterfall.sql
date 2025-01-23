/*
  # Copyright System Enhancement

  1. Tables
    - Safely creates copyright tables if they don't exist
    - Updates existing tables with new columns/constraints
    - Adds RLS policies and indexes
  
  2. Functions
    - Updates registration function with latest logic
*/

-- Add protection level to existing table if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'copyright_registrations' 
    AND column_name = 'protection_level'
  ) THEN
    ALTER TABLE copyright_registrations 
    ADD COLUMN protection_level text NOT NULL 
    CHECK (protection_level IN ('basic', 'standard', 'premium'))
    DEFAULT 'basic';
  END IF;
END $$;

-- Update or create registration function
CREATE OR REPLACE FUNCTION register_copyright(
  p_song_id uuid,
  p_artist_id uuid,
  p_type text,
  p_metadata jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration_id uuid;
  v_fee decimal;
BEGIN
  -- Set fee based on type
  v_fee := CASE 
    WHEN p_type = 'automatic' THEN 29.99
    ELSE 9.99
  END;

  -- Create registration
  INSERT INTO copyright_registrations (
    song_id,
    artist_id,
    copyright_id,
    type,
    metadata
  ) VALUES (
    p_song_id,
    p_artist_id,
    'CR-' || substr(md5(random()::text), 1, 8),
    p_type,
    p_metadata
  ) RETURNING id INTO v_registration_id;

  -- Create transaction
  INSERT INTO copyright_transactions (
    registration_id,
    user_id,
    amount,
    type,
    status
  ) VALUES (
    v_registration_id,
    p_artist_id,
    v_fee,
    p_type || '_fee',
    'completed'
  );

  RETURN v_registration_id;
END;
$$;

-- Ensure RLS is enabled
DO $$ BEGIN
  ALTER TABLE copyright_registrations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE copyright_disputes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE copyright_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ BEGIN
  DROP POLICY IF EXISTS "Artists can view own copyright registrations" ON copyright_registrations;
  DROP POLICY IF EXISTS "Artists can create copyright registrations" ON copyright_registrations;
  DROP POLICY IF EXISTS "Users can create copyright disputes" ON copyright_disputes;
  DROP POLICY IF EXISTS "Users can view own copyright transactions" ON copyright_transactions;
END $$;

-- Create policies
CREATE POLICY "Artists can view own copyright registrations"
  ON copyright_registrations FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can create copyright registrations"
  ON copyright_registrations FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Users can create copyright disputes"
  ON copyright_disputes FOR INSERT
  TO authenticated
  WITH CHECK (claimant_id = auth.uid());

CREATE POLICY "Users can view own copyright transactions"
  ON copyright_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create or replace indexes
DROP INDEX IF EXISTS idx_copyright_song;
DROP INDEX IF EXISTS idx_copyright_artist;
DROP INDEX IF EXISTS idx_copyright_status;
DROP INDEX IF EXISTS idx_disputes_registration;
DROP INDEX IF EXISTS idx_disputes_status;

CREATE INDEX idx_copyright_song ON copyright_registrations(song_id);
CREATE INDEX idx_copyright_artist ON copyright_registrations(artist_id);
CREATE INDEX idx_copyright_status ON copyright_registrations(status);
CREATE INDEX idx_disputes_registration ON copyright_disputes(registration_id);
CREATE INDEX idx_disputes_status ON copyright_disputes(status);