'use client';

import React from 'react';
import { Truck, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentInfo() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2D2D2A] mb-4">Payment Options</h1>
          <p className="text-[#8B8B88] text-lg max-w-2xl mx-auto">
            At Re-wear, we prioritize simplicity and security. We currently offer the following straightforward payment methods to ensure a smooth checkout experience.
          </p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Cash on Delivery */}
          <div className="bg-white rounded-2xl p-8 border border-[#EAE5DB] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-[#EAE5DB] opacity-50">
              <Truck className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-earth-100 text-earth-700 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D2D2A] mb-3">Cash on Delivery (COD)</h3>
              <p className="text-[#5C5C58] mb-6 leading-relaxed">
                Pay directly to our delivery partner when your Re-wear package arrives at your doorstep. Perfect for those who prefer physical transactions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-[#8B8B88]">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 mt-0.5 flex-shrink-0" />
                  <span>No hidden fees or extra charges.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#8B8B88]">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 mt-0.5 flex-shrink-0" />
                  <span>Inspect your package upon arrival.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-8 border border-[#EAE5DB] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-[#EAE5DB] opacity-50">
              <QrCode className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-sage-100 text-sage-700 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D2D2A] mb-3">PromptPay QR Code</h3>
              <p className="text-[#5C5C58] mb-6 leading-relaxed">
                Fast and secure digital payment. Simply scan the generated QR code at checkout using your mobile banking application.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-[#8B8B88]">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 mt-0.5 flex-shrink-0" />
                  <span>Instant payment verification.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#8B8B88]">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 mt-0.5 flex-shrink-0" />
                  <span>Supports all major Thai banking apps.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <div className="bg-sage-50 rounded-2xl p-6 border border-sage-100 flex items-start sm:items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 mx-auto sm:mx-0">
            <ShieldCheck className="w-6 h-6 text-sage-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-sage-800 mb-1">Coming Soon: Credit Cards & Bank Transfers</h4>
            <p className="text-xs text-sage-600">
              We are currently working on integrating full credit card processing and direct bank transfers. These features have been temporarily disabled to ensure the highest standard of security for our customers.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <Link href="/" className="inline-block bg-[#2D2D2A] hover:bg-black text-white px-8 py-3 rounded-full font-medium transition-colors">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
