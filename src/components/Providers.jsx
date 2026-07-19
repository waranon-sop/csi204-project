"use client";

import React from 'react';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
