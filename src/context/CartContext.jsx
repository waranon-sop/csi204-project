"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateProductStatus, releaseExpiredReservations, getProducts } from '../utils/localStorageHelper';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Soft lock release check
  useEffect(() => {
    const interval = setInterval(() => {
      if (releaseExpiredReservations()) {
        const currentProducts = getProducts();
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
  const clearCart = () => setCartItems([]);

  const subTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = cartItems.length > 0 ? 15 : 0;
  const cartTotal = subTotal + shipping;

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
