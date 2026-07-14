"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Leaf, Eye, Truck, Package, Box } from 'lucide-react';
import { getOrdersByUser } from '../../utils/localStorageHelper';
import { useCurrentUser } from '../../context/UserContext';

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
  const { currentUser } = useCurrentUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (currentUser?.id) {
      setOrders(getOrdersByUser(currentUser.id));
    }
  }, [currentUser]);
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
              <h1 className="text-2xl font-bold text-earth-900">ประวัติการสั่งซื้อ</h1>
              <p className="text-xs text-earth-500 mt-1">ติดตามสถานะคำสั่งซื้อ ตรวจสอบประวัติการแลกแต้ม และดูสถิติการช่วยโลกของคุณ</p>
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
                        <span className="text-xs font-semibold text-earth-400 block">หมายเลขคำสั่งซื้อ</span>
                        <span className="text-sm font-bold text-earth-800">{order.id}</span>
                      </div>
                      <div className="space-y-1 sm:text-right">
                        <span className="text-xs font-semibold text-earth-400 block">วันที่ทำรายการ</span>
                        <span className="text-sm text-earth-700">{order.date}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-earth-400 block sm:text-right">สถานะจัดส่ง</span>
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
                          <p className="text-xs text-earth-400 mt-0.5">สินค้าทั้งหมด {order.itemsCount} ชิ้น</p>
                        </div>
                      </div>

                      {/* Carbon footprint savings */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 border border-sage-100 rounded-xl">
                        <Leaf className="h-4 w-4 text-sage-600" />
                        <div className="text-left">
                          <span className="block text-[9px] text-sage-700 font-semibold uppercase leading-none">Carbon Saved</span>
                          <span className="block text-xs font-bold text-sage-800">{order.carbonSaved}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer of card */}
                    <div className="flex items-center justify-between pt-4 border-t border-earth-100/60 flex-wrap gap-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-earth-400">ยอดชำระสุทธิ:</span>
                        <span className="text-base font-bold text-earth-900">${order.total}</span>
                      </div>

                      <div className="flex gap-2 items-center">
                        {order.status === 'Shipped' && order.trackingNumber && (
                          <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-earth-50 rounded-lg border border-earth-200 text-xs">
                            <Box className="h-4 w-4 text-earth-500" />
                            <span className="text-earth-500 font-semibold">Tracking:</span>
                            <span className="text-earth-800 font-mono tracking-wider">{order.trackingNumber}</span>
                          </div>
                        )}
                        <button className="flex items-center gap-1.5 bg-white hover:bg-earth-50 text-earth-700 text-xs font-medium px-4 py-2 rounded-full border border-earth-200 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                          ดูรายละเอียด
                        </button>
                        <button className="flex items-center gap-1.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
                          <Truck className="h-3.5 w-3.5" />
                          ติดตามพัสดุ
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
                  <h3 className="font-semibold text-earth-800">ไม่มีประวัติการสั่งซื้อ</h3>
                  <p className="text-xs text-earth-400">คุณยังไม่ได้ทำรายการซื้อเสื้อผ้ากับเราในตอนนี้</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
