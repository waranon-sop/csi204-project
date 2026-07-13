'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function PageLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      {!isAuthPage && (
        <>
          <Navbar />
          <CartDrawer />
        </>
      )}
      {children}
      {!isAuthPage && <Footer />}
    </div>
  );
}
