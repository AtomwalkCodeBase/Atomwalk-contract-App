import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Layout from '../Layout';
import styled from 'styled-components';
import Button from '../Button';
import { buildOwnershipMap, buildPayloads, DateForApiFormate, datesBetweenComparable, formatDate, formatToApiDate, generateDatesBetween, getMonthRange, mergeAdjacentRows, recomputeEmployeeRows, splitRangeAtDate, useDateWiseAssignments } from '../../utils/utils';
import { FaArrowLeft, FaCalendarAlt, FaFileAlt, FaMapMarkerAlt, FaUser, FaUserTie } from 'react-icons/fa';
import Card from '../Card';
import ResourceAvailabilityCard from './ResourceAvailabilityCard';
import { useActivity } from '../../context/ActivityClaimContext';
import { toast } from 'react-toastify';
import { FaPenToSquare } from 'react-icons/fa6';
import ConfirmPopup from '../ConfirmPopup';
import ResourceOverviewCard from './ResourceOverviewCard';

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


const AllocationPlanScreen = () => {
  const location = useLocation();
  const ActivityDetails = location.state?.data;
  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const { start, end } = getMonthRange();

  const [showResourceAvailability, setShowResourceAvailability] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalAllocations, setOriginalAllocations] = useState([]);
  const [workingAllocations, setWorkingAllocations] = useState([]);
  const [busyAllocations, setBusyAllocations] = useState([]);
  const [lastAutoAssign, setLastAutoAssign] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editBackup, setEditBackup] = useState({});

  const { activityState, resourceAllocationState, employeeState, fetchEmpActivityAllocations, fetchContractAllocations, fetchEmployees, } = useActivity();
  const { data: assignedActivity, loading, error } = activityState;
  const { data: resourceAllocationData, loading: resourceAllocationLoading, error: resourceAllocationError } = resourceAllocationState;

  const activityStart = ActivityDetails?.original_P?.start_date || ActivityDetails?.planned_start_date || "";
  const activityEnd = ActivityDetails?.original_P?.end_date || ActivityDetails?.planned_end_date || "";
  const matchingRetainer = (ActivityDetails?.original_P?.retainer_list || []).find((r) => r.a_type === "P" && r.start_date === ActivityDetails?.original_P?.start_date && r.end_date === ActivityDetails?.original_P?.end_date,);

  const plannedTL = matchingRetainer?.tl_count || 0;
  const plannedEX = matchingRetainer?.ex_count || 0;

  const loadAllData = async () => {
    const { id: allocation_id } = ActivityDetails?.original_P || {};
    try {
      const [currentAllocations, busyData] = await Promise.all([
        fetchContractAllocations({ allocation_id, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
        fetchContractAllocations({ emp_id: loggedEmpId, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
      ]);

      const normalized = currentAllocations.map((item) => ({
        id: item.id,
        emp_id: item.emp_id,
        employee_name: item.employee_name,
        emp_type: item.emp_type,
        remarks: item.remarks || "",
        contract_rate: item.contract_rate,
        start_date: item.start_date,
        end_date: item.end_date,
        is_approved: !!item.is_approved,
      }));

      setOriginalAllocations(normalized);
      setWorkingAllocations(normalized.map((r) => ({ ...r, rowKey: `existing_${r.id}` })));

      setBusyAllocations(busyData.filter((x) => x.allocation_id !== ActivityDetails?.original_P?.id));
      const payload = {
        emp_id: loggedEmpId,
        start_date: DateForApiFormate(start),
        end_date: DateForApiFormate(end),
      };
      await fetchEmpActivityAllocations(payload);
    } catch {
      toast.error("Failed to load allocation data");
    }
  };

  useEffect(() => {
    fetchEmployees({ rm_emp_id: loggedEmpId });
    loadAllData();
  }, []);

  const originalById = useMemo(() => {
    const map = {};
    originalAllocations.forEach((r) => { map[r.id] = r; });
    return map;
  }, [originalAllocations]);

  const { dayWindow, dateWiseAssignments } = useDateWiseAssignments({ activityStart, activityEnd, allocations: workingAllocations, originalById });

  const employeeAvailabilityMap = useMemo(() => {
    const map = {};

    workingAllocations.forEach((row) => {
      if (!map[row.emp_id]) map[row.emp_id] = {};
      generateDatesBetween(row.start_date, row.end_date).forEach((date) => {
        map[row.emp_id][date] = {
          isAssigned: true,
          isBusy: false,
          rowKey: row.rowKey,
        };
      });
    });

    // Mark busy dates (only where not assigned)
    busyAllocations.forEach((row) => {
      if (!map[row.emp_id]) map[row.emp_id] = {};
      generateDatesBetween(row.start_date, row.end_date).forEach((date) => {
        if (!map[row.emp_id][date]) {
          map[row.emp_id][date] = {
            isAssigned: false,
            isBusy: true,
          };
        } else {
          // Already assigned, so not marking as busy
          // You could optionally add a flag: hasConflict: true
          map[row.emp_id][date].hasConflict = true;
        }
      });
    });

    return map;
  }, [workingAllocations, busyAllocations]);

  const ownershipMap = useMemo(() => buildOwnershipMap(originalAllocations), [originalAllocations]);

  const handleToggleAllocation = (emp, targetDate, checked) => {
    const targetDateComparable = DateForApiFormate(targetDate, true);
    setWorkingAllocations((prev) => {
      const others = prev.filter((r) => r.emp_id !== emp.emp_id);
      const empRows = prev.filter((r) => r.emp_id === emp.emp_id);
      const currentDates = empRows.flatMap((r) => datesBetweenComparable(r.start_date, r.end_date));
      const nextDates = checked
        ? [...currentDates, targetDateComparable]
        : currentDates.filter((d) => d !== targetDateComparable);

      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates: nextDates,
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: Number(emp.grade_level) > 1 ? "T" : "E",
          remarks: "",
          contract_rate: 0,
          is_approved: false,
        },
        existingRowsForEmp: empRows,
      });

      return mergeAdjacentRows([...others, ...newRows]);
    });
  };

  const handleAutoAssign = (emp) => {
    const freeDates = dayWindow.map(formatToApiDate).filter((d) => {
      const entry = employeeAvailabilityMap[emp.emp_id]?.[d];
      return !entry; // not assigned and not busy
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
      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates: [...currentDates, ...freeDatesComparable],
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: Number(emp.grade_level) > 1 ? "T" : "E",
          remarks: "",
          contract_rate: 0,
          is_approved: false,
        },
        existingRowsForEmp: empRows,
      });
      return mergeAdjacentRows([...others, ...newRows]);
    });

    setLastAutoAssign((prev) => ({ ...prev, [emp.emp_id]: freeDatesComparable }));

    // toast.success(`Assigned ${freeDates.length} date(s) to ${emp.name}`);
    toast.success(`${freeDates.length} date(s) selected for ${emp.name}`);
  };

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

      const newRows = recomputeEmployeeRows({
        empId: emp.emp_id,
        activeDates: remainingDates,
        ownershipMap,
        employeeMeta: {
          employee_name: emp.name,
          emp_type: Number(emp.grade_level) > 1 ? "T" : "E",
          remarks: "",
          contract_rate: 0,
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

  const handleFieldChange = (rowKey, field, value) => {
    setWorkingAllocations((prev) =>
      prev.map((row) => (row.rowKey === rowKey ? { ...row, [field]: value } : row))
    );
  };

  const isLocked = useCallback((row) => row.is_approved || !!ActivityDetails?.allAEntries?.length,
    [ActivityDetails]
  );

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
    ].filter(Boolean).join(" · ") || "Save Changes";



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

      {/* Activity Detail Card */}
      <ActivityDetailCard ActivityDetails={ActivityDetails} plannedTL={plannedTL} plannedEX={plannedEX} />

      <ResourceOverviewCard
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
        activityData={ActivityDetailCard}
        isActual={false}
        employeeList={employeeState?.data?.filter((e) => e.is_verified) || []}
      />

      {!["AA", "AS", "C", "PA"].includes(ActivityDetails.activityStatus) &&
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "1rem" }}>

          <Button onClick={() => setShowResourceAvailability(true)}>Add Resources</Button>
          {showResourceAvailability &&
            <Button variant="outline" onClick={() => setShowResourceAvailability(false)}>Close</Button>}
        </div>
      }

      {pendingCount > 0 && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={() => setShowConfirmPopup(true)} color="primary" style={{ marginLeft: "auto" }}>{saveLabel} Resources in plan </Button>
        </div>
      )}

      {showResourceAvailability && <ResourceAvailabilityCard
        activityData={ActivityDetails}
        plannedTL={plannedTL}
        plannedEX={plannedEX}
        employeeList={employeeState?.data?.filter((e) => e.is_verified) || []}
        dayWindow={dayWindow}
        employeeAvailabilityMap={employeeAvailabilityMap}
        handleToggleAllocation={handleToggleAllocation}
        handleAutoAssign={handleAutoAssign}
        handleUndoAutoAssign={handleUndoAutoAssign}
        lastAutoAssign={lastAutoAssign}
      />}

      <ConfirmPopup
        isOpen={showConfirmPopup}
        isLoading={isSubmitting}
        // onConfirm={handleSubmit}
        onClose={() => setShowConfirmPopup(false)}
        title="Confirm Resource Plan"
        message="Are you sure you want to save these resources in the plan?"
        confirmLabel="Yes, Save"
      />

    </Layout>
  )
}

