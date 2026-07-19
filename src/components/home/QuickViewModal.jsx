"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Heart, Leaf, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

export default function QuickViewModal({
  selectedProduct,
  setSelectedProduct,
}) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const getEcoImpact = (category) => {
    let water = 2700;
    let co2 = 5;

    const catUpper = (category || '').toUpperCase();
    if (catUpper.includes('DENIM') || catUpper.includes('JEAN') || catUpper.includes('BOTTOM')) {
      water = 7500;
      co2 = 15;
    } else if (catUpper.includes('JACKET') || catUpper.includes('HEAVYWEAR') || catUpper.includes('OUTERWEAR')) {
      water = 5000;
      co2 = 20;
    }

    const treeEquivalent = (co2 / 22).toFixed(2);
    
    return {
      waterSaved: `${water.toLocaleString()} L`,
      carbonSaved: `${co2} kg CO₂e`,
      treeEquivalent: `${treeEquivalent} Trees/yr`
    };
  };

  const ecoImpact = selectedProduct ? getEcoImpact(selectedProduct.category) : null;
  const { addToCart, cartItems } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { currentUser, openAuthModal } = useAuth();
  const router = useRouter();

  const isAdded = cartItems.some((item) => item.id === selectedProduct?.id);

  // Reset state when a new product is opened
  useEffect(() => {
    setCurrentImageIdx(0);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const images = selectedProduct ? [selectedProduct.image, selectedProduct.hoverImage].filter(Boolean) : [];
  
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

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
          <div className="relative aspect-[4/5] bg-tertiary/40 group">
            <Image
              src={images[currentImageIdx]}
              alt={selectedProduct.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
            />
            {images.length > 1 && (
              <>
                {/* Arrow Buttons */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-[#2D2D2A] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all hover:scale-110 shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-[#2D2D2A] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all hover:scale-110 shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {selectedProduct.badge && (
              <span className="absolute top-6 left-6 text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-white/95 text-[#2D2D2A] border border-[#EAE5DB]/65 z-10">
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
                <div className="flex items-center justify-between mt-2">
                  <span className="block font-serif text-xl font-bold text-[#2D2D2A]">
                    THB {selectedProduct.price}
                  </span>
                  <span className="text-[10px] font-bold text-[#D03C31] bg-[#FFF3EE] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Only 1 left in stock
                  </span>
                </div>
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
                    {ecoImpact?.carbonSaved}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-[#8B8B88] uppercase">Water Saved</span>
                  <span className="block text-xs font-bold text-[#2D2D2A]">
                    {ecoImpact?.waterSaved}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] text-[#8B8B88] uppercase">Tree Equiv.</span>
                  <span className="block text-xs font-bold text-[#2D2D2A]">
                    {ecoImpact?.treeEquivalent}
                  </span>
                </div>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  disabled={isAdded || selectedProduct.status === 'Reserved'}
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login');
                    } else if (currentUser.role === 'customer') {
                      if (!isAdded && selectedProduct.status !== 'Reserved') {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }
                    }
                    // admin/staff → ไม่ควรซื้อของได้ ไม่ทำอะไร
                  }}
                  className={`flex-1 py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    selectedProduct.status === 'Reserved'
                      ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed'
                      : isAdded
                      ? 'bg-sage-600 text-white'
                      : 'btn-slide-primary bg-primary text-white shadow-md'
                  }`}
                >
                  {selectedProduct.status === 'Reserved' ? (
                    'ติดจอง (Reserved)'
                  ) : isAdded ? (
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
                  onClick={() => toggleFavorite(selectedProduct)}
                  className={`p-3.5 border rounded-xl transition-all flex-shrink-0 ${
                    isFavorite(selectedProduct.id) 
                      ? 'border-clay-400 bg-clay-50 text-clay-600' 
                      : 'border-[#EAE5DB] hover:border-clay hover:text-clay text-[#8B8B88]'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite(selectedProduct.id) ? 'fill-current text-clay-600' : ''}`} />
                </button>
              </div>
              
              {/* View Full Details Link */}
              <div className="text-center mt-2">
                <Link 
                  href={`/product/${selectedProduct.id}`}
                  onClick={() => setSelectedProduct(null)}
                  className="text-[11px] text-[#5C5C5A] hover:text-[#2D2D2A] underline underline-offset-4 decoration-[#EAE5DB] hover:decoration-[#2D2D2A] transition-colors"
                >
                  View Full Details
                </Link>
              </div>
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

