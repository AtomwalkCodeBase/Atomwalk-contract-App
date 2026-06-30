import styled from "styled-components";
import { formatToApiDate, DateForApiFormate } from "../../utils/utils";
import Card from "../Card";
import DataTable, { Td } from "../DataTable";
import Button from "../Button";
import Badge from "../Badge";
import { FaEdit, FaTrash } from "react-icons/fa";

/* ---------------------------------- */
/* Styled                              */
/* ---------------------------------- */

const ScrollableTableWrapper = styled.div`
  max-height: 800px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
`;

const DateBlock = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const DateHeader = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const HeaderDate = styled.div`
  font-size: ${({ theme }) => theme.fontSize?.md || '0.95rem'};
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#333'};
`;

const CountPill = styled.div`
  font-size: 0.8rem;
  color: #555;
  strong { color: #222; }
`;

const Section = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  &:last-child { border-bottom: none; }
`;

const SectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.primary || '#888'};
  margin-bottom: 8px;
`;

const PlanActualGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SubPanel = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
`;

const SubPanelHeader = styled.div`
  background: ${({ $variant, theme }) =>
    $variant === 'plan'
      ? (theme.colors?.backgroundAlt || '#f1f5f9')
      : '#fff7ed'};
  padding: 6px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ $variant }) => ($variant === 'plan' ? '#334155' : '#9a5b13')};
`;

const ResourceRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid #f1f1f1;
  &:first-of-type { border-top: none; }
`;

const ResourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ResourceName = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const ResourceMeta = styled.div`
  font-size: 0.68rem;
  color: #888;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const RateActionsCol = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const RateTag = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#0E7A91'};
  white-space: nowrap;
`;

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const EmptyRow = styled.div`
  padding: 14px 10px;
  text-align: center;
  font-size: 0.75rem;
  color: #999;
`;

const TotalsBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f9fafb'};
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #333;
`;

const ClaimsTable = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
`;

const ClaimsHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 0.8fr;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f1f5f9'};
  padding: 6px 10px;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #888;
`;

const ClaimsRow = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 0.8fr;
  align-items: center;
  padding: 7px 10px;
  border-top: 1px solid #f1f1f1;
  font-size: 0.76rem;
  color: #333;
`;

const FileLink = styled.a`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors?.primary || '#0E7A91'};
  text-decoration: underline;
`;

const GrandTotalBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  padding: 10px 12px;
  margin-top: 10px;
  background: ${({ theme }) => theme.colors?.primary || '#0E7A91'}1A;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#0E7A91'}33;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || '#0E7A91'};
