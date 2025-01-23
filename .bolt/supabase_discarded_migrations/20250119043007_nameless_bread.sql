-- Drop existing policy first
DROP POLICY IF EXISTS "Anyone can view play rates" ON play_rates;

-- Create new policy with unique name
CREATE POLICY "Play rates are viewable by all users v2"
  ON play_rates FOR SELECT
  TO authenticated
  USING (true);

-- Create function to calculate play rate if it doesn't exist
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