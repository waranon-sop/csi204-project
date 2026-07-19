'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, EyeOff, Package, AlertTriangle, X, ZoomIn, Download, Archive, ArchiveRestore } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';

const mockProducts = [
  {
    id: 'RW-29402', name: 'Vintage Linen Overcoat', brand: 'Unknown', category: 'Outerwear',
    price: 145, stock: 24, condition: 'Very Good', defects: 'No visible defects. Perfect condition.',
    size: 'M', chest: '100 cm', length: '100 cm', status: 'In Stock', hidden: false,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'RW-18239', name: 'Raw Silk Trousers', brand: 'Silk & Co.', category: 'Bottoms',
    price: 89, stock: 4, condition: 'Good', defects: 'Minor pull thread on right inner seam.',
    size: 'L', chest: '-', length: '102 cm', status: 'Low Stock', hidden: false,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'RW-99201', name: 'Upcycled Denim Tote', brand: 'ReThread', category: 'Accessories',
    price: 45, stock: 112, condition: 'Like New', defects: 'Brand new, upcycled from surplus fabric.',
    size: 'OS', chest: '-', length: '-', status: 'In Stock', hidden: false,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'RW-00451', name: 'Recycled Cotton Sweater', brand: 'Patagonia', category: 'Tops',
    price: 115, stock: 0, condition: 'Good', defects: 'Small pilling on left sleeve cuff.',
    size: 'S', chest: '88 cm', length: '60 cm', status: 'Out of Stock', hidden: false,
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
  'In Stock':     'text-[#3A4A2D]',
  'Low Stock':    'text-[#C57B57]',
  'Out of Stock': 'text-red-500',
};

const STATUS_BADGE = {
  'Available':  { dot: 'bg-[#5F6B4E]',  text: 'text-[#3A4A2D]',  bg: 'bg-[#EEF1EA]',  label: 'Available' },
  'In Stock':   { dot: 'bg-[#5F6B4E]',  text: 'text-[#3A4A2D]',  bg: 'bg-[#EEF1EA]',  label: 'Available' },
  'Sold Out':   { dot: 'bg-[#A84C43]',  text: 'text-[#A84C43]',  bg: 'bg-[#FCF5F3]',  label: 'Out of Stock' },
  'Out of Stock':{ dot: 'bg-[#A84C43]', text: 'text-[#A84C43]',  bg: 'bg-[#FCF5F3]',  label: 'Out of Stock' },
  'Reserved':   { dot: 'bg-[#9E7A2E]',  text: 'text-[#9E7A2E]',  bg: 'bg-[#FDF9F0]',  label: 'Reserved' },
  'Draft':      { dot: 'bg-earth-400',  text: 'text-earth-500',  bg: 'bg-earth-100',  label: 'Draft' },
  'Low Stock':  { dot: 'bg-[#C57B57]',  text: 'text-[#C57B57]',  bg: 'bg-[#FAF0EA]',  label: 'Low Stock' },
  'Archived':   { dot: 'bg-earth-400',  text: 'text-earth-500',  bg: 'bg-earth-100',  label: 'Archived' },
};

export default function AdminProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [viewProduct, setViewProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState(['Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories']);
  const [sizes, setSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'OS']);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [newAttributeInput, setNewAttributeInput] = useState('');
  const [attributeTab, setAttributeTab] = useState('categories'); // 'categories' or 'sizes'

  useEffect(() => {
    let localProducts = JSON.parse(localStorage.getItem('products')) || [];
    
    // Migrate old conditions in localStorage to new standard
    if (localProducts.length > 0) {
      localProducts = localProducts.map(p => {
        let cond = p.condition;
        if (cond === 'Mint' || cond === 'Deadstock (Unworn)') cond = 'Like New';
        else if (cond === 'Excellent' || cond === 'Excellent (Pre-loved)') cond = 'Very Good';
        else if (cond === 'Vintage Fade (Repaired)' || cond === 'Distressed (Upcycled)' || cond === 'Fair') cond = 'Acceptable';
        else if (cond === 'Good (Minor wear)') cond = 'Good';
        return { ...p, condition: cond };
      });
      localStorage.setItem('products', JSON.stringify(localProducts));
    }

    const localCategories = JSON.parse(localStorage.getItem('productCategories'));
    if (localCategories) setCategories(localCategories);
    const localSizes = JSON.parse(localStorage.getItem('productSizes'));
    if (localSizes) setSizes(localSizes);
    
    if (localProducts.length > 0) {
      setProducts(localProducts);
    } else {
      localStorage.setItem('products', JSON.stringify(mockProducts));
    }
  }, []);

  const handleSaveProduct = () => {
    let updatedProducts;
    
    // Auto-correct status based on stock to prevent inconsistencies
    const productToSave = { ...editingProduct };
    if (productToSave.stock === 0 && productToSave.status === 'Available') {
      productToSave.status = 'Out of Stock';
    } else if (productToSave.stock > 0 && (productToSave.status === 'Out of Stock' || productToSave.status === 'Sold Out')) {
      productToSave.status = 'Available';
    }

    if (productToSave.isNew) {
      const newProduct = { ...productToSave, id: `RW-${Math.floor(Math.random() * 90000) + 10000}` };
      delete newProduct.isNew;
      updatedProducts = [newProduct, ...products];
      addToast('New product added successfully');
      addAdminNotification(currentUser?.name, 'Added a new product', newProduct.name, 'product');
    } else {
      updatedProducts = products.map(p => p.id === productToSave.id ? productToSave : p);
      addToast('Product updated successfully');
      addAdminNotification(currentUser?.name, 'Updated product', productToSave.name, 'product');
    }
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setEditingProduct(null);
  };

  const handleToggleVisibility = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newStatus = product.status === 'Draft' ? 'Active' : 'Draft';
    const updatedProducts = products.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    addToast(`Product visibility ${newStatus === 'Draft' ? 'hidden' : 'shown'}`);
    addAdminNotification(currentUser?.name, newStatus === 'Draft' ? 'Hid product from store' : 'Published product', product.name, 'product');
  };

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const archivedProduct = products.find(p => p.id === productToDelete);
      const updatedProducts = products.map(p => 
        p.id === productToDelete ? { ...p, status: 'Archived' } : p
      );
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      addToast('Product archived successfully');
      if (archivedProduct) addAdminNotification(currentUser?.name, 'Archived product', archivedProduct.name, 'product');
      setViewProduct(null);
      setProductToDelete(null);
    }
  };

  const handleRestoreProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, status: 'Available' } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    addToast(`"${product.name}" restored and set to Available`);
    addAdminNotification(currentUser?.name, 'Restored product', product.name, 'product');
    setViewProduct(prev => prev?.id === id ? { ...prev, status: 'Available' } : prev);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Brand', 'Category', 'Condition', 'Price', 'Stock'].join(','),
      ...filteredProducts.map(p => 
        [p.id, `"${p.name || p.title || ''}"`, `"${p.brand || p.brandCategory || ''}"`, p.category, p.condition, p.price, p.stock].join(',')
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

  const getStock = (p) => p.stock !== undefined ? p.stock : (p.status === 'Available' || p.status === 'In Stock' ? 1 : 0);

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
    const stockCount = getStock(product);
    if (filterStatus === 'Low Stock') matchesStatus = stockCount > 0 && stockCount <= 5;
    else if (filterStatus === 'Out of Stock') matchesStatus = stockCount === 0 || product.status === 'Out of Stock' || product.status === 'Sold Out';
    else if (filterStatus !== 'All') matchesStatus = product.status === filterStatus || (filterStatus === 'Available' && product.status === 'In Stock');

    return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Global store stats — always from ALL products (store health overview)
  const outOfStock = products.filter(p => getStock(p) === 0 || p.status === 'Out of Stock' || p.status === 'Sold Out').length;
  const stockValue = products.reduce((a, p) => a + ((p.price || 0) * getStock(p)), 0);
  const archivedItems = products.filter(p => p.status === 'Archived').length;

  // When search or filter changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterCondition, filterStatus]);


  return (
    <>
      <div className="space-y-6 animate-fade-in">

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Showing Items', value: filteredProducts.length.toLocaleString(), tab: null },
          { label: 'Out of Stock', value: outOfStock, color: 'rust', tab: 'Out of Stock' },
          { label: 'Archived', value: archivedItems, color: 'ochre', tab: 'Archived' },
          { label: 'Stock Value', value: `THB ${stockValue.toLocaleString()}`, tab: null },
        ].map(({ label, value, color, tab }) => {
          let styleClass = 'bg-white border-earth-200/60 text-earth-900';
          if (color === 'rust') styleClass = 'bg-[#FCF5F3] border-[#E8D1CE] text-[#A84C43]';
          else if (color === 'ochre') styleClass = 'bg-[#FDF9F0] border-[#E8D8BA] text-[#9E7A2E]';
          
          return (
            <div
              key={label}
              onClick={() => tab && setFilterStatus(tab)}
              className={`rounded-2xl p-5 border ${styleClass} ${tab ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${color ? 'opacity-80' : 'text-earth-400'}`}>{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              {tab && <p className="text-[10px] mt-2 opacity-60 font-medium">Click</p>}
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
        
        {/* Quick Status Tabs */}
        <div className="px-6 pt-4 flex gap-6 border-b border-earth-100 overflow-x-auto no-scrollbar">
          {['All', 'Available', 'Low Stock', 'Out of Stock', 'Reserved', 'Draft', 'Archived'].map(status => (
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
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 placeholder-earth-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 transition-colors font-medium">
                <Filter className="h-4 w-4" /> Filters
                {(filterCategory !== 'All' || filterCondition !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-[#C57B57]"></span>
                )}
              </button>
              {isFilterOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-earth-200 rounded-2xl shadow-xl w-56 z-20 overflow-hidden">
                  <div className="p-4 border-b border-earth-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400 mb-2">Category</p>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F7F4] border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="p-4 bg-[#F9F7F4]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400 mb-2">Condition</p>
                    <select
                      value={filterCondition}
                      onChange={(e) => setFilterCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-earth-200 rounded-lg text-sm text-earth-800 focus:outline-none"
                    >
                      <option value="All">All Conditions</option>
                      {['Like New', 'Very Good', 'Good', 'Acceptable'].map(cond => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                  </div>
                  <div className="p-3 bg-white border-t border-earth-100 flex justify-between items-center">
                    <button 
                      onClick={() => { setFilterCategory('All'); setFilterCondition('All'); }}
                      className="text-xs font-semibold text-earth-500 hover:text-earth-800 transition-colors"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-1.5 bg-[#3A4A2D] text-white rounded-lg text-xs font-semibold hover:bg-[#4A5E3A] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 transition-colors font-medium">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={() => setIsAttributesModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 transition-colors font-medium">
              Manage Attributes
            </button>
            <button
              onClick={() => setEditingProduct({ isNew: true, name: '', brand: '', price: 0, stock: 1, status: 'Available', condition: 'Very Good', defects: '', category: 'Tops', size: 'M' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3A4A2D] hover:bg-[#4A5E3A] text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> Add New Listing
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-earth-400 border-b border-earth-100">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-earth-100 hover:bg-earth-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-earth-100 shrink-0 border border-earth-200">
                        <Image src={product.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100'} alt={product.name || product.title || 'Product'} fill sizes="44px" unoptimized className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-earth-800">{product.name || product.title || 'Unknown Product'}</p>
                        <p className="text-xs text-earth-400 mt-0.5">SKU: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${CONDITION_STYLE[product.condition] || 'bg-slate-100 text-slate-600'}`}>
                      {product.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-earth-800">THB {product.price.toFixed(2)}</td>
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
                      <button onClick={() => setViewProduct(product)} className="p-2 text-earth-400 hover:text-[#3A4A2D] hover:bg-[#EEF1EA] rounded-lg transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingProduct(product)} className="p-2 text-earth-400 hover:text-[#C57B57] hover:bg-[#FAF0EA] rounded-lg transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      {product.status === 'Archived' ? (
                        <button onClick={() => handleRestoreProduct(product.id)} className="p-2 text-[#5F6B4E] hover:bg-[#EEF1EA] rounded-lg transition-colors" title="Restore to Store">
                          <ArchiveRestore className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-earth-400 hover:text-[#9E7A2E] hover:bg-[#FDF9F0] rounded-lg transition-colors" title="Archive">
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-earth-400">No products found.</td></tr>
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

      {/* Product Detail Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-center bg-[#F9F7F4]">
              <div>
                <h2 className="text-lg font-semibold text-earth-800">{viewProduct.name}</h2>
                <p className="text-xs text-earth-400 mt-0.5">SKU: {viewProduct.id} · {viewProduct.brand}</p>
              </div>
              <button onClick={() => setViewProduct(null)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-earth-200 bg-earth-50 group cursor-zoom-in">
                  <Image src={viewProduct.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800'} alt={viewProduct.name || 'Product'} fill sizes="400px" unoptimized className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${CONDITION_STYLE[viewProduct.condition]}`}>
                      {viewProduct.condition}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-earth-100 text-earth-600 font-medium border border-earth-200">
                      {viewProduct.category}
                    </span>
                  </div>
                  <div className="bg-[#F9F7F4] p-4 rounded-2xl border border-earth-100 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400">Measurements</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[['Size', viewProduct.size], ['Chest', viewProduct.chest], ['Length', viewProduct.length]].map(([k, v]) => (
                        <div key={k} className="bg-white p-3 rounded-xl border border-earth-100 text-center">
                          <p className="text-base font-bold text-earth-800">{v}</p>
                          <p className="text-[10px] text-earth-400 mt-0.5">{k}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Known Defects
                    </p>
                    <p className="text-sm text-amber-900">{viewProduct.defects}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#F9F7F4] p-3 rounded-xl border border-earth-100">
                      <p className="text-[10px] text-earth-400">Price</p>
                      <p className="font-bold text-earth-800 mt-0.5">THB {viewProduct.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#F9F7F4] p-3 rounded-xl border border-earth-100">
                      <p className="text-[10px] text-earth-400">Stock</p>
                      <p className="font-bold text-earth-800 mt-0.5">{viewProduct.stock} pcs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-between">
              {viewProduct.status === 'Archived' ? (
                <button onClick={() => handleRestoreProduct(viewProduct.id)} className="flex items-center gap-2 px-4 py-2 text-[#3A4A2D] bg-[#EEF1EA] border border-[#C2CBB8] rounded-xl text-sm font-medium hover:bg-[#DDE5D8] transition-colors">
                  <ArchiveRestore className="h-4 w-4" /> Restore to Store
                </button>
              ) : (
                <button onClick={() => handleDeleteProduct(viewProduct.id)} className="flex items-center gap-2 px-4 py-2 text-[#9E7A2E] bg-[#FDF9F0] border border-[#E8D8BA] rounded-xl text-sm font-medium hover:bg-[#FAF0D8] transition-colors">
                  <Archive className="h-4 w-4" /> Archive
                </button>
              )}
              <div className="flex gap-2">
                <button onClick={() => setViewProduct(null)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 transition-colors font-medium">Close</button>
                <button onClick={() => { setEditingProduct(viewProduct); setViewProduct(null); }} className="flex items-center gap-2 px-5 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors">
                  <Edit className="h-4 w-4" /> Edit Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-center bg-[#F9F7F4]">
              <h2 className="text-lg font-semibold text-earth-800">{editingProduct.isNew ? 'Add New Listing' : 'Edit Listing'}</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-earth-200 rounded-2xl bg-earth-50 hover:border-[#5F6B4E] hover:bg-[#EEF1EA]/50 transition-all cursor-pointer group">
                <Plus className="w-7 h-7 text-earth-400 group-hover:text-[#4A5E3A] transition-colors mb-2" />
                <p className="text-sm text-earth-500 group-hover:text-earth-700 font-medium">Click to upload images</p>
              </div>

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
                    <select value={editingProduct.category || ''} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800">
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Color</label>
                    <input type="text" placeholder="e.g. Navy Blue" value={editingProduct.color || ''} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                  </div>
                </div>
              </div>

              {/* 2. Item Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-earth-800 border-b border-earth-100 pb-2">2. Item Details</h3>
                
                {(!editingProduct.category || (editingProduct.category !== 'Accessories' && editingProduct.category !== 'Bags')) ? (
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
                ) : (
                  /* Bags / Accessories Details */
                  <div className="grid grid-cols-3 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Dimensions (W x L x H)</label>
                      <input type="text" placeholder="e.g. 20 x 30 x 15 cm" value={editingProduct.dimensions || ''} onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Strap Length</label>
                      <input type="text" placeholder="e.g. 120 cm max" value={editingProduct.strapLength || ''} onChange={(e) => setEditingProduct({ ...editingProduct, strapLength: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Serial Number</label>
                      <input type="text" placeholder="e.g. ABC12345" value={editingProduct.serialNumber || ''} onChange={(e) => setEditingProduct({ ...editingProduct, serialNumber: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
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
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Stock Qty</label>
                    <input type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">SKU</label>
                    <input type="text" value={editingProduct.id || 'Generated on save'} disabled className="w-full px-4 py-2.5 border border-earth-200 rounded-xl text-sm bg-earth-100 text-earth-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Status</label>
                    <select
                      value={editingProduct.status || 'Available'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800"
                    >
                      <option value="Available">🟢 Available — พร้อมขาย</option>
                      <option value="Reserved">🟡 Reserved — ติดจอง</option>
                      <option value="Draft">⚪ Draft — ฉบับร่าง</option>
                      <option value="Out of Stock">🔴 Out of Stock — หมดแล้ว</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleSaveProduct} className="px-5 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors">Save Listing</button>
            </div>
          </div>
        </div>
      )}
      {/* Archive Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-earth-800 mb-2">Archive Product?</h2>
              <p className="text-sm text-earth-500">
                Are you sure you want to archive this product? It will be hidden from the store.
              </p>
            </div>
            <div className="px-6 py-4 bg-[#F9F7F4] flex justify-end gap-3 border-t border-earth-100">
              <button 
                onClick={() => setProductToDelete(null)} 
                className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm"
              >
                Archive
              </button>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newAttributeInput.trim()) {
                      const list = attributeTab === 'categories' ? categories : sizes;
                      const setList = attributeTab === 'categories' ? setCategories : setSizes;
                      const storageKey = attributeTab === 'categories' ? 'productCategories' : 'productSizes';
                      if (!list.includes(newAttributeInput.trim())) {
                        const updated = [...list, newAttributeInput.trim()];
                        setList(updated);
                        localStorage.setItem(storageKey, JSON.stringify(updated));
                        setNewAttributeInput('');
                        addToast(`Added new ${attributeTab === 'categories' ? 'category' : 'size'}`);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newAttributeInput.trim()) {
                      const list = attributeTab === 'categories' ? categories : sizes;
                      const setList = attributeTab === 'categories' ? setCategories : setSizes;
                      const storageKey = attributeTab === 'categories' ? 'productCategories' : 'productSizes';
                      if (!list.includes(newAttributeInput.trim())) {
                        const updated = [...list, newAttributeInput.trim()];
                        setList(updated);
                        localStorage.setItem(storageKey, JSON.stringify(updated));
                        setNewAttributeInput('');
                        addToast(`Added new ${attributeTab === 'categories' ? 'category' : 'size'}`);
                      }
                    }
                  }}
                  className="px-4 py-2.5 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(attributeTab === 'categories' ? categories : sizes).map(item => (
                  <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-earth-100 text-earth-800 rounded-lg text-sm border border-earth-200">
                    {item}
                    <button 
                      onClick={() => {
                        const list = attributeTab === 'categories' ? categories : sizes;
                        const setList = attributeTab === 'categories' ? setCategories : setSizes;
                        const storageKey = attributeTab === 'categories' ? 'productCategories' : 'productSizes';
                        const updated = list.filter(i => i !== item);
                        setList(updated);
                        localStorage.setItem(storageKey, JSON.stringify(updated));
                      }}
                      className="text-earth-400 hover:text-red-500 p-0.5 rounded-full hover:bg-earth-200/50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end">
              <button onClick={() => setIsAttributesModalOpen(false)} className="px-5 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