`;

/* ---------------------------------- */
/* Helpers                             */
/* ---------------------------------- */

// Parses an entry's resource strings: "empId^name^rate^type"
const parseActualResources = (entry) => {
  if (!entry?.resource_list?.length) return [];
  return entry.resource_list.map((str) => {
    const [emp_id, name, rate, emp_type] = (str || "").split("^");
    return { emp_id, name, rate, emp_type };
  });
};

const findActualEntryForDate = (activityData, dStr) => {
  const allEntries = activityData?.allAEntries || [];
  return allEntries.find((entry) => entry.start_date === dStr) || null;
};

const formatEmpType = (type) => (type === 'T' ? 'TL' : 'EX');

// Dummy claims data for design preview — replace with real claims once API is wired
const getDummyClaims = (dStr) => [
  { category: "Travel", id: `CLM-${dStr}-01`, amount: 1200, file: "#" },
  { category: "Food", id: `CLM-${dStr}-02`, amount: 450, file: "#" },
];

/* ---------------------------------- */
/* Main Component                      */
/* ---------------------------------- */

const CurrentAssignments = ({
  dateWiseAssignments,
  dayWindow,
  editingId,
  handleEditDate,
  handleDeleteDate,
  handleFieldChange,
  handleConfirmUpdate,
  handleCancelEdit,
  activityStart,
  activityEnd,
  activityData,
}) => {
  return (
    <Card title="Current Assignments">
      <ScrollableTableWrapper>
        {dayWindow.length === 0 ? (
          <EmptyRow>No dates in range</EmptyRow>
        ) : (
          dayWindow.map((d) => {
            const dStr = formatToApiDate(d);
            const planAssignments = dateWiseAssignments[dStr] || [];
            const tlCount = planAssignments.filter((a) => a.emp_type === 'T').length;
            const exCount = planAssignments.filter((a) => a.emp_type === 'E').length;

            const actualEntry = findActualEntryForDate(activityData, dStr);
            const actualResources = parseActualResources(actualEntry);
            const planEmpIds = new Set(planAssignments.map((a) => a.emp_id));

            const planTotal = planAssignments.reduce(
              (sum, r) => sum + (Number(r.contract_rate) || 0),
              0
            );
            const actualTotal = actualResources.reduce(
              (sum, r) => sum + (Number(r.rate) || 0),
              0
            );

            const claims = getDummyClaims(dStr);
            const claimsTotal = claims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
            const grandTotal = planTotal + claimsTotal;

            return (
              <DateBlock key={dStr}>
                {/* Date header */}
                <DateHeader>
                  <HeaderDate>
                    {d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }).toUpperCase()}
                  </HeaderDate>
                  <CountPill>
                    TL: <strong>{tlCount}</strong> &nbsp;&nbsp; EX: <strong>{exCount}</strong>
                  </CountPill>
                </DateHeader>

                {/* Plan / Actual */}
                <Section>
                  <SectionTitle>Resource Details</SectionTitle>
                  <PlanActualGrid>
                    {/* PLAN */}
                    <SubPanel>
                      <SubPanelHeader $variant="plan">Plan</SubPanelHeader>
                      {planAssignments.length === 0 ? (
                        <EmptyRow>No resources planned</EmptyRow>
                      ) : (
                        planAssignments.map((row) => {
                          const disableAction = row.is_approved || activityData?.allAEntries?.length;
                          const isEditing = editingId === row.rowKey;

                          console.log("isEditing", isEditing)

                          if (isEditing) {
                            return (
                              <InlineEditForm
                                key={row.rowKey}
                                row={row}
                                onChange={handleFieldChange}
                                onConfirm={handleConfirmUpdate}
                                onCancel={handleCancelEdit}
                                activityStart={activityStart}
                                activityEnd={activityEnd}
                              />
                            );
                          }

                          return (
                            <ResourceRow key={row.rowKey}>
                              <ResourceInfo>
                                <ResourceName>
                                  {row.employee_name || row.emp_id}
                                  {row.action === "ADD" && <Badge variant="warning" style={{ fontSize: '0.58rem' }}>New</Badge>}
                                  {row.action === "UPDATE" && <Badge variant="info" style={{ fontSize: '0.58rem' }}>Updated</Badge>}
                                  {row.is_approved && <Badge variant="success" style={{ fontSize: '0.58rem' }}>Approved</Badge>}
                                </ResourceName>
                                <ResourceMeta>
                                  <Badge variant={row.emp_type === 'T' ? 'forward' : 'info'} style={{ fontSize: '0.6rem' }}>
                                    {formatEmpType(row.emp_type)}
                                  </Badge>
                                  <span>{row.start_date || '—'} to {row.end_date || '—'}</span>
                                  {row.remarks && <span>· {row.remarks}</span>}
                                </ResourceMeta>
                              </ResourceInfo>
                              <RateActionsCol>
                                <RateTag>{row.contract_rate != null ? `₹${row.contract_rate}` : '—'}</RateTag>
                                <RowActions onClick={(e) => e.stopPropagation()}>
                                  <Button iconOnly variant="primary" title="Edit" disabled={disableAction} onClick={() => handleEditDate(row, dStr)}>
                                    <FaEdit size={11} />
                                  </Button>
                                  <Button iconOnly variant="outlines" title="Remove" disabled={disableAction} onClick={() => handleDeleteDate(row, dStr)}>
                                    <FaTrash size={11} />
                                  </Button>
                                </RowActions>
                              </RateActionsCol>
                            </ResourceRow>
                          );
                        })
                      )}
                    </SubPanel>

                    {/* ACTUAL */}
                    <SubPanel>
                      <SubPanelHeader $variant="actual">Actual</SubPanelHeader>
                      {actualResources.length === 0 ? (
                        <EmptyRow>No actual data recorded</EmptyRow>
                      ) : (
                        actualResources.map((res, idx) => {
                          const isReplaced = !planEmpIds.has(res.emp_id);
                          return (
                            <ResourceRow key={`${res.emp_id}-${idx}`}>
                              <ResourceInfo>
                                <ResourceName>
                                  {res.name || res.emp_id}
                                  {isReplaced && <Badge variant="warning" style={{ fontSize: '0.58rem' }}>Replaced</Badge>}
                                </ResourceName>
                                <ResourceMeta>
                                  <Badge variant={res.emp_type === 'T' ? 'forward' : 'info'} style={{ fontSize: '0.6rem' }}>
                                    {formatEmpType(res.emp_type)}
                                  </Badge>
                                </ResourceMeta>
                              </ResourceInfo>
                              <RateActionsCol>
                                <RateTag>{res.rate != null ? `₹${res.rate}` : '—'}</RateTag>
                              </RateActionsCol>
                            </ResourceRow>
                          );
                        })
                      )}
                    </SubPanel>
                  </PlanActualGrid>

                  <TotalsBar style={{ marginTop: 10 }}>
                    <span>Plan Total: ₹{planTotal}</span>
                    <span>Actual Total: ₹{actualTotal}</span>
                  </TotalsBar>
                </Section>

                {/* Claims */}
                <Section>
                  <SectionTitle>Claim Items</SectionTitle>
                  {claims.length === 0 ? (
                    <EmptyRow>No claims submitted</EmptyRow>
                  ) : (
                    <ClaimsTable>
                      <ClaimsHeaderRow>
                        <span>Category</span>
                        <span>ID</span>
                        <span>Amount</span>
                        <span>File</span>
                      </ClaimsHeaderRow>
                      {claims.map((c) => (
                        <ClaimsRow key={c.id}>
                          <span>{c.category}</span>
                          <span>{c.id}</span>
                          <span>₹{c.amount}</span>
                          <FileLink href={c.file} target="_blank" rel="noreferrer">View</FileLink>
                        </ClaimsRow>
                      ))}
                    </ClaimsTable>
                  )}

                  <GrandTotalBar>
                    <span>Contract Rate + Claims: ₹{grandTotal}</span>
                  </GrandTotalBar>
                </Section>
              </DateBlock>
            );
          })
        )}
      </ScrollableTableWrapper>
    </Card>
  );
};

export default CurrentAssignments;

const EditRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f9f9fa'};
  border-radius: 6px;
  border: 1px dashed ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  margin: 0.5rem 0;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const FormLabel = styled.label`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
