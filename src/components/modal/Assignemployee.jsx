import React, { useEffect, useState, useCallback, useMemo } from 'react'
import styled, { keyframes, css } from 'styled-components'
import Modal from '../Modal'
import { toast } from 'react-toastify'
import {
  FaUser, FaUsers, FaEdit, FaTrash, FaCheck, FaTimes,
  FaCalendarAlt, FaSearch, FaUndo, FaUserPlus,
} from 'react-icons/fa'
import Badge from '../Badge'
import Button from '../Button'
import ConfirmPopup from '../ConfirmPopup'
import {
  getContractAllocationData,
  getemployeeLists,
  postAllocationData,
} from '../../services/productServices'
import { DateForApiFormate, formatDate, getMonthRange } from '../../utils/utils'
import { useFilter } from '../../hooks/useFilter'
import { usePagination } from '../../hooks/usePagination'
import PaginationComponent from '../Pagination'

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Root layout ─────────────────────────────────────────────

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  width: 100%;
`

// ─── Shared Styled Components ──────────────────────────────────────────────────

const SearchWrap = styled.div`
  position: relative;
  display: inline-block;
`

const SearchInput = styled.input`
  padding: 0.35rem 0.6rem 0.35rem 1.6rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 0.375rem;
  font-size: 0.72rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  width: 160px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  pointer-events: none;
  display: flex;
  align-items: center;
`

const FilterSelect = styled.select`
  padding: 0.35rem 1.5rem 0.35rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 0.375rem;
  font-size: 0.72rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ color }) => color || '#e5e7eb'};
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
`

const AssignButton = styled.button`
  background: none;
  border: none;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  color: ${({ assigned, theme }) => assigned ? '#10b981' : theme.colors?.primary || '#6C5CE7'};
  opacity: ${({ disabled }) => disabled ? 0.35 : 1};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: ${({ disabled }) => disabled ? 'transparent' : 'rgba(0, 0, 0, 0.05)'};
  }
`

const AssignTableWrap = styled.div`
  max-height: 260px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || '#ddd'};
    border-radius: 4px;
  }
`

// ─── Right main area ──────────────────────────────────────────────────────────

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
`

// ─── Info strip ───────────────────────────────────────────────────────────────

const InfoStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`

const InfoPill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 99px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f4f5f7'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};

  svg { color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'}; }

  span {
    color: ${({ theme }) => theme.colors?.textLight || '#888'};
    margin-right: 0.15rem;
  }
`

const ShortPill = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: #ef4444;
  margin-left: 0.25rem;
`

// ─── Pending banner ───────────────────────────────────────────────────────────

const PendingBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.38rem 0.75rem;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}10` : '#f0eeff'};
  border: 1px solid ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}28` : '#c4b5fd'};
  border-radius: 0.5rem;
  font-size: 0.71rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
`

// ─── Section card ─────────────────────────────────────────────────────────────

const SectionCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 0.75rem;
  overflow: hidden;
`

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`

const SectionTitle = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors?.textLight || '#888'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`

// ─── Availability grid ────────────────────────────────────────────────────────

const GridWrap = styled.div`
  overflow-x: auto;
`

const Grid = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.74rem;
`

const GridTh = styled.th`
  padding: 0.5rem 0.6rem;
  text-align: ${({ center }) => center ? 'center' : 'left'};
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
  white-space: nowrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
`

const GridTr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#f0f0f0'};
  background: ${({ theme }) => theme.colors?.card || '#fff'};

  &:last-child { border-bottom: none; }
`

const GridTd = styled.td`
  padding: 0.48rem 0.6rem;
  text-align: ${({ center }) => center ? 'center' : 'left'};
  vertical-align: middle;
`

const ResourceCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ResourceName = styled.span`
  font-size: 0.76rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin: auto;
`

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.64rem;
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`

