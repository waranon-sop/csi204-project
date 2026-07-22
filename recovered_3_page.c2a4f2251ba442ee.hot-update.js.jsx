"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder, processOrderInventory } from '../../utils/localStorageHelper';
import { Check, ChevronRight, Gift, CreditCard, ChevronDown, MapPin } from 'lucide-react';
import Image from 'next/image';
import MinimalDropdown from '../../components/ui/MinimalDropdown';

export default function CheckoutPage() {
  const { cartItems, cartTotal, subTotal, shipping, shippingDiscount, clearCart } = useCart();
  const { currentUser, updateProfile } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(2); // 2 = Delivery, 3 = Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [showCartItems, setShowCartItems] = useState(false);
  const [slipImage, setSlipImage] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [requestTaxInvoice, setRequestTaxInvoice] = useState(false);
  const [taxForm, setTaxForm] = useState({
    type: 'individual',
    name: '',
    taxId: '',
    branch: 'สำนักงานใหญ่',
    address: ''
  });

  const handleCopyAddressToTax = () => {
    const fullAddress = `${deliveryForm.address1} ${deliveryForm.address2 ? deliveryForm.address2 + ' ' : ''}${deliveryForm.subDistrict}, ${deliveryForm.district}, ${deliveryForm.province} ${deliveryForm.postcode}`;
    setTaxForm(prev => ({ ...prev, address: fullAddress }));
  };

  const handleSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
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

  React.useEffect(() => {
    if (currentUser) {
      setDeliveryForm(prev => ({
        ...prev,
        firstName: currentUser.firstName || currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.lastName || currentUser.name?.split(' ').slice(1).join(' ') || '',
        address1: currentUser.address1 || currentUser.address || '',
        address2: currentUser.address2 || '',
        province: currentUser.province || '',
        district: currentUser.district || '',
        subDistrict: currentUser.subDistrict || '',
        postcode: currentUser.postcode || '',
        phone: currentUser.phone || '09234567890'
      }));
    }
  }, [currentUser]);

  const [addressData, setAddressData] = React.useState([]);

  React.useEffect(() => {
    fetch('/data/thailand_address.json')
      .then(res => res.json())
      .then(data => setAddressData(data))
      .catch(err => console.error("Error loading address data", err));
  }, []);

  const provinces = React.useMemo(() => {
    const unique = new Set(addressData.map(item => item.province));
    return Array.from(unique).sort();
  }, [addressData]);

  const amphoes = React.useMemo(() => {
    if (!deliveryForm.province) return [];
    const unique = new Set(
      addressData
        .filter(item => item.province === deliveryForm.province)
        .map(item => item.amphoe)
    );
    return Array.from(unique).sort();
  }, [addressData, deliveryForm.province]);

  const tambons = React.useMemo(() => {
    if (!deliveryForm.province || !deliveryForm.district) return [];
    const unique = new Set(
      addressData
        .filter(item => item.province === deliveryForm.province && item.amphoe === deliveryForm.district)
        .map(item => item.district)
    );
    return Array.from(unique).sort();
  }, [addressData, deliveryForm.province, deliveryForm.district]);

  const zipcodes = React.useMemo(() => {
    if (!deliveryForm.province || !deliveryForm.district || !deliveryForm.subDistrict) return [];
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

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoCode.trim()) return;

    const promos = JSON.parse(localStorage.getItem('promotions')) || [];
    const myCoupons = JSON.parse(localStorage.getItem('my_coupons')) || [];
    
    let promo = promos.find(p => p.code === promoCode.toUpperCase());
    if (!promo) {
      const myPromo = myCoupons.find(p => p.code === promoCode.toUpperCase());
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
      shipping: finalShipping,
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
      slipImage: slipImage,
      taxInfo: requestTaxInvoice ? taxForm : null
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

      // Also check my_coupons
      const myCoupons = JSON.parse(localStorage.getItem('my_coupons')) || [];
      const updatedMyCoupons = myCoupons.map(p => 
        p.code === appliedPromo.code ? { ...p, used: true } : p
      );
      localStorage.setItem('my_coupons', JSON.stringify(updatedMyCoupons));
    }
    
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

  let baseShippingFee = shippingMethod === 'express' ? 50 : 35;
  const isFreeShipping = (currentUser && currentUser.tier === 'Harvest') || 
                         (appliedPromo && appliedPromo.type === 'shipping' && appliedPromo.value === shippingMethod);
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
                  <div className="border border-[#EAE5DB] rounded bg-white divide-y divide-[#EAE5DB]">
                    <label className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'bg-[#F9F8F6]' : 'hover:bg-[#F9F8F6]'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shippingMethod" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="w-4 h-4 accent-[#2D2D2A]" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#2D2D2A]">Standard Delivery</span>
                          <span className="text-[11px] text-[#8B8B88] mt-0.5">Eco-friendly choice. Earn points for saving fuel!</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#2D2D2A]">{currentUser?.tier === 'Harvest' || (appliedPromo && appliedPromo.type === 'shipping' && appliedPromo.value === 'standard') ? 'THB 0.00' : 'THB 35.00'}</span>
                    </label>
                    <label className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${shippingMethod === 'express' ? 'bg-[#F9F8F6]' : 'hover:bg-[#F9F8F6]'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shippingMethod" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="w-4 h-4 accent-[#2D2D2A]" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#2D2D2A]">Express Delivery</span>
                          <span className="text-[11px] text-[#8B8B88] mt-0.5">Fast delivery within 1-2 business days</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#2D2D2A]">{currentUser?.tier === 'Harvest' || (appliedPromo && appliedPromo.type === 'shipping' && appliedPromo.value === 'express') ? 'THB 0.00' : 'THB 50.00'}</span>
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
                      <label className="block text-xs text-[#8B8B88] mb-1">ที่อยู่ *</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.address1} onChange={e => setDeliveryForm({...deliveryForm, address1: e.target.value})} placeholder="บ้านเลขที่ หมู่ ซอย ถนน" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#8B8B88] mb-1">จังหวัด *</label>
                        <MinimalDropdown
                          options={provinces}
                          value={deliveryForm.province}
                          onChange={(val) => setDeliveryForm({...deliveryForm, province: val, district: '', subDistrict: '', postcode: ''})}
                          placeholder="เลือกจังหวัด"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8B8B88] mb-1">เขต/อำเภอ *</label>
                        <MinimalDropdown
                          options={amphoes}
                          value={deliveryForm.district}
                          onChange={(val) => setDeliveryForm({...deliveryForm, district: val, subDistrict: '', postcode: ''})}
                          placeholder="เลือกเขต/อำเภอ"
                          disabled={!deliveryForm.province}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#8B8B88] mb-1">แขวง/ตำบล *</label>
                        <MinimalDropdown
                          options={tambons}
                          value={deliveryForm.subDistrict}
                          onChange={(val) => {
                            const matched = addressData.find(item => item.province === deliveryForm.province && item.amphoe === deliveryForm.district && item.district === val);
                            setDeliveryForm({...deliveryForm, subDistrict: val, postcode: matched ? matched.zipcode.toString() : ''});
                          }}
                          placeholder="เลือกแขวง/ตำบล"
                          disabled={!deliveryForm.district}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8B8B88] mb-1">รหัสไปรษณีย์ *</label>
                        <MinimalDropdown
                          options={zipcodes}
                          value={deliveryForm.postcode}
                          onChange={(val) => setDeliveryForm({...deliveryForm, postcode: val})}
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

                {/* Save Address Checkbox */}
                {currentUser && (
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="saveAddress" 
                      className="w-4 h-4 accent-[#2D2D2A] rounded border-[#EAE5DB] cursor-pointer"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                    />
                    <label htmlFor="saveAddress" className="text-xs text-[#8B8B88] cursor-pointer select-none">
                      บันทึกที่อยู่นี้เป็นค่าเริ่มต้นในโปรไฟล์ของคุณ
                    </label>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => {
                      if (saveAddress && updateProfile) {
                        updateProfile({
                          firstName: deliveryForm.firstName,
                          lastName: deliveryForm.lastName,
                          address1: deliveryForm.address1,
                          address2: deliveryForm.address2,
                          province: deliveryForm.province,
                          district: deliveryForm.district,
                          subDistrict: deliveryForm.subDistrict,
                          postcode: deliveryForm.postcode,
                          phone: deliveryForm.phone,
                          address: `${deliveryForm.address1} ${deliveryForm.address2 ? deliveryForm.address2 + ' ' : ''}${deliveryForm.subDistrict}, ${deliveryForm.district}, ${deliveryForm.province} ${deliveryForm.postcode}`
                        });
                      }
                      setStep(3);
                    }}
                    disabled={!deliveryForm.firstName || !deliveryForm.lastName || !deliveryForm.address1 || !deliveryForm.province || !deliveryForm.district || !deliveryForm.subDistrict || !deliveryForm.postcode || !deliveryForm.phone}
                    className="bg-[#EFDBDF] hover:bg-[#E5C9CE] text-[#8B5A65] font-bold px-8 py-3 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ต่อไป: การชำระเงิน
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Delivery Summary */}
                <div className="bg-white p-6 rounded-lg border border-[#EAE5DB] shadow-sm relative mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-[#2D2D2A] mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C57B57]" /> การจัดส่ง
                      </h3>
                      <p className="text-xs text-[#8B8B88] max-w-sm leading-relaxed mt-1">
                        <span className="font-bold text-[#2D2D2A]">{deliveryForm.firstName} {deliveryForm.lastName}</span> <br/>
                        {deliveryForm.address1} {deliveryForm.address2} <br/>
                        {deliveryForm.subDistrict}, {deliveryForm.district} <br/>
                        {deliveryForm.province} {deliveryForm.postcode} <br/>
                        โทร: {deliveryForm.phone}
                      </p>
                      <div className="mt-4 bg-[#FAF6F0] rounded p-3 inline-block border border-[#EAE5DB]/50">
                        <p className="text-[10px] font-bold text-[#2D2D2A] mb-1">วิธีการจัดส่ง:</p>
                        <p className="text-xs text-[#8B8B88] capitalize">{shippingMethod} Delivery</p>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="text-xs font-bold text-[#C57B57] flex items-center gap-1 hover:underline">
                      แก้ไข
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">ข้อมูลติดต่อ</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">อีเมล *</label>
                      <input type="email" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={currentUser?.email || ''} readOnly={!!currentUser?.email} />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8B8B88] mb-1">เบอร์โทรศัพท์ *</label>
                      <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={deliveryForm.phone} readOnly />
                    </div>
                  </div>
                </div>

                {/* Tax Invoice */}
                <div className="border-t border-[#EAE5DB] pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input 
                      type="checkbox" 
                      id="requestTax" 
                      className="w-4 h-4 accent-[#2D2D2A] rounded border-[#EAE5DB] cursor-pointer"
                      checked={requestTaxInvoice}
                      onChange={(e) => setRequestTaxInvoice(e.target.checked)}
                    />
                    <label htmlFor="requestTax" className="text-sm font-bold text-[#2D2D2A] cursor-pointer select-none">
                      ต้องการรับใบกำกับภาษีเต็มรูปแบบ
                    </label>
                  </div>

                  {requestTaxInvoice && (
                    <div className="p-5 border border-[#EAE5DB] rounded-lg bg-[#F9F8F6] space-y-4 animate-in slide-in-from-top-2 duration-300">
                      
                      <div>
                        <label className="block text-xs font-bold text-[#2D2D2A] mb-2">ประเภทลูกค้า *</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="taxType" className="accent-[#2D2D2A]" checked={taxForm.type === 'individual'} onChange={() => setTaxForm({...taxForm, type: 'individual'})} />
                            <span className="text-xs text-[#2D2D2A]">บุคคลธรรมดา</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="taxType" className="accent-[#2D2D2A]" checked={taxForm.type === 'company'} onChange={() => setTaxForm({...taxForm, type: 'company'})} />
                            <span className="text-xs text-[#2D2D2A]">นิติบุคคล (บริษัท)</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#8B8B88] mb-1">{taxForm.type === 'company' ? 'ชื่อบริษัท' : 'ชื่อ-นามสกุล'} *</label>
                          <input type="text" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={taxForm.name} onChange={e => setTaxForm({...taxForm, name: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs text-[#8B8B88] mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก) *</label>
                          <input type="text" maxLength={13} className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={taxForm.taxId} onChange={e => setTaxForm({...taxForm, taxId: e.target.value.replace(/[^0-9]/g, '')})} />
                        </div>
                      </div>

                      {taxForm.type === 'company' && (
                        <div>
                          <label className="block text-xs text-[#8B8B88] mb-1">สาขา *</label>
                          <input type="text" placeholder="เช่น สำนักงานใหญ่ หรือ 00001" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57]" value={taxForm.branch} onChange={e => setTaxForm({...taxForm, branch: e.target.value})} />
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-[#8B8B88]">ที่อยู่จดทะเบียน *</label>
                          <button onClick={handleCopyAddressToTax} className="text-[10px] font-bold text-[#C57B57] hover:underline">
                            + ใช้ที่อยู่เดียวกับการจัดส่ง
                          </button>
                        </div>
                        <textarea rows="2" className="w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm focus:outline-none focus:border-[#C57B57] resize-none" value={taxForm.address} onChange={e => setTaxForm({...taxForm, address: e.target.value})}></textarea>
                      </div>

                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="border-t border-[#EAE5DB] pt-6">
                  <h2 className="text-sm font-bold text-[#2D2D2A] mb-4">วิธีการชำระเงิน (สแกน QR Code)</h2>
                  
                  <div className="flex flex-col md:flex-row gap-6 p-6 border border-[#EAE5DB] rounded bg-white">
                    {/* QR Code and Bank Details */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 border-b md:border-b-0 md:border-r border-[#EAE5DB] pb-6 md:pb-0 md:pr-6">
                      <div className="w-48 h-48 relative bg-[#F9F8F6] border border-[#EAE5DB] rounded flex items-center justify-center overflow-hidden">
                        <Image src="/qr-code.jpg" alt="QR Code" fill className="object-contain p-2" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-[#2D2D2A]">ธนาคารไทยพาณิชย์ (SCB)</p>
                        <p className="text-xs text-[#8B8B88]">ชื่อบัญชี: บริษัท รีแวร์ จำกัด</p>
                        <p className="text-xs text-[#8B8B88] font-mono">เลขที่บัญชี: x-xxxx-xxxx631-6</p>
                      </div>
                    </div>

                    {/* Upload Slip */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xs font-bold text-[#2D2D2A] mb-3">อัปโหลดสลิปการโอนเงิน *</h3>
                      
                      {slipImage ? (
                        <div className="relative w-full max-w-[200px] aspect-[1/1.5] mx-auto">
                          <Image src={slipImage} alt="Payment Slip" fill className="object-cover rounded border border-[#EAE5DB]" />
                          <button 
                            onClick={() => setSlipImage(null)}
                            className="absolute -top-2 -right-2 bg-white text-[#2D2D2A] rounded-full p-1 shadow-md hover:text-[#C57B57]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#EAE5DB] rounded cursor-pointer hover:bg-[#F9F8F6] transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-6 h-6 mb-2 text-[#8B8B88]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-1 text-xs text-[#8B8B88]"><span className="font-semibold text-[#2D2D2A]">คลิกเพื่ออัปโหลด</span></p>
                            <p className="text-[10px] text-[#8B8B88]">PNG, JPG หรือ JPEG</p>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button 
                    onClick={handleConfirmOrder}
                    disabled={isProcessing || !slipImage}
                    className="bg-[#EFDBDF] hover:bg-[#E5C9CE] text-[#8B5A65] font-bold px-8 py-3 rounded text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {promoError && <p className="text-red-500 text-[10px] mt-1">{promoError}</p>}
                  </div>
                )}
              </div>

              {/* Free Shipping Note */}
              {finalShippingDiscount > 0 && (
                <div className="border-t border-[#EAE5DB] pt-4 mb-4">
                  <div className="flex justify-between items-center text-xs font-bold text-[#2D2D2A]">
                    <span>Free Shipping <span className="text-[#C57B57]">-THB {finalShippingDiscount}.00</span></span>
                  </div>
                </div>
              )}

              <div className="border-t border-[#EAE5DB] pt-4">
                <div 
                  className="flex justify-between items-center text-xs font-bold text-[#2D2D2A] cursor-pointer hover:text-[#C57B57]"
                  onClick={() => setShowCartItems(!showCartItems)}
                >
                  <span>ดูกระเป๋าช้อปปิ้ง ({cartItems.length})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCartItems ? 'rotate-180' : 'rotate-270'}`} style={{ transform: showCartItems ? 'rotate(180deg)' : 'rotate(270deg)' }} />
                </div>
                {showCartItems && (
                  <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#EAE5DB]">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-[#F9F8F6] rounded flex-shrink-0">
                          {/* Image component expects src to be valid. If no image, fallback to empty div */}
                          {(item.image || item.hoverImage) ? (
                            <Image src={item.image || item.hoverImage} alt={item.title || item.name || 'Product'} fill className="object-cover rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8B8B88]">No img</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <span className="text-xs font-bold text-[#2D2D2A] truncate">{item.title || item.name}</span>
                          <span className="text-[10px] text-[#8B8B88] truncate">{item.brandCategory || 'Unique Item'}</span>
                          <span className="text-xs font-bold text-[#2D2D2A] mt-1">THB {item.price}.00</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
