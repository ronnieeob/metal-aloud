import { Song, Product, User } from '../../types';

interface RecommendationWeights {
  genre: number;
  artist: number;
  tempo: number;
  popularity: number;
  userHistory: number;
}

export class MetalAI {
  private static instance: MetalAI;
  private userPreferences: Map<string, Set<string>> = new Map();
  private listeningHistory: Map<string, string[]> = new Map();
  private genreSimilarity: Map<string, Map<string, number>> = new Map();

  private constructor() {
    this.initializeGenreSimilarities();
  }

  static getInstance(): MetalAI {
    if (!MetalAI.instance) {
      MetalAI.instance = new MetalAI();
    }
    return MetalAI.instance;
  }

  private initializeGenreSimilarities() {
    // Define genre similarity scores (0-1)
    const genres = [
      'Heavy Metal', 'Thrash Metal', 'Death Metal', 'Black Metal',
      'Power Metal', 'Doom Metal', 'Progressive Metal', 'Folk Metal'
    ];

    genres.forEach(genre1 => {
      if (!this.genreSimilarity.has(genre1)) {
        this.genreSimilarity.set(genre1, new Map());
      }
      genres.forEach(genre2 => {
        if (genre1 === genre2) {
          this.genreSimilarity.get(genre1)!.set(genre2, 1);
          return;
        }
        // Calculate similarity based on genre relationships
        let similarity = 0;
        if (genre1.includes('Metal') && genre2.includes('Metal')) {
          similarity += 0.3; // Base similarity for metal genres
        }
        if (this.areGenresRelated(genre1, genre2)) {
          similarity += 0.4;
        }
        this.genreSimilarity.get(genre1)!.set(genre2, similarity);
      });
    });
  }

  private areGenresRelated(genre1: string, genre2: string): boolean {
    const relatedPairs = [
      ['Thrash Metal', 'Death Metal'],
      ['Death Metal', 'Black Metal'],
      ['Heavy Metal', 'Power Metal'],
      ['Doom Metal', 'Heavy Metal'],
      ['Progressive Metal', 'Power Metal']
    ];
    return relatedPairs.some(([g1, g2]) => 
      (g1 === genre1 && g2 === genre2) || (g1 === genre2 && g2 === genre1)
    );
  }

  public updateUserPreferences(userId: string, genres: string[]) {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, new Set());
    }
    genres.forEach(genre => this.userPreferences.get(userId)!.add(genre));
  }

  public addToListeningHistory(userId: string, songId: string) {
    if (!this.listeningHistory.has(userId)) {
      this.listeningHistory.set(userId, []);
    }
    this.listeningHistory.get(userId)!.push(songId);
  }

  public getPersonalizedRecommendations(
    userId: string,
    songs: Song[],
    limit: number = 5
  ): Song[] {
    const userGenres = Array.from(this.userPreferences.get(userId) || []);
    const history = this.listeningHistory.get(userId) || [];
    
    // Calculate scores for each song
    const songScores = songs.map(song => {
      let score = 0;
      
      // Genre matching
      if (song.genres) {
        song.genres.forEach(songGenre => {
          userGenres.forEach(userGenre => {
            const similarity = this.genreSimilarity.get(songGenre)?.get(userGenre) || 0;
            score += similarity * 0.4; // Genre weight
          });
        });
      }
      
      // Novelty bonus (prefer songs not in history)
      if (!history.includes(song.id)) {
        score += 0.2;
      }
      
      // Popularity (if available)
      if (song.popularity) {
        score += (song.popularity / 100) * 0.2;
      }
      
      return { song, score };
    });
    
    // Sort by score and return top recommendations
    return songScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.song);
  }

  public getMerchRecommendations(
    userId: string,
    products: Product[],
    limit: number = 4
  ): Product[] {
    const userGenres = Array.from(this.userPreferences.get(userId) || []);
    
    // Calculate scores for each product
    const productScores = products.map(product => {
      let score = 0;
      
      // Category matching
      if (product.category === 'clothing') score += 0.3;
      if (product.category === 'vinyl') score += 0.4;
      
      // Price range consideration
      if (product.price >= 20 && product.price <= 50) score += 0.2;
      
      // Stock availability
      if (product.stockQuantity > 10) score += 0.1;
      
      // Sales history (if available)
      if (product.sales) {
        score += (Math.min(product.sales, 100) / 100) * 0.2;
      }
      
      return { product, score };
    });
    
    return productScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  public getArtistSuggestions(
    userId: string,
    artists: User[],
    limit: number = 3
  ): User[] {
    const userGenres = Array.from(this.userPreferences.get(userId) || []);
    
    const artistScores = artists
      .filter(artist => artist.role === 'artist')
      .map(artist => {
        let score = 0;
        
        // Genre matching
        if (artist.genres) {
          artist.genres.forEach(artistGenre => {
            userGenres.forEach(userGenre => {
              const similarity = this.genreSimilarity.get(artistGenre)?.get(userGenre) || 0;
              score += similarity * 0.5;
            });
          });
        }
        
        // Verified status bonus
        if (artist.verified) score += 0.3;
        
        // Content amount bonus
        if (artist.songs?.length) {
          score += Math.min(artist.songs.length / 10, 1) * 0.2;
        }
        
        return { artist, score };
      });
    
    return artistScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.artist);
  }
}