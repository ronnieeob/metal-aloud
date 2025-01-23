-- Create play rates table if not exists
CREATE TABLE IF NOT EXISTS play_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_plays integer NOT NULL,
  max_plays integer,
  rate decimal(10,4) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default play rates if not exists
INSERT INTO play_rates (min_plays, max_plays, rate)
SELECT * FROM (VALUES
  (0, 1000, 0.0050),
  (1001, 10000, 0.0075),
  (10001, 100000, 0.01),
  (100001, NULL, 0.015)
) AS v(min_plays, max_plays, rate)
WHERE NOT EXISTS (SELECT 1 FROM play_rates);

-- Enable RLS
ALTER TABLE play_rates ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Anyone can view play rates"
  ON play_rates FOR SELECT
  TO authenticated
  USING (true);