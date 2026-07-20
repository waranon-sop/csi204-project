'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, User, Cpu, MoreVertical, Edit2, Ban, Clock, CheckCircle2, Plus, Calendar, AlertTriangle, KeyRound, RefreshCcw, Filter } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/ToastProvider';
import { addAdminNotification } from '../../../utils/notifications';
import { useAdminGuard } from '../../../hooks/useAdminGuard';

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
  const { isAllowed } = useAdminGuard();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityLog, setActivityLog] = useState(mockActivityLog);
  const [activeTab, setActiveTab] = useState('staff');
  const [selectedUser, setSelectedUser] = useState(null); // unified modal
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // temp edit state inside unified modal
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  
  // Add Staff State
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' });
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();

    const localActivity = JSON.parse(localStorage.getItem('adminNotifications'));
    if (localActivity && localActivity.length > 0) {
      setActivityLog(localActivity);
    } else {
      setActivityLog(mockActivityLog);
    }
  }, []);

  const openUserModal = (user, editMode = false) => {
    setSelectedUser(user);
    setEditingUser({ ...user });
    setIsEditMode(editMode);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setEditingUser(null);
    setIsEditMode(false);
  };

  const handleSaveUser = async () => {
    // Prevent admin from changing their own role to non-admin
    if (editingUser.id === currentUser?.id && editingUser.role !== 'admin') {
      addToast('You cannot change your own admin role.');
      return;
    }
    
    try {
      await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
      setUsers(updatedUsers);
      addToast('User updated successfully');
      setSelectedUser(editingUser);
      setIsEditMode(false);
    } catch (err) {
      addToast('Failed to update user');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.password) return;
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const idPrefix = newStaff.role === 'admin' ? 'ADM' : 'STF';
    const addedUser = {
      id: `${idPrefix}-${randomNum}`,
      ...newStaff,
      joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      orders: 0,
      avatar: null // Will show initial letter fallback
    };
    
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addedUser)
      });
      const updatedUsers = [addedUser, ...users];
      setUsers(updatedUsers);
      addToast('New team member added successfully');
      addAdminNotification(currentUser?.name, 'Added a new team member', newStaff.name, 'user');
      setIsAddStaffModalOpen(false);
      setNewStaff({ name: '', email: '', password: '', role: 'staff' });
    } catch (err) {
      addToast('Failed to add user');
    }
  };

  const handleBanUser = (id) => {
    setUserToSuspend(id);
  };

  const confirmSuspend = async () => {
    if (userToSuspend) {
      const suspendedUser = users.find(u => u.id === userToSuspend);
      const updatedUser = { ...suspendedUser, status: 'suspended' };
      
      try {
        await fetch(`/api/users/${userToSuspend}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });
        
        const updatedUsers = users.map(u => u.id === userToSuspend ? updatedUser : u);
        setUsers(updatedUsers);

        // Kick the user's active session immediately
        const activeSession =
          JSON.parse(sessionStorage.getItem('currentUser')) ||
          JSON.parse(localStorage.getItem('currentUser'));
        if (activeSession && activeSession.id === userToSuspend) {
          localStorage.removeItem('currentUser');
          sessionStorage.removeItem('currentUser');
        }

        addToast('Account has been suspended.');
        if (suspendedUser) addAdminNotification(currentUser?.name, 'Suspended user', suspendedUser.name, 'user');
        closeUserModal();
        setUserToSuspend(null);
      } catch (err) {
        addToast('Failed to suspend user');
      }
    }
  };

  const handleUnsuspendUser = async (id) => {
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;
    
    const updatedUser = { ...userToUpdate, status: 'active' };
    
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const updatedUsers = users.map(u => u.id === id ? updatedUser : u);
      setUsers(updatedUsers);
      addToast('Account has been activated.');
      addAdminNotification(currentUser?.name, 'Activated user', userToUpdate.name, 'user');
      setEditingUser(null);
    } catch (err) {
      addToast('Failed to activate account');
    }
  };

  const handleResetPassword = async (user) => {
    const DEFAULT_PASSWORD = 'Rewear1234!';
    const updatedUser = { ...user, password: DEFAULT_PASSWORD };
    
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      addToast('Password has been reset to default');
      addAdminNotification(currentUser?.name, 'Reset password', user.name, 'user');
    } catch (err) {
      addToast('Failed to reset password');
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

  const getStatusBadge = (user) => {
    if (user.status === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCF5F3] text-[#A84C43] border border-[#E8D1CE] uppercase tracking-wider">
          <Ban className="w-2.5 h-2.5" /> Suspended
        </span>
      );
    }
    
    if (user.online) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF1EA] text-[#3A4A2D] border border-[#C9D1C1] uppercase tracking-wider">
          <CheckCircle2 className="w-2.5 h-2.5" /> Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-earth-100 text-earth-500 border border-earth-200 uppercase tracking-wider">
        <Clock className="w-2.5 h-2.5" /> Offline
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === 'staff'
      ? (user.role === 'admin' || user.role === 'staff')
      : user.role === 'customer';
    if (!matchesTab) return false;
    if (activeTab === 'staff') {
      if (statusFilter === 'active') return user.status !== 'suspended';
      if (statusFilter === 'suspended') return user.status === 'suspended';
    }
    return true;
  });

  const filteredActivityLog = activityLog.filter(log => {
    if (activityFilter === 'all') return true;
    return log.type === activityFilter;
  });

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4A533D]/20 border-t-[#4A533D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
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
        <div className="p-4 border-b border-earth-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-earth-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -tranearth-y-1/2 h-4 w-4 text-earth-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab === 'staff' ? 'staff' : 'customers'}...`}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500 text-sm transition-all"
            />
          </div>
          {activeTab === 'staff' && (
            <div className="flex items-center gap-1 bg-earth-100 rounded-lg p-1 shrink-0">
              {[['active', 'Active'], ['suspended', 'Suspended'], ['all', 'All']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    statusFilter === val ? 'bg-white text-earth-800 shadow-sm' : 'text-earth-500 hover:text-earth-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-earth-200 text-xs uppercase tracking-wider text-earth-500 bg-earth-50/50">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                {activeTab === 'staff' && (
                  <th className="px-6 py-4 font-semibold">Status</th>
                )}
                {activeTab === 'customers' && (
                  <th className="px-6 py-4 font-semibold">Join Date</th>
                )}
                {activeTab === 'customers' && (
                  <th className="px-6 py-4 font-semibold text-center">Orders Placed</th>
                )}
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100 text-sm">
              {filteredUsers.map((user, index) => (
                <tr 
                  key={`${user.id}-${index}`} 
                  className="hover:bg-earth-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-earth-200 bg-earth-100 shrink-0 flex items-center justify-center">
                        {user.avatar && !user.avatar.includes('unsplash.com') ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-earth-600 font-bold text-sm uppercase">
                            {user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-earth-800">{user.name}</p>
                        <p className="text-xs text-earth-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  {activeTab === 'staff' && (
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                  )}
                  {activeTab === 'customers' && (
                    <td className="px-6 py-4 text-earth-600">
                      {user.joinDate}
                    </td>
                  )}
                  {activeTab === 'customers' && (
                    <td className="px-6 py-4 text-center text-earth-600">{user.orders}</td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1.5 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded transition-colors" 
                        title="View Details" 
                        onClick={(e) => { e.stopPropagation(); openUserModal(user, false); }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-earth-500">
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
        <div className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden mt-8">
          <div className="p-5 border-b border-earth-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-earth-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-earth-500" />
              <h2 className="text-lg font-bold text-earth-800">Staff Activity Log</h2>
            </div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="text-sm border border-earth-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-earth-500 bg-white"
            >
              <option value="all">All Activities</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div className="divide-y divide-earth-100">
            {filteredActivityLog.map(log => (
              <div key={log.id} className="p-4 hover:bg-earth-50 transition-colors flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  log.type === 'product' ? 'bg-amber-50 text-amber-600' :
                  log.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-earth-50 text-earth-600'
                }`}>
                  {log.type === 'product' ? <Filter className="w-4 h-4" /> : 
                   log.type === 'order' ? <CheckCircle2 className="w-4 h-4" /> : 
                   <User className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-earth-800">
                    <span className="font-semibold">{log.user}</span> {log.action} <span className="font-semibold text-earth-600">{log.target}</span>
                  </p>
                  <p className="text-xs text-earth-500 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
            {filteredActivityLog.length === 0 && (
              <div className="p-8 text-center text-earth-500 text-sm">
                No activity found for the selected filter.
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Add Staff Modal */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
              <h2 className="text-xl font-bold text-earth-800">Add New Team Member</h2>
              <button 
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-earth-400 hover:text-earth-600 p-2 hover:bg-earth-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-earth-700">Full Name</label>
                  <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. John Doe" className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-earth-500/30 text-sm bg-earth-50 text-earth-800" required />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-earth-700">Email Address</label>
                  <input type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} placeholder="john.doe@rewear.com" className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-earth-500/30 text-sm bg-earth-50 text-earth-800" required />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-earth-700">Password</label>
                  <input type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} placeholder="Enter initial password" className="w-full px-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-earth-500/30 text-sm bg-earth-50 text-earth-800" required minLength={6} />
                </div>
                
                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-semibold text-earth-700">Assign Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border p-4 rounded-xl cursor-pointer transition-all ${newStaff.role === 'staff' ? 'border-earth-500 bg-earth-50/50 shadow-sm ring-1 ring-earth-500' : 'border-earth-200 hover:border-earth-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <input type="radio" name="newrole" className="text-earth-600 focus:ring-earth-500 w-4 h-4" checked={newStaff.role === 'staff'} onChange={() => setNewStaff({...newStaff, role: 'staff'})} />
                        <Cpu className="w-4 h-4 text-earth-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-earth-800">Staff</p>
                        <p className="text-xs text-earth-500 leading-relaxed mt-0.5">Manage products and process orders.</p>
                      </div>
                    </label>

                    <label className={`border p-4 rounded-xl cursor-pointer transition-all ${newStaff.role === 'admin' ? 'border-earth-500 bg-earth-50/50 shadow-sm ring-1 ring-earth-500' : 'border-earth-200 hover:border-earth-300'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <input type="radio" name="newrole" className="text-earth-600 focus:ring-earth-500 w-4 h-4" checked={newStaff.role === 'admin'} onChange={() => setNewStaff({...newStaff, role: 'admin'})} />
                        <ShieldAlert className="w-4 h-4 text-earth-800" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-earth-800">Admin</p>
                        <p className="text-xs text-earth-500 leading-relaxed mt-0.5">Full access including team management.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-earth-100 flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsAddStaffModalOpen(false)} className="px-6 py-2 text-earth-600 bg-white border border-earth-300 rounded-lg hover:bg-earth-50 font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 text-white bg-earth-600 rounded-lg hover:bg-earth-700 font-medium shadow-sm transition-colors">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Unified User Details / Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-earth-200 bg-earth-100 flex items-center justify-center shrink-0">
                  {selectedUser.avatar && !selectedUser.avatar.includes('unsplash.com') ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-earth-600 font-bold uppercase">{selectedUser.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-earth-800 leading-none">{selectedUser.name}</p>
                  <p className="text-xs text-earth-500 mt-0.5">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={closeUserModal} className="text-earth-400 hover:text-earth-600 p-1.5 hover:bg-earth-100 rounded-full transition-colors">✕</button>
            </div>

            {/* Tab Bar (only for staff/admin that aren't self) */}
            {(selectedUser.role === 'staff' || selectedUser.role === 'admin') && selectedUser.id !== currentUser?.id && (
              <div className="flex border-b border-earth-200 bg-earth-50/50">
                <button
                  onClick={() => setIsEditMode(false)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
                    !isEditMode ? 'border-[#3A4A2D] text-[#3A4A2D]' : 'border-transparent text-earth-400 hover:text-earth-600'
                  }`}
                >Details</button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
                    isEditMode ? 'border-[#3A4A2D] text-[#3A4A2D]' : 'border-transparent text-earth-400 hover:text-earth-600'
                  }`}
                >Edit</button>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1">
              {!isEditMode ? (
                /* ── VIEW MODE ── */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-earth-50 rounded-xl p-4 border border-earth-100">
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mb-1">Role</p>
                      <div>{getRoleBadge(selectedUser.role)}</div>
                    </div>
                    <div className="bg-earth-50 rounded-xl p-4 border border-earth-100">
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mb-1">Status</p>
                      <div>{getStatusBadge(selectedUser)}</div>
                    </div>
                    <div className="bg-earth-50 rounded-xl p-4 border border-earth-100">
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mb-1">Employee ID</p>
                      <p className="text-sm font-semibold text-earth-800">{selectedUser.id}</p>
                    </div>
                    <div className="bg-earth-50 rounded-xl p-4 border border-earth-100">
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mb-1">Join Date</p>
                      <p className="text-sm font-semibold text-earth-800">{selectedUser.joinDate || '—'}</p>
                    </div>
                  </div>

                  <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
                    <h4 className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-earth-400 text-xs mb-1">Email</p>
                        <p className="font-semibold text-earth-700 truncate">{selectedUser.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-earth-400 text-xs mb-1">Phone</p>
                        <p className="font-semibold text-earth-700">{selectedUser.phone || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedUser.role === 'customer' && (
                    <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-earth-400 text-xs mb-1">Join Date</p>
                          <p className="font-semibold text-earth-700">{selectedUser.joinDate}</p>
                        </div>
                        <div>
                          <p className="text-earth-400 text-xs mb-1">Total Orders</p>
                          <p className="font-semibold text-earth-700">{selectedUser.orders} orders</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons — staff/admin only, not self */}
                  {(selectedUser.role === 'staff' || selectedUser.role === 'admin') && selectedUser.id !== currentUser?.id && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mb-2">Account Management</p>
                      {selectedUser.status !== 'suspended' && (
                        <button
                          onClick={() => { handleResetPassword(selectedUser); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-earth-700 bg-earth-50 border border-earth-200 rounded-xl hover:bg-earth-100 transition-colors"
                        >
                          <RefreshCcw className="w-4 h-4 text-earth-500" />
                          Reset Password
                          <span className="ml-auto text-xs text-earth-400">→ Rewear1234!</span>
                        </button>
                      )}
                      {selectedUser.status !== 'suspended' ? (
                        <button
                          onClick={() => handleBanUser(selectedUser.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Ban className="w-4 h-4" /> Suspend Account
                        </button>
                      ) : (
                        <button
                          onClick={() => { handleUnsuspendUser(selectedUser.id); setSelectedUser({...selectedUser, status: 'active'}); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Activate Account
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* ── EDIT MODE ── */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-earth-700">Change Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-earth-400" />
                      <input
                        type="text"
                        value={editingUser?.password || ''}
                        onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                        placeholder="Type to set a new password..."
                        className="w-full px-4 py-2 pl-9 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-earth-500/30 text-sm bg-earth-50 text-earth-800"
                      />
                    </div>
                    <p className="text-[10px] text-earth-500">Leave blank to keep the current password.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-earth-700">Assign Role</label>
                    <div className="space-y-2">
                      <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${editingUser?.role === 'admin' ? 'border-earth-500 bg-earth-50/50' : 'border-earth-200 hover:bg-earth-50'}`}>
                        <input type="radio" name="role" className="w-4 h-4" checked={editingUser?.role === 'admin'} onChange={() => setEditingUser({...editingUser, role: 'admin'})} />
                        <div className="ml-3 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-earth-800" />
                          <div>
                            <p className="text-sm font-medium text-earth-800">Admin</p>
                            <p className="text-xs text-earth-500">Full system access</p>
                          </div>
                        </div>
                      </label>
                      <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${editingUser?.role === 'staff' ? 'border-earth-500 bg-earth-50/50' : 'border-earth-200 hover:bg-earth-50'}`}>
                        <input type="radio" name="role" className="w-4 h-4" checked={editingUser?.role === 'staff'} onChange={() => setEditingUser({...editingUser, role: 'staff'})} />
                        <div className="ml-3 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-earth-600" />
                          <div>
                            <p className="text-sm font-medium text-earth-800">Staff</p>
                            <p className="text-xs text-earth-500">Can manage products & orders</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-earth-100 bg-earth-50/50 flex justify-end gap-2">
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)} className="px-5 py-2 text-sm text-earth-600 bg-white border border-earth-300 rounded-lg hover:bg-earth-50 font-medium transition-colors">Cancel</button>
                  <button onClick={handleSaveUser} className="px-5 py-2 text-sm text-white bg-earth-600 rounded-lg hover:bg-earth-700 font-medium shadow-sm transition-colors">Save Changes</button>
                </>
              ) : (
                <button onClick={closeUserModal} className="px-6 py-2 text-sm text-earth-600 bg-white border border-earth-300 rounded-lg hover:bg-earth-50 font-medium transition-colors shadow-sm">Close</button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Suspend Confirmation Modal */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-earth-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-earth-800 mb-2">Suspend User?</h2>
              <p className="text-sm text-earth-500">
                Are you sure you want to suspend this user? They will immediately lose access to the system.
              </p>
            </div>
            <div className="px-6 py-4 bg-earth-50 flex justify-end gap-3 border-t border-earth-200">
              <button 
                onClick={() => setUserToSuspend(null)} 
                className="px-5 py-2 border border-earth-300 rounded-xl text-sm text-earth-600 hover:bg-white font-medium transition-colors"
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
    </>
  );
}
