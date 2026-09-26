import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const STYLES = {
  success: { cls: 'alert-success', Icon: CheckCircle2 },
  error: { cls: 'alert-error', Icon: AlertCircle },
  info: { cls: 'alert-info', Icon: Info },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast toast-bottom toast-center z-[100] pointer-events-none">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const { cls, Icon } = STYLES[type] || STYLES.info;
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`alert ${cls} shadow-lg pointer-events-auto`}
              >
                <Icon className="w-5 h-5" />
                <span>{message}</span>
                <button onClick={() => dismiss(id)} aria-label="dismiss" className="btn btn-ghost btn-xs btn-circle">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// const toast = useToast(); toast('সংরক্ষিত!', 'success')
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
