"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

export type FavoriteItem = {
  symbol: string;
  market: 'idx' | 'crypto';
};

type FavoriteContextType = {
  favorites: FavoriteItem[];
  toggleFavorite: (symbol: string, market: 'idx' | 'crypto') => void;
  isFavorite: (symbol: string) => boolean;
};

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

const emptyFavorites: FavoriteItem[] = [];

// Stable references for useSyncExternalStore
let cachedFavorites: FavoriteItem[] | null = null;
let lastRawString: string | null = null;

function readStoredFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return emptyFavorites;
  const saved = localStorage.getItem("app-favorites");
  if (!saved) return emptyFavorites;
  
  // Return cached reference if underlying string hasn't changed
  if (saved === lastRawString && cachedFavorites !== null) {
    return cachedFavorites;
  }
  
  try {
    const parsed = JSON.parse(saved);
    lastRawString = saved;
    cachedFavorites = parsed;
    return parsed;
  } catch {
    return emptyFavorites;
  }
}

function subscribeFavorites(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("app-favorites", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("app-favorites", handler);
  };
}

const getServerSnapshot = () => emptyFavorites;

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const favorites = useSyncExternalStore(subscribeFavorites, readStoredFavorites, getServerSnapshot);

  const toggleFavorite = useCallback((symbol: string, market: 'idx' | 'crypto') => {
    if (typeof window === "undefined") return;
    
    const currentFavs = readStoredFavorites();
    const isExist = currentFavs.some(f => f.symbol === symbol);
    
    let newFavs;
    if (isExist) {
      newFavs = currentFavs.filter(f => f.symbol !== symbol);
    } else {
      newFavs = [...currentFavs, { symbol, market }];
    }
    
    localStorage.setItem('app-favorites', JSON.stringify(newFavs));
    window.dispatchEvent(new Event("app-favorites"));
  }, []);

  const isFavorite = useCallback((symbol: string) => {
    return favorites.some(f => f.symbol === symbol);
  }, [favorites]);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    console.warn('useFavorite must be used within a FavoriteProvider. Returning fallback empty state.');
    return {
      favorites: [] as FavoriteItem[],
      toggleFavorite: () => {},
      isFavorite: () => false
    };
  }
  return context;
}
