"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Leaf, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import QuickViewModal from './QuickViewModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { getProducts, getLookbooks } from '../../utils/localStorageHelper';

const FILTERS = ["All Pieces", "Vintage Denim", "Y2K Shirts", "Jackets"];

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
  const [activeFilter, setActiveFilter] = useState("All Pieces");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("ทั้งหมด");

  const toggleFilter = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
    );
  };
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { currentUser, openAuthModal } = useAuth();
  const router = useRouter();

  const [rawLookbooks, setRawLookbooks] = useState([]);
  const [activeLookSelections, setActiveLookSelections] = useState({});
  const [isLookSelecting, setIsLookSelecting] = useState({});
  const [isLookAdding, setIsLookAdding] = useState({});

  const toggleLookItem = (lookId, itemId) => {
    setActiveLookSelections(prev => {
      const current = prev[lookId] || [];
      const updated = current.includes(itemId) 
        ? current.filter(i => i !== itemId) 
        : [...current, itemId];
      return { ...prev, [lookId]: updated };
    });
  };

  const handleShopLookClick = (lookId) => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }
    if (currentUser.role !== "customer") return;
    setIsLookSelecting(prev => ({ ...prev, [lookId]: true }));
  };

  const lookbooks = useMemo(() => {
    return rawLookbooks.map(lb => ({
      ...lb,
      items: lb.items.map(item => {
        const fresh = products.find(p => p.id === item.id);
        return fresh || item;
      })
    }));
  }, [rawLookbooks, products]);

  const handleAddLookToCart = async (lookbook) => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }
    if (currentUser.role !== "customer") return;

    setIsLookAdding(prev => ({ ...prev, [lookbook.id]: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const selectedIds = activeLookSelections[lookbook.id] || [];
    const itemsToAdd = lookbook.items.filter(item => {
      const isSoldOut = item.status === 'Sold Out' || item.status === 'Out of Stock' || item.stock === 0 || item.status === 'Reserved';
      return selectedIds.includes(item.id) && !isSoldOut;
    });
    
    itemsToAdd.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title || item.name,
        price: item.price,
        image: lookbook.image,
        brandCategory: "Lookbook Item",
        category: "Lookbook",
        size: item.size,
      });
    });

    setIsLookAdding(prev => ({ ...prev, [lookbook.id]: false }));
    setIsLookSelecting(prev => ({ ...prev, [lookbook.id]: false }));
  };

  useEffect(() => {
    const loaded = getLookbooks();
    setRawLookbooks(loaded);
    const initialSelections = {};
    loaded.forEach(lb => {
      initialSelections[lb.id] = lb.items.map(i => i.id);
    });
    setActiveLookSelections(initialSelections);
    
    const handleLookbookUpdate = () => {
      const updated = getLookbooks();
      setRawLookbooks(updated);
      const newSelections = {};
      updated.forEach(lb => {
        newSelections[lb.id] = lb.items.map(i => i.id);
      });
      setActiveLookSelections(newSelections);
    };
    window.addEventListener('lookbooksUpdated', handleLookbookUpdate);
    return () => window.removeEventListener('lookbooksUpdated', handleLookbookUpdate);
  }, []);

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
        {/* New Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-[#EAE5DB] bg-white relative z-40">
            <div className="flex items-center h-14 w-full md:w-auto">
              <div className="px-6 h-full flex items-center border-r border-[#EAE5DB] shrink-0">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2D2D2A]">
                  Filters
                </span>
              </div>

              {/* Size Dropdown */}
              <div className="relative h-full flex">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "size" ? null : "size")
                  }
                  className={`px-6 h-full flex items-center gap-2 text-[13px] transition-colors border-r border-[#EAE5DB] shrink-0 ${openDropdown === "size" ? "bg-[#2D2D2A] text-white" : "text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
                >
                  Size
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === "size" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === "size" && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2">
                    {["L", "M", "M/L", "S", "XL", "XL/XXL", "XS", "XS/S"].map(
                      (size) => (
                        <label
                          key={size}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer"
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedFilters.includes(size)}
                              onChange={() => toggleFilter(size)}
                              className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors"
                            />
                            <svg
                              className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-[13px] text-[#2D2D2A]">
                            {size}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="relative h-full flex">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "category" ? null : "category",
                    )
                  }
                  className={`px-6 h-full flex items-center gap-2 text-[13px] transition-colors border-r border-[#EAE5DB] shrink-0 ${openDropdown === "category" ? "bg-[#2D2D2A] text-white" : "text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
                >
                  Category
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === "category" && (
                  <div className="absolute top-full left-0 w-56 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2">
                    {[
                      "T-Shirts",
                      "Shirts & Blouses",
                      "Sweaters & Knitwear",
                      "Jackets & Coats",
                      "Jeans",
                      "Trousers & Pants",
                      "Skirts",
                      "Dresses",
                      "Other",
                    ].map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(cat)}
                            onChange={() => toggleFilter(cat)}
                            className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors"
                          />
                          <svg
                            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-[13px] text-[#2D2D2A]">
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Dropdown */}
              <div className="relative h-full flex">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === "color" ? null : "color")
                  }
                  className={`px-6 h-full flex items-center gap-2 text-[13px] transition-colors border-r md:border-r-0 border-[#EAE5DB] shrink-0 ${openDropdown === "color" ? "bg-[#2D2D2A] text-white" : "text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
                >
                  Color
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === "color" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === "color" && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2">
                    {[
                      { name: "Black", hex: "#1A1A1A" },
                      { name: "White", hex: "#FFFFFF" },
                      { name: "Gray", hex: "#808080" },
                      { name: "Red", hex: "#D93838" },
                      { name: "Blue", hex: "#2A5C91" },
                      { name: "Green", hex: "#3B7346" },
                      { name: "Yellow", hex: "#F0C94F" },
                      { name: "Orange", hex: "#E07A38" },
                      { name: "Purple", hex: "#6B4070" },
                      { name: "Brown", hex: "#7A5C43" },
                      { name: "Pink", hex: "#E8A0B3" },
                      { name: "Beige", hex: "#E0D8C8" },
                    ].map((color) => (
                      <label
                        key={color.name}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(color.name)}
                            onChange={() => toggleFilter(color.name)}
                            className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors"
                          />
                          <svg
                            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full border border-[#D1D1D1] shrink-0"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="text-[13px] text-[#2D2D2A]">
                          {color.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-14 flex items-center border-t md:border-t-0 md:border-l border-[#EAE5DB] shrink-0 w-full md:w-auto relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "price" ? null : "price")
                }
                className={`px-6 h-full w-full flex items-center justify-between md:justify-start gap-8 text-[13px] transition-colors ${openDropdown === "price" ? "bg-[#2D2D2A] text-white" : "text-[#2D2D2A] hover:bg-[#F9F8F6]"}`}
              >
                <span className="font-bold">Price</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${openDropdown === "price" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "price" && (
                <div className="absolute top-full right-0 w-[400px] bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-6 px-8">
                  <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                    {[
                      "ทั้งหมด",
                      "ต่ำกว่า ฿499",
                      "฿500 - ฿999",
                      "฿1,000 - ฿1,999",
                      "฿2,000 - ฿2,999",
                      "฿3,000 - ฿3,999",
                      "฿4,000 - ฿4,999",
                      "฿5,000 ขึ้นไป",
                    ].map((range) => (
                      <label
                        key={range}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={selectedPriceRange === range}
                            onChange={() => setSelectedPriceRange(range)}
                            className="peer appearance-none w-4 h-4 rounded-full border border-[#D1D1D1] checked:border-[5px] checked:border-[#2D2D2A] cursor-pointer transition-all"
                          />
                        </div>
                        <span
                          className={`text-[13px] transition-colors ${selectedPriceRange === range ? "text-[#2D2D2A] font-bold" : "text-[#8B8B88] group-hover:text-[#5C5C5A]"}`}
                        >
                          {range}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Row */}
          {(selectedFilters.length > 0 || selectedPriceRange !== "ทั้งหมด") && (
            <div className="flex flex-wrap items-center gap-2 py-3 border-b border-[#EAE5DB] bg-[#F9F8F6]/50 px-6">
              <button
                onClick={() => {
                  setSelectedFilters([]);
                  setSelectedPriceRange("ทั้งหมด");
                }}
                className="border border-[#2D2D2A] bg-white px-3 py-1.5 text-[11px] font-bold text-[#2D2D2A] hover:bg-[#2D2D2A] hover:text-white transition-colors rounded-sm"
              >
                รีเซ็ต
              </button>

              {selectedPriceRange !== "ทั้งหมด" && (
                <button
                  onClick={() => setSelectedPriceRange("ทั้งหมด")}
                  className="flex items-center gap-2 border border-[#EAE5DB] bg-white px-3 py-1.5 text-[11px] text-[#5C5C5A] hover:border-[#2D2D2A] hover:text-[#2D2D2A] transition-colors rounded-sm tracking-wider"
                >
                  {selectedPriceRange}
                  <svg
                    className="w-3 h-3 text-[#A0A09F] group-hover:text-[#2D2D2A] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {selectedFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className="flex items-center gap-2 border border-[#EAE5DB] bg-white px-3 py-1.5 text-[11px] text-[#5C5C5A] hover:border-[#2D2D2A] hover:text-[#2D2D2A] transition-colors rounded-sm uppercase tracking-wider"
                >
                  {filter}
                  <svg
                    className="w-3 h-3 text-[#A0A09F] group-hover:text-[#2D2D2A] transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

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
                disabled={(currentUser && currentUser.role !== 'customer') || product.status === 'Reserved' || product.status === 'Out of Stock' || product.stock === 0}
                className={`w-full font-semibold text-[11px] py-3 rounded-xl flex justify-center items-center gap-2 transition-all mt-2 ${
                  (currentUser && currentUser.role !== 'customer')
                    ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed'
                    : product.status === 'Reserved' 
                    ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed' 
                    : (product.status === 'Out of Stock' || product.stock === 0)
                    ? 'bg-red-50 text-red-400 cursor-not-allowed'
                    : 'bg-[#5F6B4E] text-white hover:bg-[#4A543C] shadow-sm'
                }`}
              >
                {product.status === 'Reserved' ? 'ติดจอง' : (product.status === 'Out of Stock' || product.stock === 0) ? 'Out of Stock' : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
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

        {/* Staff Styling / Inspiration Section */}
        <div className="pt-24 pb-10 border-t border-[#EAE5DB] mt-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#2D2D2A]">
              LOOKBOOK
            </h2>
            <p className="text-[13px] text-[#5C5C5A] mt-2 font-sans font-medium">
              Inspiration and mix-and-match ideas from our team.
            </p>
          </div>

          {lookbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[#8B8B88] font-medium">There are no lookbooks available right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-24 lg:gap-32">
              {lookbooks.map((lookbook, lookIndex) => (
              <div key={lookbook.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className={`relative aspect-[4/5] w-full overflow-hidden ${lookIndex % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image
                    src={lookbook.image || "/styling_1.png"}
                    alt={lookbook.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className={`flex flex-col justify-center ${lookIndex % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8B8B88] mb-4">
                    {lookbook.subtitle}
                  </span>
                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#2D2D2A] mb-12">
                    {lookbook.title}
                  </h3>

                  <div className="space-y-6 mb-12 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {lookbook.items?.map((item, idx) => {
                      const isSoldOut = item.status === 'Sold Out' || item.status === 'Out of Stock' || item.stock === 0 || item.status === 'Reserved';
                      const isSelecting = isLookSelecting[lookbook.id];
                      const selectedIds = activeLookSelections[lookbook.id] || [];
                      const isSelected = selectedIds.includes(item.id) && !isSoldOut;
                      
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isSelecting && !isSoldOut) {
                              toggleLookItem(lookbook.id, item.id);
                            }
                          }}
                          className={`flex items-start gap-4 ${isSelecting && !isSoldOut ? "cursor-pointer group" : ""} ${isSoldOut ? "opacity-60" : ""} ${idx !== lookbook.items.length - 1 ? "border-b border-[#EAE5DB] pb-5" : ""}`}
                        >
                          {isSelecting && (
                            <div className="relative flex items-center justify-center mt-1 shrink-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isSoldOut}
                                readOnly
                                className="peer appearance-none w-5 h-5 border-2 border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] disabled:bg-[#EAE5DB] disabled:border-[#D1D1D1] transition-colors cursor-pointer disabled:cursor-not-allowed"
                              />
                              <svg
                                className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-[14px] font-bold transition-colors ${!isSelecting || isSelected ? "text-[#2D2D2A]" : "text-[#A0A09F]"} ${isSoldOut ? "line-through text-[#A0A09F]" : ""}`}
                              >
                                {item.title || item.name}
                              </h4>
                              {isSoldOut && (
                                <span className="text-[9px] uppercase tracking-wider font-bold bg-[#FEE2E2] text-[#D03C31] px-1.5 py-0.5 rounded-sm">
                                  {item.status === 'Reserved' ? 'Reserved' : 'Sold Out'}
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-[12px] font-medium tracking-wide mt-1.5 transition-colors flex flex-wrap items-center gap-2 ${(!isSelecting || isSelected) && !isSoldOut ? "text-[#5C5C5A]" : "text-[#A0A09F]"} ${isSoldOut ? "line-through" : ""}`}
                            >
                              <div className="flex items-center gap-1.5">
                                Color:{" "}
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm"
                                  style={{ backgroundColor: item.color?.startsWith('#') ? item.color : (item.hex || item.color) }}
                                />{" "}
                                {item.color && !item.color.startsWith('#') && item.color}
                              </div>
                              <span className="text-[#EAE5DB]">|</span>
                              <span>Size: {item.size}</span>
                              <span className="text-[#EAE5DB]">|</span>
                              <span>THB {item.price?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isLookSelecting[lookbook.id] ? (
                    <button
                      onClick={() => handleShopLookClick(lookbook.id)}
                      className="bg-[#2D2D2A] text-white text-[12px] font-bold tracking-[0.15em] uppercase py-5 px-8 w-full hover:bg-[#1A1A1A] transition-colors rounded-sm flex items-center justify-center gap-3 group"
                    >
                      SHOP THIS LOOK (THB{" "}
                      {(lookbook.items || []).reduce(
                        (sum, item) => {
                          const isSoldOut = item.status === 'Sold Out' || item.status === 'Out of Stock' || item.stock === 0 || item.status === 'Reserved';
                          return sum + (isSoldOut ? 0 : (item.price || 0));
                        },
                        0,
                      ).toLocaleString()}
                      )
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      disabled={lookbook.items.filter(i => {
                        const isSoldOut = i.status === 'Sold Out' || i.status === 'Out of Stock' || i.stock === 0 || i.status === 'Reserved';
                        return (activeLookSelections[lookbook.id] || []).includes(i.id) && !isSoldOut;
                      }).length === 0 || isLookAdding[lookbook.id]}
                      onClick={() => handleAddLookToCart(lookbook)}
                      className="bg-[#5F6B4E] text-white text-[12px] font-bold tracking-[0.15em] uppercase py-5 px-8 w-full hover:bg-[#4A533D] transition-colors rounded-sm flex items-center justify-center gap-3 group disabled:bg-[#D1D1D1] disabled:text-[#8B8B88] disabled:cursor-not-allowed"
                    >
                      {isLookAdding[lookbook.id] ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          ADDING...
                        </>
                      ) : lookbook.items.filter(i => {
                        const isSoldOut = i.status === 'Sold Out' || i.status === 'Out of Stock' || i.stock === 0 || i.status === 'Reserved';
                        return (activeLookSelections[lookbook.id] || []).includes(i.id) && !isSoldOut;
                      }).length > 0 ? (
                        `ADD SELECTED TO CART (THB ${lookbook.items.filter(i => {
                          const isSoldOut = i.status === 'Sold Out' || i.status === 'Out of Stock' || i.stock === 0 || i.status === 'Reserved';
                          return (activeLookSelections[lookbook.id] || []).includes(i.id) && !isSoldOut;
                        }).reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString()})`
                      ) : (
                        "SELECT ITEMS"
                      )}
                      {!isLookAdding[lookbook.id] && (activeLookSelections[lookbook.id] || []).length > 0 && (
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      <QuickViewModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </>
  );
}
