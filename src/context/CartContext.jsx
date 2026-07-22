"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateProductStatus, releaseExpiredReservations, getProducts } from '../utils/localStorageHelper';
import { useAuth } from './AuthContext';

const CART_KEY = 're_wear_cart';
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { currentUser, deductPoints } = useAuth();

  // Load cart from localStorage on mount — cross-check each item is still Reserved
  useEffect(() => {
    const initCart = async () => {
      const savedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      if (savedCart.length > 0) {
        const currentProducts = await getProducts();
        const validItems = savedCart.filter(item => {
          const prod = currentProducts.find(p => p.id === item.id);
          return prod && prod.status === 'Reserved';
        });
        setCartItems(validItems);
      }
    };
    initCart();
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Clear cart and release items on logout
  useEffect(() => {
    const handleLogout = () => {
      cartItems.forEach(item => updateProductStatus(item.id, 'Available'));
      setCartItems([]);
      localStorage.removeItem(CART_KEY);
    };
    window.addEventListener("userLoggedOut", handleLogout);
    return () => window.removeEventListener("userLoggedOut", handleLogout);
  }, [cartItems]);

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

  // For vintage 1-of-1 items, we shouldn't add duplicates
  const addToCart = (product) => {
    if (cartItems.find((item) => item.id === product.id)) {
      setIsCartOpen(true);
      return;
    }
    
    let duration = 900000; // 15 mins
    if (currentUser?.tier === 'Harvest') {
      duration = 86400000; // 24 hours
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
      const newExpiresAt = Date.now() + 1800000; // 30 mins
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
    localStorage.removeItem(CART_KEY);
  };

  const subTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = cartItems.length > 0 ? 35 : 0;
  const shippingDiscount = subTotal >= 500 ? shipping : 0;
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
