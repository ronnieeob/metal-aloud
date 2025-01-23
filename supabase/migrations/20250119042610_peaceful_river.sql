-- Create play rates table if not exists
CREATE TABLE IF NOT EXISTS play_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_plays integer NOT NULL,
  max_plays integer,
  rate decimal(10,4) NOT NULL, -- Rate per play in USD
  created_at timestamptz DEFAULT now()
);

-- Insert default play rates if not exists
INSERT INTO play_rates (min_plays, max_plays, rate)
SELECT * FROM (VALUES
  (0, 1000, 0.0050),      -- $0.005 per play up to 1000 plays
  (1001, 10000, 0.0075),  -- $0.0075 per play up to 10000 plays
  (10001, 100000, 0.01),  -- $0.01 per play up to 100000 plays
  (100001, NULL, 0.015)   -- $0.015 per play above 100000 plays
) AS v(min_plays, max_plays, rate)
WHERE NOT EXISTS (SELECT 1 FROM play_rates);

-- Create song plays table if not exists
CREATE TABLE IF NOT EXISTS song_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES songs ON DELETE CASCADE,
  user_id uuid REFERENCES users ON DELETE SET NULL,
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  played_at timestamptz DEFAULT now(),
  duration_played integer NOT NULL, -- Duration played in seconds
  completed boolean DEFAULT false,  -- Whether the song was played to completion
  earnings decimal(10,4),          -- Earnings for this play
  processed boolean DEFAULT false   -- Whether earnings have been processed
);

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
ALTER TABLE play_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_earnings ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view play rates" ON play_rates;
DROP POLICY IF EXISTS "Artists can view own song plays" ON song_plays;
DROP POLICY IF EXISTS "Users can create song plays" ON song_plays;
DROP POLICY IF EXISTS "Artists can view own earnings" ON play_earnings;

CREATE POLICY "Anyone can view play rates"
  ON play_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can view own song plays"
  ON song_plays FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Users can create song plays"
  ON song_plays FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Artists can view own earnings"
  ON play_earnings FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

-- Create indexes
DROP INDEX IF EXISTS idx_song_plays_song;
DROP INDEX IF EXISTS idx_song_plays_artist;
DROP INDEX IF EXISTS idx_song_plays_date;
DROP INDEX IF EXISTS idx_play_earnings_artist;
DROP INDEX IF EXISTS idx_play_earnings_period;

CREATE INDEX IF NOT EXISTS idx_song_plays_song ON song_plays(song_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_artist ON song_plays(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_date ON song_plays(played_at);
CREATE INDEX IF NOT EXISTS idx_play_earnings_artist ON play_earnings(artist_id);
CREATE INDEX IF NOT EXISTS idx_play_earnings_period ON play_earnings(period_start, period_end);

-- Create function to calculate play rate
CREATE OR REPLACE FUNCTION get_play_rate(play_count integer)
RETURNS decimal AS $$
  SELECT COALESCE(
    (
      SELECT rate
      FROM play_rates
      WHERE play_count >= min_plays 
        AND (max_plays IS NULL OR play_count <= max_plays)
      ORDER BY min_plays DESC
      LIMIT 1
    ),
    0.005 -- Default to $0.005 per play
  );
$$ LANGUAGE sql SECURITY DEFINER;