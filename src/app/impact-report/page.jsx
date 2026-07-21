"use client";

import React from 'react';
import { Leaf, Droplets, ArrowRight, ShieldCheck, Shirt, TreeDeciduous } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';

export default function ImpactReportPage() {
  const metrics = [
    {
      icon: Leaf,
      value: "12,450",
      unit: "kg",
      label: "CO₂ Emissions Saved",
      color: "text-[#5F6B4E]",
      bg: "bg-[#5F6B4E]/10"
    },
    {
      icon: Droplets,
      value: "45.2",
      unit: "Million Liters",
      label: "Water Conserved",
      color: "text-[#4A543C]",
      bg: "bg-[#4A543C]/10"
    },
    {
      icon: Shirt,
      value: "8,920",
      unit: "Items",
      label: "Garments Rescued",
      color: "text-[#C57B57]",
      bg: "bg-[#C57B57]/10"
    },
    {
      icon: TreeDeciduous,
      value: "3,200",
      unit: "Trees",
      label: "Planted via Partners",
      color: "text-[#8B8B88]",
      bg: "bg-[#8B8B88]/10"
    }
  ];

  return (
    <AnimatedPage className="min-h-screen bg-[#FAF8F5] pt-24 pb-32">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#5F6B4E]/10 text-[#5F6B4E] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
          <Leaf className="w-3.5 h-3.5" /> 2026 Impact Report
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-[#2D2D2A] max-w-4xl mx-auto leading-tight mb-6">
          Fashion that doesn't cost the Earth.
        </h1>
        <p className="text-lg text-[#8B8B88] max-w-2xl mx-auto leading-relaxed">
          At Re-wear, our mission is to break the cycle of fast fashion. By circulating high-quality vintage garments, we are significantly reducing the fashion industry's environmental footprint.
        </p>
      </section>

      {/* Metrics Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-8 border border-[#EAE5DB] hover:shadow-xl transition-all duration-300 group">
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className={`text-4xl font-serif font-bold ${item.color}`}>{item.value}</h3>
                </div>
                <p className="text-sm font-bold text-[#2D2D2A] mb-1">{item.unit}</p>
                <p className="text-sm text-[#8B8B88]">{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Our Process */}
      <section className="bg-[#2D2D2A] py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5F6B4E] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C57B57] rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/3" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">The Re-wear Process</h2>
            <p className="text-[#DFE4D9] max-w-2xl mx-auto text-lg">
              How we ensure every garment that passes through our doors meets our strict quality and authenticity standards while maximizing its lifespan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif font-bold text-[#DFE4D9]">01</span>
              </div>
              <h4 className="text-xl font-bold mb-4">Sourcing & Curation</h4>
              <p className="text-[#8B8B88] text-sm leading-relaxed">
                We travel globally to source the best vintage and archival pieces, focusing on timeless design and durable materials that withstand the test of time.
              </p>
            </div>
            <div>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif font-bold text-[#DFE4D9]">02</span>
              </div>
              <h4 className="text-xl font-bold mb-4">Authentication</h4>
              <p className="text-[#8B8B88] text-sm leading-relaxed">
                Every piece undergoes a rigorous 3-step authentication process by our in-house experts, checking hardware, tags, and stitching against our archive database.
              </p>
            </div>
            <div>
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif font-bold text-[#DFE4D9]">03</span>
              </div>
              <h4 className="text-xl font-bold mb-4">Restoration</h4>
              <p className="text-[#8B8B88] text-sm leading-relaxed">
                Garments are professionally cleaned using eco-friendly methods. Any minor flaws are expertly repaired by our tailors to give the piece a second life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <ShieldCheck className="w-16 h-16 text-[#5F6B4E] mx-auto mb-8" />
        <h2 className="text-3xl md:text-4xl font-serif text-[#2D2D2A] mb-6">Our Commitment to the Future</h2>
        <p className="text-[#8B8B88] text-lg leading-relaxed mb-10">
          We are committed to becoming a 100% carbon-neutral company by 2030. This includes transitioning our entire logistics network to electric vehicles and powering our restoration facilities entirely through renewable energy sources.
        </p>
      </section>

    </AnimatedPage>
  );
}
