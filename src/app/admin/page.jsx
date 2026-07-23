'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Leaf, Droplets, Wind, Trash2, Banknote, Shirt, Award, Truck, Ticket, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminGuard } from '../../hooks/useRoleGuard';
import { useToast } from '../../components/ui/ToastProvider';

export default function AdminDashboard() {
  const { isAllowed } = useAdminGuard();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('30 Days');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ecoStats, setEcoStats] = useState({ items: 0, water: '0', co2: '0', waste: '0' });
  const [dashboardStats, setDashboardStats] = useState({ revenue: 0, activeOrders: 0, newUsers: 0, topCategory: 'None', topCategoryCount: 0 });
  const [trends, setTrends] = useState({ revenue: 0, activeOrders: 0, items: 0, users: 0 });
  const [promotions, setPromotions] = useState([]);

  // Show access denied toast if redirected from a protected page
  useEffect(() => {
    if (searchParams.get('denied') === '1') {
      addToast('Access denied — you do not have permission to view that page.');
      router.replace('/admin');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, settingsRes, promosRes, usersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/settings'),
          fetch('/api/promotions'),
          fetch('/api/users'),
          fetch('/api/products')
        ]);
        const localOrders = await ordersRes.json();
        const storedSettings = await settingsRes.json();
        const localPromos = await promosRes.json();
        const localUsers = await usersRes.json();
        const localProducts = await productsRes.json();

        setOrders(localOrders);
        setPromotions(localPromos);
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Calculate Eco Stats
        const deliveredOrders = localOrders.filter(order => {
          if (order.status !== 'Delivered') return false;
          const d = new Date(order.createdAt || order.date);
          if (timeFilter === '30 Days') return d.getTime() > now.getTime() - (30 * 24 * 60 * 60 * 1000);
          if (timeFilter === '7 Days') return d.getTime() > now.getTime() - (7 * 24 * 60 * 60 * 1000);
          if (timeFilter === '12 Months') return d.getFullYear() === thisYear;
          return true;
        });

        let base = deliveredOrders.reduce((sum, o) => sum + (o.items?.length || o.itemCount || 1), 0);

        // Fetch Eco Multipliers from Settings
        let ecoWater = 2700;
        let ecoCO2 = 6.5;
        let ecoWaste = 0.2;
        
        if (storedSettings && Object.keys(storedSettings).length > 0) {
          ecoWater = storedSettings.ecoWater || ecoWater;
          ecoCO2 = storedSettings.ecoCO2 || ecoCO2;
          ecoWaste = storedSettings.ecoWaste || ecoWaste;
        }

        setEcoStats({
          items: base,
          water: (base * ecoWater).toLocaleString(),
          co2: (base * ecoCO2).toFixed(1),
          waste: (base * ecoWaste).toFixed(1),
        });

        // ------------------ DYNAMIC TREND CALCULATION ------------------
        let isCurrentPeriod, isPrevPeriod;
        let msInPeriod = 30 * 24 * 60 * 60 * 1000;

        if (timeFilter === '7 Days') {
          msInPeriod = 7 * 24 * 60 * 60 * 1000;
          isCurrentPeriod = (d) => d.getTime() > now.getTime() - msInPeriod;
          isPrevPeriod = (d) => { const t = d.getTime(); return t > now.getTime() - (2 * msInPeriod) && t <= now.getTime() - msInPeriod; };
        } else if (timeFilter === '30 Days') {
          msInPeriod = 30 * 24 * 60 * 60 * 1000;
          isCurrentPeriod = (d) => d.getTime() > now.getTime() - msInPeriod;
          isPrevPeriod = (d) => { const t = d.getTime(); return t > now.getTime() - (2 * msInPeriod) && t <= now.getTime() - msInPeriod; };
        } else {
          isCurrentPeriod = (d) => d.getFullYear() === now.getFullYear();
          isPrevPeriod = (d) => d.getFullYear() === now.getFullYear() - 1;
        }

        let categoryCounts = {};
        let currentRev = 0, prevRev = 0;
        let currentActive = 0, prevActive = 0;
        let currentItems = 0, prevItems = 0;
        let currentUsers = 0, prevUsers = 0;

        localOrders.forEach(o => {
          const d = new Date(o.createdAt || o.date);
          const rev = (o.status === 'Shipped' || o.status === 'Delivered') ? (o.total || 0) : 0;
          const items = (o.status === 'Delivered') ? (o.items?.length || o.itemCount || 1) : 0;
          const isActive = (o.status === 'Pending' || o.status === 'Processing') ? 1 : 0;

          if (isCurrentPeriod(d)) {
            currentRev += rev;
            currentItems += items;
            currentActive += isActive;

            if ((o.status === 'Shipped' || o.status === 'Delivered') && o.items && Array.isArray(o.items)) {
              o.items.forEach(item => {
                const prod = localProducts.find(p => p.id === item.id || p.name === item.name);
                const cat = prod?.category || 'Uncategorized';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + (item.quantity || 1);
              });
            }
          } else if (isPrevPeriod(d)) {
            prevRev += rev;
            prevItems += items;
            prevActive += isActive;
          }
        });

        // Calculate New Users (Real data only, exclude admin/staff)
        localUsers.forEach(u => {
          if (u.role === 'admin' || u.role === 'staff') return;
          
          const dateStr = u.joinDate || u.createdAt;
          if (!dateStr) return;

          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return; // skip invalid dates
          
          if (isCurrentPeriod(d)) currentUsers++;
          else if (isPrevPeriod(d)) prevUsers++;
        });

        const calcTrend = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
        
        let tRev = calcTrend(currentRev, prevRev);
        let tActive = calcTrend(currentActive, prevActive);
        let tItems = calcTrend(currentItems, prevItems);
        let tUsers = calcTrend(currentUsers, prevUsers);

        setTrends({ revenue: tRev, activeOrders: tActive, items: tItems, users: tUsers });

        let topCategory = 'None';
        let topCategoryCount = 0;
        Object.entries(categoryCounts).forEach(([cat, count]) => {
          if (count > topCategoryCount) {
            topCategoryCount = count;
            topCategory = cat;
          }
        });

        // ------------------ MAIN STATS ------------------
        setDashboardStats({
          revenue: currentRev,
          activeOrders: currentActive,
          newUsers: currentUsers,
          topCategory: topCategory,
          topCategoryCount: topCategoryCount
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeFilter]);

  const getChartData = () => {
    const confirmedOrders = orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered');
    const now = new Date();
    
    if (timeFilter === '7 Days') {
      const buckets = { 'Mon': { revenue: 0, items: 0 }, 'Tue': { revenue: 0, items: 0 }, 'Wed': { revenue: 0, items: 0 }, 'Thu': { revenue: 0, items: 0 }, 'Fri': { revenue: 0, items: 0 }, 'Sat': { revenue: 0, items: 0 }, 'Sun': { revenue: 0, items: 0 } };
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      confirmedOrders.forEach(o => {
        const d = new Date(o.createdAt || o.date);
        if (d.getTime() > now.getTime() - (7 * 24 * 60 * 60 * 1000)) {
          buckets[days[d.getDay()]].revenue += o.total;
          buckets[days[d.getDay()]].items += (o.items?.length || o.itemCount || 1);
        }
      });
      return Object.keys(buckets).map(time => ({ time, ...buckets[time] }));
    } else if (timeFilter === '30 Days') {
      const buckets = { 'Week 1': { revenue: 0, items: 0 }, 'Week 2': { revenue: 0, items: 0 }, 'Week 3': { revenue: 0, items: 0 }, 'Week 4': { revenue: 0, items: 0 } };
      confirmedOrders.forEach(o => {
        const d = new Date(o.createdAt || o.date);
        if (d.getTime() > now.getTime() - (30 * 24 * 60 * 60 * 1000)) {
          const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
          const w = 4 - Math.floor(diffDays / 7);
          const weekKey = w >= 1 && w <= 4 ? `Week ${w}` : 'Week 1';
          buckets[weekKey].revenue += o.total;
          buckets[weekKey].items += (o.items?.length || o.itemCount || 1);
        }
      });
      return Object.keys(buckets).map(time => ({ time, ...buckets[time] }));
    } else {
      const buckets = { 'Jan': { revenue: 0, items: 0 }, 'Feb': { revenue: 0, items: 0 }, 'Mar': { revenue: 0, items: 0 }, 'Apr': { revenue: 0, items: 0 }, 'May': { revenue: 0, items: 0 }, 'Jun': { revenue: 0, items: 0 }, 'Jul': { revenue: 0, items: 0 }, 'Aug': { revenue: 0, items: 0 }, 'Sep': { revenue: 0, items: 0 }, 'Oct': { revenue: 0, items: 0 }, 'Nov': { revenue: 0, items: 0 }, 'Dec': { revenue: 0, items: 0 } };
      const monthNames = Object.keys(buckets);
      confirmedOrders.forEach(o => {
        const d = new Date(o.createdAt || o.date);
        if (d.getFullYear() === now.getFullYear()) {
          buckets[monthNames[d.getMonth()]].revenue += o.total;
          buckets[monthNames[d.getMonth()]].items += (o.items?.length || o.itemCount || 1);
        }
      });
      return Object.keys(buckets).map(time => ({ time, ...buckets[time] }));
    }
  };

  const chartData = getChartData();

  const getPeriodText = () => {
    if (timeFilter === '7 Days') return 'week';
    if (timeFilter === '30 Days') return 'month';
    if (timeFilter === '12 Months') return 'year';
    return timeFilter.toLowerCase();
  };

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4A533D]/20 border-t-[#4A533D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Time Filter Toggle */}
      <div className="flex justify-end mb-2">
        <div className="flex bg-[#EAE5DB]/50 rounded-lg p-1">
          {['7 Days', '30 Days', '12 Months'].map(t => (
            <button 
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-6 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                timeFilter === t 
                  ? 'bg-[#4A533D] text-white shadow-sm' 
                  : 'text-[#5C5C58] hover:text-[#2D2D2A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Revenue - dark green */}
        <div className="bg-[#4A533D] text-white rounded-3xl p-7 flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full border border-white/20 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <Banknote className="w-5 h-5 mb-3 text-white/80" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1">Total Revenue</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mt-4 relative z-10">
            <p className="text-4xl font-serif tracking-tight">THB {dashboardStats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Active Orders - salmon */}
        <div className="bg-[#FFAA85] text-[#5A3828] rounded-3xl p-7 flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <ShoppingCart className="w-5 h-5 mb-3 text-[#5A3828]/80" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5A3828]/70 mb-1">Active Orders</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mt-4 relative z-10">
            <p className="text-4xl font-serif tracking-tight">{dashboardStats.activeOrders}</p>
          </div>
        </div>

        {/* Top Category - warm cream */}
        <div className="bg-[#EAE5DB] text-[#2D2D2A] rounded-3xl p-7 flex flex-col justify-between min-h-[160px] group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <Shirt className="w-5 h-5 mb-3 text-[#2D2D2A]/80" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5C5C58] mb-1">Top Category</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <p className="text-3xl sm:text-4xl font-serif tracking-tight truncate max-w-full">{dashboardStats.topCategory}</p>
            <span className="text-xs font-semibold text-[#8B8B88] whitespace-nowrap">{dashboardStats.topCategoryCount > 0 ? `${dashboardStats.topCategoryCount} sold` : ''}</span>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-3 gap-6">

        {/* Circulation Trends Chart */}
        <div className="col-span-2 bg-transparent rounded-3xl p-7 border border-[#EAE5DB]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-sm font-serif text-[#5C5C58]">Revenue Trends</h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#2D2D2A]">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#4A533D] inline-block"></span> Revenue</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A533D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4A533D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5DB" opacity={0.5} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8B8B88', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8B8B88', fontWeight: 500 }} tickFormatter={(value) => `THB ${value.toLocaleString()}`} />
                <Tooltip 
                  cursor={{ stroke: '#4A533D', strokeWidth: 1, strokeDasharray: '3 3', fill: 'transparent' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/90 backdrop-blur-md border border-[#EAE5DB] p-4 rounded-xl shadow-xl">
                          <p className="font-serif text-[#2D2D2A] font-bold text-sm mb-3 border-b border-[#EAE5DB] pb-2">{label}</p>
                          <p className="text-[#4A533D] font-bold text-sm mb-1 flex items-center justify-between gap-4">
                            <span>Revenue:</span> 
                            <span>THB {payload[0].value.toLocaleString()}</span>
                          </p>
                          <p className="text-[#8B8B88] font-semibold text-xs flex items-center justify-between gap-4">
                            <span>Items Circulated:</span> 
                            <span className="text-[#2D2D2A]">{payload[0].payload.items}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4A533D" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders (Live Orders) */}
        <div className="bg-white rounded-3xl p-7 border border-[#EAE5DB] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-serif text-[#5C5C58]">Recent Orders</h2>
          </div>
          <div className="flex-1 space-y-5">
            {orders.length > 0 ? (
              [...orders].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 4).map((order, idx) => {
                const getStatusColor = (status) => {
                  switch(status) {
                    case 'Pending': return 'bg-[#C57B57] text-white';
                    case 'Processing': return 'bg-blue-600 text-white';
                    case 'Shipped': return 'bg-[#3A4A2D] text-white';
                    case 'Delivered': return 'bg-emerald-600 text-white';
                    case 'Cancelled': return 'bg-red-500 text-white';
                    default: return 'bg-gray-100 text-gray-700';
                  }
                };
                return (
                  <div key={order.id || idx} className="flex justify-between items-center pb-4 border-b border-[#EAE5DB]/50 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-[#2D2D2A] mb-1">Order #{order.id}</p>
                      <p className="text-[10px] text-[#8B8B88]">{order.customer?.name || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-[#4A533D] mb-1">THB {order.total?.toLocaleString()}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-[#8B8B88] text-center mt-10">No recent orders.</div>
            )}
          </div>
          <button onClick={() => router.push('/admin/orders')} className="mt-8 text-[11px] font-semibold text-[#5F6B4E] underline underline-offset-4 text-left hover:text-[#4A533D] transition-colors">
            View All Orders
          </button>
        </div>
      </div>

      {/* Eco Impact Strip - Clean Premium Redesign */}
      <div className="bg-[#4A533D] rounded-3xl p-8 md:p-10 text-white shadow-xl mt-8 border border-[#3D4532] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full border border-white/10 opacity-50"></div>
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border border-white/10 opacity-50"></div>

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
            <Leaf className="w-6 h-6 text-[#93D5C5]" />
          </div>
          <h2 className="text-2xl font-serif text-[#E3E7D3] tracking-wide">
            Circulating <span className="text-white font-bold">{ecoStats.items}</span> items this {getPeriodText()} has saved:
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Water Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between min-h-[140px] hover:bg-white/10 transition-colors">
            <div>
              <Droplets className="w-5 h-5 mb-3 text-[#A8C7FA]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Water Saved (Liters)</p>
            </div>
            <p className="text-4xl font-serif tracking-tight">{ecoStats.water}</p>
          </div>
          
          {/* CO2 Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between min-h-[140px] hover:bg-white/10 transition-colors">
            <div>
              <Wind className="w-5 h-5 mb-3 text-[#93D5C5]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">CO2 Avoided (Kg)</p>
            </div>
            <p className="text-4xl font-serif tracking-tight">{ecoStats.co2}</p>
          </div>
          
          {/* Waste Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between min-h-[140px] hover:bg-white/10 transition-colors">
            <div>
              <Trash2 className="w-5 h-5 mb-3 text-[#FDE293]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Waste Prevented (Kg)</p>
            </div>
            <p className="text-4xl font-serif tracking-tight">{ecoStats.waste}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
