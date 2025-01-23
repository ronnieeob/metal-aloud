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

-- Create function to record song play
CREATE OR REPLACE FUNCTION record_song_play(
  p_song_id uuid,
  p_user_id uuid,
  p_duration integer,
  p_completed boolean
)
RETURNS uuid AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;