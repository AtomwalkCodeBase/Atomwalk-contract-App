import React from 'react';
import styled from 'styled-components';

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`;

const PopupContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 20px;
`;

const Message = styled.p`
  margin: 16px 0;
  color: #555;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const CancelButton = styled(Button)`
  background-color: #f1f1f1;
  color: #333;
  &:hover {
    background-color: #e1e1e1;
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${props => props.approve ? '#28a745' : '#007bff'};
  color: white;
  &:hover {
    background-color: ${props => props.approve ? '#218838' : '#0069d9'};
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

// Component
const ConfirmPopup = ({ isOpen, onClose, onConfirm, approve, timesheet, isLoading, title, message, confirmLabel  }) => {
  if (!isOpen) return null;

  const isApproveAction = approve === "APPROVE";
  const fallbackActionLabel = isApproveAction ? 'Approve' : 'Submit';
  const fallbackActionVerb = isApproveAction ? 'approving' : 'submitting';

  const resolvedTitle = title || `${fallbackActionLabel} Weekly Timesheet`;
  const resolvedMessage = message || (isApproveAction 
    ? 'Are you sure you want to approve this weekly timesheet? This action cannot be undone.'
    : 'Are you sure you want to submit your weekly timesheet for approval? You won\'t be able to make changes after submission.');
  const resolvedConfirmLabel = confirmLabel || `${fallbackActionLabel} Weekly Timesheet`;

  return (
    <Overlay>
      <PopupContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title>{resolvedTitle}</Title>
          <button
            onClick={onClose}
            style={{
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              background: 'transparent',
              border: 'none',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <Message>
          {resolvedMessage}
        </Message>

        <ButtonGroup>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
           <SubmitButton
            approve={isApproveAction}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner /> {fallbackActionVerb}...
              </>
            ) : (
              resolvedConfirmLabel
            )}
          </SubmitButton>
        </ButtonGroup>
      </PopupContainer>
    </Overlay>
  );
};

export default ConfirmPopup;