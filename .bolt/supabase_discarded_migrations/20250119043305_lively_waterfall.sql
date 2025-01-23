-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view play rates" ON play_rates;

-- Create play rates table if not exists
CREATE TABLE IF NOT EXISTS play_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_plays integer NOT NULL,
  max_plays integer,
  rate decimal(10,4) NOT NULL, -- Rate per play in USD
  created_at timestamptz DEFAULT now()
);

-- Insert default play rates
INSERT INTO play_rates (min_plays, max_plays, rate)
SELECT * FROM (VALUES
  (0, 1000, 0.0050),      -- $0.005 per play up to 1000 plays
  (1001, 10000, 0.0075),  -- $0.0075 per play up to 10000 plays
  (10001, 100000, 0.01),  -- $0.01 per play up to 100000 plays
  (100001, NULL, 0.015)   -- $0.015 per play above 100000 plays
) AS v(min_plays, max_plays, rate)
WHERE NOT EXISTS (SELECT 1 FROM play_rates);

-- Enable RLS
ALTER TABLE play_rates ENABLE ROW LEVEL SECURITY;

-- Create policy with unique name
CREATE POLICY "View play rates v2"
  ON play_rates FOR SELECT
  TO authenticated
  USING (true);