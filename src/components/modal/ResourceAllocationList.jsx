import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import DataTable, { Td } from "../DataTable";
import {
  getContractAllocationData,
  getemployeeLists,
  postActivityAllocationData,
  postAllocationData,
} from "../../services/productServices";
import {
  buildDayWindow,
  DateForApiFormate,
  formatDate,
  formatToApiDate,
  generateDatesBetween,
  getMonthRange,
  MONTH_SHORT_NAMES,
} from "../../utils/utils";
import { toast } from "react-toastify";
import Layout from "../Layout";
import { useLocation } from "react-router-dom";
import Card from "../Card";
import styled from "styled-components";
import { useFilter } from "../../hooks/useFilter";
import { usePagination } from "../../hooks/usePagination";
import { FaCalendarAlt, FaCheck, FaEdit, FaSearch, FaTimes, FaTrash, FaUndo, FaUser, FaUserPlus, FaUsers } from "react-icons/fa";
import PaginationComponent from "../Pagination";
import Badge from "../Badge";
import Button from "../Button";

const InfoStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const InfoPill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 99px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#f4f5f7"};
  border: 1px solid ${({ theme }) => theme.colors?.border || "#e5e7eb"};
  font-size: ${({ theme }) => theme.fontSizes?.sm || "0.5rem"};
  color: ${({ theme }) => theme.colors?.text || "#333"};

  svg {
    color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
  }

  span {
    color: ${({ theme }) => theme.colors?.textLight || "#888"};
    margin-right: 0.15rem;
  }
`;

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

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.5rem'};
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

const SearchWrap = styled.div`
  position: relative;
  display: inline-block;
  flex: 1;
`

const SearchInput = styled.input`
  padding: ${({ theme }) => `${theme?.spacing?.sm || '0.35rem'} ${theme?.spacing?.lg || '1.2rem'}`};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 0.375rem;
  font-size: 0.72rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  width: 100%;
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
  padding: ${({ theme }) => `${theme?.spacing?.sm || '0.35rem'} ${theme?.spacing?.md || '0.8rem'}`};
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
const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-left: ${({ theme }) => theme.spacing?.md || '1rem'};
`
const ShortPill = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: #ef4444;
  margin-left: 0.25rem;
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
const EmpName = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`
const NameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`
const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`

const shortDay = (date) => ({
  num: String(date.getDate()).padStart(2, '0'),
  dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
})

