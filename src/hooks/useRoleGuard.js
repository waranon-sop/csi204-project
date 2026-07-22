'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * Role-based Access Control (RBAC) hook.
 * @param {string[]} allowedRoles - Roles that are permitted (e.g. ['admin', 'staff'])
 * @param {string} redirectTo - Where to redirect unauthorized users (default: '/admin?denied=1')
 */
export function useRoleGuard(allowedRoles = ['admin'], redirectTo = '/admin?denied=1') {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser === null) return; // still loading — don't redirect yet
    // Not logged in or role not allowed
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      if (currentUser?.role === 'staff') {
        router.replace('/admin/orders?denied=1');
      } else {
        router.replace(redirectTo);
      }
    }
  }, [currentUser, router]);

  const isAllowed = currentUser && allowedRoles.includes(currentUser.role);
  return { isAllowed, currentUser };
}

/**
 * Convenience guard for admin-only pages.
 */
export function useAdminGuard() {
  return useRoleGuard(['admin']);
}

/**
 * Convenience guard for pages accessible by both admin and staff.
 */
export function useStaffGuard() {
  return useRoleGuard(['admin', 'staff']);
}
