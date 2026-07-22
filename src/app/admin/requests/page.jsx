'use client';

import React, { useState, useEffect } from 'react';
import { useAdminGuard } from '../../../hooks/useRoleGuard';
import { Search, Image as ImageIcon, Calendar, User, Info, CheckCircle2, X } from 'lucide-react';
import { useToast } from '../../../components/ui/ToastProvider';

export default function AdminShopperRequests() {
  const { isAllowed } = useAdminGuard();
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { addToast } = useToast();

  const fetchRequests = async () => {
    try {
      const [reqRes, usersRes] = await Promise.all([
        fetch('/api/shopper-requests'),
        fetch('/api/users')
      ]);
      
      const reqData = await reqRes.json();
      const usersData = await usersRes.json();
      
      const usersMap = {};
      if (Array.isArray(usersData)) {
        usersData.forEach(u => {
          usersMap[u.id] = u.name;
        });
      }
      setUsers(usersMap);
      setRequests(reqData);
    } catch (err) {
      console.error('Failed to load shopper requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/shopper-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        addToast(`Request marked as ${newStatus}`);
      }
    } catch (err) {
      addToast('Failed to update status');
    }
  };

  if (!isAllowed) return null;

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#2D2D2A]">Shopper Requests</h1>
          <p className="text-sm text-[#8B8B88] mt-1">Manage Personal Shopper requests from top-tier members.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#8B8B88]">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#EAE5DB]">
          <Search className="w-12 h-12 text-[#D8D2C8] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#2D2D2A]">No Requests Yet</h3>
          <p className="text-[#8B8B88]">When members use the Personal Shopper feature, their requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-6 border border-[#EAE5DB] shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#EAE5DB]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8B8B88] mb-1">
                    <span className="font-mono">{req.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2D2D2A]">
                    <User className="w-4 h-4 text-[#8B8B88]" />
                    <span>{users[req.userId] || req.userId || 'Unknown Member'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-xs text-[#8B8B88]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(req.date).toLocaleDateString()}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'Found' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'Completed' ? 'bg-sage-100 text-sage-800' :
                    'bg-[#EAE5DB] text-[#8B8B88]'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-[#8B8B88] uppercase tracking-wider mb-1">Brand or Style</h4>
                  <p className="text-[#2D2D2A] font-semibold">{req.brandOrStyle}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#8B8B88] uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-[#5C5C58]">{req.description}</p>
                </div>
                {req.size && (
                  <div>
                    <h4 className="text-xs font-bold text-[#8B8B88] uppercase tracking-wider mb-1">Size</h4>
                    <p className="text-sm text-[#5C5C58]">{req.size}</p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-[#EAE5DB] flex justify-between items-center text-xs">
                {req.image ? (
                  <button 
                    onClick={() => setSelectedPhoto(req.image)}
                    className="flex items-center gap-1.5 text-sage-600 font-semibold hover:text-sage-700 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" /> View Reference
                  </button>
                ) : (
                  <span className="text-[#8B8B88]">No reference image</span>
                )}

                <div className="flex gap-2">
                  {req.status === 'Pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(req.id, 'Found')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                    >
                      Mark Found
                    </button>
                  )}
                  {(req.status === 'Pending' || req.status === 'Found') && (
                    <button 
                      onClick={() => handleUpdateStatus(req.id, 'Completed')}
                      className="px-3 py-1.5 bg-sage-50 text-sage-700 hover:bg-sage-100 rounded-lg font-semibold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedPhoto} 
              alt="Reference" 
              className="rounded-lg object-contain max-h-[85vh] shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
