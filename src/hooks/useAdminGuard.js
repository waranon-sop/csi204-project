'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard hook for admin-only pages.
 * Redirects non-admin users back to /admin with an access denied message.
 * Usage: call at the top of any admin-only page component.
 */
export function useAdminGuard() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to hydrate from localStorage/sessionStorage
    if (currentUser === null) return; // still loading — don't redirect yet

    if (currentUser.role !== 'admin') {
      router.replace('/admin?denied=1');
    }
  }, [currentUser, router]);

  const isAllowed = currentUser?.role === 'admin';
  return { isAllowed, currentUser };
}
