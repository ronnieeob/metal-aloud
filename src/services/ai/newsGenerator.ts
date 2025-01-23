import { Song, User } from '../../types';
import { NewsArticle } from '../../types/social';
import { NewsService } from '../api/newsService';

export class NewsGenerator {
  private static instance: NewsGenerator;
  private newsService: NewsService;

  private constructor() {
    this.newsService = new NewsService();
  }

  static getInstance(): NewsGenerator {
    if (!NewsGenerator.instance) {
      NewsGenerator.instance = new NewsGenerator();
    }
    return NewsGenerator.instance;
  }

  async generateNewsForUpload(song: Song, artist: User): Promise<NewsArticle> {
    // Generate news article using AI
    const article: NewsArticle = {
      id: crypto.randomUUID(),
      title: `${artist.name} Releases New Track: "${song.title}"`,
      content: this.generateContent(song, artist),
      imageUrl: song.coverUrl,
      source: 'Metal Aloud',
      publishedAt: new Date().toISOString(),
      tags: [...(song.genres || []), artist.name],
      band: {
        name: artist.name,
        id: artist.id
      },
      type: 'release',
      likes: 0,
      comments: []
    };

    // Store in local storage for development
    const existingNews = JSON.parse(localStorage.getItem('metal_aloud_news') || '[]');
    localStorage.setItem('metal_aloud_news', JSON.stringify([article, ...existingNews]));

    return article;
  }

  private generateContent(song: Song, artist: User): string {
    const templates = [
      `Metal fans, get ready to headbang! ${artist.name} has just dropped their latest track "${song.title}" exclusively on Metal Aloud. This ${song.genres?.join('/')} masterpiece showcases the band's signature sound while pushing new boundaries.`,
      
      `Breaking news in the metal scene! ${artist.name} continues their sonic assault with "${song.title}", a fresh release that's sure to ignite mosh pits worldwide. Experience this ${song.genres?.join('/')} anthem now on Metal Aloud.`,
      
      `The metal gods have blessed us! ${artist.name} returns with "${song.title}", a powerful new track that demonstrates why they're a force to be reckoned with in the ${song.genres?.join('/')} scene. Stream it now exclusively on Metal Aloud.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }
}