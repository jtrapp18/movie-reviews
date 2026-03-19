/* eslint-disable react-refresh/only-export-components -- context file exports provider + hook */
import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@components/feedback/Toast';

const ToastContext = createContext({
  showToast: () => {},
});

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const showToast = useCallback((msg, options = {}) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    const d = opts.duration ?? DEFAULT_DURATION;
    setMessage(String(msg));
    setDuration(d);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
    setMessage('');
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        visible={visible}
        onDismiss={hideToast}
        duration={duration}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
