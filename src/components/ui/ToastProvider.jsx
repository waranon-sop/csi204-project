'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let bgColor = "bg-[#4A533D]";
          let iconColor = "text-[#E3E7D3]";

          if (toast.type === 'error') {
            Icon = AlertCircle;
            bgColor = "bg-red-600";
            iconColor = "text-red-100";
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            bgColor = "bg-amber-500";
            iconColor = "text-amber-50";
          } else if (toast.type === 'info') {
            Icon = Info;
            bgColor = "bg-blue-600";
            iconColor = "text-blue-100";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in transition-all`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <p className="text-sm font-medium pr-4">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
