'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { Ticket, Copy, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';

export default function MyCoupons() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(null);

  if (!currentUser) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  const coupons = currentUser.coupons || [];
  const activeCoupons = coupons.filter(c => c.status === 'active');
  const usedCoupons = coupons.filter(c => c.status === 'used');

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast('Coupon code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case 'discount': return <Ticket className="h-6 w-6 text-earth-600" />;
      case 'free_standard': return <Clock className="h-6 w-6 text-sage-600" />;
      case 'free_express': return <Clock className="h-6 w-6 text-orange-600" />;
      default: return <Ticket className="h-6 w-6 text-earth-600" />;
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
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-earth-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-earth-900">My Coupons</h2>
                <p className="text-sm text-earth-500 mt-1">Manage and use your redeemed rewards</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-sage-600 bg-sage-50 px-3 py-1.5 rounded-full">
                  {activeCoupons.length} Active Coupons
                </span>
              </div>
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-12 px-4 bg-earth-50/50 rounded-xl border border-dashed border-earth-200">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Ticket className="h-8 w-8 text-earth-300" />
                </div>
                <h3 className="text-lg font-bold text-earth-800 mb-2">No Coupons Yet</h3>
                <p className="text-earth-500 text-sm max-w-md mx-auto mb-6">
                  You haven't redeemed any rewards yet. Head over to the Eco-Impact page to start using your points!
                </p>
                <button 
                  onClick={() => router.push('/eco-impact')}
                  className="px-6 py-2 bg-sage-600 text-white rounded-full text-sm font-semibold hover:bg-sage-700 transition-colors"
                >
                  Go to Rewards
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active Coupons */}
                {activeCoupons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-earth-900 mb-4">Available for Checkout</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeCoupons.map(coupon => (
                        <div key={coupon.id} className="relative bg-white border border-earth-200 rounded-xl overflow-hidden flex shadow-sm hover:border-sage-400 transition-colors group">
                          {/* Left Decorative Edge */}
                          <div className="w-4 bg-sage-500 flex flex-col justify-between py-2 border-r border-earth-100">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-white -ml-1"></div>
                            ))}
                          </div>
                          
                          <div className="flex-1 p-5">
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-flex px-2 py-1 bg-sage-50 text-sage-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                {coupon.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-earth-400 font-medium">
                                Redeemed: {new Date(coupon.dateRedeemed).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h4 className="font-bold text-earth-900 text-base mb-4 leading-tight pr-4">
                              {coupon.title}
                            </h4>
                            
                            <div className="flex items-center gap-2 mt-auto">
                              <div className="flex-1 bg-earth-50 border border-earth-200 rounded-lg px-3 py-2 flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-earth-800 tracking-wider">
                                  {coupon.code}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(coupon.code)}
                                  className="text-earth-400 hover:text-sage-600 transition-colors p-1"
                                  title="Copy code"
                                >
                                  {copiedCode === coupon.code ? (
                                    <CheckCircle className="h-4 w-4 text-sage-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Used Coupons */}
                {usedCoupons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-earth-400 mb-4">Used & Expired</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {usedCoupons.map(coupon => (
                        <div key={coupon.id} className="relative bg-earth-50 border border-earth-200 rounded-xl overflow-hidden flex opacity-60">
                          <div className="w-4 bg-earth-300 flex flex-col justify-between py-2 border-r border-earth-200">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-white -ml-1"></div>
                            ))}
                          </div>
                          
                          <div className="flex-1 p-5">
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-flex px-2 py-1 bg-earth-200 text-earth-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                USED
                              </span>
                            </div>
                            <h4 className="font-bold text-earth-600 text-base mb-4 line-through">
                              {coupon.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-earth-100 border border-earth-200 rounded-lg px-3 py-2">
                                <span className="font-mono text-sm text-earth-500">
                                  {coupon.code}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
