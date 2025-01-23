-- Create withdrawal settings table
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

-- Create policy
CREATE POLICY "Artists can manage own withdrawal settings"
  ON withdrawal_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

-- Create index
CREATE INDEX IF NOT EXISTS idx_withdrawal_settings_artist ON withdrawal_settings(artist_id);