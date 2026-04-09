import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast-enter flex items-center justify-between min-w-[250px] p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white border-opacity-20 text-white font-medium ${
              toast.type === 'success' ? 'bg-green-500 bg-opacity-90' : 
              toast.type === 'error' ? 'bg-red-500 bg-opacity-90' : 
              'bg-blue-500 bg-opacity-90'
            }`}
          >
            <span>{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="ml-4 text-white text-opacity-70 hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
