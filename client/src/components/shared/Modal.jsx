import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--background);
  color: var(--text);
  padding: clamp(1.5rem, 3vw, 2rem);
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  max-width: min(900px, 95vw);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
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

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={handleContentClick}>
        <CloseButtonRow>
          <CloseButton aria-label="Close modal" onClick={onClose}>
            &times;
          </CloseButton>
        </CloseButtonRow>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
