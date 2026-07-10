import React, { useEffect, useMemo, useState } from "react";
import Layout from "../Layout";
import {
  buildOwnershipMap,
  buildPayloads,
  DateForApiFormate,
  datesBetweenComparable,
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
import { getContractAllocationData, getemployeeLists, postActivityAllocationData, postAllocationData } from "../../services/productServices";
import { toast } from "react-toastify";
import Button from "../Button";
import Card from "../Card";
import { ResourceAvailability } from "../ScreenComponents/ResourceAvaiblityCard copy";
import CurrentAssignments from "../ScreenComponents/CurrentAssignResourceList copy";
import { FaArrowLeft, FaCalendarAlt, FaFileAlt, FaMapMarkerAlt, FaUser, FaUserTie } from "react-icons/fa";
import styled from "styled-components";
import NewCurrentAssugnmentList from "../ScreenComponents/NewCurrentAssugnmentList";

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


const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const ResourceAllocation = () => {
  const location = useLocation();
  const activityData = location.state?.data;

  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const { start, end } = getMonthRange();

  const [editingId, setEditingId] = useState(null);
  const [editBackup, setEditBackup] = useState({}); // groupId -> { originalRow, segmentKeys }
  const [loading, setLoading] = useState(false);
  const [showResourceAvailability, setShowResourceAvailability] = useState(false);

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
        map[row.emp_id][d] = row.rowKey;
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

  const { addPayload, updatePayload, deletePayload } = useMemo(
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

  const loadAllData = async () => {
    const { id: allocation_id } = activityData?.original_P || {};
    try {
      const [currentAllocations, busyData] = await Promise.all([
        loadExisting({ allocation_id, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
        loadExisting({ emp_id: loggedEmpId, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
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

      setBusyAllocations(
        busyData.filter((x) => x.allocation_id !== activityData?.original_P?.id)
      );
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

    toast.success(`Assigned ${freeDates.length} date(s) to ${emp.name}`);
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

  const handleFieldChange = (rowKey, field, value) => {
    setWorkingAllocations((prev) =>
      prev.map((row) => (row.rowKey === rowKey ? { ...row, [field]: value } : row))
    );
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

  const handleSubmit = async () => {
    try {
      const p_id = activityData?.original_P?.id;
      if (!p_id) return;

      const activeResources = workingAllocations;

      if (deletePayload.length) {
        const fd = new FormData();
        fd.append("emp_id", loggedEmpId);
        fd.append("call_mode", "DELETE");
        fd.append("p_id", p_id);
        fd.append("c_emp_list", JSON.stringify(deletePayload));
        // await postAllocationData(fd);

           for (let [key, value] of fd.entries()) {
          console.log(key, value);
        }
      }
      
      if (addPayload.length || updatePayload.length) {
        const fd = new FormData();
        fd.append("emp_id", loggedEmpId);
        fd.append("p_id", p_id);
        
        const hasExistingActive = workingAllocations.some((r) => r.id != null);
        const callMode = addPayload.length && !updatePayload.length && !hasExistingActive ? "ADD" : "UPDATE";
        fd.append("call_mode", callMode);
        fd.append("c_emp_list", JSON.stringify([...addPayload, ...updatePayload]));
        await postAllocationData(fd);
        
        
      for (let [key, value] of fd.entries()) {
       console.log(key, value);
      }
      }

      // if (activeResources.length > 0) {
      //   const resourceListStr = activeResources
      //     .map((r) => `${r.emp_id}^${r.employee_name || ""}^${r.emp_type}`)
      //     .join("|");

      //   const activityFd = new FormData();
      //   activityFd.append("emp_id", loggedEmpId);
      //   activityFd.append("call_mode", "RESOURCE_ADD");
      //   activityFd.append("a_id", p_id);
      //   activityFd.append("geo_type", "O");
      //   activityFd.append("resource_list", resourceListStr);
      //   await postActivityAllocationData(activityFd);

      //   for (let [key, value] of activityFd.entries()) {
      //     console.log(key, value);
      //   }
      // }

      toast.success("Saved successfully");
      loadAllData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const matchingRetainer = (activityData?.original_P?.retainer_list || []).find((r) => r.a_type === "P" && r.start_date === activityData?.original_P?.start_date && r.end_date === activityData?.original_P?.end_date,);

  const plannedTL = matchingRetainer?.tl_count || 0;
  const plannedEX = matchingRetainer?.ex_count || 0;

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="md" onClick={() => window.history.back()}>
          <FaArrowLeft />Back
        </Button>
      </div>

      <Card title="Activity Details" hoverable={false}>
        <InfoStrip>
          <InfoPill>
            <FaCalendarAlt size={11} />
            <span>Duration:</span>
            {formatDate(activityData.planned_start_date)} – {formatDate(activityData.planned_end_date)}
          </InfoPill>
          <InfoPill>
            <FaFileAlt size={11} />
            <span>Customer:</span>
            {activityData.customer_name}
          </InfoPill>
          <InfoPill>
            <FaFileAlt size={11} />
            <span>Order Item:</span>
            {activityData.order_item_key}
          </InfoPill>
          <InfoPill>
            <FaUserTie size={11} />
            <span>Required TL:</span>
            {plannedTL}
          </InfoPill>
          <InfoPill>
            <FaUser size={11} />
            <span>Required EX:</span>
            {plannedEX}
          </InfoPill>
        </InfoStrip>
        <InfoPill>
          <FaMapMarkerAlt size={11} />
          <span>Location:</span>
          {activityData.store_name || '--'}
        </InfoPill>
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
        />

        {activityData.activityStatus !== "C" &&
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
          workingAllocations={workingAllocations}
          handleAutoAssign={handleAutoAssign}
        />}

        {/* <NewCurrentAssugnmentList
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
        
        /> */}

        {pendingCount > 0 && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button onClick={handleSubmit} color="primary" style={{ marginLeft: "auto" }}>{saveLabel}</Button>
          </div>
        )}
      {/* </Card> */}
    </Layout>
  );
};

export default ResourceAllocation;