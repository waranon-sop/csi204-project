'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';

import { ToastProvider } from '../../components/ui/ToastProvider';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check both localStorage and sessionStorage (new auth supports both)
    const storedSession =
      JSON.parse(sessionStorage.getItem('currentUser')) ||
      JSON.parse(localStorage.getItem('currentUser'));
    const userToCheck = currentUser || storedSession;

    if (!userToCheck) {
      router.push('/'); // Redirect to home (AuthModal will open)
    } else if (userToCheck.role !== 'admin' && userToCheck.role !== 'staff') {
      router.push('/'); // Redirect customers to home
    } else if (userToCheck.role === 'staff' && !pathname.startsWith('/admin/inventory') && !pathname.startsWith('/admin/orders') && !pathname.startsWith('/admin/promotions')) {
      router.push('/admin/inventory'); // Staff can only access Inventory, Orders, and Promotions
    } else {
      setIsAuthorized(true);
    }
  }, [currentUser, router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3A4A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAF8F5] flex font-sans">
        <AdminSidebar />
        <div className="flex-1 ml-56 flex flex-col min-h-screen">
          <AdminTopbar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
