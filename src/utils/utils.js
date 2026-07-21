import { useMemo } from "react";

export const MONTH_SHORT_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTH_MAP = MONTH_SHORT_NAMES.reduce((acc, m, i) => {
  acc[m.toLowerCase()] = i;
  return acc;
}, {});

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatToDDMMYYYY = (dateValue) => {
  if (!dateValue) return ""

  if (dateValue instanceof Date) {
    const dd = String(dateValue.getDate()).padStart(2, "0")
    const mm = String(dateValue.getMonth() + 1).padStart(2, "0")
    const yyyy = dateValue.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  if (typeof dateValue === "string" && dateValue.includes("-")) {
    const [year, month, day] = dateValue.split("-")
    return `${day}-${month}-${year}`
  }

  return ""
}

export const getTodayApiDateStr = () => {
  const d = new Date();
  return formatToApiDate(d);
};

export const formatToApiDate = (d) => {
  if (!(d instanceof Date)) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = MONTH_SHORT_NAMES[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd}-${mon}-${yyyy}`;
};

export const formatWeekLabel = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  // → "26 Jan – 1 Feb"
};

//this below function formate date in this way 👉 "January 2026"
export const formatMonthLabel = (start) => {
  const d = new Date(start);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  // → "January 2026"
};

export const formatAPITime = (time24) => {
  if (!time24) return ""
  const [h, m] = time24.split(":")
  let hours = parseInt(h, 10)
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`
}

export const getCurrentDateTimeDefaults = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const yyyy = now.getFullYear()
  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const todayISO = `${yyyy}-${mm}-${dd}`
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  const dayLogKey = `${dd}-${MONTH_SHORT_NAMES[now.getMonth()]}-${yyyy}`
  const apiDate = formatToDDMMYYYY(todayISO)

  return { todayISO, dayLogKey, apiDate, currentTime }
}

export const parseApiDate = (apiDateStr) => {
  if (!apiDateStr || typeof apiDateStr !== "string") return null;
  const parts = apiDateStr.split("-");
  if (parts.length !== 3) return null;
  const dd = parseInt(parts[0], 10);
  const mon = parts[1];
  const yyyy = parseInt(parts[2], 10);
  const monthIndex = MONTH_MAP[mon.toLowerCase()];
  if (isNaN(dd) || isNaN(monthIndex) || isNaN(yyyy)) return null;
  // Create date in local timezone
  return new Date(yyyy, monthIndex, dd, 0, 0, 0, 0);
};

