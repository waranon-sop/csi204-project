"use client";

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { getProducts } from '../../utils/localStorageHelper';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat');
  const exactCategory = searchParams.get('exactCategory');
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [openFilter, setOpenFilter] = React.useState(null);
  const [selectedSpecs, setSelectedSpecs] = React.useState([]);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    getProducts().then(setProducts);
    const handleUpdate = () => getProducts().then(setProducts);
    window.addEventListener("productsUpdated", handleUpdate);
    return () => window.removeEventListener("productsUpdated", handleUpdate);
  }, []);

  const searchResults = useMemo(() => {
    // Filter out items that shouldn't be visible to customers
    let results = products.filter(p => 
      p.status !== "Sold Out" && 
      p.status !== "Hidden" && 
      p.status !== "Archived" && 
      p.status !== "Draft"
    );

    if (exactCategory) {
      results = results.filter(p => p.category === exactCategory);
    } else if (category === 'ACCESSORIES') {
      const accessoriesCats = ['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Handbags'];
      results = results.filter(p => accessoriesCats.includes(p.category));
    } else if (category === 'CLOTHING') {
      const accessoriesCats = ['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Handbags'];
      results = results.filter(p => !accessoriesCats.includes(p.category));
    }
    
    if (query && query.toLowerCase() !== 'all items') {
      const q = query.toLowerCase();
      
      if (category === 'SALE' && q.includes('% off')) {
        const percentMatch = q.match(/(\d+)%\s*off/);
        if (percentMatch) {
          const discountRequired = parseInt(percentMatch[1], 10);
          results = results.filter(p => {
            if (!p.originalPrice || p.originalPrice <= p.price) return false;
            const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
            return discount >= discountRequired;
          });
        }
      } else if (category === 'SALE' && q === 'sale') {
        results = results.filter(p => p.originalPrice && p.originalPrice > p.price);
      } else {
        const matched = results.filter(p =>
          (p.title || p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.brandCategory || p.brand || '').toLowerCase().includes(q)
        );
        // fallback to all if no match so the user can see mock results
        if (matched.length > 0) results = matched;
      }
    } else if (category === 'SALE') {
      results = results.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    if (selectedSpecs.length > 0) {
      results = results.filter(p => {
        const pStr = JSON.stringify(p).toLowerCase();
        return selectedSpecs.some(spec => {
          const cleanSpec = spec.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanSpec.length > 1 ? pStr.includes(cleanSpec) : pStr.includes(`"${cleanSpec}"`);
        });
      });
    }

    return results;
  }, [query, exactCategory, category, selectedSpecs, products]);

  const toggleSpec = (spec) => {
    setSelectedSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const getFilterOptions = () => {
    if (query.toLowerCase() === 'new' || category === 'NEW') return [];

    if (category === 'SALE' || query.toLowerCase() === 'sale') {
      return [
        { id: 'price', label: 'Price', options: [
          {name:'ต่ำกว่า ฿500'}, {name:'฿500 - ฿1,000'}, {name:'฿1,000 - ฿2,000'}, 
          {name:'฿2,000 - ฿3,000'}, {name:'มากกว่า ฿3,000'}
        ]}
      ];
    }

    if (category === 'CLOTHING') {
      return [
        { id: 'size', label: 'Size', options: [{name:'S'}, {name:'M'}, {name:'L'}, {name:'XL'}] },
        { id: 'color', label: 'Color', isColor: true, options: [
          {name:'Black',hex:'#1A1A1A'}, {name:'White',hex:'#FFFFFF'}, {name:'Gray',hex:'#808080'},
          {name:'Beige',hex:'#E0D8C8'}, {name:'Brown',hex:'#7A5C43'}, {name:'Red',hex:'#D93838'},
          {name:'Blue',hex:'#2A5C91'}, {name:'Green',hex:'#3B7346'}, {name:'Yellow',hex:'#F0C94F'},
          {name:'Pink',hex:'#E8A0B3'}
        ] },
        { id: 'price', label: 'Price', options: [{name:'Under ฿500'}, {name:'฿500 - ฿1000'}, {name:'Over ฿1000'}] }
      ];
    } else if (category === 'ACCESSORIES') {
      let materials = [{name:'Silver'}, {name:'Brass'}, {name:'Leather'}];
      const q = query.toLowerCase();
      if (['ring', 'bracelet', 'earring', 'necklace', 'rings', 'bracelets', 'earrings', 'necklaces'].some(item => q.includes(item))) {
        materials = [{name:'Silver'}, {name:'Brass'}];
      }
      return [
        { id: 'material', label: 'Material', options: materials },
        { id: 'price', label: 'Price', options: [{name:'Under ฿500'}, {name:'฿500 - ฿1000'}, {name:'Over ฿1000'}] }
      ];
    }
    return [
        { id: 'color', label: 'Color', isColor: true, options: [{name:'Black',hex:'#1A1A1A'}, {name:'White',hex:'#FFFFFF'}, {name:'Beige',hex:'#E0D8C8'}] },
        { id: 'price', label: 'Price', options: [{name:'Under ฿500'}, {name:'฿500 - ฿1000'}, {name:'Over ฿1000'}] }
    ];
  };

  const activeFilters = getFilterOptions();

  return (
    <div className="py-8 md:py-12 w-full px-6 md:px-12 lg:px-16 font-sans">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] font-medium text-[#5C5C5A] mb-8">
        <Link href="/" className="flex items-center gap-1 hover:text-[#2D2D2A] transition-colors">
          <span className="text-[14px]">{'<'}</span> กลับ หน้าหลัก
        </Link>
        <span className="mx-2">/</span>
        <span className="uppercase">{category || 'SEARCH'}</span>
        <span className="mx-2">/</span>
        <span className="capitalize">{exactCategory || query || 'All Items'}</span>
      </div>

      {/* Page Title & Results Count */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-xl md:text-2xl text-[#2D2D2A] capitalize font-medium tracking-wide">
          {exactCategory || query || category || 'All Items'}
        </h1>
        <span className="text-[12px] text-[#5C5C5A] font-medium tracking-wide">
          {searchResults.length} ผลลัพธ์
        </span>
      </div>

      {/* Filter Bar */}
      {activeFilters.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-[#EAE5DB] bg-white relative z-40">
            <div className="flex items-center h-14 w-full md:w-auto flex-1">
              <div className="px-6 h-full flex items-center border-r border-[#EAE5DB] shrink-0">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2D2D2A]">FILTERS</span>
              </div>
              {activeFilters.map(filter => {
                const selectedCount = filter.options.filter(o => selectedSpecs.includes(o.name)).length;
                return (
                <div key={filter.id} className="relative h-full flex">
                  <button 
                    onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
                    className={`px-6 h-full flex items-center gap-2 text-[13px] font-medium transition-colors border-r border-[#EAE5DB] shrink-0 ${openFilter === filter.id || selectedCount > 0 ? 'bg-[#2D2D2A] text-white' : 'text-[#5C5C5A] hover:text-[#2D2D2A] hover:bg-[#F9F8F6]'}`}
                  >
                    {filter.label}
                    {selectedCount > 0 && (
                      <span className="flex items-center justify-center w-4 h-4 ml-1 text-[10px] bg-white text-[#2D2D2A] rounded-full font-bold">
                        {selectedCount}
                      </span>
                    )}
                    <svg className={`w-3.5 h-3.5 transition-transform ${openFilter === filter.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFilter === filter.id && (
                    <div className="absolute top-full left-0 w-48 bg-white border border-[#EAE5DB] border-t-0 shadow-lg z-50 py-2 normal-case tracking-normal font-normal">
                      {filter.options.map(opt => (
                        <label key={opt.name} className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9F8F6] cursor-pointer">
                          <div className="relative flex items-center justify-center shrink-0">
                            <input type="checkbox" checked={selectedSpecs.includes(opt.name)} onChange={() => toggleSpec(opt.name)} className="peer appearance-none w-4 h-4 border border-[#D1D1D1] rounded-sm checked:bg-[#2D2D2A] checked:border-[#2D2D2A] cursor-pointer transition-colors" />
                            <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {filter.isColor && (
                            <div className="w-3 h-3 rounded-full border border-[#D1D1D1] shrink-0" style={{ backgroundColor: opt.hex }}></div>
                          )}
                          <span className="text-[13px] text-[#2D2D2A]">{opt.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </div>
      )}

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {searchResults.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col space-y-4 group relative bg-white p-4 rounded-3xl shadow-sm border border-[#EAE5DB]/50"
            >
              <Link href={`/product/${product.id}`} className="relative aspect-[3/4] sm:aspect-square rounded-2xl overflow-hidden bg-[#F9F8F6] block cursor-pointer">
                <Image
                  src={product.image || '/images/products/rw_item_01.jpg'}
                  alt={product.title || product.name || 'Product'}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 ease-in-out mix-blend-multiply"
                />
              </Link>
              
              <div className="flex justify-between items-start pt-1 font-sans px-1">
                <Link href={`/product/${product.id}`} className="block max-w-[70%]">
                  <h3 className="font-serif font-bold text-[15px] sm:text-[17px] text-[#2D2D2A] leading-snug group-hover:text-[#5F6B4E] transition-colors">
                    {product.title || product.name || 'Untitled Product'}
                  </h3>
                  <div className="text-[10px] sm:text-[11px] text-[#8B8B88] mt-1">{product.brandCategory || product.brand || "Re-Wear"}</div>
                </Link>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-sans font-bold text-[13px] sm:text-[14px] text-[#2D2D2A]">
                    THB {product.price}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 md:py-40 min-h-[50vh] bg-white border border-[#EAE5DB] rounded-3xl mt-8 shadow-sm">
          <div className="w-20 h-20 bg-[#F9F8F6] rounded-full flex items-center justify-center text-[#2D2D2A] mb-6">
            <SearchIcon className="h-8 w-8 opacity-60" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2A] mb-3">No pieces found</h3>
          <p className="text-[#5C5C5A] text-sm md:text-base max-w-md text-center mb-8 leading-relaxed">
            We couldn't find any items matching "{query}". Try adjusting your filters or explore our collections.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/search?cat=NEW" className="px-6 py-2.5 bg-[#2D2D2A] text-white text-xs font-bold tracking-widest uppercase rounded-full hover:bg-[#1A1A1A] transition-colors">
              New Arrivals
            </Link>
            <Link href="/search?cat=CLOTHING" className="px-6 py-2.5 bg-white border border-[#EAE5DB] text-[#2D2D2A] text-xs font-bold tracking-widest uppercase rounded-full hover:border-[#2D2D2A] transition-colors">
              Clothing
            </Link>
            <Link href="/search?cat=ACCESSORIES" className="px-6 py-2.5 bg-white border border-[#EAE5DB] text-[#2D2D2A] text-xs font-bold tracking-widest uppercase rounded-full hover:border-[#2D2D2A] transition-colors">
              Accessories
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[#8B8B88]">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
