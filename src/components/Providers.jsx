"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const ReferralTracker = () => {
    const searchParams = useSearchParams();
    useEffect(() => {
      const ref = searchParams?.get('ref');
      if (ref) {
        localStorage.setItem('referredBy', ref);
      }
    }, [searchParams]);
    return null;
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <UserProvider>
              <Suspense fallback={null}>
                <ReferralTracker />
              </Suspense>
              {children}
            </UserProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
