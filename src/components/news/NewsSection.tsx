import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../../types/social';
import { NewsService } from '../../services/api/newsService';
import { Heart, MessageCircle, Share2, Filter, ExternalLink } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';

export function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NewsArticle['type'] | 'all'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const newsService = new NewsService();

  // Check for selected news from notifications
  useEffect(() => {
    const selectedNewsId = localStorage.getItem('metal_aloud_selected_news');
    if (selectedNewsId) {
      try {
        const { id, timestamp } = JSON.parse(selectedNewsId);
        // Only handle if notification was clicked in the last 5 seconds
        if (Date.now() - timestamp < 5000) {
          const article = news.find(a => a.id === id);
          if (article) {
            setSelectedArticle(article);
          }
        }
      } catch (err) {
        console.warn('Invalid selected news data:', err);
      } finally {
        localStorage.removeItem('metal_aloud_selected_news');
      }
    }
  }, [news]);

  useEffect(() => {
    loadNews();
  }, []);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  const loadNews = async () => {
    try {
      setLoading(true);
      const articles = await newsService.getLatestNews();
      setNews(articles);
    } catch (err) {
      setError('Failed to load news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(article => article.type === filter);

  return (
    <div className="space-y-6">
      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-red-900/20">
            <div className="relative">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={handleCloseArticle}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
              <div className="prose prose-invert max-w-none">
                <p>{selectedArticle.content}</p>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-gray-400">
                  {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                </span>
                <a
                  href={selectedArticle.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                >
                  <span>Read full article</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-red-500">Metal News</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-red-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-zinc-800 border border-red-900/20 rounded px-3 py-1 text-sm"
          >
            <option value="all">All News</option>
            <option value="release">New Releases</option>
            <option value="announcement">Announcements</option>
            <option value="interview">Interviews</option>
            <option value="review">Reviews</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNews.map((article) => (
          <div key={article.id} className="bg-zinc-800/50 rounded-lg overflow-hidden border border-red-900/20">
            <div
              onClick={() => handleArticleClick(article)}
              className="cursor-pointer hover:opacity-90 transition"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">
                  {article.type}
                </span>
                {article.band && (
                  <span className="text-xs px-2 py-1 rounded-full bg-zinc-700">
                    {article.band.name}
                  </span>
                )}
              </div>
              <div
                onClick={() => handleArticleClick(article)}
                className="cursor-pointer hover:text-red-400 transition"
              >
                <h3 className="text-lg font-bold mb-2">{article.title}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                {article.content}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition">
                    <Heart className="w-4 h-4" />
                    <span>{article.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition">
                    <MessageCircle className="w-4 h-4" />
                    <span>{article.comments.length}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
                <span className="text-gray-400">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}