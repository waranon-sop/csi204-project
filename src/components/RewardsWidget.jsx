"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Leaf, Tag, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RewardsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { openAuthModal } = useAuth();

  return (
    <div className="fixed bottom-0 right-8 z-[60] flex flex-col items-end">
      {/* Expanded State */}
      <div 
        className={`bg-white border border-[#EAE5DB] shadow-2xl rounded-t-xl w-[340px] overflow-hidden transition-all duration-300 ease-in-out transform origin-bottom ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-full pointer-events-none absolute'
        }`}
      >
        {/* Header */}
        <button 
          onClick={() => setIsOpen(false)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F9F8F6] transition-colors"
        >
          <span className="font-bold text-[#2D2D2A] text-sm tracking-wide">Ready to get rewarded?</span>
          <ChevronDown className="w-4 h-4 text-[#8B8B88]" />
        </button>

        <div className="px-6 pb-6 pt-2 text-center">
          {/* Logo Placeholder */}
          <div className="mb-4">
            <h3 className="font-serif text-2xl font-bold text-[#2D2D2A] tracking-tighter">
              Re-Wear <span className="text-[#C57B57]">REWARDS</span>
            </h3>
          </div>

          <p className="text-[11px] text-[#5C5C5A] font-medium leading-relaxed mb-6 px-2">
            Join the Re-Wear REWARDS program to start earning points and exclusive benefits. <Link href="#" className="underline hover:text-[#2D2D2A]">Unlock exclusive benefits</Link>
          </p>

          {/* Icons Grid */}
          <div className="flex justify-between items-center px-2 mb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-[#C57B57] bg-[#F9F8F6] flex items-center justify-center text-[#C57B57]">
                <Leaf className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] text-[#8B8B88] font-bold">Points Per THB</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-[#C57B57] bg-[#F9F8F6] flex items-center justify-center text-[#C57B57]">
                <Tag className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] text-[#8B8B88] font-bold">Discount Reward</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-[#C57B57] bg-[#F9F8F6] flex items-center justify-center text-[#C57B57]">
                <Gift className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] text-[#8B8B88] font-bold">Birthday Gift</span>
            </div>
          </div>

          <button onClick={() => openAuthModal('register')} className="block w-full py-3 bg-[#2D2D2A] text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-[#4A543C] transition-colors mb-4 text-center">
            Join Now
          </button>
          
          <p className="text-[11px] text-[#8B8B88] font-medium">
            Already a member? <button onClick={() => openAuthModal('login')} className="text-[#2D2D2A] underline hover:text-[#5F6B4E]">Sign In</button>
          </p>
        </div>
      </div>

      {/* Collapsed State (Tab) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white border-t border-l border-r border-[#EAE5DB] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-xl px-8 py-3 flex items-center gap-4 hover:bg-[#F9F8F6] transition-colors animate-fade-up"
        >
          <span className="font-bold text-[#2D2D2A] text-sm tracking-wide">Ready to get rewarded?</span>
          <ChevronUp className="w-4 h-4 text-[#8B8B88]" />
        </button>
      )}
    </div>
  );
}
