import React, { useEffect, useMemo, useState } from "react";
import Layout from "../Layout";
import {
  buildOwnershipMap,
  buildPayloads,
  DateForApiFormate,
  datesBetweenComparable,
  formatDate,
  formatRetainerActivities,
  formatToApiDate,
  generateDatesBetween,
  getMonthRange,
  getRowStatus,
  groupDatesIntoRanges,
  mergeAdjacentRows,
  recomputeEmployeeRows,
  splitRangeAtDate,
  useDateWiseAssignments,
} from "../../utils/utils";
import { useLocation } from "react-router-dom";
import { getContractAllocationData, getEmpAllocationData, getemployeeLists, postActivityAllocationData, postAllocationData } from "../../services/productServices";
import { toast } from "react-toastify";
import Button from "../Button";
import Card from "../Card";
import { ResourceAvailability } from "../ScreenComponents/ResourceAvaiblityCard copy";
import CurrentAssignments from "../ScreenComponents/CurrentAssignResourceList copy";
import { FaArrowLeft, FaCalendarAlt, FaFileAlt, FaMapMarkerAlt, FaUser, FaUserTie } from "react-icons/fa";
import styled from "styled-components";
import { FaPenToSquare } from "react-icons/fa6";
import ConfirmPopup from "../ConfirmPopup";

const Tagline = styled.p`
 color: ${({ theme }) => theme.colors.textLight};
`

const ClaimsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
`;


const InfoStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
`;

const InfoPill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#f4f4f6"};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text || "#333"};

  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.textLight || "#777"};
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
`;

const DetailIconWrap = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#f1f0fe"};
  color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DetailText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const DetailLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textLight || "#999"};
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const DetailValue = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || "#333"};
`;

