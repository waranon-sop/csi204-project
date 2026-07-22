"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import QuickViewModal from './QuickViewModal';
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
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    const visibleProducts = products.filter(
      (p) => p.status !== "Sold Out" && p.status !== "Hidden" && p.status !== "Archived" && p.status !== "Draft",
    );
    if (activeFilter === "All Pieces") return visibleProducts;
    return visibleProducts.filter((p) => p.category === activeFilter);
  }, [activeFilter, products]);

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
            ไม่มีสินค้าในหมวดหมู่นี้
          </div>
        )}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
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

                <div className="absolute inset-0 bg-[#2D2D2A]/10 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center pb-6">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedProduct(product);
                    }}
                    className="bg-[#FCFBF7] text-[#2D2D2A] text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-primary hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500"
                  >
                    <Eye className="h-4 w-4" />
                    Quick View
                  </button>
                </div>
              </Link>

              <div className="flex justify-between items-start pt-1 font-sans px-1">
                <Link
                  href={`/product/${product.id}`}
                  className="block max-w-[70%]"
                >
                  <h3 className="font-serif font-bold text-[17px] text-[#2D2D2A] leading-snug group-hover:text-[#5F6B4E] transition-colors">
                    {product.title}
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
                  } else if (currentUser.role === "customer") {
                    if (product.status !== 'Reserved' && product.status !== 'Out of Stock' && product.stock !== 0) {
                      addToCart(product);
                    }
                  }
                }}
                className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider transition-colors flex items-center justify-center gap-2 mt-2 ${
                  !currentUser || currentUser.role === "customer"
                    ? product.status === 'Reserved' || product.status === 'Out of Stock' || product.stock === 0
                      ? "bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed"
                      : "bg-[#2D2D2A] text-white hover:bg-primary"
                    : "bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed"
                }`}
                disabled={currentUser?.role !== "customer" && currentUser !== null}
              >
                {product.status === 'Reserved' ? (
                  'RESERVED'
                ) : product.status === 'Out of Stock' || product.stock === 0 ? (
                  'SOLD OUT'
                ) : (
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

      <QuickViewModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </>
  );
}
