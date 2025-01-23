-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Artists can view own song plays" ON song_plays;
DROP POLICY IF EXISTS "Users can create song plays" ON song_plays;

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

-- Enable RLS
ALTER TABLE song_plays ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "View song plays v2"
  ON song_plays FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Create song plays v2"
  ON song_plays FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_song_plays_song;
DROP INDEX IF EXISTS idx_song_plays_artist;
DROP INDEX IF EXISTS idx_song_plays_date;

-- Create indexes with unique names
CREATE INDEX IF NOT EXISTS idx_song_plays_song_v2 ON song_plays(song_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_artist_v2 ON song_plays(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_date_v2 ON song_plays(played_at);