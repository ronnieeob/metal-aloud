import { Playlist, Song, User } from '../types';

export const songs: Song[] = [
  {
    id: 'demo-1',
    title: 'Metal Symphony (Demo)',
    artist: 'Metal Aloud',
    album: 'Copyright Demo',
    coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    duration: 30,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    price: 0.99,
    artistId: 'demo-artist',
    genres: ['Heavy Metal', 'Symphonic Metal'],
    createdAt: new Date().toISOString(),
    copyright: {
      id: 'CR-12345678',
      registrationDate: new Date().toISOString(),
      status: 'active',
      type: 'automatic',
      protectionLevel: 'premium'
    }
  },
  {
    id: '1',
    title: 'Master of Puppets',
    artist: 'Metallica',
    album: 'Master of Puppets',
    coverUrl: 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0',
    duration: 30,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Holy Wars',
    artist: 'Megadeth',
    album: 'Rust in Peace',
    coverUrl: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6',
    duration: 30,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Raining Blood',
    artist: 'Slayer',
    album: 'Reign in Blood',
    coverUrl: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac',
    duration: 30,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'War Pigs',
    artist: 'Black Sabbath',
    album: 'Paranoid',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    duration: 30,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  }
];

export const playlists: Playlist[] = [
  {
    id: '1',
    name: 'Thrash Classics',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    songs: songs.slice(0, 2),
  },
  {
    id: '2',
    name: 'Heavy Legends',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    songs: songs.slice(2, 4),
  },
  {
    id: '3',
    name: 'Metal Essentials',
    coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    songs: songs,
  }
];

export const currentUser: User = {
  id: '1',
  name: 'Metal Head',
  email: 'demo@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
  playlists: playlists,
};