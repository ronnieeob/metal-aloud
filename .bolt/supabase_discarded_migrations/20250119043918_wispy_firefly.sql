-- Drop duplicate policies
DROP POLICY IF EXISTS "Artists can manage own withdrawal settings" ON withdrawal_settings;
DROP POLICY IF EXISTS "Artist withdrawal settings management v2" ON withdrawal_settings;
DROP POLICY IF EXISTS "Artist withdrawal settings management v3" ON withdrawal_settings;
DROP POLICY IF EXISTS "Artist withdrawal settings management v4" ON withdrawal_settings;

-- Drop duplicate play rate policies
DROP POLICY IF EXISTS "Anyone can view play rates" ON play_rates;
DROP POLICY IF EXISTS "Play rates are viewable by all users v2" ON play_rates;
DROP POLICY IF EXISTS "View play rates v2" ON play_rates;

-- Drop duplicate song play policies
DROP POLICY IF EXISTS "Artists can view own song plays" ON song_plays;
DROP POLICY IF EXISTS "Users can create song plays" ON song_plays;
DROP POLICY IF EXISTS "Artist song plays view v2" ON song_plays;
DROP POLICY IF EXISTS "User song plays creation v2" ON song_plays;
DROP POLICY IF EXISTS "View song plays v2" ON song_plays;
DROP POLICY IF EXISTS "Create song plays v2" ON song_plays;

-- Drop duplicate earnings policies
DROP POLICY IF EXISTS "Artists can view own earnings" ON play_earnings;
DROP POLICY IF EXISTS "Artist earnings view v2" ON play_earnings;
DROP POLICY IF EXISTS "View artist earnings v2" ON play_earnings;

-- Create clean policies with unique names
CREATE POLICY "withdrawal_settings_management_v5"
  ON withdrawal_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "play_rates_view_v5"
  ON play_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "song_plays_view_v5"
  ON song_plays FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "song_plays_create_v5"
  ON song_plays FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "play_earnings_view_v5"
  ON play_earnings FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

-- Drop duplicate indexes
DROP INDEX IF EXISTS idx_withdrawal_settings_artist;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v2;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v3;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v4;

DROP INDEX IF EXISTS idx_song_plays_song;
DROP INDEX IF EXISTS idx_song_plays_artist;
DROP INDEX IF EXISTS idx_song_plays_date;
DROP INDEX IF EXISTS idx_song_plays_song_v2;
DROP INDEX IF EXISTS idx_song_plays_artist_v2;
DROP INDEX IF EXISTS idx_song_plays_date_v2;

DROP INDEX IF EXISTS idx_play_earnings_artist;
DROP INDEX IF EXISTS idx_play_earnings_period;
DROP INDEX IF EXISTS idx_play_earnings_artist_v2;
DROP INDEX IF EXISTS idx_play_earnings_period_v2;

-- Create clean indexes with unique names
CREATE INDEX IF NOT EXISTS idx_withdrawal_settings_artist_v5 
  ON withdrawal_settings(artist_id);

CREATE INDEX IF NOT EXISTS idx_song_plays_song_v5 
  ON song_plays(song_id);

CREATE INDEX IF NOT EXISTS idx_song_plays_artist_v5 
  ON song_plays(artist_id);

CREATE INDEX IF NOT EXISTS idx_song_plays_date_v5 
  ON song_plays(played_at);

CREATE INDEX IF NOT EXISTS idx_play_earnings_artist_v5 
  ON play_earnings(artist_id);

CREATE INDEX IF NOT EXISTS idx_play_earnings_period_v5 
  ON play_earnings(period_start, period_end);