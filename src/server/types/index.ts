export interface Band {
  id: string;
  name: string;
  formedIn: string;
  imageUrl: string;
  genres: string[];
  description: string;
  socialLinks: {
    website?: string;
    spotify?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
  status: 'active' | 'inactive';
  members: {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    joinDate: string;
    leaveDate?: string;
  }[];
}

export interface BandManagement extends Band {
  createdAt: string;
  updatedAt: string;
  songs?: any[];
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
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'artist' | 'user';
  avatarUrl?: string;
  createdAt?: string;
}