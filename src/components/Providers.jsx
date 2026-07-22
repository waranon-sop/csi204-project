"use client";

import React from 'react';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './ui/ToastProvider';
import { SupportProvider } from '../context/SupportContext';

export default function Providers({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <UserProvider>
              <SupportProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </SupportProvider>
            </UserProvider>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </GoogleOAuthProvider>
  );
}
