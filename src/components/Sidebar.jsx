"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, History, CreditCard, Heart, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Removed ROLE_AVATARS constant
export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
      router.push('/admin');
    }
  }, [currentUser, router]);

  const user = currentUser || { name: 'Guest', role: 'customer' };

  const menuItems = [
    {
      name: 'Profile Settings',
      path: '/profile',
      icon: User,
      description: 'Edit personal info and address',
    },
    {
      name: 'Order History',
      path: '/orders',
      icon: History,
      description: 'View past orders',
    },
    {
      name: 'Payment Methods',
      path: '/payment',
      icon: CreditCard,
      description: 'Manage cards and bank accounts',
    },
    {
      name: 'Wardrobe & Favorites',
      path: '/wardrobe',
      icon: Heart,
      description: 'Saved items and listings',
    },
    {
      name: 'Eco-Impact Dashboard',
      path: '/eco-impact',
      icon: Leaf,
      description: 'Carbon reduction & rewards',
    },
  ];

  const displayMenuItems = user.role === 'customer' 
    ? menuItems 
    : menuItems.filter(item => item.path === '/profile');

  const isActive = (path) => pathname === path;
  // Removed avatarSrc variable

  return (
    <aside className="bg-white rounded-2xl border border-earth-200/60 p-5 shadow-sm space-y-6">
      {/* Quick Profile Summary — driven by currentUser prop */}
      <div className="flex items-center gap-4 pb-5 border-b border-earth-100">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sage-500/20 bg-earth-100 flex items-center justify-center shrink-0">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={`${user.name} avatar`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-earth-700 font-bold text-lg uppercase">
              {user?.name?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-earth-800 text-sm">{user.name}</h2>
          <p className="text-xs text-sage-600 font-medium capitalize">
            {user.role === 'admin' ? 'Administrator' : user.role === 'staff' ? 'Staff' : 'Customer'}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {displayMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all group ${
                active
                  ? 'bg-sage-50 border-l-4 border-sage-600 text-sage-800 font-semibold'
                  : 'text-earth-600 hover:bg-earth-50 hover:text-earth-900 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? 'text-sage-700' : 'text-earth-400 group-hover:text-sage-600'}`} />
              <div className="text-left">
                <span className="block text-sm leading-tight">{item.name}</span>
                <span className={`block text-[10px] mt-0.5 font-normal ${active ? 'text-sage-600' : 'text-earth-400'}`}>{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Log out option */}
      <div className="pt-2 border-t border-earth-100">
        <button onClick={() => { logout(); router.push('/'); }} className="flex w-full items-center gap-3.5 px-4 py-3.5 rounded-xl text-clay-600 hover:bg-clay-50/50 hover:text-clay-700 transition-colors text-left">
          <LogOut className="h-5 w-5 text-clay-400" />
          <div className="text-sm font-medium">Log Out</div>
        </button>
      </div>
    </aside>
  );
}
