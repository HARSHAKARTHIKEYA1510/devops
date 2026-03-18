'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', icon: '#4ade80' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', icon: '#f87171' },
    info: { bg: 'rgba(108,71,255,0.15)', border: 'rgba(108,71,255,0.4)', icon: '#a78bfa' },
    warning: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', icon: '#fbbf24' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        {toasts.map((t) => {
          const c = colors[t.type];
          return (
            <div key={t.id} onClick={() => removeToast(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1.25rem', borderRadius: '14px',
              background: c.bg, border: `1px solid ${c.border}`,
              backdropFilter: 'blur(20px)', cursor: 'pointer',
              minWidth: '280px', maxWidth: '380px',
              animation: 'fadeInUp 0.3s ease',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${c.icon}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: c.icon, fontWeight: 700, flexShrink: 0,
              }}>{icons[t.type]}</span>
              <span style={{ fontSize: '0.875rem', color: '#e8e8f0', flex: 1 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
