import { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ToastBox = styled(motion.div)`
  position: fixed;
  bottom: 4rem;
  left: 1.25rem;
  z-index: 99999;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: var(--cinema-gray-dark);
  color: var(--soft-white);
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 215, 0, 0.2);
  max-width: min(320px, calc(100vw - 2.5rem));
`;

/**
 * Single toast message. Shown in bottom-left for a few seconds.
 * Use via useToast() from toastContext: showToast('Saved!') or showToast('Error', { duration: 6000 })
 */
function Toast({ message, visible, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!visible || !message) return;
    const id = setTimeout(() => onDismiss(), duration);
    return () => clearTimeout(id);
  }, [visible, message, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && message && (
        <ToastBox
          initial={{ opacity: 0, y: 16, x: 8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 8, x: 8 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </ToastBox>
      )}
    </AnimatePresence>
  );
}

export default Toast;
