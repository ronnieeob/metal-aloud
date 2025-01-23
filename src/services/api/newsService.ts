import { NewsArticle } from '../../types/social';
import { isDev } from '../../utils/env';

const METAL_ARCHIVES_API = 'https://www.metal-archives.com/api/v1';
const BLABBERMOUTH_API = 'https://www.blabbermouth.net/api/v1';
const METAL_HAMMER_API = 'https://www.metalhammer.com/api/v1';
const METAL_INJECTION_API = 'https://www.metalinjection.net/api/v1';

interface NewsSource {
  name: string;
  url: string;
  fetchFn: () => Promise<NewsArticle[]>;
}

export class NewsService {
  private sources: NewsSource[] = [
    {
      name: 'Metal Archives',
      url: METAL_ARCHIVES_API,
      fetchFn: this.fetchMetalArchives.bind(this)
    },
    {
      name: 'Blabbermouth',
      url: BLABBERMOUTH_API,
      fetchFn: this.fetchBlabbermouth.bind(this)
    },
    {
      name: 'Metal Hammer',
      url: METAL_HAMMER_API,
      fetchFn: this.fetchMetalHammer.bind(this)
    },
    {
      name: 'Metal Injection',
      url: METAL_INJECTION_API,
      fetchFn: this.fetchMetalInjection.bind(this)
    }
  ];

  private async fetchMetalArchives(): Promise<NewsArticle[]> {
    if (isDev) {
      return [
        {
          id: '1',
          title: 'Metallica Announces New Album',
          content: 'Legendary metal band Metallica has announced their new album...',
          imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
          source: 'Metal Archives',
          publishedAt: new Date().toISOString(),
          tags: ['Metallica', 'Thrash Metal', 'New Release'],
          band: {
            name: 'Metallica',
            id: 'metallica'
          },
          type: 'release',
          likes: 156,
          comments: []
        },
        // Add more mock news articles
      ];
    }

    // TODO: Implement real API call
    throw new Error('Metal Archives API not implemented');
  }

  private async fetchBlabbermouth(): Promise<NewsArticle[]> {
    if (isDev) {
      return [
        {
          id: '2',
          title: 'Iron Maiden Announces World Tour',
          content: 'Heavy metal icons Iron Maiden have announced...',
          imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
          source: 'Blabbermouth',
          publishedAt: new Date().toISOString(),
          tags: ['Iron Maiden', 'Tour', 'Heavy Metal'],
          band: {
            name: 'Iron Maiden',
            id: 'iron-maiden'
          },
          type: 'announcement',
          likes: 234,
          comments: []
        }
      ];
    }

    // TODO: Implement real API call
    throw new Error('Blabbermouth API not implemented');
  }

  private async fetchMetalHammer(): Promise<NewsArticle[]> {
    if (isDev) {
      return [
        {
          id: '3',
          title: 'Exclusive Interview: Gojira',
          content: 'French metal masters Gojira discuss their new album...',
          imageUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
          source: 'Metal Hammer',
          publishedAt: new Date().toISOString(),
          tags: ['Gojira', 'Interview', 'Progressive Metal'],
          band: {
            name: 'Gojira',
            id: 'gojira'
          },
          type: 'interview',
          likes: 189,
          comments: []
        }
      ];
    }
    throw new Error('Metal Hammer API not implemented');
  }

  private async fetchMetalInjection(): Promise<NewsArticle[]> {
    if (isDev) {
      return [
        {
          id: '4',
          title: 'Album Review: New Meshuggah',
          content: 'Swedish tech-metal pioneers return with their most ambitious...',
          imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
          source: 'Metal Injection',
          publishedAt: new Date().toISOString(),
          tags: ['Meshuggah', 'Review', 'Technical Metal'],
          band: {
            name: 'Meshuggah',
            id: 'meshuggah'
          },
          type: 'review',
          likes: 145,
          comments: []
        }
      ];
    }
    throw new Error('Metal Injection API not implemented');
  }

  async getLatestNews(): Promise<NewsArticle[]> {
    try {
      // Fetch from all sources in parallel
      const allNews = await Promise.allSettled(
        this.sources.map(source => source.fetchFn())
      );

      // Combine successful results
      const news = allNews
        .filter((result): result is PromiseFulfilledResult<NewsArticle[]> => 
          result.status === 'fulfilled'
        )
        .flatMap(result => result.value);

      // Sort by date
      return news.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // In development, return mock data from all sources
      if (isDev) {
        const mockNews = await Promise.all(
          this.sources.map(source => source.fetchFn().catch(() => []))
        );
        return mockNews.flat().sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      } else {
        return [];
      }
    }
  }

  async getNewsByBand(bandId: string): Promise<NewsArticle[]> {
    const allNews = await this.getLatestNews();
    return allNews.filter(article => article.band?.id === bandId);
  }

  async getNewsByType(type: NewsArticle['type']): Promise<NewsArticle[]> {
    const allNews = await this.getLatestNews();
    return allNews.filter(article => article.type === type);
  }
}