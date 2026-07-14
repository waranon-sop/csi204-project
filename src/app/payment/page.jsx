"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useCurrentUser } from '../../context/UserContext';
import { createOrder, updateProductStatus } from '../../utils/localStorageHelper';
import { CheckCircle, ShieldCheck, Upload, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cartItems, cartTotal, subTotal, shipping, clearCart } = useCart();
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadSlip = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate file upload and save flag to LocalStorage
      localStorage.setItem('slipUploaded', 'true');
      setSlipUploaded(true);
    }
  };

  const handleConfirmOrder = async () => {
    if (!slipUploaded) {
      alert('กรุณาอัปโหลดสลิปโอนเงินก่อนยืนยันคำสั่งซื้อ');
      return;
    }
    
    setIsProcessing(true);
    
    // Calculate total carbon saved (approximate from strings)
    let totalCarbon = 0;
    cartItems.forEach(item => {
      const match = item.carbonSaved.match(/[\d.]+/);
      if (match) totalCarbon += parseFloat(match[0]);
    });
    const carbonStr = `${totalCarbon.toFixed(1)} kg CO₂e`;

    const orderData = {
      userId: currentUser?.id,
      userName: currentUser?.name,
      total: cartTotal,
      itemsCount: cartItems.length,
      carbonSaved: carbonStr,
      itemSummary: cartItems.map(i => i.title).join(', '),
      items: cartItems.map(i => ({ id: i.id, title: i.title, price: i.price, image: i.image })),
      trackingNumber: null
    };

    // 1. Create order in LocalStorage
    createOrder(orderData);

    // 2. Mark items as Sold Out
    cartItems.forEach(item => {
      updateProductStatus(item.id, 'Sold Out');
    });

    // 3. Clear Cart
    clearCart();

    // 4. Redirect to Orders
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/orders');
    }, 1000);
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-3 bg-white rounded-2xl border border-earth-200/60 p-8 shadow-sm flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-earth-500 mb-4">ไม่มีสินค้าในตะกร้า</p>
            <button onClick={() => router.push('/')} className="bg-sage-600 text-white px-6 py-2 rounded-full">
              กลับไปเลือกสินค้า
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-earth-100 pb-5 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-earth-900">ชำระเงิน (Checkout)</h1>
                <p className="text-xs text-earth-500 mt-1">สแกน QR Code เพื่อชำระเงิน และแนบสลิปเพื่อยืนยันคำสั่งซื้อ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: QR Code & Upload */}
              <div className="space-y-6">
                <div className="border border-earth-200 rounded-2xl p-6 flex flex-col items-center bg-earth-50/30 border-dashed aspect-[4/5] justify-center text-center">
                  <div className="w-48 h-48 relative mb-4 bg-white p-2 rounded-xl shadow-sm border border-earth-100">
                    {/* Mock QR Code Image using Unsplash pattern or generic placeholder */}
                    <Image 
                      src="https://images.unsplash.com/photo-1614081692211-16d7904de22a?auto=format&fit=crop&q=80&w=400" 
                      alt="Payment QR Code" 
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-bold text-earth-800">แสกนเพื่อชำระเงิน</h3>
                  <p className="text-xs text-earth-500 mt-1 mb-6">ชื่อบัญชี: Re-Wear Collective Co., Ltd.</p>
                  
                  <div className="w-full relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadSlip} 
                      className="hidden" 
                      id="slip-upload"
                    />
                    <label 
                      htmlFor="slip-upload" 
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                        slipUploaded 
                          ? 'border-sage-500 bg-sage-50 text-sage-700' 
                          : 'border-earth-200 hover:border-sage-400 bg-white text-earth-600'
                      }`}
                    >
                      {slipUploaded ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-semibold">แนบสลิปสำเร็จ</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span className="text-sm font-semibold">อัปโหลดสลิปโอนเงิน</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-earth-800 mb-4 border-b border-earth-100 pb-2">สรุปคำสั่งซื้อ</h3>
                
                <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 mb-4 pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-20 relative bg-earth-100 rounded-lg overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-earth-800 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-earth-500">{item.size && `Size: ${item.size}`}</p>
                      </div>
                      <div className="font-semibold text-earth-900">${item.price}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-earth-200">
                  <div className="flex justify-between text-sm text-earth-600">
                    <span>ยอดรวมสินค้า (Subtotal)</span>
                    <span>${subTotal}.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-earth-600">
                    <span>ค่าจัดส่ง (Shipping)</span>
                    <span>${shipping}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-earth-900 pt-2">
                    <span>ยอดสุทธิ (Total)</span>
                    <span>${cartTotal}.00</span>
                  </div>

                  <button 
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    className={`w-full py-4 mt-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all ${
                      isProcessing ? 'bg-earth-400 cursor-wait' : 'bg-[#2D2D2A] hover:bg-[#1A1A18] hover-lift'
                    }`}
                  >
                    {isProcessing ? 'กำลังประมวลผล...' : 'ยืนยันคำสั่งซื้อ (Confirm Order)'}
                    {!isProcessing && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Secure Payments Pitch */}
            <div className="mt-8 border-t border-earth-100 pt-6 flex flex-col sm:flex-row items-center gap-4 text-earth-500">
              <ShieldCheck className="h-8 w-8 text-sage-600 flex-shrink-0" />
              <div className="text-center sm:text-left space-y-0.5">
                <h4 className="text-xs font-bold text-earth-700">การชำระเงินที่ปลอดภัยอย่างสมบูรณ์แบบ</h4>
                <p className="text-[10px] leading-normal">
                  ข้อมูลบัตรและธุรกรรมทั้งหมดได้รับการเข้ารหัสผ่านโปรโตคอลความปลอดภัย SSL/TLS ที่มีความปลอดภัยระดับสากล และไม่จัดเก็บข้อมูลสำคัญของท่านบนเซิร์ฟเวอร์
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
