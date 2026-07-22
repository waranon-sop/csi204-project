"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, RefreshCcw, ShieldCheck, Shirt, MapPin, Leaf, Info } from 'lucide-react';
import { getProducts } from '../../../utils/localStorageHelper';
import AnimatedPage from '../../../components/AnimatedPage';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useFavorites } from '../../../context/FavoritesContext';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [curatedProducts, setCuratedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const { cartItems, addToCart } = useCart();
  const { currentUser, openAuthModal } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    // Scroll to top on mount/id change
    window.scrollTo(0, 0);
    // Find product or default to first
    const fetchProduct = async () => {
      const allProducts = await getProducts();
      // Parse id assuming string or number (backend might use RW-XXXX, front end might use integer for mock, let's just do == string compare)
      const found = allProducts.find((p) => String(p.id) === String(id)) || allProducts[0];
      setProduct(found);
      if (found) setActiveImage(found.hoverImage || found.image);
      setCuratedProducts(allProducts.filter((p) => p.id !== found?.id).slice(0, 4));
    };
    fetchProduct();
  }, [id]);

  if (!product) return null;

  const isAdded = cartItems.some((item) => item.id === product.id);

  // Derive some dynamic specs (or use defaults if missing)
  const categorySplit = (product.brandCategory || product.category || '').split(' • ');
  const categoryStr = categorySplit[0] || 'Archive';
  const subCategoryStr = categorySplit[1] || 'Outerwear';

  return (
    <AnimatedPage className="bg-[#FAF8F5] min-h-screen font-sans text-[#2D2D2A] pb-24">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <nav className="flex text-[10px] font-semibold text-[#8B8B88] uppercase tracking-widest gap-2">
          <Link href="/" className="hover:text-[#2D2D2A] transition-colors">Archive</Link>
          <span>›</span>
          <span>{categoryStr}</span>
          <span>›</span>
          <span className="text-[#2D2D2A]">{product.title || product.name}</span>
        </nav>
      </div>

      {/* ── Top Section: Image & Details ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-[600px] lg:h-[700px]">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible shrink-0">
            {[product.hoverImage, product.image].filter(url => url && url.trim() !== '').map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                className={`w-20 md:w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all relative ${
                  activeImage === imgUrl ? 'border-[#5F6B4E]' : 'border-transparent hover:border-[#EAE5DB]'
                }`}
              >
                <Image src={imgUrl} alt="thumbnail" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-grow bg-[#EAE5DB]/30 rounded-[2rem] overflow-hidden">
            <Image src={activeImage || '/images/products/rw_item_01.jpg'} alt={product.title || product.name || 'Product'} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover mix-blend-multiply" />
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.salePrice > 0 && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full bg-red-600 text-white shadow-sm w-fit">
                  ON SALE {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                </span>
              )}
              <span className="text-[9px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full bg-[#5F6B4E] text-[#FAF8F5] shadow-sm w-fit">
                ONE OF ONE
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full bg-white text-[#2D2D2A] shadow-sm w-fit border border-[#EAE5DB]/65">
                ECO-CERTIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            <h1 className="font-serif text-4xl lg:text-5xl font-semibold leading-tight text-[#4A543C]">
              {product.title || product.name}
            </h1>
            <div className="font-serif text-2xl font-bold text-[#8B6B57] flex items-center gap-3">
              {product.salePrice > 0 ? (
                <>
                  <span className="text-red-600">THB {product.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="text-lg line-through opacity-50">THB {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </>
              ) : (
                <span>THB {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              )}
            </div>
          </div>

          {/* Condition Pill & Era */}
          <div className="flex items-center gap-4 border-b border-[#F2E9DC] pb-6">
            <div className="flex items-center gap-2 bg-[#F2E9DC]/60 px-4 py-2 rounded-full border border-[#E2D5C4]/60">
              <ShieldCheck className="h-4 w-4 text-[#C57B57]" />
              <span className="text-[11px] font-bold text-[#8B6B57]">Condition: {product.condition || 'Good'}</span>
            </div>
            <span className="text-[10px] text-[#8B8B88] font-light">
              Circa 1990s
            </span>
          </div>

          {/* Story & Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#2D2D2A] uppercase">
              STORY & DETAILS
            </h3>
            <p className="text-xs text-[#5C5C5A] leading-relaxed font-light">
              {product.description || 'A timeless vintage piece, expertly sourced and ready for its next chapter.'}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[11px] text-[#5C5C5A] py-2">
            <div className="flex items-center gap-2.5">
              <RefreshCcw className="h-4 w-4 shrink-0 text-[#8B8B88]" />
              <span>100% Repurposed Material</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Shirt className="h-4 w-4 shrink-0 text-[#8B8B88]" />
              <span>Professionally Cleaned</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#8B8B88] w-4 text-center">T</span>
              <span>Size: {product.size || 'OS'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-[#8B8B88]" />
              <span>Sourced: Tokyo, Japan</span>
            </div>
          </div>
          
          <hr className="border-[#F2E9DC]" />

          {/* Vintage Principle: Precise Measurements instead of Size Selector */}
          <div className="space-y-4 bg-[#FAF7F2] p-5 rounded-2xl border border-[#F2E9DC]/60">
            <div className="flex items-center gap-2">
              <Shirt className="h-3.5 w-3.5 text-[#8B8B88]" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#2D2D2A] uppercase">Measurements (Inches)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(product.measurements || 'Chest: 20, Length: 25').split(',').map((m, i) => {
                const [label, value] = m.trim().split(':');
                return (
                  <div key={i} className="flex flex-col items-center bg-white rounded-xl p-3 border border-[#F2E9DC] gap-1">
                    <span className="text-[11px] font-bold text-[#2D2D2A]">{value?.trim() ?? label.trim()}</span>
                    {value && <span className="text-[9px] text-[#8B8B88] uppercase tracking-widest">{label.trim()}</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-[#8B8B88] italic leading-relaxed">
              * Please compare these measurements to a similar garment you already own.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-4">
              {product.status === 'Sold Out' || product.status === 'Reserved' || product.status === 'Draft' ? (
                <button 
                  onClick={() => router.push('/#collection')}
                  className="flex-1 py-4 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex justify-center items-center gap-2 bg-[#FAF7F2] border border-[#EAE5DB] text-[#4A543C] hover:bg-[#F2E9DC]"
                >
                  ดูสินค้าที่คล้ายกัน
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login');
                    } else if (currentUser.role === 'customer') {
                      if (!isAdded) {
                        addToCart(product);
                      }
                    }
                  }}
                  disabled={(currentUser && currentUser.role !== 'customer') || isAdded}
                  className={`flex-1 py-4 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex justify-center items-center gap-2 ${
                    (currentUser && currentUser.role !== 'customer')
                      ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed'
                      : isAdded ? 'bg-sage-600 text-white' : 'bg-[#4A543C] hover:bg-[#3A432F] text-white'
                  }`}
                >
                  {isAdded ? 'ADDED TO ARCHIVE' : 'ADD TO CART'}
                </button>
              )}
              <button 
                onClick={() => toggleFavorite(product)}
                className={`p-4 rounded-xl border transition-all ${
                  isFavorite(product.id) ? 'border-clay-400 bg-clay-50' : 'border-[#EAE5DB] hover:border-clay bg-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current text-clay-600' : 'text-[#8B8B88]'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[9px] text-[#8B8B88] font-medium">
              <div className="flex items-center gap-1.5 text-primary relative group cursor-help">
                <Leaf className="w-3.5 h-3.5 fill-current" />
                Carbon-Neutral Shipping
                <Info className="h-3.5 w-3.5 text-[#8B8B88]" />
                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-[#2D2D2A] text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 font-sans pointer-events-none">
                  เราชดเชยคาร์บอน (Carbon Offset) จากการจัดส่งทุกออเดอร์ เพื่อให้การส่งมอบเสื้อผ้าถึงมือคุณไม่สร้างผลกระทบต่อสิ่งแวดล้อม
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                14-Day Boutique Returns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Section: Curated for You ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-32 border-t border-[#F2E9DC] pt-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#4A543C]">Curated for You</h2>
            <p className="text-xs text-[#8B8B88] mt-2">Similar silhouettes from the Re-Wear archive.</p>
          </div>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-[#2D2D2A] border-b border-[#2D2D2A] pb-0.5 hover:text-[#5F6B4E] hover:border-[#5F6B4E] transition-colors">
            View Collection
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedProducts.map((p) => (
            <Link href={`/product/${p.id}`} key={p.id} className="group cursor-pointer">
              <div className="relative aspect-square bg-[#EAE5DB]/40 rounded-3xl overflow-hidden mb-4">
                <Image 
                  src={p.image || '/images/products/rw_item_01.jpg'} 
                  alt={p.title || p.name || 'Product'} 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                />
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#4A543C] group-hover:text-[#5F6B4E] transition-colors line-clamp-1">{p.title || p.name}</h3>
              <p className="font-serif text-sm font-bold text-[#8B6B57] mt-1">THB {p.price}.00</p>
            </Link>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
