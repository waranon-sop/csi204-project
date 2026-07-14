'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, User, Cpu, MoreVertical, Edit2, Ban, Clock, CheckCircle2, Plus, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/ToastProvider';
import { addAdminNotification } from '../../../utils/notifications';

const mockUsers = [
  {
    id: 'USR-001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'customer',
    joinDate: '14 Jul 2026',
    orders: 12,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: 'USR-002',
    name: 'สมศักดิ์ ขยันทำงาน',
    email: 'somsak.staff@rewear.com',
    role: 'staff',
    joinDate: '10 Jan 2025',
    orders: 0,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: 'USR-003',
    name: 'ยิ่งยศ ผู้ดูแลระบบ',
    email: 'admin@rewear.com',
    role: 'admin',
    joinDate: '01 Jan 2024',
    orders: 2,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: 'USR-004',
    name: 'Emma Watson',
    email: 'emma.w@example.com',
    role: 'customer',
    joinDate: '12 Jul 2026',
    orders: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100'
  }
];

const mockActivityLog = [
  { id: 1, user: 'สมศักดิ์ ขยันทำงาน', action: 'Added a new product', target: 'Vintage Denim Jacket', time: '10 mins ago', type: 'product' },
  { id: 2, user: 'สมศักดิ์ ขยันทำงาน', action: 'Updated order status to Shipped', target: '#ORD-2026-8899', time: '1 hour ago', type: 'order' },
  { id: 3, user: 'ยิ่งยศ ผู้ดูแลระบบ', action: 'Changed role for user', target: 'Emma Watson', time: '3 hours ago', type: 'user' },
  { id: 4, user: 'สมศักดิ์ ขยันทำงาน', action: 'Hid product from store', target: 'Classic White Tee', time: '5 hours ago', type: 'product' },
];

