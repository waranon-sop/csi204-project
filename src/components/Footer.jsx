import React from 'react';
import Link from 'next/link';
import { Leaf, Smartphone } from 'lucide-react';

export default function Footer() {
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
            
            {/* App Benefit */}
            <div className="pt-4 border-t border-[#4A543C] pr-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5F6B4E]/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-[#DFE4D9]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Get the Re-Wear App</h4>
                  <p className="text-[11px] text-[#8B8B88] mb-2">Download our app for exclusive early access to drops and an extra 10% off your first order.</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-[#8B8B88] rounded-lg text-[10px] font-bold hover:bg-white hover:text-[#2D2D2A] transition-colors">App Store</button>
                    <button className="px-3 py-1.5 border border-[#8B8B88] rounded-lg text-[10px] font-bold hover:bg-white hover:text-[#2D2D2A] transition-colors">Google Play</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#DFE4D9] mb-6">Shop by Category</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/search?q=Vintage%20Denim" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Vintage Denim</Link></li>
              <li><Link href="/search?q=Y2K%20Shirts" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Y2K Tops & Shirts</Link></li>
              <li><Link href="/search?q=Jackets" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Outerwear & Jackets</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Archival Pieces</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Sale & Offers</Link></li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#DFE4D9] mb-6">Help & Info</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Garment Care Guide</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/" className="text-[13px] text-[#8B8B88] hover:text-white transition-colors">Contact Us</Link></li>
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
            <Link href="/eco-impact" className="inline-block text-[11px] font-bold text-white border-b border-white pb-0.5 hover:text-[#DFE4D9] transition-colors">
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
