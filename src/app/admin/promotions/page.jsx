'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Percent, X, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';

const mockPromotions = [
  { id: 'PROMO-001', code: 'WELCOME10', type: 'percentage', value: 10, status: 'Active', usageLimit: 100, used: 45, expiryDate: '2027-12-31' },
  { id: 'PROMO-002', code: 'SUMMER20', type: 'fixed', value: 20, status: 'Expired', usageLimit: 500, used: 500, expiryDate: '2026-06-30' },
  { id: 'PROMO-003', code: 'FREESHIP', type: 'shipping', value: 15, status: 'Active', usageLimit: 1000, used: 120, expiryDate: '2027-12-31' },
];

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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

  const computedPromotions = promotions.map(promo => ({
    ...promo,
    status: getEffectiveStatus(promo)
  }));

  const filteredPromotions = computedPromotions.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        <div className="px-6 py-4 border-b border-earth-100 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {['All', 'Active', 'Expired', 'Draft'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                  statusFilter === status 
                    ? 'bg-[#3A4A2D] text-white shadow-sm' 
                    : 'bg-[#F9F7F4] text-earth-600 hover:bg-earth-100 border border-transparent hover:border-earth-200'
                }`}
              >
                {status === 'All' ? 'All Codes' : status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
              <input
              type="text"
              placeholder="Search discount code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 placeholder-earth-400"
            />
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
                <th className="px-6 py-4 w-full whitespace-normal">Usage</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map((promo) => {
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
                            }}
                            title="Click to copy"
                          >
                            {promo.code}
                          </p>
                          <div className="absolute -top-2 -right-2 bg-[#3A4A2D] text-white p-1.5 rounded-full opacity-0 group-hover/copy:opacity-100 transition-opacity shadow-sm pointer-events-none">
                            <Copy className="w-3 h-3" />
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
      </div>

      {/* Edit/Add Modal */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-center bg-[#F9F7F4]">
              <h2 className="text-lg font-semibold text-earth-800">{editingPromo.isNew ? 'Create Discount Code' : 'Edit Discount Code'}</h2>
              <button onClick={() => setEditingPromo(null)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Discount Code</label>
                <input type="text" value={editingPromo.code} onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Type</label>
                  <select value={editingPromo.type} onChange={(e) => setEditingPromo({ ...editingPromo, type: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800">
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed Amount (THB)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Discount Value</label>
                  <input type="number" disabled={editingPromo.type === 'shipping'} value={editingPromo.type === 'shipping' ? 0 : editingPromo.value} onChange={(e) => setEditingPromo({ ...editingPromo, value: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 disabled:opacity-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Usage Limit</label>
                  <input type="number" value={editingPromo.usageLimit} onChange={(e) => setEditingPromo({ ...editingPromo, usageLimit: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Status</label>
                  <select value={editingPromo.status} onChange={(e) => setEditingPromo({ ...editingPromo, status: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800">
                    <option>Active</option>
                    <option>Expired</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Expiry Date</label>
                <input type="date" value={editingPromo.expiryDate} onChange={(e) => setEditingPromo({ ...editingPromo, expiryDate: e.target.value })} className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end gap-3">
              <button onClick={() => setEditingPromo(null)} className="px-5 py-2 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleSavePromo} className="px-5 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors">Save Code</button>
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
