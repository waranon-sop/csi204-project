"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Settings, History, Heart, Leaf, LogOut, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileDropdown({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser || currentUser.role === 'guest') return null;

  // Custom links & details depending on user role (SAD system design)
  const getRoleDetails = () => {
    switch (currentUser.role) {
      case 'admin':
        return {
          title: 'System Administrator',
          color: 'text-[#2D2D2A]',
          icon: ShieldAlert,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
          menu: [
            { name: 'Admin Dashboard', path: '/admin', icon: Settings },
            { name: 'User Roles & Permissions', path: '/admin/users', icon: ShieldAlert },
          ],
        };
      case 'staff':
        return {
          title: 'Quality Inspector',
          color: 'text-[#C57B57]',
          icon: Cpu,
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
          menu: [
            { name: 'Inspection Queue', path: '/admin/inventory', icon: Settings },
            { name: 'Dispatch Queue', path: '/admin/orders', icon: History },
          ],
        };
      case 'customer':
      default:
        return {
          title: 'Seed Member',
          color: 'text-[#5F6B4E]',
          icon: Leaf,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          menu: [
            { name: 'My Profile & Settings', path: '/profile', icon: Settings },
            { name: 'Order History', path: '/orders', icon: History },
            { name: 'My Wardrobe', path: '/wardrobe', icon: Heart },
            { name: 'Your Eco-Impact', path: '/eco-impact', icon: Leaf },
          ],
        };
    }
  };

  const roleDetails = getRoleDetails();
  const RoleIcon = roleDetails.icon;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-80 bg-[#FCFBF7] rounded-[1.8rem] border border-[#F2E9DC] shadow-xl shadow-[#2D2D2A]/5 p-6 z-50 transition-all duration-200 transform origin-top-right animate-fade-in font-sans"
    >
      {/* Profile Header (Dynamic) */}
      <button 
        onClick={() => { router.push('/profile'); onClose(); }}
        className="w-full flex items-center gap-4 pb-4 border-b border-[#F2E9DC] mb-4 text-left hover:bg-earth-50/50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer"
      >
        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#F2E9DC] shadow-sm shrink-0">
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={`${currentUser.name} avatar`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#EAE5DB] flex items-center justify-center text-xl font-bold text-[#2D2D2A] uppercase">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-[#2D2D2A] text-base leading-snug">{currentUser.name}</h3>
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-1 ${roleDetails.color}`}>
            <RoleIcon className="h-3 w-3 fill-current" />
            {roleDetails.title}
          </span>
        </div>
      </button>

      {/* Menu Links (Dynamic based on Role) */}
      <nav className="space-y-1 mb-6">
        {roleDetails.menu.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.path}
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#F2E9DC]/40 text-[#2D2D2A] transition-all group text-left"
            >
              <Icon className="h-5 w-5 text-[#8B8B88] group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Action Button */}
      <div className="pt-2">
        <button 
          onClick={() => {
            onClose();
            logout();
            router.push('/');
          }}
          className="w-full flex items-center justify-center gap-2 border border-[#2D2D2A] hover:bg-[#F2E9DC]/40 rounded-full py-2.5 px-4 text-xs font-semibold text-[#2D2D2A] transition-all active:scale-95"
        >
          <LogOut className="h-4 w-4 text-[#8B8B88]" />
          Log Out
        </button>
      </div>
    </div>
  );
}

