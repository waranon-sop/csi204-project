"use client";

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, Check, X, Phone, Mail, MapPin, Clock, HelpCircle, Package, RefreshCcw, Tag, User } from 'lucide-react';
import { useToast } from '../../../components/ui/ToastProvider';
import { useSupport } from '../../../context/SupportContext';
import { useAdminGuard } from '../../../hooks/useRoleGuard';

const AVAILABLE_ICONS = [
  { name: 'Package', icon: <Package className="w-5 h-5" /> },
  { name: 'RefreshCcw', icon: <RefreshCcw className="w-5 h-5" /> },
  { name: 'Tag', icon: <Tag className="w-5 h-5" /> },
  { name: 'User', icon: <User className="w-5 h-5" /> },
  { name: 'HelpCircle', icon: <HelpCircle className="w-5 h-5" /> },
];

export default function AdminSupportPage() {
  const { isAllowed } = useAdminGuard();
  const { faqData, contactInfo, updateFaqData, updateContactInfo, isLoaded } = useSupport();
  const { addToast } = useToast();
  
  const [localContactInfo, setLocalContactInfo] = useState({
    email: '', phone: '', hours: '', address: ''
  });
  
  const [localFaqData, setLocalFaqData] = useState([]);

  useEffect(() => {
    if (isLoaded) {
      setLocalContactInfo(contactInfo);
      setLocalFaqData(faqData);
    }
  }, [isLoaded, contactInfo, faqData]);

  // Handle Contact Info Changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setLocalContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const saveContactInfo = () => {
    updateContactInfo(localContactInfo);
    addToast('Contact information updated successfully!', 'success');
  };

  // Handle FAQ Changes
  const addCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      category: 'New Category',
      iconName: 'HelpCircle',
      questions: []
    };
    setLocalFaqData([...localFaqData, newCategory]);
  };

  const deleteCategory = (catId) => {
    setLocalFaqData(localFaqData.filter(cat => cat.id !== catId));
  };

  const updateCategory = (catId, field, value) => {
    setLocalFaqData(localFaqData.map(cat => 
      cat.id === catId ? { ...cat, [field]: value } : cat
    ));
  };

  const addQuestion = (catId) => {
    setLocalFaqData(localFaqData.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          questions: [
            ...cat.questions,
            { id: `q-${Date.now()}`, q: 'New Question', a: 'New Answer' }
          ]
        };
      }
      return cat;
    }));
  };

  const updateQuestion = (catId, qId, field, value) => {
    setLocalFaqData(localFaqData.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          questions: cat.questions.map(q => 
            q.id === qId ? { ...q, [field]: value } : q
          )
        };
      }
      return cat;
    }));
  };

  const deleteQuestion = (catId, qId) => {
    setLocalFaqData(localFaqData.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          questions: cat.questions.filter(q => q.id !== qId)
        };
      }
      return cat;
    }));
  };

  const saveFaqData = () => {
    updateFaqData(localFaqData);
    addToast('FAQ data updated successfully!', 'success');
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-[#D8D2C8] pb-4">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2A] tracking-tight">Support Configuration</h1>
          <p className="text-sm text-[#8B8B88] mt-1">Manage contact information and FAQs displayed on the customer support page.</p>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-white rounded-3xl p-8 border border-[#EAE5DB] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2D2D2A]">Contact Information</h2>
          <button 
            onClick={saveContactInfo}
            className="bg-[#3A4A2D] hover:bg-[#2D2D2A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Contact Info
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email Support
            </label>
            <input 
              name="email" value={localContactInfo.email} onChange={handleContactChange}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#2D2D2A] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input 
              name="phone" value={localContactInfo.phone} onChange={handleContactChange}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#2D2D2A] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Operating Hours
            </label>
            <input 
              name="hours" value={localContactInfo.hours} onChange={handleContactChange}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#2D2D2A] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5C5C5A] uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> HQ Address
            </label>
            <input 
              name="address" value={localContactInfo.address} onChange={handleContactChange}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#2D2D2A] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* FAQ Management Section */}
      <div className="bg-white rounded-3xl p-8 border border-[#EAE5DB] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#2D2D2A]">FAQ Management</h2>
            <p className="text-xs text-[#8B8B88] mt-1">Add, edit, or remove categories and questions.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={addCategory}
              className="bg-[#FAF8F5] hover:bg-[#EEF1EA] text-[#3A4A2D] border border-[#EAE5DB] hover:border-[#C2CBB8] px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
            <button 
              onClick={saveFaqData}
              className="bg-[#3A4A2D] hover:bg-[#2D2D2A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save FAQs
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {localFaqData.map((cat, catIndex) => (
            <div key={cat.id} className="border border-[#EAE5DB] rounded-2xl p-6 bg-[#FAF8F5]">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#5C5C5A] uppercase tracking-widest">Category Name</label>
                    <input 
                      value={cat.category}
                      onChange={(e) => updateCategory(cat.id, 'category', e.target.value)}
                      className="w-full bg-white border border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none rounded-lg px-3 py-2 text-sm font-bold text-[#2D2D2A]"
                    />
                  </div>
                  <div className="w-full md:w-48 space-y-1.5">
                    <label className="text-[10px] font-bold text-[#5C5C5A] uppercase tracking-widest">Icon</label>
                    <div className="flex bg-white border border-[#EAE5DB] rounded-lg overflow-hidden">
                      <select 
                        value={cat.iconName}
                        onChange={(e) => updateCategory(cat.id, 'iconName', e.target.value)}
                        className="w-full bg-transparent focus:outline-none px-3 py-2 text-sm text-[#2D2D2A] appearance-none"
                      >
                        {AVAILABLE_ICONS.map(icon => (
                          <option key={icon.name} value={icon.name}>{icon.name}</option>
                        ))}
                      </select>
                      <div className="px-3 border-l border-[#EAE5DB] flex items-center justify-center bg-[#FAF8F5] text-[#3A4A2D]">
                        {AVAILABLE_ICONS.find(i => i.name === cat.iconName)?.icon}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteCategory(cat.id)}
                  className="text-[#C55B5B] hover:bg-[#FCECE8] p-2 rounded-lg transition-colors mt-5 md:mt-0"
                  title="Delete Category"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-[#EAE5DB]">
                {cat.questions.map((q, qIndex) => (
                  <div key={q.id} className="bg-white border border-[#EAE5DB] rounded-xl p-4 flex gap-4 relative group">
                    <div className="flex-1 space-y-3">
                      <input 
                        value={q.q}
                        onChange={(e) => updateQuestion(cat.id, q.id, 'q', e.target.value)}
                        placeholder="Question"
                        className="w-full bg-transparent border-b border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none px-1 py-1 text-sm font-bold text-[#2D2D2A]"
                      />
                      <textarea 
                        value={q.a}
                        onChange={(e) => updateQuestion(cat.id, q.id, 'a', e.target.value)}
                        placeholder="Answer"
                        rows="2"
                        className="w-full bg-[#FAF8F5] border border-[#EAE5DB] focus:border-[#3A4A2D] focus:outline-none rounded-lg px-3 py-2 text-sm text-[#5C5C5A] resize-none"
                      />
                    </div>
                    <button 
                      onClick={() => deleteQuestion(cat.id, q.id)}
                      className="text-[#8B8B88] hover:text-[#C55B5B] self-start p-1 transition-colors"
                      title="Delete Question"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => addQuestion(cat.id)}
                  className="text-xs font-bold text-[#3A4A2D] hover:text-[#2D2D2A] flex items-center gap-1 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>
            </div>
          ))}
          {localFaqData.length === 0 && (
            <div className="text-center py-12 text-[#8B8B88] text-sm">
              No FAQ categories added. Click "Add Category" to get started.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
