import React from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[65vh] md:h-[85vh] bg-[#F9F8F6] overflow-hidden group">
      {/* Background Image */}
      <Image
        src="/hero_uniqlo_banner.png"
        alt="Re-Wear Archive Collection"
        fill
        className="object-cover transition-transform duration-[10s] ease-in-out group-hover:scale-105"
        priority
        unoptimized
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-16 max-w-7xl mx-auto">
        <div className="animate-fade-up flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif italic font-light text-white mb-10 drop-shadow-lg tracking-wide">
            “Curated for you”
          </h1>
          <button 
            onClick={() => scrollTo('collection')}
            className="px-12 py-4 bg-white text-[#2D2D2A] rounded-none text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#F2E9DC] transition-colors shadow-2xl"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}
