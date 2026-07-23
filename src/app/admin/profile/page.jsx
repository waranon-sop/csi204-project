"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/ToastProvider';
import { ShieldCheck, User, Mail, Lock, Camera, Check, Phone, MapPin, AlignLeft, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { useStaffGuard } from '../../../hooks/useRoleGuard';

export default function AdminProfile() {
  const { isAllowed } = useStaffGuard();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        password: currentUser.password || '',
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSuccess(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        addToast('Image must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
        setIsSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentUser, ...formData })
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      
      const updatedUser = await res.json();
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setIsSuccess(true);
      addToast('Profile updated successfully!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error(error);
      addToast('Error updating profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen p-6 md:p-10 animate-fade-in bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2A] tracking-tight">Account Settings</h1>
          <p className="text-sm text-[#8B8B88] mt-1">Manage your personal information and security preferences.</p>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE5DB] overflow-hidden">
          
          {/* Header Profile Summary */}
          <div className="p-8 border-b border-[#EAE5DB] flex flex-col md:flex-row items-center md:items-start gap-6 bg-[#FDFBF9]">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
            />
            <div className="relative cursor-pointer group shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-[4px] border-white shadow-sm bg-[#EAE5DB] flex items-center justify-center transition-transform group-hover:scale-105">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#8B8B88] uppercase">{formData.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#2D2D2A] text-white p-2 rounded-full border-[3px] border-white shadow-sm group-hover:bg-[#4A533D] transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1 mt-2">
              <h2 className="text-2xl font-bold text-[#2D2D2A]">{formData.name || 'User'}</h2>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                <div className="inline-flex items-center gap-1.5 bg-[#EEF1EA] border border-[#C2CBB8] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#3A4A2D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentUser.role}
                </div>
                <span className="text-xs font-medium text-[#8B8B88]">ID: {currentUser.id}</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-8 space-y-8">
            
            {/* Personal Information Section */}
            <section>
              <h3 className="text-sm font-bold text-[#2D2D2A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#8B8B88]" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE5DB] focus:outline-none focus:border-[#2D2D2A] text-sm bg-[#FAF8F5] focus:bg-white text-[#2D2D2A] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+66 81 234 5678"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE5DB] focus:outline-none focus:border-[#2D2D2A] text-sm bg-[#FAF8F5] focus:bg-white text-[#2D2D2A] transition-all"
                  />
                </div>
              </div>
            </section>

            <hr className="border-[#EAE5DB]" />

            {/* Account & Security Section */}
            <section>
              <h3 className="text-sm font-bold text-[#2D2D2A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8B8B88]" /> Account & Security
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest flex items-center justify-between max-w-md">
                    <span>Email Address</span>
                    {!isAdmin && <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Admin Only</span>}
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isAdmin}
                    className={`w-full max-w-md px-4 py-2.5 rounded-xl border border-[#EAE5DB] focus:outline-none focus:border-[#2D2D2A] text-sm text-[#2D2D2A] transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-[#FAF8F5] focus:bg-white'}`}
                  />
                  {!isAdmin && <p className="text-[10px] text-red-500 mt-1 font-medium">To change your email, please contact an Administrator.</p>}
                </div>

                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest flex items-center justify-between">
                      <span>New Password</span>
                      {!isAdmin && <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Admin Only</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={!isAdmin}
                        placeholder={isAdmin ? "Enter new password" : "••••••••"}
                        className={`w-full px-4 py-2.5 rounded-xl border border-[#EAE5DB] focus:outline-none focus:border-[#2D2D2A] text-sm text-[#2D2D2A] transition-all pr-10 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-[#FAF8F5] focus:bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        disabled={!isAdmin}
                        className={`w-full px-4 py-2.5 rounded-xl border border-[#EAE5DB] focus:outline-none focus:border-[#2D2D2A] text-sm text-[#2D2D2A] transition-all pr-10 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-[#FAF8F5] focus:bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {!isAdmin && <p className="text-[10px] text-red-500 font-medium">To change your password, please contact an Administrator.</p>}
              </div>
            </section>
          </div>
          
          {/* Footer Save Button */}
          <div className="px-8 py-5 border-t border-[#EAE5DB] bg-[#FDFBF9] flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                isSuccess 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#2D2D2A] hover:bg-black text-white'
              }`}
            >
              {isSuccess ? <Check className="w-4 h-4" /> : null}
              {isSaving ? 'Saving...' : isSuccess ? 'Saved Successfully' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
