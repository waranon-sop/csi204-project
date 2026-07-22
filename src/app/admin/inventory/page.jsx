'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, EyeOff, Package, AlertTriangle, X, ZoomIn, Download, Archive, ArchiveRestore, ArrowUpDown, ArrowUp, ArrowDown, Pipette, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';

const mockProducts = [
  {
    id: 'RW-29402', name: 'Vintage Linen Overcoat', brand: 'Unknown', category: 'Outerwear',
    price: 145, condition: 'Very Good', defects: 'No visible defects. Perfect condition.',
    size: 'M', chest: '100 cm', length: '100 cm', status: 'In Stock', hidden: false,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'RW-18239', name: 'Raw Silk Trousers', brand: 'Silk & Co.', category: 'Bottoms',
    price: 89, condition: 'Good', defects: 'Minor pull thread on right inner seam.',
    size: 'L', chest: '-', length: '102 cm', status: 'Available', hidden: false,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'RW-99201', name: 'Upcycled Denim Tote', brand: 'ReThread', category: 'Accessories',
    price: 45, condition: 'Like New', defects: 'Brand new, upcycled from surplus fabric.',
    size: 'OS', chest: '-', length: '-', status: 'In Stock', hidden: false,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'RW-00451', name: 'Recycled Cotton Sweater', brand: 'Patagonia', category: 'Tops',
    price: 115, condition: 'Good', defects: 'Small pilling on left sleeve cuff.',
    size: 'S', chest: '88 cm', length: '60 cm', status: 'Sold Out', hidden: false,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'
  },
];

const CONDITION_STYLE = {
  'Very Good': 'bg-[#EEF1EA] text-[#3A4A2D] border border-[#C2CBB8]',
  'Good':      'bg-[#FAF0EA] text-[#8E5133] border border-[#DFAB93]',
  'Acceptable':      'bg-amber-50 text-amber-700 border border-amber-200',
  'Like New':      'bg-blue-50 text-blue-700 border border-blue-200',
};

const STOCK_STYLE = {
  'Sold Out': 'text-red-500',
};

const STATUS_BADGE = {
  'Available':  { dot: 'bg-[#5F6B4E]',  text: 'text-[#3A4A2D]',  bg: 'bg-[#EEF1EA]',  label: 'Available' },
  'Sold Out':   { dot: 'bg-[#A84C43]',  text: 'text-[#A84C43]',  bg: 'bg-[#FCF5F3]',  label: 'Sold Out' },
  'Out of Stock':{ dot: 'bg-[#A84C43]', text: 'text-[#A84C43]',  bg: 'bg-[#FCF5F3]',  label: 'Sold Out' },
  'Reserved':   { dot: 'bg-[#9E7A2E]',  text: 'text-[#9E7A2E]',  bg: 'bg-[#FDF9F0]',  label: 'Reserved' },
  'Draft':      { dot: 'bg-earth-400',  text: 'text-earth-500',  bg: 'bg-earth-100',  label: 'Draft' },
};

