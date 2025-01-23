import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Band } from '../types';

type Section = 'home' | 'search' | 'genres' | 'bands' | 'library' | 'profile' | 'playlists' | 'liked' | 'settings' | 'rewards' | 'social' | 'messages' | 'news' | 'shop' | 'checkout' | 'premium';

interface NavigationContextType {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  selectedBand: Band | null;
  setSelectedBand: (band: Band | null) => void;
  previousSection: Section | null;
  navigateBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [previousSection, setPreviousSection] = useState<Section | null>(null);

  const handleSetActiveSection = (section: Section) => {
    // Handle special case for premium section
    if (section === 'premium') {
      // Scroll to top when showing premium plans
      window.scrollTo(0, 0);
    }
    setPreviousSection(activeSection);
    setActiveSection(section);
  };

  const navigateBack = () => {
    if (previousSection) {
      setActiveSection(previousSection);
      setPreviousSection(null);
    }
  };

  return (
    <NavigationContext.Provider value={{ 
      activeSection, 
      setActiveSection: handleSetActiveSection,
      selectedBand,
      setSelectedBand,
      previousSection,
      navigateBack
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}