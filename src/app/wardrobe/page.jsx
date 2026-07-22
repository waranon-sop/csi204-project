"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Sidebar from '../../components/Sidebar';
import { Heart, Plus, Leaf, Eye, Trash2, Tag, Shirt } from 'lucide-react';

const mockSavedItems = [
  {
    id: 1,
    name: 'เสื้อเชิ้ตลายสก็อตวินเทจแปซิฟิก',
    price: 320,
    carbonSaved: '3.8 kg CO₂e',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200',
    condition: 'สภาพดี (92%)',
  },
  {
    id: 2,
    name: 'หมวกไหมพรมสีชาเขียวมัทฉะ',
    price: 180,
    carbonSaved: '1.2 kg CO₂e',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    condition: 'ของใหม่ป้ายห้อย (100%)',
  },
];

const mockMyListings = [
  {
    id: 101,
    name: 'กางเกงสแล็กสีเทาชาร์โคลทรงกระบอก',
    price: 490,
    status: 'กำลังลงขาย',
    statusColor: 'text-sage-700 bg-sage-50 border-sage-200',
    views: 18,
    likes: 4,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=200',
  },
];

export default function MyWardrobe() {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'listings'
  const [savedItems, setSavedItems] = useState(mockSavedItems);
  const [myListings] = useState(mockMyListings);

  const removeItem = (id) => {
    setSavedItems(savedItems.filter(item => item.id !== id));
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
            
            {/* Header with Listing Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-earth-100 pb-5 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-earth-900">ตู้เสื้อผ้าของฉัน</h1>
                <p className="text-xs text-earth-500 mt-1">จัดการเสื้อผ้าที่คุณลงขายและสินค้าที่คุณบันทึกไว้สำหรับช็อปปิ้งในภายหลัง</p>
              </div>
              <button className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover-lift hover-glow transition-all">
                <Plus className="h-4.5 w-4.5" />
                ลงขายเสื้อผ้าใหม่
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-earth-150 mb-6">
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-3 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'saved'
                    ? 'border-sage-600 text-sage-700 font-bold'
                    : 'border-transparent text-earth-500 hover:text-earth-800'
                }`}
              >
                <Heart className={`h-4 w-4 ${activeTab === 'saved' ? 'fill-current text-sage-600' : ''}`} />
                รายการโปรดที่บันทึกไว้ ({savedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-3 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'listings'
                    ? 'border-sage-600 text-sage-700 font-bold'
                    : 'border-transparent text-earth-500 hover:text-earth-800'
                }`}
              >
                <Shirt className="h-4 w-4" />
                ตู้เสื้อผ้าที่ลงขาย ({myListings.length})
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'saved' ? (
              savedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-earth-200 rounded-2xl bg-earth-50/20">
                      <div className="relative w-20 h-20 bg-earth-100 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-semibold text-sm text-earth-800 truncate">{item.name}</h3>
                          <span className="inline-block text-[10px] text-clay-600 bg-clay-50 border border-clay-100 px-2 py-0.5 rounded mt-1">
                            {item.condition}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-earth-100">
                          <span className="text-sm font-bold text-earth-900">฿{item.price}</span>
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-sage-700">
                            <Leaf className="h-3 w-3" />
                            {item.carbonSaved}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-earth-400 hover:text-clay-600 rounded-full hover:bg-clay-50/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="bg-sage-600 hover:bg-sage-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors">
                          ช็อปเลย
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-400">
                    <Heart className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-earth-800">ไม่มีรายการโปรด</h3>
                    <p className="text-xs text-earth-400">เมื่อคุณเจอเสื้อผ้าถูกใจ ให้กดปุ่มหัวใจเพื่อเก็บไว้ที่นี่ได้เลยครับ</p>
                  </div>
                </div>
              )
            ) : (
              myListings.length > 0 ? (
                <div className="space-y-4">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-earth-200 rounded-2xl bg-earth-50/20">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-earth-100 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={listing.image} alt={listing.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-earth-800">{listing.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${listing.statusColor}`}>
                              {listing.status}
                            </span>
                            <span className="text-[10px] text-earth-400">ผู้เข้าชม {listing.views} คน</span>
                            <span className="text-[10px] text-earth-400">ถูกใจ {listing.likes} คน</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-earth-100">
                        <div className="text-left sm:text-right">
                          <span className="block text-xs text-earth-400">ราคาที่ตั้งขาย</span>
                          <span className="block text-sm font-bold text-earth-900">฿{listing.price}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="p-2 text-earth-500 hover:text-sage-700 bg-white border border-earth-200 rounded-xl hover:bg-earth-50 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="bg-white hover:bg-clay-50 text-clay-700 text-xs font-semibold px-4 py-2 rounded-xl border border-clay-200 transition-colors">
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-400">
                    <Tag className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-earth-800">ไม่มีประวัติการตั้งขาย</h3>
                    <p className="text-xs text-earth-400">คุณยังไม่มีเสื้อผ้าลงขาย มาร่วมสร้างแฟชั่นที่ยั่งยืนด้วยกันสิครับ</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
