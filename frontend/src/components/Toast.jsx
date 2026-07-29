import { useState, useCallback } from 'react';
import { ToastContext } from '../context/ToastContext';
import { Check, X } from 'lucide-react';

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm transition-all flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-[#2DD4BF] text-[#121214] shadow-lg shadow-teal-400/25' 
                : 'bg-[#FB7185] text-[#121214] shadow-lg shadow-rose-400/25'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}