const EmptyGrid = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  font-size: 0.75rem;
`

// ─── Assignments table ────────────────────────────────────────────────────────

const AssignTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.74rem;
`

const ATh = styled.th`
  padding: 0.5rem 0.85rem;
  text-align: left;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
`

const ATr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#f0f0f0'};
  background: ${({ deleted, theme }) =>
    deleted ? '#fef2f210' : (theme.colors?.card || '#fff')};
  opacity: ${({ deleted }) => deleted ? 0.65 : 1};
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
`

const ATd = styled.td`
  padding: 0.6rem 0.85rem;
  vertical-align: middle;
`

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

const DateCell = styled.div`
  font-size: 0.73rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  line-height: 1.55;
`

const DateSub = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
  display: block;
`

const RateCell = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`

const EmptyAssign = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;

  svg { opacity: 0.3; }
`

// ─── Inline edit form ─────────────────────────────────────────────────────────

const EditRow = styled.tr`
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}05` : '#faf9ff'};
`

const EditCell = styled.td`
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`

const EditGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
`

const FieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  ${({ full }) => full && 'grid-column: 1 / -1;'}
`

const FieldLabel = styled.label`
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors?.textLight || '#aaa'};
`

const fieldBase = css`
  padding: 0.33rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: 0.4rem;
  font-size: 0.74rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  width: 100%;
  box-sizing: border-box;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'}; }
`

const FieldInput = styled.input`${fieldBase}`
const FieldSelect = styled.select`${fieldBase}`

const EditBtns = styled.div`
  display: flex;
  gap: 0.3rem;
  padding-bottom: 1px;
`

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
const MON_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parseDMY = (str) => {
  if (!str) return null
  if (str.includes('-') && str.length === 10 && str[4] === '-') {
    // YYYY-MM-DD
    const [y, m, d] = str.split('-')
    return new Date(Number(y), Number(m) - 1, Number(d))
  }
  // DD-Mon-YYYY
  const [d, m, y] = str.split('-')
  if (!MONTHS.hasOwnProperty(m)) return null
  return new Date(Number(y), MONTHS[m], Number(d))
}

const toDMY = (date) => {
  if (!date || isNaN(date)) return ''
  return `${String(date.getDate()).padStart(2, '0')}-${MON_NAMES[date.getMonth()]}-${date.getFullYear()}`
}

const dmyToApi = (str) => {
  const d = parseDMY(str)
  if (!d || isNaN(d)) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const apiToDmy = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}-${MON_NAMES[Number(m) - 1]}-${y}`
}

const buildDayWindow = (startStr, count = 5) => {
  const base = parseDMY(startStr)
  if (!base || isNaN(base)) return []
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    return d
  })
}

const shortDay = (date) => ({
  num: String(date.getDate()).padStart(2, '0'),
  dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
})

const getEmpType = (emp) => (Number(emp?.grade_level) <= 1 ? 'E' : 'T')

// Avatar color palette
const AVATAR_COLORS = ['#6C5CE7', '#0984e3', '#00b894', '#e17055', '#fd79a8', '#74b9ff', '#55efc4']
const avatarColor = (str) => AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length]
const initials = (name) => (name || '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

// ─── Inline edit form component ───────────────────────────────────────────────

const EDIT_FIELDS = [
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'end_date', label: 'End Date', type: 'date' },
  {
    key: 'emp_type', label: 'Type', type: 'select',
    options: [{ value: 'E', label: 'Executive' }, { value: 'T', label: 'Team Lead' }],
  },
  { key: 'remarks', label: 'Remarks', type: 'text' },
]

