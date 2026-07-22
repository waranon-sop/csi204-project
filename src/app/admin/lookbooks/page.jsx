'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../components/ui/ToastProvider';
import { getLookbooks, saveLookbook, deleteLookbook } from '../../../utils/localStorageHelper';

export default function AdminLookbooks() {
  const [lookbooks, setLookbooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLookbook, setEditingLookbook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const fetchLookbooks = async () => {
    const data = await getLookbooks();
    setLookbooks(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchLookbooks();
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const handleLookbookUpdate = () => fetchLookbooks();
    window.addEventListener('lookbooksUpdated', handleLookbookUpdate);
    
    const handleProductsUpdate = async () => {
      try {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData);
      } catch (err) {
        console.error('Failed to fetch updated products', err);
      }
    };
    window.addEventListener('productsUpdated', handleProductsUpdate);
    
    return () => {
      window.removeEventListener('lookbooksUpdated', handleLookbookUpdate);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, []);

  const handleSaveLookbook = async () => {
    if (!editingLookbook.title?.trim() || !editingLookbook.subtitle?.trim()) {
      addToast('Please provide a title and subtitle', 'error');
      return;
    }
    if (!editingLookbook.image?.trim()) {
      addToast('Please provide an image URL', 'error');
      return;
    }

    try {
      saveLookbook(editingLookbook);
      addToast(editingLookbook.id ? 'Lookbook updated successfully' : 'Lookbook created successfully');
      setEditingLookbook(null);
    } catch (err) {
      addToast('Failed to save lookbook', 'error');
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this lookbook?')) {
      deleteLookbook(id);
      addToast('Lookbook deleted');
    }
  };

  const handleCreateNew = () => {
    setEditingLookbook({
      title: '',
      subtitle: '',
      image: '',
      totalPrice: 0,
      items: []
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingLookbook({ ...editingLookbook, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const computedLookbooks = React.useMemo(() => {
    return lookbooks.map(lb => {
      const mappedItems = lb.items.map(item => {
        const fresh = products.find(p => p.id === item.id);
        if (fresh) {
          return {
            id: fresh.id,
            name: fresh.title || fresh.name,
            color: fresh.color || 'N/A',
            hex: fresh.color?.startsWith('#') ? fresh.color : (fresh.hex || '#000000'),
            size: fresh.size || fresh.jewelrySize || 'OS',
            price: fresh.price
          };
        }
        return item;
      });
      return {
        ...lb,
        items: mappedItems,
        totalPrice: mappedItems.reduce((acc, curr) => acc + (curr.price || 0), 0)
      };
    });
  }, [lookbooks, products]);

  const filteredLookbooks = computedLookbooks.filter(lb => 
    lb.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lb.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProductSelection = (product) => {
    setEditingLookbook(prev => {
      const isSelected = prev.items.some(i => i.id === product.id);
      let newItems;
      if (isSelected) {
        newItems = prev.items.filter(i => i.id !== product.id);
      } else {
        newItems = [...prev.items, {
          id: product.id,
          name: product.title || product.name,
          color: product.color || 'N/A',
          hex: product.hex || '#000000',
          size: product.size || 'OS',
          price: product.price
        }];
      }
      const newTotal = newItems.reduce((acc, curr) => acc + curr.price, 0);
      return { ...prev, items: newItems, totalPrice: newTotal };
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3A4A2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2D2D2A]">Lookbooks</h1>
          <p className="text-sm text-[#5C5C58] mt-1">Manage outfit sets for the storefront homepage.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-[#3A4A2D] hover:bg-[#2D3A22] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Lookbook
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#D8D2C8] shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B88] w-4 h-4" />
          <input
            type="text"
            placeholder="Search lookbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9F8F6] border border-[#EAE5DB] rounded-lg text-sm focus:outline-none focus:border-[#3A4A2D] focus:ring-1 focus:ring-[#3A4A2D] transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredLookbooks.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#D8D2C8] text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-[#A0A09F] mb-3" />
          <p className="text-[#5C5C58] font-medium">No lookbooks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLookbooks.map(lb => (
            <div key={lb.id} className="bg-white rounded-xl border border-[#D8D2C8] shadow-sm overflow-hidden flex flex-col">
              <div className="relative aspect-[4/5] bg-[#F5F2ED]">
                {lb.image ? (
                  <Image src={lb.image} alt={lb.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A0A09F]">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B8B88] mb-1">{lb.subtitle}</span>
                <h3 className="font-serif text-lg font-bold text-[#2D2D2A] mb-2">{lb.title}</h3>
                <p className="text-xs text-[#5C5C58] mb-4">{lb.items?.length || 0} items in this look (THB {lb.totalPrice})</p>
                
                <div className="mt-auto pt-4 border-t border-[#EAE5DB] flex gap-2">
                  <button
                    onClick={() => setEditingLookbook(lb)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#D8D2C8] rounded-lg text-xs font-semibold text-[#2D2D2A] hover:bg-[#F5F2ED] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lb.id)}
                    className="flex items-center justify-center px-3 py-2 border border-[#FEE2E2] rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {editingLookbook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE5DB]">
              <h2 className="text-lg font-serif font-bold text-[#2D2D2A]">
                {editingLookbook.id ? 'Edit Lookbook' : 'Create New Lookbook'}
              </h2>
              <button onClick={() => setEditingLookbook(null)} className="p-2 text-[#8B8B88] hover:bg-[#F5F2ED] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
              {/* Form */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5C58] mb-1.5 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={editingLookbook.title}
                    onChange={e => setEditingLookbook({...editingLookbook, title: e.target.value})}
                    placeholder="e.g. Look 01"
                    className="w-full px-4 py-2 bg-[#F9F8F6] border border-[#EAE5DB] rounded-lg text-sm focus:outline-none focus:border-[#3A4A2D] focus:ring-1 focus:ring-[#3A4A2D] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5C58] mb-1.5 uppercase tracking-wider">Subtitle</label>
                  <input
                    type="text"
                    value={editingLookbook.subtitle}
                    onChange={e => setEditingLookbook({...editingLookbook, subtitle: e.target.value})}
                    placeholder="e.g. Daily Match"
                    className="w-full px-4 py-2 bg-[#F9F8F6] border border-[#EAE5DB] rounded-lg text-sm focus:outline-none focus:border-[#3A4A2D] focus:ring-1 focus:ring-[#3A4A2D] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5C58] mb-1.5 uppercase tracking-wider">Image Upload</label>
                  <label className="flex items-center justify-center w-full px-4 py-2 bg-[#F9F8F6] border border-[#EAE5DB] border-dashed rounded-lg text-sm focus-within:border-[#3A4A2D] hover:bg-[#F5F2ED] transition-all cursor-pointer">
                    <div className="flex items-center gap-2 text-[#5C5C58]">
                      <Upload className="w-4 h-4" />
                      <span>{editingLookbook.image ? 'Change Image' : 'Click to Upload Image'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="pt-2">
                  <div className="relative aspect-[4/5] bg-[#F5F2ED] rounded-xl overflow-hidden border border-[#EAE5DB]">
                    {editingLookbook.image ? (
                      <Image src={editingLookbook.image} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#A0A09F] flex-col gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">Image Preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="flex-1 flex flex-col border border-[#EAE5DB] rounded-xl overflow-hidden">
                <div className="bg-[#F5F2ED] px-4 py-3 border-b border-[#EAE5DB]">
                  <h3 className="text-sm font-bold text-[#2D2D2A]">Select Products</h3>
                  <p className="text-xs text-[#5C5C58]">{editingLookbook.items?.length || 0} items selected (Total: THB {editingLookbook.totalPrice || 0})</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh] bg-[#F9F8F6]">
                  {products.map(p => {
                    const isSelected = editingLookbook.items?.some(i => i.id === p.id);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => toggleProductSelection(p)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-white border-[#3A4A2D]' : 'bg-white border-transparent hover:border-[#EAE5DB]'}`}
                      >
                        <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                          {p.image && <Image src={p.image} alt={p.name || p.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#2D2D2A] truncate">{p.name || p.title}</p>
                          <p className="text-xs text-[#8B8B88]">THB {p.price} | {p.category}</p>
                          <p className="text-[10px] text-[#A0A09F] mt-0.5">Size: {p.size || 'OS'} • Color: {p.color || 'N/A'}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#3A4A2D] border-[#3A4A2D] text-white' : 'border-[#D1D1D1] bg-white'}`}>
                          {isSelected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#EAE5DB] bg-[#F9F8F6] flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setEditingLookbook(null)}
                className="px-6 py-2 border border-[#D8D2C8] rounded-lg text-sm font-semibold text-[#5C5C58] hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLookbook}
                className="px-6 py-2 bg-[#3A4A2D] hover:bg-[#2D3A22] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Save Lookbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
