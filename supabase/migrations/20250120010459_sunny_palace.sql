-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  website_image text,
  background_image text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_user_settings_user ON user_settings(user_id);

-- Create function to update settings
CREATE OR REPLACE FUNCTION update_user_settings(
  p_user_id uuid,
  p_website_image text DEFAULT NULL,
  p_background_image text DEFAULT NULL
)
RETURNS SETOF user_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO user_settings (user_id, website_image, background_image)
  VALUES (p_user_id, p_website_image, p_background_image)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    website_image = COALESCE(p_website_image, user_settings.website_image),
    background_image = COALESCE(p_background_image, user_settings.background_image),
    updated_at = now()
  RETURNING *;
END;
$$;