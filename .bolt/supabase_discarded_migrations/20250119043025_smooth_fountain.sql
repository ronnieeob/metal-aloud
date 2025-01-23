-- Create play rates table if not exists
CREATE TABLE IF NOT EXISTS play_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_plays integer NOT NULL,
  max_plays integer,
  rate decimal(10,4) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default play rates if none exist
INSERT INTO play_rates (min_plays, max_plays, rate)
SELECT * FROM (VALUES
  (0, 1000, 0.0050),
  (1001, 10000, 0.0075),
  (10001, 100000, 0.01),
  (100001, NULL, 0.015)
) AS v(min_plays, max_plays, rate)
WHERE NOT EXISTS (SELECT 1 FROM play_rates);

-- Create withdrawal settings table if not exists
CREATE TABLE IF NOT EXISTS withdrawal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  auto_withdrawal boolean DEFAULT false,
  min_withdrawal_amount decimal(10,2) DEFAULT 50.00,
  withdrawal_schedule text CHECK (withdrawal_schedule IN ('weekly', 'biweekly', 'monthly')),
  bank_details jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payout schedules table if not exists
CREATE TABLE IF NOT EXISTS payout_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  next_payout_date timestamptz NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create payout history table if not exists
CREATE TABLE IF NOT EXISTS payout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  commission_amount decimal(10,2) NOT NULL,
  commission_rate decimal(4,2) NOT NULL,
  bank_details jsonb NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'reversed')),
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- Create admin commission settings table if not exists
CREATE TABLE IF NOT EXISTS admin_commission_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_amount decimal(10,2) NOT NULL,
  max_amount decimal(10,2),
  commission_rate decimal(4,2) NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE play_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_commission_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view play rates" ON play_rates;
DROP POLICY IF EXISTS "Artists can manage own withdrawal settings" ON withdrawal_settings;
DROP POLICY IF EXISTS "Artists can view own payout schedules" ON payout_schedules;
DROP POLICY IF EXISTS "Artists can view own payout history" ON payout_history;
DROP POLICY IF EXISTS "Only admins can manage commission settings" ON admin_commission_settings;

-- Create new policies with unique names
CREATE POLICY "Play rates viewable by all v2"
  ON play_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artist withdrawal settings management v2"
  ON withdrawal_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Artist payout schedules view v2"
  ON payout_schedules FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artist payout history view v2"
  ON payout_history FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Admin commission settings management v2"
  ON admin_commission_settings FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_settings_artist_v2 ON withdrawal_settings(artist_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_artist_v2 ON payout_schedules(artist_id, next_payout_date);
CREATE INDEX IF NOT EXISTS idx_payout_history_artist_v2 ON payout_history(artist_id);
CREATE INDEX IF NOT EXISTS idx_commission_settings_amount_v2 ON admin_commission_settings(min_amount, max_amount);

-- Insert default commission tiers if not exists
INSERT INTO admin_commission_settings 
  (min_amount, max_amount, commission_rate, description)
SELECT * FROM (VALUES
  (0::decimal, 1000::decimal, 8::decimal, 'Standard rate for earnings up to $1,000'),
  (1000.01::decimal, 5000::decimal, 7::decimal, 'Reduced rate for earnings between $1,000 and $5,000'),
  (5000.01::decimal, 10000::decimal, 6::decimal, 'Premium rate for earnings between $5,000 and $10,000'),
  (10000.01::decimal, NULL::decimal, 5::decimal, 'Elite rate for earnings above $10,000')
) AS v(min_amount, max_amount, commission_rate, description)
WHERE NOT EXISTS (SELECT 1 FROM admin_commission_settings);

-- Create function to get play rate
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

-- Create function to get commission rate
CREATE OR REPLACE FUNCTION get_commission_rate(amount decimal)
RETURNS decimal AS $$
  SELECT COALESCE(
    (
      SELECT commission_rate
      FROM admin_commission_settings
      WHERE amount >= min_amount 
        AND (max_amount IS NULL OR amount <= max_amount)
        AND active = true
      ORDER BY min_amount DESC
      LIMIT 1
    ),
    8.0 -- Default to 8%
  );
$$ LANGUAGE sql SECURITY DEFINER;