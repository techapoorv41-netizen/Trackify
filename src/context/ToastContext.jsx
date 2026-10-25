import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, cls: 'text-success bg-success-50 border-success/30' },
  error: { icon: XCircle, cls: 'text-danger bg-danger-50 border-danger/30' },
  warning: { icon: AlertTriangle, cls: 'text-warning bg-warning-50 border-warning/30' },
  info: { icon: Info, cls: 'text-accent bg-accent-50 border-accent/30' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (tone, title, message) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((t) => [...t.slice(-3), { id, tone, title, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      warning: (title, message) => push('warning', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const tone = TONES[t.tone];
          const Icon = tone.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18 }}
              role="status"
              className="pointer-events-auto flex gap-3 rounded-xl border border-line bg-card p-3.5 shadow-pop"
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${tone.cls}`}>
                <Icon size={15} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.message}</p>}
              </div>
              <button type="button" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="h-6 w-6 shrink-0 rounded text-muted hover:bg-soft hover:text-ink">
                <X size={14} className="mx-auto" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
