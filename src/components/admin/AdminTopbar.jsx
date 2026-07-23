'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Bell, Search, ShoppingBag, AlertTriangle, MessageSquare, Package, ChevronDown } from 'lucide-react';
import ProfileDropdown from '../ProfileDropdown';

const PAGE_TITLES = {
  '/admin': { title: 'Performance Overview', sub: "Tracking the lifecycle of Re-Wear's curated textile collection" },
  '/admin/inventory': { title: 'Inventory Management', sub: 'Add, edit, and organize your product listings' },
  '/admin/lookbooks': { title: 'Lookbook Management', sub: 'Curate style inspirations and outfits' },
  '/admin/orders': { title: 'Customer Orders', sub: 'View and process incoming customer orders' },
  '/admin/requests': { title: 'Shopper Requests', sub: 'Manage special requests from customers' },
  '/admin/promotions': { title: 'Promotions Management', sub: 'Manage discount codes and promotional campaigns' },
  '/admin/reviews': { title: 'Customer Reviews', sub: 'Monitor and moderate product reviews' },
  '/admin/users': { title: 'User Management', sub: 'Manage staff & admin accounts and access levels' },
  '/admin/support': { title: 'Support Config', sub: 'Configure help and support settings' },
  '/admin/settings': { title: 'Store Settings', sub: 'Manage your store preferences and system configuration' },
  '/admin/profile': { title: 'Account Settings', sub: 'Manage your personal information and security preferences' },
};

// Generate real, actionable notifications from actual data in localStorage
function generateNotifications() {
  const notifs = [];

  try {
    // 1. New Pending Orders
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    pendingOrders.slice(0, 3).forEach((order, i) => {
      notifs.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'New Order Received',
        body: `Order ${order.id} from ${order.customer} is waiting for processing.`,
        time: order.date || 'Recently',
        link: '/admin/orders',
        read: false,
      });
    });

    // 2. Low Stock Alerts (stock <= 3)
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock <= 3 && p.stock > 0 && !p.hidden);
    lowStockProducts.slice(0, 3).forEach((product) => {
      notifs.push({
        id: `stock-${product.id}`,
        type: 'stock',
        title: 'Low Stock Alert',
        body: `"${product.name || product.title}" is running low — only ${product.stock} left.`,
        time: 'In-stock check',
        link: '/admin/inventory',
        read: false,
      });
    });

    // 3. Out of Stock
    const outOfStockProducts = products.filter(p => p.stock === 0 && !p.hidden);
    outOfStockProducts.slice(0, 2).forEach((product) => {
      notifs.push({
        id: `oos-${product.id}`,
        type: 'stock_out',
        title: 'Out of Stock',
        body: `"${product.name || product.title}" is completely out of stock.`,
        time: 'Needs restock',
        link: '/admin/inventory',
        read: false,
      });
    });
  } catch (e) {
    // silently fail
  }

  // Fallback demo notifications if no real data
  if (notifs.length === 0) {
    return [
      {
        id: 'demo-1',
        type: 'order',
        title: 'New Order Received',
        body: 'Order #RW-92031 from Sarah Jenkins is waiting for processing.',
        time: '5 mins ago',
        link: '/admin/orders',
        read: false,
      },
      {
        id: 'demo-2',
        type: 'stock',
        title: 'Low Stock Alert',
        body: '"Raw Silk Trousers" is running low — only 4 left.',
        time: 'In-stock check',
        link: '/admin/inventory',
        read: false,
      },
      {
        id: 'demo-3',
        type: 'stock_out',
        title: 'Out of Stock',
        body: '"Recycled Cotton Sweater" is completely out of stock.',
        time: 'Needs restock',
        link: '/admin/inventory',
        read: true,
      },
    ];
  }

  return notifs;
}

