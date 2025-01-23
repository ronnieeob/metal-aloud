-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'artist', 'user')),
  created_at timestamptz DEFAULT now()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  cover_url text,
  audio_url text NOT NULL,
  duration integer NOT NULL,
  price decimal(10,2) DEFAULT 0.99,
  artist_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  cover_url text,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create playlist_songs table
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (playlist_id, song_id)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  category text NOT NULL,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_time decimal(10,2) NOT NULL CHECK (price_at_time >= 0),
  created_at timestamptz DEFAULT now()
);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_songs_artist;
DROP INDEX IF EXISTS idx_songs_album;
DROP INDEX IF EXISTS idx_songs_artist_id;
DROP INDEX IF EXISTS idx_playlists_user;
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_artist;
DROP INDEX IF EXISTS idx_orders_user;
DROP INDEX IF EXISTS idx_orders_status;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist_v2 ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_album_v2 ON songs(album);
CREATE INDEX IF NOT EXISTS idx_songs_artist_id_v2 ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_v2 ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_v2 ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_artist_v2 ON products(artist_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_v2 ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_v2 ON orders(status);