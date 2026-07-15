'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, EyeOff, X, ZoomIn, AlertTriangle, Download } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';

const mockProducts = [
  {
    id: 'RW-29402', name: 'Vintage Linen Overcoat', brand: 'Unknown', category: 'Outerwear',
    price: 145, stock: 24, condition: 'Excellent', defects: 'No visible defects. Perfect condition.',
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
    price: 45, stock: 112, condition: 'Mint', defects: 'Brand new, upcycled from surplus fabric.',
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
  'Excellent': 'bg-[#EEF1EA] text-[#3A4A2D] border border-[#C2CBB8]',
  'Good':      'bg-[#FAF0EA] text-[#8E5133] border border-[#DFAB93]',
  'Fair':      'bg-amber-50 text-amber-700 border border-amber-200',
  'Mint':      'bg-blue-50 text-blue-700 border border-blue-200',
};

const STOCK_STYLE = {
  'In Stock':     'text-[#3A4A2D]',
  'Low Stock':    'text-[#C57B57]',
  'Out of Stock': 'text-red-500',
};

export default function AdminProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [viewProduct, setViewProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const localProducts = JSON.parse(localStorage.getItem('products')) || [];
    if (localProducts.length > 0) {
      setProducts(localProducts);
    } else {
      localStorage.setItem('products', JSON.stringify(mockProducts));
    }
  }, []);

  const handleSaveProduct = () => {
    let updatedProducts;
    if (editingProduct.isNew) {
      const newProduct = { ...editingProduct, id: `RW-${Math.floor(Math.random() * 90000) + 10000}` };
      delete newProduct.isNew;
      updatedProducts = [newProduct, ...products];
      addToast('New product added successfully');
      addAdminNotification(currentUser?.name, 'Added a new product', newProduct.name, 'product');
    } else {
      updatedProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
      addToast('Product updated successfully');
      addAdminNotification(currentUser?.name, 'Updated product', editingProduct.name, 'product');
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
      const deletedProduct = products.find(p => p.id === productToDelete);
      const updatedProducts = products.filter(p => p.id !== productToDelete);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      addToast('Product deleted successfully');
      if (deletedProduct) addAdminNotification(currentUser?.name, 'Deleted product', deletedProduct.name, 'product');
      setViewProduct(null);
      setProductToDelete(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Brand', 'Category', 'Condition', 'Price', 'Stock'].join(','),
      ...filteredProducts.map(p => 
        [p.id, `"${p.name}"`, `"${p.brand}"`, p.category, p.condition, p.price, p.stock].join(',')
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
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // When search or filter changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  const totalItems = products.reduce((a, p) => a + p.stock, 0);
  const nearLowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const stockValue = products.reduce((a, p) => a + (p.price * p.stock), 0);
  const avgCondition = 'Excellent';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalItems.toLocaleString() },
          { label: 'Near Low Stock', value: nearLowStock, highlight: true },
          { label: 'Stock Value', value: `€${stockValue.toLocaleString()}` },
          { label: 'Avg. Condition', value: avgCondition },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-2xl p-5 border ${highlight ? 'bg-[#EEF1EA] border-[#C2CBB8]' : 'bg-white border-earth-200/60'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${highlight ? 'text-[#3A4A2D]' : 'text-earth-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
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
                ⊟ {filterCategory === 'All' ? 'Filters' : filterCategory}
              </button>
              {isFilterOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-earth-200 rounded-xl shadow-lg w-40 z-20 py-2">
                  {['All', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setFilterCategory(cat); setIsFilterOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm ${filterCategory === cat ? 'bg-[#EEF1EA] text-[#3A4A2D] font-bold' : 'text-earth-600 hover:bg-earth-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 transition-colors font-medium">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={() => setEditingProduct({ isNew: true, name: '', brand: '', price: 0, stock: 0, condition: 'Excellent', defects: '', category: 'Tops', size: 'M' })}
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
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-earth-100 hover:bg-earth-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-earth-100 shrink-0 border border-earth-200">
                        <Image src={product.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100'} alt={product.name || 'Product'} fill sizes="44px" unoptimized className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-earth-800">{product.name}</p>
                        <p className="text-xs text-earth-400 mt-0.5">SKU: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${CONDITION_STYLE[product.condition] || 'bg-slate-100 text-slate-600'}`}>
                      {product.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-earth-800">€{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-red-400' : product.stock <= 5 ? 'bg-[#C57B57]' : 'bg-[#5F6B4E]'}`}></span>
                      <span className={`text-sm font-medium ${STOCK_STYLE[product.status]}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewProduct(product)} className="p-2 text-earth-400 hover:text-[#3A4A2D] hover:bg-[#EEF1EA] rounded-lg transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingProduct(product)} className="p-2 text-earth-400 hover:text-[#C57B57] hover:bg-[#FAF0EA] rounded-lg transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleToggleVisibility(product.id)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-lg transition-colors" title={product.status === 'Draft' ? 'Show in store' : 'Hide from store'}>
                        {product.status === 'Draft' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                      <p className="font-bold text-earth-800 mt-0.5">€{viewProduct.price.toFixed(2)}</p>
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
              <button onClick={() => handleDeleteProduct(viewProduct.id)} className="flex items-center gap-2 px-4 py-2 text-red-500 bg-red-50 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
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
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-earth-200 rounded-2xl bg-earth-50 hover:border-[#5F6B4E] hover:bg-[#EEF1EA]/50 transition-all cursor-pointer group">
                <Plus className="w-7 h-7 text-earth-400 group-hover:text-[#4A5E3A] transition-colors mb-2" />
                <p className="text-sm text-earth-500 group-hover:text-earth-700 font-medium">Click to upload images</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Product Name</label>
                  <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Brand</label>
                  <input type="text" value={editingProduct.brand} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Price (€)</label>
                  <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Stock Qty</label>
                  <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Condition</label>
                <select value={editingProduct.condition} onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800">
                  <option>Mint</option><option>Excellent</option><option>Good</option><option>Fair</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wider">⚠️ Known Defects / Notes</label>
                <textarea rows="3" value={editingProduct.defects} onChange={(e) => setEditingProduct({ ...editingProduct, defects: e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-sm bg-amber-50/30 text-earth-800 placeholder-earth-400 resize-none"></textarea>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleSaveProduct} className="px-5 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors">Save Listing</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-earth-800 mb-2">Delete Product?</h2>
              <p className="text-sm text-earth-500">
                Are you sure you want to delete this product? This action cannot be undone.
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
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
