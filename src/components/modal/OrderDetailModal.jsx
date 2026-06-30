import React from 'react';
import styled, { keyframes } from 'styled-components';
import { LuUsers, LuReceipt, LuPaperclip, LuExternalLink, LuTrendingUp } from 'react-icons/lu';
import Modal from '../Modal';
import Badge from '../Badge';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Section = styled.div`
  animation: ${fadeUp} 0.2s ease both;
  animation-delay: ${({ delay }) => delay || '0s'};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
`;

const CountBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}18` : '#ede9ff'};
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  padding: 2px 8px;
  border-radius: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  table-layout: fixed;
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
`;

const Th = styled.th`
  padding: 0.5rem 0.75rem;
  text-align: ${({ align }) => align || 'left'};
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  width: ${({ width }) => width || 'auto'};
`;

const Td = styled.td`
  padding: 0.6rem 0.75rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  text-align: ${({ align }) => align || 'left'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:last-child { white-space: normal; }
`;

const Tr = styled.tr`
  &:last-child td { border-bottom: none; }
  &:hover td { background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'}; }
`;

const Avatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}18` : '#ede9ff'};
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  font-size: 0.65rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 6px;
  vertical-align: middle;
`;

const CategoryChip = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f0f2f8'};
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
`;

const FileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  text-decoration: none;
  padding: 2px 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}12` : '#ede9ff'};
  border: 1px solid ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}28` : '#c4b5fd'};
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}22` : '#ddd6fe'};
  }
`;

const NoFile = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  font-style: italic;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  margin: 1rem 0;
`;

const SummaryBox = styled.div`
  border-radius: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  overflow: hidden;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};

  span:last-child {
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#333'};
  }
`;

const SummaryTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  background: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
`;

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const initials = (name) =>
  name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Main Component ───────────────────────────────────────────────────────────

const OrderDetailModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const { assigned_resources = [], ope_expenses = [] } = data;

  const resourceTotal = assigned_resources.reduce((s, r) => s + (r.total || 0), 0);
  const opeTotal = ope_expenses.reduce((s, o) => s + (o.amount || 0), 0);
  const netTotal = resourceTotal + opeTotal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Financial Summary"
      showSaveButton={false}
      cancelButtonText="Close"
      width="42rem"
      maxHeight="70vh"
    >
      {/* ── Assigned Resources ── */}
      <Section delay="0s">
        <SectionHeader>
          <SectionTitle>
            <LuUsers size={13} /> Assigned Resources
          </SectionTitle>
          <CountBadge>{assigned_resources.length} Professional{assigned_resources.length !== 1 ? 's' : ''}</CountBadge>
        </SectionHeader>

        <SummaryBox>
          <Table>
            <Thead>
              <tr>
                <Th width="40%">Employee</Th>
                <Th>Role</Th>
                <Th align="right">Rate</Th>
                <Th align="right">Total</Th>
              </tr>
            </Thead>
            <tbody>
              {assigned_resources.map((r, i) => (
                <Tr key={i}>
                  <Td>
                    <Avatar>{initials(r.employee_name)}</Avatar>
                    {r.employee_name}
                  </Td>
                  <Td>
                    <Badge variant={r.role === "TL" ? "forward" : "settle"}>
                      {r.role === "TL" ? "Team Lead" : "Executive"}
                    </Badge>
                  </Td>
                  <Td align="right">₹{r.rate}</Td>
                  <Td align="right" style={{ fontWeight: 600 }}>{fmt(r.total)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </SummaryBox>
      </Section>

      <Divider />

      {/* ── OPE Expenses ── */}
      <Section delay="0.06s">
        <SectionHeader>
          <SectionTitle>
            <LuReceipt size={13} /> Other People's Expenses
          </SectionTitle>
          <CountBadge>{ope_expenses.length} Entr{ope_expenses.length !== 1 ? 'ies' : 'y'}</CountBadge>
        </SectionHeader>

        <SummaryBox>
          <Table>
            <Thead>
              <tr>
                <Th width="16%">Date</Th>
                <Th width="30%">Description</Th>
                {/* <Th width="14%">Category</Th> */}
                <Th width="16%" align="right">Amount</Th>
                <Th width="24%" align="center">File</Th>
              </tr>
            </Thead>
            <tbody>
              {ope_expenses.map((o, i) => (
                <Tr key={i}>
                  <Td>{o.date}</Td>
                  <Td style={{ whiteSpace: 'normal' }}>{o.description}</Td>
                  {/* <Td><CategoryChip>{o.category}</CategoryChip></Td> */}
                  <Td align="right" style={{ fontWeight: 600 }}>{fmt(o.amount)}</Td>
                  <Td align="center">
                    {o.submitted_file ? (
                      <FileLink href={o.submitted_file} target="_blank" rel="noreferrer">
                        <LuExternalLink size={11} />
                        {o.file_name || 'View'}
                      </FileLink>
                    ) : (
                      <NoFile>No file</NoFile>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </SummaryBox>
      </Section>

      <Divider />

      {/* ── Net Summary ── */}
      <Section delay="0.12s">
        <SectionTitle style={{ marginBottom: '0.6rem' }}>
          <LuTrendingUp size={13} /> Cost Breakdown
        </SectionTitle>
        <SummaryBox>
          <SummaryRow>
            <span>Resource Payout</span>
            <span>{fmt(resourceTotal)}</span>
          </SummaryRow>
          <SummaryRow style={{ borderBottom: 'none' }}>
            <span>OPE Total</span>
            <span>{fmt(opeTotal)}</span>
          </SummaryRow>
          <SummaryTotal>
            <span>Net Order Cost</span>
            <span>{fmt(netTotal)}</span>
          </SummaryTotal>
        </SummaryBox>
      </Section>
    </Modal>
  );
};

export default OrderDetailModal;