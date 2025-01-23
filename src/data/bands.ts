import { Song } from '../types';
import { songs } from './mockData';

export interface Band {
  id: string;
  name: string;
  imageUrl: string;
  formedIn: string;
  genres: string[];
  featuredSong?: Song;
}

export const bands: Band[] = [
  {
    id: '1',
    name: 'Metallica',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
    formedIn: '1981',
    genres: ['Thrash Metal', 'Heavy Metal'],
    featuredSong: songs[0]
  },
  {
    id: '2',
    name: 'Black Sabbath',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    formedIn: '1968',
    genres: ['Heavy Metal', 'Doom Metal'],
    featuredSong: songs[3]
  },
  {
    id: '3',
    name: 'Slayer',
    imageUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    formedIn: '1981',
    genres: ['Thrash Metal', 'Death Metal'],
    featuredSong: songs[2]
  },
  {
    id: '4',
    name: 'Megadeth',
    imageUrl: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6',
    formedIn: '1983',
    genres: ['Thrash Metal', 'Heavy Metal'],
    featuredSong: songs[1]
  },
  {
    id: '5',
    name: 'Iron Maiden',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    formedIn: '1975',
    genres: ['Heavy Metal', 'Power Metal']
  },
  {
    id: '6',
    name: 'Judas Priest',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    formedIn: '1969',
    genres: ['Heavy Metal', 'Speed Metal']
  },
  {
    id: '7',
    name: 'Pantera',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    formedIn: '1981',
    genres: ['Groove Metal', 'Heavy Metal']
  },
  {
    id: '8',
    name: 'Anthrax',
    imageUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    formedIn: '1981',
    genres: ['Thrash Metal', 'Heavy Metal']
  }
];