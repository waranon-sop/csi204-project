'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
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
          const isError = toast.type === 'error';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in transition-all ${
                isError ? 'bg-[#C55B5B]' : 'bg-[#4A533D]'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-5 h-5 text-[#FDF9F0]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#E3E7D3]" />
              )}
              <p className="text-sm font-medium pr-4">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition-colors ml-auto"
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
