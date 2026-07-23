"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrderById, updateOrder } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';
import { Star, Camera, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const tags = [
  "Good condition", "Fast shipping", "Perfect fit", 
  "True to size", "Eco-friendly packaging", "Great value"
];

export default function ReviewPage() {
  const router = useRouter();
  const { orderId } = useParams();
  const { currentUser, updateUser } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      const decodedId = decodeURIComponent(orderId);
      const found = await getOrderById(decodedId);
      if (found) setOrder(found);
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFakePhotoUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result);
        setPhotoAdded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);

    // Save review data to localStorage (or update order)
    const decodedId = decodeURIComponent(orderId);
    await updateOrder(decodedId, { 
      hasReviewed: true,
      review: {
        rating,
        tags: selectedTags,
        text: reviewText,
        photoAdded,
        photoUrl: photoData,
        date: new Date().toISOString()
      }
    });
    
    if (updateUser) {
      const updates = { hasReviewed: true };
      if (photoAdded) updates.hasPhotoReviewed = true;
      updateUser(updates);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/orders');
    }, 1500);
  };

  if (!order) return <div className="p-8 text-center text-earth-500">Loading order...</div>;
  if (order.hasReviewed) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <CheckCircle2 className="w-16 h-16 text-sage-600 mb-4" />
        <h2 className="text-xl font-bold text-earth-900 mb-2">You already reviewed this order!</h2>
        <Link href="/orders" className="text-sage-600 font-medium hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50/30 py-8 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-earth-500 hover:text-earth-800 transition-colors mb-6 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-earth-200/60">
          <div className="border-b border-earth-100 pb-5 mb-6 text-center">
            <h1 className="text-2xl font-bold text-earth-900">Write a Review</h1>
            <p className="text-sm text-earth-500 mt-1">Order #{order.id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Rating */}
            <div className="space-y-4">
              <label className="block text-center font-bold text-earth-800">How was your item?</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'fill-earth-100 text-earth-200'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-earth-800">Select tags (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-sage-600 text-white border-sage-600'
                        : 'bg-white text-earth-600 border-earth-200 hover:border-sage-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-earth-800">Add a photo (Optional)</label>
              <p className="text-xs text-earth-500 mb-2">Review with a photo to earn bonus Eco Points!</p>
              
              <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${photoAdded ? 'border-sage-500 bg-sage-50/50' : 'border-earth-200 hover:border-sage-400 bg-earth-50/30'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFakePhotoUpload} />
                {photoAdded ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-sage-600" />
                    <span className="text-sm font-bold text-sage-700">Photo attached!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-earth-400" />
                    <span className="text-sm font-bold text-earth-600">Click to upload photo</span>
                  </div>
                )}
              </label>
            </div>

            {/* Review Text */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-earth-800">Tell us more (Optional)</label>
              <textarea 
                rows="4" 
                className="w-full p-4 bg-earth-50 border border-earth-200 rounded-2xl text-sm focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-colors"
                placeholder="What did you love about this piece?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={rating === 0 || isSubmitting}
              className={`w-full py-4 rounded-full font-bold text-white shadow-sm transition-all ${
                rating > 0 
                  ? 'bg-sage-600 hover:bg-sage-700 hover:-translate-y-0.5' 
                  : 'bg-earth-200 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
