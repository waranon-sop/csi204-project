"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Heart, Leaf, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useCurrentUser } from '../../context/UserContext';

export default function QuickViewModal({
  selectedProduct,
  setSelectedProduct,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart, cartItems } = useCart();
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  const isAdded = cartItems.some((item) => item.id === selectedProduct?.id);

  // Reset liked state when a new product is opened
  useEffect(() => {
    setIsLiked(false);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FCFBF7] rounded-[2.5rem] border border-[#F2E9DC] overflow-hidden shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute right-6 top-6 z-20 p-2 text-[#8B8B88] hover:text-[#2D2D2A] hover:bg-[#F2E9DC]/60 rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Images */}
          <div className="relative aspect-[4/5] bg-tertiary/40">
            <Image
              src={selectedProduct.hoverImage}
              alt={selectedProduct.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {selectedProduct.badge && (
              <span className="absolute top-6 left-6 text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-white/95 text-[#2D2D2A] border border-[#EAE5DB]/65">
                {selectedProduct.badge}
              </span>
            )}
          </div>

          {/* Right Column: Detail Form */}
          <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                  {selectedProduct.brandCategory.split(' • ')[0]}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#2D2D2A] mt-1">
                  {selectedProduct.title}
                </h2>
                <span className="block font-serif text-xl font-bold text-[#2D2D2A] mt-2">
                  ${selectedProduct.price}
                </span>
              </div>

              <p className="text-xs text-[#8B8B88] leading-relaxed font-light">
                {selectedProduct.description}
              </p>

              <hr className="border-[#F2E9DC]" />

              {/* Vintage Specific Details: Condition & Measurements */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 p-4 bg-[#FAF7F2] rounded-2xl border border-[#F2E9DC]/60">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#8B8B88] uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Condition
                  </span>
                  <p className="text-xs font-bold text-[#2D2D2A]">{selectedProduct.condition}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#8B8B88] uppercase tracking-widest flex items-center gap-1">
                    Tag Size
                  </span>
                  <p className="text-xs font-bold text-[#2D2D2A]">{selectedProduct.size}</p>
                </div>
                <div className="space-y-1 col-span-2 pt-2 border-t border-[#EAE5DB]/50">
                  <span className="text-[9px] font-bold text-[#8B8B88] uppercase tracking-widest flex items-center gap-1">
                    Measurements
                  </span>
                  <p className="text-xs font-medium text-[#2D2D2A]">{selectedProduct.measurements}</p>
                </div>
              </div>
            </div>

            {/* Eco Scorecard */}
            <div className="bg-[#FAF6F0] border border-[#F2E9DC] p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-primary flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 fill-current" />
                ECO-IMPACT SCORECARD
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1.5 text-center">
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-[#8B8B88] uppercase">CO₂ Offset</span>
                  <span className="block text-xs font-bold text-[#2D2D2A]">
                    {selectedProduct.carbonSaved}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-[#8B8B88] uppercase">Water Saved</span>
                  <span className="block text-xs font-bold text-[#2D2D2A]">
                    {selectedProduct.waterSaved}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-[#8B8B88] uppercase">Tree Equiv.</span>
                  <span className="block text-xs font-bold text-[#2D2D2A]">
                    {selectedProduct.treeEquivalent}
                  </span>
                </div>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="pt-2 flex gap-3">
              <button
                disabled={isAdded}
                onClick={() => {
                  if (currentUser?.role === 'customer') {
                    if (!isAdded) {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }
                  } else {
                    router.push('/login');
                  }
                }}
                className={`flex-1 py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isAdded
                    ? 'bg-sage-600 text-white'
                    : 'btn-slide-primary bg-primary text-white shadow-md'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Bag
                  </>
                )}
              </button>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3.5 border rounded-xl transition-all ${
                  isLiked 
                    ? 'border-clay-400 bg-clay-50 text-clay-600' 
                    : 'border-[#EAE5DB] hover:border-clay hover:text-clay text-[#8B8B88]'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-clay-600' : ''}`} />
              </button>
            </div>

            {/* Guarantee Label */}
            <span className="flex items-center justify-center gap-1 text-[9px] text-[#8B8B88] font-light">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Inspected, washed, and certified circular by Re-Wear Collective.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

