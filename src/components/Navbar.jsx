"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ShieldAlert, Cpu, Heart, ShoppingBag, User } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { mockProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useCurrentUser } from '../context/UserContext';

export default function Navbar() {
  const { currentUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const megaMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems, toggleCart } = useCart();

  const isActive = (path) => pathname === path;

  // Close search/mega-menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setSearchQuery('');
    }
  };

  const searchResults = searchQuery.trim() 
    ? mockProducts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brandCategory.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  // Determine navigation menu links dynamically based on user role
  const getNavLinks = () => {
    switch (currentUser?.role) {
      case 'staff':
        return [
          { name: 'Quality Queue', path: '/wardrobe' },
          { name: 'Orders Dispatch', path: '/orders' },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard', path: '/eco-impact' },
          { name: 'User Roles', path: '/profile' },
          { name: 'System Settings', path: '/payment' },
        ];
      case 'customer':
      default:
        return [
          { 
            name: 'Shop', 
            path: '#',
            hasMegaMenu: true,
          },
          { name: 'Sustainability', path: currentUser ? '/eco-impact' : '/sustainability' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-[#F9F8F6] border-b border-[#EAE5DB]">
      {/* Role Indicator Banner */}
      {currentUser && currentUser.role !== 'customer' && (
        <div className={`py-1 px-6 text-center text-[9px] font-bold text-white tracking-widest flex items-center justify-center gap-1.5 ${
          currentUser.role === 'admin' ? 'bg-[#5F6B4E]' : 'bg-[#C57B57]'
        }`}>
          {currentUser.role === 'admin' ? (
            <>
              <ShieldAlert className="h-3 w-3" />
              ADMIN CONSOLE • {currentUser.name}
            </>
          ) : (
            <>
              <Cpu className="h-3 w-3" />
              STAFF PANEL • {currentUser.name}
            </>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative">
        <div className="flex justify-between h-[72px] items-center">
          
          {/* Left: Logo */}
          <div className="flex-1 md:flex-none flex items-center">
            <Link href="/" className="flex items-baseline hover:opacity-90 transition-opacity">
              <span className="font-serif text-3xl font-bold text-[#2D2D2A] tracking-tight">Re-</span>
              <span className="font-serif text-3xl font-bold text-[#5F6B4E] tracking-tight">wear</span>
            </Link>
          </div>

          {/* Center: Main Categories (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8" ref={megaMenuRef}>
            {navLinks.map((link, index) => {
              if (link.hasMegaMenu) {
                return (
                  <div key={index} className="h-full flex items-center">
                    <button
                      onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                      className={`text-[13px] font-bold tracking-widest uppercase transition-colors py-6 ${
                        isMegaMenuOpen ? 'text-[#C57B57]' : 'text-[#2D2D2A] hover:text-[#5F6B4E]'
                      }`}
                    >
                      {link.name}
                    </button>
                    
                    {/* Mega Menu Dropdown */}
                    {isMegaMenuOpen && (
                      <div className="absolute top-full left-0 w-full bg-white border-t border-[#EAE5DB] shadow-2xl z-50 animate-fade-in origin-top">
                        <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-4 gap-8">
                          {/* Column 1 */}
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-[#2D2D2A] uppercase tracking-widest border-b border-[#EAE5DB] pb-2">Categories</h3>
                            <ul className="space-y-3">
                              <li><Link href="/" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#2D2D2A] font-bold hover:text-[#C57B57] transition-colors">Just In</Link></li>
                              <li><Link href="/search?q=Vintage%20Denim" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">Vintage Denim</Link></li>
                              <li><Link href="/search?q=Y2K%20Shirts" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">Y2K Tops & Shirts</Link></li>
                              <li><Link href="/search?q=Jackets" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">Outerwear & Jackets</Link></li>
                              <li><Link href="/" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">All Clothing</Link></li>
                            </ul>
                          </div>
                          {/* Column 2 */}
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-[#2D2D2A] uppercase tracking-widest border-b border-[#EAE5DB] pb-2">Collections</h3>
                            <ul className="space-y-3">
                              <li><Link href="/" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">Winter Warmers</Link></li>
                              <li><Link href="/" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">Workwear Archives</Link></li>
                              <li><Link href="/" onClick={() => setIsMegaMenuOpen(false)} className="text-[13px] text-[#5C5C5A] hover:text-[#C57B57] transition-colors">Rare Finds</Link></li>
                            </ul>
                          </div>
                          {/* Image Promo */}
                          <div className="col-span-2 relative aspect-[21/9] rounded-xl overflow-hidden bg-[#E8E8F2] group cursor-pointer" onClick={() => { setIsMegaMenuOpen(false); router.push('/'); }}>
                            <Image src="/hero_folded_clothes.png" alt="Promo" fill className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-multiply" />
                            <div className="absolute inset-0 flex flex-col justify-center p-8 bg-gradient-to-r from-white/90 to-transparent">
                              <span className="text-[10px] font-bold text-[#C57B57] tracking-widest uppercase mb-1">New Arrivals</span>
                              <h4 className="text-xl font-serif font-bold text-[#2D2D2A]">Autumn Archive Collection</h4>
                              <span className="text-xs font-bold text-[#2D2D2A] mt-4 flex items-center gap-1 group-hover:text-[#5F6B4E]">Shop Now &rarr;</span>
                            </div>
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
                  className={`text-[13px] font-bold tracking-widest uppercase transition-colors py-6 ${
                    isActive(link.path) && link.path !== '#'
                      ? 'text-[#2D2D2A]' 
                      : 'text-[#2D2D2A] hover:text-[#5F6B4E]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Icons (Desktop) */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-6">
            
            {/* Search Icon / Input */}
            <form className="relative flex items-center" ref={searchRef} onSubmit={handleSearchSubmit}>
              <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSearchFocused ? 'w-56 border-b border-[#2D2D2A]' : 'w-6 border-b border-transparent'}`}>
                <button type="button" onClick={() => setIsSearchFocused(true)} className="p-1 focus:outline-none shrink-0">
                  <Search className="h-5 w-5 text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors" strokeWidth={1.5} />
                </button>
                <input
                  type="text"
                  placeholder="Search pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-transparent focus:outline-none text-xs text-[#2D2D2A] pl-2 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full mt-4 w-72 right-0 bg-white border border-[#EAE5DB] rounded-2xl shadow-2xl overflow-hidden z-50">
                  {searchResults.length > 0 ? (
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
                            <Image src={p.image} alt={p.title} fill sizes="40px" className="object-cover mix-blend-multiply" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#2D2D2A] line-clamp-1 group-hover:text-[#4A543C]">{p.title}</p>
                            <p className="text-[10px] text-[#C57B57] font-bold">${p.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[#8B8B88]">
                      No pieces found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Wishlist Icon */}
            <button className="p-1 text-[#2D2D2A] hover:text-[#C57B57] transition-colors focus:outline-none">
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </button>

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
              <Link href="/login" className="p-1 text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors" title="Login to view cart">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            )}

            {/* Profile Icon / Avatar */}
            {currentUser ? (
              <div className="relative pl-2">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-7 h-7 rounded-full overflow-hidden border border-[#EAE5DB] hover:ring-2 hover:ring-[#5F6B4E]/30 transition-all focus:outline-none relative"
                >
                  <Image 
                    src={
                      currentUser.role === 'admin'
                        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
                        : currentUser.role === 'staff'
                          ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100'
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
                    } 
                    alt="Avatar" 
                    fill
                    sizes="28px"
                    className="object-cover" 
                  />
                </button>
                <ProfileDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} currentUser={currentUser} />
              </div>
            ) : (
              <Link href="/login" className="p-1 pl-2 text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors" title="Login / Register">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden flex-1 justify-end items-center space-x-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#2D2D2A] focus:outline-none p-1">
              {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            </button>
          </div>
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
                <button onClick={() => { setIsOpen(false); setIsDropdownOpen(true); }} className="w-8 h-8 rounded-full overflow-hidden border border-[#EAE5DB] relative">
                  <Image 
                    src={currentUser.role === 'admin' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                    alt="Avatar" fill className="object-cover" 
                  />
                </button>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-[13px] font-bold text-[#2D2D2A] flex items-center gap-2 border border-[#EAE5DB] px-4 py-2 rounded-full">
                  <User className="h-4 w-4" /> Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
