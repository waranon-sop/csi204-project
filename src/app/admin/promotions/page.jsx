'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Percent, X, AlertTriangle, Copy, Wand2, ArrowUp, ArrowDown, ArrowUpDown, Check } from 'lucide-react';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';
import { useAdminGuard } from '../../../hooks/useRoleGuard';


export default function AdminPromotions() {
  const { isAllowed } = useAdminGuard();
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch('/api/promotions');
        const data = await res.json();
        setPromotions(data);
      } catch (err) {
        console.error('Failed to load promotions', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleSavePromo = async () => {
    // Validations
    if (!editingPromo.code?.trim()) {
      addToast('Please enter a discount code', 'error');
      return;
    }
    if (editingPromo.type !== 'shipping' && (!editingPromo.value || editingPromo.value <= 0)) {
      addToast('Discount value must be greater than 0', 'error');
      return;
    }
    
    // Check for duplicates
    const isDuplicate = promotions.some(p => 
      p.code.toLowerCase() === editingPromo.code.trim().toLowerCase() && p.id !== editingPromo.id
    );
    if (isDuplicate) {
      addToast(`Discount code "${editingPromo.code.toUpperCase()}" already exists`, 'error');
      return;
    }

    let updatedPromos;
    try {
      if (editingPromo.isNew) {
        const newPromo = { ...editingPromo };
        delete newPromo.isNew;
        const res = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPromo)
        });
        const createdPromo = await res.json();
        updatedPromos = [createdPromo, ...promotions];
        addToast('New promotion added successfully');
        addAdminNotification(currentUser?.name, 'Created a new discount code', createdPromo.code, 'promotion');
      } else {
        await fetch(`/api/promotions/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingPromo)
        });
        updatedPromos = promotions.map(p => p.id === editingPromo.id ? editingPromo : p);
        addToast('Promotion updated successfully');
        addAdminNotification(currentUser?.name, 'Updated discount code', editingPromo.code, 'promotion');
      }
      setPromotions(updatedPromos);
      setEditingPromo(null);
    } catch (err) {
      addToast('Failed to save promotion');
    }
  };

  const handleDeletePromo = (id) => {
    setPromoToDelete(id);
  };

  const confirmDelete = async () => {
    if (promoToDelete) {
      const deletedPromo = promotions.find(p => p.id === promoToDelete);
      try {
        await fetch(`/api/promotions/${promoToDelete}`, { method: 'DELETE' });
        const updatedPromos = promotions.filter(p => p.id !== promoToDelete);
        setPromotions(updatedPromos);
        addToast('Promotion deleted successfully');
        if (deletedPromo) addAdminNotification(currentUser?.name, 'Deleted discount code', deletedPromo.code, 'promotion');
        setPromoToDelete(null);
      } catch (err) {
        addToast('Failed to delete promotion');
      }
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    if (currentStatus === 'Expired') return;
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;
    
    const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
    setPromotions(promotions.map(p => p.id === id ? { ...p, status: newStatus } : p));
    addToast(newStatus === 'Active' ? `"${promo.code}" activated` : `"${promo.code}" moved to draft`);
    addAdminNotification(currentUser?.name, newStatus === 'Active' ? 'Activated discount code' : 'Moved discount code to draft', promo.code, 'promotion');
  };

  const getEffectiveStatus = (promo) => {
    if (promo.status !== 'Active') return promo.status;
    
    // Auto-expire if usage limit reached
    if (promo.usageLimit > 0 && promo.used >= promo.usageLimit) {
      return 'Expired';
    }
    
    // Auto-expire if date has passed
    if (promo.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(promo.expiryDate);
      if (expiry < today) {
        return 'Expired';
      }
    }
    
    return 'Active';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const computedPromotions = promotions.map(promo => ({
    ...promo,
    status: getEffectiveStatus(promo)
  }));

  const filteredPromotions = computedPromotions.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'usage') {
      aValue = a.used;
      bValue = b.used;
    } else if (sortConfig.key === 'expiryDate') {
      aValue = a.expiryDate || '9999-12-31';
      bValue = b.expiryDate || '9999-12-31';
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const activeCount = computedPromotions.filter(p => p.status === 'Active').length;
  const topPromo = computedPromotions.length > 0 ? computedPromotions.reduce((max, p) => p.used > max.used ? p : max, computedPromotions[0]) : null;
  // Rough estimate of discount given for business metrics
  const totalDiscount = computedPromotions.reduce((acc, p) => {
    if (p.type === 'fixed') return acc + (p.value * p.used);
    if (p.type === 'percentage') return acc + (100 * p.used); // Assume ~100 THB off for percentage
    if (p.type === 'shipping') return acc + (50 * p.used); // Assume 50 THB shipping cost
    return acc;
  }, 0);

  return (
    <>
      <div className="space-y-6 animate-fade-in">
      {/* Header & Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 border bg-white border-earth-200/60 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400 mb-2">Total Codes</p>
          <p className="text-3xl font-bold text-earth-900">{computedPromotions.length}</p>
        </div>
        <div className="rounded-2xl p-5 border bg-white border-earth-200/60 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400 mb-2">Active Codes</p>
          <p className="text-3xl font-bold text-[#3A4A2D]">{activeCount}</p>
        </div>
        <div className="rounded-2xl p-5 border bg-gradient-to-br from-[#EEF1EA] to-[#E3E8DB] border-[#C2CBB8] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Tag className="w-24 h-24 text-[#3A4A2D]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#3A4A2D] mb-1">Top Performing Code</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-black text-[#3A4A2D] truncate font-mono tracking-wider">{topPromo ? topPromo.code : '-'}</p>
          </div>
          <p className="text-xs font-semibold text-[#5F6B4E] mt-1">{topPromo ? `${topPromo.used} redemptions` : '0 redemptions'}</p>
        </div>
        <div className="rounded-2xl p-5 border bg-white border-earth-200/60 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400 mb-2">Est. Discount Given</p>
          <p className="text-3xl font-bold text-earth-900">฿{totalDiscount.toLocaleString()}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-earth-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
              <input
                type="text"
                placeholder="Search discount code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 placeholder-earth-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-white text-earth-700 font-medium cursor-pointer min-w-[140px]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setEditingPromo({ isNew: true, code: '', type: 'percentage', value: 0, status: 'Active', usageLimit: 100, used: 0, expiryDate: '' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3A4A2D] hover:bg-[#4A5E3A] text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Discount Code
            </button>
          </div>
        </div>
      </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#FAF8F5] border-y border-earth-100">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-earth-500">
                <th className="px-6 py-4 rounded-tl-xl">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-full whitespace-normal cursor-pointer hover:text-[#3A4A2D] hover:bg-earth-100/50 transition-colors group select-none" onClick={() => handleSort('usage')}>
                  <div className="flex items-center gap-1.5">
                    Usage
                    {sortConfig.key === 'usage' ? (
                      sortConfig.direction === 'asc' ? <ArrowDown className="w-3.5 h-3.5 text-[#3A4A2D]" /> : <ArrowUp className="w-3.5 h-3.5 text-[#3A4A2D]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#3A4A2D] hover:bg-earth-100/50 transition-colors group select-none whitespace-nowrap" onClick={() => handleSort('expiryDate')}>
                  <div className="flex items-center gap-1.5">
                    Expiry Date
                    {sortConfig.key === 'expiryDate' ? (
                      sortConfig.direction === 'asc' ? <ArrowDown className="w-3.5 h-3.5 text-[#3A4A2D]" /> : <ArrowUp className="w-3.5 h-3.5 text-[#3A4A2D]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPromotions.map((promo) => {
                const usagePercent = promo.usageLimit > 0 ? (promo.used / promo.usageLimit) * 100 : 0;
                const isNearLimit = usagePercent >= 90 && promo.usageLimit > 0;
                
                return (
                  <tr key={promo.id} className="border-b border-earth-100/60 hover:bg-gradient-to-r hover:from-[#FDF9F0]/40 hover:to-transparent transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group/copy">
                          <p className="font-bold text-earth-800 font-mono tracking-wider text-base bg-earth-50 px-2 py-1 rounded-md border border-earth-200 cursor-pointer group-hover/copy:bg-earth-100 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              addToast('Code copied to clipboard!');
                              setCopiedId(promo.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            title="Click to copy"
                          >
                            {promo.code}
                          </p>
                          <div className={`absolute -top-2 -right-2 ${copiedId === promo.id ? 'bg-green-600' : 'bg-[#3A4A2D]'} text-white p-1.5 rounded-full ${copiedId === promo.id ? 'opacity-100' : 'opacity-0 group-hover/copy:opacity-100'} transition-opacity shadow-sm pointer-events-none`}>
                            {copiedId === promo.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-earth-400 mt-1.5 ml-1">ID: {promo.id}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#3A4A2D] text-[15px]">
                      {promo.type === 'percentage' && `${promo.value}% Off`}
                      {promo.type === 'fixed' && `THB ${promo.value} Off`}
                      {promo.type === 'shipping' && `Free Shipping`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                        promo.status === 'Active' ? 'bg-[#3A4A2D] text-white' : 
                        promo.status === 'Expired' ? 'bg-red-500 text-white' : 
                        'bg-[#C57B57] text-white'
                      }`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 max-w-[150px]">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-earth-700">{promo.used} used</span>
                          <span className="text-earth-400">/ {promo.usageLimit}</span>
                        </div>
                        <div className="w-full h-1.5 bg-earth-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-[#3A4A2D]'}`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        {isNearLimit && promo.status === 'Active' && (
                          <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Running out
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-earth-500">
                      {promo.expiryDate || 'No expiry'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          disabled={promo.status === 'Expired'}
                          onClick={() => handleToggleStatus(promo.id, promo.status)}
                          className={`relative inline-flex h-5 w-9 mr-3 items-center rounded-full transition-colors ${promo.status === 'Active' ? 'bg-[#3A4A2D]' : 'bg-earth-200'} ${promo.status === 'Expired' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={promo.status === 'Active' ? 'Pause Code' : promo.status === 'Expired' ? 'Cannot activate expired code' : 'Activate Code'}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${promo.status === 'Active' ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: promo.status === 'Active' ? 'translateX(18px)' : 'translateX(4px)' }} />
                        </button>
                        <button onClick={() => setEditingPromo(promo)} className="p-2 text-earth-400 hover:text-[#C57B57] hover:bg-[#FAF0EA] rounded-xl transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeletePromo(promo.id)} className="p-2 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPromotions.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-earth-400">No promotions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col border border-white/20">
            {/* Header */}
            <div className="px-8 py-5 border-b border-earth-200/50 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10 sticky top-0">
              <h2 className="text-xl font-bold text-earth-800 tracking-tight flex items-center gap-2">
                {editingPromo.isNew ? <><Plus className="w-5 h-5 text-[#3A4A2D]" /> Create Discount Code</> : <><Edit className="w-5 h-5 text-[#3A4A2D]" /> Edit Discount Code</>}
              </h2>
              <button onClick={() => setEditingPromo(null)} className="p-2 text-earth-400 hover:text-earth-700 hover:bg-earth-100 rounded-full transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              
              {/* Code Settings Card */}
              <div className="bg-white p-6 rounded-2xl border border-earth-200/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-500 uppercase tracking-wider">Discount Code</label>
                  <div className="flex gap-3">
                    <input type="text" disabled={!editingPromo.isNew} value={editingPromo.code} onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="flex-1 px-4 py-3 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-earth-50/50 text-earth-800 font-mono tracking-wider disabled:opacity-60 transition-all hover:border-earth-300" />
                    {editingPromo.isNew && (
                      <button type="button" onClick={() => setEditingPromo({ ...editingPromo, code: 'KM-' + Math.random().toString(36).substring(2, 8).toUpperCase() })} className="px-5 py-3 bg-[#EEF1EA] text-[#3A4A2D] hover:bg-[#E3E8DB] rounded-xl font-bold transition-colors flex items-center justify-center shadow-[0_2px_8px_rgba(58,74,45,0.1)] hover:shadow-[0_2px_12px_rgba(58,74,45,0.15)]" title="Auto-generate Code">
                        <Wand2 className="w-4 h-4 mr-1.5" /> Generate
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-500 uppercase tracking-wider">Type</label>
                    <select disabled={!editingPromo.isNew} value={editingPromo.type} onChange={(e) => setEditingPromo({ ...editingPromo, type: e.target.value })} className="w-full px-4 py-3 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-earth-50/50 text-earth-800 disabled:opacity-60 transition-all hover:border-earth-300 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B8B88' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}>
                      <option value="percentage">Percentage %</option>
                      <option value="fixed">Fixed Amount (THB)</option>
                      <option value="shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-500 uppercase tracking-wider">Discount Value</label>
                    <div className="relative">
                      {editingPromo.type === 'fixed' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-earth-400 font-bold">THB</span>}
                      <input type="number" disabled={!editingPromo.isNew || editingPromo.type === 'shipping'} value={editingPromo.type === 'shipping' ? 0 : editingPromo.value} 
                        onChange={(e) => {
                          let val = parseFloat(e.target.value) || 0;
                          if (editingPromo.type === 'percentage' && val > 100) val = 100;
                          setEditingPromo({ ...editingPromo, value: val });
                        }} 
                        className={`w-full py-3 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-earth-50/50 text-earth-800 disabled:opacity-60 font-bold transition-all hover:border-earth-300 ${editingPromo.type === 'fixed' ? 'pl-12 pr-4' : editingPromo.type === 'percentage' ? 'pl-4 pr-10' : 'px-4'}`} 
                      />
                      {editingPromo.type === 'percentage' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-earth-400 font-bold">%</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules & Limits Card */}
              <div className="bg-white p-6 rounded-2xl border border-earth-200/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Usage Limit
                    </label>
                    <div className="relative">
                      <input type="number" value={editingPromo.usageLimit} onChange={(e) => setEditingPromo({ ...editingPromo, usageLimit: parseInt(e.target.value) || 0 })} className="w-full pl-4 pr-16 py-3 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-earth-50/50 text-earth-800 font-bold transition-all hover:border-earth-300" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-earth-400 font-medium">0 = ∞</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-earth-500 uppercase tracking-wider">Expiry Date</label>
                    <input type="date" value={editingPromo.expiryDate} onChange={(e) => setEditingPromo({ ...editingPromo, expiryDate: e.target.value })} className="w-full px-4 py-3 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-earth-50/50 text-earth-800 transition-all hover:border-earth-300" />
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-earth-500 uppercase tracking-wider mb-2">Publish Status</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'Active', label: 'Active', colorClass: 'bg-[#EEF1EA] text-[#3A4A2D] border-[#C2CBB8]', dot: 'bg-[#5F6B4E]' },
                      { value: 'Draft', label: 'Draft', colorClass: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
                      { value: 'Expired', label: 'Expired', colorClass: 'bg-[#FCF5F3] text-[#A84C43] border-[#E8D1CE]', dot: 'bg-[#A84C43]' }
                    ].map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setEditingPromo({ ...editingPromo, status: s.value })}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 ${editingPromo.status === s.value ? s.colorClass + ' shadow-md scale-105' : 'bg-white border-earth-200 text-earth-500 hover:bg-earth-50 hover:border-earth-300'}`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full transition-colors ${editingPromo.status === s.value ? s.dot : 'bg-earth-300'}`} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Footer */}
            <div className="px-8 py-5 border-t border-earth-200/50 bg-white/50 backdrop-blur-sm flex justify-end gap-3 shrink-0">
              <button onClick={() => setEditingPromo(null)} className="px-6 py-2.5 rounded-xl text-sm text-earth-600 hover:bg-earth-100 font-bold transition-colors">Cancel</button>
              <button onClick={handleSavePromo} className="px-8 py-2.5 bg-[#3A4A2D] text-white rounded-xl text-sm font-bold hover:bg-[#2A3521] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                {editingPromo.isNew ? 'Create Code' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {promoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-earth-800 mb-2">Delete Code?</h2>
              <p className="text-sm text-earth-500">
                Are you sure you want to delete this discount code? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-[#F9F7F4] flex justify-end gap-3 border-t border-earth-100">
              <button onClick={() => setPromoToDelete(null)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
