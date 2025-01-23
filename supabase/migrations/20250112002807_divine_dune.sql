/*
  # Create Admin User

  1. Changes
    - Creates profiles table for user data
    - Creates initial admin user in auth.users and public.profiles
    - Sets admin role and verified status
  
  2. Security
    - Uses secure password hashing
    - Sets email verified status
*/

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'artist', 'user')),
  avatar_url text,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create admin user if not exists
DO $$ 
DECLARE
  v_user_id uuid;
BEGIN
  -- First check if admin user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- Generate UUID for user
    v_user_id := gen_random_uuid();
    
    -- Create auth user
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('password', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin User"}',
      now(),
      now()
    );

    -- Create public profile
    INSERT INTO public.profiles (
      id,
      email,
      role,
      avatar_url,
      email_verified
    ) VALUES (
      v_user_id,
      'admin@example.com',
      'admin',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
      true
    );
  END IF;
END $$;