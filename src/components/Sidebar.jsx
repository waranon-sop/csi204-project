"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, History, CreditCard, Heart, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Avatar URLs keyed by role — mirrors the values used in Navbar & ProfileDropdown
const ROLE_AVATARS = {
  customer:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
  staff:
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
  admin:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
};
export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const user = currentUser || { name: 'Guest', role: 'customer' };

  const menuItems = [
    {
      name: 'การตั้งค่าโปรไฟล์',
      path: '/profile',
      icon: User,
      description: 'แก้ไขข้อมูลส่วนตัวและที่อยู่',
    },
    {
      name: 'ประวัติการสั่งซื้อ',
      path: '/orders',
      icon: History,
      description: 'ตรวจสอบคำสั่งซื้อย้อนหลัง',
    },
    {
      name: 'ช่องทางการชำระเงิน',
      path: '/payment',
      icon: CreditCard,
      description: 'จัดการบัตรและบัญชีธนาคาร',
    },
    {
      name: 'ตู้เสื้อผ้า & รายการโปรด',
      path: '/wardrobe',
      icon: Heart,
      description: 'เสื้อผ้าที่บันทึกไว้และที่ลงขาย',
    },
    {
      name: 'แดชบอร์ดรักษ์โลก',
      path: '/eco-impact',
      icon: Leaf,
      description: 'คำนวณการลดคาร์บอนและรางวัล',
    },
  ];

  const isActive = (path) => pathname === path;
  const avatarSrc = ROLE_AVATARS[user.role] ?? ROLE_AVATARS.customer;

  return (
    <aside className="bg-white rounded-2xl border border-earth-200/60 p-5 shadow-sm space-y-6">
      {/* Quick Profile Summary — driven by currentUser prop */}
      <div className="flex items-center gap-4 pb-5 border-b border-earth-100">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sage-500/20">
          <Image 
            src={avatarSrc} 
            alt={`${user.name} avatar`} 
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold text-earth-800 text-sm">{user.name}</h2>
          <p className="text-xs text-sage-600 font-medium">สมาชิกระดับ Eco Hero</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
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
          <div className="text-sm font-medium">ออกจากระบบ</div>
        </button>
      </div>
    </aside>
  );
}
