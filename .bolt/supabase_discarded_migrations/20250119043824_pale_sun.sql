-- Drop the duplicate policy
DROP POLICY IF EXISTS "Artists can manage own withdrawal settings" ON withdrawal_settings;
DROP POLICY IF EXISTS "Artist withdrawal settings management v3" ON withdrawal_settings;

-- Create policy with unique name
CREATE POLICY "Artist withdrawal settings management v4"
  ON withdrawal_settings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

-- Create index with unique name if not exists
CREATE INDEX IF NOT EXISTS idx_withdrawal_settings_artist_v4 
  ON withdrawal_settings(artist_id);