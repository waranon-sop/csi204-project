"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, RefreshCcw, Tag, User, ChevronDown, ChevronUp, Mail, Phone, MapPin, HelpCircle } from 'lucide-react';
import { useSupport } from '../../context/SupportContext';

const IconMap = {
  Package: <Package className="w-6 h-6" />,
  RefreshCcw: <RefreshCcw className="w-6 h-6" />,
  Tag: <Tag className="w-6 h-6" />,
  User: <User className="w-6 h-6" />,
  HelpCircle: <HelpCircle className="w-6 h-6" />
};

function SupportContent() {
  const { faqData, contactInfo, isLoaded } = useSupport();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeCategory, setActiveCategory] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    if (isLoaded && faqData.length > 0) {
      if (tabParam) {
        const matchedCat = faqData.find(cat => cat.category.toLowerCase().includes(tabParam.toLowerCase()));
        if (matchedCat) {
          setActiveCategory(matchedCat.category);
          setOpenFaqIndex(0);
          return;
        }
      }
      setActiveCategory(prev => prev || faqData[0].category);
    }
  }, [isLoaded, faqData, tabParam]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3A4A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 font-sans text-[#2D2D2A]">
      
      {/* Hero Section */}
      <section className="bg-[#2D2D2A] text-white pt-20 pb-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">How can we help?</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Find answers to your questions or get in touch with our team.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {faqData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.category); setOpenFaqIndex(0); }}
              className={`p-6 rounded-3xl flex flex-col items-center text-center transition-all duration-300 shadow-sm border ${
                activeCategory === cat.category 
                  ? 'bg-white border-[#2D2D2A] shadow-md -translate-y-2' 
                  : 'bg-white border-[#EAE5DB] hover:border-[#C2CBB8] hover:shadow-md hover:-translate-y-1 opacity-80 hover:opacity-100'
              }`}
            >
              <div className={`p-4 rounded-full mb-4 transition-colors ${activeCategory === cat.category ? 'bg-[#EEF1EA] text-[#3A4A2D]' : 'bg-[#FAF8F5] text-[#8B8B88]'}`}>
                {IconMap[cat.iconName] || <HelpCircle className="w-6 h-6" />}
              </div>
              <h3 className={`font-bold ${activeCategory === cat.category ? 'text-[#2D2D2A]' : 'text-[#5C5C5A]'}`}>{cat.category}</h3>
            </button>
          ))}
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto mb-24">
          <h2 className="text-2xl font-black mb-8 text-center">{activeCategory} FAQs</h2>
          <div className="space-y-4">
            {faqData.find(c => c.category === activeCategory)?.questions?.map((faq, idx) => (
              <div 
                key={faq.id || idx} 
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaqIndex === idx ? 'border-[#C2CBB8] shadow-md' : 'border-[#EAE5DB] shadow-sm hover:border-[#D8D2C8]'}`}
              >
                <button 
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  <span className="font-bold pr-8">{faq.q}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#3A4A2D] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8B8B88] shrink-0" />
                  )}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[#5C5C5A] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
            {(!faqData.find(c => c.category === activeCategory)?.questions || faqData.find(c => c.category === activeCategory)?.questions.length === 0) && (
              <div className="text-center text-gray-500 py-8">No questions added yet.</div>
            )}
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#EAE5DB] relative overflow-hidden text-center">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEF1EA] rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FAF8F5] rounded-full blur-3xl -ml-32 -mb-32 opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Still need help?</h2>
            <p className="text-[#8B8B88] mb-12 max-w-xl mx-auto">We're here for you. Reach out to our support team directly via email or phone, and we'll get back to you within 24 hours.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Email */}
              <a href={`mailto:${contactInfo.email}`} className="flex flex-col items-center p-6 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DB] hover:border-[#3A4A2D] hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:bg-[#3A4A2D] group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6 text-[#3A4A2D] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-[#5C5C5A] uppercase tracking-wider mb-2">Email Support</h4>
                <p className="font-bold text-[#2D2D2A] group-hover:text-[#3A4A2D] transition-colors">{contactInfo.email}</p>
              </a>

              {/* Phone */}
              <a href={`tel:${contactInfo.phone}`} className="flex flex-col items-center p-6 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DB] hover:border-[#3A4A2D] hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:bg-[#3A4A2D] group-hover:text-white transition-colors">
                  <Phone className="w-6 h-6 text-[#3A4A2D] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-sm text-[#5C5C5A] uppercase tracking-wider mb-2">Phone</h4>
                <p className="font-bold text-[#2D2D2A] group-hover:text-[#3A4A2D] transition-colors">{contactInfo.phone}</p>
                <p className="text-xs text-[#8B8B88] mt-1">{contactInfo.hours}</p>
              </a>

              {/* Address */}
              <div className="flex flex-col items-center p-6 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DB]">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                  <MapPin className="w-6 h-6 text-[#3A4A2D]" />
                </div>
                <h4 className="font-bold text-sm text-[#5C5C5A] uppercase tracking-wider mb-2">HQ Address</h4>
                <p className="font-bold text-[#2D2D2A] text-center">{contactInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3A4A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SupportContent />
    </Suspense>
  );
}
