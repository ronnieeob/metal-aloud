import { useState, useCallback } from 'react';
import { Search, Loader, X } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { debounce } from '../utils/debounce';
import { usePlayer } from '../contexts/PlayerContext';
import { Song, Band } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

export function SearchBar() {
  const { query, setQuery, results, loading, error, searchType, setSearchType, search } = useSearch();
  const { dispatch } = usePlayer();
  const { setActiveSection, setSelectedBand } = useNavigation();
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('metal_aloud_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Debounce search input
  const debouncedSearch = React.useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        search().catch(console.error);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
    debouncedSearch(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    if (!(e.target as Element).closest('.search-container')) {
      setShowResults(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePlaySong = (song: Song) => {
    dispatch({ type: 'SET_SONG', payload: song });
    setShowResults(false);
  };

  const handleBandClick = (band: Band) => {
    setActiveSection('bands');
    setShowResults(false);
    setQuery('');
    setSelectedBand(band);
  };

  const handleSearch = (searchQuery: string, type?: string) => {
    const formattedQuery = type ? `${type}:${searchQuery}` : searchQuery;
    setQuery(formattedQuery);
    search().catch(err => {
      console.error('Search failed:', err);
    });
    
    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)];
      return newHistory.slice(0, 5); // Keep last 5 searches
    });
  };

  return (
    <div className="relative search-container max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 relative">
        <select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value as 'all' | 'songs' | 'bands');
            if (query.trim()) search();
          }}
          className="bg-zinc-800/50 border border-red-900/20 rounded px-2 py-1.5 text-sm z-10"
        >
          <option value="all">All</option>
          <option value="songs">Songs</option>
          <option value="bands">Bands</option>
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search..."
            className="w-full bg-zinc-800/50 border border-red-900/20 rounded-lg py-2 px-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>
      
      {query && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {loading ? 'Searching...' : 'Local + Spotify'}
        </div>
      )}

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {showResults && query.trim() && (
        <div className="absolute w-full mt-1 bg-zinc-900 rounded-lg border border-red-900/20 shadow-lg overflow-hidden z-50">
          {error && (
            <div className="p-4 text-red-400 text-sm bg-red-900/20 border-b border-red-900/20">
              {error}
            </div>
          )}
          {/* Recent Searches */}
          {searchHistory.length > 0 && !results?.songs?.length && !results?.bands?.length && (
            <div className="p-3 border-b border-red-900/20">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-2 py-1 hover:bg-red-900/20 rounded text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.songs?.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Songs</h3>
              <div className="space-y-2">
                {results.songs.map(song => (
                  <button
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="flex items-center space-x-3 w-full p-2 hover:bg-red-900/20 rounded-lg transition"
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-10 h-10 rounded"
                    />
                    <div className="text-left">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-gray-400">{song.artist}</div>
                      {song.id.startsWith('spotify:') && (
                        <div className="text-xs text-red-400">From Spotify</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.bands?.length > 0 && (
            <div className="p-4 border-t border-red-900/20">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Bands</h3>
              <div className="space-y-2">
                {results.bands.map(band => (
                  <a
                    key={band.id}
                    onClick={() => handleBandClick(band)}
                    className="flex items-center space-x-3 w-full p-2 hover:bg-red-900/20 rounded-lg transition"
                  >
                    <img
                      src={band.imageUrl}
                      alt={band.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-medium">{band.name}</div>
                      <div className="text-sm text-gray-400">
                        {band.genres.join(', ')}
                      </div>
                      {band.id.startsWith('spotify:') && (
                        <div className="text-xs text-red-400">From Spotify</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(!results?.songs?.length && !results?.bands?.length) && query.trim() && (
            <div className="p-8 text-center text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}