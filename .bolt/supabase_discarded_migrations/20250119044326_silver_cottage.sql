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

-- Enable RLS
ALTER TABLE withdrawal_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Artists can manage own withdrawal settings" ON withdrawal_settings;
DROP POLICY IF EXISTS "withdrawal_settings_management_v5" ON withdrawal_settings;

-- Create policy with unique name
CREATE POLICY "withdrawal_settings_management_v6"
  ON withdrawal_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_withdrawal_settings_artist;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v2;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v3;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v4;
DROP INDEX IF EXISTS idx_withdrawal_settings_artist_v5;

-- Create index with unique name
CREATE INDEX IF NOT EXISTS idx_withdrawal_settings_artist_v6 
  ON withdrawal_settings(artist_id);