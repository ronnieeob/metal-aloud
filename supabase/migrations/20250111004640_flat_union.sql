-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES 
  ('songs', 'songs'),
  ('images', 'images')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Artists can upload songs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'songs' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can download songs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'songs');

CREATE POLICY "Artists can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'images');