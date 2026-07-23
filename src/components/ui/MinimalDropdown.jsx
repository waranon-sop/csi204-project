import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function MinimalDropdown({ value, onChange, options, placeholder, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`w-full p-3 bg-white border border-[#EAE5DB] rounded text-sm flex items-center justify-between cursor-pointer transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-[#FCFBF9]' : 'hover:border-[#C57B57]'
        } ${isOpen ? 'border-[#C57B57] ring-1 ring-[#C57B57] ring-opacity-20' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-[#2D2D2A]' : 'text-[#8B8B88]'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#8B8B88] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#EAE5DB] rounded-md shadow-lg max-h-60 overflow-auto py-1 minimal-scrollbar">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-[#FAF6F0] transition-colors ${
                  value === option ? 'text-[#C57B57] font-medium bg-[#FAF6F0]' : 'text-[#2D2D2A]'
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
                {value === option && <Check className="w-4 h-4" />}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-[#8B8B88]">ไม่มีตัวเลือก</div>
          )}
        </div>
      )}
    </div>
  );
}
