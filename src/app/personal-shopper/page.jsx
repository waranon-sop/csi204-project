"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function PersonalShopper() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    brandOrStyle: '',
    description: '',
    size: ''
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: currentUser?.id,
        ...formData,
        image
      };
      const res = await fetch('/api/shopper-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsSubmitted(true);
        setFormData({ brandOrStyle: '', description: '', size: '' });
        setImage(null);
      }
    } catch (err) {
      console.error('Failed to submit request', err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>

        {/* Content Right */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EAE5DB] p-6 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="border-b border-[#EAE5DB] pb-5 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#2D2D2A] flex items-center gap-2">
                  <Search className="h-6 w-6 text-[#5F6B4E]" />
                  Personal Shopper
                </h1>
                <p className="text-xs text-[#8B8B88] mt-1">Exclusive service for top tier members. Let us find your dream piece.</p>
              </div>
              <button 
                onClick={() => router.push('/eco-impact')}
                className="text-xs font-semibold text-[#8B8B88] hover:text-[#5F6B4E] transition-colors whitespace-nowrap"
              >
                Back to Privileges
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-16 w-16 bg-[#5F6B4E]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-[#5F6B4E]" />
                </div>
                <h2 className="text-xl font-bold text-[#2D2D2A] mb-2">Request Received!</h2>
                <p className="text-sm text-[#8B8B88] max-w-md mx-auto mb-8 leading-relaxed">
                  Our team is now on the hunt for your requested item. We will notify you immediately once we find something that matches your description.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-[#FAF8F5] text-[#2D2D2A] px-6 py-2.5 rounded-full text-xs font-bold border border-[#EAE5DB] hover:bg-[#EAE5DB] transition-colors"
                >
                  Make Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="space-y-6">
                  {/* Brand / Style */}
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2A] mb-2">Brand or Specific Style</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Vintage Levi's 501, 90s Nike Windbreaker, Y2K aesthetic..." 
                      className="w-full text-sm p-4 rounded-xl border border-[#EAE5DB] focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 transition-colors bg-[#FAF8F5]" 
                      value={formData.brandOrStyle}
                      onChange={(e) => setFormData({...formData, brandOrStyle: e.target.value})}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2A] mb-2">Detailed Description</label>
                    <textarea 
                      required
                      rows="4"
                      placeholder="Describe the color, material, era, or any specific details you are looking for..." 
                      className="w-full text-sm p-4 rounded-xl border border-[#EAE5DB] focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 transition-colors bg-[#FAF8F5] resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>

                  {/* Size Preference */}
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2A] mb-2">Size Preference</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Men's L, Women's M, Waist 32..." 
                      className="w-full text-sm p-4 rounded-xl border border-[#EAE5DB] focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 transition-colors bg-[#FAF8F5]" 
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-[#2D2D2A] mb-2">Reference Image (Optional)</label>
                    <div className="border-2 border-dashed border-[#EAE5DB] rounded-2xl p-6 hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      
                      {image ? (
                        <div className="flex flex-col items-center">
                          <div className="relative h-40 w-40 rounded-xl overflow-hidden mb-3 border border-[#EAE5DB] shadow-sm">
                            <img src={image} alt="Reference" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-semibold text-[#5F6B4E]">Click to change image</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#8B8B88] group-hover:text-[#2D2D2A] transition-colors">
                          <div className="h-12 w-12 bg-[#FAF8F5] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#EAE5DB] transition-colors border border-[#EAE5DB]">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium mb-1">Upload a reference photo</p>
                          <p className="text-xs opacity-70">JPEG, PNG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#EAE5DB]">
                    <button 
                      type="submit" 
                      className="w-full bg-[#2D2D2A] text-white font-bold py-4 rounded-xl hover:bg-[#5F6B4E] transition-all flex justify-center items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Submit Request
                    </button>
                    <p className="text-center text-[11px] text-[#8B8B88] mt-4">
                      Our team will reach out to you via your registered email within 24-48 hours.
                    </p>
                  </div>
                </div>
              </form>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
