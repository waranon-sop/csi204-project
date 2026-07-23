"use client";

import React, { useState } from 'react';
import { Search, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PersonalShopperWidget() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Only show this widget for Harvest tier members
  if (!currentUser || currentUser.tier !== 'Harvest') {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestText.trim()) return;

    const requests = JSON.parse(localStorage.getItem('vintage_requests') || '[]');
    requests.push({
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      request: requestText,
      date: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('vintage_requests', JSON.stringify(requests));

    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setRequestText('');
    }, 3000);
  };

  return (
    <>
      {/* Floating Button (Placed slightly above the Rewards Widget to avoid overlap) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[4.5rem] right-8 z-[50] bg-[#2D2D2A] text-white p-3 rounded-full shadow-xl hover:bg-[#1A1A1A] transition-transform hover:scale-105 group"
          title="Personal Shopper (Harvest Tier Exclusive)"
        >
          <Search className="w-5 h-5 group-hover:text-[#C57B57] transition-colors" />
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-[4.5rem] right-8 z-[55] w-[320px] bg-white border border-[#EAE5DB] shadow-2xl rounded-xl overflow-hidden animate-fade-up">
          <div className="bg-[#2D2D2A] px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#C57B57]" />
              <span className="text-white font-serif font-bold text-sm tracking-wide">Personal Shopper</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#5F6B4E] mb-3" />
                <h4 className="font-bold text-[#2D2D2A] text-sm">Request Received</h4>
                <p className="text-[#8B8B88] text-[11px] mt-2">
                  Our team is on the hunt! We'll notify you as soon as we find your requested item.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-[11px] text-[#5C5C5A] mb-4 leading-relaxed">
                  <strong>Harvest Tier Exclusive:</strong> Looking for a specific vintage brand, style, or era? Let our team know, and we'll hunt it down for you. You'll get first access to purchase it!
                </p>
                <textarea
                  className="w-full border border-[#EAE5DB] rounded p-3 text-xs focus:outline-none focus:border-[#C57B57] resize-none h-24 mb-4 bg-[#F9F8F6]"
                  placeholder="e.g., 'Looking for a vintage Levi's 501 from the 90s in light wash, waist 32'"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#5F6B4E] text-white text-xs font-bold py-2.5 rounded hover:bg-[#4A533D] transition-colors"
                >
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
