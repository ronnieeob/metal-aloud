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
ALTER TABLE withdrawal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_commission_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Artists can manage own withdrawal settings" ON withdrawal_settings;
DROP POLICY IF EXISTS "Artists can view own payout schedules" ON payout_schedules;
DROP POLICY IF EXISTS "Artists can view own payout history" ON payout_history;
DROP POLICY IF EXISTS "Only admins can manage commission settings" ON admin_commission_settings;

CREATE POLICY "Artists can manage own withdrawal settings"
  ON withdrawal_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Artists can view own payout schedules"
  ON payout_schedules FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can view own payout history"
  ON payout_history FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Only admins can manage commission settings"
  ON admin_commission_settings FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

-- Create indexes
DROP INDEX IF EXISTS idx_withdrawal_settings_artist;
DROP INDEX IF EXISTS idx_payout_schedules_artist;
DROP INDEX IF EXISTS idx_payout_history_artist;
DROP INDEX IF EXISTS idx_commission_settings_amount;

CREATE INDEX IF NOT EXISTS idx_withdrawal_settings_artist ON withdrawal_settings(artist_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_artist ON payout_schedules(artist_id, next_payout_date);
CREATE INDEX IF NOT EXISTS idx_payout_history_artist ON payout_history(artist_id);
CREATE INDEX IF NOT EXISTS idx_commission_settings_amount ON admin_commission_settings(min_amount, max_amount);

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