const TYPE_CONFIG = {
  order:     { icon: ShoppingBag, color: 'bg-[#FADCC7] text-[#C57B57]' },
  stock:     { icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  stock_out: { icon: Package, color: 'bg-red-50 text-red-500' },
  message:   { icon: MessageSquare, color: 'bg-blue-50 text-blue-500' },
};

export default function AdminTopbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const pageInfo = PAGE_TITLES[pathname] || { title: 'Admin Portal', sub: '' };

  useEffect(() => {
    // Generate real actionable notifications from localStorage data
    const readIds = JSON.parse(localStorage.getItem('notifReadIds')) || [];
    const generated = generateNotifications().map(n => ({
      ...n,
      read: readIds.includes(n.id),
    }));
    setNotifications(generated);

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
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('notifReadIds', JSON.stringify(allIds));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif) => {
    // Mark as read
    const readIds = JSON.parse(localStorage.getItem('notifReadIds')) || [];
    if (!readIds.includes(notif.id)) {
      const updated = [...readIds, notif.id];
      localStorage.setItem('notifReadIds', JSON.stringify(updated));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    setIsNotifOpen(false);
    // Navigate to the relevant page
    if (notif.link) router.push(notif.link);
  };

  return (
    <header className="h-24 bg-[#FAF8F5]/80 backdrop-blur-md px-10 flex items-center justify-between sticky top-0 z-30 transition-all duration-300 border-b border-[#EAE5DB]/50">
      {/* Left: page title */}
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl font-serif font-bold text-[#2D2D2A] tracking-tight">{pageInfo.title}</h1>
        <p className="text-[13px] text-[#5C5C58] font-sans mt-1">{pageInfo.sub}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">


          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-10 h-10 flex items-center justify-center bg-white border border-[#EAE5DB] rounded-xl text-[#5C5C58] hover:text-[#4A533D] hover:bg-[#FAF8F5] hover:border-[#D8D2C8] transition-all duration-300 shadow-sm group"
            >
              <Bell className="h-[18px] w-[18px] group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-[#C57B57] text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#EAE5DB] overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#EAE5DB] bg-[#FAF8F5] flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#2D2D2A] text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-[10px] text-[#8B8B88] mt-0.5">{unreadCount} require your attention</p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-[#4A533D] hover:text-[#3A4A2D] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items */}
                <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EDE8]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#8B8B88] text-xs">
                      <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                      All caught up! No new notifications.
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.order;
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`w-full text-left p-3.5 hover:bg-[#FAF8F5] transition-colors flex gap-3 items-start ${!notif.read ? 'bg-[#F5F8F0]' : ''}`}
                        >
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-[#2D2D2A] leading-snug">{notif.title}</p>
                            <p className="text-[11px] text-[#5C5C58] mt-0.5 leading-snug">{notif.body}</p>
                            <p className="text-[10px] text-[#8B8B88] mt-1">{notif.time}</p>
                          </div>
                          {/* Unread dot */}
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-[#C57B57] mt-1.5 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-[#EAE5DB] bg-[#FAF8F5]">
                  <button
                    onClick={() => { router.push('/admin/orders'); setIsNotifOpen(false); }}
                    className="text-[11px] font-semibold text-[#4A533D] hover:underline"
                  >
                    View all orders →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#EAE5DB] mx-2"></div>

          {/* Profile Dropdown Toggle */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 text-left hover:bg-[#FAF8F5] p-1.5 pl-2 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-[#EAE5DB]"
            >
              <div className="w-8 h-8 rounded-full bg-[#EAE5DB] overflow-hidden flex items-center justify-center text-xs font-bold text-[#2D2D2A] shrink-0 border border-[#D8D2C8] group-hover:border-[#C2CBB8] transition-colors">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Staff"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="uppercase">
                    {currentUser?.name?.charAt(0) || "S"}
                  </span>
                )}
              </div>
              <div className="hidden md:block pr-1">
                <p className="text-xs font-bold text-[#2D2D2A] leading-none group-hover:text-[#4A533D] transition-colors">
                  {currentUser?.name || "Staff Profile"}
                </p>
                <p className="text-[9px] text-[#8B8B88] mt-1 uppercase tracking-widest font-semibold">
                  {currentUser?.role || "Administrator"}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#8B8B88] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
