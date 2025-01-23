-- Check if tables exist before creating them
DO $$ BEGIN
  -- Create play rates table if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'play_rates') THEN
    CREATE TABLE play_rates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      min_plays integer NOT NULL,
      max_plays integer,
      rate decimal(10,4) NOT NULL, -- Rate per play in USD
      created_at timestamptz DEFAULT now()
    );

    -- Insert default play rates
    INSERT INTO play_rates (min_plays, max_plays, rate) VALUES
      (0, 1000, 0.0050),      -- $0.005 per play up to 1000 plays
      (1001, 10000, 0.0075),  -- $0.0075 per play up to 10000 plays
      (10001, 100000, 0.01),  -- $0.01 per play up to 100000 plays
      (100001, NULL, 0.015);  -- $0.015 per play above 100000 plays
  END IF;

  -- Create song plays table if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'song_plays') THEN
    CREATE TABLE song_plays (
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
  END IF;

  -- Create play earnings table if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'play_earnings') THEN
    CREATE TABLE play_earnings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id uuid REFERENCES users ON DELETE CASCADE,
      period_start timestamptz NOT NULL,
      period_end timestamptz NOT NULL,
      total_plays integer NOT NULL,
      earnings decimal(10,2) NOT NULL,
      status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- Enable RLS if not already enabled
  ALTER TABLE play_rates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE song_plays ENABLE ROW LEVEL SECURITY;
  ALTER TABLE play_earnings ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can view play rates" ON play_rates;
  DROP POLICY IF EXISTS "Artists can view own song plays" ON song_plays;
  DROP POLICY IF EXISTS "Users can create song plays" ON song_plays;
  DROP POLICY IF EXISTS "Artists can view own earnings" ON play_earnings;

  -- Create policies
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

  -- Drop existing indexes if they exist
  DROP INDEX IF EXISTS idx_song_plays_song;
  DROP INDEX IF EXISTS idx_song_plays_artist;
  DROP INDEX IF EXISTS idx_song_plays_date;
  DROP INDEX IF EXISTS idx_play_earnings_artist;
  DROP INDEX IF EXISTS idx_play_earnings_period;

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_song_plays_song ON song_plays(song_id);
  CREATE INDEX IF NOT EXISTS idx_song_plays_artist ON song_plays(artist_id);
  CREATE INDEX IF NOT EXISTS idx_song_plays_date ON song_plays(played_at);
  CREATE INDEX IF NOT EXISTS idx_play_earnings_artist ON play_earnings(artist_id);
  CREATE INDEX IF NOT EXISTS idx_play_earnings_period ON play_earnings(period_start, period_end);

EXCEPTION
  WHEN others THEN
    -- Log any errors but continue
    RAISE NOTICE 'Error creating tables: %', SQLERRM;
END $$;

-- Create or replace function to calculate play rate
CREATE OR REPLACE FUNCTION get_play_rate(play_count integer)
RETURNS decimal
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate decimal;
BEGIN
  SELECT rate INTO v_rate
  FROM play_rates
  WHERE play_count >= min_plays 
    AND (max_plays IS NULL OR play_count <= max_plays)
  ORDER BY min_plays DESC
  LIMIT 1;

  RETURN COALESCE(v_rate, 0.005); -- Default to $0.005 per play
END;
$$;

-- Create or replace function to record song play
CREATE OR REPLACE FUNCTION record_song_play(
  p_song_id uuid,
  p_user_id uuid,
  p_duration integer,
  p_completed boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_artist_id uuid;
  v_play_count integer;
  v_rate decimal;
  v_play_id uuid;
BEGIN
  -- Get artist ID from song
  SELECT artist_id INTO v_artist_id
  FROM songs
  WHERE id = p_song_id;

  -- Get play count for rate calculation
  SELECT COUNT(*) INTO v_play_count
  FROM song_plays
  WHERE artist_id = v_artist_id
    AND played_at >= date_trunc('month', now());

  -- Calculate rate based on play count
  v_rate := get_play_rate(v_play_count);

  -- Insert play record
  INSERT INTO song_plays (
    song_id,
    user_id,
    artist_id,
    duration_played,
    completed,
    earnings
  ) VALUES (
    p_song_id,
    p_user_id,
    v_artist_id,
    p_duration,
    p_completed,
    CASE 
      WHEN p_completed THEN v_rate
      ELSE v_rate * (p_duration::decimal / 30) -- Prorated for partial plays
    END
  ) RETURNING id INTO v_play_id;

  RETURN v_play_id;
END;
$$;