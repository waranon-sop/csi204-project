"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateProductStatus, releaseExpiredReservations, getProducts } from '../utils/localStorageHelper';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { settings } = useSettings();
  const { currentUser } = useAuth();

  const userCartKey = currentUser ? `re_wear_cart_${currentUser.id}` : 're_wear_cart_guest';

  // Load cart from localStorage on mount — cross-check each item is still Reserved
  useEffect(() => {
    const initCart = async () => {
      const savedCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
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
    };
    initCart();
  }, [userCartKey]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(userCartKey, JSON.stringify(cartItems));
  }, [cartItems, userCartKey]);

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
    updateProductStatus(product.id, 'Reserved');
    setCartItems((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    updateProductStatus(id, 'Available');
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(userCartKey);
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
