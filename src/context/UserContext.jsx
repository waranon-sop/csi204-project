/**
 * UserContext.jsx
 * Provides the current (simulated) user object to any component in the tree
 * without requiring explicit prop-drilling through every page and layout layer.
 *
 * Usage:
 *   // Read the current user anywhere inside <UserProvider>:
 *   const { currentUser } = useCurrentUser();
 */

"use client";

import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

/**
 * Wrap the app (or a sub-tree) with this provider and supply the currentUser
 * state from App.jsx.
 */
export function UserProvider({ children }) {
  const { currentUser, setDemoUser } = useAuth();
  
  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: setDemoUser }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Convenience hook — throws a clear error if used outside <UserProvider>.
 */
export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useCurrentUser must be used inside <UserProvider>');
  }
  return ctx;
}
