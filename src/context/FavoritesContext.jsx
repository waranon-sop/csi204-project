"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

const getCookie = (name) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  return null;
};

const setCookie = (name, value, maxAge = 604800) => {
  if (typeof document !== 'undefined') {
    if (value) {
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();
  const [favUserId, setFavUserId] = useState(null);

  useEffect(() => {
    let uid = currentUser?.id;
    if (!uid) {
      let guestId = getCookie('guestId');
      if (!guestId) {
        guestId = 'guest-' + Date.now() + Math.random().toString(36).substring(2, 6);
        setCookie('guestId', guestId);
      }
      uid = guestId;
    }
    setFavUserId(uid);
  }, [currentUser]);

  useEffect(() => {
    if (!favUserId) return;
    const initFavs = async () => {
      try {
        const res = await fetch(`/api/favorites?userId=${favUserId}`);
        if (res.ok) {
          setFavorites(await res.json());
        }
      } catch (err) {
        console.error("Failed to load favorites", err);
      }
    };
    initFavs();
  }, [favUserId]);

  useEffect(() => {
    if (!favUserId) return;
    const syncFavs = async () => {
      try {
        await fetch('/api/favorites', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: favUserId, items: favorites })
        });
      } catch (err) {
        console.error("Failed to sync favorites", err);
      }
    };
    syncFavs();
  }, [favorites, favUserId]);

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