const InlineEditForm = ({ row, colSpan, onChange, onConfirm, onCancel }) => (
  <EditRow>
    <EditCell colSpan={colSpan}>
      <EditGrid>
        {EDIT_FIELDS.map(({ key, label, type, options }) => (
          <FieldWrap key={key}>
            <FieldLabel>{label}</FieldLabel>
            {type === 'select' ? (
              <FieldSelect value={row[key] || ''} onChange={(e) => onChange(row._rowKey, key, e.target.value)}>
                <option value="">Select</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FieldSelect>
            ) : (
              <FieldInput
                type={type}
                value={type === 'date' ? (dmyToApi(row[key]) || '') : (row[key] || '')}
                placeholder={type === 'text' ? 'Optional' : undefined}
                onChange={(e) => {
                  const val = type === 'date' ? apiToDmy(e.target.value) : e.target.value
                  onChange(row._rowKey, key, val)
                }}
              />
            )}
          </FieldWrap>
        ))}
        <EditBtns>
          <Button iconOnly variant="outlines" title="Cancel" onClick={() => onCancel(row._rowKey)}><FaTimes size={12} /></Button>
          <Button iconOnly variant="successGhost" title="Confirm" onClick={() => onConfirm(row._rowKey)}><FaCheck size={12} /></Button>
        </EditBtns>
      </EditGrid>
    </EditCell>
  </EditRow>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const AssignEmployee = ({ isOpen, onClose, activityData, refreshData }) => {
  const loggedEmpId = localStorage.getItem('cust_emp_id')

  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [availSearch, setAvailSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')   // 'ALL' | 'TL' | 'EX'
  const [loading, setLoading] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false, title: '', message: '', confirmLabel: '', onConfirm: () => { },
  })

  const { start, end } = getMonthRange();

  // ── Dates ──────────────────────────────────────────────────────────────────

  const activityStart = activityData?.original_P?.start_date || activityData?.planned_start_date || ''
  const activityEnd = activityData?.original_P?.end_date || activityData?.planned_end_date || ''

  const dayWindow = useMemo(() => buildDayWindow(activityStart, 10), [activityStart])

  console.log("dayWindow", dayWindow)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) { setEditingId(null); return }
    fetchEmployees()
    loadExisting()
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
        emp_id: loggedEmpId,
        start_date: DateForApiFormate(start),
        end_date: DateForApiFormate(end),
      })
      const mapped = (res?.data || []).filter((data) => data.is_active === true).map((item) => ({
        ...item,
        _rowKey: String(item.id || `new_${item.emp_id}_${Date.now()}`),
        start_date: item.s_date || item.start_date || '',
        end_date: item.e_date || item.end_date || '',
      }))
      setSelected(mapped)
    } catch { toast.error('Failed to load existing allocations') }
  }

  // ── Availability ───────────────────────────────────────────────────────────

  const getBusyDates = useCallback((emp_id) => {
    const busy = new Set()
    selected.forEach((s) => {
      if (s.emp_id !== emp_id || s._deleted || !s.is_active) return
      const from = parseDMY(s.start_date)
      const to = parseDMY(s.end_date)
      if (!from || !to) return
      const cur = new Date(from)
      while (cur <= to) { busy.add(toDMY(cur)); cur.setDate(cur.getDate() + 1) }
    })
    return busy
  }, [selected])

  const computeFreeDates = useCallback((emp_id) => {
    if (!dayWindow.length) return { start_date: '', end_date: '' }
    const busy = getBusyDates(emp_id)

    let firstFree = null
    for (const d of dayWindow) {
      if (!busy.has(toDMY(d))) { firstFree = d; break }
    }
    if (!firstFree) return { start_date: '', end_date: '' }

    let lastFree = firstFree
    for (const d of dayWindow) {
      if (d <= firstFree) continue
      if (!busy.has(toDMY(d))) lastFree = d
      else break
    }
    const actEnd = parseDMY(activityEnd)
    if (actEnd && !isNaN(actEnd) && lastFree > actEnd) lastFree = actEnd

    return { start_date: toDMY(firstFree), end_date: toDMY(lastFree) }
  }, [dayWindow, getBusyDates, activityEnd])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = useCallback((emp) => {
    if (selected.some((s) => s.emp_id === emp.emp_id && !s._deleted)) return
    const { start_date, end_date } = computeFreeDates(emp.emp_id)
    const tempKey = `new_${Date.now()}_${Math.random()}`
    setSelected((prev) => [
      ...prev,
      {
        _rowKey: tempKey,
        emp_id: emp.emp_id,
        employee_name: emp.name,
        emp_type: getEmpType(emp),
        start_date,
        end_date,
        contract_rate: '',
        remarks: '',
        is_active: true,
      },
    ])
    setEditingId(tempKey)
  }, [selected, computeFreeDates])

  const handleFieldChange = useCallback((rowKey, field, value) => {
    setSelected((prev) =>
      prev.map((e) =>
        e._rowKey === rowKey
          ? { ...e, [field]: value, ...(e.id ? { _updated: true } : {}) }
          : e
      )
    )
  }, [])

  const handleCancelEdit = (rowKey) => { if (editingId === rowKey) setEditingId(null) }

  const handleConfirmUpdate = useCallback((rowKey) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Update Resource',
      message: 'Confirm updating this resource\'s allocation details?',
      confirmLabel: 'Update',
      onConfirm: () => {
        setEditingId(null)
        setConfirmConfig((p) => ({ ...p, isOpen: false }))
      },
    })
  }, [])

  const handleMarkDelete = (rowKey) => {
    const sel = selected.find((s) => s._rowKey === rowKey)
    if (!sel?.id) {
      setSelected((p) => p.filter((e) => e._rowKey !== rowKey))
      if (editingId === rowKey) setEditingId(null)
      return
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Resource',
      message: `Remove ${sel.employee_name || sel.emp_id} from this activity?`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setSelected((p) => p.map((e) => e._rowKey === rowKey ? { ...e, _deleted: true } : e))
        if (editingId === rowKey) setEditingId(null)
        setConfirmConfig((p) => ({ ...p, isOpen: false }))
      },
    })
  }

  const handleUndoDelete = (rowKey) =>
    setSelected((p) => p.map((e) => e._rowKey === rowKey ? { ...e, _deleted: false } : e))

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const p_id = activityData?.original_P?.id
      const deletedRows = selected.filter((s) => s.id && s._deleted)
      const newRows = selected.filter((s) => !s.id && !s._deleted)
      const updatedRows = selected.filter((s) => s.id && s._updated && !s._deleted)

      const toPayload = (s) => ({
        emp_id: s.emp_id,
        emp_type: s.emp_type,
        start_date: dmyToApi(s.start_date),
        end_date: dmyToApi(s.end_date),
        remarks: s.remarks || '',
        contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0,
      })

      if (deletedRows.length) {
        const fd = new FormData()
        fd.append('emp_id', loggedEmpId)
        fd.append('call_mode', 'DELETE')
        fd.append('p_id', p_id)
        fd.append('c_emp_list', JSON.stringify(
          selected.map((s) => s._deleted ? { id: s.id, is_deleted: true } : { id: s.id, ...toPayload(s) })
        ))
        await postAllocationData(fd)
      }

      if (newRows.length || updatedRows.length) {
        const fd = new FormData()
        const hasExist = selected.some((s) => s.id && !s._deleted)
        const isAddMode = !hasExist && newRows.length && !updatedRows.length
        fd.append('emp_id', loggedEmpId)
        fd.append('p_id', p_id)
        fd.append('call_mode', isAddMode ? 'ADD' : 'UPDATE')
        fd.append('c_emp_list', JSON.stringify(
          isAddMode
            ? newRows.map(toPayload)
            : selected.filter((s) => !s._deleted).map((s) => {
              const item = toPayload(s)
              if (s.id) { item.id = s.id; if (s._updated) item.is_updated = true }
              return item
            })
        ))
        await postAllocationData(fd)
      }

      toast.success('Changes saved successfully')
      refreshData()
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save changes')
    }
  }

  const handleConfirmSubmit = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Save Changes',
      message: 'Apply all pending resource changes?',
      confirmLabel: 'Save',
      onConfirm: async () => {
        setConfirmConfig((p) => ({ ...p, isOpen: false }))
        await handleSubmit()
      },
    })
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const newRows = selected.filter((s) => !s.id && !s._deleted)
  const updatedRows = selected.filter((s) => s.id && s._updated && !s._deleted)
  const deletedRows = selected.filter((s) => s.id && s._deleted)
  const pendingCount = newRows.length + updatedRows.length + deletedRows.length

  const saveLabel = (() => {
    const parts = []
    if (newRows.length) parts.push(`Add ${newRows.length}`)
    if (updatedRows.length) parts.push(`Update ${updatedRows.length}`)
    if (deletedRows.length) parts.push(`Remove ${deletedRows.length}`)
    return parts.length ? parts.join(' · ') : 'Save Changes'
  })()

  const assignedIds = useMemo(
    () => new Set(selected.filter((s) => !s._deleted).map((s) => s.emp_id)),
    [selected]
  )

  // Map employees to derive their role for filtering
  const mappedEmployees = useMemo(() => {
    return employees.map((emp) => ({
      ...emp,
      role: Number(emp.grade_level) > 1 ? 'TL' : 'EX'
    }))
  }, [employees])

  // Filter using the useFilter hook
  const filteredEmployees = useFilter({
    data: mappedEmployees,
    fields: ['name', 'emp_id'],
    search: availSearch,
    extraFilters: roleFilter === 'ALL' ? {} : { role: roleFilter }
  })

  // Paginate filtered employees
  const {
    paginatedData: paginatedEmployees,
    currentPage,
    itemsPerPage,
    totalItems,
    handlePageChange,
  } = usePagination(filteredEmployees, 5)

  // Retainer planned counts
  const matchingRetainer = (activityData?.original_P?.retainer_list || []).find(
    (r) => r.a_type === 'P' &&
      r.start_date === activityData?.original_P?.start_date &&
      r.end_date === activityData?.original_P?.end_date
  )
  const plannedTL = matchingRetainer?.tl_count || 0
  const plannedEX = matchingRetainer?.ex_count || 0
  const activeTL = selected.filter((s) => s.emp_type === 'T' && !s._deleted).length
  const activeEX = selected.filter((s) => s.emp_type === 'E' && !s._deleted).length

  const TABLE_COLS = 5  // Name/Type | Dates | Remark | Rate | Actions

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleConfirmSubmit}
      title={`Resources — ${activityData?.order_item_key || ''}`}
      saveButtonText={saveLabel}
      showSaveButton={pendingCount > 0}
      width="76rem"
      maxHeight="88vh"
    >
      {/* ── Info strip ── */}
      <InfoStrip>
        <InfoPill>
          <FaCalendarAlt size={10} />
          <span>Activity:</span>
          {formatDate(activityStart)} – {formatDate(activityEnd)}
        </InfoPill>
        <InfoPill>
          <FaUsers size={10} />
          <span>TL:</span>
          {activeTL} / {plannedTL}
          {activeTL < plannedTL && <ShortPill>Short {plannedTL - activeTL} TL</ShortPill>}
        </InfoPill>
        <InfoPill>
          <FaUser size={10} />
          <span>EX:</span>
          {activeEX} / {plannedEX}
          {activeEX < plannedEX && <ShortPill>Short {plannedEX - activeEX} EX</ShortPill>}
        </InfoPill>
      </InfoStrip>

      {pendingCount > 0 && (
        <PendingBanner>
          <span>
            {[
              newRows.length && `${newRows.length} to add`,
              updatedRows.length && `${updatedRows.length} to update`,
              deletedRows.length && `${deletedRows.length} to remove`,
            ].filter(Boolean).join(' · ')}
          </span>
          <span style={{ opacity: 0.6, fontWeight: 500, fontSize: '0.67rem' }}>
            Click "{saveLabel}" to apply
          </span>
        </PendingBanner>
      )}

      {/* ── Root layout ── */}
      <Root>

        {/* ── Main Area: Availability grid + Assignments ── */}
        <MainArea>

          {/* Availability card */}
          <SectionCard>
            <SectionHead>
              <SectionTitle>
                <FaCalendarAlt size={10} />
                Resource Availability ({dayWindow.length > 0
                  ? `${shortDay(dayWindow[0]).num} ${MON_NAMES[dayWindow[0].getMonth()]} – ${shortDay(dayWindow[dayWindow.length - 1]).num} ${MON_NAMES[dayWindow[dayWindow.length - 1].getMonth()]}`
                  : '—'})
              </SectionTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Legend>
                  <LegendItem><LegendDot color="#10b981" /> Available</LegendItem>
                  <LegendItem><LegendDot color="#ef4444" /> Busy</LegendItem>
                </Legend>
                <SearchWrap>
                  <SearchIcon><FaSearch size={11} /></SearchIcon>
                  <SearchInput
                    placeholder="Search resources..."
                    value={availSearch}
                    onChange={(e) => setAvailSearch(e.target.value)}
                  />
                </SearchWrap>
                <FilterSelect
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="TL">Team Leads (TL)</option>
                  <option value="EX">Executives (EX)</option>
                </FilterSelect>
              </div>
            </SectionHead>

            <GridWrap>
              <Grid>
                <thead>
                  <tr>
                    <GridTh style={{ minWidth: 180 }}>Resource</GridTh>
                    {dayWindow.map((d) => {
                      const { num, dow } = shortDay(d)
                      return (
                        <GridTh key={num} center style={{ minWidth: 60 }}>
                          <div>{num}</div>
                          <div style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{dow}</div>
                        </GridTh>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={dayWindow.length + 1}>
                        <EmptyGrid>No matching employees found</EmptyGrid>
                      </td>
                    </tr>
                  ) : paginatedEmployees.map((emp) => {
                    const assigned = assignedIds.has(emp.emp_id)
                    const busy = getBusyDates(emp.emp_id)
                    const allBusy = dayWindow.length > 0 && dayWindow.every((d) => busy.has(toDMY(d)))
                    return (
                      <GridTr key={emp.emp_id}>
                        <GridTd>
                          <ResourceCell>
                            <Avatar color={avatarColor(emp.name)} style={{ width: 24, height: 24, fontSize: '0.55rem' }}>
                              {initials(emp.name)}
                            </Avatar>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                              <ResourceName>{emp.name}</ResourceName>
                              <span style={{ fontSize: '0.62rem', color: '#999' }}>{emp.emp_id} • {emp.role}</span>
                            </div>
                            <div style={{ marginLeft: '0.5rem' }}>
                              {assigned ? (
                                <AssignButton assigned={1} disabled title="Assigned">
                                  <FaCheck size={11} />
                                </AssignButton>
                              ) : (
                                <AssignButton
                                  disabled={allBusy}
                                  onClick={() => handleAdd(emp)}
                                  title={allBusy ? 'No free days in window' : 'Click to assign'}
                                >
                                  <FaUserPlus size={12} />
                                </AssignButton>
                              )}
                            </div>
                          </ResourceCell>
                        </GridTd>
                        {dayWindow.map((d) => {
                          const dStr = toDMY(d)
                          const isBusy = busy.has(dStr)
                          return (
                            <GridTd key={dStr} center>
                              <Dot color={isBusy ? '#ef4444' : '#10b981'} />
                            </GridTd>
                          )
                        })}
                      </GridTr>
                    )
                  })}
                </tbody>
              </Grid>
            </GridWrap>

            {filteredEmployees.length > 0 && (
              <PaginationComponent
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </SectionCard>

          {/* Current Assignments card */}
          <SectionCard>
            <SectionHead>
              <SectionTitle>
                <FaUsers size={10} />
                Current Assignments
              </SectionTitle>
              <span style={{ fontSize: '0.68rem', color: '#888' }}>
                Total: {activeTL} TL · {activeEX} EX
              </span>
            </SectionHead>

            {selected.length === 0 ? (
              <EmptyAssign>
                <FaUser size={22} />
                <span>No resources assigned yet.</span>
                <span style={{ fontSize: '0.68rem' }}>Click the assign icon in the Resource Availability list above.</span>
              </EmptyAssign>
            ) : (
              <AssignTableWrap>
                <AssignTable>
                  <thead>
                    <tr>
                      <ATh>Resource</ATh>
                      <ATh>Dates</ATh>
                      <ATh>Type</ATh>
                      <ATh>Remark</ATh>
                      <ATh>Actions</ATh>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.map((row) => {
                      const isEditing = editingId === row._rowKey
                      return (
                        <React.Fragment key={row._rowKey}>
                          <ATr deleted={row._deleted ? 1 : 0}>
                            {/* Resource */}
                            <ATd>
                              <NameCell>
                                <EmpName>
                                  {row.employee_name || row.emp_id}
                                  {!row.id && <Badge variant="warning" style={{ fontSize: '0.58rem' }}>New</Badge>}
                                  {row._deleted && <Badge variant="error" style={{ fontSize: '0.58rem' }}>Removed</Badge>}
                                  {row._updated && !row._deleted && <Badge variant="info" style={{ fontSize: '0.58rem' }}>Edited</Badge>}
                                </EmpName>
                              </NameCell>
                            </ATd>

                            {/* Dates */}
                            <ATd>
                              <DateCell>
                                {row.start_date || '—'}
                                <DateSub>to {row.end_date || '—'}</DateSub>
                              </DateCell>
                            </ATd>

                            {/* Type */}
                            <ATd>
                              <Badge variant={row.emp_type === 'T' ? 'forward' : 'info'} style={{ fontSize: '0.65rem' }}>
                                {row.emp_type === 'T' ? 'TL' : 'EX'}
                              </Badge>
                            </ATd>

                            {/* Remark */}
                            <ATd>
                              <span style={{ fontSize: '0.72rem', color: '#888' }}>
                                {row.remarks || '—'}
                              </span>
                            </ATd>

                            {/* Actions */}
                            <ATd>
                              <RowActions onClick={(e) => e.stopPropagation()}>
                                {!row._deleted ? (
                                  <>
                                    <Button
                                      iconOnly
                                      variant={isEditing ? 'successGhost' : 'primary'}
                                      title={isEditing ? 'Cancel edit' : 'Edit'}
                                      onClick={() => isEditing ? handleCancelEdit(row._rowKey) : setEditingId(row._rowKey)}
                                    >
                                      {isEditing ? <FaTimes size={12} /> : <FaEdit size={12} />}
                                    </Button>
                                    <Button iconOnly variant="outlines" title="Remove" onClick={() => handleMarkDelete(row._rowKey)}>
                                      <FaTrash size={12} />
                                    </Button>
                                  </>
                                ) : (
                                  <Button iconOnly variant="successGhost" title="Undo remove" onClick={() => handleUndoDelete(row._rowKey)}>
                                    <FaUndo size={12} />
                                  </Button>
                                )}
                              </RowActions>
                            </ATd>
                          </ATr>

                          {/* Inline edit row */}
                          {isEditing && (
                            <InlineEditForm
                              row={row}
                              colSpan={TABLE_COLS}
                              onChange={handleFieldChange}
                              onConfirm={handleConfirmUpdate}
                              onCancel={handleCancelEdit}
                            />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </AssignTable>
              </AssignTableWrap>
            )}
          </SectionCard>

        </MainArea>
      </Root>

      <ConfirmPopup
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
      />
    </Modal>
  )
}