const ResourceAllocation = () => {
  const location = useLocation();
  const [activityData, setActivityData] = useState(location.state?.data);
  const resourcePlannedList = location.state?.resourcePlannedList;

  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const { start, end } = getMonthRange();

  const [editingId, setEditingId] = useState(null);
  const [editBackup, setEditBackup] = useState({}); // groupId -> { originalRow, segmentKeys }
  const [loading, setLoading] = useState(false);
  const [showResourceAvailability, setShowResourceAvailability] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupMode, setConfirmPopupMode] = useState("save"); // "save" | "missingDates"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingDatesForConfirm, setMissingDatesForConfirm] = useState([]);

  const [employees, setEmployees] = useState([]);

  // originalAllocations: frozen DB snapshot for THIS activity, set once per load.
  const [originalAllocations, setOriginalAllocations] = useState([]);
  // workingAllocations: the only mutable state driving both cards.
  const [workingAllocations, setWorkingAllocations] = useState([]);
  // busyAllocations: read-only reference data (other activities blocking a date).
  const [busyAllocations, setBusyAllocations] = useState([]);

  const activityStart = activityData?.original_P?.start_date || activityData?.planned_start_date || "";
  const activityEnd = activityData?.original_P?.end_date || activityData?.planned_end_date || "";

  
  const isLocked = (row) => row.is_approved || !!activityData?.allAEntries?.length;
  
  const ownershipMap = useMemo(() => buildOwnershipMap(originalAllocations), [originalAllocations]);
  
  const originalById = useMemo(() => {
    const map = {};
    originalAllocations.forEach((r) => { map[r.id] = r; });
    return map;
  }, [originalAllocations]);
  
  const { dayWindow, dateWiseAssignments} = useDateWiseAssignments({ activityStart, activityEnd, allocations: workingAllocations, originalById, getRowStatus});
  // ---- Derived data — ALL computed from workingAllocations, nothing else ----

  const employeeDateMap = useMemo(() => {
    const map = {};
    workingAllocations.forEach((row) => {
      if (!map[row.emp_id]) map[row.emp_id] = {};
      generateDatesBetween(row.start_date, row.end_date).forEach((d) => {
        map[row.emp_id][d] = {
          rowKey: row.rowKey,
          isAssigned: true,
          emp_type: row.emp_type,
        };
      });
    });
    return map;
  }, [workingAllocations]);

  const busyDateMap = useMemo(() => {
    const map = {};
    busyAllocations.forEach((row) => {
      if (!map[row.emp_id]) map[row.emp_id] = {};
      generateDatesBetween(row.start_date, row.end_date).forEach((date) => {
        if (!employeeDateMap[row.emp_id]?.[date]) {
          map[row.emp_id][date] = true;
        }
      });
    });
    return map;
  }, [busyAllocations, employeeDateMap]);

  const { addPayload, updatePayload, deletePayload, unchangedPayload } = useMemo(
    () => buildPayloads(workingAllocations, originalAllocations),
    [workingAllocations, originalAllocations]
  );

  const pendingCount = addPayload.length + updatePayload.length + deletePayload.length;
  const saveLabel =
    [
      addPayload.length && `Add ${addPayload.length}`,
      updatePayload.length && `Update ${updatePayload.length}`,
      deletePayload.length && `Remove ${deletePayload.length}`,
    ]
      .filter(Boolean)
      .join(" · ") || "Save Changes";

  // ---- Load ----

  useEffect(() => {
    fetchEmployees();
    loadAllData();
  }, []);

  const loadExisting = async (params = {}) => {
    if (!params) return [];
    try {
      const res = await getContractAllocationData(params);
      return (res?.data || []).map((item) => ({
        ...item,
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
    } catch {
      toast.error("Failed to load existing allocations");
      return [];
    }
  };

  const refreshActivityData = async () => {
    const p_id = activityData?.original_P?.id;
    if (!p_id) return;
    try {
      const payload = {
        emp_id: loggedEmpId,
        start_date: DateForApiFormate(start),
        end_date: DateForApiFormate(end),
      };
      const response = await getEmpAllocationData(payload);
      const formatted = formatRetainerActivities(response.data, resourcePlannedList);
      const fresh = formatted.find((a) => a?.original_P?.id === p_id);
      if (fresh) setActivityData(fresh);
    } catch (err) {
      console.error("Failed to refresh activity data:", err);
    }
  };

  const loadAllData = async () => {
    const { id: allocation_id } = activityData?.original_P || {};
    try {
      const [currentAllocations, busyData] = await Promise.all([
        loadExisting({ allocation_id, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
        loadExisting({ emp_id: loggedEmpId, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
      ]);

      // const normalized = currentAllocations.map((item) => ({
      //   id: item.id,
      //   emp_id: item.emp_id,
      //   employee_name: item.employee_name,
      //   emp_type: item.emp_type,
      //   remarks: item.remarks || "",
      //   contract_rate: item.contract_rate,
      //   start_date: item.start_date,
      //   end_date: item.end_date,
      //   is_approved: !!item.is_approved,
      //   is_active: !!item.is_active,
      // }));
      const normalized = currentAllocations.filter((item) => item.is_active === true);

      setOriginalAllocations(normalized);
      setWorkingAllocations(normalized.filter((data) => data.is_active).map((r) => ({ ...r, rowKey: `existing_${r.id}` })));

      setBusyAllocations(busyData.filter((x) => x.allocation_id !== activityData?.original_P?.id && x.is_active !== false));
      await refreshActivityData();
    } catch {
      toast.error("Failed to load allocation data");
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

  // ---- Mutations — every one of these only ever touches workingAllocations ----

  const getContractRateByType = (empType) => {
    if (empType === "T") {
      return tlContractRate === "" ? 0 : Number(tlContractRate);

      return plannedTLRate != null ? Number(plannedTLRate) : "";
    }

    return exContractRate === "" ? 0 : Number(exContractRate);
  };

  const handleToggleAllocation = (emp, targetDate, checked, selectedRole) => {
    const targetDateComparable = DateForApiFormate(targetDate, true);
    setWorkingAllocations((prev) => {
      const others = prev.filter((r) => r.emp_id !== emp.emp_id);
      const empRows = prev.filter((r) => r.emp_id === emp.emp_id);
      const currentDates = empRows.flatMap((r) => datesBetweenComparable(r.start_date, r.end_date));
      const nextDates = checked
        ? [...currentDates, targetDateComparable]
        : currentDates.filter((d) => d !== targetDateComparable);

      const empType = Number(emp.grade_level) > 1 ? "T" : "E";
      const dateEmpTypes = checked && selectedRole ? { [targetDateComparable]: selectedRole } : {};
      const dateEmpRates = checked && selectedRole ? { [targetDateComparable]: getContractRateByType(selectedRole) } : {};

      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates: nextDates,
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: empType,
          remarks: "",
          contract_rate: getContractRateByType(empType),
          is_approved: false,
        },
        existingRowsForEmp: empRows,
        dateEmpTypes,
        dateEmpRates,
      });

      return mergeAdjacentRows([...others, ...newRows]);
    });
  };

  // Tracks, per employee, exactly which dates the *last* Auto Assign click
  // added — so Undo can remove only those, never dates that were already
  // checked before (a different assignment / a manual check).
  const [lastAutoAssign, setLastAutoAssign] = useState({});

  const handleAutoAssign = (emp) => {
    const freeDates = dayWindow.map(formatToApiDate).filter((d) => {
      return !employeeDateMap[emp.emp_id]?.[d] && !busyDateMap[emp.emp_id]?.[d];
    });

    if (!freeDates.length) {
      toast.info("No dates available");
      return;
    }

    const freeDatesComparable = freeDates.map((d) => DateForApiFormate(d, true));

    setWorkingAllocations((prev) => {
      const others = prev.filter((r) => r.emp_id !== emp.emp_id);
      const empRows = prev.filter((r) => r.emp_id === emp.emp_id);
      const currentDates = empRows.flatMap((r) => datesBetweenComparable(r.start_date, r.end_date));
      const empType = Number(emp.grade_level) > 1 ? "T" : "E";
      const dateEmpTypes = freeDatesComparable.reduce((acc, d) => {
        acc[d] = empType;
        return acc;
      }, {});
      const dateEmpRates = freeDatesComparable.reduce((acc, d) => {
        acc[d] = getContractRateByType(empType);
        return acc;
      }, {});
      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates: [...currentDates, ...freeDatesComparable],
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: empType,
          remarks: "",
          contract_rate: getContractRateByType(empType),
          is_approved: false,
        },
        existingRowsForEmp: empRows,
        dateEmpTypes,
        dateEmpRates,
      });
      return mergeAdjacentRows([...others, ...newRows]);
    });

    setLastAutoAssign((prev) => ({ ...prev, [emp.emp_id]: freeDatesComparable }));

    // toast.success(`Assigned ${freeDates.length} date(s) to ${emp.name}`);
    toast.success(`${freeDates.length} date(s) selected for ${emp.name}`);
  };

  // Undo the *last* Auto Assign for this employee only. Removes exactly the
  // dates that click added; dates checked before that (manual picks, or an
  // earlier auto-assign) are untouched because they were never added to
  // lastAutoAssign[emp.emp_id].
  const handleUndoAutoAssign = (emp) => {
    const datesToRemove = lastAutoAssign[emp.emp_id];

    if (!datesToRemove || !datesToRemove.length) {
      toast.info("Nothing to undo for this resource");
      return;
    }

    const removeSet = new Set(datesToRemove);

    setWorkingAllocations((prev) => {
      const others = prev.filter((r) => r.emp_id !== emp.emp_id);
      const empRows = prev.filter((r) => r.emp_id === emp.emp_id);

      const remainingDates = empRows
        .flatMap((r) => datesBetweenComparable(r.start_date, r.end_date))
        .filter((d) => !removeSet.has(d));

      const empType = Number(emp.grade_level) > 1 ? "T" : "E";
      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates: remainingDates,
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: empType,
          remarks: "",
          contract_rate: getContractRateByType(empType),
          is_approved: false,
        },
        existingRowsForEmp: empRows,
      });

      return mergeAdjacentRows([...others, ...newRows]);
    });

    setLastAutoAssign((prev) => {
      const next = { ...prev };
      delete next[emp.emp_id];
      return next;
    });

    toast.success(`Undo auto-assign for ${emp.name}`);
  };

  const handleEditDate = (row, targetDate) => {
    if (isLocked(row)) {
      toast.info("Cannot edit approved/actual started allocation");
      return;
    }
    const targetDateComparable = DateForApiFormate(targetDate, true);
    const segments = splitRangeAtDate(row, targetDateComparable, "EDIT");
    const editTarget = segments.find((s) => s.__isEditTarget);
    const groupId = crypto.randomUUID();

    setWorkingAllocations((prev) => [
      ...prev.filter((r) => r.rowKey !== row.rowKey),
      ...segments,
    ]);

    setEditBackup((prev) => ({
      ...prev,
      [groupId]: { originalRow: row, segmentKeys: segments.map((s) => s.rowKey) },
    }));
    setEditingId(editTarget ? { rowKey: editTarget.rowKey, groupId } : null);
  };

  // const handleFieldChange = (rowKey, field, value) => {
  //   setWorkingAllocations((prev) =>
  //     prev.map((row) => (row.rowKey === rowKey ? { ...row, [field]: value } : row))
  //   );
  // };

  const handleFieldChange = (rowKey, field, value) => {
  setWorkingAllocations((prev) =>
    prev.map((row) => {
      if (row.rowKey !== rowKey) return row;

      if (field === "emp_type") {
        return {
          ...row,
          emp_type: value,
          contract_rate: getContractRateByType(value),
        };
      }

      return {
        ...row,
        [field]: value,
      };
    })
  );
};

