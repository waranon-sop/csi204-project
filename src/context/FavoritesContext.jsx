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
  
  const favKey = currentUser ? `favorites_${currentUser.id}` : 'favorites_guest';

  // Load favorites from local storage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(favKey);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    } else {
      setFavorites([]);
    }
  }, [favKey]);

  // Save to local storage whenever favorites change
  useEffect(() => {
    localStorage.setItem(favKey, JSON.stringify(favorites));
  }, [favorites, favKey]);

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
