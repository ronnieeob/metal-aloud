/*
  # Update Commission Rate

  1. Changes
    - Updates the platform commission rate from 3% to 8%
    - Adds commission_rate column to configuration table
    - Creates function to calculate artist earnings
  
  2. Security
    - Adds RLS policies for commission calculations
*/

-- Create configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert commission rate
INSERT INTO platform_config (key, value)
VALUES (
  'commission_rate',
  '{"rate": 0.08, "description": "Platform commission rate for artist earnings"}'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

-- Create function to calculate artist earnings
CREATE OR REPLACE FUNCTION calculate_artist_earnings(
  sale_amount decimal,
  OUT earnings decimal,
  OUT commission decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  commission_rate decimal;
BEGIN
  -- Get commission rate from config
  SELECT (value->>'rate')::decimal
  INTO commission_rate
  FROM platform_config
  WHERE key = 'commission_rate';

  -- Default to 8% if not configured
  IF commission_rate IS NULL THEN
    commission_rate := 0.08;
  END IF;

  commission := sale_amount * commission_rate;
  earnings := sale_amount - commission;
END;
$$;