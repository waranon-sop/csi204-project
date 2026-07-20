"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Phone, MapPin, Shield, Check, Lock, ShieldCheck, Box, FileText, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettings() {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    avatar: '',
    ecoStatus: 'Eco Hero',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        password: currentUser.password || '',
        avatar: currentUser.avatar || '',
        ecoStatus: currentUser.ecoStatus || 'Eco Hero',
      }));
    }
  }, [currentUser]);

  const [saved, setSaved] = useState(false);
  const fileInputRef = React.useRef(null);
  const { updateUser } = useAuth();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 70% quality to prevent LocalStorage QuotaExceededError
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, avatar: compressedBase64 }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
      avatar: formData.avatar
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>

        {/* Content Right */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="border-b border-earth-100 pb-5 mb-6">
              <h1 className="text-2xl font-bold text-earth-900">Profile Settings</h1>
              <p className="text-xs text-earth-500 mt-1">Manage your personal information, delivery address, and sustainability details.</p>
            </div>

            {/* Profile Pic Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-sage-500/20 shadow-md">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Avatar big" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EAE5DB] flex items-center justify-center text-3xl font-bold text-[#2D2D2A] uppercase">
                    {formData.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="font-semibold text-earth-800 text-sm">Profile Picture</h3>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors shadow-sm"
                  >
                    Change Picture
                  </button>
                  <button 
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-white hover:bg-earth-50 text-earth-700 text-xs font-medium px-4 py-2 rounded-full border border-earth-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-[10px] text-earth-400">JPG, PNG files allowed (max 2MB)</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-earth-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-earth-50 border border-earth-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-earth-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-earth-50 border border-earth-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center block">
                    <label className="text-xs font-semibold text-earth-700">Password</label>
                    {currentUser?.role === 'staff' && (
                      <span className="text-[10px] text-clay-600 font-medium">*Contact Admin to change</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-3 h-4.5 w-4.5 ${currentUser?.role === 'staff' ? 'text-earth-300' : 'text-earth-400'}`} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      disabled={currentUser?.role === 'staff'}
                      className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all ${
                        currentUser?.role === 'staff' 
                          ? 'bg-earth-100/50 border-earth-100 text-earth-500 cursor-not-allowed' 
                          : 'bg-earth-50 border-earth-200 focus:bg-white'
                      }`}
                      required={currentUser?.role !== 'staff'}
                    />
                  </div>
                </div>

                {/* Phone (For All Users) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-earth-400" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="e.g. 0812345678"
                      className="w-full bg-earth-50 border border-earth-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Staff/Admin Info (Read-only) */}
                {(currentUser?.role === 'staff' || currentUser?.role === 'admin') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-earth-700 block">Employee ID</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-earth-400" />
                        <input
                          type="text"
                          value={currentUser?.id || '—'}
                          disabled
                          className="w-full bg-earth-100/50 border border-earth-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-earth-600 font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-earth-700 block">Join Date</label>
                      <div className="relative">
                        <Check className="absolute left-3.5 top-3 h-4.5 w-4.5 text-earth-400" />
                        <input
                          type="text"
                          value={currentUser?.joinDate || '01 Jan 2024'}
                          disabled
                          className="w-full bg-earth-100/50 border border-earth-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-earth-600 font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Eco status info - Only for Customer */}
                {currentUser?.role === 'customer' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-earth-700 block">Eco Status</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-3 h-4.5 w-4.5 text-sage-500" />
                      <input
                        type="text"
                        value={formData.ecoStatus}
                        disabled
                        className="w-full bg-sage-50/50 border border-sage-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-sage-800 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Address - Only for Customer */}
              {currentUser?.role === 'customer' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">Delivery Address for Returns</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-earth-400" />
                    <textarea
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-earth-50 border border-earth-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all resize-none"
                      required={currentUser?.role === 'customer'}
                    />
                  </div>
                </div>
              )}

              {/* Save Button & Feedback */}
              <div className="flex items-center justify-between pt-4 border-t border-earth-100">
                <div>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-sage-700 font-medium animate-bounce">
                      <Check className="h-4 w-4 bg-sage-100 text-sage-800 rounded-full p-0.5" />
                      Changes saved successfully!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-sage-600 hover:bg-sage-700 text-white font-medium px-8 py-3 rounded-full hover-lift hover-glow transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Role & Permissions Card (Admin/Staff only) */}
          {currentUser?.role !== 'customer' && (
            <div className="bg-white rounded-2xl border border-sage-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-sage-500"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-sage-100 p-2.5 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-sage-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-earth-900">System Access & Permissions</h2>
                  <p className="text-xs text-earth-500">Your authorized capabilities as a {currentUser?.role === 'admin' ? 'System Administrator' : 'Quality Inspector'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentUser?.role === 'admin' ? (
                  <>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <User className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">User Management</h4>
                        <p className="text-xs text-earth-500 mt-1">Create, edit, and assign roles to system users.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <Box className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">Inventory Control</h4>
                        <p className="text-xs text-earth-500 mt-1">Full access to manage products, categories, and stock.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <Activity className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">Order Processing</h4>
                        <p className="text-xs text-earth-500 mt-1">Approve, reject, and monitor all customer orders.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <FileText className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">System Reports</h4>
                        <p className="text-xs text-earth-500 mt-1">View financial, inventory, and eco-impact analytics.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <ShieldCheck className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">Quality Inspection</h4>
                        <p className="text-xs text-earth-500 mt-1">Verify condition and authenticate returned garments.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <Box className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">Dispatch Queue</h4>
                        <p className="text-xs text-earth-500 mt-1">Update tracking numbers and manage outbound shipments.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-earth-50/50 border border-earth-100">
                      <Activity className="w-5 h-5 text-earth-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-earth-900">Status Updates</h4>
                        <p className="text-xs text-earth-500 mt-1">Change order statuses during processing pipeline.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
