import React, { useEffect, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import Modal from '../Modal'
import { toast } from 'react-toastify'
import { FaSearch, FaUser, FaUsers, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa'
import { LuUserCheck } from 'react-icons/lu'
import Badge from '../Badge'
import { getContractAllocationData, getemployeeLists, postAllocationData } from '../../services/productServices'
import { DateForApiFormate, formatDate } from '../../utils/utils'
import ConfirmPopup from '../ConfirmPopup'
import Button from '../Button'
import DataTable, { Td } from '../DataTable'

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Activity Info Banner ───────────────────────────────────────────────────

const InfoBanner = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.75rem;
  margin-bottom: 1rem;
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const InfoIconWrap = styled.div`
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  display: flex;
  align-items: center;
  font-size: 1.1rem;
`

const InfoDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const InfoLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
`

const InfoValue = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TabRow = styled.div`
  display: flex;
  border-bottom: 2px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  margin-bottom: 0.85rem;
  gap: 0;
`

const Tab = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ active, theme }) => active ? (theme.colors?.primary || '#6C5CE7') : (theme.colors?.textLight || '#aaa')};
  border-bottom: 2px solid ${({ active, theme }) => active ? (theme.colors?.primary || '#6C5CE7') : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover { color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'}; }
`

const TabBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background: ${({ active, theme }) => active ? (theme.colors?.primary || '#6C5CE7') : (theme.colors?.border || '#e0e0e0')};
  color: ${({ active }) => active ? '#fff' : '#888'};
  transition: all 0.15s ease;
`

// ─── Shared primitives ────────────────────────────────────────────────────────

const SectionLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
  margin-bottom: 0.45rem;
  display: flex;
  align-items: center;
  gap: 5px;
`

const EmptyMsg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  font-size: 0.8rem;
  font-style: italic;
`

const BlockedMsg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
  font-size: 0.83rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-radius: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
`

const SummaryStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.textLight || '#888'};
  margin-bottom: 0.6rem;
`

const PendingBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}10` : '#f0eeff'};
  border: 1px solid ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}28` : '#c4b5fd'};
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  margin-bottom: 0.6rem;
`

// ─── Assigned table ───────────────────────────────────────────────────────────

const Table = styled.div`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.65rem;
  overflow: hidden;
`

const THead = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 0.9fr 0.7fr 0.7fr 0.7fr auto;
  padding: 0.45rem 0.75rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  gap: 0.5rem;
`

const TH = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
`

const TBody = styled.div`
  max-height: 350px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || '#ddd'};
    border-radius: 4px;
  }
`

const TRow = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 0.9fr 0.7fr 0.7fr 0.7fr auto;
  padding: 0.55rem 0.75rem;
  gap: 0.5rem;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#f0f0f0'};
  animation: ${fadeIn} 0.15s ease both;
  background: ${({ deleted, theme }) => deleted ? '#fee2e210' : (theme.colors?.card || '#fff')};
  opacity: ${({ deleted }) => deleted ? 0.6 : 1};
  transition: background 0.15s, opacity 0.15s;

  &:last-child { border-bottom: none; }
`

const CellContent = styled.div`
  font-size: 0.78rem;
  color: ${({ theme, muted }) => muted ? (theme.colors?.textLight || '#aaa') : (theme.colors?.text || '#333')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
`

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`


// ─── Inline edit drawer ───────────────────────────────────────────────────────

const EditDrawer = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem 0.75rem;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}06` : '#f9f8ff'};
  border-top: 1px dashed ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  animation: ${fadeIn} 0.15s ease both;

  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
`

const DrawerField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  ${({ fullWidth }) => fullWidth && 'grid-column: 1 / -1;'}
`

const DrawerLabel = styled.label`
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
`

const DrawerInput = styled.input`
  padding: 0.35rem 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.4rem;
  font-size: 0.78rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  width: 100%;
  box-sizing: border-box;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'}; }
