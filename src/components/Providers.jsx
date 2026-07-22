"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { SettingsProvider } from '../context/SettingsContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './ui/ToastProvider';
import { SupportProvider } from '../context/SupportContext';

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
      <SettingsProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <UserProvider>
                <SupportProvider>
                  <ToastProvider>
                    <Suspense fallback={null}>
                      <ReferralTracker />
                    </Suspense>
                    {children}
                  </ToastProvider>
                </SupportProvider>
              </UserProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </SettingsProvider>
    </GoogleOAuthProvider>
  );
}
