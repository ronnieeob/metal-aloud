-- Create function to get region stats
CREATE OR REPLACE FUNCTION get_region_stats()
RETURNS TABLE (
  region text,
  countries text[],
  total_users bigint,
  active_users bigint,
  percentage_growth numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    li.region,
    array_agg(DISTINCT li.country) as countries,
    SUM(li.user_count)::bigint as total_users,
    SUM(li.active_users)::bigint as active_users,
    AVG(li.growth_rate) as percentage_growth
  FROM location_insights li
  WHERE li.period_end = (
    SELECT MAX(period_end)
    FROM location_insights
  )
  GROUP BY li.region;
END;
$$;