const CustomDropdown = ({ value, onChange, options, placeholder, disabledOptions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 flex items-center justify-between transition-all"
      >
        <span className={value ? "text-earth-800" : "text-earth-500"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-earth-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-earth-200 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => {
            const isDisabled = disabledOptions.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (!isDisabled) {
                    onChange(option);
                    setIsOpen(false);
                  }
                }}
                disabled={isDisabled}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isDisabled ? 'text-earth-400 cursor-not-allowed' : value === option ? 'bg-earth-100 font-semibold text-earth-900' : 'text-earth-700 hover:bg-earth-50 hover:text-earth-900'}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState(['Skirts', 'Dresses', 'T-shirts & Tops', 'Pants & Jeans', 'Outerwear', 'Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Handbags']);
  const [sizes, setSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'OS']);
  const [newAttributeInput, setNewAttributeInput] = useState('');
  const [attributeTab, setAttributeTab] = useState('categories'); // 'categories' or 'sizes'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, metaRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/metadata')
        ]);
        const prodData = await prodRes.json();
        const metaData = await metaRes.json();
        
        setProducts(prodData);
        if (metaData.categories.length) setCategories(metaData.categories);
        if (metaData.sizes.length) setSizes(metaData.sizes);
      } catch (err) {
        console.error('Failed to fetch inventory data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProduct = async () => {
    let updatedProducts;
    
    if (!editingProduct.name?.trim() || editingProduct.price === undefined || editingProduct.price === '' || isNaN(editingProduct.price)) {
      addToast('Please provide a valid product name and price', 'error');
      return;
    }
    
    const productToSave = { ...editingProduct };

    // Auto-generate measurements string for display
    let measurementsArr = [];
    if (!productToSave.category || !['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Handbags'].includes(productToSave.category)) {
      if (productToSave.chest) measurementsArr.push(`Chest/Waist: ${productToSave.chest}`);
      if (productToSave.length) measurementsArr.push(`Length: ${productToSave.length}`);
    } else if (productToSave.category === 'Handbags') {
      if (productToSave.dimensions) measurementsArr.push(`Dimensions: ${productToSave.dimensions}`);
      if (productToSave.strapLength) measurementsArr.push(`Strap Length: ${productToSave.strapLength}`);
    } else {
      if (productToSave.jewelrySize) measurementsArr.push(`Size: ${productToSave.jewelrySize}`);
      if (productToSave.material) measurementsArr.push(`Material: ${productToSave.material}`);
    }
    productToSave.measurements = measurementsArr.length > 0 ? measurementsArr.join(', ') : 'Details: Not specified';

    try {
      if (productToSave.isNew) {
        delete productToSave.isNew;
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productToSave)
        });
        const newProduct = await res.json();
        updatedProducts = [newProduct, ...products];
        addToast('New product added successfully');
        addAdminNotification(currentUser?.name, 'Added a new product', newProduct.name, 'product');
      } else {
        await fetch(`/api/products/${productToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productToSave)
        });
        updatedProducts = products.map(p => p.id === productToSave.id ? productToSave : p);
        addToast('Product updated successfully');
        addAdminNotification(currentUser?.name, 'Updated product', productToSave.name, 'product');
      }
      setProducts(updatedProducts);
      window.dispatchEvent(new Event('productsUpdated'));
      setEditingProduct(null);
    } catch (err) {
      addToast('Failed to save product');
    }
  };


  const handleArchive = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Draft' })
      });
      const updatedProducts = products.map(p => p.id === id ? { ...p, status: 'Draft' } : p);
      setProducts(updatedProducts);
      addToast('Product moved to draft');
      addAdminNotification(currentUser?.name, 'Moved product to draft', product.name, 'product');
    } catch (err) {
      addToast('Failed to move product to draft');
    }
  };

  const handleRestoreProduct = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Available' })
      });
      const updatedProducts = products.map(p =>
        p.id === id ? { ...p, status: 'Available' } : p
      );
      setProducts(updatedProducts);
      addToast(`"${product.name}" restored and set to Available`);
      addAdminNotification(currentUser?.name, 'Restored product', product.name, 'product');
      setViewProduct(prev => prev?.id === id ? { ...prev, status: 'Available' } : prev);
    } catch (err) {
      addToast('Failed to restore product');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Brand', 'Category', 'Condition', 'Price'].join(','),
      ...filteredProducts.map(p => 
        [p.id, `"${p.name || p.title || ''}"`, `"${p.brand || p.brandCategory || ''}"`, p.category, p.condition, p.price].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'inventory_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Inventory exported successfully');
  };

  const filteredProducts = products.filter(product => {
    const searchLower = (searchQuery || '').toLowerCase();
    const productName = (product.name || product.title || '').toLowerCase();
    const productBrand = (product.brand || product.brandCategory || '').toLowerCase();
    const productId = String(product.id || '').toLowerCase();
    
    const matchesSearch = productName.includes(searchLower) || 
                          productBrand.includes(searchLower) ||
                          productId.includes(searchLower);
                          
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    const matchesCondition = filterCondition === 'All' || product.condition === filterCondition;
    
    let matchesStatus = true;
    if (filterStatus === 'Sold Out') matchesStatus = product.status === 'Sold Out' || product.status === 'Out of Stock';
    else if (filterStatus !== 'All') matchesStatus = product.status === filterStatus || (filterStatus === 'Available' && product.status === 'In Stock');

    return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || 0;
    const bValue = b[sortConfig.key] || 0;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Global store stats — aligned with standard e-commerce metrics (like Shopify)
  const availableItems = products.filter(p => p.status === 'Available' || p.status === 'In Stock').length;
  const reservedItems = products.filter(p => p.status === 'Reserved').length;
  const outOfStock = products.filter(p => p.status === 'Sold Out' || p.status === 'Out of Stock').length;
  const draftItems = products.filter(p => p.status === 'Draft').length;

  const statusCounts = {
    'All': products.length,
    'Available': availableItems,
    'Reserved': reservedItems,
    'Sold Out': outOfStock,
    'Draft': draftItems
  };

  // When search or filter changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterCondition, filterStatus, sortConfig]);


  return (
    <>
      <div className="space-y-6 animate-fade-in">


      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
        
        {/* Quick Status Tabs */}
        <div className="px-6 pt-4 flex gap-6 border-b border-earth-100 overflow-x-auto no-scrollbar">
          {['All', 'Available', 'Reserved', 'Sold Out', 'Draft'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                filterStatus === status 
                  ? 'border-[#3A4A2D] text-[#3A4A2D]' 
                  : 'border-transparent text-earth-500 hover:text-earth-800 hover:border-earth-300'
              }`}
            >
              {status}
              <sup className={`ml-1 text-[10px] font-bold ${filterStatus === status ? 'text-[#3A4A2D]' : 'text-earth-400'}`}>
                {statusCounts[status] || 0}
              </sup>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-earth-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/40 focus:border-[#5F6B4E] text-sm bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 text-earth-800 placeholder-earth-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-white border border-earth-200 rounded-xl text-sm text-earth-600 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 font-medium cursor-pointer hover:bg-earth-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-4 py-2.5 bg-white border border-earth-200 rounded-xl text-sm text-earth-600 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 font-medium cursor-pointer hover:bg-earth-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all"
            >
              <option value="All">All Conditions</option>
              {['Like New', 'Very Good', 'Good', 'Acceptable'].map(cond => <option key={cond} value={cond}>{cond}</option>)}
            </select>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-earth-200 bg-white rounded-xl text-sm text-earth-600 hover:text-earth-900 hover:bg-earth-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all font-medium">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={() => setIsAttributesModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-earth-200 bg-white rounded-xl text-sm text-earth-600 hover:text-earth-900 hover:bg-earth-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all font-medium">
              Manage Attributes
            </button>
            <button
              onClick={() => setEditingProduct({ isNew: true, name: '', brand: '', price: 0, status: 'Available', condition: 'Very Good', defects: '', category: 'Tops', size: 'M' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3A4A2D] hover:bg-[#2A3620] text-white rounded-xl text-sm font-medium shadow-[0_4px_12px_rgba(58,74,45,0.2)] hover:shadow-[0_6px_16px_rgba(58,74,45,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="h-4 w-4" /> Add New Listing
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAF8F5] border-y border-earth-100">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-earth-500">
                <th className="px-6 py-4 rounded-tl-xl">Name</th>
                <th className="px-6 py-4">Condition</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-[#3A4A2D] hover:bg-earth-100/50 transition-colors group select-none"
                  onClick={() => {
                    let direction = 'asc';
                    if (sortConfig.key === 'price' && sortConfig.direction === 'asc') {
                      direction = 'desc';
                    }
                    setSortConfig({ key: 'price', direction });
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    Price
                    {sortConfig.key === 'price' ? (
                      sortConfig.direction === 'asc' ? <ArrowDown className="w-3.5 h-3.5 text-[#3A4A2D]" /> : <ArrowUp className="w-3.5 h-3.5 text-[#3A4A2D]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-earth-100/60 hover:bg-gradient-to-r hover:from-[#FDF9F0]/40 hover:to-transparent transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-earth-100 shrink-0 border border-earth-200/50 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        <Image src={product.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100'} alt={product.name || product.title || 'Product'} fill sizes="48px" unoptimized className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-earth-800 text-sm group-hover:text-[#3A4A2D] transition-colors">{product.name || product.title || 'Unknown Product'}</p>
                        <p className="text-xs text-earth-400 mt-0.5 font-medium tracking-wide">SKU: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${CONDITION_STYLE[product.condition] || 'bg-slate-100 text-slate-600 border border-slate-200/60'}`}>
                      {product.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#3A4A2D] text-[15px]">THB {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const badge = STATUS_BADGE[product.status] || STATUS_BADGE['Draft'];
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditingProduct(product)} className="p-2 text-earth-400 hover:text-[#C57B57] hover:bg-[#FAF0EA] rounded-lg transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      {product.status === 'Draft' ? (
                        <button onClick={() => handleRestoreProduct(product.id)} className="p-2 text-earth-400 hover:text-[#3A4A2D] hover:bg-[#EEF1EA] rounded-lg transition-colors" title="Publish (Make Visible)">
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleArchive(product.id)} className="p-2 text-[#5F6B4E] hover:bg-[#EEF1EA] rounded-lg transition-colors" title="Move to Draft (Hide)">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center animate-fade-in">
                      <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <Package className="w-8 h-8 text-earth-400" />
                      </div>
                      <p className="text-lg font-bold text-earth-700">No products found</p>
                      <p className="text-sm text-earth-500 mt-1 max-w-sm">Try adjusting your filters or search query to find what you're looking for.</p>
                      <button 
                        onClick={() => { setSearchQuery(''); setFilterCategory('All'); setFilterCondition('All'); setFilterStatus('All'); }}
                        className="mt-6 px-4 py-2 text-sm font-semibold text-[#3A4A2D] bg-[#EEF1EA] hover:bg-[#E3E8DD] rounded-xl transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-earth-100 flex items-center justify-between text-sm text-earth-500">
          <p>Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items</p>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-[#3A4A2D] text-white' : 'border border-earth-200 hover:bg-earth-50'}`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      </div>


      {/* Edit/Add Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-center bg-[#F9F7F4]">
              <h2 className="text-lg font-semibold text-earth-800">{editingProduct.isNew ? 'Add New Listing' : 'Edit Listing'}</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left Column: Image Upload */}
              <div className="w-full md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-earth-100 bg-[#F9F7F4]/30 flex flex-col relative">
                {editingProduct.image && (
                  <button 
                    onClick={() => setEditingProduct({ ...editingProduct, image: null })}
                    className="absolute top-8 right-8 z-10 p-1.5 bg-white/90 hover:bg-white text-red-500 rounded-xl shadow-sm hover:shadow-md transition-all"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              <label className="flex flex-col items-center justify-center flex-1 min-h-[300px] border-2 border-dashed border-earth-200 rounded-2xl bg-earth-50 hover:border-[#5F6B4E] hover:bg-[#EEF1EA]/50 transition-all cursor-pointer group relative overflow-hidden">
                {editingProduct.image ? (
                  <>
                    <Image src={editingProduct.image} alt="Upload" fill unoptimized className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2"><Edit className="w-4 h-4"/> Change Image</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-7 h-7 text-earth-400 group-hover:text-[#4A5E3A] transition-colors mb-2" />
                    <p className="text-sm text-earth-500 group-hover:text-earth-700 font-medium">Click to upload image</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        addToast('Image size must be less than 2MB', 'error');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditingProduct({ ...editingProduct, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
              <p className="text-[10px] text-earth-400 text-center mt-4 uppercase tracking-widest font-semibold">Product Image</p>
              </div>

              {/* Right Column: Form */}
              <div className="w-full md:w-3/5 p-6 overflow-y-auto space-y-8">
              {/* 1. Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-earth-800 border-b border-earth-100 pb-2">1. Basic Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Product Name</label>
                    <input type="text" value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Brand</label>
                    <input type="text" value={editingProduct.brand || ''} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Category</label>
                    <CustomDropdown 
                      value={editingProduct.category} 
                      onChange={(val) => setEditingProduct({ ...editingProduct, category: val })} 
                      options={categories}
                      placeholder="Select Category"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Color</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div 
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-earth-200 shadow-sm" 
                          style={{ backgroundColor: editingProduct.color || 'transparent' }}
                        />
                        <input type="text" placeholder="e.g. Navy Blue or #Hex" value={editingProduct.color || ''} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full pl-9 pr-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.EyeDropper) {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.oninput = (e) => setEditingProduct({ ...editingProduct, color: e.target.value });
                            input.click();
                            return;
                          }
                          try {
                            const eyeDropper = new window.EyeDropper();
                            const result = await eyeDropper.open();
                            setEditingProduct({ ...editingProduct, color: result.sRGBHex });
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        className="px-3 py-2.5 bg-earth-100 hover:bg-earth-200 border border-earth-200 rounded-xl transition-colors flex items-center justify-center text-earth-600 shadow-sm"
                        title="Pick color from screen"
                      >
                        <Pipette className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Item Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-earth-800 border-b border-earth-100 pb-2">2. Item Details</h3>
                
                {(!editingProduct.category || !['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Handbags'].includes(editingProduct.category)) ? (
                  /* Clothing Details */
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Size</label>
                      <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'Freesize'].map(size => (
                          <button
                            key={size}
                            onClick={() => setEditingProduct({ ...editingProduct, size })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${editingProduct.size === size ? 'bg-[#3A4A2D] text-white border-[#3A4A2D]' : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Chest / Waist</label>
                        <input type="text" placeholder="e.g. 42 inches" value={editingProduct.chest || ''} onChange={(e) => setEditingProduct({ ...editingProduct, chest: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Length</label>
                        <input type="text" placeholder="e.g. 28 inches" value={editingProduct.length || ''} onChange={(e) => setEditingProduct({ ...editingProduct, length: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                      </div>
                    </div>
                  </div>
                ) : editingProduct.category === 'Handbags' ? (
                  /* Bags Details */
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Dimensions (W x L x H)</label>
                      <input type="text" placeholder="e.g. 20 x 30 x 15 cm" value={editingProduct.dimensions || ''} onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Strap Length</label>
                      <input type="text" placeholder="e.g. 120 cm max" value={editingProduct.strapLength || ''} onChange={(e) => setEditingProduct({ ...editingProduct, strapLength: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                    </div>
                  </div>
                ) : (
                  /* Accessories Details */
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Size / Length</label>
                      <input type="text" placeholder="e.g. 5 cm, US 6, 45cm" value={editingProduct.jewelrySize || ''} onChange={(e) => setEditingProduct({ ...editingProduct, jewelrySize: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Material</label>
                      <CustomDropdown 
                        value={editingProduct.material} 
                        onChange={(val) => setEditingProduct({ ...editingProduct, material: val })} 
                        options={['Silver', 'Brass', 'Leather']}
                        placeholder="Select Material"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Condition</label>
                  <div className="flex flex-wrap gap-2">
                    {['Like New', 'Very Good', 'Good', 'Acceptable'].map(cond => (
                      <button
                        key={cond}
                        onClick={() => setEditingProduct({ ...editingProduct, condition: cond })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${editingProduct.condition === cond ? 'bg-[#3A4A2D] text-white border-[#3A4A2D]' : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'}`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wider">⚠️ Known Defects / Notes</label>
                  <textarea rows="2" value={editingProduct.defects || ''} onChange={(e) => setEditingProduct({ ...editingProduct, defects: e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-sm bg-amber-50/30 text-earth-800 placeholder-earth-400 resize-none"></textarea>
                </div>
              </div>

              {/* 3. Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-earth-800 border-b border-earth-100 pb-2">3. Pricing & Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Price (THB)</label>
                    <input type="number" value={editingProduct.price || 0} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                  </div>
                  {/* SKU and Stock Qty removed for cleaner UX */}
                  <div className="space-y-2 col-span-2 mt-2">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider mb-1">Status</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'Available', label: 'Available', colorClass: 'bg-[#EEF1EA] text-[#3A4A2D] border-[#C2CBB8]', dot: 'bg-[#5F6B4E]' },
                        { value: 'Reserved', label: 'Reserved', colorClass: 'bg-[#FDF9F0] text-[#9E7A2E] border-[#E8D8BA]', dot: 'bg-[#9E7A2E]' },
                        { value: 'Draft', label: 'Draft', colorClass: 'bg-earth-100 text-earth-600 border-earth-200', dot: 'bg-earth-400' },
                        { value: 'Sold Out', label: 'Sold Out', colorClass: 'bg-[#FCF5F3] text-[#A84C43] border-[#E8D1CE]', dot: 'bg-[#A84C43]' }
                      ].map(s => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, status: s.value })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${editingProduct.status === s.value ? s.colorClass + ' ring-2 ring-offset-1 ring-current' : 'bg-white border-earth-200 text-earth-500 hover:bg-earth-50'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${editingProduct.status === s.value ? s.dot : 'bg-earth-300'}`} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end gap-3 shrink-0">
              <button onClick={() => setEditingProduct(null)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleSaveProduct} className="px-5 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors">Save Listing</button>
            </div>
          </div>
        </div>
      )}


      {/* Attributes Management Modal */}
      {isAttributesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-center bg-[#F9F7F4]">
              <h2 className="text-lg font-semibold text-earth-800">Manage Attributes</h2>
              <button onClick={() => setIsAttributesModalOpen(false)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="border-b border-earth-100 px-6 pt-4 flex gap-4 text-sm font-medium">
              <button onClick={() => setAttributeTab('categories')} className={`pb-3 border-b-2 transition-colors ${attributeTab === 'categories' ? 'border-[#3A4A2D] text-[#3A4A2D]' : 'border-transparent text-earth-500 hover:text-earth-800'}`}>Categories</button>
              <button onClick={() => setAttributeTab('sizes')} className={`pb-3 border-b-2 transition-colors ${attributeTab === 'sizes' ? 'border-[#3A4A2D] text-[#3A4A2D]' : 'border-transparent text-earth-500 hover:text-earth-800'}`}>Sizes</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 max-h-[60vh]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAttributeInput}
                  onChange={(e) => setNewAttributeInput(e.target.value)}
                  placeholder={`New ${attributeTab === 'categories' ? 'Category' : 'Size'}...`}
                  className="flex-1 px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newAttributeInput.trim()) {
                      const trimmedInput = newAttributeInput.trim();
                      const list = attributeTab === 'categories' ? categories : sizes;
                      const setList = attributeTab === 'categories' ? setCategories : setSizes;
                      const attrType = attributeTab === 'categories' ? 'categories' : 'sizes';
                      
                      const isDuplicate = list.some(item => item.toLowerCase() === trimmedInput.toLowerCase());
                      if (!isDuplicate) {
                        const updated = [...list, trimmedInput];
                        try {
                          await fetch('/api/metadata', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ [attrType]: updated })
                          });
                          setList(updated);
                          setNewAttributeInput('');
                          addToast(`Added new ${attributeTab === 'categories' ? 'category' : 'size'}`);
                        } catch (err) {
                          addToast('Failed to add attribute');
                        }
                      } else {
                        addToast(`This ${attributeTab === 'categories' ? 'category' : 'size'} already exists`, 'error');
                      }
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    if (newAttributeInput.trim()) {
                      const trimmedInput = newAttributeInput.trim();
                      const list = attributeTab === 'categories' ? categories : sizes;
                      const setList = attributeTab === 'categories' ? setCategories : setSizes;
                      const attrType = attributeTab === 'categories' ? 'categories' : 'sizes';
                      
                      const isDuplicate = list.some(item => item.toLowerCase() === trimmedInput.toLowerCase());
                      if (!isDuplicate) {
                        const updated = [...list, trimmedInput];
                        try {
                          await fetch('/api/metadata', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ [attrType]: updated })
                          });
                          setList(updated);
                          setNewAttributeInput('');
                          addToast(`Added new ${attributeTab === 'categories' ? 'category' : 'size'}`);
                        } catch (err) {
                          addToast('Failed to add attribute');
                        }
                      } else {
                        addToast(`This ${attributeTab === 'categories' ? 'category' : 'size'} already exists`, 'error');
                      }
                    }
                  }}
                  className="px-4 py-2.5 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mb-3">
                  Existing {attributeTab === 'categories' ? 'Categories' : 'Sizes'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(attributeTab === 'categories' ? categories : sizes).map(item => (
                    <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-earth-100 text-earth-800 rounded-lg text-sm border border-earth-200">
                      {item}
                      <button 
                        onClick={async () => {
                          const list = attributeTab === 'categories' ? categories : sizes;
                          const setList = attributeTab === 'categories' ? setCategories : setSizes;
                          const attrType = attributeTab === 'categories' ? 'categories' : 'sizes';
                          const updated = list.filter(i => i !== item);
                          
                          try {
                            await fetch('/api/metadata', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ [attrType]: updated })
                            });
                            setList(updated);
                            addToast(`Deleted ${attributeTab === 'categories' ? 'category' : 'size'}`);
                          } catch (err) {
                            addToast('Failed to delete attribute');
                          }
                        }}
                        className="text-earth-400 hover:text-red-500 p-0.5 rounded-full hover:bg-earth-200/50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end">
              <button onClick={() => setIsAttributesModalOpen(false)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

