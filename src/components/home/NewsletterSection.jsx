"use client";

import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('ระบบจดหมายข่าว (Newsletter) ยังไม่เปิดให้บริการในเวอร์ชันนี้ครับ');
    setEmail('');
  };

  return (
    <section className="w-full bg-[#F9F8F6] px-6 sm:px-8 py-16">
      <div className="max-w-[1000px] mx-auto bg-[#EBE7DF] rounded-[2.5rem] p-16 md:p-24 flex flex-col items-center justify-center text-center">
        
        <h2 className="font-serif text-[28px] md:text-4xl font-bold text-[#2D2D2A] mb-4">
          Join a community of conscious curators.
        </h2>
        
        <p className="text-[14px] text-[#5C5C5A] max-w-lg mb-10 font-sans font-medium">
          Receive weekly drops, exclusive vintage styling tips, and stories from our artisan partners.
        </p>

        {/* Form */}
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md gap-3 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="flex-1 bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 rounded-full px-6 py-3.5 text-xs text-[#2D2D2A] placeholder:text-[#A0A09F] shadow-sm"
          />
          <button 
            type="submit"
            className="text-white text-xs font-semibold px-8 py-3.5 rounded-full transition-all bg-[#4A543C] hover:bg-[#3A422F] shadow-md flex-shrink-0"
          >
            Subscribe
          </button>
        </form>

        <p className="text-[9px] font-bold tracking-[0.15em] text-[#8B8B88] uppercase">
          No spam. Just inspiration.
        </p>
      </div>
    </section>
  );
}
