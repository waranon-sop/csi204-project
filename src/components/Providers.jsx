"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { User, ShieldAlert, Cpu } from 'lucide-react';

function RoleSwitcherWidget() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const { currentUser, setDemoUser } = useAuth();

  if (isAuthPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#FCFBF7] border border-[#F2E9DC] p-4 rounded-3xl shadow-2xl max-w-[260px] font-sans text-[#2D2D2A]">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#F2E9DC]">
        <Cpu className="h-4 w-4 text-[#5F6B4E]" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#5F6B4E]">SAD Role Switcher</span>
      </div>
      <p className="text-[10px] text-[#8B8B88] mb-3 leading-normal font-light">
        จำลองสิทธิ์บัญชีผู้ใช้เพื่อส่งงานวิเคราะห์ระบบ (ลองคลิกเปลี่ยนปุ่มด้านล่างเพื่อดูการเปลี่ยนแปลงของแถบนำทางและเมนูหลัก)
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setDemoUser({ name: 'Alex Rivers', role: 'customer' })}
          className={`w-full py-2 px-3 text-xs rounded-xl flex items-center justify-between font-bold transition-all ${
            currentUser?.role === 'customer'
              ? 'bg-[#5F6B4E] text-white shadow-sm'
              : 'bg-white hover:bg-[#F2E9DC]/40 border border-[#EAE5DB] text-[#2D2D2A]'
          }`}
        >
          <span>ลูกค้า (Customer)</span>
          <User className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setDemoUser({ name: 'พนักงาน สมศักดิ์', role: 'staff' })}
          className={`w-full py-2 px-3 text-xs rounded-xl flex items-center justify-between font-bold transition-all ${
            currentUser?.role === 'staff'
              ? 'bg-[#C57B57] text-white shadow-sm'
              : 'bg-white hover:bg-[#F2E9DC]/40 border border-[#EAE5DB] text-[#2D2D2A]'
          }`}
        >
          <span>พนักงาน (Staff)</span>
          <Cpu className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setDemoUser({ name: 'ผู้ดูแลระบบ ยิ่งยศ', role: 'admin' })}
          className={`w-full py-2 px-3 text-xs rounded-xl flex items-center justify-between font-bold transition-all ${
            currentUser?.role === 'admin'
              ? 'bg-[#2D2D2A] text-white shadow-sm'
              : 'bg-white hover:bg-[#F2E9DC]/40 border border-[#EAE5DB] text-[#2D2D2A]'
          }`}
        >
          <span>ผู้ดูแลระบบ (Admin)</span>
          <ShieldAlert className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <UserProvider>
          {children}
          
          {/* ==================== Interactive SAD Demo Role Switcher ==================== */}
          <RoleSwitcherWidget />
        </UserProvider>
      </CartProvider>
    </AuthProvider>
  );
}
