"use client";

import React from 'react';
import Image from 'next/image';
import { X, Trash2, ArrowRight, Leaf, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, cartTotal, subTotal, shipping } = useCart();
  const router = useRouter();

  const getCartEcoImpact = () => {
    let totalCO2 = 0;
    cartItems.forEach(item => {
      const catUpper = (item.category || '').toUpperCase();
      if (catUpper.includes('DENIM') || catUpper.includes('JEAN') || catUpper.includes('BOTTOM')) {
        totalCO2 += 15;
      } else if (catUpper.includes('JACKET') || catUpper.includes('HEAVYWEAR') || catUpper.includes('OUTERWEAR')) {
        totalCO2 += 20;
      } else {
        totalCO2 += 5;
      }
    });
    const treeEquivalent = (totalCO2 / 22).toFixed(2);
    return { totalCO2, treeEquivalent };
  };

  const ecoImpact = getCartEcoImpact();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#2D2D2A]/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF8F5] shadow-2xl z-[70] flex flex-col font-sans border-l border-[#F2E9DC]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#F2E9DC]">
              <h2 className="font-serif text-2xl font-bold text-[#2D2D2A]">
                Your Archive <span className="text-[#8B8B88] text-lg font-sans ml-2">({cartItems.length})</span>
              </h2>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-[#8B8B88] hover:text-[#2D2D2A] transition-colors rounded-full hover:bg-[#F2E9DC]/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#EAE5DB]/40 flex items-center justify-center text-[#8B8B88]">
                    <X className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D2A]">Your cart is empty.</p>
                    <p className="text-xs text-[#8B8B88] mt-1">Discover one-of-a-kind vintage pieces.</p>
                  </div>
                  <button 
                    onClick={closeCart}
                    className="text-[10px] font-bold uppercase tracking-widest border-b border-[#2D2D2A] pb-0.5 hover:text-[#5F6B4E] hover:border-[#5F6B4E] transition-colors mt-4"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link href={`/product/${item.id}`} onClick={closeCart} className="relative w-24 h-32 shrink-0 bg-[#EAE5DB]/40 rounded-xl overflow-hidden block">
                      <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover mix-blend-multiply" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/product/${item.id}`} onClick={closeCart}>
                            <h3 className="font-semibold text-sm text-[#2D2D2A] line-clamp-2 hover:text-[#5F6B4E] transition-colors">{item.title}</h3>
                          </Link>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 -mt-1 -mr-1 text-[#8B8B88] hover:text-[#C57B57] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#8B8B88] mt-1">Measurements: {item.measurements}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold px-2 py-1 bg-[#F2E9DC] text-[#2D2D2A] rounded">Qty: 1</span>
                        <div className="flex flex-col text-right">
                          {item.salePrice > 0 ? (
                            <>
                              <span className="font-serif font-bold text-base text-red-600">THB {item.salePrice}</span>
                              <span className="text-[10px] line-through text-[#8B8B88]">THB {item.price}</span>
                            </>
                          ) : (
                            <span className="font-serif font-bold text-base text-[#8B6B57]">THB {item.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-[#F2E9DC] bg-white">
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-[#8B8B88]">
                    <span>Subtotal</span>
                    <span>THB {subTotal}.00</span>
                  </div>
                  <div className="flex justify-between text-primary relative group cursor-help">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Leaf className="h-3.5 w-3.5 fill-current" /> Carbon-Neutral Shipping
                      <Info className="h-3.5 w-3.5 text-[#8B8B88]" />
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#2D2D2A] text-white text-xs rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 font-sans pointer-events-none">
                        <p className="mb-2">เราชดเชยคาร์บอน จากการจัดส่งทุกออเดอร์ เพื่อให้การส่งมอบเสื้อผ้าไม่สร้างผลกระทบต่อสิ่งแวดล้อม</p>
                        {cartItems.length > 0 && (
                          <div className="bg-[#4A543C] p-2 rounded text-[10px] leading-relaxed">
                            <span className="font-bold text-[#EAE5DB]">Eco-Impact รวมของออเดอร์นี้:</span><br/>
                            ลดคาร์บอนไปแล้ว {ecoImpact.totalCO2} kg CO₂e <br/>
                            (เทียบเท่าการปลูกต้นไม้ {ecoImpact.treeEquivalent} ต้น! 🌳)
                          </div>
                        )}
                      </div>
                    </span>
                    <span className="font-medium text-[#8B8B88]">{shipping}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#2D2D2A] text-lg pt-3 border-t border-[#F2E9DC]/60">
                    <span>Total</span>
                    <span>THB {cartTotal}.00</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    closeCart();
                    router.push('/payment');
                  }}
                  className="w-full py-4 rounded-xl bg-[#2D2D2A] hover:bg-[#1A1A18] text-white text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-[9px] text-center text-[#8B8B88] mt-4 font-medium uppercase tracking-wider">
                  Secure Encrypted Payment
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

