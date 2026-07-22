"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder, processOrderInventory } from '../../utils/localStorageHelper';
import { Check, ChevronRight, Gift, CreditCard, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import MinimalDropdown from '../../components/ui/MinimalDropdown';

export default function CheckoutPage() {
  const { cartItems, cartTotal, subTotal, shipping, shippingDiscount, clearCart, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(2); // 2 = Delivery, 3 = Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  
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

  const [addressData, setAddressData] = React.useState([]);

  React.useEffect(() => {
    fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database.json')
      .then(res => res.json())
      .then(data => setAddressData(data))
      .catch(err => console.error(err));
  }, []);

  const provinces = React.useMemo(() => {
    const unique = new Set(addressData.map(item => item.province));
    return Array.from(unique).sort();
  }, [addressData]);

  const amphoes = React.useMemo(() => {
    if (!deliveryForm.province) return [];
    const unique = new Set(addressData.filter(item => item.province === deliveryForm.province).map(item => item.amphoe));
    return Array.from(unique).sort();
  }, [addressData, deliveryForm.province]);

  const tambons = React.useMemo(() => {
    if (!deliveryForm.district) return [];
    const unique = new Set(addressData.filter(item => item.province === deliveryForm.province && item.amphoe === deliveryForm.district).map(item => item.district));
    return Array.from(unique).sort();
  }, [addressData, deliveryForm.province, deliveryForm.district]);

  const zipcodes = React.useMemo(() => {
    if (!deliveryForm.subDistrict) return [];
    const unique = new Set(
      addressData
        .filter(item => 
          item.province === deliveryForm.province && 
          item.amphoe === deliveryForm.district && 
          item.district === deliveryForm.subDistrict
        )
        .map(item => item.zipcode)
    );
    return Array.from(unique).sort();
  }, [addressData, deliveryForm.province, deliveryForm.district, deliveryForm.subDistrict]);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [myCouponsList, setMyCouponsList] = useState([]);
  const [promoMethod, setPromoMethod] = useState('code');

  React.useEffect(() => {
    if (showCouponModal) {
      const stored = JSON.parse(localStorage.getItem('my_coupons')) || [];
      setMyCouponsList(stored.filter(c => !c.used && c.status !== 'Used'));
    }
  }, [showCouponModal]);

  const handleApplyPromo = (overrideCode) => {
    const codeToApply = typeof overrideCode === 'string' ? overrideCode.trim() : promoCode.trim();
    setPromoError('');
    setPromoSuccess('');
    if (!codeToApply) return;
    
    if (typeof overrideCode === 'string') {
      setPromoCode(codeToApply);
      setShowCouponModal(false);
    }

    const promos = JSON.parse(localStorage.getItem('promotions')) || [];
    const myCoupons = JSON.parse(localStorage.getItem('my_coupons')) || [];
    
    let promo = promos.find(p => p.code === codeToApply.toUpperCase());
    if (!promo) {
      const myPromo = myCoupons.find(p => p.code === codeToApply.toUpperCase());
      if (myPromo) {
        promo = {
          ...myPromo,
          status: myPromo.used ? 'Used' : 'Active',
          usageLimit: 1,
          type: myPromo.discountType,
          value: myPromo.discountValue
        };
      }
    }

    if (!promo) {
      setPromoError('Invalid discount code.');
      return;
    }
    if (promo.status !== 'Active') {
      setPromoError('This code is no longer active.');
      return;
    }
    if (promo.used >= promo.usageLimit) {
      setPromoError('This code has reached its usage limit.');
      return;
    }
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      setPromoError('This code has expired.');
      return;
    }

    setAppliedPromo(promo);
    setPromoSuccess(`Applied: ${promo.code}`);
    setPromoCode('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

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
      customer: `${deliveryForm.firstName} ${deliveryForm.lastName}`.trim() || currentUser?.name || 'Guest',
      email: currentUser?.email || 'guest@example.com',
      phone: deliveryForm.phone || '+66 81 234 5678',
      address: `${deliveryForm.address1} ${deliveryForm.address2 ? deliveryForm.address2 + ' ' : ''}${deliveryForm.subDistrict}, ${deliveryForm.district}, ${deliveryForm.province} ${deliveryForm.postcode}`,
      total: finalTotal, 
      subTotal: subTotal,
      shipping: shipping,
      discount: discountAmount,
      promoCode: appliedPromo?.code || null,
      itemsCount: cartItems.length,
      carbonSaved: carbonStr,
      itemSummary: cartItems.map(i => i.title || i.name).join(', '),
      items: cartItems.map(i => ({ 
        id: i.id, 
        name: i.title || i.name, 
        detail: i.size ? `Size: ${i.size}` : i.brandCategory || 'Unique Item',
        price: i.price, 
        image: i.image || i.hoverImage 
      })),
      trackingNumber: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', // Default avatar
      slipImage: null
    };

    createOrder(orderData);
    processOrderInventory(cartItems);
    
    // Increment promo usage if applied
    if (appliedPromo) {
      const promos = JSON.parse(localStorage.getItem('promotions')) || [];
      const updatedPromos = promos.map(p => 
        p.id === appliedPromo.id ? { ...p, used: p.used + 1 } : p
      );
      localStorage.setItem('promotions', JSON.stringify(updatedPromos));
    }
    
    clearCart();
    setOrderComplete(true);

    setTimeout(() => {
      setIsProcessing(false);
      router.push('/orders');
    }, 2500);
  };

  const [orderComplete, setOrderComplete] = useState(false);

  if (cartItems.length === 0 && !isProcessing && !orderComplete) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-[#8B8B88] mb-4">ไม่มีสินค้าในตะกร้า</p>
        <button onClick={() => router.push('/')} className="bg-[#2D2D2A] text-white px-6 py-2 rounded">
          กลับไปเลือกสินค้า
        </button>
      </div>
    );
  }

  const baseShippingFee = shippingMethod === 'express' ? 80 : 55;
  const isFreeShipping = subTotal >= 500 || (appliedPromo && appliedPromo.type === 'shipping');
  let finalShipping = isFreeShipping ? 0 : baseShippingFee;
  let finalShippingDiscount = isFreeShipping ? baseShippingFee : 0;
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = Math.floor(subTotal * (appliedPromo.value / 100));
    } else if (appliedPromo.type === 'fixed') {
      discountAmount = appliedPromo.value;
    }
  }
  
  // ensure total doesn't go below 0
  const finalTotal = Math.max(0, subTotal + finalShipping - discountAmount);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper Navigation */}
        <div className="flex items-center justify-between border-b border-[#EAE5DB] pb-6 mb-8 text-sm">
          <div className="flex items-center gap-2 text-[#8B8B88] cursor-pointer hover:text-[#2D2D2A]" onClick={() => { router.push('/'); setTimeout(toggleCart, 100); }}>
            <span className="w-6 h-6 rounded-full border border-[#8B8B88] flex items-center justify-center text-xs">1</span>
            <span>กระเป๋า</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#EAE5DB]" />
          <div 
            className={`flex items-center gap-2 ${step >= 2 ? 'text-[#2D2D2A] font-bold cursor-pointer hover:opacity-80' : 'text-[#8B8B88]'}`}
            onClick={() => step === 3 && setStep(2)}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#2D2D2A] text-white' : 'border border-[#8B8B88]'}`}>2</span>
            <span>การจัดส่ง</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#EAE5DB]" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#2D2D2A] font-bold' : 'text-[#8B8B88]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-[#2D2D2A] text-white' : 'border border-[#8B8B88]'}`}>3</span>
            <span>การชำระเงิน</span>
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
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border rounded bg-white cursor-pointer transition-colors hover:border-[#2D2D2A] group" style={{ borderColor: shippingMethod === 'standard' ? '#2D2D2A' : '#EAE5DB' }}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" className="hidden" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                        <div className={`w-4 h-4 rounded-full border-4 flex items-center justify-center transition-colors ${shippingMethod === 'standard' ? 'border-[#2D2D2A] bg-white' : 'border-[#EAE5DB] group-hover:border-[#2D2D2A]'}`}></div>
                        <span className="text-sm font-medium">Standard Delivery</span>
                      </div>
                      <span className="text-sm font-medium">THB 55.00</span>
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded bg-white cursor-pointer transition-colors hover:border-[#2D2D2A] group" style={{ borderColor: shippingMethod === 'express' ? '#2D2D2A' : '#EAE5DB' }}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" className="hidden" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                        <div className={`w-4 h-4 rounded-full border-4 flex items-center justify-center transition-colors ${shippingMethod === 'express' ? 'border-[#2D2D2A] bg-white' : 'border-[#EAE5DB] group-hover:border-[#2D2D2A]'}`}></div>
                        <span className="text-sm font-medium">Express Delivery (1-2 days)</span>
                      </div>
                      <span className="text-sm font-medium">THB 80.00</span>
                    </label>
                  </div>
                </div>

                {/* Shipping Address Form */}
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">จัดส่งไปที่</h2>
                  <div className="space-y-4">
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
                      <label className="block text-xs text-[#8B8B88] mb-1">ที่อยู่ (บ้านเลขที่ / ซอย / ถนน) *</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.address1} onChange={e => setDeliveryForm({...deliveryForm, address1: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">จังหวัด *</label>
                        <MinimalDropdown 
                          value={deliveryForm.province} 
                          onChange={val => setDeliveryForm({...deliveryForm, province: val, district: '', subDistrict: '', postcode: ''})} 
                          options={provinces} 
                          placeholder="เลือกจังหวัด" 
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">เขต/อำเภอ *</label>
                        <MinimalDropdown 
                          value={deliveryForm.district} 
                          onChange={val => setDeliveryForm({...deliveryForm, district: val, subDistrict: '', postcode: ''})} 
                          options={amphoes} 
                          placeholder="เลือกเขต" 
                          disabled={!deliveryForm.province}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">แขวง/ตำบล *</label>
                        <MinimalDropdown 
                          value={deliveryForm.subDistrict} 
                          onChange={val => setDeliveryForm({...deliveryForm, subDistrict: val, postcode: ''})} 
                          options={tambons} 
                          placeholder="เลือกแขวง" 
                          disabled={!deliveryForm.district}
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs text-[#8B8B88] mb-1">รหัสไปรษณีย์ *</label>
                        <MinimalDropdown 
                          value={deliveryForm.postcode} 
                          onChange={val => setDeliveryForm({...deliveryForm, postcode: val})} 
                          options={zipcodes} 
                          placeholder="เลือกรหัสไปรษณีย์" 
                          disabled={!deliveryForm.subDistrict}
                        />
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
                      {deliveryForm.address1} <br/>
                      {deliveryForm.phone}
                    </p>
                    <p className="text-xs font-bold text-[#2D2D2A] mt-2">วิธีการจัดส่ง: {shippingMethod === 'standard' ? 'Standard Delivery' : 'Express Delivery'}</p>
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
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 text-[#8B8B88] cursor-pointer group">
                      <input type="radio" name="paymentType" className="hidden" checked={paymentType === 'card'} onChange={() => setPaymentType('card')} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentType === 'card' ? 'border-[#2D2D2A] bg-[#2D2D2A]' : 'border-[#D1D1D1] group-hover:border-[#2D2D2A]'}`}>
                        {paymentType === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <div className={`flex items-center gap-2 ${paymentType === 'card' ? 'text-[#2D2D2A]' : ''}`}>
                        <CreditCard className="w-8 h-6" />
                        <span className="text-xs font-bold">VISA / Mastercard / 2c2p</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 text-[#8B8B88] cursor-pointer group">
                      <input type="radio" name="paymentType" className="hidden" checked={paymentType === 'cod'} onChange={() => setPaymentType('cod')} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentType === 'cod' ? 'border-[#2D2D2A] bg-[#2D2D2A]' : 'border-[#D1D1D1] group-hover:border-[#2D2D2A]'}`}>
                        {paymentType === 'cod' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <div className={`flex items-center gap-2 ${paymentType === 'cod' ? 'text-[#2D2D2A]' : ''}`}>
                        <div className="w-8 h-6 flex items-center justify-center border border-current rounded text-[10px] font-bold">COD</div>
                        <span className="text-xs font-bold">เก็บเงินปลายทาง (Cash on Delivery)</span>
                      </div>
                    </label>
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
                  <span className="font-medium text-[#2D2D2A]">THB {finalShipping}.00</span>
                </div>
                {finalShippingDiscount > 0 && (
                  <div className="flex justify-between text-[#C57B57]">
                    <span>ส่วนลดค่าส่ง</span>
                    <span className="font-bold">-THB {finalShippingDiscount}.00</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#C57B57]">
                    <span>ส่วนลด (Promo)</span>
                    <span className="font-bold">-THB {discountAmount}.00</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#EAE5DB] font-bold text-sm text-[#2D2D2A]">
                  <span>รวมยอดที่ต้องชำระ</span>
                  <span>THB {finalTotal}.00</span>
                </div>
              </div>

              {/* Promo Code section */}
              <div className="border-t border-[#EAE5DB] pt-4 mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#2D2D2A]">
                  <span>เพิ่มโค้ดส่วนลด</span>
                </div>
                
                {appliedPromo ? (
                  <div className="mt-3 p-3 bg-[#DEF7EC] border border-[#03543F]/20 rounded flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-[#03543F]">{appliedPromo.code}</span>
                      <p className="text-[10px] text-[#03543F]/70">
                        {appliedPromo.type === 'percentage' && `${appliedPromo.value}% Off`}
                        {appliedPromo.type === 'fixed' && `THB ${appliedPromo.value} Off`}
                        {appliedPromo.type === 'shipping' && `Free Shipping`}
                      </p>
                    </div>
                    <button onClick={handleRemovePromo} className="text-[#03543F] hover:text-[#023B2C] text-xs underline">
                      นำออก
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="promoMethod" 
                          checked={promoMethod === 'code'} 
                          onChange={() => setPromoMethod('code')} 
                          className="appearance-none w-3 h-3 rounded-full border border-[#D1D1D1] checked:border-[4px] checked:border-[#2D2D2A] cursor-pointer transition-all"
                        />
                        <span className={`text-[11px] font-bold ${promoMethod === 'code' ? 'text-[#2D2D2A]' : 'text-[#8B8B88] group-hover:text-[#5C5C5A]'}`}>กรอกโค้ดส่วนลด</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="promoMethod" 
                          checked={promoMethod === 'coupon'} 
                          onChange={() => setPromoMethod('coupon')} 
                          className="appearance-none w-3 h-3 rounded-full border border-[#D1D1D1] checked:border-[4px] checked:border-[#2D2D2A] cursor-pointer transition-all"
                        />
                        <span className={`text-[11px] font-bold ${promoMethod === 'coupon' ? 'text-[#2D2D2A]' : 'text-[#8B8B88] group-hover:text-[#5C5C5A]'}`}>เลือกคูปองของฉัน</span>
                      </label>
                    </div>

                    {promoMethod === 'code' ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="โค้ดโปรโมชั่น" 
                          className="w-full p-2 bg-[#FAF6F0] border border-[#EAE5DB] rounded text-xs focus:outline-none uppercase" 
                          value={promoCode} 
                          onChange={e => setPromoCode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <button onClick={handleApplyPromo} className="bg-[#2D2D2A] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#4A4A4A]">ส่ง</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowCouponModal(true)}
                        className="w-full py-2 border border-[#C57B57] text-[#C57B57] rounded text-xs font-bold hover:bg-[#C57B57] hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        คลิกเพื่อเลือกคูปองส่วนลดของฉัน
                      </button>
                    )}
                    {promoError && <p className="text-red-500 text-[10px] mt-1">{promoError}</p>}
                  </div>
                )}
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

      {/* Order Success Overlay */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF6F0]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-2xl flex flex-col items-center max-w-sm w-full mx-4 shadow-xl border border-[#EAE5DB] animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-[#DEF7EC] rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-[#03543F]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2D2D2A] mb-2 text-center">สั่งซื้อสำเร็จ!</h2>
            <p className="text-[#8B8B88] text-center text-sm mb-8">ขอบคุณที่ช้อปกับ Re-wear คำสั่งซื้อของคุณได้รับการยืนยันแล้ว</p>
            <div className="w-full h-1.5 bg-[#FAF6F0] rounded-full overflow-hidden">
              <div className="h-full bg-[#2D2D2A] rounded-full animate-pulse transition-all duration-[2500ms] ease-linear" style={{ width: '100%' }}></div>
            </div>
            <p className="text-[10px] text-[#8B8B88] mt-4">กำลังพาคุณไปยังหน้าคำสั่งซื้อ...</p>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 text-[#8B8B88] hover:text-[#2D2D2A]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-bold text-[#2D2D2A] mb-4">คูปองส่วนลดของฉัน</h3>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#EAE5DB]">
              {myCouponsList.length > 0 ? (
                myCouponsList.map((coupon, idx) => (
                  <div key={idx} className="border border-[#EAE5DB] rounded-md p-4 flex justify-between items-center bg-[#F9F8F6]">
                    <div>
                      <div className="font-bold text-[#2D2D2A] text-sm">{coupon.code}</div>
                      <div className="text-xs text-[#5C5C5A] mt-1 font-medium">
                        {coupon.discountType === 'percentage' && `ลด ${coupon.discountValue}%`}
                        {coupon.discountType === 'fixed' && `ส่วนลด THB ${coupon.discountValue}`}
                        {coupon.discountType === 'shipping' && `ส่งฟรี (${coupon.discountValue === 'express' ? 'Express' : 'Standard'})`}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApplyPromo(coupon.code)}
                      className="px-3 py-1.5 bg-[#2D2D2A] text-white text-[11px] font-bold rounded hover:bg-[#4A4A4A] transition-colors"
                    >
                      ใช้คูปอง
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8B8B88] text-center py-8">คุณยังไม่มีคูปองส่วนลดในขณะนี้</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
