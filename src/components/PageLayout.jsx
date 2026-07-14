'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import RewardsWidget from './RewardsWidget';

export default function PageLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname?.startsWith('/admin');
  
  const showNavbarFooter = !isAuthPage && !isAdminPage;

  return (
    <div className={`flex flex-col min-h-screen ${isAdminPage ? 'bg-white' : 'bg-[#FAF8F5]'}`}>
      {showNavbarFooter && (
        <>
          <Navbar />
          <CartDrawer />
        </>
      )}
      {children}
      {showNavbarFooter && (
        <>
          <RewardsWidget />
          <Footer />
        </>
      )}
    </div>
  );
}