const AVATAR_COLORS = ['#6C5CE7', '#0984e3', '#00b894', '#e17055', '#fd79a8', '#74b9ff', '#55efc4']
const avatarColor = (str) => AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length]
const initials = (name) => (name || '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const InlineEditForm = ({ row, onChange, onConfirm, onCancel }) => {
  return (
    <EditRowContainer>
      <FormField>
        <FormLabel>Start Date</FormLabel>
        <FormInput
          type="date"
          value={row.start_date || ""}
          onChange={(e) => onChange(row._rowKey, "start_date", e.target.value)}
        />
      </FormField>
      <FormField>
        <FormLabel>End Date</FormLabel>
        <FormInput
          type="date"
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

const ResourceAllocationList = () => {
  const location = useLocation();
  const activityData = location.state?.data;
  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const { start, end } = getMonthRange();

  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [availSearch, setAvailSearch] = useState('');
  const [editingId, setEditingId] = useState(null)

  const [employees, setEmployees] = useState([]);
  const [allResourceAllocationList, setAllResourceAllocationList] = useState([]);
  const [activityAllocationList, setActivityAllocationList] = useState([]);

  const [originalEditRows, setOriginalEditRows] = useState({});
  const [selectedDates, setSelectedDates] = useState({});

  const activityStart = activityData?.original_P?.start_date || activityData?.planned_start_date || "";
  const activityEnd =activityData?.original_P?.end_date || activityData?.planned_end_date || "";

  const dayWindow = useMemo(() => buildDayWindow(activityStart, 6), [activityStart],);

  const activityDates = useMemo(() => {
    const dates = [];
    const startComparable = DateForApiFormate(activityStart, true);
    const endComparable = DateForApiFormate(activityEnd, true);
    if (!startComparable || !endComparable) return dates;
    const [sY, sM, sD] = startComparable.split("-").map(Number);
    const [eY, eM, eD] = endComparable.split("-").map(Number);
    const cur = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);
    let limit = 0;
    while (cur <= end && limit < 366) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
      limit++;
    }
    return dates;
  }, [activityStart, activityEnd]);

  useEffect(() => {
    fetchEmployees();
    loadAllData();
  }, []);

  const loadExisting = async (params = {}) => {
    if (!params) return;

    try {
      const res = await getContractAllocationData(params);
      return (res?.data || []).map((item) => ({
        ...item,
        _rowKey: item.id || `existing_${item.emp_id}_${item.start_date || item.s_date}`,
        start_date: item.start_date
          ? DateForApiFormate(item.start_date, true)
          : item.s_date
            ? DateForApiFormate(item.s_date, true)
            : "",
        end_date: item.end_date
          ? DateForApiFormate(item.end_date, true)
          : item.e_date
            ? DateForApiFormate(item.e_date, true)
            : "",
      }));
    } catch (error) {
      toast.error("Failed to load existing allocations");
    }
  };

  const loadAllData = async () => {
    const { id: allocation_id } = activityData.original_P;
    try {
      const [allResourceAllocation, activityAllocation] = await Promise.all([
        loadExisting({ allocation_id, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end), }),
        loadExisting({ emp_id: loggedEmpId, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end), }),
      ]);

      const mappedAll = (allResourceAllocation || [])
        .filter((item) => item.is_active === true)
        .map((item) => ({
          ...item,
          _rowKey: String(item.id || `new_${item.emp_id}_${Date.now()}`),
          start_date: item.s_date || item.start_date || "",
          end_date: item.e_date || item.end_date || "",
        }));

      setAllResourceAllocationList(mappedAll);

      const mappedAvail = (activityAllocation || [])
        .filter((data) => data.is_active === true)
        .map((item) => ({
          ...item,
          _rowKey: String(item.id || `avail_${item.emp_id}_${Date.now()}`),
          start_date: item.s_date || item.start_date || "",
          end_date: item.e_date || item.end_date || "",
        }));

      setActivityAllocationList(mappedAvail);
    } catch (error) {
      toast.error("Failed to load some data");
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await getemployeeLists({ rm_emp_id: loggedEmpId });
      setEmployees(res?.data?.filter((e) => e.is_verified) || []);
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const getBusyDates = useCallback((emp_id) => {
    const busy = new Set()
    activityAllocationList.forEach((s) => {
      if (s.emp_id !== emp_id || s._deleted || !s.is_active) return
      const fromStr = DateForApiFormate(s.start_date, true)
      const toStr = DateForApiFormate(s.end_date, true)
      if (!fromStr || !toStr) return
      const [fY, fM, fD] = fromStr.split("-").map(Number)
      const [tY, tM, tD] = toStr.split("-").map(Number)
      const cur = new Date(fY, fM - 1, fD)
      const end = new Date(tY, tM - 1, tD)
      while (cur <= end) {
        busy.add(formatToApiDate(cur))
        cur.setDate(cur.getDate() + 1)
      }
    })
    return busy
  }, [activityAllocationList])

  const computeFreeDates = useCallback((emp_id) => {
    if (!activityDates.length) return { start_date: '', end_date: '', freeDates: [] }
    const busy = getBusyDates(emp_id)
    const freeDates = []

    // Check if employee is completely free for entire activity period
    const completelyFree = activityDates.every(d => !busy.has(formatToApiDate(d)))
    
    if (completelyFree) {
      // Return entire activity period if completely free
      return {
        start_date: formatToApiDate(activityDates[0]),
        end_date: formatToApiDate(activityDates[activityDates.length - 1]),
        freeDates: activityDates.map(d => formatToApiDate(d))
      }
    }

    // Get contiguous block of free dates from start
    let firstFree = null
    for (const d of activityDates) {
      if (!busy.has(formatToApiDate(d))) { firstFree = d; break }
    }
    if (!firstFree) return { start_date: '', end_date: '', freeDates: [] }

    let lastFree = firstFree
    for (const d of activityDates) {
      if (d <= firstFree) continue
      if (!busy.has(formatToApiDate(d))) {
        lastFree = d
        freeDates.push(formatToApiDate(d))
      } else break
    }
    freeDates.unshift(formatToApiDate(firstFree))
    
    const actEndStr = DateForApiFormate(activityEnd, true)
    if (actEndStr) {
      const [aeY, aeM, aeD] = actEndStr.split("-").map(Number)
      const actEnd = new Date(aeY, aeM - 1, aeD)
      if (!isNaN(actEnd) && lastFree > actEnd) lastFree = actEnd
    }

    return { start_date: formatToApiDate(firstFree), end_date: formatToApiDate(lastFree), freeDates }
  }, [activityDates, getBusyDates, activityEnd])

  const handleDateSelect = useCallback((empId, dateStr, checked) => {
    setSelectedDates(prev => {
      const current = prev[empId] || [];
      if (checked) {
        return { ...prev, [empId]: [...new Set([...current, dateStr])] };
      } else {
        return { ...prev, [empId]: current.filter(d => d !== dateStr) };
      }
    });
  }, []);

const handleAdd = useCallback((emp) => {
    const free = computeFreeDates(emp.emp_id);
    
    if (!free.start_date || !free.end_date) {
      toast.info("No free dates available for this employee in the activity period.");
      return;
    }

    const datesToAssign = free.freeDates || generateDatesBetween(free.start_date, free.end_date);

    if (datesToAssign.length === 0) {
      toast.info("No free dates available for this employee in the activity period.");
      return;
    }

    const sortedDates = [...datesToAssign].sort();
    const start_date = sortedDates[0];
    const end_date = sortedDates[sortedDates.length - 1];

    const tempKey = `new_${emp.emp_id}_${Date.now()}`;
    const newAlloc = {
      _rowKey: tempKey,
      emp_id: emp.emp_id,
      employee_name: emp.name,
      emp_type: Number(emp.grade_level) <= 1 ? "E" : "T",
      start_date: DateForApiFormate(start_date, true),
      end_date: DateForApiFormate(end_date, true),
      remarks: "",
      is_active: true
    };

    setAllResourceAllocationList((prev) => [...prev, newAlloc]);
    // Clear selection after assign
    setSelectedDates(prev => {
      const next = { ...prev };
      delete next[emp.emp_id];
      return next;
    });
  }, [computeFreeDates]);

  const handleStartEdit = useCallback((row) => {
    setOriginalEditRows((prev) => {
      if (prev[row._rowKey]) return prev;
      return { ...prev, [row._rowKey]: { ...row } };
    });
    setEditingId(row._rowKey);
  }, []);

  const handleFieldChange = useCallback((rowKey, field, value) => {
    setAllResourceAllocationList((prev) =>
      prev.map((e) => e._rowKey === rowKey ? { ...e, [field]: value, ...(e.id ? { _updated: true } : {}) } : e)
    )
  }, []);

  const handleCancelEdit = useCallback((rowKey) => {
    if (editingId === rowKey) {
      const original = originalEditRows[rowKey];
      if (original) {
        setAllResourceAllocationList((prev) =>
          prev.map((e) => e._rowKey === rowKey ? original : e)
        );
      }
      setEditingId(null);
      setOriginalEditRows((prev) => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
    }
  }, [editingId, originalEditRows]);

  const handleMarkDelete = useCallback((rowKey) => {
    const sel = allResourceAllocationList.find((s) => s._rowKey === rowKey);
    if (!sel) return;
    if (!sel.id) {
      setAllResourceAllocationList((p) => p.filter((e) => e._rowKey !== rowKey));
      if (editingId === rowKey) {
        setEditingId(null);
        setOriginalEditRows((prev) => {
          const next = { ...prev };
          delete next[rowKey];
          return next;
        });
      }
      return;
    }
    setAllResourceAllocationList((p) => p.map((e) => e._rowKey === rowKey ? { ...e, _deleted: true } : e));
    if (editingId === rowKey) {
      setEditingId(null);
      setOriginalEditRows((prev) => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
    }
  }, [allResourceAllocationList, editingId]);

  const handleUndoDelete = useCallback((rowKey) => {
    setAllResourceAllocationList((p) => p.map((e) => e._rowKey === rowKey ? { ...e, _deleted: false } : e));
  }, []);

  const handleConfirmUpdate = useCallback((rowKey) => {
    setEditingId(null);
    setOriginalEditRows((prev) => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
  }, []);

  const getDateCounts = useMemo(() => {
    const counts = {};
    dayWindow.forEach(d => {
      const dStr = formatToApiDate(d);
      counts[dStr] = { TL: 0, EX: 0 };
    });

    allResourceAllocationList.forEach(row => {
      if (row._deleted || !row.is_active || !row.start_date || !row.end_date) return;
      const datesInRange = generateDatesBetween(row.start_date, row.end_date);
      datesInRange.forEach(dStr => {
        if (counts[dStr]) {
          if (row.emp_type === 'T') counts[dStr].TL++;
          else counts[dStr].EX++;
        }
      });
    });
    return counts;
  }, [allResourceAllocationList, dayWindow]);

  const getDateWiseAssignments = useMemo(() => {
    const map = {};
    dayWindow.forEach(d => {
      const dStr = formatToApiDate(d);
      map[dStr] = [];
    });

    allResourceAllocationList.forEach(row => {
      if (row._deleted || !row.is_active || !row.start_date || !row.end_date) return;
      const dates = generateDatesBetween(row.start_date, row.end_date);
      dates.forEach(dStr => {
        if (map[dStr]) {
          map[dStr].push({
            emp_id: row.emp_id,
            name: row.employee_name || row.emp_id,
            type: row.emp_type,
            _rowKey: row._rowKey
          });
        }
      });
    });
    return map;
  }, [allResourceAllocationList, dayWindow])

  const handleSubmit = async () => {
      try {
        const p_id = activityData?.original_P?.id;
        if (!p_id) {
          toast.error("Activity ID is missing");
          return;
        }

        const activeResources = allResourceAllocationList.filter((s) => !s._deleted);
        const newRows = activeResources.filter((s) => !s.id);
        const updatedRows = activeResources.filter((s) => s.id && s._updated);
        const deletedRows = allResourceAllocationList.filter((s) => s.id && s._deleted);

        if (deletedRows.length) {
          const fd = new FormData();
          fd.append('emp_id', loggedEmpId);
          fd.append('call_mode', 'DELETE');
          fd.append('p_id', p_id);
          const deletePayloadList = allResourceAllocationList.map((s) => ({
            id: s.id,
            ...(s._deleted ? { is_deleted: true } : {
              emp_id: s.emp_id,
              emp_type: s.emp_type,
              start_date: DateForApiFormate(s.start_date),
              end_date: DateForApiFormate(s.end_date),
              remarks: s.remarks || '',
              contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
            })
          }));
          fd.append('c_emp_list', JSON.stringify(deletePayloadList));
          await postAllocationData(fd);
        }

        if (newRows.length || updatedRows.length) {
          const fd = new FormData();
          fd.append('emp_id', loggedEmpId);
          fd.append('p_id', p_id);
          fd.append('call_mode', newRows.length && !updatedRows.length && !allResourceAllocationList.some(s => s.id && !s._deleted) ? 'ADD' : 'UPDATE');

          const payloadList = activeResources.map((s) => {
            const item = {
              emp_id: s.emp_id,
              emp_type: s.emp_type,
              start_date: DateForApiFormate(s.start_date),
              end_date: DateForApiFormate(s.end_date),
              remarks: s.remarks || '',
              contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
            };
            if (s.id) item.id = s.id;
            if (s._updated) item.is_updated = true;
            return item;
          });
          fd.append('c_emp_list', JSON.stringify(payloadList));
          await postAllocationData(fd);
        }

        // RESOURCE_ADD
        if (activeResources.length > 0) {
          const resourceListStr = activeResources
            .map((r) => `${r.emp_id}^${r.employee_name || ''}^${r.emp_type}`)
            .join('|');

          const activityFd = new FormData();
          activityFd.append('emp_id', loggedEmpId);
          activityFd.append('call_mode', 'RESOURCE_ADD');
          activityFd.append('a_id', p_id);
          activityFd.append('geo_type', 'O');
          activityFd.append('resource_list', resourceListStr);
          await postActivityAllocationData(activityFd);
        }

        toast.success('All changes saved');
        await loadAllData();
        setSelectedDates({});
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save changes';
        toast.error(errorMessage);
      }
    };

  const newRows = allResourceAllocationList.filter((s) => !s.id && !s._deleted);
  const updatedRows = allResourceAllocationList.filter((s) => s.id && s._updated && !s._deleted,);
  const deletedRows = allResourceAllocationList.filter((s) => s.id && s._deleted);
  const pendingCount = newRows.length + updatedRows.length + deletedRows.length;

  const saveLabel = (() => {
    const parts = [];
    if (newRows.length) parts.push(`Add ${newRows.length}`);
    if (updatedRows.length) parts.push(`Update ${updatedRows.length}`);
    if (deletedRows.length) parts.push(`Remove ${deletedRows.length}`);
    return parts.length ? parts.join(" · ") : "Save Changes";
  })();

  const assignedIds = useMemo(() => new Set(allResourceAllocationList.filter((s) => !s._deleted).map((s) => s.emp_id)), [allResourceAllocationList]);

  // Check if employee is assigned for a specific date
  const isEmployeeAssignedOnDate = useCallback((emp_id, dateStr) => {
    return allResourceAllocationList.some(alloc => {
      if (alloc.emp_id !== emp_id || alloc._deleted || !alloc.is_active) return false;
      const allocStart = DateForApiFormate(alloc.start_date, true);
      const allocEnd = DateForApiFormate(alloc.end_date, true);
      return dateStr >= allocStart && dateStr <= allocEnd;
    });
  }, [allResourceAllocationList]);

  const mappedEmployees = useMemo(() => employees.map((emp) => ({
    ...emp,
    role: Number(emp.grade_level) > 1 ? "TL" : "EX",
  })), [employees]);

  const filteredEmployees = useFilter({
    data: mappedEmployees,
    fields: ["name", "emp_id"],
    search: availSearch,
    extraFilters: roleFilter === "ALL" ? {} : { role: roleFilter },
  });

  const { paginatedData: paginatedEmployees, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(filteredEmployees, 25);

  const matchingRetainer = (activityData?.original_P?.retainer_list || []).find(
    (r) => r.a_type === "P" && r.start_date === activityData?.original_P?.start_date && r.end_date === activityData?.original_P?.end_date
  );

  const plannedTL = matchingRetainer?.tl_count || 0;
  const plannedEX = matchingRetainer?.ex_count || 0;
  const activeTL = allResourceAllocationList.filter((s) => s.emp_type === "T" && !s._deleted).length;
  const activeEX = allResourceAllocationList.filter((s) => s.emp_type === "E" && !s._deleted).length;

  const columns = useMemo(() => {
    const cols = ['Resource'];

    dayWindow.forEach((d) => {
      const { num, dow } = shortDay(d);
      cols.push(`${num} ${dow}`);
    });

    cols.push('Action');

    return cols;
  }, [dayWindow]);

  return (
    <Layout>
      <div>
        <Card
          title={
            dayWindow.length > 0
              ? `Resource Availability (${shortDay(dayWindow[0]).num} ${MONTH_SHORT_NAMES[dayWindow[0].getMonth()]} – ${shortDay(dayWindow[dayWindow.length - 1]).num} ${MONTH_SHORT_NAMES[dayWindow[dayWindow.length - 1].getMonth()]})`
              : "Resource Availability (—)"
          }
          headerAction={
            <Legend>
              {/* <LegendItem><LegendDot color="#10b981" /> Available</LegendItem>
              <LegendItem><LegendDot color="#ef4444" /> Busy</LegendItem> */}
              <LegendItem>✅ Available</LegendItem>
              <LegendItem>❌ Busy</LegendItem>
            </Legend>
          }
        >
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
              {activeTL < plannedTL && (
                <ShortPill>Short {plannedTL - activeTL} TL</ShortPill>
              )}
            </InfoPill>
            <InfoPill>
              <FaUser size={10} />
              <span>EX:</span>
              {activeEX} / {plannedEX}
              {activeEX < plannedEX && (
                <ShortPill>Short {plannedEX - activeEX} EX</ShortPill>
              )}
            </InfoPill>
          </InfoStrip>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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

          <DataTable
            columns={columns}
            data={paginatedEmployees}
            emptyMessage="No matching employees found"
            renderRow={(emp) => {
              const assigned = assignedIds.has(emp.emp_id)
              const busy = getBusyDates(emp.emp_id)
              const allBusy = activityDates.length > 0 && activityDates.every((d) => busy.has(formatToApiDate(d)))

              return (
                <>
                  <Td>
                    <ResourceCell>
                      <Avatar color={avatarColor(emp.name)} style={{ width: 24, height: 24, fontSize: '0.55rem' }}>
                        {initials(emp.name)}
                      </Avatar>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <ResourceName>{emp.name}</ResourceName>
                        <span style={{ fontSize: '0.62rem', color: '#999' }}>{emp.emp_id} • <Badge variant={emp.role === 'TL' ? 'forward' : 'info'}>
                          {emp.role}
                        </Badge></span>
                      </div>
                    </ResourceCell>
                  </Td>
                  {dayWindow.map((d) => {
                    const dStr = formatToApiDate(d)
                    const isBusy = busy.has(dStr)
                    const isAlreadyAssigned = isEmployeeAssignedOnDate(emp.emp_id, dStr)
                    const isDisabled = isBusy || isAlreadyAssigned
                    return (
                      <Td key={dStr} style={{ textAlign: "left" }}>
                        {/* <Dot color={isBusy ? '#ef4444' : '#10b981'} /> */}
                       {/* {isBusy ? '❌' : '✅' } */}
                       <input
                          type="checkbox"
                          checked={selectedDates[emp.emp_id]?.includes(dStr) || isAlreadyAssigned || false}
                          // checked={true}
                          disabled={isDisabled}
                          onChange={(e) => !isDisabled && handleDateSelect(emp.emp_id, dStr, e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#6C5CE7', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          title={isAlreadyAssigned ? 'Already assigned on this date' : (isBusy ? 'Not available on this date' : 'Click to select')}
                        />
                      </Td>
                    );
                  })}
                  <Td>
                    <div style={{ marginLeft: '0.5rem' }}>
                      {assigned ? (
                        <Button variant="outline" iconOnly={true} disabled={assigned} title="Already assigned for this activity">
                          <FaCheck size={11} />
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          iconOnly={true}
                          disabled={allBusy}
                          onClick={() => handleAdd(emp)}
                          title={allBusy ? 'No free days in activity range' : 'Click to auto-assign available dates'}
                        >
                          <FaUserPlus size={12} />
                        </Button>
                      )}
                    </div>
                  </Td>
                </>
              )
            }}
          />

          {filteredEmployees.length > 0 && (
            <PaginationComponent
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </Card>
      </div>

      <Card title={`Current Assignments`} headerAction={<><span style={{ fontSize: '0.8rem', color: '#888' }}>Total: {activeTL} TL · {activeEX} EX </span></>}>
      {/* Date-wise Summary */}
{dayWindow.length > 0 && (
    <div style={{ marginBottom: '2rem' }}>
      {dayWindow.map((d, index) => {
        const dStr = formatToApiDate(d);
        const assignments = getDateWiseAssignments[dStr] || [];
        const tlCount = assignments.filter(a => a.type === 'T').length;
        const exCount = assignments.filter(a => a.type === 'E').length;

        return (
          <div key={dStr} style={{ marginBottom: index < dayWindow.length - 1 ? '2rem' : '0' }}>
            {/* Date Header */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '12px 16px', 
              borderRadius: '8px 8px 0 0', 
              border: '1px solid #e0e0e0',
              marginBottom: '-1px'
            }}>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                {d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }).toUpperCase()}
              </div>
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
                emptyMessage="No assignments"
                renderRow={(row) => {
                  const isEditing = editingId === row._rowKey;
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
                                <Button iconOnly variant="primary" title="Edit" onClick={() => handleStartEdit(row)}>
                                  <FaEdit size={12} />
                                </Button>
                              )}
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
          </div>
        );
      })}
    </div>
  )}
        {pendingCount > 0 && (
          <PendingBanner>
            <span>
              {[
                newRows.length && `${newRows.length} to add`,
                updatedRows.length && `${updatedRows.length} to update`,
                deletedRows.length && `${deletedRows.length} to remove`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ opacity: 0.6, fontWeight: 500, fontSize: "0.67rem" }}>
                Click save to apply
              </span>
              <Button size="small" onClick={handleSubmit}>
                {saveLabel}
              </Button>
            </div>
          </PendingBanner>
        )}
      </Card>
    </Layout>
  );
};

export default ResourceAllocationList;
