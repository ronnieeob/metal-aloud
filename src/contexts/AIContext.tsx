import React, { createContext, useContext, ReactNode } from 'react';
import { MetalAI } from '../services/ai/metalAI';
import { Song, Product, User } from '../types';

interface AIContextType {
  getRecommendedSongs: (userId: string, songs: Song[], limit?: number) => Song[];
  getRecommendedProducts: (userId: string, products: Product[], limit?: number) => Product[];
  getSuggestedArtists: (userId: string, artists: User[], limit?: number) => User[];
  updatePreferences: (userId: string, genres: string[]) => void;
  trackListening: (userId: string, songId: string) => void;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const ai = MetalAI.getInstance();

  const getRecommendedSongs = (userId: string, songs: Song[], limit?: number) => {
    return ai.getPersonalizedRecommendations(userId, songs, limit);
  };

  const getRecommendedProducts = (userId: string, products: Product[], limit?: number) => {
    return ai.getMerchRecommendations(userId, products, limit);
  };

  const getSuggestedArtists = (userId: string, artists: User[], limit?: number) => {
    return ai.getArtistSuggestions(userId, artists, limit);
  };

  const updatePreferences = (userId: string, genres: string[]) => {
    ai.updateUserPreferences(userId, genres);
  };

  const trackListening = (userId: string, songId: string) => {
    ai.addToListeningHistory(userId, songId);
  };

  return (
    <AIContext.Provider value={{
      getRecommendedSongs,
      getRecommendedProducts,
      getSuggestedArtists,
      updatePreferences,
      trackListening
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}