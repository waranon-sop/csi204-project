"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const expectedKey = `favorites_${currentUser?.id || 'guest'}`;

  const [favoritesState, setFavoritesState] = useState({
    items: [],
    key: null,
  });
  
  // Load favorites from local storage on mount or user change
  useEffect(() => {
    const savedFavorites = localStorage.getItem(expectedKey);
    let items = [];
    if (savedFavorites) {
      try {
        items = JSON.parse(savedFavorites);
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
    setFavoritesState({ items, key: expectedKey });
  }, [expectedKey]);

  // Save to local storage whenever favorites change
  useEffect(() => {
    if (favoritesState.key === expectedKey && favoritesState.key !== null) {
      localStorage.setItem(expectedKey, JSON.stringify(favoritesState.items));
    }
  }, [favoritesState, expectedKey]);

  const addFavorite = (product) => {
    setFavoritesState((prev) => {
      if (prev.items.some((item) => item.id === product.id)) return prev;
      return { ...prev, items: [...prev.items, product] };
    });
  };

  const removeFavorite = (productId) => {
    setFavoritesState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== productId)
    }));
  };

  const isFavorite = (productId) => {
    return favoritesState.items.some((item) => item.id === productId);
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const value = {
    favorites: favoritesState.items,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
