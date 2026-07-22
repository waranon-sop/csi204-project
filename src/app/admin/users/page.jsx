'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Crown, User, UserCog, MoreVertical, Edit, Ban, Clock, CheckCircle2, Plus, Calendar, AlertTriangle, KeyRound, RefreshCcw, ArrowUp, ArrowDown, ArrowUpDown, ArrowRight, X, Filter, Copy, Eye, EyeOff, Mail, Lock, Package, ShoppingBag, Phone, Camera, Save } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/ToastProvider';
import { addAdminNotification } from '../../../utils/notifications';
import { useAdminGuard } from '../../../hooks/useAdminGuard';

const formatRelativeTime = (timestamp) => {
  if (timestamp === 'Just now') return 'Just now';
  if (!timestamp) return 'Past activity';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp; // fallback

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 172800) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const deriveActionType = (action) => {
  if (!action) return null;
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('added') || lowerAction.includes('created')) return 'added';
  if (lowerAction.includes('updated') || lowerAction.includes('edited') || lowerAction.includes('changed')) return 'edited';
  if (lowerAction.includes('deleted') || lowerAction.includes('archived')) return 'archived';
  if (lowerAction.includes('suspended') || lowerAction.includes('activated')) return 'status_change';
  if (lowerAction.includes('reset') || lowerAction.includes('role')) return 'role_change';
  return null;
};