const handleRoleChange = (emp, dStr, nextRole) => {
    const dStrComparable = DateForApiFormate(dStr, true);

    setWorkingAllocations((prev) => {
      const others = prev.filter((r) => r.emp_id !== emp.emp_id);
      const empRows = prev.filter((r) => r.emp_id === emp.emp_id);

      const activeDates = empRows.flatMap((r) =>
        datesBetweenComparable(r.start_date, r.end_date)
      );

      if (!activeDates.includes(dStrComparable)) return prev;

      // ADDED — preserve each date's CURRENT type/rate before overriding the one target date
      const dateEmpTypes = {};
      const dateEmpRates = {};
      activeDates.forEach((d) => {
        const ownerRow = empRows.find(
          (r) => r.start_date <= d && r.end_date >= d
        );
        dateEmpTypes[d] = ownerRow?.emp_type || emp_type_default(emp);
        dateEmpRates[d] = ownerRow?.contract_rate ?? getContractRateByType(dateEmpTypes[d]);
      });
      dateEmpTypes[dStrComparable] = nextRole;
      dateEmpRates[dStrComparable] = getContractRateByType(nextRole);

      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates,
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: nextRole,
          remarks: "",
          contract_rate: getContractRateByType(nextRole),
          is_approved: false,
        },
        existingRowsForEmp: empRows,
        dateEmpTypes,   // CHANGED — now covers all dates, not just the target
        dateEmpRates,   // CHANGED
      });

      return mergeAdjacentRows([...others, ...newRows]);
    });
  };

  const handleConfirmUpdate = (rowKey) => {
    const row = workingAllocations.find((r) => r.rowKey === rowKey);
    if (!row) {
      setEditingId(null);
      return;
    }

    if (row.start_date > row.end_date) {
      toast.error("Start date cannot be after end date");
      return;
    }

    const startBound = DateForApiFormate(activityStart, true);
    const endBound = DateForApiFormate(activityEnd, true);
    if ((startBound && row.start_date < startBound) || (endBound && row.end_date > endBound)) {
      toast.error("Dates must fall within the activity's start and end dates");
      return;
    }

    const overlaps = workingAllocations.some(
      (r) =>
        r.rowKey !== rowKey &&
        r.emp_id === row.emp_id &&
        row.start_date <= r.end_date &&
        row.end_date >= r.start_date
    );
    if (overlaps) {
      toast.error("This resource already has an allocation overlapping these dates");
      return;
    }

    setWorkingAllocations((prev) => mergeAdjacentRows(prev));
    setEditBackup((prev) => {
      const groupEntry = Object.entries(prev).find(([, v]) => v.segmentKeys.includes(rowKey));
      if (!groupEntry) return prev;
      const next = { ...prev };
      delete next[groupEntry[0]];
      return next;
    });
    setEditingId(null);
  };

  const handleCancelEdit = (rowKey) => {
    const entry = Object.entries(editBackup).find(
      ([, v]) => v.segmentKeys.includes(rowKey)
    );
    if (!entry) {
      setEditingId(null);
      return;
    }
    const [groupId, { originalRow, segmentKeys }] = entry;

    setWorkingAllocations((prev) => [
      ...prev.filter((r) => !segmentKeys.includes(r.rowKey)),
      originalRow,
    ]);
    setEditBackup((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
    setEditingId(null);
  };

  const handleDeleteDate = (row, targetDate) => {
    if (isLocked(row)) {
      toast.info("Cannot delete");
      return;
    }
    setWorkingAllocations((prev) => {
      const targetDateComparable = DateForApiFormate(targetDate, true);
      const segments = splitRangeAtDate(row, targetDateComparable, "DELETE");
      return mergeAdjacentRows([...prev.filter((r) => r.rowKey !== row.rowKey), ...segments]);
    });
  };

  // ---- Save ----

  const handleSaveClick = () => {
     const hasTLResource = workingAllocations.some(
    (row) => row.emp_type === "T" && row.is_active !== false
  );

  const hasEXResource = workingAllocations.some(
    (row) => row.emp_type === "E" && row.is_active !== false
  );

  // Validate TL Contract Rate
  if (
    hasTLResource && plannedTL !== 0 &&
    (!tlContractRate || Number(tlContractRate) <= 0)
  ) {
    toast.error("Please enter TL Contract Rate");
    return;
  }

  // Validate EX Contract Rate
  if (
    hasEXResource && plannedEX !== 0 &&
    (!exContractRate || Number(exContractRate) <= 0)
  ) {
    toast.error("Please enter EX Contract Rate");
    return;
  }

    const plannedDateSet = new Set(
      workingAllocations.flatMap((r) => datesBetweenComparable(r.start_date, r.end_date))
    );

    const mismatchedDates = [...plannedDateSet].filter((dComparable) => {
      const dayAssignments = workingAllocations.filter((r) =>
        datesBetweenComparable(r.start_date, r.end_date).includes(dComparable)
      );
      const tlCount = dayAssignments.filter((a) => a.emp_type === "T").length;
      const exCount = dayAssignments.filter((a) => a.emp_type === "E").length;
      return tlCount < plannedTL || exCount < plannedEX;
    });

    // if (mismatchedDates.length > 0) {
    //   toast.error(`Required TL/EX not met for: ${mismatchedDates.sort().join(", ")}`);
    //   return;
    // }

    const missedDates = dayWindow
      .map((d) => formatToApiDate(d))
      .filter((dStr) => !plannedDateSet.has(DateForApiFormate(dStr, true)));

    if (missedDates.length > 0) {
      setMissingDatesForConfirm(missedDates);
      setConfirmPopupMode("missingDates");
      setShowConfirmPopup(true);
      return;
    }

    setConfirmPopupMode("save");
    setShowConfirmPopup(true);
  };

  const handleConfirmSubmit = async () => {
    setIsWaringSubmitting(true);
    await handleSubmit();
    setIsSubmitting(false);
    setShowConfirmPopup(false);
  };

  const handleSubmit = async () => {
    const hasTLResource = workingAllocations.some(
    (row) => row.emp_type === "T" && row.is_active !== false
  );

  const hasEXResource = workingAllocations.some(
    (row) => row.emp_type === "E" && row.is_active !== false
  );

  if (
    hasTLResource && plannedTL !== 0 &&
    (!tlContractRate || Number(tlContractRate) <= 0)
  ) {
    toast.error("Please enter TL Contract Rate");
    return;
  }

  if (
    hasEXResource && plannedEX !== 0 &&
    (!exContractRate || Number(exContractRate) <= 0)
  ) {
    toast.error("Please enter EX Contract Rate");
    return;
  }
    try {
      setIsSubmitting(true);
      const p_id = activityData?.original_P?.id;
      if (!p_id) return;

          // NEW — every date in the plan must meet required TL/EX before saving
      // const missingDates = dayWindow.filter((d) => {
      //   const dStr = formatToApiDate(d);
      //   const dayAssignments = dateWiseAssignments[dStr] || [];
      //   const tlCount = dayAssignments.filter((a) => a.emp_type === "T").length;
      //   const exCount = dayAssignments.filter((a) => a.emp_type === "E").length;
      //   return tlCount < plannedTL || exCount < plannedEX;
      // });

      // if (missingDates.length > 0) {
      //   const dateList = missingDates.map((d) => formatToApiDate(d)).join(", ");
      //   toast.error(`Required TL/EX not met for: ${dateList}`);
      //   return;
      // }

const getStaffingIssues = (date, workingAllocations, plannedTL, plannedEX) => {
  const dayAssignments = workingAllocations.filter((r) =>
    datesBetweenComparable(r.start_date, r.end_date).includes(date)
  );
  const tlCount = dayAssignments.filter((a) => a.emp_type === "T").length;
  const exCount = dayAssignments.filter((a) => a.emp_type === "E").length;
  
  const issues = [];
  if (tlCount !== plannedTL) {
    const diff = tlCount - plannedTL;
    if (diff > 0) {
      issues.push(`Remove ${diff} Team Lead${diff > 1 ? 's' : ''}`);
    } else {
      issues.push(`Add ${Math.abs(diff)} Team Lead${Math.abs(diff) > 1 ? 's' : ''}`);
    }
  }
  if (exCount !== plannedEX) {
    const diff = exCount - plannedEX;
    if (diff > 0) {
      issues.push(`Remove ${diff} Executive${diff > 1 ? 's' : ''}`);
    } else {
      issues.push(`Add ${Math.abs(diff)} Executive${Math.abs(diff) > 1 ? 's' : ''}`);
    }
  }
  return issues;
};

      const plannedDateSet = new Set(
        workingAllocations.flatMap((r) => datesBetweenComparable(r.start_date, r.end_date))
      );

      const missingDates = [...plannedDateSet].filter((dComparable) => {
        const dayAssignments = workingAllocations.filter((r) =>
          datesBetweenComparable(r.start_date, r.end_date).includes(dComparable)
        );
        const tlCount = dayAssignments.filter((a) => a.emp_type === "T").length;
        const exCount = dayAssignments.filter((a) => a.emp_type === "E").length;
        return tlCount !== plannedTL || exCount !== plannedEX;
      });

      if (missingDates.length > 0) {
          let errorMessage = '';
          if (missingDates.length === 1) {
            // Single date format
            const date = missingDates[0];
            const issues = getStaffingIssues(date, workingAllocations, plannedTL, plannedEX);
            const formattedDate = formatDate(date, true);
            
            errorMessage = `Resource requirement not met for ${formattedDate}\n`;
            errorMessage += issues.join('\n');
          }  else {
            // Multiple dates format
            errorMessage = 'Resource requirements not met\n';
            const details = missingDates.sort().map(date => {
              const issues = getStaffingIssues(date, workingAllocations, plannedTL, plannedEX);
              const formattedDate = formatDate(date, true);
              return `${formattedDate}: ${issues.join(', ')}`;
            });
            // errorMessage += details.join('\n');
            errorMessage += details.join('; ');
          }
      
          toast.warning(errorMessage);
          return;

        // const dateList = missingDates.sort().join(", ");
        // toast.error(`Required TL/EX not met for: ${DateForApiFormate(dateList)}`);
        // return;
      }

      const activeResources = workingAllocations;

      // if (deletePayload.length) {
      //   const fd = new FormData();
      //   fd.append("emp_id", loggedEmpId);
      //   fd.append("call_mode", "DELETE");
      //   fd.append("p_id", p_id);
      //   fd.append("c_emp_list", JSON.stringify(deletePayload));
      //   await postAllocationData(fd);

      //      for (let [key, value] of fd.entries()) {
      //     console.log(key, value);
      //   }
      // }

       const combined = [...addPayload, ...updatePayload, ...deletePayload, ...unchangedPayload];
      
      // if (addPayload.length || updatePayload.length) {
      if (combined.length) {
        const fd = new FormData();
        fd.append("emp_id", loggedEmpId);
        fd.append("p_id", p_id);
        
        const hasExistingActive = workingAllocations.some((r) => r.id != null);
        const callMode = addPayload.length && !updatePayload.length && !deletePayload.length && !hasExistingActive ? "ADD" : "UPDATE";
        fd.append("call_mode", callMode);
        // fd.append("c_emp_list", JSON.stringify([...addPayload, ...updatePayload]));
        fd.append("c_emp_list", JSON.stringify(combined));
        await postAllocationData(fd);
        
        
      for (let [key, value] of fd.entries()) {
       console.log(key, value);
      }
      }

      if (activeResources.length > 0) {
        const resourceListStr = activeResources
          .map((r) => `${r.emp_id}^${r.employee_name || ""}^${r.emp_type}`)
          .join("|");

        const activityFd = new FormData();
        activityFd.append("emp_id", loggedEmpId);
        activityFd.append("call_mode", "RESOURCE_ADD");
        activityFd.append("a_id", p_id);
        activityFd.append("geo_type", "O");
        activityFd.append("resource_list", resourceListStr);
        await postActivityAllocationData(activityFd);

        for (let [key, value] of activityFd.entries()) {
          console.log(key, value);
        }
      }

      toast.success("Saved successfully");
      setShowConfirmPopup(false);
      loadAllData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }finally{
      setIsSubmitting(false);
    }
  };

  const matchingRetainer = (activityData?.original_P?.retainer_list || []).find((r) => r.a_type === "P" && r.start_date === activityData?.original_P?.start_date && r.end_date === activityData?.original_P?.end_date,);

  const plannedTL = matchingRetainer?.tl_count || 0;
  const plannedEX = matchingRetainer?.ex_count || 0;
  const plannedTLRate = matchingRetainer?.tl_rate ;
  const plannedEXRate = matchingRetainer?.ex_rate ;

  useEffect(() => {
  if (workingAllocations.length !== 0) return;

  setTlContractRate(plannedTLRate ?? 0);
  setExContractRate(plannedEXRate ?? 0);
}, [workingAllocations.length, plannedTLRate, plannedEXRate]);

  const [tlContractRate, setTlContractRate] = useState(plannedTLRate ?? "");
  const [exContractRate, setExContractRate] = useState(plannedEXRate ?? "");

    useEffect(() => {
    setWorkingAllocations((prev) =>
      prev.map((row) => {
        if (row.is_approved) return row; // never touch locked/approved rows
        const rate = row.emp_type === "T" ? tlContractRate : exContractRate;
        if (rate === "" || rate == null) return row;
        return { ...row, contract_rate: Number(rate) };
      })
    );
  }, [tlContractRate, exContractRate]);

  // console.log(activityData)

  return (
    <Layout title="Allocation Plan Overview">
      <ClaimsHeader>
        <Tagline>Track and manage your assigned audit tasks</Tagline>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: "flex-end" }}>
          <Button size="md" onClick={() => window.history.back()}>
            <FaArrowLeft />Back
          </Button>
        </div>
      </ClaimsHeader>

     <Card title="Activity Details" hoverable={false}>
      <DetailsGrid>
        <DetailItem>
          <DetailIconWrap><FaCalendarAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Duration</DetailLabel>
            <DetailValue>{formatDate(activityData.planned_start_date)} – {formatDate(activityData.planned_end_date)}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaFileAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Customer</DetailLabel>
            <DetailValue>{activityData.customer_name}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaFileAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Order Item</DetailLabel>
            <DetailValue>{activityData.order_item_key}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaUserTie size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Required TL</DetailLabel>
            <DetailValue>{plannedTL ?? '—'}</DetailValue>
            {plannedTLRate && <DetailValue>{plannedTLRate ?? '—'}/per day</DetailValue>}
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaUser size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Required EX</DetailLabel>
            <DetailValue>{plannedEX?? '—'}</DetailValue>
           {plannedEXRate && <DetailValue>{plannedEXRate?? '—'}/per day</DetailValue>}
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaMapMarkerAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Location</DetailLabel>
            <DetailValue>{activityData.store_name  || '—'}</DetailValue>
          </DetailText>
        </DetailItem>
      </DetailsGrid>
       {activityData.store_remarks && <DetailItem style={{marginTop: "1rem"}}>
          <DetailIconWrap><FaPenToSquare size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Remark</DetailLabel>
            <DetailValue>{activityData.store_remarks  || '—'}</DetailValue>
          </DetailText>
        </DetailItem>}
    </Card>

      {/* <Card hoverable={false} style={{ marginTop: "1rem" }}> */}
        <CurrentAssignments
          dateWiseAssignments={dateWiseAssignments}
          dayWindow={dayWindow}
          editingId={editingId?.rowKey}
          handleEditDate={handleEditDate}
          handleDeleteDate={handleDeleteDate}
          handleFieldChange={handleFieldChange}
          handleConfirmUpdate={handleConfirmUpdate}
          handleCancelEdit={handleCancelEdit}
          activityStart={activityStart}
          activityEnd={activityEnd}
          activityData={activityData}
          isActual={false}
          employees={employees}
          loadAllData={loadAllData}
          plannedTL={plannedTL}
          plannedEX={plannedEX}
          plannedTLRate={plannedTLRate}
          plannedEXRate={plannedEXRate}
          tlContractRate={tlContractRate}
          setTlContractRate={setTlContractRate}
          exContractRate={exContractRate}
          setExContractRate={setExContractRate}
          getContractRateByType={getContractRateByType}
          busyDateMap={busyDateMap}
       />

        {pendingCount > 0 && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button onClick={handleSaveClick} color="primary" style={{ marginLeft: "auto" }}>{saveLabel} Resources in plan </Button>
          </div>
        )}

        {!["AA", "AS", "C", "PA"].includes(activityData.activityStatus) && !activityData.a_id  &&
          <div style={{display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "1rem"}}>

            <Button onClick={() => setShowResourceAvailability(true)}>Add Resources</Button>
            {showResourceAvailability &&
              <Button variant="outline" onClick={() => setShowResourceAvailability(false)}>Close</Button>}
          </div>
        }
        



        {showResourceAvailability && <ResourceAvailability
          employees={employees}
          dayWindow={dayWindow}
          activityData={activityData}
          activityDates={dayWindow}
          activityStart={activityStart}
          activityEnd={activityEnd}
          busyDateMap={busyDateMap}
          employeeDateMap={employeeDateMap}
          handleToggleAllocation={handleToggleAllocation}
          handleRoleChange={handleRoleChange}
          workingAllocations={workingAllocations}
          handleAutoAssign={handleAutoAssign}
          handleUndoAutoAssign={handleUndoAutoAssign}
          lastAutoAssign={lastAutoAssign}
        />}


      {/* </Card> */}

    <ConfirmPopup
      isOpen={showConfirmPopup}
      isLoading={isSubmitting}
      onConfirm={handleSubmit}
      onClose={() => setShowConfirmPopup(false)}
      title="Confirm Resource Plan"
      message={
        confirmPopupMode === "missingDates"
          ? `No resources are planned for: ${missingDatesForConfirm.join(", ")}. Are you sure you want to save anyway?`
          : "Are you sure you want to save these resources in the plan?"
      }
      confirmLabel="Yes, Save"
   />
    </Layout>
  );
};

export default ResourceAllocation;