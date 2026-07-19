"use client";

import React from 'react';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <CartProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
