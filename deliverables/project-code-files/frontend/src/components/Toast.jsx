import React, {
  createContext, useContext, useState, useCallback,
  useRef, useEffect
} from 'react';
import ReactDOM from 'react-dom';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

/* ── Static lookup tables (defined once, never re-created) ── */
const ICONS = {
  success: <FaCheckCircle />,
  danger:  <FaExclamationCircle />,
  warning: <FaExclamationTriangle />,
  info:    <FaInfoCircle />,
};

const COLORS = {
  success: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  danger:  { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  warning: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  info:    { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
};

/* ── Inject keyframe CSS once into <head> ── */
if (typeof document !== 'undefined' && !document.getElementById('toast-keyframes')) {
  const style = document.createElement('style');
  style.id = 'toast-keyframes';
  style.textContent = `
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Context holds only the stable `toast` function ── */
const ToastContext = createContext(null);

/* ── Separate component that owns toast state ──
   Rendered via a Portal so its re-renders NEVER touch the app tree. */
const ToastContainer = ({ listenerRef }) => {
  const [toasts, setToasts] = useState([]);

  /* Expose add/dismiss to the provider via a ref */
  useEffect(() => {
    listenerRef.current = {
      add: (message, variant, duration) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, variant }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
      },
      dismiss: (id) => setToasts(prev => prev.filter(t => t.id !== id)),
    };
  }, [listenerRef]);

  if (toasts.length === 0) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: '1.25rem', right: '1.25rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '.6rem',
      maxWidth: 360, width: '100%', pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const c = COLORS[t.variant] || COLORS.info;
        return (
          <div key={t.id} style={{
            background: c.bg, color: c.color,
            border: `1px solid ${c.border}`,
            borderRadius: '12px',
            padding: '.75rem 1rem',
            display: 'flex', alignItems: 'flex-start', gap: '.65rem',
            boxShadow: '0 4px 16px rgba(0,0,0,.10)',
            pointerEvents: 'all',
            animation: 'toastSlideIn .2s ease',
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '.05rem' }}>
              {ICONS[t.variant]}
            </span>
            <span style={{ flex: 1, fontSize: '.83rem', fontWeight: 500, lineHeight: 1.5 }}>
              {t.message}
            </span>
            <button
              onClick={() => listenerRef.current?.dismiss(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, opacity: .6, padding: 0, fontSize: '.8rem', flexShrink: 0 }}
            >
              <FaTimes />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
};

/* ── Provider — renders children once, never re-renders them ── */
export const ToastProvider = ({ children }) => {
  /* Stable ref — calling toast() updates the ref target, not this component */
  const listenerRef = useRef(null);

  const toast = useCallback((message, variant = 'success', duration = 3500) => {
    listenerRef.current?.add(message, variant, duration);
  }, []); // empty deps — this function is created exactly once

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer listenerRef={listenerRef} />
    </ToastContext.Provider>
  );
};

/* ── Hook ── */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