`

const DrawerSelect = styled.select`
  padding: 0.35rem 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.4rem;
  font-size: 0.78rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  width: 100%;
  box-sizing: border-box;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'}; }
`

const DrawerActions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
`

// ─── Pick list ────────────────────────────────────────────────────────────────

const SearchWrap = styled.div`
  position: relative;
  margin-bottom: 0.6rem;
`

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 1rem 0.55rem 2.1rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.6rem;
  font-size: 0.82rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}18` : '#ede9ff'};
  }
  &::placeholder { color: ${({ theme }) => theme.colors?.textLight || '#bbb'}; }
`

const SearchIconWrap = styled.div`
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  pointer-events: none;
`

const PickList = styled.div`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.65rem;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || '#ddd'};
    border-radius: 4px;
  }
`

const PickItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#f0f0f0'};
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  cursor: pointer;
  transition: background 0.12s ease;
  animation: ${fadeIn} 0.15s ease both;

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'}; }
`

const PickInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const PickName = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  display: flex;
  align-items: center;
  gap: 6px;
`

const PickId = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
`

const AddBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  background: transparent;
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors?.primary || '#6C5CE7'}; color: #fff; }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getEmpType = (emp) => (Number(emp?.grade_level) <= 1 ? 'E' : 'T')

const DRAWER_FIELDS = [
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'end_date', label: 'End Date', type: 'date' },
  { key: 'contract_rate', label: 'Contract Rate', type: 'number' },
  {
    key: 'emp_type', label: 'Employee Type', type: 'select',
    options: [{ value: 'E', label: 'Executive' }, { value: 'T', label: 'Team Lead' }]
  },
  { key: 'remarks', label: 'Remarks', type: 'text', fullWidth: true },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

// Inline edit drawer rendered inside the table row
const InlineEditDrawer = ({ fields, rowKey, onChange, onConfirm, onCancel }) => (
  <EditDrawer>
    {DRAWER_FIELDS.map(({ key, label, type, options, fullWidth }) => (
      <DrawerField key={key} fullWidth={fullWidth}>
        <DrawerLabel>{label}</DrawerLabel>
        {type === 'select' ? (
          <DrawerSelect value={fields[key] || ''} onChange={(e) => onChange(rowKey, key, e.target.value)}>
            <option value="">Select</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </DrawerSelect>
        ) : (
          <DrawerInput
            type={type}
            placeholder={type === 'text' ? 'Optional' : type === 'number' ? '0' : ''}
            value={fields[key] || ''}
            onChange={(e) => onChange(rowKey, key, e.target.value)}
          />
        )}
      </DrawerField>
    ))}
    <DrawerActions>
      <Button iconOnly={true} variant="outlines" title="Cancel" onClick={() => onCancel(rowKey)}>
        <FaTimes size={14} />
      </Button>
      <Button iconOnly={true} variant="successGhost" title="Confirm" onClick={() => onConfirm(rowKey)}>
        <FaCheck size={14} />
      </Button>
    </DrawerActions>
  </EditDrawer>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export const AssignEmployee = ({ isOpen, onClose, activityData, refreshData }) => {
  const loggedEmpId = localStorage.getItem('cust_emp_id')
  const isResourceLocked = !!activityData?.original_A?.resource_list

  const [tab, setTab] = useState('assigned')  // 'assigned' | 'add'
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState([])  // { id?, emp_id, emp_type, start_date, end_date, contract_rate, remarks, _deleted? }
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => { },
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null)
      return
    }
    fetchEmployees()
    loadExisting()
    setTab('assigned')
  }, [isOpen])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await getemployeeLists({ rm_emp_id: loggedEmpId })
      setEmployees(res?.data?.filter((e) => e.is_verified) || [])
    } catch { toast.error('Failed to fetch employees') }
    finally { setLoading(false) }
  }

  const loadExisting = async () => {
    const { start_date, end_date, id: allocation_id } = activityData.original_P
    if (!start_date || !end_date) return
    try {
      const res = await getContractAllocationData({
        allocation_id,
        start_date: DateForApiFormate(start_date),
        end_date: DateForApiFormate(end_date),
      })
      const mapped = (res?.data || []).map((item) => ({
        ...item,
        _rowKey: item.id || `existing_${item.emp_id}_${item.start_date || item.s_date}`,
        start_date: item.start_date ? DateForApiFormate(item.start_date, true) : (item.s_date ? DateForApiFormate(item.s_date, true) : ''),
        end_date: item.end_date ? DateForApiFormate(item.end_date, true) : (item.e_date ? DateForApiFormate(item.e_date, true) : ''),
      }))
      setSelected(mapped)
    } catch { toast.error('Failed to load existing allocations') }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedIds = new Set(selected.map((e) => e.emp_id))
  const filteredUnsel = employees
    .filter((e) => !selectedIds.has(e.emp_id))
    .filter((e) => {
      const q = search.toLowerCase()
      return e.name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q)
    })

  const newResources = selected.filter((s) => !s.id && !s._deleted)
  const updatedResources = selected.filter((s) => s.id && s._updated && !s._deleted)
  const deletedResources = selected.filter((s) => s.id && s._deleted)

  const pendingCount = newResources.length + updatedResources.length + deletedResources.length

  const tlCount = selected.filter((s) => s.emp_type === 'T' && !s._deleted).length
  const exCount = selected.filter((s) => s.emp_type === 'E' && !s._deleted).length

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = useCallback((emp) => {
    const tempKey = 'new_' + Date.now() + '_' + Math.random();
    setSelected((prev) => [
      ...prev,
      { _rowKey: tempKey, emp_id: emp.emp_id, emp_type: getEmpType(emp), start_date: '', end_date: '', contract_rate: '', remarks: '' },
    ])
    setEditingId(tempKey)
    setTab('assigned')
    setSearch('')
  }, [])

  const handleFieldChange = useCallback((rowKey, field, value) => {
    setSelected((prev) =>
      prev.map((e) => e._rowKey === rowKey ? { ...e, [field]: value, ...(e.id ? { _updated: true } : {}) } : e)
    )
  }, [])

  const handleEdit = (rowKey) => setEditingId(rowKey)
  const handleCancelEdit = (rowKey) => {
    if (editingId === rowKey) {
      setEditingId(null)
    }
  }

  const handleConfirmUpdate = useCallback((rowKey) => {
    const sel = selected.find((s) => s._rowKey === rowKey)
    const emp = employees.find((e) => e.emp_id === sel?.emp_id)
    setConfirmConfig({
      isOpen: true,
      title: 'Update Resource',
      message: `Are you sure you want to update the details for ${emp?.name || sel?.emp_id}?`,
      confirmLabel: 'Update',
      onConfirm: () => {
        handleCancelEdit(rowKey)
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }, [employees, selected])

  const handleMarkDelete = (rowKey) => {
    const sel = selected.find((s) => s._rowKey === rowKey)
    const emp = employees.find((e) => e.emp_id === sel?.emp_id)
    if (!sel?.id) {
      setSelected((p) => p.filter((e) => e._rowKey !== rowKey))
      if (editingId === rowKey) setEditingId(null)
      return
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Resource',
      message: `Are you sure you want to remove ${emp?.name || sel?.emp_id}?`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setSelected((p) => p.map((e) => e._rowKey === rowKey ? { ...e, _deleted: true } : e))
        if (editingId === rowKey) setEditingId(null)
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleUndoDelete = (rowKey) => setSelected((p) => p.map((e) => e._rowKey === rowKey ? { ...e, _deleted: false } : e))

  // ── Submit (batched ADD + UPDATE + DELETE) ─────────────────────────────────

  const handleSubmit = async () => {
    try {
      const p_id = activityData?.original_P?.id

      // 1. DELETE Mode
      if (deletedResources.length) {
        const fd = new FormData()
        fd.append('emp_id', loggedEmpId)
        fd.append('call_mode', 'DELETE')
        fd.append('p_id', p_id)
        
        const deletePayloadList = selected.map((s) => {
          if (s._deleted) {
            return {
              id: s.id,
              is_deleted: true
            }
          }
          return {
            id: s.id,
            emp_id: s.emp_id,
            emp_type: s.emp_type,
            start_date: DateForApiFormate(s.start_date),
            end_date: DateForApiFormate(s.end_date),
            remarks: s.remarks || '',
            contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
          }
        })
        fd.append('c_emp_list', JSON.stringify(deletePayloadList))
        
        console.log('DELETE PAYLOAD')
        for (let pair of fd.entries()) {
          console.log(pair[0], pair[1])
        }
        await postAllocationData(fd)
      }

      // 2. ADD / UPDATE Mode
      const activeNew = selected.filter((s) => !s.id && !s._deleted)
      const activeUpdated = selected.filter((s) => s.id && s._updated && !s._deleted)
      
      if (activeNew.length || activeUpdated.length) {
        const hasExisting = selected.some((s) => s.id && !s._deleted)
        const fd = new FormData()
        fd.append('emp_id', loggedEmpId)
        fd.append('p_id', p_id)

        if (!hasExisting && activeNew.length && !activeUpdated.length) {
          // ADD Mode
          fd.append('call_mode', 'ADD')
          const addPayloadList = activeNew.map(({ emp_id, emp_type, start_date, end_date, contract_rate, remarks }) => ({
            emp_id,
            emp_type,
            start_date: DateForApiFormate(start_date),
            end_date: DateForApiFormate(end_date),
            remarks: remarks || '',
            contract_rate: contract_rate ? parseFloat(contract_rate) : 0
          }))
          fd.append('c_emp_list', JSON.stringify(addPayloadList))
          
          console.log('ADD PAYLOAD')
          for (let pair of fd.entries()) {
            console.log(pair[0], pair[1])
          }
        } else {
          // UPDATE Mode
          fd.append('call_mode', 'UPDATE')
          const updatePayloadList = selected
            .filter((s) => !s._deleted)
            .map((s) => {
              const item = {
                emp_id: s.emp_id,
                emp_type: s.emp_type,
                start_date: DateForApiFormate(s.start_date),
                end_date: DateForApiFormate(s.end_date),
                remarks: s.remarks || '',
                contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
              }
              if (s.id) {
                item.id = s.id
                if (s._updated) {
                  item.is_updated = true
                }
              }
              return item
            })
          fd.append('c_emp_list', JSON.stringify(updatePayloadList))
          
          console.log('UPDATE PAYLOAD')
          for (let pair of fd.entries()) {
            console.log(pair[0], pair[1])
          }
        }
        await postAllocationData(fd)
      }

      toast.success('All changes saved')
      refreshData()
      onClose()
    } catch(error) { 
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save changes';
      toast.error(errorMessage); 
    }
  }

  const handleConfirmSubmit = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Save Changes',
      message: 'Are you sure you want to save all pending changes?',
      confirmLabel: 'Save',
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
        await handleSubmit()
      }
    })
  }

  // ── Save button label ──────────────────────────────────────────────────────

  const saveLabel = (() => {
    const parts = []
    if (newResources.length) parts.push(`Add ${newResources.length}`)
    if (updatedResources.length) parts.push(`Update ${updatedResources.length}`)
    if (deletedResources.length) parts.push(`Delete ${deletedResources.length}`)
    return parts.length ? parts.join(' · ') : 'Save Changes'
  })()

  // ── Render ─────────────────────────────────────────────────────────────────

  const matchingRetainers = activityData?.original_P?.retainer_list?.filter(
    (item) =>
      item.a_type === "P" &&
      item.start_date === activityData?.original_P?.start_date &&
      item.end_date === activityData?.original_P?.end_date
  ) || [];
  const plannedTlCount = matchingRetainers[0]?.tl_count || 0;
  const plannedExCount = matchingRetainers[0]?.ex_count || 0;

  const plannedStartDate = activityData?.planned_start_date || activityData?.original_P?.start_date;
  const plannedEndDate = activityData?.planned_end_date || activityData?.original_P?.end_date;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleConfirmSubmit}
      title={`Resources — ${activityData?.order_item_key || ''}`}
      saveButtonText={saveLabel}
      showSaveButton={!isResourceLocked && pendingCount > 0}
      width="60rem"
      maxHeight="80vh"
    >
      {isResourceLocked ? (
        <BlockedMsg>
          <LuUserCheck size={16} />
          Audit already started — resource assignment is locked.
        </BlockedMsg>
      ) : (
        <>
          {/* ── Activity Planned Info Banner ── */}
          <InfoBanner>
            <InfoItem>
              <InfoIconWrap><FaCalendarAlt /></InfoIconWrap>
              <InfoDetails>
                <InfoLabel>Planned Start Date</InfoLabel>
                <InfoValue>{formatDate(plannedStartDate)}</InfoValue>
              </InfoDetails>
            </InfoItem>
            <InfoItem>
              <InfoIconWrap><FaCalendarAlt /></InfoIconWrap>
              <InfoDetails>
                <InfoLabel>Planned End Date</InfoLabel>
                <InfoValue>{formatDate(plannedEndDate)}</InfoValue>
              </InfoDetails>
            </InfoItem>
            <InfoItem>
              <InfoIconWrap><FaUsers /></InfoIconWrap>
              <InfoDetails>
                <InfoLabel>Required TL</InfoLabel>
                <InfoValue>{plannedTlCount} Required</InfoValue>
              </InfoDetails>
            </InfoItem>
            <InfoItem>
              <InfoIconWrap><FaUsers /></InfoIconWrap>
              <InfoDetails>
                <InfoLabel>Required EX</InfoLabel>
                <InfoValue>{plannedExCount} Required</InfoValue>
              </InfoDetails>
            </InfoItem>
          </InfoBanner>
          {/* ── Tabs ── */}
          <TabRow>
            <Tab active={tab === 'assigned' ? 1 : 0} onClick={() => setTab('assigned')}>
              <FaUsers size={11} /> Assigned
              <TabBadge active={tab === 'assigned' ? 1 : 0}>
                {selected.filter((s) => !s._deleted).length}
              </TabBadge>
            </Tab>
            <Tab active={tab === 'add' ? 1 : 0} onClick={() => setTab('add')}>
              <FaPlus size={10} /> Add Resource
              <TabBadge active={tab === 'add' ? 1 : 0}>{filteredUnsel.length}</TabBadge>
            </Tab>
          </TabRow>

          {/* ── Pending changes banner ── */}
          {pendingCount > 0 && (
            <PendingBanner>
              <span>
                {[
                  newResources.length && `${newResources.length} to add`,
                  updatedResources.length && `${updatedResources.length} to update`,
                  deletedResources.length && `${deletedResources.length} to remove`,
                ].filter(Boolean).join(' · ')}
              </span>
              <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>Click "{saveLabel}" to apply</span>
            </PendingBanner>
          )}

          {/* ── ASSIGNED TAB ── */}
          {tab === 'assigned' && (
            selected.length === 0 ? (
              <EmptyMsg>
                <FaUser size={13} /> No resources assigned yet. Go to "Add Resource" to get started.
              </EmptyMsg>
            ) : (
              <>
                <SummaryStrip>
                  <span>{selected.filter((s) => !s._deleted).length} active resource{selected.filter((s) => !s._deleted).length !== 1 ? 's' : ''}</span>
                  <span>{tlCount} Team Lead · {exCount} Executive</span>
                </SummaryStrip>

                <DataTable
                  columns={["Name", "Type", "Start", "End", "Rate", "Actions"]}
                  data={selected}
                  modifiedId={true}
                  modifiedIdName="_rowKey"
                  expandedRow={editingId}
                  renderExpandedRow={(sel) => (
                    <InlineEditDrawer
                      fields={sel}
                      rowKey={sel._rowKey}
                      onChange={handleFieldChange}
                      onConfirm={handleConfirmUpdate}
                      onCancel={handleCancelEdit}
                    />
                  )}
                  renderRow={(sel) => {
                    const emp = employees.find((e) => e.emp_id === sel.emp_id)
                    const isNew = !sel.id
                    const isDeleted = sel._deleted
                    const isEditing = editingId === sel._rowKey

                    return (
                      <>
                        <Td>
                          <CellContent>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp?.name || sel.emp_id}</span>
                            {isNew && <Badge variant="warning">New</Badge>}
                            {isDeleted && <Badge variant="error">Removed</Badge>}
                          </CellContent>
                        </Td>
                        <Td>
                          <Badge variant={sel.emp_type === 'T' ? 'forward' : 'info'}>
                            {sel.emp_type === 'T' ? 'TL' : 'EX'}
                          </Badge>
                        </Td>
                        <Td>{sel.start_date ? formatDate(sel.start_date) : (sel.s_date || '—')}</Td>
                        <Td>{sel.end_date ? formatDate(sel.end_date) : (sel.e_date || '—')}</Td>
                        <Td>{sel.contract_rate ? `₹${sel.contract_rate}` : '—'}</Td>
                        <Td>
                          <RowActions onClick={(e) => e.stopPropagation()}>
                            {!isDeleted && (
                              <>
                                <Button
                                  iconOnly={true}
                                  customColor={isEditing ? "#ffb22eff" : ""}
                                  variant={isEditing ? 'successGhost' : 'primary'}
                                  title={isEditing ? 'Cancel edit' : 'Edit'}
                                  onClick={() => isEditing ? handleCancelEdit(sel._rowKey) : handleEdit(sel._rowKey)}
                                >
                                  {isEditing ? <FaTimes size={14} /> : <FaEdit size={14} />}
                                </Button>
                                <Button
                                  iconOnly={true}
                                  variant='outlines'
                                  title="Remove"
                                  onClick={() => handleMarkDelete(sel._rowKey)}
                                >
                                  <FaTrash size={14} />
                                </Button>
                              </>
                            )}
                            {isDeleted && (
                              <Button
                                iconOnly={true}
                                variant="successGhost"
                                title="Undo remove"
                                onClick={() => handleUndoDelete(sel._rowKey)}
                              >
                                <FaTimes size={14} />
                              </Button>
                            )}
                          </RowActions>
                        </Td>
                      </>
                    )
                  }}
                />
              </>
            )
          )}

          {/* ── ADD TAB ── */}
          {tab === 'add' && (
            <>
              <SearchWrap>
                <SearchIconWrap><FaSearch size={12} /></SearchIconWrap>
                <SearchInput
                  placeholder="Search by name or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchWrap>

              <SectionLabel><FaUser size={11} /> {filteredUnsel.length} available</SectionLabel>

              <PickList>
                {loading ? (
                  <EmptyMsg>Loading…</EmptyMsg>
                ) : filteredUnsel.length === 0 ? (
                  <EmptyMsg>{search ? 'No match found' : 'All employees already assigned'}</EmptyMsg>
                ) : (
                  filteredUnsel.map((emp) => (
                    <PickItem key={emp.emp_id} onClick={() => handleAdd(emp)}>
                      <PickInfo>
                        <PickName>
                          {emp.name}
                          <Badge variant={Number(emp.grade_level) > 1 ? 'forward' : 'info'}>
                            {Number(emp.grade_level) > 1 ? 'TL' : 'EX'}
                          </Badge>
                        </PickName>
                        <PickId>{emp.additional_ref_number}</PickId>
                      </PickInfo>
                      <AddBtn onClick={(e) => { e.stopPropagation(); handleAdd(emp) }}>
                        <FaPlus size={10} />
                      </AddBtn>
                    </PickItem>
                  ))
                )}
              </PickList>
            </>
          )}
        </>
      )}
      <ConfirmPopup
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
      />
    </Modal>
  )
}