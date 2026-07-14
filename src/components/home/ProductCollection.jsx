"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import QuickViewModal from './QuickViewModal';
import { useCart } from '../../context/CartContext';
import { useCurrentUser } from '../../context/UserContext';
import { getProducts } from '../../utils/localStorageHelper';

const FILTERS = ['All Pieces', 'Vintage Denim', 'Y2K Shirts', 'Jackets'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function ProductCollection() {
  const [activeFilter, setActiveFilter] = useState('All Pieces');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    setProducts(getProducts());
    const handleUpdate = () => setProducts(getProducts());
    window.addEventListener('productsUpdated', handleUpdate);
    return () => window.removeEventListener('productsUpdated', handleUpdate);
  }, []);

  const filteredProducts = useMemo(() => {
    const visibleProducts = products.filter(p => p.status !== 'Sold Out' && p.status !== 'Hidden');
    if (activeFilter === 'All Pieces') return visibleProducts;
    return visibleProducts.filter((p) => p.category === activeFilter);
  }, [activeFilter, products]);

  return (
    <>
      <section id="collection" className="max-w-7xl mx-auto px-6 sm:px-8 py-20 space-y-10 animate-fade-up delay-100 bg-[#F9F8F6]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#2D2D2A]">Recommended for You</h2>
            <p className="text-[13px] text-[#5C5C5A] mt-2 font-sans font-medium">Based on your interest in sustainable high-end fashion.</p>
          </div>

          <Link href="/products" className="text-[#8E5133] hover:text-[#C57B57] text-xs font-bold tracking-wide transition flex items-center gap-2 group">
            View All New Arrivals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
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
          {filteredProducts.slice(0,4).map((product) => (
            <motion.div key={product.id} variants={itemVariants} className="flex flex-col space-y-4 group relative bg-white p-4 rounded-3xl shadow-sm border border-[#EAE5DB]/50">
              <Link href={`/product/${product.id}`} className="relative aspect-square rounded-2xl overflow-hidden bg-lavender block cursor-pointer">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 ease-in-out mix-blend-multiply"
                />

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
                  <Link href={`/product/${product.id}`} className="block max-w-[70%]">
                    <h3 className="font-serif font-bold text-[17px] text-[#2D2D2A] leading-snug group-hover:text-[#5F6B4E] transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                <div className="flex flex-col items-end">
                  {product.originalPrice && (
                    <span className="text-[10px] text-[#8B8B88] line-through font-medium leading-none mb-0.5">
                      ${product.originalPrice}
                    </span>
                  )}
                  <span className={`font-sans font-bold text-[14px] ${product.originalPrice ? 'text-[#D03C31]' : 'text-[#2D2D2A]'}`}>
                    ${product.price}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (currentUser?.role === 'customer') {
                    if (product.status === 'Available') {
                      addToCart(product);
                    }
                  } else {
                    router.push('/login');
                  }
                }}
                disabled={product.status === 'Reserved'}
                className={`w-full font-semibold text-[11px] py-3 rounded-xl flex justify-center items-center gap-2 transition-all mt-2 ${
                  product.status === 'Reserved' 
                    ? 'bg-[#EAE5DB] text-[#A0A09F] cursor-not-allowed' 
                    : 'bg-[#5F6B4E] text-white hover:bg-[#4A543C] shadow-sm'
                }`}
              >
                {product.status === 'Reserved' ? 'ติดจอง' : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
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
            <h2 className="font-serif text-3xl font-bold text-[#2D2D2A]">Staff Styling</h2>
            <p className="text-[13px] text-[#5C5C5A] mt-2 font-sans font-medium">Inspiration and mix-and-match ideas from our team.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Style 1 */}
            <div className="group cursor-pointer space-y-4">
              <div className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-[#E8E8F2]">
                <Image src="/styling_1.png" alt="Staff Styling 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D2D2A]">The Weekend Archive</h3>
                <p className="text-[13px] text-[#8B8B88] mt-1">Vintage high-waisted denim paired with a minimalist silk blouse.</p>
                <span className="inline-block mt-3 text-xs font-bold text-[#2D2D2A] border-b border-[#2D2D2A] pb-0.5 group-hover:text-[#5F6B4E] group-hover:border-[#5F6B4E] transition-colors">
                  Shop the Look
                </span>
              </div>
            </div>

            {/* Style 2 */}
            <div className="group cursor-pointer space-y-4">
              <div className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-[#E8E8F2]">
                <Image src="/styling_2.png" alt="Staff Styling 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D2D2A]">Studio Workwear</h3>
                <p className="text-[13px] text-[#8B8B88] mt-1">Upcycled chore jacket with relaxed corduroy trousers for a creative workday.</p>
                <span className="inline-block mt-3 text-xs font-bold text-[#2D2D2A] border-b border-[#2D2D2A] pb-0.5 group-hover:text-[#5F6B4E] group-hover:border-[#5F6B4E] transition-colors">
                  Shop the Look
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuickViewModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </>
  );
}

