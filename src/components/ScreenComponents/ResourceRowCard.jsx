import React from 'react';
import styled from 'styled-components'; // or your preferred styling library
import { FaEdit, FaTrash, FaUserSlash } from 'react-icons/fa';
import Badge from '../Badge';
import Button from '../Button';
import { theme } from '../../styles/Theme';
import { DateForApiFormate } from '../../utils/utils';

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


const formatEmpType = (type) => (type === 'T' ? 'TL' : 'EX');

const ResourceRowCard = ({
  row,
  dateStr,
  onEdit,
  onRemove,
  onSave,
  onCancel,
  onFieldChange,
  onEmployeeChange,
  disabled = false,
  isEditing = false,
  isReplaced = false,
  employees = [],
  minActualDate,
  maxActualDate,
  getStartDateField,
  getContractRate,
  tlContractRate,
  exContractRate
}) => {
  // Default rate calculation function
  const defaultGetContractRate = (row) => {
    const { contract_rate, emp_type, tlContractRate = 0, exContractRate = 0 } = row;
    return Number(contract_rate) > 0 
      ? contract_rate 
      : emp_type === "T" 
        ? tlContractRate || 0 
        : exContractRate || 0;
  };

  const getRate = getContractRate || defaultGetContractRate;

  const handleEdit = (e) => {
    e?.stopPropagation();
    if (onEdit && !disabled) {
      onEdit(row, dateStr);
    }
  };

  // Handle delete click
  const handleDelete = (e) => {
    e?.stopPropagation();
    if (onRemove && !disabled) {
      onRemove(row, dateStr);
    }
  };

  const renderNormalView = () => (
    <>
      <ResourceInfo>
        <ResourceName>
          {row.employee_name || row.emp_id}
          <span style={{ color: theme?.colors?.textLight || '#999' }}>
            ({row.emp_id})
          </span>
          {row.action === "ADD" && (
            <Badge variant="warning" style={{ fontSize: '0.58rem' }}>New</Badge>
          )}
          {row.action === "UPDATE" && (
            <Badge variant="info" style={{ fontSize: '0.58rem' }}>Updated</Badge>
          )}
          {row.is_approved && (
            <Badge variant="success" style={{ fontSize: '0.58rem' }}>Approved</Badge>
          )}
        </ResourceName>
        <ResourceMeta>
          {row.emp_type && formatEmpType && (
            <Badge 
              variant={row.emp_type === 'T' ? 'forward' : 'info'} 
              style={{ fontSize: '0.6rem' }}
            >
              {formatEmpType(row.emp_type)}
            </Badge>
          )}
          <span>{row.start_date || '—'} to {row.end_date || '—'}</span>
          {row.remarks && <span>· {row.remarks}</span>}
        </ResourceMeta>
      </ResourceInfo>
      <RateActionsCol>
        <RateTag>
          ₹{Number(row.contract_rate) > 0 ? row.contract_rate : row.emp_type === "T" ? tlContractRate || 0 : exContractRate || 0}
        </RateTag>
        <RowActions onClick={(e) => e.stopPropagation()}>
          <Button 
            iconOnly 
            variant="primary" 
            title="Edit" 
            disabled={disabled} 
            onClick={() => onEdit?.(row, dateStr)}
          >
            <FaEdit size={11} />
          </Button>
          <Button 
            iconOnly 
            variant="outlines" 
            title="Remove" 
            disabled={disabled} 
            onClick={() => onRemove?.(row, dateStr)}
          >
            <FaTrash size={11} />
          </Button>
        </RowActions>
      </RateActionsCol>
    </>
  );

  // Edit view
  const renderEditView = () => (
    <>
      <EditRowContainer>
        <FormField>
          <FormLabel>
            Resource {isReplaced && <Badge variant="warning" style={{ fontSize: '0.55rem' }}>Replaced</Badge>}
          </FormLabel>
          {employees.length > 0 ? (
            <FormSelect 
              value={row.emp_id} 
              onChange={(e) => onEmployeeChange?.(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp.emp_id} value={emp.emp_id}>
                  {emp.name}
                </option>
              ))}
            </FormSelect>
          ) : (
            <FormInput
              type="text"
              value={row.employee_name}
              onChange={(e) => onFieldChange?.("employee_name", e.target.value)}
            />
          )}
        </FormField>

        <FormField>
          <FormLabel>Employee Type</FormLabel>
          <FormSelect 
            value={row.emp_type} 
            onChange={(e) => onFieldChange?.("emp_type", e.target.value)}
          >
            <option value="E">Executive (EX)</option>
            <option value="T">Team Lead (TL)</option>
          </FormSelect>
        </FormField>

        <FormField>
          <FormLabel>Start Date</FormLabel>
          <FormInput
            type="date"
            min={minActualDate}
            max={maxActualDate}
            value={DateForApiFormate(row.start_date || row.s_date || "", true)}
            onChange={(e) => onFieldChange?.(getStartDateField?.(row) || "start_date", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel>End Date</FormLabel>
          <FormInput
            type="date"
            min={row.start_date || minActualDate}
            max={maxActualDate}
            value={DateForApiFormate(row.end_date || row.e_date || "", true)}
            onChange={(e) => onFieldChange?.(getStartDateField?.(row) || "end_date", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel>Contract Rate</FormLabel>
          <FormInput
            type="number"
            value={row.contract_rate ?? ""}
            disabled
          />
        </FormField>

        <FormField style={{ gridColumn: "span 2" }}>
          <FormLabel>Remarks</FormLabel>
          <FormInput
            type="text"
            value={row.remarks || ""}
            placeholder="Remarks"
            onChange={(e) => onFieldChange?.("remarks", e.target.value)}
          />
        </FormField>
      </EditRowContainer>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
        {onSave && (
          <Button size="sm" variant="success" onClick={onSave}>
            Save
          </Button>
        )}
        {onCancel && (
          <Button size="sm" variant="outlines" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button size="sm" variant="outlines" onClick={() => onRemove?.(row, dateStr)}>
          <FaUserSlash /> Remove
        </Button>
      </div>
    </>
  );

  return (
    <>
    {isEditing ?
    renderEditView()

    :

    <ResourceRow>
     {renderNormalView()}
    </ResourceRow>}
    
    </>
  );
};

export default ResourceRowCard;