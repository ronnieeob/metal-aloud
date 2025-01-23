-- Create copyright registrations table
CREATE TABLE copyright_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs ON DELETE CASCADE,
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  registration_date timestamptz DEFAULT now(),
  copyright_id text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  type text NOT NULL CHECK (type IN ('automatic', 'manual')),
  metadata jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create copyright disputes table
CREATE TABLE copyright_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES copyright_registrations ON DELETE CASCADE,
  claimant_id uuid REFERENCES users ON DELETE CASCADE,
  reason text NOT NULL,
  evidence jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create copyright transactions table
CREATE TABLE copyright_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES copyright_registrations ON DELETE CASCADE,
  user_id uuid REFERENCES users ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('registration_fee', 'automatic_fee', 'dispute_fee')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE copyright_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_transactions ENABLE ROW LEVEL SECURITY;

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

-- Create indexes
CREATE INDEX idx_copyright_song ON copyright_registrations(song_id);
CREATE INDEX idx_copyright_artist ON copyright_registrations(artist_id);
CREATE INDEX idx_copyright_status ON copyright_registrations(status);
CREATE INDEX idx_disputes_registration ON copyright_disputes(registration_id);
CREATE INDEX idx_disputes_status ON copyright_disputes(status);

-- Create function to handle copyright registration
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