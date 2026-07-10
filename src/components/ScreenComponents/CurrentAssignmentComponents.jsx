import styled from "styled-components";
import { DateForApiFormate } from "../../utils/utils";
import Button from "../Button";
import { FaEdit, FaTrash, FaUserSlash } from "react-icons/fa";
import Badge from "../Badge";

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

export const PlanEditForm = ({ row, onChange, onConfirm, onCancel, activityStart, activityEnd }) => {
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

export const ActualEditForm = ({ row, employees, readOnly, isReplaced, onFieldChange, onEmployeeChange, onRemove }) => {
	if (readOnly) {
    return (
      <ResourceDataRow
        row={row}
        showActions={false}
        showDates={true} // Show dates in readonly mode
        customBadges={
          isReplaced && (
            <Badge variant="warning" style={{ fontSize: "0.58rem" }}>
              Replaced
            </Badge>
          )
        }
        metaPrefix={<span>· </span>}
      />
    );
  }
 
  return (
    <EditRowContainer>
      <FormField>
        <FormLabel>Resource {isReplaced && <Badge variant="warning" style={{ fontSize: '0.55rem' }}>Replaced</Badge>}</FormLabel>
        {employees.length > 0 ? (
          <FormSelect value={row.emp_id} onChange={(e) => onEmployeeChange(e.target.value)}>
            {employees.map((emp) => (
              <option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option>
            ))}
          </FormSelect>
        ) : (
          <FormInput
            type="text"
            value={row.employee_name}
            onChange={(e) => onFieldChange("employee_name", e.target.value)}
          />
        )}
      </FormField>
 
      <FormField>
        <FormLabel>Employee Type</FormLabel>
        <FormSelect value={row.emp_type} onChange={(e) => onFieldChange("emp_type", e.target.value)}>
          <option value="E">Executive (EX)</option>
          <option value="T">Team Lead (TL)</option>
        </FormSelect>
      </FormField>
 
      <FormField style={{ gridColumn: "span 2" }}>
        <FormLabel>Remarks</FormLabel>
        <FormInput
          type="text"
          value={row.remarks}
          placeholder="Remarks"
          onChange={(e) => onFieldChange("remarks", e.target.value)}
        />
      </FormField>
 
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <Button size="sm" variant="outlines" onClick={onRemove}> <FaUserSlash /> Remove</Button>
      </div>
    </EditRowContainer>
  );
};

export const ResourceDataRow = ({
  row,
  showActions = false,
  disableActions = false,
  onEdit,
  onDelete,
  onDateStr,
  showBadges = true,
  badgeVariant = 'warning',
  renderActions,
  customBadges,
  metaPrefix,
  metaSuffix,
  showDates = true, // New prop to control date visibility
  className
}) => {
  // Helper to format employee type
  const formatEmpType = (type) => {
    return type === 'T' ? 'TL' : 'EX';
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '—';
    // If date is already formatted, return as is
    if (typeof date === 'string' && date.includes('-')) return date;
    // Otherwise format it
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return date || '—';
    }
  };

  // Default badge renderer
  const renderDefaultBadges = () => {
    if (!showBadges) return null;
    
    return (
      <>
        {row.action === "ADD" && (
          <Badge variant="warning" style={{ fontSize: '0.58rem' }}>New</Badge>
        )}
        {row.action === "UPDATE" && (
          <Badge variant="info" style={{ fontSize: '0.58rem' }}>Updated</Badge>
        )}
        {row.is_approved && (
          <Badge variant="success" style={{ fontSize: '0.58rem' }}>Approved</Badge>
        )}
      </>
    );
  };

  // Render all badges (custom + default)
  const renderBadges = () => {
    return (
      <>
        {customBadges}
        {renderDefaultBadges()}
      </>
    );
  };

  // Render date range
  const renderDateRange = () => {
    if (!showDates) return null;
    
    const startDate = row.start_date || row.startDate || row.from_date || row.fromDate;
    const endDate = row.end_date || row.endDate || row.to_date || row.toDate;
    
    return (
      <span>
        {formatDate(startDate)} to {formatDate(endDate)}
      </span>
    );
  };

  // Render actions
  const renderActionButtons = () => {
    if (renderActions) {
      return renderActions(row);
    }

    if (showActions) {
      return (
        <RowActions onClick={(e) => e.stopPropagation()}>

          <Button iconOnly variant="primary" title="Edit" disabled={disableActions} onClick={() => onEdit?.(row, onDateStr)}>
            <FaEdit size={11} />
          </Button>

          <Button iconOnly variant="outlines" title="Remove" disabled={disableActions} onClick={() => onDelete?.(row, onDateStr)}>
            <FaTrash size={11} />
          </Button>

        </RowActions>
      );
    }

    return null;
  };

  return (
    <ResourceRow className={className}>
      <ResourceInfo>
        <ResourceName>
          {row.employee_name || row.emp_id || row.employeeName}
          {renderBadges()}
        </ResourceName>
        <ResourceMeta>
          <Badge 
            variant={row.emp_type === 'T' ? 'forward' : 'info'} 
            style={{ fontSize: '0.6rem' }}
          >
            {formatEmpType(row.emp_type)}
          </Badge>
          {metaPrefix}
          {renderDateRange()}
          {row.remarks && <span>· {row.remarks}</span>}
          {metaSuffix}
        </ResourceMeta>
      </ResourceInfo>
      <RateActionsCol>
        <RateTag>
          {row.contract_rate != null ? `₹${row.contract_rate}` : '—'}
        </RateTag>
        {renderActionButtons()}
      </RateActionsCol>
    </ResourceRow>
  );
};

export default ResourceDataRow;