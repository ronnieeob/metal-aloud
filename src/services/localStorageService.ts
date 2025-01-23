import { Song, Playlist, User } from '../types';
import { songs as initialSongs, playlists as initialPlaylists } from '../data/mockData';

const STORAGE_KEYS = {
  SONGS: 'metal_aloud_songs',
  PLAYLISTS: 'metal_aloud_playlists',
  USER: 'metal_aloud_user',
  AUTH: 'metal_aloud_auth',
  PRODUCTS: 'metal_aloud_products',
  ORDERS: 'metal_aloud_orders',
  ARTIST_PROFILES: 'metal_aloud_artist_profiles'
} as const;

export class LocalStorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setItem(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Auth methods
  isAuthenticated(): boolean {
    return this.getItem(STORAGE_KEYS.AUTH, false);
  }

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Demo accounts for different roles
      const demoAccounts = {
        'admin@example.com': 'admin',
        'artist@example.com': 'artist',
        'user@example.com': 'user'
      } as const;

      const role = demoAccounts[email as keyof typeof demoAccounts];

      // Get stored profile image if exists
      const storedImage = localStorage.getItem(`metal_aloud_profile_image_${role}`);
      const defaultImage = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61';

      if (role && password === 'password') {
        const user = {
          id: crypto.randomUUID(),
          name: role.charAt(0).toUpperCase() + role.slice(1),
          email,
          role,
          avatarUrl: storedImage || defaultImage,
          playlists: this.getPlaylists()
        };
        this.setItem(STORAGE_KEYS.USER, user);
        this.setItem(STORAGE_KEYS.AUTH, true);
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  getCurrentUser(): User | null {
    return this.getItem(STORAGE_KEYS.USER, null);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) {
      throw new Error('User not found');
    }

    // If there's a stored profile image, use it
    const storedImage = localStorage.getItem(`metal_aloud_profile_image_${userId}`);
    if (storedImage) {
      data.avatarUrl = storedImage;
    }

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.setItem(STORAGE_KEYS.USER, updatedUser);
    return updatedUser;
  }
  
  // Artist methods
  getArtistProfile(userId: string): ArtistProfile | null {
    const profiles = this.getItem<ArtistProfile[]>(STORAGE_KEYS.ARTIST_PROFILES, []);
    return profiles.find(p => p.userId === userId) || null;
  }

  updateArtistProfile(profile: ArtistProfile): void {
    const profiles = this.getItem<ArtistProfile[]>(STORAGE_KEYS.ARTIST_PROFILES, []);
    const index = profiles.findIndex(p => p.userId === profile.userId);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    this.setItem(STORAGE_KEYS.ARTIST_PROFILES, profiles);
  }

  // Product methods
  getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct = { ...product, id: crypto.randomUUID() };
    products.push(newProduct);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  }

  updateProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
    }
  }

  // Order methods
  getOrders(userId: string): Order[] {
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, [])
      .filter(order => order.userId === userId);
  }

  createOrder(order: Omit<Order, 'id'>): Order {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    const newOrder = { ...order, id: crypto.randomUUID() };
    orders.push(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.setItem(STORAGE_KEYS.ORDERS, orders);
    }
  }

  // Song methods
  getSongs(): Song[] {
    return this.getItem(STORAGE_KEYS.SONGS, initialSongs);
  }
  
  addSong(song: Omit<Song, 'id'>): Song {
    const songs = this.getSongs();
    const newSong = { ...song, id: crypto.randomUUID() };
    songs.push(newSong);
    this.setItem(STORAGE_KEYS.SONGS, songs);
    return newSong;
  }

  updateSong(song: Song): void {
    const songs = this.getSongs();
    const index = songs.findIndex(s => s.id === song.id);
    if (index >= 0) {
      songs[index] = song;
      this.setItem(STORAGE_KEYS.SONGS, songs);
    }
  }

  // Playlist methods
  getPlaylists(): Playlist[] {
    return this.getItem(STORAGE_KEYS.PLAYLISTS, initialPlaylists);
  }

  createPlaylist(name: string, coverUrl: string): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      coverUrl,
      songs: []
    };
    playlists.push(newPlaylist);
    this.setItem(STORAGE_KEYS.PLAYLISTS, playlists);
    return newPlaylist;
  }

  addSongToPlaylist(playlistId: string, song: Song): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songs.some(s => s.id === song.id)) {
      playlist.songs.push(song);
      this.setItem(STORAGE_KEYS.PLAYLISTS, playlists);
    }
  }

  removeSongFromPlaylist(playlistId: string, songId: string): void {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => s.id !== songId);
      this.setItem(STORAGE_KEYS.PLAYLISTS, playlists);
    }
  }
}