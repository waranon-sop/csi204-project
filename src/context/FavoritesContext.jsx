"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();
  
  // Use a unique key for each user, or 'guest' if not logged in
  const getFavoritesKey = () => `favorites_${currentUser?.id || 'guest'}`;

  // Load favorites from local storage on mount or user change
  useEffect(() => {
    const key = getFavoritesKey();
    const savedFavorites = localStorage.getItem(key);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [currentUser?.id]);

  // Save to local storage whenever favorites change
  useEffect(() => {
    const key = getFavoritesKey();
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites, currentUser?.id]);

  const addFavorite = (product) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFavorite = (productId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
  };

  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId);
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const value = {
    favorites,
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
