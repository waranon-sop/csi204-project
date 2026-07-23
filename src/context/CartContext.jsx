"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateProductStatus, releaseExpiredReservations, getProducts } from '../utils/localStorageHelper';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

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

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { settings } = useSettings();
  const { currentUser, deductPoints } = useAuth();
  const [cartUserId, setCartUserId] = useState(null);

  // Determine User/Guest ID
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
    setCartUserId(uid);
  }, [currentUser]);

  // Fetch cart on mount / user change
  useEffect(() => {
    if (!cartUserId) return;
    const initCart = async () => {
      try {
        const res = await fetch(`/api/cart?userId=${cartUserId}`);
        const savedCart = res.ok ? await res.json() : [];
        if (savedCart.length > 0) {
          const currentProducts = await getProducts();
          const validItems = savedCart.filter(item => {
            const prod = currentProducts.find(p => p.id === item.id);
            return prod && prod.status === 'Reserved';
          });
          setCartItems(validItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };
    initCart();
  }, [cartUserId]);

  // Sync to backend whenever cartItems change
  useEffect(() => {
    if (!cartUserId) return;
    const syncCart = async () => {
      try {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: cartUserId, items: cartItems })
        });
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    };
    syncCart();
  }, [cartItems, cartUserId]);

  // Clear cart and release items on logout
  useEffect(() => {
    const handleLogout = () => {
      cartItems.forEach(item => updateProductStatus(item.id, 'Available'));
      setCartItems([]);
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cartUserId, items: [] })
      });
    };
    window.addEventListener("userLoggedOut", handleLogout);
    return () => window.removeEventListener("userLoggedOut", handleLogout);
  }, [cartItems, cartUserId]);

  // Soft lock release check
  useEffect(() => {
    const interval = setInterval(async () => {
      const released = await releaseExpiredReservations();
      if (released) {
        const currentProducts = await getProducts();
        setCartItems((prev) => prev.filter(item => {
          const prod = currentProducts.find(p => p.id === item.id);
          return prod && prod.status === 'Reserved';
        }));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product) => {
    if (cartItems.find((item) => item.id === product.id)) {
      setIsCartOpen(true);
      return;
    }
    
    let duration = 900000;
    if (currentUser?.tier === 'Harvest') {
      duration = 86400000;
    }
    const expiresAt = Date.now() + duration;
    
    updateProductStatus(product.id, 'Reserved', expiresAt);
    setCartItems((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const extendReservation = () => {
    if (!currentUser) return { success: false, error: 'Please sign in to extend reservation' };
    if (currentUser.tier === 'Harvest') return { success: false, error: 'You already have 24-hour cart lock' };
    
    if (deductPoints(50)) {
      const newExpiresAt = Date.now() + 1800000;
      cartItems.forEach(item => {
        updateProductStatus(item.id, 'Reserved', newExpiresAt);
      });
      return { success: true };
    }
    return { success: false, error: 'Not enough points' };
  };

  const removeFromCart = (id) => {
    updateProductStatus(id, 'Available');
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => {
    setCartItems([]);
  };

  const subTotal = cartItems.reduce((sum, item) => sum + (item.salePrice > 0 ? item.salePrice : item.price), 0);
  const shipping = cartItems.length > 0 ? 55 : 0;
  const freeThreshold = settings?.freeShippingThreshold ?? 500;
  const shippingDiscount = subTotal >= freeThreshold ? shipping : 0;
  const cartTotal = subTotal + shipping - shippingDiscount;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        isCartOpen,
        toggleCart,
        closeCart,
        clearCart,
        extendReservation,
        subTotal,
        shipping,
        shippingDiscount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
