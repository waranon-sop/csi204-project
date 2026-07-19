'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, MoreVertical, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';

const mockOrders = [
  {
    id: '#RW-92031', customer: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+66 81 234 5678',
    address: '123 Green Avenue, Phaya Thai, Bangkok, 10400, Thailand',
    date: 'Oct 24, 2023', total: 185, shipping: 15, status: 'Pending', trackingNumber: '',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    slipImage: null,
    items: [{ name: 'Vintage Heritage Trench', detail: 'Size: M · Camel', price: 170, image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100' }],
  },
  {
    id: '#RW-92032', customer: 'Michael Chen', email: 'm.chen@example.com', phone: '+66 86 543 2100',
    address: '45 Sukhumvit Soi 11, Watthana, Bangkok, 10110, Thailand',
    date: 'Oct 23, 2023', total: 72, shipping: 15, status: 'Shipped', trackingNumber: 'TH789456123TH',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
    items: [{ name: 'Raw Linen Resort Shirt', detail: 'Size: L · Forest', price: 57, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100' }],
  },
  {
    id: '#RW-92033', customer: 'Emma Watson', email: 'emma.w@example.com', phone: '+66 90 123 7788',
    address: '88 Silom Road, Bang Rak, Bangkok, 10500, Thailand',
    date: 'Oct 23, 2023', total: 128, shipping: 15, status: 'Pending', trackingNumber: '',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    slipImage: null,
    items: [{ name: 'Upcycled Selvedge Denim', detail: 'Size: 32 · Indigo', price: 113, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=100' }],
  },
  {
    id: '#RW-92034', customer: 'David Miller', email: 'david.m@example.com', phone: '+66 62 987 4455',
    address: '22/3 Ratchadaphisek Road, Din Daeng, Bangkok, 10400, Thailand',
    date: 'Oct 22, 2023', total: 45, shipping: 15, status: 'Shipped', trackingNumber: 'TH112233445TH',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
    items: [{ name: 'Terracotta Clay Set', detail: 'Handmade · Earth', price: 30, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=100' }],
  },
];

const STATUS_CONFIG = {
  Pending:    { color: 'bg-[#C57B57] text-white',          icon: Clock },
  Processing: { color: 'bg-blue-600 text-white',            icon: Package },
  Shipped:    { color: 'bg-[#3A4A2D] text-white',           icon: Truck },
  Delivered:  { color: 'bg-emerald-600 text-white',         icon: CheckCircle2 },
  Cancelled:  { color: 'bg-red-500 text-white',             icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
    if (localOrders.length > 0) {
      setOrders(localOrders);
    } else {
      localStorage.setItem('orders', JSON.stringify(mockOrders));
    }
  }, []);

  const handleSaveOrder = (updatedOrder) => {
    const updatedOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setSelectedOrder(updatedOrder);
    addToast(`Order ${updatedOrder.id} updated successfully`);
    addAdminNotification(currentUser?.name, `Updated order status to ${updatedOrder.status}`, updatedOrder.id, 'order');
  };

  const filtered = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);
  const pending = orders.filter(o => o.status === 'Pending').length;
  const inTransit = orders.filter(o => o.status === 'Shipped').length;
  const weeklyRevenue = orders.reduce((a, o) => a + ((o.status === 'Shipped' || o.status === 'Delivered') ? o.total : 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-earth-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 placeholder-earth-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-auto px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 bg-[#F9F7F4] focus:outline-none cursor-pointer font-medium"
          >
            <option value="All">All Status</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-earth-400 border-b border-earth-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100 text-sm">
              {filtered.map((order) => {
                const firstItem = order.items[0];
                return (
                  <tr key={order.id} className="hover:bg-[#F9F7F4] transition-colors group cursor-pointer" onClick={() => { setSelectedOrder(order); setTrackingInput(order.trackingNumber || ''); }}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-earth-800">{order.id}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-earth-100 shrink-0 border border-earth-200">
                          <Image src={firstItem?.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100'} alt={firstItem?.name || 'Item'} fill sizes="44px" unoptimized className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-earth-800">{firstItem?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-earth-400 mt-0.5">{firstItem?.detail}{order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-earth-500 text-sm">{order.date}</td>
                    <td className="px-6 py-5 font-semibold text-earth-800">THB {order.total}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_CONFIG[order.status]?.color}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setTrackingInput(order.trackingNumber || ''); }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-earth-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-earth-100 flex items-center justify-between text-sm text-earth-500">
          <p>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {orders.length} orders</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-40" disabled>‹</button>
            <button className="w-8 h-8 bg-[#3A4A2D] text-white rounded-lg font-medium text-sm">1</button>
            <button className="w-8 h-8 border border-earth-200 rounded-lg hover:bg-earth-50">2</button>
            <button className="w-8 h-8 border border-earth-200 rounded-lg hover:bg-earth-50">3</button>
            <button className="w-8 h-8 border border-earth-200 rounded-lg hover:bg-earth-50">›</button>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-earth-200/60 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0EA] flex items-center justify-center">
              <Package className="w-4 h-4 text-[#C57B57]" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider">Total Pending</p>
              <span className="text-[10px] bg-[#C57B57] text-white px-2 py-0.5 rounded-full font-bold">+12%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-earth-800">{pending} Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-earth-200/60 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#EEF1EA] flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#3A4A2D]" />
            </div>
            <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider">In Transit Today</p>
          </div>
          <p className="text-2xl font-bold text-earth-800">{inTransit} Orders</p>
        </div>
        <div className="bg-[#3A4A2D] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Weekly Revenue</p>
          </div>
          <p className="text-2xl font-bold text-white">THB {weeklyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-start bg-[#F9F7F4]">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-earth-800">Order {selectedOrder.id}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-6">
                {/* Left: Items + Status + Tracking */}
                <div className="col-span-2 space-y-5">

                  {/* Update Status & Tracking */}
                  <div className="bg-[#F9F7F4] border border-earth-200 rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Update Status</h3>
                    <div className="flex flex-col gap-3">
                      <select value={selectedOrder.status} onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})} className="w-full px-3 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 font-medium">
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      
                      {selectedOrder.status === 'Shipped' && (
                        <div className="bg-[#EEF1EA] border border-[#C2CBB8] rounded-xl p-3 flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-[#3A4A2D] flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5" /> Tracking Number
                          </label>
                          <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="e.g. TH789456123TH"
                            className="w-full px-3 py-2 border border-[#A4B296] rounded-lg text-sm text-earth-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30"
                          />
                        </div>
                      )}

                      <button 
                        onClick={() => {
                          const updated = { ...selectedOrder, trackingNumber: selectedOrder.status === 'Shipped' ? trackingInput : selectedOrder.trackingNumber };
                          handleSaveOrder(updated);
                        }} 
                        className="w-full px-5 py-2.5 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#4A5E3A] transition-colors mt-1"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex gap-4 p-3 bg-[#F9F7F4] rounded-2xl border border-earth-100">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-earth-100 border border-earth-200 shrink-0">
                            <Image src={item.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100'} fill sizes="56px" unoptimized alt={item.name} className="object-cover" />
                          </div>
                          <div className="flex-1 flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-earth-800 text-sm">{item.name}</p>
                              <p className="text-xs text-earth-400 mt-0.5">{item.detail}</p>
                            </div>
                            <p className="font-bold text-earth-800 text-sm">THB {item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right: Customer + Slip + Summary */}
                <div className="space-y-4">
                  <div className="bg-[#F9F7F4] border border-earth-200 rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Customer</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-earth-200 bg-earth-100 shrink-0">
                        <Image src={selectedOrder.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'} alt={selectedOrder.customer} fill sizes="36px" unoptimized className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-earth-800 text-sm">{selectedOrder.customer}</p>
                        <p className="text-xs text-earth-400">{selectedOrder.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white rounded-xl p-3 border border-earth-100">
                        <p className="text-[10px] text-earth-400 mb-0.5">📞 Phone</p>
                        <p className="text-sm font-medium text-earth-800">{selectedOrder.phone}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-earth-100">
                        <p className="text-[10px] text-earth-400 mb-0.5">📍 Shipping Address</p>
                        <p className="text-sm text-earth-700 leading-relaxed">{selectedOrder.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F9F7F4] border border-earth-200 rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Payment Slip</h3>
                    {selectedOrder.slipImage ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-earth-200">
                        <Image src={selectedOrder.slipImage} fill sizes="250px" unoptimized alt="Slip" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-24 rounded-xl border-2 border-dashed border-earth-200 flex items-center justify-center">
                        <p className="text-xs text-earth-400 text-center">No slip uploaded<br /><span className="text-[#C57B57] font-medium">Awaiting payment</span></p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F9F7F4] border border-earth-200 rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-earth-600">
                        <span>Subtotal</span>
                        <span>THB {(selectedOrder.total - selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-earth-600">
                        <span>Shipping</span>
                        <span>THB {selectedOrder.shipping}</span>
                      </div>
                      <div className="flex justify-between font-bold text-earth-800 pt-2 border-t border-earth-200">
                        <span>Total</span>
                        <span>THB {selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-earth-100 bg-[#F9F7F4] flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
