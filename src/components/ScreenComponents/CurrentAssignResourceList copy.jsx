import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { formatToApiDate, DateForApiFormate, formatToDDMMYYYY } from "../../utils/utils";
import Card from "../Card";
import DataTable, { Td } from "../DataTable";
import Button from "../Button";
import Badge from "../Badge";
import { FaCalendarAlt, FaEdit, FaFileAlt, FaMapMarkerAlt, FaPlus, FaTrash, FaUser, FaUserCheck, FaUserPlus, FaUserSlash, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import { LuCopy, LuCopyPlus } from "react-icons/lu";
import { getContractAllocationData, postActivityAllocationData, postAllocationData } from "../../services/productServices";
import { buildActualPayloadsForSubmit } from "../../utils/resourceAllocationLogic";
import { useNavigate } from "react-router-dom";
import ConfirmPopup from "../ConfirmPopup";
import Modal from "../Modal";
import AddActualModal from "./AddActualModal";
import { useFilter } from "../../hooks/useFilter";
import { theme } from "../../styles/Theme";

const ScrollableTableWrapper = styled.div`
  max-height: 800px;
  overflow-y: auto;

  border-radius: 8px;
`;

const DateBlock = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#e0e0e0'}88;
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

const ButtonRows = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings?.md || '0.5rem'};
  margin-bottom: ${({ theme }) => theme.spacings?.md || '0.5rem'};
  gap: ${({ theme }) => theme.spacings?.md || '0.5rem'};
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


const toLocalDateOnly = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  // supports YYYY-MM-DD
  const [year, month, day] = String(value)
    .split("T")[0]
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
};

