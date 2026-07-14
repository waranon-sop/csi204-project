"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Recycle, Scissors, HeartHandshake } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import CircularityQuote from '../../components/home/CircularityQuote';

export default function SustainabilityPublicPage() {
  return (
    <AnimatedPage className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image 
          src="/sustainability_hero.png" 
          alt="Vintage clothing and nature" 
          fill 
          className="object-cover opacity-80 mix-blend-multiply" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/60 via-transparent to-[#FAF8F5]"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <div className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#5F6B4E]/30 bg-[#F9F8F6]/80 backdrop-blur-sm">
            <Leaf className="w-3.5 h-3.5 text-[#5F6B4E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F6B4E]">Our Philosophy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#2D2D2A] mb-8 leading-tight tracking-tight">
            Fashion that <br />
            <span className="italic text-[#5F6B4E]">heals the planet.</span>
          </h1>
        </div>
      </section>

      {/* The Big Number Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#C57B57] mb-6">Collective Impact</p>
          <div className="text-7xl md:text-9xl font-serif font-bold text-[#2D2D2A] mb-6 tracking-tighter">
            100,000<span className="text-[#5F6B4E]">kg</span>
          </div>
          <p className="text-lg md:text-xl text-[#5C5C5A] font-medium max-w-2xl mx-auto leading-relaxed">
            of CO₂ saved by the Re-wear community this year alone by circulating quality vintage garments instead of producing new ones.
          </p>
        </div>
      </section>

      {/* Our Initiatives Section */}
      <section className="py-24 px-6 bg-[#F9F8F6] border-y border-[#EAE5DB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-[#2D2D2A] mb-4">Our Initiatives</h2>
            <p className="text-sm text-[#5C5C5A]">How we're reducing our footprint at every step.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Initiative 1 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE5DB] hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-square relative rounded-xl overflow-hidden mb-6 bg-[#FAF8F5]">
                <Image src="/sustainability_packaging.png" alt="Recycled Packaging" fill className="object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE5DB] flex items-center justify-center text-[#5F6B4E]">
                  <Recycle className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#2D2D2A]">100% Recycled Packaging</h3>
              </div>
              <p className="text-sm text-[#8B8B88] leading-relaxed">
                All our orders are shipped in boxes made from post-consumer recycled cardboard and tied with natural compostable twine. No plastics involved.
              </p>
            </div>

            {/* Initiative 2 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE5DB] hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-square relative rounded-xl overflow-hidden mb-6 bg-[#FAF8F5] flex items-center justify-center">
                <Scissors className="w-32 h-32 text-[#EAE5DB] group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE5DB] flex items-center justify-center text-[#C57B57]">
                  <Scissors className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#2D2D2A]">Garment Repair Workshop</h3>
              </div>
              <p className="text-sm text-[#8B8B88] leading-relaxed">
                Every piece is meticulously inspected, cleaned, and repaired by our expert artisans to ensure it lives a second, even more beautiful life.
              </p>
            </div>

            {/* Initiative 3 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE5DB] hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-square relative rounded-xl overflow-hidden mb-6 bg-[#FAF8F5] flex items-center justify-center">
                <HeartHandshake className="w-32 h-32 text-[#EAE5DB] group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE5DB] flex items-center justify-center text-[#2D2D2A]">
                  <HeartHandshake className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#2D2D2A]">Donation Programs</h3>
              </div>
              <p className="text-sm text-[#8B8B88] leading-relaxed">
                Pieces that don't make it to our curated collection are donated to local shelters and textile recycling centers to ensure zero waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2D2D2A] mb-8">Ready to make an impact?</h2>
        <p className="text-base text-[#5C5C5A] mb-10 max-w-xl mx-auto">
          Join our community of conscious curators. Track your personal carbon footprint, earn eco-rewards, and help us reshape the fashion industry.
        </p>
        <Link 
          href="/login" 
          className="inline-block bg-[#2D2D2A] text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#4A543C] transition-colors rounded-sm"
        >
          Start Your Eco Journey
        </Link>
      </section>

      <CircularityQuote />
    </AnimatedPage>
  );
}
