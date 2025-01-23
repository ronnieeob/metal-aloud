-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Artists can view own earnings" ON play_earnings;

-- Create play earnings table if not exists
CREATE TABLE IF NOT EXISTS play_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_plays integer NOT NULL,
  earnings decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE play_earnings ENABLE ROW LEVEL SECURITY;

-- Create policy with unique name
CREATE POLICY "Artist earnings view v2"
  ON play_earnings FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_play_earnings_artist;
DROP INDEX IF EXISTS idx_play_earnings_period;

-- Create indexes with unique names
CREATE INDEX IF NOT EXISTS idx_play_earnings_artist_v2 ON play_earnings(artist_id);
CREATE INDEX IF NOT EXISTS idx_play_earnings_period_v2 ON play_earnings(period_start, period_end);