`;

const FormInput = styled.input`
  padding: 0.25rem 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ccc'};
  border-radius: 4px;
  font-size: 0.7rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`;

const FormSelect = styled.select`
  padding: 0.25rem 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ccc'};
  border-radius: 4px;
  font-size: 0.7rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`;

const InlineEditForm = ({ row, onChange, onConfirm, onCancel, activityStart, activityEnd }) => {
  const formattedStart = activityStart ? DateForApiFormate(activityStart, true) : "";
  const formattedEnd = activityEnd ? DateForApiFormate(activityEnd, true) : "";

  return (
    <EditRowContainer onClick={(e) => e.stopPropagation()}>
      <FormField>
        <FormLabel>Start Date</FormLabel>
        <FormInput
          type="date"
          min={formattedStart}
          max={formattedEnd}
          value={row.start_date || ""}
          onChange={(e) => onChange(row.rowKey, "start_date", e.target.value)}
        />
      </FormField>
      <FormField>
        <FormLabel>End Date</FormLabel>
        <FormInput
          type="date"
          min={formattedStart}
          max={formattedEnd}
          value={row.end_date || ""}
          onChange={(e) => onChange(row.rowKey, "end_date", e.target.value)}
        />
      </FormField>
      <FormField>
        <FormLabel>Employee Type</FormLabel>
        <FormSelect
          value={row.emp_type || "E"}
          onChange={(e) => onChange(row.rowKey, "emp_type", e.target.value)}
        >
          <option value="E">Executive (EX)</option>
          <option value="T">Team Lead (TL)</option>
        </FormSelect>
      </FormField>
      <FormField style={{ gridColumn: "span 2" }}>
        <FormLabel>Remarks</FormLabel>
        <FormInput
          type="text"
          value={row.remarks || ""}
          placeholder="Remarks"
          onChange={(e) => onChange(row.rowKey, "remarks", e.target.value)}
        />
      </FormField>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
        <Button size="small" variant="successGhost" onClick={() => onConfirm(row.rowKey)}>
          Confirm
        </Button>
        <Button size="small" variant="outlines" onClick={() => onCancel(row.rowKey)}>
          Cancel
        </Button>
      </div>
    </EditRowContainer>
  );
};