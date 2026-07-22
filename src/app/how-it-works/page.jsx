"use client";

import React from 'react';
import { Search, ShieldCheck, Sparkles, Package, ArrowRight } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Global Sourcing",
      description: "Our dedicated buyers travel the globe to source the rarest, highest-quality vintage and archival pieces. We focus exclusively on timeless designs and durable materials that have stood the test of time.",
      color: "text-[#5F6B4E]",
      bg: "bg-[#5F6B4E]/10"
    },
    {
      icon: ShieldCheck,
      title: "2. Rigorous Authentication",
      description: "Every item undergoes a strict 3-step authentication process by our in-house experts. We meticulously inspect tags, hardware, stitching, and materials against our comprehensive archive database.",
      color: "text-[#4A543C]",
      bg: "bg-[#4A543C]/10"
    },
    {
      icon: Sparkles,
      title: "3. Professional Restoration",
      description: "Garments are professionally cleaned using eco-friendly, non-toxic methods. If needed, our tailors perform minor repairs to restore the piece to its former glory while preserving its vintage character.",
      color: "text-[#C57B57]",
      bg: "bg-[#C57B57]/10"
    },
    {
      icon: Package,
      title: "4. Sustainable Shipping",
      description: "Your order is packaged in 100% recycled and biodegradable materials. We offset the carbon emissions of every delivery, ensuring your vintage purchase is truly guilt-free.",
      color: "text-[#8B8B88]",
      bg: "bg-[#8B8B88]/10"
    }
  ];

  return (
    <AnimatedPage className="min-h-screen bg-[#FAF8F5] pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2D2D2A] mb-6">How Re-wear Works</h1>
          <p className="text-[#8B8B88] text-lg max-w-2xl mx-auto leading-relaxed">
            From discovering hidden gems across the globe to delivering them safely to your doorstep, learn about the meticulous journey of every Re-wear garment.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#EAE5DB] -translate-x-1/2 z-0" />
          
          <div className="space-y-16 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 !== 0;
              
              return (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  <div className={`w-full md:w-1/2 ${isEven ? 'text-left' : 'text-left md:text-right'}`}>
                    <h3 className="text-2xl font-serif font-bold text-[#2D2D2A] mb-3">{step.title}</h3>
                    <p className="text-[#8B8B88] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 relative">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${step.bg} ${step.color} border border-white shadow-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2 hidden md:block"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-32 text-center bg-white rounded-3xl p-12 border border-[#EAE5DB]">
          <h2 className="text-3xl font-serif text-[#2D2D2A] mb-4">Ready to find your piece?</h2>
          <p className="text-[#8B8B88] mb-8">Explore our curated collection of authenticated vintage clothing.</p>
          <a href="/search" className="inline-flex items-center gap-2 bg-[#2D2D2A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#5F6B4E] transition-colors">
            Shop the Collection <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </AnimatedPage>
  );
}
