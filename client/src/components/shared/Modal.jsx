import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

/** Above Headroom (900) and mobile nav overlay (9999); below Toast (99999). */
const MODAL_Z_INDEX = 10000;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${MODAL_Z_INDEX};
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0)
    env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);

  @media (max-width: 768px) {
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  background: var(--background);
  color: var(--text);
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  max-width: min(900px, 95vw);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.75rem 1.5rem;
  background: var(--background);
  border-bottom: 1px solid var(--border);

  h2 {
    margin: 0;
  }

  h3 {
    margin: 0.25rem 0 0 0;
    font-weight: 400;
    font-size: 0.95rem;
  }
`;

const ModalBody = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  text-align: left;

  p {
    text-align: left;
  }
`;

const CloseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={handleContentClick}>
        <ModalHeader>
          <CloseButtonRow>
            <CloseButton aria-label="Close modal" onClick={onClose}>
              &times;
            </CloseButton>
          </CloseButtonRow>
          {title && <h2>{title}</h2>}
          {subtitle && <h3>{subtitle}</h3>}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default Modal;