export const DateForApiFormate = (value, returnComparable = false) => {
  if (!value) return "";
  let d = value;
  // If value is a string → normalize it
  if (typeof value === "string") {
    // Replace "/" with "-" to standardize
    value = value.replace(/\//g, "-");

    const monthNameMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    // Split on "-" (after normalization)
    const parts = value.split("-");

    if (parts.length === 3) {
      let [a, b, c] = parts;

      // Case: "02-Dec-2025"
      if (monthNameMap[b] !== undefined) {
        d = new Date(Number(c), monthNameMap[b], Number(a));
      }
      // Case: "2025-12-02" (YYYY-MM-DD)
      else if (a.length === 4) {
        d = new Date(Number(a), Number(b) - 1, Number(c));
      }
      // Case: "02-12-2025" (DD-MM-YYYY)
      else {
        d = new Date(Number(c), Number(b) - 1, Number(a));
      }
    } else {
      // Fallback: try JS parser
      d = new Date(value);
    }
  }
  if (!(d instanceof Date) || isNaN(d)) return "";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  if (returnComparable) {
    return `${yyyy}-${mm}-${dd}`;
  }

  return `${dd}-${mm}-${yyyy}`;
};

export const getMonthRange = ({ type = "current", mode = "month", offset = 0, weekStartsOn = 0, } = {}) => {
  const today = new Date();

  let direction = 0;
  if (type === "previous") direction = -1;
  if (type === "next") direction = 1;
  if (type === "current") direction = 0;

  const finalOffset = direction + offset;

  let start = new Date(today);
  let end = new Date(today);

  if (mode === "month") {
    // Move to target month
    start.setMonth(today.getMonth() + finalOffset, 1);
    end.setMonth(today.getMonth() + finalOffset + 1, 0); // last day of that month
  } else if (mode === "week") {
    const currentDay = today.getDay();
    // How many days to subtract to reach the start of the week
    const diffToWeekStart = (currentDay - weekStartsOn + 7) % 7;

    // Go to start of current week, then apply offset
    start.setDate(today.getDate() - diffToWeekStart + finalOffset * 7);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (mode === "today") {
    start.setDate(today.getDate() + finalOffset);
    end = new Date(start);
  }
  else {
    throw new Error(`Unsupported mode: "${mode}". Use "month" or "week".`);
  }

  const format = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return {
    start: format(start),
    end: format(end),
  };
};

export const formatDate2 = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

export const getWeekRange = (weekValue) => {
  const [year, week] = weekValue.split("-W").map(Number);

  const firstDay = new Date(year, 0, 1);

  const days = (week - 1) * 7;

  const start = new Date(firstDay.getTime() + days * 86400000);

  const day = start.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

export const buildActivityGroupMap = (apiData = []) => {
  if (!Array.isArray(apiData) || apiData.length === 0) return [];

  const groups = {};
  // key -> { key, original_P, allAEntries }

  // STEP 1: First index all P records
  apiData.forEach(item => {
    if (item.activity_type === "P") {
      const key = `${item.id}_${item.order_item_id}`;

      groups[key] = {
        key,
        original_P: item,
        allAEntries: []
      };
    }
  });

  // STEP 2: Attach A records to matching P
  apiData.forEach(item => {
    if (item.activity_type === "A") {
      const freeCodeId = Number(item.ref_p_id); // string → number
      if (!freeCodeId) return;

      const key = `${freeCodeId}_${item.order_item_id}`;

      if (groups[key]) {
        groups[key].allAEntries.push(item);
      }
    }
  });

  // STEP 3: Derive original_A (highest id)
  return Object.values(groups).map(group => {
    const allA = group.allAEntries;

    // const original_A = allA.length === 0 ? null : allA.reduce((prev, curr) =>  Number(curr.id) > Number(prev.id) ? curr : prev );
    const original_A = allA.length === 0 ? null : allA.reduce((prev, curr) => {
      const prevDate = parseApiDate(prev.start_date);
      const currDate = parseApiDate(curr.start_date);

      return currDate > prevDate ? curr : prev;
    });
    return {
      key: group.key,
      original_P: group.original_P,
      original_A,
      allAEntries: allA
    };
  });
};

export const normalizeDate = (d) => {
  const date =
    d instanceof Date ? d : parseApiDate(d);

  if (!date) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const getTodayActionFlags = ({ allAEntries }) => {
  const today = normalizeDate(new Date());

  // Find A started today
  const todayA = allAEntries.find(
    a => normalizeDate(a.start_date) === today
  );

  // 1️⃣ No A for today → Start
  if (!todayA) {
    return {
      showStartBtn: true,
      showCompleteBtn: false,
      showUpdateBtn: false,
      isCompleted: false

    };
  }

  // 2️⃣ A exists & not completed → Complete
  if (todayA.status === "N") {
    return {
      showStartBtn: false,
      showCompleteBtn: true,
      showUpdateBtn: false,
      isCompleted: false
    };
  }

  // 3️⃣ A exists & completed → Nothing
  return {
    showStartBtn: false,
    showCompleteBtn: false,
    showUpdateBtn: true,
    isCompleted: true
  };
};

const toApiDateFromString = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? null : formatToApiDate(d);
};

const buildDayLogsFromAEntriesForRetainer = (allAEntries = []) => {
  return allAEntries.reduce((acc, entry) => {
    if (!entry.start_date) return acc;

    const dayKey = toApiDateFromString(entry.start_date);

    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: dayKey,
        section: dayKey,
        remarks: entry.remarks || "",
        effort: 0,
        no_of_items: 0,
        resourceList: entry.resource_list,
      };
    }

    acc[dayKey].effort += Number(entry.effort || 0);
    acc[dayKey].no_of_items += Number(entry.no_of_items || 0);

    return acc;
  }, {});
};

export const getActivityOrderItemId = (activity) => {
  const raw = activity?.order_item_id ?? activity?.original_P?.order_item_id ?? activity?.key?.split("_")?.slice(1)?.join("_") ?? "";

  if (!raw) return "";

  const parts = String(raw).split("_");
  const id = parts[parts.length - 1];

  return String(id).replace(/^0+/, "");
};

export const matchClaimsToActivity = (claims = [], activity) => {
  const activityOrderItemId = getActivityOrderItemId(activity);

  if (!activityOrderItemId) return [];

  return claims.map((claim) => {
    const matchedItems = (claim?.claim_items || []).filter((item) => {
      const itemId = String(item?.o_item_id).replace(/^0+/, "");
      return itemId === activityOrderItemId;
    });

    if (matchedItems.length === 0) return null;

    return { ...claim, claim_items: matchedItems };
  })
    .filter(Boolean);
};

export const formatRetainerActivities = (apiData = [], resourcePlannedList = []) => {
  const grouped = buildActivityGroupMap(apiData);

  const isSameId = (id1, id2) =>
    id1 != null &&
    id2 != null &&
    String(id1) === String(id2);

  return grouped.map((group) => {
    const {
      original_P,
      original_A,
      allAEntries = [],
      key,
    } = group;

    const hasResources =
      Array.isArray(original_P?.resource_list) &&
      original_P.resource_list.length > 0;

    let statusDisplay = "";
    let activityStatus = "";

    // =====================================================
    // PLAN RESOURCE STATUS
    // original_P.id -> resourcePlannedList.allocation_id
    // =====================================================

    const matchedPlannedResources = resourcePlannedList.filter(
      (resource) =>
        isSameId(
          original_P?.id,
          resource?.allocation_id
        )
    );

    const isPlanSubmitted =
      matchedPlannedResources.length > 0;

    const isPlanApproved =
      isPlanSubmitted &&
      matchedPlannedResources.every(
        (resource) => resource?.is_approved === true
      );


    // =====================================================
    // ACTUAL RESOURCE STATUS
    // allAEntries[].id -> resourcePlannedList.allocation_id
    // =====================================================

    const actualIds = allAEntries
      .map((item) => item?.id)
      .filter(Boolean);

    const matchedActualResources = resourcePlannedList.filter(
      (resource) =>
        actualIds.some((actualId) =>
          isSameId(
            actualId,
            resource?.allocation_id
          )
        )
    );

    const isActualSubmitted =
      matchedActualResources.length > 0;

    const isActualApproved =
      isActualSubmitted &&
      matchedActualResources.every(
        (resource) => resource?.is_approved === true
      );

    // =====================================================
    // STATUS PRIORITY
    //
    // NA / NS
    //    ↓
    // Plan Submitted
    //    ↓
    // Plan Approved
    //    ↓
    // In Progress
    //    ↓
    // Actual Submitted
    //    ↓
    // Actual Approved
    // =====================================================

    if (isActualApproved) {
      statusDisplay = "Actual Approved";
      activityStatus = "AA";
    }

    else if (isActualSubmitted) {
      statusDisplay = "Actual Submitted";
      activityStatus = "AS";
    }

    else if (
      original_A?.status === "N" ||
      original_A?.status === "P"
    ) {
      statusDisplay = "In Progress";
      activityStatus = "P";
    }

    else if (isPlanApproved) {
      statusDisplay = "Plan Approved";
      activityStatus = "PA";
    }

    else if (isPlanSubmitted) {
      statusDisplay = "Plan Submitted";
      activityStatus = "PS";
    }

    // else if (!hasResources) {
    //   statusDisplay = "Not Assigned";
    //   activityStatus = "NA";
    // }

    else if (!hasResources || !original_A) {
      statusDisplay = "Not Planned";
      activityStatus = "NS";
    }

    else {
      statusDisplay = "Completed";
      activityStatus = "C";
    }

    const completed = activityStatus === "C" ? "Completed" : "In Progress";

    const ui = getTodayActionFlags({ allAEntries, });

    const day_logs = buildDayLogsFromAEntriesForRetainer(allAEntries);

    return {
      key,

      p_id: original_P?.id ?? null,
      a_id: original_A?.id ?? null,

      employee_name: original_P?.employee_name ?? "",

      emp_id: original_P?.emp_id ?? "",

      customer_name: original_P?.customer_name ?? "",

      product_name: original_P?.product_name ?? "",

      project_name: original_P?.project_name ?? "",

      activity_name: original_P?.activity_name ?? "",

      order_item_id: original_P?.order_item_id ?? "",

      order_item_key: original_P?.order_item_key ?? "",

      planned_start_date: original_P?.start_date || null,

      planned_end_date: original_P?.end_date || null,

      planned_start_time: original_P?.start_time || null,

      planned_end_time: original_P?.end_time || null,

      actual_start_date: original_A?.start_date || null,

      actual_end_date: original_A?.end_date || null,

      is_file_applicable: original_P?.is_file_applicable ?? false,

      audit_type: original_P?.audit_type ?? "",

      store_name: original_P?.store_name ?? "",

      store_remarks: original_P?.store_remarks ?? "",

      complete: completed,

      is_complete: activityStatus === "C",

      // New calculated status
      statusDisplay,
      activityStatus,

      // Optional flags — useful in UI
      isPlanSubmitted,
      isPlanApproved,
      isActualSubmitted,
      isActualApproved,

      original_P,
      original_A,
      allAEntries,

      day_logs,
      ui,
    };
  });
};

export const getStatusVariant = (activityStatus) => {
  switch (activityStatus) {
    case "P":
      return "info";
    case "NA":
      return "error";
    case "NS":
      return "error";
    case "C":
      return "success";
    case "AA":
      return "success";
    case "AS":
      return "success";
    case "PS":
      return "info";
    default:
      return "default";
  }
};

export const buildDayWindow = (startStr, count = 5) => {
  if (!startStr) return [];

  const dateStr = DateForApiFormate(startStr, true);
  if (!dateStr) return [];

  const base = new Date(dateStr);
  if (isNaN(base)) return [];

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return d;
  });
};