export default AllocationPlanScreen

const ActivityDetailCard = ({ ActivityDetails, plannedTL, plannedEX }) => {
  return (
    <Card title="Activity Details" hoverable={false}>
      <DetailsGrid>
        <DetailItem>
          <DetailIconWrap><FaCalendarAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Duration</DetailLabel>
            <DetailValue>{formatDate(ActivityDetails.planned_start_date)} – {formatDate(ActivityDetails.planned_end_date)}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaFileAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Customer</DetailLabel>
            <DetailValue>{ActivityDetails.customer_name}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaFileAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Order Item</DetailLabel>
            <DetailValue>{ActivityDetails.order_item_key}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaUserTie size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Required TL</DetailLabel>
            <DetailValue>{plannedTL ?? '—'}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaUser size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Required EX</DetailLabel>
            <DetailValue>{plannedEX ?? '—'}</DetailValue>
          </DetailText>
        </DetailItem>

        <DetailItem>
          <DetailIconWrap><FaMapMarkerAlt size={13} /></DetailIconWrap>
          <DetailText>
            <DetailLabel>Location</DetailLabel>
            <DetailValue>{ActivityDetails.store_name || '—'}</DetailValue>
          </DetailText>
        </DetailItem>
      </DetailsGrid>
      {ActivityDetails.store_remarks && <DetailItem style={{ marginTop: "1rem" }}>
        <DetailIconWrap><FaPenToSquare size={13} /></DetailIconWrap>
        <DetailText>
          <DetailLabel>Remark</DetailLabel>
          <DetailValue>{ActivityDetails.store_remarks || '—'}</DetailValue>
        </DetailText>
      </DetailItem>}
    </Card>
  )
}