export default function AdminUsersManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [activityLog, setActivityLog] = useState(mockActivityLog);
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'customers'
  const [editingUser, setEditingUser] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Add Staff State
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'staff' });
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem('users')) || [];
    if (localUsers.length > 0) {
      setUsers(localUsers);
    } else {
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }

    const localActivity = JSON.parse(localStorage.getItem('adminNotifications'));
    if (localActivity && localActivity.length > 0) {
      setActivityLog(localActivity);
    } else {
      setActivityLog(mockActivityLog);
    }
  }, []);

  const handleSaveUser = () => {
    // Prevent admin from changing their own role to non-admin
    if (editingUser.id === currentUser?.id && editingUser.role !== 'admin') {
      addToast('You cannot change your own admin role.');
      setEditingUser(null);
      return;
    }
    const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    addToast('User role updated successfully');
    setEditingUser(null);
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;
    const addedUser = {
      id: `USR-${Math.floor(Math.random() * 900) + 100}`,
      ...newStaff,
      joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      orders: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' // Default avatar
    };
    const updatedUsers = [addedUser, ...users];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    addToast('New team member added successfully');
    addAdminNotification(currentUser?.name, 'Added a new team member', newStaff.name, 'user');
    setIsAddStaffModalOpen(false);
    setNewStaff({ name: '', email: '', role: 'staff' });
  };

  const handleBanUser = (id) => {
    setUserToSuspend(id);
  };

  const confirmSuspend = () => {
    if (userToSuspend) {
      const suspendedUser = users.find(u => u.id === userToSuspend);
      const updatedUsers = users.filter(u => u.id !== userToSuspend);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      addToast('User has been suspended');
      if (suspendedUser) addAdminNotification(currentUser?.name, 'Suspended user', suspendedUser.name, 'user');
      setEditingUser(null);
      setUserToSuspend(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#2C3B28] text-white uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3" />
            Admin
          </span>
        );
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#5F6B4E] text-white uppercase tracking-wider">
            <Cpu className="w-3 h-3" />
            Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-earth-100 text-earth-600 border border-earth-200 uppercase tracking-wider">
            <User className="w-3 h-3" />
            Customer
          </span>
        );
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'staff') return user.role === 'admin' || user.role === 'staff';
    return user.role === 'customer';
  });

  const filteredActivityLog = activityLog.filter(log => {
    if (activityFilter === 'all') return true;
    return log.type === activityFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-semibold text-earth-700">Team & Access Control</h2>
          <p className="text-earth-400 text-sm mt-0.5">Manage staff & admin accounts and access levels.</p>
        </div>
        {activeTab === 'staff' && (
          <button 
            onClick={() => setIsAddStaffModalOpen(true)}
            className="bg-[#3A4A2D] hover:bg-[#4A5E3A] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-earth-200">
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-6 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'staff'
              ? 'border-[#3A4A2D] text-[#3A4A2D]'
              : 'border-transparent text-earth-400 hover:text-earth-700 hover:border-earth-300'
          }`}
        >
          Staff & Admins
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-6 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'customers'
              ? 'border-[#3A4A2D] text-[#3A4A2D]'
              : 'border-transparent text-earth-400 hover:text-earth-700 hover:border-earth-300'
          }`}
        >
          Customers
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab === 'staff' ? 'staff' : 'customers'}...`}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                {activeTab === 'customers' && (
                  <th className="px-6 py-4 font-semibold">Join Date</th>
                )}
                {activeTab === 'staff' && (
                  <th className="px-6 py-4 font-semibold text-center">Managed Orders</th>
                )}
                {activeTab === 'customers' && (
                  <th className="px-6 py-4 font-semibold text-center">Orders Placed</th>
                )}
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <Image 
                          src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'} 
                          alt={user.name}
                          fill
                          sizes="40px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  {activeTab === 'customers' && (
                    <td className="px-6 py-4 text-slate-600">
                      {user.joinDate}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center text-slate-600">
                    {activeTab === 'staff' && user.role === 'admin' ? '-' : user.orders}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {((currentUser ? currentUser.email : 'admin@rewear.com') !== user.email) && (
                        <button 
                          className="p-1.5 text-slate-400 hover:text-sage-600 hover:bg-sage-50 rounded transition-colors" 
                          title="Edit Role"
                          onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" 
                        title="View Details" 
                        onClick={(e) => { e.stopPropagation(); setDetailsUser(user); }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log Section (Only show on Staff tab) */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Staff Activity Log</h2>
            </div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-500 bg-white"
            >
              <option value="all">All Activities</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredActivityLog.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  log.type === 'product' ? 'bg-amber-50 text-amber-600' :
                  log.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-sage-50 text-sage-600'
                }`}>
                  {log.type === 'product' ? <Filter className="w-4 h-4" /> : 
                   log.type === 'order' ? <CheckCircle2 className="w-4 h-4" /> : 
                   <User className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{log.user}</span> {log.action} <span className="font-semibold text-slate-600">{log.target}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
            {filteredActivityLog.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No activity found for the selected filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Add New Team Member</h2>
              <button 
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. John Doe" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/30 text-sm bg-slate-50 text-slate-800" required />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} placeholder="john.doe@rewear.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/30 text-sm bg-slate-50 text-slate-800" required />
                </div>
                
                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-semibold text-slate-700">Assign Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border p-4 rounded-xl cursor-pointer transition-all ${newStaff.role === 'staff' ? 'border-sage-500 bg-sage-50/50 shadow-sm ring-1 ring-sage-500' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <input type="radio" name="newrole" className="text-sage-600 focus:ring-sage-500 w-4 h-4" checked={newStaff.role === 'staff'} onChange={() => setNewStaff({...newStaff, role: 'staff'})} />
                        <Cpu className="w-4 h-4 text-sage-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Staff</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Manage products and process orders.</p>
                      </div>
                    </label>

                    <label className={`border p-4 rounded-xl cursor-pointer transition-all ${newStaff.role === 'admin' ? 'border-sage-500 bg-sage-50/50 shadow-sm ring-1 ring-sage-500' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <input type="radio" name="newrole" className="text-sage-600 focus:ring-sage-500 w-4 h-4" checked={newStaff.role === 'admin'} onChange={() => setNewStaff({...newStaff, role: 'admin'})} />
                        <ShieldAlert className="w-4 h-4 text-slate-800" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Admin</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Full access including team management.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsAddStaffModalOpen(false)} className="px-6 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 text-white bg-sage-600 rounded-lg hover:bg-sage-700 font-medium shadow-sm transition-colors">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Edit User Role</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <Image 
                    src={editingUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'} 
                    alt={editingUser.name}
                    fill
                    sizes="48px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{editingUser.name}</p>
                  <p className="text-xs text-slate-500">{editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Assign Role</label>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${editingUser.role === 'admin' ? 'border-sage-500 bg-sage-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="role" className="text-sage-600 focus:ring-sage-500 w-4 h-4" checked={editingUser.role === 'admin'} onChange={() => setEditingUser({...editingUser, role: 'admin'})} />
                    <div className="ml-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-slate-800" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Admin</p>
                        <p className="text-xs text-slate-500">Full system access</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${editingUser.role === 'staff' ? 'border-sage-500 bg-sage-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="role" className="text-sage-600 focus:ring-sage-500 w-4 h-4" checked={editingUser.role === 'staff'} onChange={() => setEditingUser({...editingUser, role: 'staff'})} />
                    <div className="ml-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sage-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Staff</p>
                        <p className="text-xs text-slate-500">Can manage products & orders</p>
                      </div>
                    </div>
                  </label>
                  
                  {/* Customer role option removed as per user request */}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-3">
              {editingUser.id !== currentUser?.id && (
                <button 
                  onClick={() => handleBanUser(editingUser.id)}
                  className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveUser}
                  className="px-4 py-2 text-sm text-white bg-sage-600 rounded-lg hover:bg-sage-700 font-medium shadow-sm transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">User Details</h2>
              <button 
                onClick={() => setDetailsUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col items-center justify-center text-center mb-8">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 mb-4 shadow-sm">
                  <Image 
                    src={detailsUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'} 
                    alt={detailsUser.name}
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold text-slate-800 text-xl">{detailsUser.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{detailsUser.email}</p>
                {getRoleBadge(detailsUser.role)}
              </div>

              {/* Specific info depending on role */}
              {(detailsUser.role === 'staff' || detailsUser.role === 'admin') ? (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Work Schedule
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Working Hours</p>
                        <p className="font-semibold text-slate-800 bg-white px-3 py-1.5 rounded border border-slate-200 inline-block">09:00 - 18:00</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Days Off</p>
                        <p className="font-semibold text-slate-800 bg-white px-3 py-1.5 rounded border border-slate-200 inline-block">Saturday, Sunday</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> System Activity Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                        <p className="text-xl font-bold text-slate-800 mb-0.5">{detailsUser.role === 'admin' ? '-' : detailsUser.orders}</p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Order Updates</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                        <p className="text-xl font-bold text-slate-800 mb-0.5">{detailsUser.role === 'admin' ? '-' : '45'}</p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Products Managed</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                        <p className="text-xl font-bold text-slate-800 mb-0.5">{detailsUser.role === 'admin' ? '-' : '2.4 hrs'}</p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Avg. Update Time</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                        <p className="text-xl font-bold text-slate-800 mb-0.5">{detailsUser.role === 'admin' ? '-' : '0.5%'}</p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Correction Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Customer Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Join Date</p>
                        <p className="font-semibold text-slate-800">{detailsUser.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Total Orders Placed</p>
                        <p className="font-semibold text-slate-800">{detailsUser.orders} orders</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setDetailsUser(null)}
                className="px-6 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Suspend Confirmation Modal */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Suspend User?</h2>
              <p className="text-sm text-slate-500">
                Are you sure you want to suspend this user? They will immediately lose access to the system.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
              <button 
                onClick={() => setUserToSuspend(null)} 
                className="px-5 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSuspend} 
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
