import React from 'react';
import styled, { keyframes } from 'styled-components';
import { LuReceipt, LuCalendar, LuHash, LuIndianRupee, LuPaperclip, LuExternalLink } from 'react-icons/lu';
import Modal from '../Modal';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OpeCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.75rem;
  overflow: hidden;
  animation: ${fadeUp} 0.25s ease both;
  animation-delay: ${({ index }) => index * 0.06}s;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const OpeIndex = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}18` : '#ede9ff'};
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.04em;
`;

const StatusChip = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: #059669;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 20px;
`;

const CardBody = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Field = styled.div`
  padding: 0.65rem 0.9rem;
  border-right: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};

  &:last-child,
  &:nth-child(3n) {
    border-right: none;
  }

  @media (max-width: 480px) {
    &:nth-child(2n) { border-right: none; }
    &:nth-child(3n) { border-right: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'}; }
    &:nth-child(odd):last-child { border-right: none; }
  }
`;

const FieldLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

const FieldValue = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  word-break: break-word;
`;

const AmountValue = styled(FieldValue)`
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  font-size: 0.9rem;
`;

const FileRow = styled.div`
  grid-column: 1 / -1;
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}12` : '#ede9ff'};
  border: 1px solid ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}30` : '#c4b5fd'};
  transition: background 0.15s ease;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}22` : '#ddd6fe'};
  }
`;

const NoFile = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
  font-style: italic;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};

  svg { margin-bottom: 0.5rem; opacity: 0.4; }
  p { font-size: 0.85rem; margin: 0; }
`;

// ─── Main Component ───────────────────────────────────────────────────────────

const OpeListModal = ({ isOpen, onClose, opeList = [] }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submitted OPE List"
      showSaveButton={false}
      cancelButtonText="Close"
      width="36rem"
      maxHeight="65vh"
    >
      {opeList.length === 0 ? (
        <EmptyState>
          <LuReceipt size={32} />
          <p>No OPE submissions found</p>
        </EmptyState>
      ) : (
        <List>
          {opeList.map((ope, index) => (
            <OpeCard key={ope.id || index} index={index}>
              <CardHeader>
                <OpeIndex>OPE #{index + 1}</OpeIndex>
                <StatusChip>Submitted</StatusChip>
              </CardHeader>

              <CardBody>
                <Field>
                  <FieldLabel><LuCalendar size={11} /> Date</FieldLabel>
                  <FieldValue>{ope.submitted_date || '—'}</FieldValue>
                </Field>

                <Field>
                  <FieldLabel><LuHash size={11} /> ID</FieldLabel>
                  <FieldValue>{ope.id || '—'}</FieldValue>
                </Field>

                <Field>
                  <FieldLabel><LuIndianRupee size={11} /> Amount</FieldLabel>
                  <AmountValue>₹{Number(ope.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</AmountValue>
                </Field>

                <FileRow>
                  <FieldLabel style={{ margin: 0 }}><LuPaperclip size={11} /> File</FieldLabel>
                  {ope.submitted_file ? (
                    <FileLink href={ope.submitted_file} target="_blank" rel="noreferrer">
                      <LuExternalLink size={12} />
                      {ope.file_name || ope.submitted_file.split('/').pop() || 'View File'}
                    </FileLink>
                  ) : (
                    <NoFile>No file attached</NoFile>
                  )}
                </FileRow>
              </CardBody>
            </OpeCard>
          ))}
        </List>
      )}
    </Modal>
  );
};

export default OpeListModal;