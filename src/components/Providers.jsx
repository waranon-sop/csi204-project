"use client";

import React from 'react';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </CartProvider>
    </AuthProvider>
  );
}
