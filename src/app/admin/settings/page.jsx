'use client';

import React, { useState, useEffect } from 'react';
import { Save, Store, Leaf, Truck, CreditCard, Bell } from 'lucide-react';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAdminGuard } from '../../../hooks/useAdminGuard';

export default function SettingsPage() {
  const { isAllowed } = useAdminGuard();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'Re-Wear Store',
    contactEmail: 'support@rewear.com',
    currency: 'USD ($)',
    ecoWater: 2700, // liters per item
    ecoCO2: 6.5,    // kg per item
    ecoWaste: 0.2,  // kg per item
    shippingFlatRate: 5.00,
    freeShippingThreshold: 50.00
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      showToast('Settings saved successfully');
    } catch (err) {
      showToast('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Store Details', icon: Store },
    { id: 'eco', label: 'Eco-Impact Metrics', icon: Leaf },
  ];

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4A533D]/20 border-t-[#4A533D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2D2A] mb-1">Store Settings</h1>
          <p className="text-sm text-[#5C5C58]">Manage your store preferences and impact metrics</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#4A533D] hover:bg-[#3D4532] text-white rounded-lg transition-all shadow-md font-semibold text-sm disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#2D2D2A] shadow-sm border border-[#D8D2C8]' 
                    : 'text-[#5C5C58] hover:bg-white/50 hover:text-[#2D2D2A] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#4A533D]' : 'text-[#8B8B88]'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-[#D8D2C8] shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-8">
            <form onSubmit={handleSave}>
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-[#2D2D2A] mb-4">Store Profile</h2>
                    <div className="space-y-4 max-w-xl">
                      <div>
                        <label className="block text-sm font-semibold text-[#5C5C58] mb-1.5">Store Name</label>
                        <input 
                          type="text" 
                          name="storeName"
                          value={settings.storeName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5C5C58] mb-1.5">Contact Email</label>
                        <input 
                          type="email" 
                          name="contactEmail"
                          value={settings.contactEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5C5C58] mb-1.5">Currency</label>
                        <select 
                          name="currency"
                          value={settings.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white"
                        >
                          <option value="USD ($)">USD ($)</option>
                          <option value="THB (฿)">THB (฿)</option>
                          <option value="EUR (€)">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Eco-Impact Settings */}
              {activeTab === 'eco' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-[#2D2D2A] mb-2">Eco-Impact Multipliers</h2>
                    <p className="text-sm text-[#8B8B88] mb-6 max-w-2xl">
                      Define the environmental savings per 1 unit of clothing sold. These metrics are multiplied by your total delivered items to calculate the global impact shown on the dashboard.
                    </p>
                    
                    <div className="space-y-5 max-w-xl">
                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A] mb-1.5">
                          Water Saved (Liters per item)
                        </label>
                        <p className="text-xs text-[#5C5C58] mb-3">Average water required to produce one new cotton shirt.</p>
                        <input 
                          type="number" 
                          name="ecoWater"
                          value={settings.ecoWater}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm"
                        />
                      </div>

                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A] mb-1.5">
                          CO2 Reduced (Kg per item)
                        </label>
                        <p className="text-xs text-[#5C5C58] mb-3">Carbon emissions prevented by buying secondhand.</p>
                        <input 
                          type="number" 
                          name="ecoCO2"
                          step="0.1"
                          value={settings.ecoCO2}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm"
                        />
                      </div>

                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A] mb-1.5">
                          Waste Diverted (Kg per item)
                        </label>
                        <p className="text-xs text-[#5C5C58] mb-3">Textile waste kept out of landfills.</p>
                        <input 
                          type="number" 
                          name="ecoWaste"
                          step="0.1"
                          value={settings.ecoWaste}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
