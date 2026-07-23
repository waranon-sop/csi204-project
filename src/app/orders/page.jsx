"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, Truck, Package, Box, Star, Check, X, Flame, Droplet, Recycle } from 'lucide-react';
import { getOrdersByUser, updateOrder } from '../../utils/localStorageHelper';
import { useAuth } from '../../context/AuthContext';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Delivered':
    case 'จัดส่งสำเร็จ':
      return 'bg-sage-100 text-sage-800 border-sage-200';
    case 'Cancelled':
    case 'ยกเลิกคำสั่งซื้อ':
      return 'bg-clay-100 text-clay-800 border-clay-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.id) {
      const fetchOrders = async () => {
        const data = await getOrdersByUser(currentUser.id);
        setOrders(data);
      };
      fetchOrders();
    }
  }, [currentUser]);

  const deliveredItemsCount = orders
    .filter(o => ['Delivered', 'จัดส่งสำเร็จ'].includes(o.status))
    .reduce((sum, order) => sum + (order.itemsCount || order.items?.length || 1), 0);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>

        {/* Content Right */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-earth-200/60 p-6 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="border-b border-earth-100 pb-5 mb-6">
              <h1 className="text-2xl font-bold text-earth-900">Order History</h1>
              <p className="text-xs text-earth-500 mt-1">Track order status, view reward redemption history, and see your eco-impact statistics.</p>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="border border-earth-200/80 rounded-2xl p-5 hover:border-sage-300 transition-colors bg-earth-50/20"
                  >
                    {/* Header of card */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-earth-100/60">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-earth-400 block">Order Number</span>
                        <span className="text-sm font-bold text-earth-800">{order.id}</span>
                      </div>
                      <div className="space-y-1 sm:text-right">
                        <span className="text-xs font-semibold text-earth-400 block">Order Date</span>
                        <span className="text-sm text-earth-700">{order.date}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-earth-400 block sm:text-right">Delivery Status</span>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Body of card */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-earth-100 rounded-xl text-earth-600">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-earth-800 text-sm leading-snug">{order.itemSummary}</h4>
                          <p className="text-xs text-earth-400 mt-0.5">Total {order.itemsCount} Items</p>
                        </div>
                      </div>

                      {/* Carbon footprint savings */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 border border-sage-100 rounded-xl">
                        <Leaf className="h-4 w-4 text-sage-600" />
                        <div className="text-left">
                          <span className="block text-[9px] text-sage-700 font-semibold uppercase leading-none">Carbon Saved</span>
                          <span className="block text-xs font-bold text-sage-800">
                            {['Delivered', 'จัดส่งสำเร็จ'].includes(order.status) 
                              ? `${((order.itemsCount || 1) * 6.5).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e`
                              : '0.0 kg CO₂e'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer of card */}
                    <div className="flex items-center justify-between pt-4 border-t border-earth-100/60 flex-wrap gap-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-earth-400">Total Amount:</span>
                        <span className="text-base font-bold text-earth-900">THB {order.total}</span>
                      </div>

                      <div className="flex gap-2 items-center">
                        {order.status === 'Shipped' && order.trackingNumber && (
                          <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-earth-50 rounded-lg border border-earth-200 text-xs">
                            <Box className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-500 font-semibold">Tracking:</span>
                            <span className="text-earth-800 font-mono tracking-wider">{order.trackingNumber}</span>
                          </div>
                        )}
                        {['Delivered', 'จัดส่งสำเร็จ'].includes(order.status) && !order.hasReviewed && (
                          <button onClick={() => router.push(`/review/${encodeURIComponent(order.id)}`)} className="flex items-center gap-1.5 bg-sage-50 hover:bg-sage-100 text-sage-700 text-xs font-medium px-4 py-2 rounded-full border border-sage-200 transition-colors">
                            <Star className="h-3.5 w-3.5" />
                            Write Review
                          </button>
                        )}
                        {order.hasReviewed && (
                           <div className="flex items-center gap-1.5 bg-earth-50 text-earth-500 text-xs font-medium px-4 py-2 rounded-full border border-earth-200 cursor-default">
                             <Check className="h-3.5 w-3.5" />
                             Reviewed
                           </div>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 bg-white hover:bg-earth-50 text-earth-700 text-xs font-medium px-4 py-2 rounded-full border border-earth-200 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                        <button className="flex items-center gap-1.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                          <Truck className="h-3.5 w-3.5" />
                          Track Package
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-400">
                  <Package className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-earth-800">No Order History</h3>
                  <p className="text-xs text-earth-400">You haven't made any purchases with us yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-earth-100">
              <div>
                <h2 className="text-xl font-bold text-earth-900">Order Details</h2>
                <p className="text-xs text-earth-500 mt-1">Order #{selectedOrder.id} • {selectedOrder.date || new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-earth-400 hover:text-earth-700 hover:bg-earth-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Status and Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-earth-50/50 rounded-xl border border-earth-100">
                <div>
                  <span className="text-xs font-semibold text-earth-500 block mb-1">Status</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <span className="text-xs font-semibold text-earth-500 block mb-1">Tracking Number</span>
                    <span className="text-sm font-mono font-medium text-earth-800">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-xs font-semibold text-earth-500 block mb-1">Total Amount</span>
                  <span className="text-base font-bold text-earth-900">THB {selectedOrder.total}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-sm font-bold text-earth-800 mb-4 border-b border-earth-100 pb-2">Items in Your Order</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={item.id || idx} className="flex gap-4 p-3 hover:bg-earth-50/50 rounded-xl transition-colors">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 bg-earth-100 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-earth-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-semibold text-earth-800 text-sm">{item.name}</h4>
                          <p className="text-xs text-earth-500 mt-1">{item.detail}</p>
                        </div>
                        <div className="font-bold text-earth-900 text-sm mt-2">
                          THB {item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Shipping Address */}
                <div className="space-y-3 p-4 bg-earth-50 rounded-xl border border-earth-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-earth-500">Shipping Address</h3>
                  <div className="text-sm text-earth-800 space-y-1">
                    <p className="font-semibold">{selectedOrder.customer}</p>
                    <p className="text-earth-600 leading-relaxed">{selectedOrder.address}</p>
                    {selectedOrder.phone && <p className="text-earth-600 mt-2 flex items-center gap-2">📞 {selectedOrder.phone}</p>}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 p-4 bg-earth-50 rounded-xl border border-earth-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-earth-500">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-earth-600">
                      <span>Subtotal ({selectedOrder.itemsCount} items)</span>
                      <span>THB {selectedOrder.subTotal || selectedOrder.total}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sage-600">
                        <span>Discount {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ''}</span>
                        <span>-THB {selectedOrder.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-earth-600">
                      <span>Shipping</span>
                      <span>{selectedOrder.shipping === 0 ? 'Free' : `THB ${selectedOrder.shipping}`}</span>
                    </div>
                    <div className="border-t border-earth-200/60 pt-2 mt-2 flex justify-between font-bold text-earth-900">
                      <span>Total</span>
                      <span>THB {selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
