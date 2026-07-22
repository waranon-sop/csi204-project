"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { currentUser, openAuthModal } = useAuth();

  const handleProtectedLink = (e) => {
    if (!currentUser) {
      e.preventDefault();
      openAuthModal('login');
    }
  };

  return (
    <footer className="bg-[#2D2D2A] text-white pt-20 pb-10 border-t border-[#4A543C]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & App Benefits */}
          <div className="space-y-6">
            <Link href="/" className="flex items-baseline">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">Re-</span>
              <span className="font-serif text-3xl font-bold tracking-tight text-[#5F6B4E]">wear</span>
            </Link>
            <p className="text-[#8B8B88] text-[13px] leading-relaxed font-medium pr-4">
              Curated second-hand clothing, repaired and restored for the conscious consumer. We believe in sustainable style that lasts decades.
            </p>
            
            <div className="pt-4 pr-4">
              <Link href="/eco-impact" onClick={handleProtectedLink} className="text-[11px] font-bold text-[#DFE4D9] hover:text-white transition-colors flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5" /> {currentUser ? 'My Eco-Impact Rewards' : 'Join our Eco-Impact Program'}
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#DFE4D9] mb-6">Shop by Category</h3>
            <ul className="space-y-4">
              <li><Link href="/search?q=Tops&cat=CLOTHING" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">T-shirts & Tops</Link></li>
              <li><Link href="/search?q=Pants&cat=CLOTHING" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Pants & Jeans</Link></li>
              <li><Link href="/search?q=Outerwear&cat=CLOTHING" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Outerwear</Link></li>
              <li><Link href="/search?q=Dresses&cat=CLOTHING" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Dresses</Link></li>
              <li><Link href="/search?q=Skirts&cat=CLOTHING" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Skirts</Link></li>
              <li><Link href="/search?q=Handbags&cat=ACCESSORIES" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Handbags</Link></li>
            </ul>
          </div>

          {/* Help & Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#DFE4D9] mb-6">Help & Info</h3>
            <ul className="space-y-4">
              <li><Link href="/support" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/support" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Garment Care</Link></li>
              <li><Link href="/support" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Customer Reviews</Link></li>
              <li><Link href="/support?tab=payment" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Payment Options</Link></li>
              <li><Link href="/support?tab=returns" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/support" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Support & Contact Us</Link></li>
            </ul>
          </div>

          {/* Sustainability Mission */}
          <div className="bg-[#4A543C]/20 border border-[#4A543C] rounded-2xl p-6 relative overflow-hidden">
            <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-[#5F6B4E]/10" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#DFE4D9] mb-4 flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5" /> Our Mission
            </h3>
            <p className="text-[13px] text-[#8B8B88] mb-4 font-medium leading-relaxed">
              We've saved over 12,000 kg of CO₂ this year alone by circulating quality vintage garments instead of producing new ones.
            </p>
            <Link href="/impact-report" className="inline-block text-[11px] font-bold text-white border-b border-white pb-0.5 hover:text-[#DFE4D9] transition-colors">
              Read Our Impact Report &rarr;
            </Link>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#4A543C] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#8B8B88]">
            &copy; {new Date().getFullYear()} Re-Wear Collective. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-[#4A543C]/30 flex items-center justify-center text-[#8B8B88] hover:text-white hover:bg-[#4A543C] transition-colors text-[10px] font-bold">
              IG
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#4A543C]/30 flex items-center justify-center text-[#8B8B88] hover:text-white hover:bg-[#4A543C] transition-colors text-[10px] font-bold">
              TW
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#4A543C]/30 flex items-center justify-center text-[#8B8B88] hover:text-white hover:bg-[#4A543C] transition-colors text-[10px] font-bold">
              FB
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
