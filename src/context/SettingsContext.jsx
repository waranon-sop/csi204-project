'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Re-wear System', // Default fallback
    contactEmail: 'support@rewear.com',
    currency: 'THB (฿)',
    ecoWater: 2700,
    ecoCO2: 6.5,
    ecoWaste: 0.2,
    freeShippingThreshold: 500.00
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data, currency: 'THB (฿)' }));
      }
    } catch (err) {
      console.error('Failed to load global settings', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    return fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoadingSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
