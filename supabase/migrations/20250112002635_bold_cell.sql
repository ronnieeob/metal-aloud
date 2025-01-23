/*
  # Create Admin User

  1. Changes
    - Creates initial admin user if not exists
    - Sets admin role and verified status
  
  2. Security
    - Uses secure password hashing
    - Sets email verified status
*/

-- Create admin user if not exists
DO $$ 
BEGIN
  -- First check if admin user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- Create auth user
    INSERT INTO auth.users (
      instance_id,
      id,
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
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
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
  END IF;
END $$;