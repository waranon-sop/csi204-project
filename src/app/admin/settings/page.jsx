'use client';

import React, { useState, useEffect } from 'react';
import { Save, Store, Leaf, Truck, CreditCard, Bell, Lock, Check } from 'lucide-react';
import { useToast } from '../../../components/ui/ToastProvider';
import { useAdminGuard } from '../../../hooks/useAdminGuard';
import { useSettings } from '../../../context/SettingsContext';

export default function SettingsPage() {
  const { isAllowed } = useAdminGuard();
  const { addToast } = useToast();
  const { settings: globalSettings, isLoadingSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'Re-Wear Store',
    contactEmail: 'support@rewear.com',
    currency: 'THB (฿)',
    ecoWater: 2700, // liters per item
    ecoCO2: 6.5,    // kg per item
    ecoWaste: 0.2,  // kg per item
    freeShippingThreshold: 500.00
  });

  useEffect(() => {
    if (!isLoadingSettings && globalSettings) {
      setSettings(globalSettings);
      setOriginalSettings(globalSettings);
      setIsLoading(false);
    }
  }, [globalSettings, isLoadingSettings]);

  const validateField = (name, value) => {
    let error = null;
    if (name === 'storeName' && !String(value).trim()) {
      error = 'Store name cannot be empty';
    } else if (name === 'contactEmail' && (!String(value).includes('@') || !String(value).includes('.'))) {
      error = 'Valid email address required';
    } else if ((name === 'freeShippingThreshold' || name.startsWith('eco')) && Number(value) < 0) {
      error = 'Value cannot be negative';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: val
    }));
    
    setHasChanges(true);
    setErrors(prev => ({ ...prev, [name]: validateField(name, val) }));
  };

  const handleDiscard = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasChanges(false);
      setErrors({});
    }
  };

  const hasErrors = Object.values(errors).some(err => err !== null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (hasErrors) return;
    setIsSaving(true);
    
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setOriginalSettings(settings);
      setHasChanges(false);
      refreshSettings();
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      addToast('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Store Details', icon: Store },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
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
          <h1 className="text-3xl font-bold text-[#2D2D2A] mb-2 tracking-tight">Settings</h1>
          <p className="text-[#8B8B88]">Manage your store preferences and system configurations.</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button 
              onClick={handleDiscard}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-earth-600 hover:bg-earth-200 transition-colors"
            >
              Discard Changes
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving || (!hasChanges && !isSuccess) || hasErrors}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all shadow-md font-semibold text-sm ${
              isSuccess 
                ? 'bg-green-600 text-white' 
                : hasErrors 
                  ? 'bg-red-100 text-red-500 cursor-not-allowed opacity-70'
                  : hasChanges 
                    ? 'bg-[#4A533D] hover:bg-[#3D4532] text-white animate-[pulse_2s_ease-in-out_infinite]' 
                    : 'bg-earth-200 text-earth-500 cursor-not-allowed opacity-70'
            }`}
          >
            {isSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : isSuccess ? 'Saved!' : hasChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
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
                    <h2 className="text-lg font-bold text-[#2D2D2A] mb-2">Store Profile</h2>
                    <p className="text-sm text-[#8B8B88] mb-6 max-w-2xl">
                      Basic information about your store. This will be displayed on receipts and customer emails.
                    </p>
                    <div className="space-y-5 max-w-xl">
                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <label className="block text-sm font-bold text-[#2D2D2A] mb-1.5">Store Name</label>
                        <p className="text-xs text-[#5C5C58] mb-3">The public name of your marketplace.</p>
                        <input 
                          type="text" 
                          name="storeName"
                          value={settings.storeName}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white ${
                            errors.storeName ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#D8D2C8]'
                          }`}
                        />
                        {errors.storeName && <p className="text-xs text-red-500 mt-1.5">{errors.storeName}</p>}
                      </div>
                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <label className="block text-sm font-bold text-[#2D2D2A] mb-1.5">Contact Email</label>
                        <p className="text-xs text-[#5C5C58] mb-3">Where customers can reach you for support.</p>
                        <input 
                          type="email" 
                          name="contactEmail"
                          value={settings.contactEmail}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white ${
                            errors.contactEmail ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#D8D2C8]'
                          }`}
                        />
                        {errors.contactEmail && <p className="text-xs text-red-500 mt-1.5">{errors.contactEmail}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Settings */}
              {activeTab === 'shipping' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-[#2D2D2A] mb-2">Shipping & Delivery</h2>
                    <p className="text-sm text-[#8B8B88] mb-6 max-w-2xl">
                      Configure your flat shipping rates and free shipping thresholds for customers.
                    </p>
                    
                    <div className="space-y-5 max-w-xl">
                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A] mb-1.5">
                          Free Shipping Threshold (THB)
                        </label>
                        <p className="text-xs text-[#5C5C58] mb-3">Orders above this amount will automatically receive free standard shipping.</p>
                        <input 
                          type="number" 
                          name="freeShippingThreshold"
                          step="0.01"
                          value={settings.freeShippingThreshold}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white ${
                            errors.freeShippingThreshold ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#D8D2C8]'
                          }`}
                        />
                        {errors.freeShippingThreshold && <p className="text-xs text-red-500 mt-1.5">{errors.freeShippingThreshold}</p>}
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
                        <div className="flex justify-between items-start mb-1.5">
                          <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A]">
                            Water Saved (Liters per item)
                          </label>
                          <a href="https://www.worldwildlife.org/stories/the-impact-of-a-cotton-t-shirt" target="_blank" rel="noopener noreferrer" className="text-[10px] bg-earth-200/50 hover:bg-earth-200 text-earth-600 hover:text-earth-800 px-2 py-0.5 rounded-full font-medium border border-earth-200 transition-all cursor-pointer">Source: WWF</a>
                        </div>
                        <p className="text-xs text-[#5C5C58] mb-3">Average water required to produce one new cotton shirt is 2,700 liters.</p>
                        <input 
                          type="number" 
                          name="ecoWater"
                          value={settings.ecoWater}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white"
                        />
                      </div>

                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <div className="flex justify-between items-start mb-1.5">
                          <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A]">
                            CO2 Reduced (Kg per item)
                          </label>
                          <a href="https://www.thredup.com/impact" target="_blank" rel="noopener noreferrer" className="text-[10px] bg-earth-200/50 hover:bg-earth-200 text-earth-600 hover:text-earth-800 px-2 py-0.5 rounded-full font-medium border border-earth-200 transition-all cursor-pointer">Source: ThredUp</a>
                        </div>
                        <p className="text-xs text-[#5C5C58] mb-3">Buying secondhand prevents roughly 6.5 kg of carbon emissions per item.</p>
                        <input 
                          type="number" 
                          name="ecoCO2"
                          step="0.1"
                          value={settings.ecoCO2}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white"
                        />
                      </div>

                      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#D8D2C8]">
                        <div className="flex justify-between items-start mb-1.5">
                          <label className="flex items-center gap-2 text-sm font-bold text-[#2D2D2A]">
                            Waste Diverted (Kg per item)
                          </label>
                          <a href="https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/textiles-material-specific-data" target="_blank" rel="noopener noreferrer" className="text-[10px] bg-earth-200/50 hover:bg-earth-200 text-earth-600 hover:text-earth-800 px-2 py-0.5 rounded-full font-medium border border-earth-200 transition-all cursor-pointer">Source: EPA</a>
                        </div>
                        <p className="text-xs text-[#5C5C58] mb-3">Average weight of a garment kept out of landfills (0.2 kg = 200 grams).</p>
                        <input 
                          type="number" 
                          name="ecoWaste"
                          step="0.1"
                          value={settings.ecoWaste}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-[#D8D2C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A533D]/30 text-sm bg-white"
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
