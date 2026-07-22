"use client";

import React, { useState, useEffect } from 'react';
import { Truck, RotateCcw, MessageCircle, ChevronDown, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  // Enable smooth scrolling ONLY on this page
  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth');
    return () => {
      document.documentElement.classList.remove('scroll-smooth');
    };
  }, []);

  const faqs = [
    {
      q: "How do you authenticate vintage items?",
      a: "Every piece in our collection goes through a rigorous 3-step authentication process by our in-house experts. We check hardware, tags, materials, and stitching against our extensive archive database before any item is listed."
    },
    {
      q: "What is your return policy?",
      a: "We offer a 14-day return window for all items. Garments must be returned in their original condition with all Re-Wear authentication tags still attached. Sale items are final sale and cannot be returned."
    },
    {
      q: "How long does shipping take?",
      a: "Domestic orders typically arrive within 2-4 business days. International shipping takes 7-14 business days depending on the destination. Express shipping options are available at checkout."
    },
    {
      q: "Do you offer garment repair services?",
      a: "Yes! For our Eco-Impact program members (Fruit rank and above), we offer complementary basic repairs. Please contact our support team with photos of your item to assess if a repair is possible."
    }
  ];

  return (
    <AnimatedPage className="min-h-screen bg-[#FAF8F5] pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2D2D2A] mb-4">Help & Guide</h1>
          <p className="text-[#8B8B88] font-medium max-w-xl mx-auto">
            Everything you need to know about shopping with Re-Wear. From shipping to care guides, we've got you covered.
          </p>
        </div>

        {/* Policies Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-[#EAE5DB] hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-[#5F6B4E]/10 text-[#5F6B4E] rounded-full flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#2D2D2A] mb-3">Shipping & Delivery</h3>
            <p className="text-[#8B8B88] text-sm leading-relaxed mb-4">
              All orders are processed within 24 hours. We use carbon-neutral shipping partners for all our deliveries to minimize our environmental impact.
            </p>
            <ul className="text-sm font-medium text-[#2D2D2A] space-y-2">
              <li className="flex justify-between border-b border-[#EAE5DB] pb-2">
                <span>Standard Delivery (2-4 days)</span>
                <span>Free over $200</span>
              </li>
              <li className="flex justify-between border-b border-[#EAE5DB] pb-2">
                <span>Express Delivery (Next Day)</span>
                <span>$15.00</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>International (7-14 days)</span>
                <span>Calculated at checkout</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#EAE5DB] hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-[#C57B57]/10 text-[#C57B57] rounded-full flex items-center justify-center mb-6">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#2D2D2A] mb-3">Returns & Refunds</h3>
            <p className="text-[#8B8B88] text-sm leading-relaxed mb-4">
              We want you to love your vintage piece. If it's not a perfect match, you can return it within 14 days of delivery.
            </p>
            <ul className="text-sm text-[#8B8B88] space-y-2 list-disc pl-4 marker:text-[#C57B57]">
              <li>Items must be unworn and unwashed.</li>
              <li>Re-Wear authentication tags must be attached.</li>
              <li>Refunds are processed within 5-7 business days.</li>
              <li>Original shipping fees are non-refundable.</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq-section" className="max-w-3xl mx-auto mb-20 pt-10 scroll-mt-32">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif text-[#2D2D2A] mb-2">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#EAE5DB] rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-[#2D2D2A] pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#8B8B88] transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm text-[#8B8B88] leading-relaxed pt-2 border-t border-[#EAE5DB]">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-[#2D2D2A] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5F6B4E] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C57B57] rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-serif mb-4">Still need help?</h2>
              <p className="text-[#DFE4D9] mb-8 text-sm md:text-base leading-relaxed">
                Our customer care team is available Monday through Friday, 9AM to 6PM (EST). We aim to respond to all inquiries within 24 hours.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#5F6B4E]" />
                  <span className="text-sm font-medium">support@rewear.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C57B57]" />
                  <span className="text-sm font-medium">1-800-REWEAR</span>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-[#2D2D2A]">
              <h4 className="font-bold text-lg mb-4 text-center">Drop us a line</h4>
              {messageSent ? (
                <div className="bg-[#5F6B4E]/10 border border-[#5F6B4E]/20 text-[#5F6B4E] px-4 py-8 rounded-xl text-center flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-[#5F6B4E] text-white rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold">Thanks for reaching out!</p>
                  <p className="text-xs">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { 
                  e.preventDefault(); 
                  setMessageSent(true);
                  setTimeout(() => setMessageSent(false), 5000);
                }}>
                  <div>
                    <input type="text" placeholder="Name" required className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EAE5DB] rounded-xl text-sm focus:ring-2 focus:ring-[#5F6B4E]/30 outline-none" />
                  </div>
                  <div>
                    <input type="email" placeholder="Email" required className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EAE5DB] rounded-xl text-sm focus:ring-2 focus:ring-[#5F6B4E]/30 outline-none" />
                  </div>
                  <div>
                    <textarea placeholder="Message" required rows="3" className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#EAE5DB] rounded-xl text-sm focus:ring-2 focus:ring-[#5F6B4E]/30 outline-none resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#2D2D2A] text-white rounded-xl text-sm font-bold hover:bg-[#5F6B4E] transition-colors">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}
