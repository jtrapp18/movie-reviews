import React from 'react';
import styled from 'styled-components';
import { CancelButton, DeleteButton } from '../MiscStyling';

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
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const ModalMessage = styled.p`
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  itemType = "item"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Delete {itemType}</ModalTitle>
        <ModalMessage>
          {message || `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`}
        </ModalMessage>
        <ButtonContainer>
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <DeleteButton onClick={handleConfirm}>
            Delete {itemType}
          </DeleteButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeleteConfirmationModal;