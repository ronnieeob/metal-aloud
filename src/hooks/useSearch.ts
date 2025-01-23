import { useState, useCallback, useEffect } from 'react';
import { SearchResults } from '../services/api/searchService';
import { SpotifyService } from '../services/spotify';
import { useDebounce } from './useDebounce';

export function useSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [filters, setFilters] = useState({
    genres: [] as string[],
    yearRange: { start: 1960, end: new Date().getFullYear() },
    priceRange: { min: 0, max: 100 },
    rating: 0,
    sortBy: 'relevance' as 'relevance' | 'date' | 'popularity' | 'price'
  });
  const [results, setResults] = useState<SearchResults>({ songs: [], bands: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'all' | 'songs' | 'bands'>('all');
  const spotifyService = new SpotifyService();

  const applyFilters = (items: any[]) => {
    return items.filter(item => {
      // Genre filter
      if (filters.genres.length > 0) {
        const itemGenres = Array.isArray(item.genres) ? item.genres : [item.genre];
        if (!filters.genres.some(g => itemGenres.includes(g))) return false;
      }

      // Year filter
      if (item.year) {
        const year = parseInt(item.year);
        if (year < filters.yearRange.start || year > filters.yearRange.end) return false;
      }

      // Price filter
      if (item.price !== undefined) {
        if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) return false;
      }

      // Rating filter
      if (filters.rating > 0 && item.rating < filters.rating) return false;

      return true;
    });
  };

  const sortResults = (items: any[]) => {
    return [...items].sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popularity':
          return (b.plays || 0) - (a.plays || 0);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });
  };

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('metal_aloud_search_history') || '[]');
    } catch {
      return [];
    }
  });

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: string[]) => {
    try {
      localStorage.setItem('metal_aloud_search_history', JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to save search history:', err);
    }
  }, []);

  useEffect(() => {
    // Reset results and clear error when query is empty
    if (!query.trim()) {
      setResults({ songs: [], bands: [] });
      setError(null);
      return;
    }
    // Just clear error when query changes
    setError(null);
  }, [query]);

  const performSearch = useCallback(async () => {
    const trimmedQuery = debouncedQuery.trim();
    
    if (!trimmedQuery) {
      setResults({ songs: [], bands: [] });
      setError(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get search results
      const searchResults = await spotifyService.search(trimmedQuery, { 
        type: searchType,
        filters 
      });

      // Apply filters and sorting
      const filteredSongs = applyFilters(searchResults.songs);
      const filteredBands = applyFilters(searchResults.bands);

      const sortedSongs = sortResults(filteredSongs);
      const sortedBands = sortResults(filteredBands);
      
      setResults({
        songs: sortedSongs,
        bands: sortedBands
      });
      
      // Update search history
      if (trimmedQuery.length >= 3) {
        const newHistory = [
          trimmedQuery,
          ...searchHistory.filter(h => h !== trimmedQuery)
        ].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('metal_aloud_search_history', JSON.stringify(newHistory));
      }

    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to perform search. Please try again.');
      setResults({ songs: [], bands: [] });
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, searchType, searchHistory, spotifyService, filters, applyFilters, sortResults]);

  return {
    query,
    setQuery,
    results,
    filters,
    setFilters,
    searchType,
    setSearchType,
    loading,
    error,
    searchHistory,
    search: () => performSearch()
  };
}