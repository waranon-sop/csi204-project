'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import RewardsWidget from './RewardsWidget';

export default function PageLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />
      <CartDrawer />
      {children}
      <RewardsWidget />
      <Footer />
    </div>
  );
}
