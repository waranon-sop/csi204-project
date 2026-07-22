'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Image as ImageIcon, Calendar, X } from 'lucide-react';
import Link from 'next/link';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/users')
        ]);
        
        const orders = await ordersRes.json();
        const usersData = await usersRes.json();
        
        const usersMap = {};
        if (Array.isArray(usersData)) {
          usersData.forEach(u => {
            usersMap[u.id] = u.name;
          });
        }
        setUsers(usersMap);
        
        // Filter orders that have reviews and sort by most recent first
        const reviewedOrders = orders
          .filter(o => o.hasReviewed)
          .sort((a, b) => {
            const dateA = a.review?.date ? new Date(a.review.date) : new Date(a.date);
            const dateB = b.review?.date ? new Date(b.review.date) : new Date(b.date);
            return dateB - dateA;
          });
          
        setReviews(reviewedOrders);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2D2D2A] mb-4">Customer Reviews</h1>
          <p className="text-[#8B8B88] text-lg leading-relaxed">
            See what our community has to say about their Re-wear experience. 
            Real feedback from real conscious consumers.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8B8B88]">
            <div className="w-10 h-10 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mb-4"></div>
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#EAE5DB]">
            <MessageSquare className="w-12 h-12 text-[#D8D2C8] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2D2D2A] mb-2">No Reviews Yet</h3>
            <p className="text-[#8B8B88] mb-6">Be the first to share your experience with Re-wear!</p>
            <Link href="/" className="inline-block bg-[#2D2D2A] hover:bg-black text-white px-8 py-3 rounded-full font-medium transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((order) => {
              const reviewDate = order.review?.date ? new Date(order.review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              
              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 md:p-8 border border-[#EAE5DB] shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  {/* Rating & Date */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (order.review?.rating || 5) ? 'text-[#D4AF37] fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8B8B88]">
                      <Calendar className="w-3.5 h-3.5" />
                      {reviewDate}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2D2D2A] mb-2">
                      {order.review?.text ? `"${order.review.text.substring(0, 40)}${order.review.text.length > 40 ? '...' : ''}"` : 'Customer Review'}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-6 italic ${order.review?.text ? 'text-[#5C5C58]' : 'text-[#8B8B88] opacity-60'}`}>
                      {order.review?.text ? `"${order.review.text}"` : 'No written feedback provided.'}
                    </p>
                  </div>

                  {/* Divider */}
                  <hr className="border-[#EAE5DB] mb-4" />

                  {/* Bottom Section: Customer & Photo */}
                  <div className="flex justify-between items-end mt-auto">
                    <div>
                      <p className="text-sm font-semibold text-[#2D2D2A]">
                        {users[order.userId] || 'Verified Buyer'}
                      </p>
                      <p className="text-[11px] text-[#8B8B88] flex items-center gap-1 mt-1">
                        <span className="w-3 h-3 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center text-[8px]">✓</span> Verified Purchase
                      </p>
                    </div>

                    {order.review?.photoUrl && (
                      <button 
                        onClick={() => setSelectedPhoto(order.review.photoUrl)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-sage-50 text-sage-600 hover:bg-sage-100 hover:text-sage-700 transition-colors"
                        title="View attached photo"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-black/50 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedPhoto} 
              alt="Customer Review Reference" 
              className="rounded-lg object-contain max-h-[85vh] shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