export default function AdminUsersManagement() {
  const { isAllowed } = useAdminGuard();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityLog, setActivityLog] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activityPage, setActivityPage] = useState(1);
  
  // Filtering and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [showPassword, setShowPassword] = useState(false);
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = async () => {
    setIsSavingUser(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedUser = await res.json();
      
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      setIsEditingUser(false);
      
      if (currentUser?.id === updatedUser.id) {
         const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
         const newLocalUsers = localUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
         localStorage.setItem('users', JSON.stringify(newLocalUsers));
         localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      addToast('User updated successfully!');
    } catch (err) {
      addToast('Error updating user', 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

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

    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) setActivityLog(await res.json());
      } catch (err) {}
    };
    fetchLogs();
  }, []);

  const logAndRefresh = async (user, action, target, type) => {
    await addAdminNotification(user, action, target, type);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) setActivityLog(await res.json());
    } catch (err) {}
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsEditingUser(false);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsEditingUser(false);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewStaff({...newStaff, password});
  };

  const handleRoleChange = async (newRole) => {
    if (selectedUser.id === currentUser?.id && selectedUser.role === 'admin' && newRole !== 'admin') {
      addToast('You cannot downgrade your own admin role.');
      return;
    }
    
    const updatedUser = { ...selectedUser, role: newRole };
    
    try {
      await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const updatedUsers = users.map(u => u.id === selectedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setSelectedUser(updatedUser);
      addToast('User role updated successfully');
      logAndRefresh(currentUser?.name, 'Changed role for user', selectedUser.name, 'user');
    } catch (err) {
      addToast('Failed to update user role');
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
      avatar: null,
      status: 'active'
    };
    
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addedUser)
      });
      const updatedUsers = [addedUser, ...users];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      addToast('New team member added successfully');
      logAndRefresh(currentUser?.name, 'Added a new team member', newStaff.name, 'user');
      setIsAddStaffModalOpen(false);
      setNewStaff({ name: '', email: '', password: '', role: 'staff' });
    } catch (err) {
      addToast('Failed to add user');
    }
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
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        addToast('Account has been suspended.');
        if (suspendedUser) logAndRefresh(currentUser?.name, 'Suspended user', suspendedUser.name, 'user');
        
        // Update selectedUser if the suspended user is currently viewed
        if (selectedUser?.id === userToSuspend) {
          setSelectedUser(updatedUser);
        }
        
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
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      addToast('Account has been activated.');
      logAndRefresh(currentUser?.name, 'Activated user', userToUpdate.name, 'user');
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      addToast('Failed to activate account');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3A4A2D] text-white uppercase tracking-widest shadow-sm">
            <Crown className="w-3 h-3" /> Admin
          </span>
        );
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#5F6B4E] text-white uppercase tracking-widest shadow-sm">
            <UserCog className="w-3 h-3" /> Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C57B57] text-white uppercase tracking-widest shadow-sm">
            <User className="w-3 h-3" /> Customer
          </span>
        );
    }
  };

  const getStatusBadge = (user) => {
    if (user.status === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Suspended
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Normal
      </span>
    );
  };

  const getActionBadge = (type) => {
    switch(type) {
      case 'added': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Added</span>;
      case 'edited': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">Edited</span>;
      case 'archived': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-earth-200 text-earth-700">Archived</span>;
      case 'status_change': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">Status</span>;
      case 'role_change': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">Role</span>;
      case 'refunded': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Refunded</span>;
      default: return null;
    }
  };

  const renderLogDetails = (details) => {
    if (!details) return null;
    
    if (details.includes('→')) {
      const parts = details.split('→');
      let before = parts[0].trim();
      let after = parts[1].trim();
      let prefix = '';
      
      if (before.includes(':')) {
        const colonIndex = before.indexOf(':');
        prefix = before.substring(0, colonIndex + 1) + ' ';
        before = before.substring(colonIndex + 1).trim();
      }

      return (
        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded border border-earth-200/60 bg-[#F9F7F4] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {prefix && <span className="text-earth-500 mr-1.5 text-xs">{prefix}</span>}
          <span className="text-[11px] font-medium text-earth-400 line-through decoration-earth-300/70">{before}</span>
          <ArrowRight className="w-3 h-3 mx-1.5 text-earth-400" />
          <span className="text-[11px] font-bold text-[#3A4A2D] bg-[#3A4A2D]/10 px-1.5 py-0.5 rounded-sm">{after}</span>
        </span>
      );
    }
    
    return <span className="text-earth-500 ml-2 text-xs border-l-[1.5px] border-earth-300 pl-2 leading-none">{details}</span>;
  };


  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower);
    
    let matchesRole = true;
    if (roleFilter !== 'All') {
      matchesRole = user.role.toLowerCase() === roleFilter.toLowerCase();
    }
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Normal') matchesStatus = user.status !== 'suspended';
      if (statusFilter === 'Suspended') matchesStatus = user.status === 'suspended';
    }
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredActivityLog = activityLog.filter(log => {
    if (activityFilter === 'all') return true;
    return log.type === activityFilter;
  });
  
  const ACTIVITY_ITEMS_PER_PAGE = 15;
  const totalActivityPages = Math.ceil(filteredActivityLog.length / ACTIVITY_ITEMS_PER_PAGE);
  const displayActivityLog = filteredActivityLog.slice(
    (activityPage - 1) * ACTIVITY_ITEMS_PER_PAGE, 
    activityPage * ACTIVITY_ITEMS_PER_PAGE
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'joinDate') {
      aValue = new Date(a.joinDate).getTime();
      bValue = new Date(b.joinDate).getTime();
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const displayUsers = sortedUsers; // Show all users matching filter

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4A533D]/20 border-t-[#4A533D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-earth-800">Team & Access Control</h2>
            <p className="text-earth-500 mt-1">Manage staff, admins, and customer accounts.</p>
          </div>
          <button 
            onClick={() => setIsAddStaffModalOpen(true)}
            className="bg-[#3A4A2D] hover:bg-[#4A5E3A] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-earth-200/60 overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-earth-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
              <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-earth-200 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-[#F9F7F4] text-earth-800 placeholder-earth-400"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="ml-auto px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 bg-[#F9F7F4] focus:outline-none cursor-pointer font-medium min-w-[140px]"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-earth-200 rounded-xl text-sm text-earth-600 bg-[#F9F7F4] focus:outline-none cursor-pointer font-medium min-w-[140px]"
            >
              <option value="All">All Status</option>
              <option value="Normal">Normal</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] border-y border-earth-100">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-earth-500">
                  <th className="px-6 py-4 rounded-tl-xl select-none whitespace-nowrap">
                    User
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[#3A4A2D]">
                      Role
                    </div>
                  </th>
                  <th className="px-6 py-4">Status</th>

                  <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((user) => (
                  <tr key={user.id} className="border-b border-earth-100/60 hover:bg-gradient-to-r hover:from-[#FDF9F0]/40 hover:to-transparent transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-earth-200 bg-earth-100 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                          {user.avatar && !user.avatar.includes('unsplash.com') ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-earth-600 font-bold text-sm uppercase">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-earth-800 text-sm group-hover:text-[#3A4A2D] transition-colors">{user.name}</p>
                          <p className="text-xs text-earth-500 mt-0.5 tracking-wide">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openUserModal(user)}
                        className="p-2 text-earth-400 hover:text-[#3A4A2D] hover:bg-earth-100 rounded-xl transition-colors inline-flex items-center justify-center"
                        title="Edit / View Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {displayUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-earth-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-earth-300" />
                      </div>
                      <p className="text-earth-500 font-medium text-sm">No users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log Section */}
        <div className="bg-white rounded-2xl border border-earth-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-earth-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-earth-500" />
              <div>
                <h2 className="text-lg font-bold text-earth-800">Team Activity Log</h2>
                <p className="text-xs text-earth-500 mt-0.5">Recent actions performed by staff and admins.</p>
              </div>
            </div>
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setActivityPage(1);
              }}
              className="text-sm border border-earth-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 bg-white text-earth-700 font-medium cursor-pointer"
            >
              <option value="all">All Activities</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div className="divide-y divide-earth-100/60">
            {displayActivityLog.map(log => (
              <div key={log.id} className="p-5 hover:bg-gradient-to-r hover:from-[#FDF9F0]/40 hover:to-transparent transition-colors flex items-start gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform ${
                  log.type === 'product' ? 'bg-[#FDF9F0] text-[#C57B57] border border-[#E8D1CE]' :
                  log.type === 'order' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-earth-100 text-earth-600 border border-earth-200'
                }`}>
                  {log.type === 'product' ? <Package className="w-4 h-4" /> : 
                   log.type === 'order' ? <ShoppingBag className="w-4 h-4" /> : 
                   <User className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-earth-800 group-hover:text-[#3A4A2D] transition-colors text-sm">{log.user}</span>
                    {getActionBadge(deriveActionType(log.action))}
                  </div>
                  <div className="text-sm text-earth-700 flex flex-wrap items-center gap-y-1">
                    <span>{log.action}</span>
                    <span className="font-semibold text-earth-900 ml-1">{log.target}</span>
                    {renderLogDetails(log.details)}
                  </div>
                  <p className="text-xs text-earth-400 mt-1">{formatRelativeTime(log.time)}</p>
                </div>
              </div>
            ))}
            {displayActivityLog.length === 0 && (
              <div className="p-8 text-center text-earth-500 text-sm">
                No activity found for the selected filter.
              </div>
            )}
          </div>
          
          {totalActivityPages > 1 && (
            <div className="px-6 py-4 border-t border-earth-100 flex items-center justify-between bg-[#F9F7F4]">
              <p className="text-xs text-earth-500 font-medium">
                Showing {((activityPage - 1) * ACTIVITY_ITEMS_PER_PAGE) + 1} to {Math.min(activityPage * ACTIVITY_ITEMS_PER_PAGE, filteredActivityLog.length)} of {filteredActivityLog.length} entries
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={activityPage === 1}
                  onClick={() => setActivityPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 text-xs font-semibold text-earth-600 bg-white border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button 
                  disabled={activityPage === totalActivityPages}
                  onClick={() => setActivityPage(prev => Math.min(totalActivityPages, prev + 1))}
                  className="px-3 py-1.5 text-xs font-semibold text-earth-600 bg-white border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-earth-100 flex justify-between items-center bg-[#F9F7F4]">
              <h2 className="text-lg font-bold text-earth-800 flex items-center gap-2">
                <User className="w-5 h-5 text-[#3A4A2D]" />
                Add Team Member
              </h2>
              <button onClick={() => setIsAddStaffModalOpen(false)} className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddStaff} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                    <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. John Doe" className="w-full pl-11 pr-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-white text-earth-800 transition-shadow" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                    <input type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} placeholder="john.doe@rewear.com" className="w-full pl-11 pr-4 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-white text-earth-800 transition-shadow" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={generatePassword} className="text-[10px] font-bold text-[#3A4A2D] hover:underline bg-[#FDF9F0] px-2 py-0.5 rounded border border-[#3A4A2D]/20 transition-colors hover:bg-[#3A4A2D] hover:text-white">Generate</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
                    <input type={showPassword ? "text" : "password"} value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} placeholder="Initial password" className="w-full pl-11 pr-10 py-2.5 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F6B4E]/30 text-sm bg-white text-earth-800 transition-shadow" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors p-1">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider mb-2">Assign Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border p-4 rounded-xl cursor-pointer transition-all ${newStaff.role === 'staff' ? 'border-[#3A4A2D] bg-[#FDF9F0] shadow-sm ring-1 ring-[#3A4A2D]' : 'border-earth-200 hover:border-earth-300 bg-white hover:bg-earth-50/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <input type="radio" name="newrole" className="hidden" checked={newStaff.role === 'staff'} onChange={() => setNewStaff({...newStaff, role: 'staff'})} />
                        <UserCog className={`w-5 h-5 ${newStaff.role === 'staff' ? 'text-[#3A4A2D]' : 'text-earth-400'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${newStaff.role === 'staff' ? 'text-[#3A4A2D]' : 'text-earth-800'}`}>Staff</p>
                        <p className="text-[10px] text-earth-500 mt-1 leading-tight">Can manage orders and products.</p>
                      </div>
                    </label>

                    <label className={`border p-4 rounded-xl cursor-pointer transition-all ${newStaff.role === 'admin' ? 'border-[#3A4A2D] bg-[#FDF9F0] shadow-sm ring-1 ring-[#3A4A2D]' : 'border-earth-200 hover:border-earth-300 bg-white hover:bg-earth-50/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <input type="radio" name="newrole" className="hidden" checked={newStaff.role === 'admin'} onChange={() => setNewStaff({...newStaff, role: 'admin'})} />
                        <Crown className={`w-5 h-5 ${newStaff.role === 'admin' ? 'text-[#3A4A2D]' : 'text-earth-400'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${newStaff.role === 'admin' ? 'text-[#3A4A2D]' : 'text-earth-800'}`}>Admin</p>
                        <p className="text-[10px] text-earth-500 mt-1 leading-tight">Full system and user access.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-earth-100/60 pt-6">
                  <button type="button" onClick={() => setIsAddStaffModalOpen(false)} className="px-5 py-2.5 text-earth-600 bg-white border border-earth-200 rounded-xl hover:bg-earth-50 font-medium text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 text-white bg-[#3A4A2D] rounded-xl hover:bg-[#4A5E3A] font-medium text-sm shadow-sm transition-colors">
                    Create Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Unified User Details / Profile Card Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative border border-[#EAE5DB]">
            {/* Header Controls */}
            <div className="flex justify-between items-center p-4 border-b border-[#EAE5DB] bg-[#FAF8F5]">
              <h3 className="font-bold text-[#2D2D2A]">
                {isEditingUser ? 'Edit User Profile' : 'User Details'}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditingUser && currentUser?.role === 'admin' && selectedUser?.role !== 'customer' && (
                  <button onClick={() => { setIsEditingUser(true); setEditFormData({ ...selectedUser, password: '' }); }} className="px-3 py-1.5 text-[#3A4A2D] bg-white border border-[#C2CBB8] hover:bg-[#EEF1EA] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm">
                    <Edit className="h-3.5 w-3.5" /> Edit User
                  </button>
                )}
                <button onClick={closeUserModal} className="p-1.5 text-[#8B8B88] hover:text-[#2D2D2A] bg-white border border-[#EAE5DB] hover:bg-gray-50 rounded-full transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="px-6 pb-6 pt-6 relative flex-1 overflow-y-auto max-h-[75vh]">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-[4px] border-[#FAF8F5] shadow-sm bg-[#EAE5DB] flex items-center justify-center">
                    {selectedUser.avatar && !selectedUser.avatar.includes('unsplash.com') ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-[#8B8B88] uppercase">{selectedUser.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                
                <h2 className="text-xl font-black text-[#2D2D2A] mt-3 tracking-tight text-center leading-none">{selectedUser.name}</h2>
                <p className="text-xs text-[#8B8B88] mt-1.5 font-medium">ID: {selectedUser.id}</p>
                
                {/* Badges (View Mode) or Role Select (Edit Mode) */}
                <div className="flex items-center gap-2 mt-3">
                  {isEditingUser && currentUser?.role === 'admin' && selectedUser.id !== currentUser?.id ? (
                    <select name="role" value={editFormData?.role} onChange={handleEditChange} className="text-xs font-bold px-3 py-1.5 bg-white border border-[#EAE5DB] rounded-lg text-earth-700 focus:outline-none focus:border-[#3A4A2D] cursor-pointer shadow-sm">
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                  ) : (
                    <>
                      {selectedUser.role === 'admin' ? (
                        <span className="px-3 py-1 bg-[#FDF9F0] text-[#3A4A2D] border border-[#3A4A2D]/20 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <Crown className="w-3 h-3" /> Admin
                        </span>
                      ) : selectedUser.role === 'staff' ? (
                        <span className="px-3 py-1 bg-[#FDF9F0] text-[#3A4A2D] border border-[#3A4A2D]/20 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <UserCog className="w-3 h-3" /> Staff
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#EEF1EA] text-[#5F6B4E] border border-[#C2CBB8] rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <User className="w-3 h-3" /> Customer
                        </span>
                      )}

                      {!isEditingUser && selectedUser.status === 'suspended' && (
                        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DB] group">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#EAE5DB] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#8B8B88]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#8B8B88] uppercase tracking-widest leading-tight">Email</p>
                    {isEditingUser ? (
                      <input type="email" name="email" value={editFormData?.email || ''} onChange={handleEditChange} className="w-full text-sm font-medium text-[#2D2D2A] bg-white border border-[#EAE5DB] rounded-lg px-2 py-1 mt-1 focus:outline-none focus:border-[#3A4A2D]" />
                    ) : (
                      <p className="text-sm font-medium text-[#2D2D2A] truncate">{selectedUser.email}</p>
                    )}
                  </div>
                  {!isEditingUser && (
                    <button onClick={() => copyToClipboard(selectedUser.email)} className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8B8B88] hover:text-[#3A4A2D] hover:bg-[#EEF1EA] rounded-full transition-all">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedUser.phone && (
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DB] group">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#EAE5DB] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#8B8B88]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#8B8B88] uppercase tracking-widest leading-tight">Phone</p>
                      <p className="text-sm font-medium text-[#2D2D2A]">{selectedUser.phone}</p>
                    </div>
                    {!isEditingUser && (
                      <button onClick={() => copyToClipboard(selectedUser.phone)} className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8B8B88] hover:text-[#3A4A2D] hover:bg-[#EEF1EA] rounded-full transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                
                {isEditingUser && (
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DB]">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#EAE5DB] flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-[#8B8B88]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#8B8B88] uppercase tracking-widest leading-tight">Change Password</p>
                      <div className="relative mt-1">
                        <input type={showEditPassword ? "text" : "password"} name="password" value={editFormData?.password || ''} onChange={handleEditChange} className="w-full text-sm font-medium text-[#2D2D2A] bg-white border border-[#EAE5DB] rounded-lg pl-2 pr-8 py-1 focus:outline-none focus:border-[#3A4A2D]" placeholder="Leave blank to keep current" />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1">
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Conditional Stats for Customers (Hidden in Edit Mode) */}
              {!isEditingUser && selectedUser.role === 'customer' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DB] flex flex-col justify-center items-center text-center">
                    <Calendar className="w-4 h-4 text-[#8B8B88] mb-1" />
                    <p className="text-[10px] font-bold text-[#8B8B88] uppercase tracking-widest leading-tight">Joined</p>
                    <p className="text-sm font-semibold text-[#2D2D2A]">{selectedUser.joinDate || '—'}</p>
                  </div>
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DB] flex flex-col justify-center items-center text-center">
                    <ShoppingBag className="w-4 h-4 text-[#8B8B88] mb-1" />
                    <p className="text-[10px] font-bold text-[#8B8B88] uppercase tracking-widest leading-tight">Orders</p>
                    <p className="text-sm font-semibold text-[#2D2D2A]">{selectedUser.orders}</p>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {!isEditingUser && (selectedUser.role === 'staff' || selectedUser.role === 'admin') && selectedUser.id !== currentUser?.id && (
                <div className="mt-6 pt-6 border-t border-[#EAE5DB] space-y-3">
                  <div className="flex items-center justify-between bg-white border border-[#E8D1CE] rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2D2D2A] leading-tight">Suspend User</p>
                        <p className="text-[10px] text-[#8B8B88] mt-0.5">Revoke access</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => selectedUser.status === 'suspended' ? handleUnsuspendUser(selectedUser.id) : setUserToSuspend(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        selectedUser.status === 'suspended'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {selectedUser.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Mode Save Footer */}
            {isEditingUser && (
              <div className="px-6 py-4 border-t border-[#EAE5DB] bg-[#FAF8F5] flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsEditingUser(false)} className="px-5 py-2.5 text-[#8B8B88] bg-white border border-[#EAE5DB] rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveUser} disabled={isSavingUser} className="px-5 py-2.5 flex items-center gap-2 text-white bg-[#3A4A2D] rounded-xl hover:bg-[#4A5E3A] font-bold text-sm shadow-sm transition-colors">
                  {isSavingUser ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-earth-800 mb-2">Suspend User?</h2>
              <p className="text-sm text-earth-500">
                Are you sure you want to suspend this user? They will immediately lose access to the system.
              </p>
            </div>
            <div className="px-6 py-4 bg-[#FAF8F5] flex justify-end gap-3 border-t border-earth-100">
              <button 
                onClick={() => setUserToSuspend(null)} 
                className="px-5 py-2.5 bg-white border border-earth-200 rounded-xl text-sm text-earth-600 hover:bg-earth-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSuspend} 
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
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
