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
      <div className="absolute inset-0 flex flex-col justify-end items-center md:items-start text-center md:text-left pb-16 md:pb-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="animate-fade-up max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white font-bold tracking-widest text-[10px] rounded-full uppercase border border-white/30 mb-6">
            Autumn / Winter Collection
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-serif font-bold text-white leading-tight md:leading-[1.1] mb-6 drop-shadow-lg">
            Timeless Vintage. <br />
            <span className="italic font-light">Curated for you.</span>
          </h1>
          <p className="text-sm md:text-base text-[#F9F8F6] max-w-lg mb-8 font-sans font-medium drop-shadow-md">
            Discover a hand-selected collection of premium second-hand garments. Clean, repaired, and ready for their next chapter.
          </p>
          <button 
            onClick={() => scrollTo('collection')}
            className="px-10 py-4 bg-white text-[#2D2D2A] rounded-none text-xs font-bold tracking-widest uppercase hover:bg-[#F2E9DC] transition-colors shadow-xl"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}
