"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { User, ShieldAlert, Cpu } from 'lucide-react';


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
