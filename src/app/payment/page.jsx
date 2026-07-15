"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder, updateProductStatus } from '../../utils/localStorageHelper';
import { Check, ChevronRight, Gift, CreditCard, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cartItems, cartTotal, subTotal, shipping, shippingDiscount, clearCart } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(2); // 2 = Delivery, 3 = Payment
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Delivery Form State
  const [deliveryForm, setDeliveryForm] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    province: '',
    district: '',
    subDistrict: '',
    postcode: '',
    phone: '09234567890'
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    // Calculate total carbon saved
    let totalCarbon = 0;
    cartItems.forEach(item => {
      const match = item.carbonSaved?.match(/[\d.]+/);
      if (match) totalCarbon += parseFloat(match[0]);
    });
    const carbonStr = `${totalCarbon.toFixed(1)} kg CO₂e`;

    const orderData = {
      userId: currentUser?.id,
      userName: `${deliveryForm.firstName} ${deliveryForm.lastName}`.trim() || currentUser?.name || 'Guest',
      total: cartTotal,
      itemsCount: cartItems.length,
      carbonSaved: carbonStr,
      itemSummary: cartItems.map(i => i.title).join(', '),
      items: cartItems.map(i => ({ id: i.id, title: i.title, price: i.price, image: i.image })),
      trackingNumber: null,
      shippingAddress: `${deliveryForm.address1} ${deliveryForm.province} ${deliveryForm.postcode}`
    };

    createOrder(orderData);
    cartItems.forEach(item => updateProductStatus(item.id, 'Sold Out'));
    clearCart();

    setTimeout(() => {
      setIsProcessing(false);
      router.push('/orders');
    }, 1500);
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-[#8B8B88] mb-4">ไม่มีสินค้าในตะกร้า</p>
        <button onClick={() => router.push('/')} className="bg-[#2D2D2A] text-white px-6 py-2 rounded">
          กลับไปเลือกสินค้า
        </button>
      </div>
    );
  }

  const isFreeShipping = subTotal >= 500;

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper Navigation */}
        <div className="flex items-center justify-between border-b border-[#EAE5DB] pb-6 mb-8 text-sm">
          <div className="flex items-center gap-2 text-[#8B8B88] cursor-pointer" onClick={() => router.push('/')}>
            <span className="w-6 h-6 rounded-full border border-[#8B8B88] flex items-center justify-center text-xs">1</span>
            <span>กระเป๋า</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#EAE5DB]" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#2D2D2A] font-bold' : 'text-[#8B8B88]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#2D2D2A] text-white' : 'border border-[#8B8B88]'}`}>2</span>
            <span>การจัดส่ง</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#EAE5DB]" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#2D2D2A] font-bold' : 'text-[#8B8B88]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-[#2D2D2A] text-white' : 'border border-[#8B8B88]'}`}>3</span>
            <span>การชำระเงินและชำระยอด</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column (Forms) */}
          <div className="lg:col-span-2 space-y-8">
            
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Shipping Method */}
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">วิธีการจัดส่ง</h2>
                  <div className="flex items-center justify-between p-4 border border-[#2D2D2A] rounded bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-4 border-[#2D2D2A] bg-white"></div>
                      <span className="text-sm font-medium">Standard Delivery</span>
                    </div>
                    <span className="text-sm font-medium">THB 55.00</span>
                  </div>
                </div>

                {/* Shipping Address Form */}
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">จัดส่งไปที่</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">ประเทศ *</label>
                      <div className="relative">
                        <select className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm appearance-none focus:outline-none focus:border-[#C57B57]">
                          <option>เมืองไทย</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-[#8B8B88] pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#8B8B88] mb-1">ชื่อ *</label>
                        <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.firstName} onChange={e => setDeliveryForm({...deliveryForm, firstName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8B8B88] mb-1">นามสกุล *</label>
                        <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.lastName} onChange={e => setDeliveryForm({...deliveryForm, lastName: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">ที่อยู่บรรทัด 1 *</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.address1} onChange={e => setDeliveryForm({...deliveryForm, address1: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">ที่อยู่บรรทัด 2</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.address2} onChange={e => setDeliveryForm({...deliveryForm, address2: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">จังหวัด *</label>
                        <select className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm appearance-none focus:outline-none focus:border-[#C57B57]">
                          <option>เลือกจังหวัด</option>
                          <option>กรุงเทพมหานคร</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-[26px] w-4 h-4 text-[#8B8B88] pointer-events-none" />
                      </div>
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">เขต/อำเภอ *</label>
                        <select className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm appearance-none focus:outline-none focus:border-[#C57B57]">
                          <option>เลือกเขต</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-[26px] w-4 h-4 text-[#8B8B88] pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">Sub District *</label>
                        <select className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm appearance-none focus:outline-none focus:border-[#C57B57]">
                          <option>เลือกแขวง</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-[26px] w-4 h-4 text-[#8B8B88] pointer-events-none" />
                      </div>
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">รหัสไปรษณีย์ *</label>
                        <select className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm appearance-none focus:outline-none focus:border-[#C57B57]">
                          <option>เลือกรหัสไปรษณีย์</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-[26px] w-4 h-4 text-[#8B8B88] pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">เบอร์โทรศัพท์ *</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.phone} onChange={e => setDeliveryForm({...deliveryForm, phone: e.target.value})} placeholder="ตัวอย่าง: 09234567890" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setStep(3)}
                    className="bg-[#EFDBDF] hover:bg-[#E5C9CE] text-[#8B5A65] font-bold px-8 py-3 rounded text-sm transition-colors"
                  >
                    ต่อไป: การชำระเงิน
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Delivery Summary */}
                <div className="flex justify-between items-start border-b border-[#EAE5DB] pb-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#2D2D2A] mb-2">การจัดส่ง</h3>
                    <p className="text-xs text-[#8B8B88] max-w-sm leading-relaxed">
                      {deliveryForm.firstName} {deliveryForm.lastName} <br/>
                      {deliveryForm.address1} {deliveryForm.address2} <br/>
                      {deliveryForm.phone}
                    </p>
                    <p className="text-xs font-bold text-[#2D2D2A] mt-2">วิธีการจัดส่ง: Standard Delivery</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs font-bold text-[#C57B57] flex items-center gap-1 hover:underline">
                    แก้ไข
                  </button>
                </div>

                {/* Billing Address */}
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">เก็บเงินไปที่</h2>
                  <div className="p-4 border border-[#EAE5DB] rounded bg-white flex justify-between items-center text-xs text-[#8B8B88]">
                    <span>ที่อยู่เดียวกับการจัดส่ง</span>
                    <button className="text-[#2D2D2A] font-bold hover:underline">แก้ไข &gt;</button>
                  </div>
                  <button className="mt-4 border border-[#2D2D2A] text-[#2D2D2A] text-xs font-bold px-4 py-2 rounded hover:bg-[#2D2D2A] hover:text-white transition-colors">
                    เพิ่มที่อยู่ใหม่สำหรับการเรียกเก็บเงิน
                  </button>
                </div>

                {/* Contact Info */}
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">ข้อมูลติดต่อ</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">อีเมล *</label>
                      <input type="email" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">เบอร์โทรศัพท์ *</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.phone} readOnly />
                    </div>
                  </div>
                </div>

                {/* Tax Info */}
                <div className="flex items-center justify-between border-t border-[#EAE5DB] pt-6">
                  <span className="text-xs font-bold text-[#2D2D2A]">Tax Information</span>
                  <input type="text" placeholder="Tax ID" className="w-2/3 p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" />
                </div>

                {/* Gift Card */}
                <div className="flex items-center justify-between border-t border-[#EAE5DB] pt-6">
                  <span className="text-xs font-bold text-[#2D2D2A]">Gift Card</span>
                  <button className="text-[#C57B57] text-xs font-bold hover:underline">ใช้บัตรของขวัญ +</button>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-[#EAE5DB] pt-6">
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">เลือกวิธีการชำระเงิน</h2>
                  <div className="flex items-center gap-4 text-[#8B8B88]">
                    <div className="w-4 h-4 rounded-full border border-[#2D2D2A] bg-[#2D2D2A] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-8 h-6" />
                      <span className="text-xs font-bold">VISA / Mastercard / 2c2p</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button 
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    className="bg-[#EFDBDF] hover:bg-[#E5C9CE] text-[#8B5A65] font-bold px-8 py-3 rounded text-sm transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? 'กำลังประมวลผล...' : 'ต่อไป: สั่งซื้อสินค้า'}
                  </button>
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column (Order Summary Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded border border-[#EAE5DB] p-6 sticky top-24">
              
              {isFreeShipping && (
                <div className="bg-[#C57B57] text-white p-3 rounded mb-6 flex items-center gap-3 shadow-sm">
                  <Gift className="w-5 h-5" />
                  <span className="text-xs font-bold tracking-wide">Your order is qualified for Free Shipping 🎉</span>
                </div>
              )}

              <h3 className="text-sm font-bold text-[#2D2D2A] mb-4 border-b border-[#EAE5DB] pb-2">สรุปคำสั่งซื้อ</h3>
              
              <div className="space-y-2 text-xs text-[#8B8B88] mb-6">
                <div className="flex justify-between">
                  <span>ยอดรวม<br/><span className="text-[10px]">(รวมภาษีทั้งหมด)</span></span>
                  <span className="font-medium text-[#2D2D2A]">THB {subTotal}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>การจัดส่ง</span>
                  <span className="font-medium text-[#2D2D2A]">THB {shipping}.00</span>
                </div>
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-[#C57B57]">
                    <span>ส่วนลดค่าส่ง</span>
                    <span className="font-bold">-THB {shippingDiscount}.00</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#EAE5DB] font-bold text-sm text-[#2D2D2A]">
                  <span>รวมยอดที่ต้องชำระ</span>
                  <span>THB {cartTotal}.00</span>
                </div>
              </div>

              {/* Promo Code section */}
              <div className="border-t border-[#EAE5DB] pt-4 mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#2D2D2A] cursor-pointer hover:text-[#C57B57]">
                  <span>เพิ่มโค้ดส่วนลด</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="mt-3 flex gap-2">
                  <input type="text" placeholder="โค้ดโปรโมชั่น" className="w-full p-2 bg-[#FAF6F0] border border-[#EAE5DB] rounded text-xs focus:outline-none" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                  <button className="bg-[#2D2D2A] text-white px-4 py-2 rounded text-xs font-bold">ส่ง</button>
                </div>
              </div>

              {/* Free Shipping Note */}
              <div className="border-t border-[#EAE5DB] pt-4 mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#2D2D2A]">
                  <span>Free Shipping <span className="text-[#C57B57]">-THB 55.00</span></span>
                </div>
              </div>

              <div className="border-t border-[#EAE5DB] pt-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#2D2D2A] cursor-pointer hover:text-[#C57B57]">
                  <span>ดูกระเป๋าช้อปปิ้ง ({cartItems.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