export const generateDatesBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return [];
  const dates = [];
  const [sY, sM, sD] = startStr.split("-").map(Number);
  const [eY, eM, eD] = endStr.split("-").map(Number);
  const cur = new Date(sY, sM - 1, sD);
  const end = new Date(eY, eM - 1, eD);
  while (cur <= end) {
    dates.push(formatToApiDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

export const normalizeApiAllocations = (data = []) => {
  return data.filter(x => x.is_active).map(item => ({
    rowKey: String(item.id),
    id: item.id,
    allocation_id: item.allocation_id,
    emp_id: item.emp_id,
    employee_name: item.employee_name,
    start_date: item.s_date ? DateForApiFormate(item.s_date, true) : DateForApiFormate(item.start_date, true),
    end_date: item.e_date ? DateForApiFormate(item.e_date, true) : DateForApiFormate(item.end_date, true),
    remarks: item.remarks || "",
    emp_type: item.emp_type,
    is_approved: item.is_approved,
    is_active: item.is_active,
    is_present: item.is_present,
    app_remarks: item.app_remarks,
    contract_rate: item.contract_rate,
    ope_amt: item.ope_amt,
    order_item_id: item.order_item_id,
    approve_date: item.approve_date,
    action: "NONE"
  }))
}

export const normalizeOverlappingAllocations = (rows = []) => {

  // ignore deleted rows
  const activeRows = rows.filter(r => r.action !== "DELETE");

  // sort by employee and start date
  activeRows.sort((a, b) => {
    if (a.emp_id !== b.emp_id) return a.emp_id.localeCompare(b.emp_id);
    return new Date(a.start_date) - new Date(b.start_date);
  });

  const result = [];

  activeRows.forEach(current => {

    // if (!result.length) {

    //     result.push({ ...current });
    //     return;

    // }

    let inserted = false;

    for (let i = 0; i < result.length; i++) {
      const prev = result[i];
      if (prev.emp_id !== current.emp_id) continue;

      const prevStart = new Date(prev.start_date);
      const prevEnd = new Date(prev.end_date);
      const curStart = new Date(current.start_date);
      const curEnd = new Date(current.end_date);

      // overlap exists
      if (curStart <= prevEnd && curEnd >= prevStart) {
        // left part
        if (curStart > prevStart) {
          const leftEnd = new Date(curStart);
          leftEnd.setDate(leftEnd.getDate() - 1);
          result[i] = {
            ...prev,
            end_date: formatToApiDate(leftEnd),
            action: prev.id ? "UPDATE" : "ADD"
          };
        } else {
          // remove previous completely
          result.splice(i, 1);
          i--;
        }
        // right part
        if (curEnd < prevEnd) {
          const rightStart = new Date(curEnd);
          rightStart.setDate(rightStart.getDate() + 1);
          result.push({
            ...prev,
            rowKey: crypto.randomUUID(),
            id: null,
            parent_id: prev.id,
            start_date: formatToApiDate(rightStart),
            action: "ADD"
          });
        }
        inserted = true;
      }
    }
    if (!inserted) {
      result.push({ ...current });
    }
  });
  rows.filter(x => x.action === "DELETE").forEach(x => result.push(x));

  return result;
};

export const splitAllocationByDate = (row, targetDate, mode = "DELETE" // DELETE | EDIT
) => {
  const result = [];

  const startDate = row.start_date;
  const endDate = row.end_date;

  /*
      Single day allocation
  */
  if (startDate === targetDate && endDate === targetDate) {
    if (mode === "DELETE") {
      result.push({ ...row, action: row.id ? "DELETE" : "REMOVE", });
    } else {
      result.push({ ...row, action: row.id ? "EDIT" : "ADD", });
    }
    return result;
  }
  const target = new Date(targetDate);

  /*
      LEFT PART
  */
  if (startDate < targetDate) {
    const prev = new Date(target);
    prev.setDate(prev.getDate() - 1);

    result.push({
      ...row,
      end_date: DateForApiFormate(prev, true),
      action: row.id ? "UPDATE" : "ADD",
    });
  }

  /*
      MIDDLE PART
  */

  const middleAction =
    mode === "DELETE"
      ? row.id
        ? "DELETE" : "REMOVE" : row.id
        ? "EDIT" : "ADD";

  result.push({
    ...row,
    rowKey: crypto.randomUUID(),
    parent_id: row.id,
    id: mode === "EDIT" ? null : row.id,
    start_date: targetDate,
    end_date: targetDate,
    action: middleAction,
  });

  if (endDate > targetDate) {
    const next = new Date(target);
    next.setDate(next.getDate() + 1);

    result.push({
      ...row,
      rowKey: crypto.randomUUID(),
      parent_id: row.id,
      id: null,
      start_date: DateForApiFormate(next, true),
      action: "ADD",
    });
  }
  return result.filter((r) => r.action !== "REMOVE");
};

export const splitAllocationForEdit = (row, targetDate) => {
  const rows = [];

  if (row.start_date === targetDate && row.end_date === targetDate) {
    rows.push({ ...row, action: "EDIT" });
    return rows;
  }
  const target = new Date(targetDate);
  // left part

  if (row.start_date < targetDate) {
    const prev = new Date(target);
    prev.setDate(prev.getDate() - 1);
    rows.push({
      ...row,
      end_date: DateForApiFormate(prev, true),
      action: row.id ? "UPDATE" : "ADD"
    });
  }
  // editable part

  rows.push({
    ...row,
    rowKey: crypto.randomUUID(),
    parent_id: row.rowKey,
    id: null,
    start_date: targetDate,
    end_date: targetDate,
    action: "EDIT"
  });

  // right part

  if (row.end_date > targetDate) {
    const next = new Date(target);
    next.setDate(next.getDate() + 1);
    rows.push({
      ...row,
      rowKey: crypto.randomUUID(),
      parent_id: row.rowKey,
      id: null,
      start_date: DateForApiFormate(next, true),
      action: "ADD"
    });
  }
  return rows;
};

// export const buildPayloads = (workingAllocations) => {
//     const addPayload = [];
//     const updatePayload = [];
//     const deletePayload = [];

//     workingAllocations.forEach(row => {

//       // ADD
//         if (row.action === "ADD") {
//             addPayload.push({
//                 emp_id: row.emp_id,
//                 emp_type: row.emp_type,
//                 start_date: DateForApiFormate(row.start_date),
//                 end_date: DateForApiFormate(row.end_date),
//                 remarks: row.remarks || "",
//                 contract_rate:Number(row.contract_rate) || 0
//             });

//           }

//           // UPDATE
//         else if ( row.action === "UPDATE" && row.id) {
//             updatePayload.push({
//                 id: row.id,
//                 emp_id: row.emp_id,
//                 emp_type: row.emp_type,
//                 start_date: DateForApiFormate(row.start_date),
//                 end_date: DateForApiFormate(row.end_date),
//                 remarks: row.remarks || "",
//                 contract_rate:Number(row.contract_rate) || 0,
//                 is_updated: true
//             });
//         }

//             // DELETE
//         else if (row.action === "DELETE" && row.id) {
//             deletePayload.push({
//                 id: row.id,
//                 is_deleted: true
//             });
//         }
//     });
//     return { addPayload, updatePayload, deletePayload };
// };

export const mergeAllocations = (allocations = []) => {

  // Ignore deleted rows
  const activeRows = allocations.filter(
    row => row.action !== "DELETE"
  );

  // Sort by employee and start_date
  activeRows.sort((a, b) => {

    if (a.emp_id !== b.emp_id)
      return a.emp_id.localeCompare(b.emp_id);

    return new Date(a.start_date) - new Date(b.start_date);

  });

  const merged = [];

  activeRows.forEach(current => {

    if (!merged.length) {
      merged.push({ ...current });
      return;
    }

    const last = merged[merged.length - 1];

    // next day after last.end_date
    const nextDate = new Date(last.end_date);
    nextDate.setDate(nextDate.getDate() + 1);

    const nextDateStr = formatToApiDate(nextDate);

    const canMerge =
      last.emp_id === current.emp_id &&
      last.emp_type === current.emp_type &&
      (last.remarks || "") === (current.remarks || "") &&
      nextDateStr === current.start_date &&
      last.action !== "DELETE" &&
      current.action !== "DELETE";

    if (canMerge) {

      last.end_date = current.end_date;

      /*
        Preserve original row id whenever possible
      */

      if (!last.id && current.id)
        last.id = current.id;

      /*
        UPDATE dominates NONE
      */

      if (
        last.action === "NONE" &&
        current.action !== "NONE"
      ) {
        last.action = current.action;
      }

      if (
        last.action === "ADD" &&
        current.action === "UPDATE"
      ) {
        last.action = "ADD";
      }

    }
    else {

      merged.push({ ...current });

    }

  });

  /*
      Add deleted rows back
  */

  allocations
    .filter(row => row.action === "DELETE")
    .forEach(row => merged.push(row));

  return merged;

};

export const groupDatesIntoRanges = (dates = []) => {

  if (!dates.length) return [];

  const sortedDates = [...dates].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const ranges = [];

  let start = sortedDates[0];
  let end = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {

    const prev = new Date(end);
    prev.setDate(prev.getDate() + 1);

    if (formatToApiDate(prev) === sortedDates[i]) {

      end = sortedDates[i];

    }
    else {

      ranges.push({
        start_date: start,
        end_date: end
      });

      start = sortedDates[i];
      end = sortedDates[i];

    }

  }

  ranges.push({
    start_date: start,
    end_date: end
  });

  return ranges;

};

const parseComparable = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatComparable = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

/** Local, timezone-safe replacement for generateDatesBetween that stays in YYYY-MM-DD. */
export const datesBetweenComparable = (startStr, endStr) => {
  if (!startStr || !endStr) return [];
  const dates = [];
  let cur = parseComparable(startStr);
  const end = parseComparable(endStr);
  while (cur <= end) {
    dates.push(formatComparable(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
  return dates;
};

/**
 * SINGLE SOURCE OF TRUTH MODEL
 * -----------------------------------------------------------------------
 * workingAllocations  -> current UI state, NO action/status flags on it.
 * originalAllocations -> frozen snapshot of what's actually in the DB,
 *                         loaded once per loadAllData() call.
 *
 * ADD / UPDATE / DELETE are computed by diffing the two, never stored.
 * A row's id === null means "never existed in DB" -> always becomes ADD
 * or simply disappears if removed (no DELETE payload possible for it).
 * A row's id !== null means "tied to a DB record" -> UPDATE if changed,
 * DELETE if its id is missing from workingAllocations entirely.
 * -----------------------------------------------------------------------
 */

const addDays = (dateStr, n) => {
  const d = parseComparable(dateStr);
  d.setDate(d.getDate() + n);
  return formatComparable(d);
};

const isNextDay = (a, b) => {
  const diff = (parseComparable(b) - parseComparable(a)) / (1000 * 60 * 60 * 24);
  return diff === 1;
};

/** Map: emp_id -> { 'YYYY-MM-DD': original_db_id } based on the DB snapshot. */
export const buildOwnershipMap = (originalAllocations) => {
  const map = {};
  originalAllocations.forEach((row) => {
    if (!map[row.emp_id]) map[row.emp_id] = {};
    datesBetweenComparable(row.start_date, row.end_date).forEach((d) => {
      map[row.emp_id][d] = row.id;
    });
  });
  return map;
};

/**
 * Given the full set of dates an employee should be active on, rebuilds
 * their rows as contiguous ranges, cutting at any date whose "owner id"
 * (per the DB snapshot) changes. This is what keeps ids attached to the
 * correct portion of a range no matter how many times it's been toggled.
 */
export const recomputeEmployeeRows = ({
  empId,
  activeDates,
  ownershipMap,
  employeeMeta,
  existingRowsForEmp,
}) => {
  const sortedDates = [...new Set(activeDates)].sort();
  if (sortedDates.length === 0) return [];

  const ownerOf = (d) => ownershipMap[empId]?.[d] ?? null;

  const byId = {};
  existingRowsForEmp.forEach((r) => {
    if (r.id != null) byId[r.id] = r;
  });
  const fallback = existingRowsForEmp[0] || employeeMeta;

  const rows = [];
  let segStart = sortedDates[0];
  let segOwner = ownerOf(segStart);
  let prev = segStart;

  const pushSeg = (start, end, owner) => {
    const base = (owner != null && byId[owner]) || fallback;
    rows.push({
      rowKey: owner != null ? `existing_${owner}` : crypto.randomUUID(),
      id: owner,
      emp_id: empId,
      employee_name: base.employee_name || employeeMeta.employee_name,
      emp_type: base.emp_type || employeeMeta.emp_type,
      remarks: base.remarks || "",
      contract_rate: base.contract_rate ?? employeeMeta.contract_rate ?? 0,
      start_date: start,
      end_date: end,
      is_approved: !!base.is_approved,
    });
  };

  for (let i = 1; i < sortedDates.length; i++) {
    const d = sortedDates[i];
    const owner = ownerOf(d);
    if (isNextDay(prev, d) && owner === segOwner) {
      prev = d;
      continue;
    }
    pushSeg(segStart, prev, segOwner);
    segStart = d;
    segOwner = owner;
    prev = d;
  }
  pushSeg(segStart, prev, segOwner);

  return rows;
};

/**
 * Splits a single row at targetDate.
 * mode 'EDIT'   -> isolates targetDate into its own editable row.
 * mode 'DELETE' -> drops targetDate entirely.
 *
 * Rule (Option B, per spec): ONLY the portion before targetDate can keep
 * the original id and becomes an UPDATE. Everything from targetDate
 * onward is treated as new (id:null) and becomes an ADD. If nothing is
 * before targetDate, the id simply vanishes from workingAllocations,
 * which buildPayloads() will correctly turn into a DELETE.
 */
export const splitRangeAtDate = (row, targetDate, mode) => {

  if (row.start_date === row.end_date && row.start_date === targetDate) {
    if (mode === "DELETE") return [];
    return [{ ...row, __isEditTarget: true }]; // same id, same rowKey, just flagged for edit
  }

  const segments = [];
  const hasBefore = targetDate > row.start_date;
  const hasAfter = targetDate < row.end_date;

  if (hasBefore) {
    segments.push({
      ...row,
      id: row.id,
      rowKey: row.id != null ? `existing_${row.id}` : crypto.randomUUID(),
      end_date: addDays(targetDate, -1),
    });
  }

  if (mode === "EDIT") {
    segments.push({
      ...row,
      id: null,
      rowKey: crypto.randomUUID(),
      start_date: targetDate,
      end_date: targetDate,
      __isEditTarget: true,
    });
  }
  // mode === 'DELETE': targetDate is simply omitted, no segment pushed.

  if (hasAfter) {
    segments.push({
      ...row,
      id: null,
      rowKey: crypto.randomUUID(),
      start_date: addDays(targetDate, 1),
    });
  }

  return segments;
};

/**
 * Auto-merge pass: run after any mutation so adjacent same-employee rows
 * with identical fields collapse back into one continuous range.
 * Only one row per employee-run can carry a real id.
 */
export const mergeAdjacentRows = (allocations) => {
  const byEmp = {};
  allocations.forEach((r) => {
    if (!byEmp[r.emp_id]) byEmp[r.emp_id] = [];
    byEmp[r.emp_id].push(r);
  });

  const merged = [];
  Object.values(byEmp).forEach((rows) => {
    const sorted = [...rows].sort((a, b) => a.start_date.localeCompare(b.start_date));
    let current = null;
    sorted.forEach((row) => {
      const sameRate = Number(current?.contract_rate ?? 0) === Number(row.contract_rate ?? 0);
      const sameFields =
        current &&
        isNextDay(current.end_date, row.start_date) &&
        current.emp_type === row.emp_type &&
        (current.remarks || "") === (row.remarks || "") &&
        sameRate &&
        (current.id == null || row.id == null || current.id === row.id);

      if (sameFields) {
        const keepId = current.id ?? row.id;
        current = {
          ...current,
          id: keepId,
          end_date: row.end_date,
          rowKey: keepId != null ? `existing_${keepId}` : current.rowKey,
        };
      } else {
        if (current) merged.push(current);
        current = { ...row };
      }
    });
    if (current) merged.push(current);
  });
  return merged;
};

/** Status is only ever used for UI badges — never stored. */
export const getRowStatus = (row, originalById) => {
  if (row.id == null) return "ADD";
  const original = originalById[row.id];
  if (!original) return "ADD";
  const changed =
    row.start_date !== original.start_date ||
    row.end_date !== original.end_date ||
    row.emp_type !== original.emp_type ||
    (row.remarks || "") !== (original.remarks || "") ||
    Number(row.contract_rate ?? 0) !== Number(original.contract_rate ?? 0);
  return changed ? "UPDATE" : "ORIGINAL";
};

/** The actual diff. This is the only place ADD/UPDATE/DELETE get decided. */
// export const buildPayloads = (workingAllocations, originalAllocations) => {
//   const originalById = {};
//   originalAllocations.forEach((r) => {
//     originalById[r.id] = r;
//   });

//   const unclaimedOriginalsByKey = {};
//   originalAllocations.forEach((r) => {
//     unclaimedOriginalsByKey[`${r.emp_id}|${r.start_date}|${r.end_date}`] = r;
//   });

//   const addPayload = [];
//   const updatePayload = [];
//   const unchangedPayload = [];
//   const seenIds = new Set();

//   workingAllocations.forEach((row) => {
//     const rateNum = Number.isFinite(Number(row.contract_rate)) ? Number(row.contract_rate) : 0;

//     if (row.id == null) {
//       addPayload.push({
//         emp_id: row.emp_id,
//         emp_type: row.emp_type,
//         start_date: DateForApiFormate(row.start_date),
//         end_date: DateForApiFormate(row.end_date),
//         remarks: row.remarks || "",
//         contract_rate: rateNum,
//       });
//       return;
//     }

//     seenIds.add(row.id);
//     const original = originalById[row.id];
//     if (!original) return; // defensive: id present but not in snapshot

//     const changed =
//       row.start_date !== original.start_date ||
//       row.end_date !== original.end_date ||
//       row.emp_type !== original.emp_type ||
//       (row.remarks || "") !== (original.remarks || "") ||
//       Number(row.contract_rate ?? 0) !== Number(original.contract_rate ?? 0);

//     if (changed) {
//       updatePayload.push({
//         id: row.id,
//         emp_id: row.emp_id,
//         emp_type: row.emp_type,
//         start_date: DateForApiFormate(row.start_date),
//         end_date: DateForApiFormate(row.end_date),
//         remarks: row.remarks || "",
//         contract_rate: rateNum,
//         is_updated: true,
//       });
//     } else {
//       // NEW — unchanged, but backend needs it present to count toward active TL/EX
//       unchangedPayload.push({
//         id: row.id,
//         emp_id: row.emp_id,
//         emp_type: row.emp_type,
//       });
//     }
//   });

//   const deletePayload = originalAllocations
//     .filter((o) => !seenIds.has(o.id))
//     .map((o) => ({ id: o.id, is_deleted: true, emp_type: o.emp_type }));

//   return { addPayload, updatePayload, deletePayload, unchangedPayload };
// };

export const buildPayloads = (workingAllocations, originalAllocations) => {
  const originalById = {};
  originalAllocations.forEach((r) => {
    originalById[r.id] = r;
  });

  // NEW — fallback lookup for rows that lost their id but still match an
  // original by emp/date-range. Prevents a false ADD+DELETE pair.
  const unclaimedOriginalsByKey = {};
  originalAllocations.forEach((r) => {
    unclaimedOriginalsByKey[`${r.emp_id}|${r.start_date}|${r.end_date}`] = r;
  });

  const addPayload = [];
  const updatePayload = [];
  const unchangedPayload = [];
  const seenIds = new Set();

  workingAllocations.forEach((row) => {
    const rateNum = Number.isFinite(Number(row.contract_rate)) ? Number(row.contract_rate) : 0;

    let effectiveId = row.id;

    // NEW — id missing but this row still matches an original 1:1 on
    // emp_id + dates → it's an edit (e.g. contract_rate), not a new row.
    if (effectiveId == null) {
      const recovered = unclaimedOriginalsByKey[`${row.emp_id}|${row.start_date}|${row.end_date}`];
      if (recovered && !seenIds.has(recovered.id)) {
        effectiveId = recovered.id;
      }
    }

    if (effectiveId == null) {
      addPayload.push({
        emp_id: row.emp_id,
        emp_type: row.emp_type,
        start_date: DateForApiFormate(row.start_date),
        end_date: DateForApiFormate(row.end_date),
        remarks: row.remarks || "",
        contract_rate: rateNum,
      });
      return;
    }

    seenIds.add(effectiveId);
    const original = originalById[effectiveId];
    if (!original) return; // defensive: id present but not in snapshot

    const changed =
      row.start_date !== original.start_date ||
      row.end_date !== original.end_date ||
      row.emp_type !== original.emp_type ||
      (row.remarks || "") !== (original.remarks || "") ||
      Number(row.contract_rate ?? 0) !== Number(original.contract_rate ?? 0);

    if (changed) {
      updatePayload.push({
        id: effectiveId,
        emp_id: row.emp_id,
        emp_type: row.emp_type,
        start_date: DateForApiFormate(row.start_date),
        end_date: DateForApiFormate(row.end_date),
        remarks: row.remarks || "",
        contract_rate: rateNum,
        is_updated: true,
      });
    } else {
      unchangedPayload.push({
        id: effectiveId,
        emp_id: row.emp_id,
        emp_type: row.emp_type,
      });
    }
  });

  const deletePayload = originalAllocations
    .filter((o) => !seenIds.has(o.id))
    .map((o) => ({ id: o.id, is_deleted: true, emp_type: o.emp_type }));

  return { addPayload, updatePayload, deletePayload, unchangedPayload };
};

export const generateDateRange = (startDate, endDate, { format = false, maxDays = 366 } = {}) => {
  const dates = [];

  const startComparable = DateForApiFormate(startDate, true);
  const endComparable = DateForApiFormate(endDate, true);

  if (!startComparable || !endComparable) return dates;

  const [sY, sM, sD] = startComparable.split("-").map(Number);
  const [eY, eM, eD] = endComparable.split("-").map(Number);

  const current = new Date(sY, sM - 1, sD);
  const last = new Date(eY, eM - 1, eD);

  let limit = 0;

  while (current <= last && limit < maxDays) {
    dates.push(format ? formatToApiDate(current) : new Date(current));
    current.setDate(current.getDate() + 1);
    limit++;
  }

  return dates;
};

export const useDateWiseAssignments = ({ activityStart, activityEnd, allocations = [], originalById = {}, getRowStatus, }) => {
  const activityDates = useMemo(() => generateDateRange(activityStart, activityEnd),
    [activityStart, activityEnd]
  );

  const dateWiseAssignments = useMemo(() => {
    const map = {};
    activityDates.forEach((date) => { map[formatToApiDate(date)] = []; });

    allocations.forEach((row) => {
      const rowDates = generateDateRange(row.start_date, row.end_date, { format: true });
      rowDates.forEach((date) => {
        if (map[date]) {
          map[date].push({
            ...row, date, status: getRowStatus(row, originalById),
          });
        }
      });
    });

    return map;
  }, [allocations, activityDates, originalById, getRowStatus,]);

  return { activityDates, dayWindow: activityDates, dateWiseAssignments, };
};

export const getGroupStatus = (groupedData = []) => {
  if (!groupedData.length) {
    return {
      activityStatus: "NS",
      statusDisplay: "Not Planned",
    };
  }

  const statuses = groupedData.map(
    (item) => item?.activityStatus
  );

  // If any item is still Not Planned / Not Started
  if (statuses.includes("NS")) {
    return {
      activityStatus: "NS",
      statusDisplay: "Not Planned",
    };
  }

  // If any item is only at Plan Submitted
  if (statuses.includes("PS")) {
    return {
      activityStatus: "PS",
      statusDisplay: "Plan Submitted",
    };
  }

  // If any item is only at Plan Approved
  if (statuses.includes("PA")) {
    return {
      activityStatus: "PA",
      statusDisplay: "Plan Approved",
    };
  }

  // If any item is In Progress
  if (statuses.includes("P")) {
    return {
      activityStatus: "P",
      statusDisplay: "In Progress",
    };
  }

  // If any item has Actual Submitted
  if (statuses.includes("AS")) {
    return {
      activityStatus: "AS",
      statusDisplay: "Actual Submitted",
    };
  }

  // If any item has Actual Approved
  if (statuses.includes("AA")) {
    return {
      activityStatus: "AA",
      statusDisplay: "Actual Approved",
    };
  }

  // All items completed
  if (statuses.every((status) => status === "C")) {
    return {
      activityStatus: "C",
      statusDisplay: "Completed",
    };
  }

  return {
    activityStatus: "NS",
    statusDisplay: "Not Planned",
  };
};

export const groupByOrderItemId = (data = [], resourcePlannedList = []) => {
  const grouped = data.reduce((acc, item) => {
    const key = item.order_item_id;

    if (!acc[key]) {
      acc[key] = {
        order_item_id: key,
        order_item_key: item.order_item_key || "--",
        product_name: item.product_name || "--",
        customer_name: item.customer_name || "--",

        // Used for search
        store_name: "",
        audit_type: "",
        planned_start_date: item.planned_start_date,
        planned_end_date: item.planned_end_date,

        total_planned_item: 0,
        grouped_data: [],
      };
    }

    // Each grouped record = one planned item
    acc[key].total_planned_item += 1;

    // Keep these searchable from parent group
    acc[key].store_name += ` ${item.store_name || ""}`;
    acc[key].audit_type += ` ${item.audit_type || ""}`;

    if (
      item.planned_start_date &&
      (!acc[key].planned_start_date ||
        new Date(item.planned_start_date) <
        new Date(acc[key].planned_start_date))
    ) {
      acc[key].planned_start_date = item.planned_start_date;
    }

    // Get overall latest end date
    if (
      item.planned_end_date &&
      (!acc[key].planned_end_date ||
        new Date(item.planned_end_date) >
        new Date(acc[key].planned_end_date))
    ) {
      acc[key].planned_end_date = item.planned_end_date;
    }

    acc[key].grouped_data.push(item);

    return acc;
  }, {});

  return Object.values(grouped).map((group) => {
    const groupStatus = getGroupStatus(group.grouped_data, resourcePlannedList);

    return {
      ...group,
      ...groupStatus,
    };
  });
};

export const extractOrderNumber = (orderItemId, keepLeadingZeros = false) => {
  if (!orderItemId) return "";

  const str = String(orderItemId);

  const digits = str.replace(/\D/g, '');

  if (!digits) return "";

  return keepLeadingZeros ? digits : parseInt(digits, 10).toString();
};