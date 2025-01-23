/*
  # Artist Earnings Management System

  1. New Tables
    - `withdrawal_settings` - Store withdrawal preferences
    - `payout_schedules` - Configure automatic payout schedules
    - `payout_history` - Track all payouts
    - `admin_commission_settings` - Store admin commission configuration

  2. Changes
    - Add automatic withdrawal support
    - Add admin commission management
    - Add payout scheduling

  3. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Create withdrawal settings table
CREATE TABLE withdrawal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  auto_withdrawal boolean DEFAULT false,
  min_withdrawal_amount decimal(10,2) DEFAULT 50.00,
  withdrawal_schedule text CHECK (withdrawal_schedule IN ('weekly', 'biweekly', 'monthly')),
  bank_details jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payout schedules table
CREATE TABLE payout_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES users ON DELETE CASCADE,
  next_payout_date timestamptz NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create payout history table
CREATE TABLE payout_history (
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

-- Create admin commission settings table
CREATE TABLE admin_commission_settings (
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
CREATE INDEX idx_withdrawal_settings_artist ON withdrawal_settings(artist_id);
CREATE INDEX idx_payout_schedules_artist ON payout_schedules(artist_id, next_payout_date);
CREATE INDEX idx_payout_history_artist ON payout_history(artist_id);
CREATE INDEX idx_commission_settings_amount ON admin_commission_settings(min_amount, max_amount);

-- Insert default commission tiers
INSERT INTO admin_commission_settings 
  (min_amount, max_amount, commission_rate, description)
VALUES
  (0, 1000, 8, 'Standard rate for earnings up to $1,000'),
  (1000.01, 5000, 7, 'Reduced rate for earnings between $1,000 and $5,000'),
  (5000.01, 10000, 6, 'Premium rate for earnings between $5,000 and $10,000'),
  (10000.01, NULL, 5, 'Elite rate for earnings above $10,000');

-- Create function to schedule automatic payouts
CREATE OR REPLACE FUNCTION schedule_automatic_payout(
  p_artist_id uuid,
  p_amount decimal,
  p_schedule text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_date timestamptz;
  v_schedule_id uuid;
BEGIN
  -- Calculate next payout date based on schedule
  v_next_date := CASE p_schedule
    WHEN 'weekly' THEN date_trunc('week', now()) + interval '1 week'
    WHEN 'biweekly' THEN date_trunc('week', now()) + interval '2 weeks'
    WHEN 'monthly' THEN date_trunc('month', now()) + interval '1 month'
  END;

  -- Create payout schedule
  INSERT INTO payout_schedules (
    artist_id,
    next_payout_date,
    amount
  ) VALUES (
    p_artist_id,
    v_next_date,
    p_amount
  ) RETURNING id INTO v_schedule_id;

  RETURN v_schedule_id;
END;
$$;

-- Create function to process automatic payouts
CREATE OR REPLACE FUNCTION process_automatic_payouts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payout record;
  v_commission_rate decimal;
  v_commission_amount decimal;
BEGIN
  -- Get all pending payouts that are due
  FOR v_payout IN 
    SELECT * FROM payout_schedules
    WHERE status = 'pending'
    AND next_payout_date <= now()
  LOOP
    -- Get commission rate for amount
    SELECT commission_rate INTO v_commission_rate
    FROM admin_commission_settings
    WHERE v_payout.amount >= min_amount 
    AND (max_amount IS NULL OR v_payout.amount <= max_amount)
    ORDER BY min_amount DESC
    LIMIT 1;

    -- Calculate commission
    v_commission_amount := v_payout.amount * (v_commission_rate / 100);

    -- Create payout record
    INSERT INTO payout_history (
      artist_id,
      amount,
      commission_amount,
      commission_rate,
      bank_details,
      transaction_id
    )
    SELECT
      v_payout.artist_id,
      v_payout.amount,
      v_commission_amount,
      v_commission_rate,
      ws.bank_details,
      'TX-' || substr(md5(random()::text), 1, 8)
    FROM withdrawal_settings ws
    WHERE ws.artist_id = v_payout.artist_id;

    -- Update payout schedule status
    UPDATE payout_schedules
    SET status = 'completed'
    WHERE id = v_payout.id;

    -- Schedule next payout
    INSERT INTO payout_schedules (
      artist_id,
      next_payout_date,
      amount,
      status
    )
    SELECT
      v_payout.artist_id,
      CASE ws.withdrawal_schedule
        WHEN 'weekly' THEN v_payout.next_payout_date + interval '1 week'
        WHEN 'biweekly' THEN v_payout.next_payout_date + interval '2 weeks'
        WHEN 'monthly' THEN v_payout.next_payout_date + interval '1 month'
      END,
      v_payout.amount,
      'pending'
    FROM withdrawal_settings ws
    WHERE ws.artist_id = v_payout.artist_id
    AND ws.auto_withdrawal = true;
  END LOOP;
END;
$$;