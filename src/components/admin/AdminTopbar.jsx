'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Bell, Search, CheckCircle2, User, Package } from 'lucide-react';
import Image from 'next/image';

const mockNotifications = [
  { id: 1, user: 'สมศักดิ์', action: 'Added a new product', target: 'Vintage Denim Jacket', time: '10 mins ago', type: 'product', read: false },
  { id: 2, user: 'สมศักดิ์', action: 'Updated order status', target: '#ORD-2026-8899', time: '1 hour ago', type: 'order', read: false },
  { id: 3, user: 'ยิ่งยศ', action: 'Changed role for', target: 'Emma Watson', time: '3 hours ago', type: 'user', read: true },
];

const PAGE_TITLES = {
  '/admin': { title: 'Performance Overview', sub: "Tracking the lifecycle of Re-Wear's curated textile collection" },
  '/admin/products': { title: 'Staff Inventory', sub: 'Manage your store listings and stock levels' },
  '/admin/orders': { title: 'Customer Orders', sub: 'View and process incoming customer orders' },
  '/admin/customers': { title: 'User Management', sub: 'Manage staff & admin accounts and access levels' },
  '/admin/settings': { title: 'Store Settings', sub: 'Manage your store preferences and system configuration' },
};

export default function AdminTopbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const pageInfo = PAGE_TITLES[pathname] || { title: 'Admin Panel', sub: '' };

  useEffect(() => {
    // Load notifications from local storage
    const storedNotifs = JSON.parse(localStorage.getItem('adminNotifications'));
    if (storedNotifs && storedNotifs.length > 0) {
      setNotifications(storedNotifs);
    } else {
      setNotifications(mockNotifications);
      localStorage.setItem('adminNotifications', JSON.stringify(mockNotifications));
    }
    
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    router.push('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  return (
    <header className="h-auto bg-white/50 backdrop-blur-sm px-8 pt-8 pb-4 flex items-start justify-between border-b border-[#D8D2C8] sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
      {/* Left: page title */}
      <div>
        <h1 className="text-[13px] font-serif text-[#8B8B88] mb-0.5">{pageInfo.title}</h1>
        <p className="text-[11px] text-[#5C5C58] font-sans">{pageInfo.sub}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center bg-white border border-[#EAE5DB] rounded-lg px-3 py-1.5 w-52 focus-within:ring-2 focus-within:ring-[#4A533D]/30 shadow-sm">
            <Search className="h-3.5 w-3.5 text-[#8B8B88] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-xs text-[#2D2D2A] placeholder-[#B5B0A6] outline-none w-full font-sans"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-8 h-8 flex items-center justify-center bg-white border border-[#EAE5DB] rounded-lg text-[#5C5C58] hover:bg-[#FAF8F5] transition-all shadow-sm"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-[#C57B57] text-white rounded-full text-[8px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#EAE5DB] overflow-hidden z-50 animate-fade-in">
                <div className="p-3 border-b border-[#EAE5DB] bg-[#FAF8F5] flex justify-between items-center">
                  <h3 className="font-semibold text-[#2D2D2A] text-xs">Activity Log</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-[#4A533D] hover:text-[#3A4A2D] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#EAE5DB]">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3 hover:bg-[#FAF8F5] cursor-pointer flex gap-3 ${!notif.read ? 'bg-[#F1F4EB]/50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#2D2D2A]">
                          <span className="font-semibold">{notif.user}</span>{' '}
                          <span className="text-[#5C5C58]">{notif.action}</span>{' '}
                          <span className="font-medium">{notif.target}</span>
                        </p>
                        <p className="text-[9px] text-[#8B8B88] mt-0.5">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C57B57] mt-1 shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#EAE5DB] rounded-lg text-[#8B8B88] hover:text-[#C57B57] hover:bg-[#FAF0EA] hover:border-[#DFAB93] transition-all shadow-sm"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
