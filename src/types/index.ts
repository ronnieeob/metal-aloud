export type UserRole = 'admin' | 'moderator' | 'artist' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  playlists: Playlist[];
}

export interface ArtistProfile {
  id: string;
  userId: string;
  bio: string;
  website?: string;
  socialLinks: {
    spotify?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
  verified: boolean;
  imageUrl: string;
  formedIn: string;
  genres: string[];
  source?: 'local' | 'spotify';
  featuredSong?: Song;
}

export interface Product {
  id: string;
  artistId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
  sales?: number;
  revenue?: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  artistSales?: {
    artistId: string;
    revenue: number;
    items: number;
  }[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  duration: number;
  audioUrl: string;
  price: number;
  artistId: string;
  genres: string[];
  source?: 'local' | 'spotify';
  createdAt?: string;
  copyright?: {
    id: string;
    registrationDate: string;
    status: 'pending' | 'active' | 'rejected';
    type: 'automatic' | 'manual';
    protectionLevel: 'basic' | 'standard' | 'premium';
  };
}

export interface Playlist {
  id: string;
  name: string;
  coverUrl: string;
  songs: Song[];
}