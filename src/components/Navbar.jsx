import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShieldAlert, Cpu } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ currentUser = { name: 'Alex Rivers', role: 'customer' } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Determine navigation menu links dynamically based on user role (SAD Design)
  const getNavLinks = () => {
    switch (currentUser?.role) {
      case 'staff':
        return [
          { name: 'Quality Queue (คัดเกรดเสื้อผ้า)', path: '/wardrobe' },
          { name: 'Orders Dispatch (คิวจัดส่งพัสดุ)', path: '/orders' },
          { name: 'Restoration Queue (ซ่อมแซมผ้า)', path: '#' },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard (สรุปสถิติร้าน)', path: '/eco-impact' },
          { name: 'User Roles (จัดการบทบาทบัญชี)', path: '/profile' },
          { name: 'System Settings (ตั้งค่าระบบ)', path: '/payment' },
        ];
      case 'customer':
      default:
        return [
          { name: 'Shop', path: '/' },
          { name: 'About', path: '#' },
          { name: 'Sustainability', path: '/eco-impact' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF8F5] border-b border-[#F2E9DC]">
      {/* Role Indicator Banner (for Staff / Admin UI feedback) */}
      {currentUser && currentUser.role !== 'customer' && (
        <div className={`py-1.5 px-6 text-center text-[10px] font-bold text-white tracking-widest flex items-center justify-center gap-1.5 ${
          currentUser.role === 'admin' ? 'bg-[#2D2D2A]' : 'bg-[#C57B57]'
        }`}>
          {currentUser.role === 'admin' ? (
            <>
              <ShieldAlert className="h-3 w-3" />
              ADMIN CONSOLE (มุมมองผู้ดูแลระบบ) • บัญชีผู้ใช้งาน: {currentUser.name}
            </>
          ) : (
            <>
              <Cpu className="h-3 w-3" />
              STAFF PANEL (มุมมองพนักงานร้าน) • บัญชีผู้ใช้งาน: {currentUser.name}
            </>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo - Serif Font Eb Garamond */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="font-serif text-2xl font-semibold text-[#2D2D2A] tracking-tight hover:opacity-90 transition-opacity">
              Re-Wear
            </Link>
          </div>

          {/* Desktop Menu - Dynamically loaded links based on currentUser.role */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link, index) => {
              const isExternal = link.path === '#';
              const LinkComponent = isExternal ? 'a' : Link;
              const linkProps = isExternal ? { href: '#' } : { to: link.path };
              return (
                <LinkComponent
                  key={index}
                  {...linkProps}
                  className={`text-sm font-semibold tracking-wide transition-all pb-1 font-sans ${
                    isActive(link.path) && link.path !== '#'
                      ? 'text-[#2D2D2A] border-b-2 border-[#2D2D2A]' 
                      : 'text-[#8B8B88] hover:text-[#2D2D2A]'
                  }`}
                >
                  {link.name}
                </LinkComponent>
              );
            })}
          </div>

          {/* Desktop Search & Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B88]" />
              <input
                type="text"
                placeholder="Search unique pieces..."
                className="w-56 bg-[#F2E9DC] border border-[#F2E9DC] hover:border-[#E2D5C4] focus:border-[#2D2D2A] focus:bg-[#FAF8F5] focus:outline-none rounded-full py-1.5 pl-10 pr-4 text-xs text-[#2D2D2A] transition-all placeholder:text-[#8B8B88] font-sans"
              />
            </div>

            {/* Shopping Cart Icon (Only relevant for Customer) */}
            {currentUser?.role === 'customer' && (
              <Link to="/wardrobe" className="text-[#2D2D2A] hover:text-[#5F6B4E] transition-colors relative">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-[#5F6B4E] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">0</span>
              </Link>
            )}

            {/* Profile Avatar Trigger or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-7 h-7 rounded-full overflow-hidden border border-[#F2E9DC] hover:ring-2 hover:ring-[#5F6B4E]/30 transition-all focus:outline-none"
                >
                  <img 
                    src={
                      currentUser.role === 'admin'
                        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' // Man avatar for Admin
                        : currentUser.role === 'staff'
                          ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100' // Staff avatar
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' // Alex (Customer)
                    } 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </button>
                
                <ProfileDropdown 
                  isOpen={isDropdownOpen} 
                  onClose={() => setIsDropdownOpen(false)} 
                  currentUser={currentUser}
                />
              </div>
            ) : (
              <Link 
                to="/login"
                className="py-2 px-4 rounded-full bg-[#2D2D2A] text-white text-xs font-semibold hover:bg-[#4A533D] transition-colors"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#2D2D2A] focus:outline-none p-1"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-[#FAF8F5] border-t border-[#F2E9DC]">
          <div className="px-4 pt-3 pb-6 space-y-3 font-sans">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B88]" />
              <input
                type="text"
                placeholder="Search unique pieces..."
                className="w-full bg-[#F2E9DC] border border-[#F2E9DC] focus:border-[#2D2D2A] focus:outline-none rounded-full py-1.5 pl-10 pr-4 text-xs text-[#2D2D2A]"
              />
            </div>

            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isActive(link.path) && link.path !== '#' ? 'bg-[#F2E9DC]/40 text-[#2D2D2A]' : 'text-[#8B8B88]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <hr className="border-[#F2E9DC]" />

            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-xs text-[#8B8B88]">Account Actions</span>
              {currentUser ? (
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setIsDropdownOpen(true);
                  }}
                  className="w-8 h-8 rounded-full overflow-hidden border border-[#F2E9DC]"
                >
                  <img 
                    src={
                      currentUser.role === 'admin'
                        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
                        : currentUser.role === 'staff'
                          ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100'
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
                    } 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-1.5 px-4 rounded-full bg-[#2D2D2A] text-white text-[10px] font-semibold"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
