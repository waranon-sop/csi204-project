"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Phone, MapPin, Shield, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettings() {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
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
        ecoStatus: currentUser.ecoStatus || 'Eco Hero',
      }));
    }
  }, [currentUser]);

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });
    }
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
              <h1 className="text-2xl font-bold text-earth-900">การตั้งค่าโปรไฟล์</h1>
              <p className="text-xs text-earth-500 mt-1">จัดการข้อมูลส่วนตัว รายละเอียดที่อยู่จัดส่ง และข้อมูลความยั่งยืนของคุณ</p>
            </div>

            {/* Profile Pic Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-sage-500/20 shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                  alt="Avatar big" 
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="font-semibold text-earth-800 text-sm">รูปโปรไฟล์</h3>
                <div className="flex gap-2">
                  <button className="bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors shadow-sm">
                    เปลี่ยนรูปใหม่
                  </button>
                  <button className="bg-white hover:bg-earth-50 text-earth-700 text-xs font-medium px-4 py-2 rounded-full border border-earth-200 transition-colors">
                    ลบออก
                  </button>
                </div>
                <p className="text-[10px] text-earth-400">อนุญาตไฟล์ JPG, PNG ขนาดไม่เกิน 2MB</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">ชื่อ-นามสกุล</label>
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
                  <label className="text-xs font-semibold text-earth-700 block">อีเมลติดต่อ</label>
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

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">เบอร์โทรศัพท์</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-earth-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-earth-50 border border-earth-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Eco status info */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-earth-700 block">ระดับสมาชิกสีเขียว</label>
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
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-earth-700 block">ที่อยู่สำหรับจัดส่งและการคืนเสื้อผ้า</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-earth-400" />
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-earth-50 border border-earth-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all resize-none"
                    required
                  />
                </div>
              </div>

              {/* Save Button & Feedback */}
              <div className="flex items-center justify-between pt-4 border-t border-earth-100">
                <div>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-sage-700 font-medium animate-bounce">
                      <Check className="h-4 w-4 bg-sage-100 text-sage-800 rounded-full p-0.5" />
                      บันทึกข้อมูลเรียบร้อยแล้ว!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-sage-600 hover:bg-sage-700 text-white font-medium px-8 py-3 rounded-full hover-lift hover-glow transition-all"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
