import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Song, Band } from '../types';

const METAL_GENRES = [
  'metal',
  'heavy-metal',
  'black-metal',
  'death-metal',
  'thrash-metal',
  'power-metal',
  'doom-metal'
];

interface SearchOptions {
  type?: 'all' | 'songs' | 'bands';
  exact?: boolean;
}

const SPOTIFY_TOKEN_KEY = 'metal_aloud_spotify_token';

interface SpotifySearchResults {
  songs: Song[];
  bands: Band[];
}

export class SpotifyService {
  private api: SpotifyApi | null = null;
  private initialized = false;
  private clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  private clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  
  isInitialized() {
    return this.initialized;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Check for cached token
    const cachedToken = localStorage.getItem(SPOTIFY_TOKEN_KEY);
    if (cachedToken) {
      try {
        const token = JSON.parse(cachedToken);
        if (token.expiresAt > Date.now()) {
          this.api = new SpotifyApi({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            accessToken: token.value
          });
          this.initialized = true;
          return;
        }
      } catch (err) {
        console.warn('Invalid cached token:', err);
      }
    }

    try {
      if (!this.clientId || !this.clientSecret) {
        console.warn('Spotify credentials not configured, using mock data');
        return;
      }

      this.api = new SpotifyApi({
        clientId: this.clientId,
        clientSecret: this.clientSecret
      });

      const auth = await this.api.authenticate();
      
      // Cache the token
      localStorage.setItem(SPOTIFY_TOKEN_KEY, JSON.stringify({
        value: auth.access_token,
        expiresAt: Date.now() + (auth.expires_in * 1000)
      }));
      
      this.initialized = true;
      console.log('Spotify API initialized successfully');
    } catch (err) {
      console.warn('Failed to initialize Spotify API:', err);
      if (import.meta.env.DEV) {
        console.log('Using mock data in development');
      } else {
        throw err;
      }
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async search(query: string, options: SearchOptions = {}): Promise<SpotifySearchResults> {
    try {
      await this.initialize();

      if (!this.api || !this.initialized) {
        return this.getMockResults(query);
      }

      const searchQuery = options.exact ? query : `${query} metal`;
      const shouldSearchSongs = options.type === 'all' || options.type === 'songs';
      const shouldSearchBands = options.type === 'all' || options.type === 'bands';
      const isArtistSearch = searchQuery.startsWith('artist:');
      const searchPromises = [];
      
      if (shouldSearchSongs) {
        searchPromises.push(this.api.search(
          searchQuery,
          ['track'],
          'US',
          50
        ));
      }
      
      if (shouldSearchBands) {
        searchPromises.push(this.api.search(
          searchQuery,
          ['artist'],
          'US',
          20
        ));
      }

      const results = await Promise.all(searchPromises);
      const tracksResult = shouldSearchSongs ? results[0] : { tracks: { items: [] } };
      const artistsResult = shouldSearchBands ? results[shouldSearchSongs ? 1 : 0] : { artists: { items: [] } };

      // Process and filter results
      const bands: Band[] = artistsResult.artists.items
        .filter(artist => 
          artist.genres.some(genre => 
            METAL_GENRES.some(metalGenre => 
              genre.includes(metalGenre)
            )
          )
        )
        .map(artist => ({
          id: `spotify:${artist.id}`,
          name: artist.name,
          imageUrl: artist.images[0]?.url || 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
          formedIn: '', // Not available from Spotify
          genres: artist.genres.filter(genre => 
            METAL_GENRES.some(metalGenre => 
              genre.includes(metalGenre)
            )
          )
        }));
      const songs: Song[] = tracksResult.tracks.items
        .filter(track => track.preview_url) // Only include songs with previews
        .map(track => ({
          id: `spotify:${track.id}`,
          title: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          coverUrl: track.album.images[0]?.url || '',
          duration: Math.floor(track.duration_ms / 1000),
          audioUrl: track.preview_url || '',
          price: 0.99,
          artistId: `spotify:${track.artists[0].id}`,
          genres: track.artists[0].genres || ['metal'],
          createdAt: track.album.release_date
        }));

      return { 
        songs,
        bands: bands
      };
    } catch (err) {
      console.error('Spotify search failed:', err);
      return this.getMockResults(query);
    }
  }

  private getMockResults(query: string): SpotifySearchResults {
    const mockSongs: Song[] = [
      {
        id: 'spotify:mock-1',
        title: 'Master of Puppets',
        artist: 'Metallica',
        album: 'Master of Puppets',
        coverUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
        duration: 515,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        price: 0.99,
        artistId: 'metallica',
        genres: ['Thrash Metal', 'Heavy Metal'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'spotify:mock-2',
        title: 'Holy Wars',
        artist: 'Megadeth',
        album: 'Rust in Peace',
        coverUrl: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6',
        duration: 392,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        price: 0.99,
        artistId: 'megadeth',
        genres: ['Thrash Metal', 'Heavy Metal'],
        createdAt: new Date().toISOString()
      }
    ];

    const mockBands: Band[] = [
      {
        id: 'mock-1',
        name: 'Metallica',
        imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
        formedIn: '1981',
        genres: ['Thrash Metal', 'Heavy Metal']
      },
      {
        id: 'mock-2',
        name: 'Megadeth',
        imageUrl: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6',
        formedIn: '1983',
        genres: ['Thrash Metal', 'Heavy Metal']
      }
    ];
    return {
      songs: mockSongs.filter(song =>
        song.title?.toLowerCase().includes(query.toLowerCase()) ||
        song.artist?.toLowerCase().includes(query.toLowerCase()) ||
        song.genres?.some(genre =>
          genre?.toLowerCase().includes(query.toLowerCase())
        )
      ),
      bands: mockBands.filter(band =>
        band.name.toLowerCase().includes(query.toLowerCase()) ||
        band.genres.some(genre =>
          genre.toLowerCase().includes(query.toLowerCase())
        )
      )
    };
  }

  async getMetalPlaylists() {
    const playlists = await Promise.all(
      METAL_GENRES.map(async (genre) => {
        const result = await this.api.search(genre, ['playlist'], 'US', 3);
        return result.playlists.items.filter(playlist => 
          playlist.name.toLowerCase().includes('metal')
        );
      })
    );
    return playlists.flat();
  }

  async getMetalArtists() {
    const artists = await Promise.all(
      METAL_GENRES.map(async (genre) => {
        const result = await this.api.search(genre, ['artist'], 'US', 5);
        return result.artists.items.filter(artist => 
          artist.genres.some(g => METAL_GENRES.some(mg => g.includes(mg)))
        );
      })
    );
    return artists.flat();
  }

  async getMetalTracks() {
    const tracks = await Promise.all(
      METAL_GENRES.map(async (genre) => {
        const result = await this.api.search(genre, ['track'], 'US', 5);
        return result.tracks.items.filter(track => 
          track.artists.some(artist => 
            artist.name.toLowerCase().includes('metal') ||
            METAL_GENRES.some(g => artist.name.toLowerCase().includes(g))
          )
        );
      })
    );
    return tracks.flat();
  }
}