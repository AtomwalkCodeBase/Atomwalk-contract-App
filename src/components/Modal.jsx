import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import Button from './Button';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  width: 100%;
  max-width: ${({ width }) => width || '28rem'};
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  max-height: 95vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  margin: 0;
`;

const CloseButton = styled.button`
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors?.error || '#e53935'};
  }
`;

const ScrollableContent = styled.div`
  overflow-y: auto;
  max-height: ${({ maxHeight }) => maxHeight || '90vh'};
  padding: 0 0.25rem;

  & > * + * {
    margin-top: 1.5rem;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || '#ccc'};
    border-radius: 4px;
  }
`;

const Footer = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  font-weight: 600;
  font-size: 0.875rem;
  background: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s ease;
  box-shadow: ${({ disabled, theme }) =>
    disabled ? 'none' : `0 4px 12px ${theme.colors?.primary || '#6C5CE7'}44`};
  background: ${({ disabled, theme }) =>
    disabled ? theme.colors?.border || '#e0e0e0' : theme.colors?.primary || '#6C5CE7'};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors?.textLight || '#999' : '#fff'};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors?.secondary || '#5a4bd1'};
  }
`;

const Modal = ({
  isOpen,
  onClose,
  onSave,
  title = "Modal Title",
  width,
  maxHeight,
  children,
  showSaveButton = true,
  saveButtonText = "Save Changes",
  cancelButtonText = "Cancel",
  saveDisabled = false,
  setIsConfirmOpen,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (saveDisabled) return;
    if (setIsConfirmOpen) {
      setIsConfirmOpen(true);
    } else if (onSave) {
      onSave();
    }
  };

  return createPortal(
   <Overlay onClick={onClose}>
  <ModalBox width={width} onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <ScrollableContent maxHeight={maxHeight}>
          {children}
        </ScrollableContent>

        {(showSaveButton || cancelButtonText) && (
          <Footer>
            {/* <CancelButton onClick={onClose}>
              {cancelButtonText}
            </CancelButton> */}
            <Button variant='outline'  onClick={onClose}>{cancelButtonText}</Button>
            {showSaveButton && (
              // <SaveButton
              //   type="button"
              //   onClick={handleSave}
              //   disabled={saveDisabled}
              // >
              //   {saveButtonText}
              // </SaveButton>
              <Button variant='primary' onClick={handleSave} disabled={saveDisabled}>{saveButtonText}</Button>
            )}
          </Footer>
        )}
      </ModalBox>
    </Overlay>,
    document.getElementById('modal-root') || document.body
  );
};

export default Modal;