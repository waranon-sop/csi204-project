"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import ProductFilters from './ProductFilters';
import LookbookSection from './LookbookSection';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProductCollection() {
  const [activeFilter] = useState("All Pieces");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("ทั้งหมด");

  const [products, setProducts] = useState([]);
  
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { currentUser, openAuthModal } = useAuth();
  const router = useRouter();

  const toggleFilter = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();

    const handleUpdate = () => {
      fetchProducts();
    };
    window.addEventListener("productsUpdated", handleUpdate);
    return () => window.removeEventListener("productsUpdated", handleUpdate);
  }, []);

  const filteredProducts = useMemo(() => {
    let visibleProducts = products.filter(
      (p) => p.status !== "Sold Out" && p.status !== "Hidden" && p.status !== "Archived" && p.status !== "Draft"
    );
    
    if (activeFilter !== "All Pieces") {
      visibleProducts = visibleProducts.filter((p) => p.category === activeFilter || p.brandCategory === activeFilter);
    }

    if (selectedFilters.length > 0) {
      const selectedSizes = selectedFilters.filter(f => ["L", "M", "M/L", "S", "XL", "XL/XXL", "XS", "XS/S"].includes(f));
      const selectedCategories = selectedFilters.filter(f => ["Skirts", "Dresses", "T-shirts & Tops", "Pants & Jeans", "Outerwear", "Necklaces", "Earrings", "Bracelets", "Rings", "Handbags", "Other"].includes(f));
      const selectedColors = selectedFilters.filter(f => ["Black", "White", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Brown", "Pink", "Beige"].includes(f));

      visibleProducts = visibleProducts.filter(p => {
        const pSize = (p.size || '').toUpperCase();
        const pCat = (p.category || '').toLowerCase();
        const pBrandCat = (p.brandCategory || '').toLowerCase();
        const pCol = (p.color || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();

        const matchSize = selectedSizes.length === 0 || selectedSizes.some(sz => pSize.includes(sz));
        const matchCategory = selectedCategories.length === 0 || selectedCategories.some(cat => {
           const c = cat.toLowerCase();
           if (c === 'skirts' && (pCat.includes('กระโปรง') || pCat.includes('skirt'))) return true;
           if (c === 'dresses' && (pCat.includes('เดรส') || pCat.includes('dress'))) return true;
           if (c === 't-shirts & tops' && (pCat.includes('เสื้อ') || pCat.includes('top') || pCat.includes('shirt') || pCat.includes('t-shirt'))) return true;
           if (c === 'pants & jeans' && (pCat.includes('กางเกง') || pCat.includes('pant') || pCat.includes('jean') || pCat.includes('เดนิม') || pCat.includes('denim'))) return true;
           if (c === 'outerwear' && (pCat.includes('เสื้อคลุม') || pCat.includes('แจ็คเก็ต') || pCat.includes('jacket') || pCat.includes('coat'))) return true;
           if (c === 'necklaces' && (pCat.includes('สร้อยคอ') || pCat.includes('necklace'))) return true;
           if (c === 'earrings' && (pCat.includes('ต่างหู') || pCat.includes('earring'))) return true;
           if (c === 'bracelets' && (pCat.includes('ข้อมือ') || pCat.includes('bracelet'))) return true;
           if (c === 'rings' && (pCat.includes('แหวน') || pCat.includes('ring'))) return true;
           if (c === 'handbags' && (pCat.includes('กระเป๋า') || pCat.includes('bag'))) return true;
           return pCat.includes(c) || pBrandCat.includes(c);
        });
        const matchColor = selectedColors.length === 0 || selectedColors.some(col => pCol.includes(col.toLowerCase()) || pName.includes(col.toLowerCase()));

        return matchSize && matchCategory && matchColor;
      });
    }

    if (selectedPriceRange !== "ทั้งหมด") {
      visibleProducts = visibleProducts.filter(p => {
        if (selectedPriceRange === "ต่ำกว่า ฿499") return p.price <= 499;
        if (selectedPriceRange === "฿500 - ฿999") return p.price >= 500 && p.price <= 999;
        if (selectedPriceRange === "฿1,000 - ฿1,999") return p.price >= 1000 && p.price <= 1999;
        if (selectedPriceRange === "฿2,000 - ฿2,999") return p.price >= 2000 && p.price <= 2999;
        if (selectedPriceRange === "฿3,000 - ฿3,999") return p.price >= 3000 && p.price <= 3999;
        if (selectedPriceRange === "฿4,000 - ฿4,999") return p.price >= 4000 && p.price <= 4999;
        if (selectedPriceRange === "฿5,000 ขึ้นไป") return p.price >= 5000;
        return true;
      });
    }

    return visibleProducts;
  }, [activeFilter, products, selectedFilters, selectedPriceRange]);

  return (
    <>
      <section
        id="collection"
        className="max-w-7xl mx-auto px-6 sm:px-8 py-20 space-y-10 animate-fade-up delay-100 bg-[#F9F8F6]"
      >
        <ProductFilters 
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          toggleFilter={toggleFilter}
          selectedPriceRange={selectedPriceRange}
          setSelectedPriceRange={setSelectedPriceRange}
        />

        {filteredProducts.length === 0 && (
          <div className="col-span-4 text-center py-20 text-[#8B8B88] font-sans text-sm">
            No products available in this category
          </div>
        )}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="flex flex-col space-y-4 group relative bg-white p-4 rounded-3xl shadow-sm border border-[#EAE5DB]/50"
            >
              <Link
                href={`/product/${product.id}`}
                className="relative aspect-square rounded-2xl overflow-hidden bg-lavender block cursor-pointer"
              >
                <Image
                  src={product.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"}
                  alt={product.title || product.name || "Product"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 ease-in-out mix-blend-multiply"
                />

                {(!currentUser || currentUser.role === 'customer') && (
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(product);
                      }}
                      className="p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-colors shadow-sm text-sage-600 hover:scale-110 active:scale-95"
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}



                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
                  {product.isEarlyAccess && (
                    <div className="bg-[#2D2D2A] text-white text-[9px] font-bold px-2 py-1 uppercase rounded-sm shadow-sm flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      EARLY ACCESS
                    </div>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="bg-[#D03C31] text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm shadow-sm flex items-center gap-1">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex justify-between items-start pt-1 font-sans px-1">
                <Link
                  href={`/product/${product.id}`}
                  className="block max-w-[70%]"
                >
                  <h3 className="font-serif font-bold text-[17px] text-[#2D2D2A] leading-snug group-hover:text-[#5F6B4E] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex flex-col items-end">
                  {product.originalPrice && (
                    <span className="text-[10px] text-[#8B8B88] line-through font-medium leading-none mb-0.5">
                      THB {product.originalPrice}
                    </span>
                  )}
                  <span
                    className={`font-sans font-bold text-[14px] ${product.originalPrice ? "text-[#D03C31]" : "text-[#2D2D2A]"}`}
                  >
                    THB {product.price}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!currentUser) {
                    openAuthModal("login");
                    return;
                  }
                  const hasEarlyAccess = ["Bloom", "Fruit", "Harvest"].includes(currentUser.tier);
                  if (product.isEarlyAccess && !hasEarlyAccess) {
                    return; // Disabled
                  }
                  if (currentUser.role === "customer") {
                    if (product.status !== 'Reserved' && product.status !== 'Out of Stock' && product.stock !== 0) {
                      addToCart(product);
                    }
                  }
                }}
                disabled={
                  (currentUser && currentUser.role !== 'customer') || 
                  product.status === 'Reserved' || 
                  product.status === 'Out of Stock' || 
                  product.stock === 0 || 
                  (product.isEarlyAccess && (!currentUser || !["Bloom", "Fruit", "Harvest"].includes(currentUser.tier)))
                }
                className={`w-full font-semibold text-[11px] py-3 rounded-xl flex justify-center items-center gap-2 transition-all mt-2 ${
                  (currentUser && currentUser.role !== 'customer')
                    ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed'
                    : (product.isEarlyAccess && (!currentUser || !["Bloom", "Fruit", "Harvest"].includes(currentUser.tier)))
                    ? 'bg-purple-50 text-purple-400 cursor-not-allowed border border-purple-200'
                    : product.status === 'Reserved' 
                    ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed' 
                    : (product.status === 'Out of Stock' || product.stock === 0)
                    ? 'bg-red-50 text-red-400 cursor-not-allowed'
                    : 'bg-[#5F6B4E] text-white hover:bg-[#4A543C] shadow-sm'
                }`}
              >
                {product.isEarlyAccess && (!currentUser || !["Bloom", "Fruit", "Harvest"].includes(currentUser.tier)) ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked
                  </>
                ) : product.status === 'Reserved' ? 'RESERVED' : (product.status === 'Out of Stock' || product.stock === 0) ? 'SOLD OUT' : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>

        <LookbookSection products={products} />
      </section>


    </>
  );
}
