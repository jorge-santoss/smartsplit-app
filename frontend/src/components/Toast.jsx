import { useState, useCallback } from 'react';
import { ToastContext } from '../context/ToastContext';

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
            className={`px-4 py-3 rounded-xl shadow-lg text-sm transition-all border border-white/10 backdrop-blur-md flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-[#FCEA3C] text-[#121212] shadow-yellow-500/20' 
                : 'bg-[#FF6B6B] text-white shadow-red-500/20'
            }`}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}