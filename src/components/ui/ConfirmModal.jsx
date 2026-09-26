import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { t } from '../../i18n';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { title, message, danger }
  const resolverRef = useRef(null);

  const confirm = useCallback((message, { title, danger = true } = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ message, title, danger });
    });
  }, []);

  function close(result) {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {dialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-neutral/60 backdrop-blur-sm px-4"
            onClick={() => close(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22 }}
              className="card bg-base-100 shadow-2xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
            >
              <div className="card-body items-center text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${dialog.danger ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  <AlertTriangle className="w-7 h-7" strokeWidth={1.8} />
                </div>
                {dialog.title && <h3 className="font-bold text-lg mt-2">{dialog.title}</h3>}
                <p className="text-base-content/75">{dialog.message}</p>
                <div className="card-actions mt-4">
                  <button className="btn btn-ghost" onClick={() => close(false)} autoFocus>
                    {t('admin.cancel')}
                  </button>
                  <button className={`btn ${dialog.danger ? 'btn-error' : 'btn-primary'}`} onClick={() => close(true)}>
                    {t('common.confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

// const confirm = useConfirm(); if (await confirm('মুছে ফেলবেন?')) ...
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}
