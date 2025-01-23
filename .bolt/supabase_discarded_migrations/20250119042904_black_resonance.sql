-- Create function to schedule automatic payouts
CREATE OR REPLACE FUNCTION schedule_automatic_payout(
  p_artist_id uuid,
  p_amount decimal,
  p_schedule text
) RETURNS uuid AS $$
  WITH schedule_insert AS (
    INSERT INTO payout_schedules (
      artist_id,
      next_payout_date,
      amount
    ) VALUES (
      p_artist_id,
      CASE p_schedule
        WHEN 'weekly' THEN date_trunc('week', now()) + interval '1 week'
        WHEN 'biweekly' THEN date_trunc('week', now()) + interval '2 weeks'
        WHEN 'monthly' THEN date_trunc('month', now()) + interval '1 month'
      END,
      p_amount
    ) RETURNING id
  )
  SELECT id FROM schedule_insert;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create function to process automatic payouts
CREATE OR REPLACE FUNCTION process_automatic_payouts() RETURNS void AS $$
BEGIN
  -- Process pending payouts
  WITH pending_payouts AS (
    SELECT 
      ps.*,
      ws.bank_details,
      COALESCE(
        (
          SELECT commission_rate
          FROM admin_commission_settings acs
          WHERE ps.amount >= acs.min_amount 
            AND (acs.max_amount IS NULL OR ps.amount <= acs.max_amount)
          ORDER BY acs.min_amount DESC
          LIMIT 1
        ),
        8.0 -- Default commission rate
      ) as commission_rate
    FROM payout_schedules ps
    JOIN withdrawal_settings ws ON ws.artist_id = ps.artist_id
    WHERE ps.status = 'pending'
    AND ps.next_payout_date <= now()
    FOR UPDATE
  ),
  processed_payouts AS (
    INSERT INTO payout_history (
      artist_id,
      amount,
      commission_amount,
      commission_rate,
      bank_details,
      transaction_id
    )
    SELECT
      artist_id,
      amount,
      amount * (commission_rate / 100),
      commission_rate,
      bank_details,
      'TX-' || substr(md5(random()::text), 1, 8)
    FROM pending_payouts
    RETURNING artist_id, next_payout_date, amount
  ),
  update_schedules AS (
    UPDATE payout_schedules ps
    SET status = 'completed'
    FROM pending_payouts pp
    WHERE ps.id = pp.id
  )
  INSERT INTO payout_schedules (
    artist_id,
    next_payout_date,
    amount,
    status
  )
  SELECT
    pp.artist_id,
    CASE ws.withdrawal_schedule
      WHEN 'weekly' THEN pp.next_payout_date + interval '1 week'
      WHEN 'biweekly' THEN pp.next_payout_date + interval '2 weeks'
      WHEN 'monthly' THEN pp.next_payout_date + interval '1 month'
    END,
    pp.amount,
    'pending'
  FROM processed_payouts pp
  JOIN withdrawal_settings ws ON ws.artist_id = pp.artist_id
  WHERE ws.auto_withdrawal = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;