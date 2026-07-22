'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, MoreVertical, Package, Truck, CheckCircle2, Clock, XCircle, Copy, ArrowUpDown, ArrowUp, ArrowDown, Printer } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { addAdminNotification } from '../../../utils/notifications';
import { useStaffGuard } from '../../../hooks/useRoleGuard';



const STATUS_CONFIG = {
  Pending:    { color: 'bg-[#C57B57] text-white',          icon: Clock },
  Processing: { color: 'bg-blue-600 text-white',            icon: Package },
  Shipped:    { color: 'bg-[#3A4A2D] text-white',           icon: Truck },
  Delivered:  { color: 'bg-emerald-600 text-white',         icon: CheckCircle2 },
  Cancelled:  { color: 'bg-red-500 text-white',             icon: XCircle },
};

export default function AdminOrders() {
  const { isAllowed } = useStaffGuard();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [isSlipExpanded, setIsSlipExpanded] = useState(false);
  const itemsPerPage = 10;
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSaveOrder = async (updatedOrder) => {
    try {
      await fetch(`/api/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
      });
      
      const updatedOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      setOrders(updatedOrders);
      setSelectedOrder(updatedOrder);
      addToast(`Order ${updatedOrder.id} updated successfully`);
      addAdminNotification(currentUser?.name, `Updated order ${updatedOrder.id}`, updatedOrder.id, 'order');
    } catch (err) {
      addToast('Failed to update order');
    }
  };

  const handleStatusChange = (newStatus) => {
    if (selectedOrder) {
      handleSaveOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handlePrintLabel = () => {
    if (!selectedOrder) return;
    addToast('Generating waybill...');
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const html = `
      <html>
        <head>
          <title>Waybill - ${selectedOrder.id}</title>
          <style>
            @page { size: A6 portrait; margin: 5mm; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 10px; color: #000; }
            .label-box { border: 2px solid #000; padding: 15px; border-radius: 8px; max-width: 100%; box-sizing: border-box; }
            .header { text-align: center; font-size: 20px; font-weight: 900; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px; }
            .section { margin-bottom: 15px; }
            .section-title { font-size: 11px; color: #444; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
            .text-lg { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .text-md { font-size: 14px; margin-bottom: 2px; }
            .barcode-box { text-align: center; margin: 20px 0; padding: 15px; border: 2px solid #000; background: #fff; }
            .barcode-text { font-family: monospace; font-size: 22px; font-weight: bold; letter-spacing: 4px; }
            .items { border-top: 2px dashed #000; padding-top: 15px; margin-top: 15px; }
            .item { font-size: 13px; margin-bottom: 6px; display: flex; justify-content: space-between; border-bottom: 1px dashed #eee; padding-bottom: 4px; }
            .footer { text-align: center; font-size: 10px; margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="header">
              KARMART ONLINE
            </div>
            <div class="section">
              <div class="section-title">Recipient (ผู้รับ)</div>
              <div class="text-lg">${selectedOrder.customer}</div>
              <div class="text-md">Tel: ${selectedOrder.phone}</div>
              <div class="text-md" style="margin-top: 5px; line-height: 1.4;">${selectedOrder.address}</div>
            </div>
            
            <div class="barcode-box">
              <div class="barcode-text">*${selectedOrder.trackingNumber || selectedOrder.id}*</div>
              <div style="font-size: 10px; margin-top: 5px; text-transform: uppercase; font-weight: bold;">
                ${selectedOrder.trackingNumber ? 'Tracking Number' : 'Order ID (Pending Drop-off)'}
              </div>
            </div>

            <div class="items">
              <div class="section-title">Order Summary (รายการสินค้า)</div>
              ${selectedOrder.items.map(item => `
                <div class="item">
                  <span style="font-weight: bold;">1x</span>
                  <span style="flex-grow: 1; margin-left: 10px;">${item.name}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="footer">
              Printed on ${new Date().toLocaleString()}
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => {
                 window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;
    
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
  };

  const filtered = orders.filter(o => {
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(searchLower) || 
                          o.customer.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (sortConfig.key === 'date') {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedOrders = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const pending = orders.filter(o => o.status === 'Pending').length;
  const inTransit = orders.filter(o => o.status === 'Shipped').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#FAF0EA] flex items-center justify-center">
                <Package className="w-4 h-4 text-[#C57B57]" />
              </div>
            <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider">Total Pending</p>
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
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-[0_2px_10px_-4px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xs font-semibold text-earth-400 uppercase tracking-wider">Total Cancelled</p>
          </div>
          <p className="text-2xl font-bold text-earth-800">{cancelledOrders} Orders</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-earth-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <thead className="bg-[#FAF8F5] border-y border-earth-100">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-earth-500">
                <th className="px-6 py-4 rounded-tl-xl w-[15%]">Order ID</th>
                <th className="px-6 py-4 w-full">Item Details</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-[#3A4A2D] hover:bg-earth-100/50 transition-colors group select-none whitespace-nowrap"
                  onClick={() => {
                    setSortConfig({
                      key: 'date',
                      direction: sortConfig.key === 'date' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                    });
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    Date
                    {sortConfig.key === 'date' ? (
                      sortConfig.direction === 'asc' ? <ArrowDown className="w-3.5 h-3.5 text-[#3A4A2D]" /> : <ArrowUp className="w-3.5 h-3.5 text-[#3A4A2D]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const firstItem = order.items[0];
                return (
                  <tr key={order.id} className="border-b border-earth-100/60 hover:bg-gradient-to-r hover:from-[#FDF9F0]/40 hover:to-transparent transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-earth-800 text-sm group-hover:text-[#3A4A2D] transition-colors">{order.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-earth-100 shrink-0 border border-earth-200/50 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                          <Image src={firstItem?.image || 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=100'} alt={firstItem?.name || 'Item'} fill sizes="48px" unoptimized className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-earth-800 text-sm group-hover:text-[#3A4A2D] transition-colors">{firstItem?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-earth-400 mt-0.5 font-medium tracking-wide">{firstItem?.detail}{order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-earth-500 font-medium text-sm whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 font-bold text-[#3A4A2D] text-[15px] whitespace-nowrap">THB {order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                      {order.trackingNumber && (
                        <p className="text-[10px] text-earth-500 font-medium mt-1.5 flex items-center gap-1">
                          <Truck className="w-3 h-3"/> {order.trackingNumber}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="p-2 text-earth-400 hover:text-[#3A4A2D] hover:bg-[#EEF1EA] rounded-xl transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setTrackingInput(order.trackingNumber || ''); }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedOrders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-earth-400 font-medium">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-earth-100 flex items-center justify-between text-sm text-earth-500">
          <p>Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} orders</p>
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
              <div className="flex items-center gap-2">
                <button onClick={handlePrintLabel} className="flex items-center gap-2 px-4 py-2 bg-[#3A4A2D] text-white rounded-xl text-sm font-medium hover:bg-[#2A3620] transition-colors shadow-sm">
                  <Printer className="w-4 h-4" />
                  Print Label
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-6">
                {/* Left: Items + Status + Tracking */}
                <div className="col-span-2 space-y-5">
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
                </div>

                {/* Right: Customer + Slip + Summary */}
                <div className="space-y-4">
                  {/* Customer Info (Expanded) */}
                  <div className="bg-[#F9F7F4] border border-earth-200 rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Customer</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-earth-200 bg-earth-100 shrink-0">
                        <Image src={selectedOrder.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'} alt={selectedOrder.customer} fill sizes="48px" unoptimized className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-earth-800 text-base">{selectedOrder.customer}</p>
                        <p className="text-xs text-earth-500">{selectedOrder.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-3 border border-earth-100 flex justify-between items-center">
                        <span className="text-[10px] text-earth-400 uppercase font-bold tracking-wider">Phone</span>
                        <span className="text-sm font-semibold text-earth-800">{selectedOrder.phone}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-earth-100 relative group">
                        <p className="text-[10px] text-earth-400 uppercase font-bold tracking-wider mb-1">Shipping Address</p>
                        <p className="text-sm text-earth-700 leading-relaxed pr-8">{selectedOrder.address}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.address);
                            addToast('Address copied to clipboard!');
                          }}
                          className="absolute top-3 right-3 p-1.5 bg-earth-50 text-earth-400 hover:text-earth-700 hover:bg-earth-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                          title="Copy Address"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details (Combined Slip and Summary) */}
                  <div className="bg-[#F9F7F4] border border-earth-200 rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 mb-3">Payment Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2 text-sm bg-white p-3 rounded-xl border border-earth-100">
                        <div className="flex justify-between text-earth-500">
                          <span>Subtotal</span>
                          <span>THB {(selectedOrder.total - selectedOrder.shipping)}</span>
                        </div>
                        <div className="flex justify-between text-earth-500">
                          <span>Shipping</span>
                          <span>THB {selectedOrder.shipping}</span>
                        </div>
                        <div className="flex justify-between font-bold text-earth-800 pt-2 border-t border-earth-100">
                          <span>Total</span>
                          <span className="text-[#3A4A2D]">THB {selectedOrder.total}</span>
                        </div>
                      </div>

                      {selectedOrder.slipImage ? (
                        <div 
                          className="relative w-full h-32 rounded-xl overflow-hidden border border-earth-200 cursor-zoom-in group shadow-sm"
                          onClick={() => setIsSlipExpanded(true)}
                        >
                          <Image src={selectedOrder.slipImage} fill sizes="250px" unoptimized alt="Slip" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Search className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-24 rounded-xl border-2 border-dashed border-earth-200 flex items-center justify-center bg-white/50">
                          <p className="text-xs text-earth-400 text-center">No slip uploaded<br /><span className="text-[#C57B57] font-medium">Awaiting payment</span></p>
                        </div>
                      )}
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

      {/* Slip Lightbox */}
      {isSlipExpanded && selectedOrder?.slipImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setIsSlipExpanded(false)}>
          <button className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <XCircle className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-2xl h-[80vh] rounded-2xl overflow-hidden">
            <Image src={selectedOrder.slipImage} fill unoptimized alt="Slip Full" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
