"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ShieldAlert, Cpu, Heart, ShoppingBag, User } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import AuthModal from './AuthModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { currentUser, isAuthModalOpen, authModalView, openAuthModal, closeAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);
  const megaMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems, toggleCart } = useCart();
  const { favorites } = useFavorites();
  const { settings } = useSettings();

  const isActive = (path) => pathname === path;

  // Close search/mega-menu when clicking outside
  useEffect(() => {
    const stored = localStorage.getItem('reWearRecentSearches');
    if (stored) {
      try { setRecentSearches(JSON.parse(stored)); } catch (e) {}
    }

    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setActiveMegaMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch real products for search suggestions
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products for Navbar search', err);
      }
    };
    fetchProducts();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const updatedSearches = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('reWearRecentSearches', JSON.stringify(updatedSearches));
      
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setIsSearchFocused(false);
      setSearchQuery('');
    }
  };

  const searchResults = searchQuery.trim() 
    ? products.filter(p => 
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.brandCategory && p.brandCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  // All roles see the same customer-facing navigation
  const getNavLinks = () => {
    return [
      { name: 'NEW', path: '/search?q=New' },
      { 
        name: 'CLOTHING', 
        path: '#',
        hasMegaMenu: true,
        megaMenuData: {
          items: [
            { name: 'Skirts', path: '/search?q=Skirts&cat=CLOTHING' },
            { name: 'Dresses', path: '/search?q=Dresses&cat=CLOTHING' },
            { name: 'T-shirts & Tops', path: '/search?q=Tops&cat=CLOTHING' },
            { name: 'Pants & Jeans', path: '/search?q=Pants&cat=CLOTHING' },
            { name: 'Outerwear', path: '/search?q=Outerwear&cat=CLOTHING' },
          ]
        }
      },
      { 
        name: 'ACCESSORIES', 
        path: '#',
        hasMegaMenu: true,
        megaMenuData: {
          items: [
            { name: 'Necklaces', path: '/search?q=Necklaces&cat=ACCESSORIES' },
            { name: 'Earrings', path: '/search?q=Earrings&cat=ACCESSORIES' },
            { name: 'Bracelets', path: '/search?q=Bracelets&cat=ACCESSORIES' },
            { name: 'Rings', path: '/search?q=Rings&cat=ACCESSORIES' },
            { name: 'Handbags', path: '/search?q=Handbags&cat=ACCESSORIES' },
          ]
        }
      },
      { 
        name: 'SALE', 
        path: '#',
        hasMegaMenu: true,
        megaMenuData: {
          items: [
            { name: '10% OFF', path: '/search?q=10%25%20OFF&cat=SALE' },
            { name: '20% OFF', path: '/search?q=20%25%20OFF&cat=SALE' },
            { name: '30% OFF', path: '/search?q=30%25%20OFF&cat=SALE' },
            { name: '50% OFF', path: '/search?q=50%25%20OFF&cat=SALE' },
            { name: '70% OFF', path: '/search?q=70%25%20OFF&cat=SALE' },
          ]
        }
      },
      { name: 'SUPPORT', path: '/support' },
      ...(currentUser ? [{ name: 'ECO IMPACT', path: '/eco-impact' }] : []),
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#EAE5DB]">


      {/* Main Header */}
      <div className="w-full px-6 md:px-12 lg:px-16 relative">
        <div className="flex justify-between h-[80px] items-center">
          
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex-1 flex items-center justify-start space-x-4">
            <Link href="/" className="md:hidden flex items-baseline hover:opacity-90 transition-opacity">
              <span className="font-serif text-3xl font-bold text-[#2D2D2A] tracking-tight">
                {settings?.storeName ? settings.storeName.split('-')[0] + (settings.storeName.includes('-') ? '-' : '') : 'Re-'}
              </span>
              <span className="font-serif text-3xl font-bold text-[#5F6B4E] tracking-tight">
                {settings?.storeName ? settings.storeName.substring(settings.storeName.indexOf('-') + 1) : 'wear'}
              </span>
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#2D2D2A] focus:outline-none p-1">
              {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            </button>
          </div>

          {/* Center: Logo (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <Link href="/" className="flex items-baseline hover:opacity-90 transition-opacity">
              <span className="font-serif text-4xl font-bold text-[#2D2D2A] tracking-tight">
                {settings?.storeName ? settings.storeName.split('-')[0] + (settings.storeName.includes('-') ? '-' : '') : 'Re-'}
              </span>
              <span className="font-serif text-4xl font-bold text-[#5F6B4E] tracking-tight">
                {settings?.storeName ? settings.storeName.substring(settings.storeName.indexOf('-') + 1) : 'wear'}
              </span>
            </Link>
          </div>

          {/* Right: Icons & Search (Desktop) */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-6">
            
            {/* Search Icon / Input */}
            <form className="relative flex items-center" ref={searchRef} onSubmit={handleSearchSubmit}>
              <div className="flex items-center bg-[#F5F5F5] rounded-md px-3 py-2 w-48 transition-colors border border-transparent focus-within:border-[#EAE5DB]">
                <Search className="h-4 w-4 text-[#5C5C5A] shrink-0" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent focus:outline-none text-[13px] text-[#2D2D2A] placeholder-[#8B8B88] pl-3"
                />
              </div>

              {/* Search Dropdown */}
              {isSearchFocused && (searchQuery || recentSearches.length > 0) && (
                <div className="absolute top-full mt-4 w-72 right-0 bg-white border border-[#EAE5DB] rounded-2xl shadow-2xl overflow-hidden z-50">
                  {searchQuery.trim() ? (
                    searchResults.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto p-2">
                        <div className="px-3 py-2 text-[9px] font-bold text-[#8B8B88] uppercase tracking-widest border-b border-[#EAE5DB] mb-1">
                          Matches
                        </div>
                        {searchResults.map(p => (
                          <Link 
                            key={p.id} 
                            href={`/product/${p.id}`}
                            onClick={() => { setIsSearchFocused(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 p-2 hover:bg-[#F9F8F6] rounded-xl transition-colors group"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#E8E8F2]">
                              <Image src={p.image || '/placeholder.png'} alt={p.title || p.name || 'Product'} fill sizes="40px" className="object-cover mix-blend-multiply" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#2D2D2A] line-clamp-1 group-hover:text-[#4A543C]">{p.title || p.name}</p>
                              <p className="text-[10px] text-[#C57B57] font-bold">THB {p.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-[#8B8B88]">
                        No pieces found for "{searchQuery}"
                      </div>
                    )
                  ) : (
                    recentSearches.length > 0 && (
                      <div className="p-2">
                        <div className="px-3 py-2 text-[9px] font-bold text-[#8B8B88] uppercase tracking-widest border-b border-[#EAE5DB] mb-1 flex justify-between items-center">
                          <span>Recent Searches</span>
                          <button 
                            type="button" 
                            onMouseDown={(e) => { e.preventDefault(); setRecentSearches([]); localStorage.removeItem('reWearRecentSearches'); }} 
                            className="hover:text-[#C57B57]"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((term, i) => (
                          <button 
                            key={i}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(term);
                              router.push(`/search?q=${encodeURIComponent(term)}`);
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left flex items-center gap-3 p-3 hover:bg-[#F9F8F6] rounded-xl transition-colors text-xs font-semibold text-[#2D2D2A]"
                          >
                            <Search className="h-3.5 w-3.5 text-[#8B8B88]" />
                            {term}
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </form>

            {/* Wishlist Icon */}
            <Link href="/wardrobe" className="p-1 text-[#2D2D2A] hover:text-[#C57B57] transition-colors focus:outline-none relative">
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#C57B57] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            {currentUser?.role === 'customer' ? (
              <button onClick={toggleCart} className="p-1 text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors relative focus:outline-none">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-[#C57B57] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
            ) : currentUser ? null : (
              <button onClick={() => openAuthModal('login')} className="p-1 text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors" title="Login to view cart">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}

            {/* Profile Icon / Avatar */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-7 h-7 rounded-full overflow-hidden border border-[#EAE5DB] hover:ring-2 hover:ring-[#5F6B4E]/30 transition-all focus:outline-none relative bg-gray-100 flex items-center justify-center"
                >
                  {currentUser?.avatar || currentUser?.picture ? (
                    <img 
                      src={currentUser.avatar || currentUser.picture} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#EAE5DB] flex items-center justify-center text-xs font-bold text-[#2D2D2A] uppercase">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
                <ProfileDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} currentUser={currentUser} />
              </div>
            ) : (
              <button onClick={() => openAuthModal('login')} className="p-1 text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors focus:outline-none" title="Login / Register">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Tier 3: Category Links */}
      <div className="hidden md:flex w-full justify-center items-center border-t border-[#EAE5DB] relative z-40" ref={megaMenuRef}>
        <div className="flex space-x-12 relative">
          {navLinks.map((link, index) => {
            if (link.hasMegaMenu) {
              return (
                <div key={index}>
                  <button
                    onClick={() => setActiveMegaMenu(activeMegaMenu === link.name ? null : link.name)}
                    className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors py-4 focus:outline-none ${
                      activeMegaMenu === link.name ? 'text-[#C57B57]' : 'text-[#2D2D2A] hover:text-[#5F6B4E]'
                    }`}
                  >
                    {link.name}
                  </button>

                  {/* Mega Menu Dropdown */}
                  {activeMegaMenu === link.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[400px] bg-white border border-[#EAE5DB] shadow-2xl z-50 animate-fade-in origin-top mt-0">
                      <div className="p-10 flex justify-center">
                        <div className="space-y-4 min-w-[200px]">
                          <h3 className="text-sm font-bold text-[#2D2D2A] uppercase tracking-widest border-b border-[#EAE5DB] pb-3">{link.name} Categories</h3>
                          <ul className="space-y-3">
                            {link.megaMenuData.items.map((item, idx) => (
                              <li key={idx}>
                                <Link 
                                  href={item.path} 
                                  onClick={() => setActiveMegaMenu(null)} 
                                  className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={link.path}
                className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors py-4 ${
                  isActive(link.path) && link.path !== '#'
                    ? 'text-[#C57B57]' 
                    : 'text-[#2D2D2A] hover:text-[#5F6B4E]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-white border-t border-[#EAE5DB] absolute w-full h-[calc(100vh-100px)] overflow-y-auto">
          <div className="px-6 pt-6 pb-20 space-y-6 font-sans">
            <form className="relative" onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B8B88]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#F9F8F6] border border-[#EAE5DB] focus:border-[#2D2D2A] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-[13px] text-[#2D2D2A]"
              />
            </form>

            <div className="space-y-4">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path === '#' ? '/' : link.path}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-xl font-serif font-bold text-[#2D2D2A] hover:text-[#5F6B4E]"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <hr className="border-[#EAE5DB]" />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B88]">Account</span>
              {currentUser ? (
                <button onClick={() => { setIsOpen(false); setIsDropdownOpen(true); }} className="w-8 h-8 rounded-full overflow-hidden border border-[#EAE5DB] relative bg-gray-100 flex items-center justify-center">
                  {currentUser.picture ? (
                    <Image src={currentUser.picture} alt="Avatar" fill sizes="32px" className="object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ) : (
                <button onClick={() => { setIsOpen(false); openAuthModal('login'); }} className="text-[13px] font-bold text-[#2D2D2A] flex items-center gap-2 border border-[#EAE5DB] px-4 py-2 rounded-full">
                  <User className="h-4 w-4" /> Log In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        initialView={authModalView} 
      />
    </nav>
  );
}
