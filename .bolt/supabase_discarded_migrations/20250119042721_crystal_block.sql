-- Create admin commission settings table
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
ALTER TABLE admin_commission_settings ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Only admins can manage commission settings"
  ON admin_commission_settings FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

-- Create index
CREATE INDEX IF NOT EXISTS idx_commission_settings_amount ON admin_commission_settings(min_amount, max_amount);

-- Insert default commission tiers
INSERT INTO admin_commission_settings 
  (min_amount, max_amount, commission_rate, description)
SELECT * FROM (VALUES
  (0::decimal, 1000::decimal, 8::decimal, 'Standard rate for earnings up to $1,000'),
  (1000.01::decimal, 5000::decimal, 7::decimal, 'Reduced rate for earnings between $1,000 and $5,000'),
  (5000.01::decimal, 10000::decimal, 6::decimal, 'Premium rate for earnings between $5,000 and $10,000'),
  (10000.01::decimal, NULL::decimal, 5::decimal, 'Elite rate for earnings above $10,000')
) AS v(min_amount, max_amount, commission_rate, description)
WHERE NOT EXISTS (SELECT 1 FROM admin_commission_settings);