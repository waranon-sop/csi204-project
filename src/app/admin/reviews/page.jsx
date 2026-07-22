'use client';

import React, { useState, useEffect } from 'react';
import { useAdminGuard } from '../../../hooks/useRoleGuard';
import { Star, MessageSquare, Image as ImageIcon, Calendar, Tag, Package, User, X } from 'lucide-react';

export default function AdminReviews() {
  const { isAllowed } = useAdminGuard();
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

  if (!isAllowed) return null;

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#2D2D2A]">Customer Reviews</h1>
          <p className="text-sm text-[#8B8B88] mt-1">Manage and view feedback from customers</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#8B8B88]">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#EAE5DB]">
          <MessageSquare className="w-12 h-12 text-[#D8D2C8] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#2D2D2A]">No Reviews Yet</h3>
          <p className="text-[#8B8B88]">When customers leave reviews, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 border border-[#EAE5DB] shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8B8B88] mb-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Order #{order.id.slice(-6)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2D2D2A]">
                    <User className="w-4 h-4 text-[#8B8B88]" />
                    <span>{users[order.userId] || order.shippingDetails?.fullName || order.userId || 'Unknown Customer'}</span>
                  </div>
                </div>
                
                {order.review?.date && (
                  <div className="flex items-center gap-1 text-xs text-[#8B8B88]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.review.date).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = order.review?.rating || 5; // Default to 5 for legacy reviews without rating
                  return (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-[#EAE5DB] text-[#D8D2C8]'}`} 
                    />
                  );
                })}
              </div>

              {/* Review Text */}
              {order.review?.text ? (
                <p className="text-sm text-[#5C5C58] mb-4 flex-1 italic">
                  "{order.review.text}"
                </p>
              ) : (
                <p className="text-sm text-[#8B8B88] mb-4 flex-1 italic opacity-60">
                  No written feedback provided.
                </p>
              )}

              {/* Tags */}
              {order.review?.tags && order.review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.review.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E3E7D3]/50 text-[#3A4A2D] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-[#EAE5DB] flex justify-between items-center text-xs">
                {(order.review?.photoUrl || order.review?.photoAdded || order.hasPhotoReviewed) ? (
                  order.review?.photoUrl ? (
                    <button 
                      onClick={() => setSelectedPhoto(order.review.photoUrl)}
                      className="flex items-center gap-1.5 text-sage-600 font-semibold hover:text-sage-700 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> View Photo
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sage-600 font-semibold">
                      <ImageIcon className="w-4 h-4" /> Photo Attached
                    </span>
                  )
                ) : (
                  <span className="text-[#8B8B88]">No photo attached</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedPhoto} 
              alt="Review attachment" 
              className="rounded-lg object-contain max-h-[85vh] shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
