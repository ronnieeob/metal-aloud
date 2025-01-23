-- Drop existing policies first
DROP POLICY IF EXISTS "Commission tiers are viewable by all" ON commission_tiers;
DROP POLICY IF EXISTS "Artists can view own commission history" ON commission_history;
DROP INDEX IF EXISTS commission_history_artist_idx_v2;
DROP INDEX IF EXISTS commission_history_period_idx_v2;
DROP INDEX IF EXISTS commission_history_status_idx_v2;

-- Create commission tiers table if not exists
CREATE TABLE IF NOT EXISTS commission_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_amount decimal(10,2) NOT NULL,
  max_amount decimal(10,2),
  rate decimal(4,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert commission tiers
INSERT INTO commission_tiers (min_amount, max_amount, rate) VALUES
  (0, 1000, 8),
  (1000.01, 5000, 7),
  (5000.01, 10000, 6),
  (10000.01, NULL, 5)
ON CONFLICT DO NOTHING;

-- Create commission history table if not exists
CREATE TABLE IF NOT EXISTS commission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  gross_revenue decimal(10,2) NOT NULL,
  commission_amount decimal(10,2) NOT NULL,
  effective_rate decimal(4,2) NOT NULL,
  payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create function to calculate commission rate
CREATE OR REPLACE FUNCTION calculate_commission_rate(gross_amount decimal)
RETURNS decimal
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate decimal;
BEGIN
  SELECT rate INTO v_rate
  FROM commission_tiers
  WHERE gross_amount >= min_amount 
    AND (max_amount IS NULL OR gross_amount <= max_amount)
  ORDER BY min_amount DESC
  LIMIT 1;

  RETURN COALESCE(v_rate, 8.0); -- Default to 8% if no tier matches
END;
$$;

-- Create function to calculate earnings
CREATE OR REPLACE FUNCTION calculate_artist_earnings(
  gross_amount decimal,
  OUT net_amount decimal,
  OUT commission_amount decimal,
  OUT effective_rate decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  effective_rate := calculate_commission_rate(gross_amount);
  commission_amount := (gross_amount * effective_rate / 100)::decimal(10,2);
  net_amount := gross_amount - commission_amount;
END;
$$;

-- Create view for artist earnings summary
CREATE OR REPLACE VIEW artist_earnings_summary AS
SELECT 
  artist_id,
  date_trunc('month', period_start) as month,
  SUM(gross_revenue) as total_gross,
  SUM(commission_amount) as total_commission,
  AVG(effective_rate) as avg_commission_rate,
  SUM(gross_revenue - commission_amount) as net_earnings
FROM commission_history
GROUP BY artist_id, date_trunc('month', period_start);

-- Enable RLS
ALTER TABLE commission_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_history ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "View commission tiers policy v4" 
  ON commission_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "View commission history policy v4"
  ON commission_history FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

-- Create new indexes with unique names
CREATE INDEX IF NOT EXISTS commission_history_artist_idx_v4 
  ON commission_history(artist_id);
CREATE INDEX IF NOT EXISTS commission_history_period_idx_v4 
  ON commission_history(period_start, period_end);
CREATE INDEX IF NOT EXISTS commission_history_status_idx_v4 
  ON commission_history(payout_status);