const toInputDate = (date) => {
  if (!date) return "";

  const d = date instanceof Date ? date : toLocalDateOnly(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const MONTH_ABBR = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const parseApiDateKey = (dStr) => {
  if (typeof dStr !== "string") return null;

  let match = dStr.match(/^(\d{4})-(\d{2})-(\d{2})$/); // YYYY-MM-DD
  if (match) {
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  match = dStr.match(/^(\d{2})-(\d{2})-(\d{4})$/); // DD-MM-YYYY
  if (match) {
    const [, d, m, y] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  match = dStr.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/); // ADD — DD-MMM-YYYY
  if (match) {
    const [, d, mon, y] = match;
    const monthIndex = MONTH_ABBR[mon.toLowerCase()];
    if (monthIndex == null) return null;
    const date = new Date(Number(y), monthIndex, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

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
  employees = [],
  loadAllData
}) => {
  const loggedEmpId = localStorage.getItem("cust_emp_id");

    const [loading, setLoading] = useState(false);

    // console.log("activityData", activityData)

      const today = new Date();

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [allAEntries, setAllAEntries] = useState(activityData?.allAEntries || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [noOfItems, setNoOfItems] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [actualDraftsByDate, setActualDraftsByDate] = useState({});
  const [isActualRangeModalOpen, setIsActualRangeModalOpen] = useState(false);
  const [actualStartDate, setActualStartDate] = useState("");
  const [actualEndDate, setActualEndDate] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    loading: false,
    title: "Confirmation",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null,
  });

    const navigate = useNavigate();

  const [rangeEmpId, setRangeEmpId] = useState("");
const [rangeEmpType, setRangeEmpType] = useState("E");
const [rangeRemarks, setRangeRemarks] = useState("");

const [editedApiRowKeys, setEditedApiRowKeys] = useState(() => new Set());
const [savedApiEditKeys, setSavedApiEditKeys] = useState(() => new Set());

    const [resourceList, setResourceList] = useState([]);

    const activityEndDateOnly = toLocalDateOnly(activityEnd);
const isPastActivityWindow = activityEndDateOnly && today > activityEndDateOnly;
const hasAnyActivityStarted = allAEntries.length > 0;

  const a_id = activityData?.original_A?.id || activityData?.a_id || null;
  const [activityStarted, setActivityStarted] = useState(!!a_id);

  const [startedDates, setStartedDates] = useState(() => new Set());

  // last date (string) that has been started — used as the cutoff for "Copy Actual (All Dates)"
const lastStartedDate = startedDates.size ? [...startedDates].sort().at(-1) : null;

const activityIdByDate = useMemo(() => {
  const map = {};
  allAEntries.forEach((entry) => {
    if (entry?.start_date && entry?.id) {
      map[entry.start_date] = entry.id;
    }
  });
  return map;
}, [allAEntries]);

useEffect(() => {
  if (!allAEntries.length) return;
  setStartedDates((prev) => {
    const next = new Set(prev);
    allAEntries.forEach((entry) => {
      if (entry?.start_date) next.add(entry.start_date);
    });
    return next;
  });
}, [allAEntries]);

const handleStartActivityOnce = async () => {
  try {
    const p_id = activityData?.original_P?.id;
    if (!p_id) {
      toast.error("Missing p_id, cannot start activity");
      return;
    }

    const now = new Date();
    const activity_date = DateForApiFormate(toInputDate(today));
    const start_time = now.toTimeString().slice(0, 5);

    const fd = new FormData();
    fd.append("emp_id", loggedEmpId);
    fd.append("activity_date", activity_date);
    fd.append("call_mode", "ADD");
    fd.append("p_id", p_id);
    fd.append("geo_type", "I");
    fd.append("start_time", start_time);
    fd.append("end_time", "");

        await postActivityAllocationData(fd);
        for (let [key, value] of fd.entries()) {
          console.log(key, value);
        }
    await loadAllData();
    
    // Fetch updated resource data to get new allAEntries
    await fetchResourceData();

    toast.success("Activity started.");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to start activity");
  }
};

const handleStartActivity = async (dStr) => {
  try {
    const p_id = activityData?.original_P?.id;
    if (!p_id) {
      toast.error("Missing p_id, cannot start activity");
      return;
    }

    const now = new Date();
    const activity_date = DateForApiFormate(dStr); // dd-mm-yyyy
    const start_time = now.toTimeString().slice(0, 5); // "HH:MM"

    const fd = new FormData();
    fd.append("emp_id", loggedEmpId);
    fd.append("activity_date", activity_date);
    fd.append("call_mode", "ADD");
    fd.append("p_id", p_id);
    fd.append("geo_type", "I");
    fd.append("start_time", start_time);
    fd.append("end_time", "");

    await postActivityAllocationData(fd);
        for (let [key, value] of fd.entries()) {
          console.log(key, value);
        }

    await loadAllData();
    
    // Fetch updated resource data to get new allAEntries
    await fetchResourceData();

    toast.success(`Activity started for ${dStr}.`);
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to start activity");
  }
};

    const fetchResourceData = useCallback(async () => {
        const startDate = activityData?.planned_start_date;
        const endDate = activityData?.planned_end_date;
        const allocationIds = [...new Set((activityData?.allAEntries || []).map(item => item.id).filter(Boolean))];
  
        if (!startDate || !endDate || !allocationIds.length) {
        // if (!startDate || !endDate) {
          setResourceList([]);
          return;
        }
  
        try {
          setLoading(true);
          const responses = await Promise.all(allocationIds.map(allocationId => 
          getContractAllocationData({
                emp_id: loggedEmpId,
                allocation_id: allocationId,
                // start_date: DateForApiFormate(startDate),
                // end_date: DateForApiFormate(endDate),
              })
            )
          );
          const mergedData = responses.flatMap((response) => Array.isArray(response?.data) ? response.data : []).filter(item => item?.is_active === true);;
          setResourceList(mergedData);
          // console.log("mergedData", mergedData)
        } catch (error) {
          console.error("Failed to fetch resource data:", error);
          toast.error("Failed to load resource data");
          setResourceList([]);
        } finally {
          setLoading(false);
        }
      }, [activityData, loggedEmpId]);

useEffect(() => {
  setAllAEntries(activityData?.allAEntries || []);
}, [activityData]);

      useEffect(() => {
  if (!resourceList.length) return;
  setStartedDates((prev) => {
    const next = new Set(prev);
    resourceList.forEach((r) => {
      if (!r?.s_date || !r?.e_date) return;
      const s = toLocalDateOnly(r.s_date);
      const e = toLocalDateOnly(r.e_date);
      if (!s || !e) return;
      const cur = new Date(s);
      while (cur <= e) {
        next.add(formatToApiDate(cur));
        cur.setDate(cur.getDate() + 1);
      }
    });
    return next;
  });
}, [resourceList]);
  
    useEffect(() => {
      fetchResourceData();
    }, [fetchResourceData]);

    // REPLACE handleConfirmFinalActual usage — this is now a top-level submit,
// not per-date. Wire it to a single "Submit Actuals" button instead of the
// per-DateBlock "Add Actual for all Dates" button.
// UPDATE handleSubmitAllActuals — use per-date a_id from activityIdByDate instead of the single top-level a_id
const handleSubmitAllActuals = async () => {
  try {
    const { addPayload, updatePayload, deletePayload, unchangedPayload } = buildActualPayloadsForSubmit(
      actualDraftsByDate,
      resourceList
    );

    // group rows by the a_id of their start_date
    const groupByAId = (rows) => {
      const groups = {};
      rows.forEach((row) => {
        const aId = activityIdByDate[row.start_date] || a_id || activityData?.original_P?.id;
        if (!groups[aId]) groups[aId] = [];
        groups[aId].push(row);
      });
      return groups;
    };

    // if (deletePayload.length) {
    //   const fd = new FormData();
    //   fd.append("emp_id", loggedEmpId);
    //   fd.append("call_mode", "DELETE");
    //   fd.append("p_id", a_id || activityData?.original_P?.id);
    //   fd.append("c_emp_list", JSON.stringify(deletePayload));
    //   // await postAllocationData(fd);
    //          for (let [key, value] of fd.entries()) {
    //       console.log(key, value);
    //     }
    // }

    // const addUpdateGroups = groupByAId([...addPayload, ...updatePayload]);
    // for (const [aIdForDate, rows] of Object.entries(addUpdateGroups)) {
    //   const fd = new FormData();
    //   fd.append("emp_id", loggedEmpId);
    //   fd.append("p_id", aIdForDate);
    //   const hasUpdate = rows.some((r) => r.is_update);
    //   fd.append("call_mode", hasUpdate ? "UPDATE" : "ADD");
    //   fd.append("c_emp_list", JSON.stringify(rows));
    //   await postAllocationData(fd);

    //     //      for (let [key, value] of fd.entries()) {
    //     //   console.log(key, value);
    //     // }
    // }

  const allGroups = groupByAId([...addPayload, ...updatePayload, ...deletePayload, ...unchangedPayload]);
    for (const [aIdForDate, rows] of Object.entries(allGroups)) {
      const fd = new FormData();
      fd.append("emp_id", loggedEmpId);
      fd.append("p_id", aIdForDate);
      const hasAddOrUpdate = rows.some((r) => !r.is_deleted);
      fd.append("call_mode", hasAddOrUpdate ? "UPDATE" : "UPDATE"); // always UPDATE — ADD alone can't carry deletes
      fd.append("c_emp_list", JSON.stringify(rows));
      await postAllocationData(fd);
      for (let [key, value] of fd.entries()) {
        console.log(key, value);
      }

      // if (hasAddOrUpdate) {
      //   const activityCompleteFd = new FormData();
      //   activityCompleteFd.append("emp_id", loggedEmpId);
      //   activityCompleteFd.append("a_id", aIdForDate);
      //   activityCompleteFd.append("call_mode", "UPDATE");
      //   activityCompleteFd.append("activity_date", DateForApiFormate(rows[0]?.start_date));
      //   activityCompleteFd.append("geo_type", "O");
      //   activityCompleteFd.append("is_complete", "1");

      //   await postActivityAllocationData(activityCompleteFd);

      //   for (let [key, value] of activityCompleteFd.entries()) {
      //     console.log(key, value);
      //   }
      // }
    }

    // setActualDraftsByDate((prev) => {
    //   const next = {};
    //   Object.entries(prev).forEach(([dStr, d]) => { next[dStr] = { ...d, confirmed: true }; });
    //   return next;
    // });

    setActualDraftsByDate({});

    await loadAllData();
    toast.success("Actuals saved successfully");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to save actuals");
  }
};

    useEffect(() => {
  if (!resourceList.length) return;

  setActualDraftsByDate((prev) => {
    const next = { ...prev };

    resourceList.forEach((resource) => {
      if (!resource?.s_date || !resource?.e_date) return;

      const startDate = toLocalDateOnly(resource.s_date);
      const endDate = toLocalDateOnly(resource.e_date);

      if (!startDate || !endDate) return;

      // resource applies to every date from s_date to e_date
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dStr = formatToApiDate(currentDate);

        // create date draft if not available
        if (!next[dStr]) {
          next[dStr] = {
            confirmed: false,
            rows: [],
          };
        }

        const rowKey = `api-${resource.id}-${resource.allocation_id}-${dStr}`;

        // avoid duplicate API resource
        const alreadyExists = next[dStr].rows.some(
          (row) =>
            row.source === "api" &&
            row.resource_id === resource.id &&
            row.allocation_id === resource.allocation_id
        );

        if (!alreadyExists) {
          next[dStr] = {
            ...next[dStr],
            rows: [
              ...next[dStr].rows,
              {
                rowKey,

                // employee data
                original_emp_id: resource.emp_id,
                emp_id: resource.emp_id,
                employee_name: resource.employee_name,
                emp_type: resource.emp_type,

                // resource data
                remarks: resource.remarks || "",
                contract_rate: Number(resource.contract_rate) || 0,

                // API identifiers
                resource_id: resource.id,
                allocation_id: resource.allocation_id,
                order_item_id: resource.order_item_id,

                // API flags
                is_approved: Boolean(resource.is_approved),
                is_present: Boolean(resource.is_present),
                is_active: Boolean(resource.is_active),

                // additional API values
                a_percent: resource.a_percent,
                ope_amt: resource.ope_amt,
                app_remarks: resource.app_remarks || "",
                approve_date: resource.approve_date,

                // original API range
                s_date: resource.s_date,
                e_date: resource.e_date,

                // identify source
                source: "api",
              },
            ],
          };
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return next;
  });
}, [resourceList]);

const handleSaveApiRowEdit = (rowKey) => {
  setEditedApiRowKeys((prev) => {
    const next = new Set(prev);
    next.delete(rowKey); // exit edit mode
    return next;
  });
  setSavedApiEditKeys((prev) => new Set(prev).add(rowKey));
};

const toggleEditApiRow = (rowKey, dStr, apiRowsForDate) => {
  setEditedApiRowKeys((prev) => {
    const next = new Set(prev);
    next.has(rowKey) ? next.delete(rowKey) : next.add(rowKey);
    return next;
  });

  setActualDraftsByDate((prev) => {
    if (prev[dStr]) return prev; // already has a draft, don't clobber it
    return {
      ...prev,
      [dStr]: {
        confirmed: false,
        rows: apiRowsForDate.map((row) => ({
          rowKey: row.rowKey,
          original_emp_id: row.original_emp_id,
          emp_id: row.emp_id,
          employee_name: row.employee_name,
          emp_type: row.emp_type,
          remarks: row.remarks,
          contract_rate: row.contract_rate,
          resource_id: row.resource_id, // needed so buildActualPayloadsForSubmit treats it as UPDATE not ADD
        })),
      },
    };
  });
};

const handleConfirmActualRange = () => {
  if (!actualStartDate || !actualEndDate) {
    toast.error("Please select start date and end date");
    return;
  }
  if (actualStartDate > actualEndDate) {
    toast.error("Start date cannot be after end date");
    return;
  }
  if (!rangeEmpId) {
    toast.error("Please select a resource");
    return;
  }

  const emp = employees.find((e) => e.emp_id === rangeEmpId);

  setActualDraftsByDate((prev) => {
    const next = { ...prev };
    let cur = toLocalDateOnly(actualStartDate);
    const end = toLocalDateOnly(actualEndDate);

    while (cur <= end) {
      const dStr = formatToApiDate(cur);
      const existing = next[dStr] || { confirmed: false, rows: [] };
      next[dStr] = {
        ...existing,
        confirmed: false,
        rows: [
          ...existing.rows,
          {
            rowKey: crypto.randomUUID(),
            original_emp_id: null,
            emp_id: rangeEmpId,
            employee_name: emp?.name || "",
            emp_type: rangeEmpType,
            remarks: rangeRemarks,
            contract_rate: 0,
            start_date: dStr, // ADD
            end_date: dStr, 
          },
        ],
      };
      cur.setDate(cur.getDate() + 1);
    }
    return next;
  });

  setIsActualRangeModalOpen(false);
  setRangeEmpId("");
  setRangeEmpType("E");
  setRangeRemarks("");
};

  const handleCancelCopyAllActual = () => {
    setActualDraftsByDate((prev) => {
      const next = {};
      Object.entries(prev).forEach(([dStr, draft]) => {
        if (draft.confirmed) next[dStr] = draft; // keep confirmed ones
      });
      return next;
    });
  };

  const hasUnconfirmedDrafts = Object.values(actualDraftsByDate).some((d) => !d.confirmed);

  const handleCancelCopyActual = (dStr) => {
    setActualDraftsByDate((prev) => {
      const next = { ...prev };
      delete next[dStr];
      return next;
    });
  };

  const handleAddActualRow = (dStr) => {
    setActualDraftsByDate((prev) => {
      const draft = prev[dStr] || { confirmed: false, rows: [] };
      return {
        ...prev,
        [dStr]: {
          ...draft,
          rows: [
            ...draft.rows,
            {
              rowKey: crypto.randomUUID(),
              original_emp_id: null, // brand-new resource → always "Replaced"/new
              emp_id: employees[0]?.emp_id || "",
              employee_name: employees[0]?.name || "",
              emp_type: Number(employees[0]?.grade_level) > 1 ? "T" : "E",
              remarks: "",
              contract_rate: 0,
              start_date: dStr,
              end_date: dStr,
            },
          ],
        },
      };
    });
  };

const handleCopyActual = (dStr, planAssignments) => {
  setActualDraftsByDate((prev) => ({
    ...prev,
    [dStr]: {
      confirmed: false,
      rows: planAssignments.map((row) => ({
        rowKey: crypto.randomUUID(),
        original_emp_id: row.emp_id,   // used to detect "Replaced"
        emp_id: row.emp_id,
        employee_name: row.employee_name,
        emp_type: row.emp_type,
        remarks: row.remarks || "",
        contract_rate: row.contract_rate,
        start_date: dStr,
        end_date: dStr,
      })),
    },
  }));
};

const handleOpenActualRangeModal = () => {
  setActualStartDate(minActualDate);
  setActualEndDate(maxActualDate);
  setIsActualRangeModalOpen(true);
};

const handleCopyAllActual = () => {
  if (!lastStartedDate) {
    toast.error("Start the activity for a date before copying actuals");
    return;
  }
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  setActualDraftsByDate((prev) => {
    const next = { ...prev };
    dayWindow.forEach((d) => {          // CHANGED — was plannedDates
      const dStr = formatToApiDate(d);
      if (dStr > lastStartedDate) return;
      const currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (currentDate > todayDate) return;
      if (next[dStr]) return;
      const planAssignments = dateWiseAssignments[dStr] || [];
      if (planAssignments.length === 0) return;
      next[dStr] = {
        confirmed: false,
        rows: planAssignments.map((row) => ({
          rowKey: crypto.randomUUID(),
          original_emp_id: row.emp_id,
          emp_id: row.emp_id,
          employee_name: row.employee_name,
          emp_type: row.emp_type,
          remarks: row.remarks || "",
          contract_rate: row.contract_rate,
          start_date: dStr,
          end_date: dStr,
        })),
      };
    });
    return next;
  });
};

const handleActualFieldChange = (dStr, rowKey, field, value) => {
  setActualDraftsByDate((prev) => {
    const draft = prev[dStr];
    if (!draft) return prev;
    return {
      ...prev,
      [dStr]: {
        ...draft,
        rows: draft.rows.map((r) => (r.rowKey === rowKey ? { ...r, [field]: value } : r)),
      },
    };
  });
};

const handleActualEmployeeChange = (dStr, rowKey, emp_id) => {
  const emp = employees.find((e) => e.emp_id === emp_id);
  setActualDraftsByDate((prev) => {
    const draft = prev[dStr];
    if (!draft) return prev;
    return {
      ...prev,
      [dStr]: {
        ...draft,
        rows: draft.rows.map((r) =>
          r.rowKey === rowKey ? { ...r, emp_id, employee_name: emp?.name || r.employee_name } : r
        ),
      },
    };
  });
};

const handleRemoveActualRow = (dStr, rowKey) => {
  setActualDraftsByDate((prev) => {
    const draft = prev[dStr];
    if (!draft) return prev;
    return { ...prev, [dStr]: { ...draft, rows: draft.rows.filter((r) => r.rowKey !== rowKey) } };
  });
};

const handleConfirmActual = async (dStr) => {
  setActualDraftsByDate((prev) => ({ ...prev, [dStr]: { ...prev[dStr], confirmed: true } }));
  }
const handleConfirmFinalActual = async (dStr) => {
  const draft = actualDraftsByDate[dStr];
  if (!draft || draft.rows.length === 0) {
    toast.error("No resources to save");
    return;
  }

  try {
    const actualId = a_id || activityData?.original_P?.id;

    const originalResourceRowsForDate = resourceList.filter((row) => {
      const currentDate = DateForApiFormate(dStr, true);
      const startDate = DateForApiFormate(row.s_date, true);
      const endDate = DateForApiFormate(row.e_date, true);
      return currentDate && startDate && endDate && currentDate >= startDate && currentDate <= endDate;
    });

    const { addPayload, updatePayload, deletePayload } = buildActualPayloads(
      dStr,
      draft.rows,
      originalResourceRowsForDate
    );

    const c_emp_list = [
      ...addPayload.map((r) => ({ ...r, call_mode: "ADD" })),
      ...updatePayload.map((r) => ({ ...r, call_mode: "UPDATE" })),
      ...deletePayload.map((r) => ({ ...r, call_mode: "DELETE" })),
    ];

    const fd = new FormData();
    fd.append("emp_id", loggedEmpId);
    fd.append("p_id", actualId);
    fd.append("c_emp_list", JSON.stringify(c_emp_list));

    await postAllocationData(fd);

    setActualDraftsByDate((prev) => ({ ...prev, [dStr]: { ...prev[dStr], confirmed: true } }));
    toast.success("Actual saved successfully");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to save actual");
  }
};

const handleEditActualAgain = (dStr) => {
  setActualDraftsByDate((prev) => ({ ...prev, [dStr]: { ...prev[dStr], confirmed: false } }));
};

const handleCancelApiRowEdit = (dStr, rowKey, originalRow) => {
  setEditedApiRowKeys((prev) => {
    const next = new Set(prev);
    next.delete(rowKey);
    return next;
  });
  setActualDraftsByDate((prev) => {
    const draft = prev[dStr];
    if (!draft) return prev;
    return {
      ...prev,
      [dStr]: {
        ...draft,
        rows: draft.rows.map((r) =>
          r.rowKey === rowKey
            ? { ...r, emp_id: originalRow.emp_id, employee_name: originalRow.employee_name, emp_type: originalRow.emp_type, remarks: originalRow.remarks, contract_rate: originalRow.contract_rate }
            : r
        ),
      },
    };
  });
};

  const handleOpenActualModal = (dStr) => {
    const existing = allAEntries.find((entry) => entry.start_date === dStr);
    setModalDate(dStr);
    if (existing) {
      setIsUpdateMode(true);
      setNoOfItems(existing.no_of_items || "");
      const resList = parseActualResources(existing);
      if (resList.length > 0) {
        setSelectedEmpId(resList[0].emp_id);
      } else {
        setSelectedEmpId("");
      }
    } else {
      setIsUpdateMode(false);
      setNoOfItems("");
      setSelectedEmpId("");
    }
    setIsModalOpen(true);
  };

  const handleSaveActual = () => {
    if (!selectedEmpId) {
      toast.error("Please select a resource");
      return;
    }
    if (noOfItems === "" || isNaN(noOfItems) || Number(noOfItems) < 0) {
      toast.error("Please enter a valid number of items audited");
      return;
    }

    const selectedEmp = employees.find((emp) => emp.emp_id === selectedEmpId);
    if (!selectedEmp) {
      toast.error("Selected employee not found");
      return;
    }

    const empType = Number(selectedEmp.grade_level) > 1 ? "T" : "E";
    const resourceStr = `${selectedEmp.emp_id}^${selectedEmp.name}^${noOfItems}^${empType}`;

    if (isUpdateMode) {
      setAllAEntries((prev) =>
        prev.map((entry) =>
          entry.start_date === modalDate
            ? { ...entry, no_of_items: Number(noOfItems), resource_list: [resourceStr] }
            : entry
        )
      );
      toast.success("Actual updated successfully");
    } else {
      const newEntry = {
        id: `temp_${Date.now()}`,
        start_date: modalDate,
        no_of_items: Number(noOfItems),
        resource_list: [resourceStr],
      };
      setAllAEntries((prev) => [...prev, newEntry]);
      toast.success("Actual added successfully");
    }

    setIsModalOpen(false);
  };

  // const plannedDates = dayWindow.filter((d) => {
  //   const dStr = formatToApiDate(d);
  //   return (dateWiseAssignments[dStr] || []).length > 0;
  // });

// CHANGE plannedDates — include actual-draft dates even if outside dayWindow
const dayWindowStrs = new Set(dayWindow.map((d) => formatToApiDate(d)));

const isValidDateKey = (dStr) =>
  typeof dStr === "string" &&
  (/^\d{4}-\d{2}-\d{2}$/.test(dStr) || /^\d{2}-\d{2}-\d{4}$/.test(dStr) || /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dStr));

  const actualOnlyDateKeys = new Set([
  ...Object.keys(actualDraftsByDate).filter(
    (dStr) => isValidDateKey(dStr) && (actualDraftsByDate[dStr]?.rows || []).length > 0
  ),
  ...resourceList.map((r) => formatToApiDate(toLocalDateOnly(r.s_date))).filter(Boolean),
  ...allAEntries.map((e) => e.start_date).filter(isValidDateKey),
]);

const draftOnlyDates = [...actualOnlyDateKeys]
  .filter((dStr) => !dayWindowStrs.has(dStr))
  .map((dStr) => ({ d: parseApiDateKey(dStr), dStr }))
  .filter((item) => item.d);

const plannedDates = [
  ...dayWindow
    .filter((d) => {
      const dStr = formatToApiDate(d);
      const hasPlan = (dateWiseAssignments[dStr] || []).length > 0;
      const hasActualDraft = (actualDraftsByDate[dStr]?.rows || []).length > 0;
      return hasPlan || hasActualDraft;
    })
    .map((d) => ({ d, dStr: formatToApiDate(d) })),
  ...draftOnlyDates,
].sort((a, b) => a.d - b.d);

const filteredPlannedDates = useFilter({
  data: plannedDates,
  fields: [],
  search: "",
  extraFilters: {
    dateRange: {
      field: "d",
      from: filterStartDate ? toLocalDateOnly(filterStartDate) : null,
      to: filterEndDate ? toLocalDateOnly(filterEndDate) : null,
    },
  },
});
// console.log("plannedDates", plannedDates)

// const didAutoSetFilterRef = useRef(false);
useEffect(() => {
  if (!plannedDates.length) return;
  if (filterStartDate || filterEndDate) return;

  const validDates = plannedDates
    .map(({ d }) => d)
    .filter((d) => d instanceof Date && !isNaN(d));

  if (!validDates.length) return;

 const activityStartDateOnly = toLocalDateOnly(DateForApiFormate(activityStart, true));

  const candidateMinDate = new Date(Math.min(...validDates));
  const minDate =
    activityStartDateOnly && candidateMinDate < activityStartDateOnly
      ? candidateMinDate
      : activityStartDateOnly || candidateMinDate;

  const maxDate = new Date(Math.max(...validDates));

  // console.log("activityStartDateOnly", activityStart)
  // console.log("candidateMinDate", candidateMinDate)

  setFilterStartDate(toInputDate(minDate));
  setFilterEndDate(toInputDate(maxDate));
}, [plannedDates]);


today.setHours(0, 0, 0, 0);

const activityStartDate = toLocalDateOnly(activityStart);
const activityEndDate = toLocalDateOnly(activityEnd);

// End date should never exceed today
const maxAllowedActualDate =
  activityEndDate && activityEndDate < today
    ? activityEndDate
    : today;

// const minActualDate = activityStartDate ? toInputDate(activityStartDate): "";

  const minActualDate = activityStartDate ? toInputDate(activityStartDate) : "";
const maxActualDate = toInputDate(maxAllowedActualDate);

  // console.log("activityData", activityData)
  // console.log("plannedDates", JSON.stringify(plannedDates))

const hasAnyDateWithoutActual = plannedDates.some(({ dStr }) => {
  const alreadyHasResourceActual = resourceList.some((row) => {
    const currentDate = DateForApiFormate(dStr, true);
    const startDate = DateForApiFormate(row.s_date, true);
    const endDate = DateForApiFormate(row.e_date, true);
    return currentDate && startDate && endDate && currentDate >= startDate && currentDate <= endDate;
  });
  return !alreadyHasResourceActual;
});
  
const hasUserActualChanges =  savedApiEditKeys.size > 0 || Object.values(actualDraftsByDate).some((draft) =>
  (draft.rows || []).some((row) => row.source !== "api")
);

const openConfirmation = ({
  title = "Confirmation",
  message,
  confirmLabel = "Confirm",
  onConfirm,
  reload = false,
}) => {
  setConfirmationModal({
    isOpen: true,
    loading: false,
    title,
    message,
    confirmLabel,
    onConfirm,
    reload,
  });
};

const closeConfirmation = () => {
  setConfirmationModal((prev) => ({
    ...prev,
    isOpen: false,
    loading: false,
    onConfirm: null,
  }));
};

const handleConfirmation = async () => {
  try {
    setConfirmationModal((prev) => ({ ...prev, loading: true }));

    if (confirmationModal.onConfirm) {
      await confirmationModal.onConfirm();
    }

    const shouldReload = confirmationModal.reload;
    closeConfirmation();
    if (shouldReload) {
      window.location.reload();
    }
  } catch (err) {
    setConfirmationModal((prev) => ({ ...prev, loading: false }));
  }
};

const handleSaveActualRange = (rows, startDate, endDate) => {
  setActualDraftsByDate((prev) => {
    const next = { ...prev };
    let cur = toLocalDateOnly(startDate);
    const end = toLocalDateOnly(endDate);

    while (cur <= end) {
      const dStr = formatToApiDate(cur);
      const existing = next[dStr] || { confirmed: false, rows: [] };
      next[dStr] = {
        ...existing,
        confirmed: false,
        rows: [
          ...existing.rows,
          ...rows.map((r) => ({
            rowKey: crypto.randomUUID(),
            original_emp_id: null,
            emp_id: r.emp_id,
            employee_name: r.employee_name,
            emp_type: r.emp_type,
            remarks: r.remarks,
            contract_rate: 0,
            start_date: dStr,
            end_date: dStr,
          })),
        ],
      };
      cur.setDate(cur.getDate() + 1);
    }
    return next;
  });

  setIsActualRangeModalOpen(false);
};

  return (
    <>
  <Card
    title="Resource Overview"
    hoverable={false}
    headerAction={
    !hasAnyActivityStarted ? (
      isPastActivityWindow ? (
        <Button size="sm" variant="primary" onClick={() => openConfirmation({
          title: "Start Activity",
          message: "Are you sure you want to start this activity?",
          confirmLabel: "Start",
          onConfirm: handleStartActivityOnce,
          reload: true,
        })}>
          Start Activity
        </Button>
      ) : null // per-date Start buttons handle it inside each DateBlock instead
    ) : hasAnyDateWithoutActual ? (
      <RenderButton
        activityStarted={activityStarted}
        handleStartActivity={handleStartActivity}
        handleCopyAllActual={handleCopyAllActual}
        handleCancelCopyAllActual={handleCancelCopyAllActual}
        hasUnconfirmedDrafts={hasUnconfirmedDrafts}
        handleOpenActualRangeModal={handleOpenActualRangeModal}
      />
    )  : isPastActivityWindow ?  (
    <ButtonRows>
      <Button size="sm" variant="outline" onClick={handleOpenActualRangeModal}>
        <FaPlus /> Add Actual
      </Button>
    </ButtonRows>
  )  : null
  }  >  
      {/* <ButtonRows>
    <Button variant="primary" onClick={handleCopyAllActual}>
      Copy Actual (All Dates)
    </Button>
  </ButtonRows> */}
        <ScrollableTableWrapper>
        {filteredPlannedDates.length !== 0 && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
          <FormField>
            <FormLabel>From</FormLabel>
            <FormInput type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
          </FormField>
          <FormField>
            <FormLabel>To</FormLabel>
            <FormInput type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
          </FormField>
          {(filterStartDate || filterEndDate) && (
            <Button size="sm" variant="outlines" onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}>
              Clear
            </Button>
          )}
        </div>}

          {filteredPlannedDates.filter(({ d }) => d instanceof Date && !isNaN(d)).length === 0 ? (
            <EmptyRow style={{ fontSize: "1rem", padding: "2rem" }}>
              No resource allocated
            </EmptyRow>
          ) : (
            filteredPlannedDates
                  .filter(({ d }) => d instanceof Date && !isNaN(d))   // ADD — drop any invalid entries before mapping
                  .map(({ d, dStr }) => {
              // const dStr = formatToApiDate(d);
              const planAssignments = dateWiseAssignments[dStr] || [];
              const tlCount = planAssignments.filter((a) => a.emp_type === 'T').length;
              const exCount = planAssignments.filter((a) => a.emp_type === 'E').length;

              // console.log("planAssignments", JSON.stringify(planAssignments))

              const actualResourcesForDate = resourceList.filter((row) => {
                if (!row?.s_date || !row?.e_date) return false;

                const currentDate = DateForApiFormate(dStr, true);
                const startDate = DateForApiFormate(row.s_date, true);
                const endDate = DateForApiFormate(row.e_date, true);
                
                return (
                  currentDate &&
                  startDate &&
                  endDate &&
                  currentDate >= startDate &&
                  currentDate <= endDate
                );
              }).map((row) => ({
              ...row,

              // normalize for ActualEditRow
              rowKey: `api-${row.id}-${row.allocation_id}-${dStr}`,
              original_emp_id: row.emp_id,

              emp_id: row.emp_id,
              employee_name: row.employee_name,
              emp_type: row.emp_type,
              remarks: row.remarks || "",
              contract_rate: row.contract_rate || 0,

              // preserve API flags
              is_approved: Boolean(row.is_approved),
              is_present: Boolean(row.is_present),

              // useful later for update API
              allocation_id: row.allocation_id,
              resource_id: row.id,
            }));

              const hasResourceActual = actualResourcesForDate.length > 0;
              const isDateBeingEdited = actualResourcesForDate.some((r) => editedApiRowKeys.has(r.rowKey));

              const isStarted = startedDates.has(dStr) || hasResourceActual;

              // console.log("isStarted", isStarted)
              // console.log("startedDates", startedDates)
              // console.log("actualResourcesForDate", actualResourcesForDate)

              // const actualEntry = allAEntries.find((entry) => entry.start_date === dStr) || null;
              // const actualResources = parseActualResources(actualEntry);

              const actualDraft = actualDraftsByDate[dStr];
              const actualRows = actualDraft?.rows || [];

              // console.log("actualDraft", JSON.stringify(actualDraftsByDate))
              // console.log("actualDraft", actualDraft)
              // console.log("actualDraft", isStarted)

              // console.log("actualResourcesForDate", actualResourcesForDate)
              // console.log("actualDraft", actualDraftsByDate)
              // console.log("actualDraft", actualDraft)
              // console.log("actualRows", actualRows)
const draftRowsByKey = new Map(actualRows.map((r) => [r.rowKey, r]));

  //             const displayedActualRows = hasResourceActual
  // ? [
  //     ...actualResourcesForDate,
  //     ...actualRows.filter(
  //       (draftRow) =>
  //         !actualResourcesForDate.some(
  //           (apiRow) =>
  //             apiRow.emp_id === draftRow.emp_id &&
  //             apiRow.start_date === draftRow.start_date &&
  //             apiRow.end_date === draftRow.end_date
  //         )
  //     ),
  //   ]
  // : actualRows;
  const displayedActualRows = hasResourceActual
  ? [
      ...actualResourcesForDate.map((apiRow) => draftRowsByKey.get(apiRow.rowKey) || apiRow),
      ...actualRows.filter(
        (draftRow) => !actualResourcesForDate.some((apiRow) => apiRow.rowKey === draftRow.rowKey)
      ),
    ]
  : actualRows;

              const planEmpIds = new Set(planAssignments.map((a) => a.emp_id));

              const isPlannedFromApi = planAssignments.some((row) => row.status === "ORIGINAL");

              const planTotal = planAssignments.reduce(
                (sum, r) => sum + (Number(r.contract_rate) || 0),
                0
              );
              // const actualTotal = actualResources.reduce((sum, r) => sum + (Number(r.rate) || 0),0);
              const actualTotal = actualRows.reduce((sum, r) => sum + (Number(r.contract_rate) || 0), 0);

              const claims = getDummyClaims(dStr);
              const claimsTotal = claims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
              const grandTotal = planTotal + claimsTotal;

              const hasActual = allAEntries.some((entry) => entry.start_date === dStr);

              return (
                <DateBlock key={dStr}>
                  {/* Date header */}
                  <DateHeader>
                    <HeaderDate>
                        {d instanceof Date && !isNaN(d)
                          ? d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }).toUpperCase()
                          : dStr}
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
  <SubPanelHeader $variant="plan" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span>Plan</span>

    {!isPastActivityWindow && !isStarted && isPlannedFromApi && (
      <Button size="sm" variant="primary" onClick={() => openConfirmation({
        title: "Start Activity",
        message: `Are you sure you want to start the activity for ${dStr}?`,
        confirmLabel: "Start",
        onConfirm: () => handleStartActivity(dStr),
        reload: true,
      })}>
        Start Activity
      </Button>
    )}

    {isStarted && !hasResourceActual && !actualDraft && !isDateBeingEdited && planAssignments.length > 0 && (
      <Button size="sm" variant="outline" onClick={() => handleCopyActual(dStr, planAssignments)}>
        <LuCopy /> Copy Actual
      </Button>
    )}

    {isStarted && actualDraft && !actualDraft.confirmed && (
      <Button size="sm" variant="outlines" onClick={() => handleCancelCopyActual(dStr)}>
        Cancel Copy Actual
      </Button>
    )}
  </SubPanelHeader>

  {planAssignments.length === 0 ? (
    <EmptyRow>No resources planned</EmptyRow>
  ) : (
    planAssignments.map((row) => {
      const disableAction = row.is_approved || activityData?.allAEntries?.length;
      const isEditing = editingId === row.rowKey;

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
            openConfirmation={openConfirmation}
          />
        );
      }

      return (
        <ResourceRow key={row.rowKey}>
          <ResourceInfo>
            <ResourceName>
              {row.employee_name || row.emp_id}<span style={{ color: theme.colors.textLight }}>({row.emp_id})</span>
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

  {/* MOVED OUT of the ternary/map — renders regardless of planAssignments length */}
  {displayedActualRows
  .filter(
    (r, index, arr) =>
      !planEmpIds.has(r.emp_id) &&
      arr.findIndex((x) => x.emp_id === r.emp_id) === index
  )
  .map((r) => (
      <ResourceRow key={`extra-${r.rowKey}`} style={{ opacity: 0.6 }}>
        <ResourceInfo>
          <ResourceName>
            {r.employee_name || r.emp_id}
            <Badge variant="warning" style={{ fontSize: "0.58rem" }}>Not planned for this date</Badge>
          </ResourceName>
        </ResourceInfo>
      </ResourceRow>
    ))}
</SubPanel>

                      {/* ACTUAL */}
                      {/* <SubPanel>
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
                      </SubPanel> */}
                      <SubPanel>
  <SubPanelHeader
    $variant="actual"
    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
  >
    <span>Actual</span>
    {/* {!actualDraft && planAssignments.length > 0 && (
      <Button size="sm" variant="outlines" onClick={() => handleCopyActual(dStr, planAssignments)}>
        Copy Actual
      </Button>
    )} */}
  </SubPanelHeader>
 
  {displayedActualRows.length === 0 && (
    <EmptyRow>No actual data recorded</EmptyRow>
  )}

  {displayedActualRows.map((row) => {
    const disableActualAction =
      row.is_approved === true ||
      row.is_present === true;

    return (
      <ActualEditRow
        key={row.rowKey}
        row={row}
        employees={employees}
        onSave={hasResourceActual ? () => handleSaveApiRowEdit(row.rowKey) : undefined}
        onCancel={hasResourceActual ? () => handleCancelApiRowEdit(dStr, row.rowKey, actualResourcesForDate.find((r) => r.rowKey === row.rowKey)) : undefined}

        readOnly={
  hasResourceActual
    ? disableActualAction || !editedApiRowKeys.has(row.rowKey)
    : actualDraft?.confirmed
}

        isReplaced={
          hasResourceActual
            ? !planEmpIds.has(row.emp_id)
            : row.original_emp_id != null &&
              row.emp_id !== row.original_emp_id
        }

          minActualDate={DateForApiFormate(minActualDate, true)}
          maxActualDate={DateForApiFormate(maxActualDate, true)}

        onFieldChange={(field, value) => {
          if (disableActualAction) return;

          handleActualFieldChange(
            dStr,
            row.rowKey,
            field,
            value
          );
        }}

         disableActualAction={disableActualAction}

        onEmployeeChange={(emp_id) => {
          if (disableActualAction) return;

          handleActualEmployeeChange(
            dStr,
            row.rowKey,
            emp_id
          );
        }}

        onToggleEdit={hasResourceActual ? () => toggleEditApiRow(row.rowKey, dStr, actualResourcesForDate) : undefined}

        onRemove={() => {
          if (disableActualAction) return;

          handleRemoveActualRow(
            dStr,
            row.rowKey
          );
        }}
      />
    );
  })}

  {!hasResourceActual &&
    actualDraft &&
    !actualDraft.confirmed && (
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "flex-end",
          padding: "8px 10px",
        }}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddActualRow(dStr)}
        >
          <FaUserPlus /> Add resource
        </Button>

        {actualDraft.rows.length > 0 && (
          <Button
            size="sm"
            variant="success"
            onClick={() => handleConfirmActual(dStr)}
          >
            <FaUserCheck /> Confirm
          </Button>
        )}
      </div>
    )}

  {!hasResourceActual &&
    actualDraft?.confirmed && (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
        }}
      >
        <Badge
          variant="success"
          style={{ fontSize: "0.6rem" }}
        >
          Confirmed
        </Badge>

        <Button
          size="sm"
          variant="outlines"
          onClick={() => handleEditActualAgain(dStr)}
        >
          Edit
        </Button>
      </div>
    )}
</SubPanel>
                    </PlanActualGrid>

                    <TotalsBar style={{ marginTop: 10 }}>
                      <span>Plan Total: ₹{planTotal}</span>
                      <span>Actual Total: ₹{actualTotal}</span>
                    </TotalsBar>
                  </Section>

                  <ButtonRows>
                    {/* {hasResourceActual && activityData?.original_P?.is_ope_actual &&
                      <>
                        <Button onClick={() => navigate('/clamDetails', { state: { data:{...activityData, mode: "ADD"} } })}>Add claims</Button>
                        <Button onClick={() => navigate('/clamDetails', { state: { data:{...activityData, mode: "VIEW"} } })}>View claims</Button>
                      </>
                    }  */}
{/* 
                    {planAssignments.length !== 0 && activityData.activityStatus === "C" && <Button onClick={() => handleOpenActualModal(dStr)}>
                      {hasActual ? "Update Actual" : "Add Actual"}
                    </Button>} */}
                   
                  </ButtonRows>
                </DateBlock>
              );
            })
          )}
        </ScrollableTableWrapper>
          {hasAnyActivityStarted && hasUserActualChanges && (
            <ButtonRows style={{ marginTop: "1rem", justifyContent: "flex-end" }}>
              <Button variant="primary"   onClick={() =>
                  openConfirmation({
                    title: "Submit Actuals",
                    message: "Are you sure you want to submit actual allocations?",
                    confirmLabel: "Submit",
                    onConfirm: handleSubmitAllActuals,
                    reload: true,
                  })
                }
              >
                Submit Actuals
              </Button>
            </ButtonRows>
          )}
      </Card>


   {isActualRangeModalOpen &&   <AddActualModal
  isOpen={isActualRangeModalOpen}
  onClose={(e) => {setIsActualRangeModalOpen(false); e.stopPropagation()}}
  employees={employees}
  minActualDate={minActualDate}
  maxActualDate={maxActualDate}
  onSave={handleSaveActualRange}
  isUpdateMode={isUpdateMode}
/>}

      <ConfirmPopup
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        isLoading={confirmationModal.loading}
        onConfirm={handleConfirmation}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel={confirmationModal.confirmLabel}
      />
    </>
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

const ActualModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ActualModalContent = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ActualModalHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
`;

const ActualFormGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ActualLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
`;

const ActualInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ActualSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ActualButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;
const InlineEditForm = ({ row, onChange, onConfirm, onCancel, activityStart, activityEnd, openConfirmation }) => {
  const formattedStart = activityStart ? DateForApiFormate(activityStart, true) : "";
  const formattedEnd = activityEnd ? DateForApiFormate(activityEnd, true) : "";

  console.log("row", row)

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
      
      <FormField>
        <FormLabel>Contract Rate</FormLabel>
        <FormInput
          type="number"
          value={row.contract_rate || ""}
          placeholder="Enter rate"
          onChange={(e) => onChange(row.rowKey, "contract_rate", e.target.value)}
        />
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
        <Button size="small" variant="successGhost" onClick={() =>
          openConfirmation({
            title: "Update Resource",
            message: "Are you sure you want to update this resource?",
            confirmLabel: "Update",
            onConfirm: () => onConfirm(row.rowKey),
          })
        }>
          Confirm
        </Button>
        <Button size="small" variant="outlines" onClick={() => onCancel(row.rowKey)}>
          Cancel
        </Button>
      </div>
    </EditRowContainer>
  );
};

const ActualEditRow = ({ row, employees, readOnly, isReplaced, onFieldChange, onEmployeeChange, onRemove, disableActualAction, onToggleEdit, onSave,onCancel, minActualDate, maxActualDate  }) => {
  if (readOnly) {
    return (
      <ResourceRow>
        <ResourceInfo>
          <ResourceName>
            {row.employee_name || row.emp_id}
            {isReplaced && <Badge variant="info" style={{ fontSize: '0.58rem' }}>Add</Badge>}
          </ResourceName>
          <ResourceMeta>
            <Badge variant={row.emp_type === 'T' ? 'forward' : 'info'} style={{ fontSize: '0.6rem' }}>
              {row.emp_type === 'T' ? 'TL' : 'EX'}
            </Badge>
            <span>{row.start_date || row.s_date|| '—'} to {row.end_date || row.e_date || '—'}</span>
            {row.remarks && <span>· {row.remarks}</span>}
          </ResourceMeta>
        </ResourceInfo>
        <RateActionsCol>
          <RateTag>{row.contract_rate != null ? `₹${row.contract_rate}` : '—'}</RateTag>
          {!disableActualAction && onToggleEdit && (
            <Button size="sm" variant="outlines" onClick={onToggleEdit}>Edit</Button>
          )}
        </RateActionsCol>
      </ResourceRow>
    );
  } 

  // console.log("row.start_date", row)
  // console.log("row.end_date", row)

  const getStartDateField = (row) => row.start_date ? 'start_date' : 's_date';
 const getEndDateField = (row) => row.end_date ? 'end_date' : 'e_date';
 
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

      <FormField>
        <FormLabel>Start Date</FormLabel>
        <FormInput
          type="date"
          min={minActualDate}
          max={maxActualDate}
          value={DateForApiFormate(row.start_date || row.s_date || "", true)}
          onChange={(e) => onFieldChange(getStartDateField(row), e.target.value)}
        />
      </FormField>

      <FormField>
        <FormLabel>End Date</FormLabel>
        <FormInput
          type="date"
          min={row.start_date || minActualDate}
          max={maxActualDate}
          value={DateForApiFormate(row.end_date || row.e_date ||  "", true)}
          onChange={(e) => onFieldChange(getStartDateField(row), e.target.value)}
        />
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
          {onSave && (
            <Button size="sm" variant="success" onClick={onSave}>Save</Button>
          )}
          {onCancel && <Button size="sm" variant="outlines" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" variant="outlines" onClick={onRemove}> <FaUserSlash /> Remove</Button>
      </div>
    </EditRowContainer>
  );
};

const RenderButton = ({ activityStarted, handleStartActivity, handleCopyAllActual, handleCancelCopyAllActual, hasUnconfirmedDrafts, handleOpenActualRangeModal}) => {

  // if (!activityStarted) {
  //   return (
  //     <ButtonRows>
  //       <Button size="sm" variant="primary" onClick={() => handleStartActivity(dStr)}>
  //         Start Activity
  //       </Button>    
  //     </ButtonRows>
  //   );
  // }

  return(
    <ButtonRows>
     {!hasUnconfirmedDrafts && 
     <Button size="sm" variant="primary" onClick={() => handleCopyAllActual()}>
      <LuCopyPlus /> Copy Actual (All Dates)
    </Button> }

    {hasUnconfirmedDrafts && (
        <Button size="sm" variant="outlines" onClick={() => handleCancelCopyAllActual()}>
          Cancel Copy Actual
        </Button>
      )}

     <Button size="sm" variant="outline" onClick={() => handleOpenActualRangeModal()}>
        {/* {hasActual ? "Update Actual" : "Add Actual"} */}
        <FaPlus /> Add Actual
      </Button>
    
    </ButtonRows>
  )
}