import styled from "styled-components";
import { formatToApiDate, DateForApiFormate } from "../../utils/utils";
import Card from "../Card";
import DataTable, { Td } from "../DataTable";
import Button from "../Button";
import Badge from "../Badge";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";

const NameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`
const EmpName = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`
const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`
const EditRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f9f9fa'};
  border-radius: 6px;
  border: 1px dashed ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FormLabel = styled.label`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
`;

const FormInput = styled.input`
  padding: 0.35rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ccc'};
  border-radius: 4px;
  font-size: 0.75rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`;

const FormSelect = styled.select`
  padding: 0.35rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ccc'};
  border-radius: 4px;
  font-size: 0.75rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`;

const HeaderDate = styled.div`
  font-size: ${({ theme }) => theme.fontSize?.md || '#333'};
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#333'}

`;

const ScrollableTableWrapper = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;


const CurrentAssignments = ({
  allResourceAllocationList,
  dayWindow,
  getDateWiseAssignments,
  editingId,
  handleStartEdit,
  handleMarkDelete,
  handleUndoDelete,
  handleFieldChange,
  handleConfirmUpdate,
  handleCancelEdit,
  activityStart,
  activityEnd,
  activityData,
}) => {
  return (
    //   <Card title={`Current Assignments`} headerAction={<><span style={{ fontSize: '0.8rem', color: '#888' }}>Total: {activeTL} TL · {activeEX} EX </span></>}>
    <Card title={`Current Assignments`} >
      <ScrollableTableWrapper>
        {dayWindow.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            {dayWindow.map((d, index) => {
              const dStr = formatToApiDate(d);
              const assignments = getDateWiseAssignments[dStr] || [];
              const tlCount = assignments.filter(a => a.type === 'T').length;
              const exCount = assignments.filter(a => a.type === 'E').length;

              return (
                <div key={dStr} style={{ marginBottom: index < dayWindow.length - 1 ? '0.5rem' : '0', padding: "1rem" }}>
                  {/* Date Header */}
                  {/* <Card> */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '12px 16px',
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid #e0e0e0',
                  }}>
                    <HeaderDate>
                      {d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }).toUpperCase()}
                    </HeaderDate>
                    <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '4px' }}>
                      TL: <strong>{tlCount}</strong> &nbsp;&nbsp; EX: <strong>{exCount}</strong>
                    </div>
                  </div>

                  {/* Assignments Table for this date */}
                  {assignments.length > 0 ? (
                    <DataTable
                      columns={['Resource', 'Dates', 'Type', 'Remark', 'Actions']}
                      data={assignments.map(a => ({
                        ...allResourceAllocationList.find(r => r._rowKey === a._rowKey),
                        dateKey: dStr
                      }))}
                      modifiedId={true}
                      modifiedIdName="_rowKey"
                      expandedRow={editingId && editingId.date === dStr ? editingId.rowKey : null}
                      emptyMessage="No assignments"
                      renderRow={(row) => {
                        const isEditing = editingId && editingId.rowKey === row._rowKey && editingId.date === dStr;
                        return (
                          <>
                            <Td>
                              <NameCell>
                                <EmpName>
                                  {row.employee_name || row.emp_id}
                                  {!row.id && <Badge variant="warning" style={{ fontSize: '0.58rem' }}>New</Badge>}
                                  {row._deleted && <Badge variant="error" style={{ fontSize: '0.58rem' }}>Removed</Badge>}
                                  {row._updated && !row._deleted && <Badge variant="info" style={{ fontSize: '0.58rem' }}>Edited</Badge>}
                                </EmpName>
                              </NameCell>
                            </Td>
                            <Td>{row.start_date || '—'} to {row.end_date || '—'}</Td>
                            <Td>
                              <Badge variant={row.emp_type === 'T' ? 'forward' : 'info'} style={{ fontSize: '0.65rem' }}>
                                {row.emp_type === 'T' ? 'TL' : 'EX'}
                              </Badge>
                            </Td>
                            <Td>
                              <span style={{ fontSize: '0.85rem', color: '#555' }}>
                                {row.remarks || '—'}
                              </span>
                            </Td>
                            <Td>
                              <RowActions onClick={(e) => e.stopPropagation()}>
                                {!row._deleted ? (
                                  <>
                                    {!isEditing && (
                                      <Button iconOnly variant="primary" title="Edit" onClick={() => handleStartEdit(row, dStr)}>
                                        <FaEdit size={12} />
                                      </Button>
                                    )}
                                    <Button iconOnly variant="outlines" title="Remove" onClick={() => handleMarkDelete(row._rowKey, dStr)}>
                                      <FaTrash size={12} />
                                    </Button>
                                  </>
                                ) : (
                                  <Button iconOnly variant="successGhost" title="Undo remove" onClick={() => handleUndoDelete(row._rowKey)}>
                                    <FaUndo size={12} />
                                  </Button>
                                )}
                              </RowActions>
                            </Td>
                          </>
                        );
                      }}
                      renderExpandedRow={(row) => (
                        <InlineEditForm
                          row={row}
                          onChange={handleFieldChange}
                          onConfirm={handleConfirmUpdate}
                          onCancel={handleCancelEdit}
                          activityStart={activityStart}
                          activityEnd={activityEnd}
                        />
                      )}
                    />

                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#888',
                      border: '1px solid #e0e0e0',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px'
                    }}>
                      No resources assigned on this date
                    </div>
                  )}
                  {/* </Card> */}
                </div>
              );
            })}
          </div>
        )}
      </ScrollableTableWrapper>
    </Card>
  )
};

export default CurrentAssignments;

const InlineEditForm = ({ row, onChange, onConfirm, onCancel, activityStart, activityEnd }) => {
  const formattedStart = activityStart ? DateForApiFormate(activityStart, true) : "";
  const formattedEnd = activityEnd ? DateForApiFormate(activityEnd, true) : "";

  return (
    <EditRowContainer>
      <FormField>
        <FormLabel>Start Date</FormLabel>
        <FormInput
          type="date"
          min={formattedStart}
          max={formattedEnd}
          value={row.start_date || ""}
          onChange={(e) => onChange(row._rowKey, "start_date", e.target.value)}
        />
      </FormField>
      <FormField>
        <FormLabel>End Date</FormLabel>
        <FormInput
          type="date"
          min={formattedStart}
          max={formattedEnd}
          value={row.end_date || ""}
          onChange={(e) => onChange(row._rowKey, "end_date", e.target.value)}
        />
      </FormField>
      <FormField>
        <FormLabel>Employee Type</FormLabel>
        <FormSelect
          value={row.emp_type || "E"}
          onChange={(e) => onChange(row._rowKey, "emp_type", e.target.value)}
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
          onChange={(e) => onChange(row._rowKey, "remarks", e.target.value)}
        />
      </FormField>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
        <Button size="small" variant="successGhost" onClick={() => onConfirm(row._rowKey)}>
          Confirm
        </Button>
        <Button size="small" variant="outlines" onClick={() => onCancel(row._rowKey)}>
          Cancel
        </Button>
      </div>
    </EditRowContainer>
  );
};