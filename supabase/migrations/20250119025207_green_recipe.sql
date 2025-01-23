-- Create location insights table
CREATE TABLE location_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  region text NOT NULL,
  user_count integer NOT NULL DEFAULT 0,
  active_users integer NOT NULL DEFAULT 0,
  top_genres jsonb NOT NULL DEFAULT '[]',
  growth_rate decimal(5,2) NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create location activity table
CREATE TABLE location_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  activity_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE location_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_activity ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view location insights"
  ON location_insights FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

CREATE POLICY "Record user activity"
  ON location_activity FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_location_insights_country ON location_insights(country);
CREATE INDEX idx_location_insights_period ON location_insights(period_start, period_end);
CREATE INDEX idx_location_activity_country ON location_activity(country);
CREATE INDEX idx_location_activity_user ON location_activity(user_id);

-- Create function to update location insights
CREATE OR REPLACE FUNCTION update_location_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Set period for last 30 days
  v_period_end := date_trunc('day', now());
  v_period_start := v_period_end - interval '30 days';

  -- Insert or update location insights
  INSERT INTO location_insights (
    country,
    region,
    user_count,
    active_users,
    top_genres,
    growth_rate,
    period_start,
    period_end
  )
  SELECT
    u.country,
    CASE
      WHEN u.country IN ('United States', 'Canada', 'Mexico') THEN 'North America'
      WHEN u.country IN ('Germany', 'United Kingdom', 'Sweden', 'Norway', 'Finland') THEN 'Europe'
      WHEN u.country IN ('Japan', 'South Korea', 'China', 'India') THEN 'Asia'
      WHEN u.country IN ('Brazil', 'Argentina', 'Chile') THEN 'South America'
      WHEN u.country IN ('Australia', 'New Zealand') THEN 'Oceania'
      ELSE 'Other'
    END as region,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT CASE 
      WHEN EXISTS (
        SELECT 1 FROM location_activity la 
        WHERE la.user_id = u.id 
        AND la.created_at >= v_period_start
      ) THEN u.id 
    END) as active_users,
    (
      SELECT jsonb_agg(genre)
      FROM (
        SELECT genre, COUNT(*) as count
        FROM users u2
        CROSS JOIN LATERAL jsonb_array_elements_text(u2.favorite_genres) as genre
        WHERE u2.country = u.country
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 3
      ) top_genres
    ) as top_genres,
    COALESCE(
      (
        SELECT ((COUNT(DISTINCT u2.id)::float / NULLIF(prev.user_count, 0)) - 1) * 100
        FROM users u2
        LEFT JOIN location_insights prev ON prev.country = u.country
          AND prev.period_end = v_period_start
        WHERE u2.country = u.country
          AND u2.created_at >= v_period_start
      ),
      0
    ) as growth_rate,
    v_period_start,
    v_period_end
  FROM users u
  GROUP BY u.country
  ON CONFLICT (country, period_start, period_end) 
  DO UPDATE SET
    user_count = EXCLUDED.user_count,
    active_users = EXCLUDED.active_users,
    top_genres = EXCLUDED.top_genres,
    growth_rate = EXCLUDED.growth_rate;
END;
$$;