'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, HelpCircle, Store, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const isActive = (path) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname?.startsWith(path);
  };

  return (
    <aside className="w-56 h-screen flex flex-col fixed left-0 top-0 bg-[#F5F2ED] border-r border-[#D8D2C8] shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 text-[#2D2D2A]">
      {/* Brand */}
      <div className="pt-8 px-6 pb-6">
        <p className="text-xl font-serif text-[#2D2D2A] mb-1">Admin Portal</p>
        <p className="text-xs text-[#5C5C58]">Re-wear System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {[
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, adminOnly: true },
          { name: 'Inventory', path: '/admin/inventory', icon: Package },
          { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
          { name: 'Promotions', path: '/admin/promotions', icon: Tag },
          { name: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
        ]
          .filter(item => !item.adminOnly || currentUser?.role === 'admin')
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-none transition-all duration-200 text-sm font-semibold ${
                  active
                    ? 'bg-[#E3E7D3] text-[#2D2D2A] border-l-4 border-[#3A4A2D] -ml-3 pl-6'
                    : 'text-[#5C5C58] hover:bg-[#EAE5DB]/50 border-l-4 border-transparent -ml-3 pl-6 hover:text-[#2D2D2A]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-[#EAE5DB] px-3 py-4 space-y-1">
        {currentUser?.role === 'admin' && (
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left text-[#5C5C58] hover:text-[#2D2D2A] hover:bg-[#EAE5DB]/50 transition-all text-xs font-medium">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        )}
        <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left text-[#5C5C58] hover:text-[#2D2D2A] hover:bg-[#EAE5DB]/50 transition-all text-xs font-medium">
          <Store className="h-4 w-4" />
          Storefront
        </Link>
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left text-[#5C5C58] hover:text-[#2D2D2A] hover:bg-[#EAE5DB]/50 transition-all text-xs font-medium">
          <HelpCircle className="h-4 w-4" />
          Support
        </button>
      </div>

      {/* Staff Profile */}
      <div className="border-t border-[#EAE5DB] px-5 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EAE5DB] overflow-hidden flex items-center justify-center text-xs font-bold text-[#2D2D2A] shrink-0 border border-[#D8D2C8]">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Staff" className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">{currentUser?.name?.charAt(0) || 'S'}</span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2D2D2A] leading-none">{currentUser?.name || 'Staff Profile'}</p>
            <p className="text-[9px] text-[#8B8B88] mt-1 uppercase tracking-widest font-semibold">{currentUser?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
