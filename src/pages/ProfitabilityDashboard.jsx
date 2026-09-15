import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import { currency, formatMonthLabel, formatToDDMMYYYY, getMonthRange, getStatusVariant, groupByOrderItemId, matchClaimsToActivity,} from "../utils/utils";
import styled from "styled-components";
import { useActivity } from "../context/ActivityClaimContext";
import Button from "../components/Button";
import { toast } from "react-toastify";
import {FaBoxes, FaCheckCircle, FaEye, FaFileContract, FaFileDownload, FaWallet,} from "react-icons/fa";
import StatsCard from "../components/StatsCard";
import DataTable, { Td } from "../components/DataTable";
import Badge from "../components/Badge";
import PaginationComponent from "../components/Pagination";
import { useFilter } from "../hooks/useFilter";
import { usePagination } from "../hooks/usePagination";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import { ExcelBuilder, ProfitabilityDashboardColumns } from "../ExcelFormate/ProfitabilityDashboard/ExcelBuilder";
import { theme } from "../styles/Theme";

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

const Tagline = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: inherit;
  line-height: 1.3;
`;

const OrderItemId = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  font-family: monospace;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 0.2rem 0.2rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
`;

const StoreLocation = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  font-family: monospace;
  background: ${({ theme }) => theme.colors.accentLight};
  padding: 0.2rem 0.2rem;
  border-radius: 4px;
  display: inline-block;
  max-width: 150px; /* Adjust this value as needed */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.input`
  flex: 1;
  padding: ${({ theme }) => { theme.spacing.sm }} ${({ theme }) => { theme.spacing.md }};
  border: 1px solid ${({ theme }) => { theme.colors.border }};
  border-radius: ${({ theme }) => { theme.borderRadius.md }};
  font-family: ${({ theme }) => { theme.fonts.body }};
  font-size: ${({ theme }) => { theme.fontSizes.sm }};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => { theme.colors.primary }};
  }
  
  &::placeholder {
    color: ${({ theme }) => { theme.colors.textLight }};
  }
`;

const RateCell = styled.div`
  display: flex;
  /* justify-content: flex-end; */
  gap: ${({ theme }) => theme.spacing.sm};
  padding-right: ${({ theme }) => theme.spacing.md};
`;

const RateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const RateBoxActual = styled(RateBox)`
  background: ${({ theme }) => theme.colors.primaryLight};
  border-color: ${({ theme }) => theme.colors.primary};
`;

const BoxAmount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const BoxMetrics = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MetricLabel = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const MetricValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const RECEIVABLE_LIST_STORAGE_KEY = "ReceivableListSelection";

const ProfitabilityDashboard = () => {
  const navigate = useNavigate();
  const emp_id = localStorage.getItem("cust_emp_id");
  const { activityState, fetchEmpActivityAllocations, fetchContractAllocations, getStoredActivityListSelection, fetchClaims, fetchEmployees } = useActivity();
  const storedSelection = getStoredActivityListSelection ? getStoredActivityListSelection(RECEIVABLE_LIST_STORAGE_KEY) || {} : {};
  const { data: assignedActivity, loading, } = activityState;
  const [claimList, setClaimList] = useState([]);
  const [resourcePlannedList, setResourcePlannedList] = useState([]);
  const [filter, setFilter] = useState(() => storedSelection?.filter || { search: "", status: "" });
  const [offset, setOffset] = useState(storedSelection?.offset || 0);
  const [selectedActivityStatus, setSelectedActivityStatus] = useState(storedSelection?.selectedActivityStatus || ["AS", "AA", "PS", "PA", "P"]);
  const [claimStatusFilter, setClaimStatusFilter] = useState(null);

  const lastFetchedRangeRef = useRef(null);
  const mountedRef = useRef(false);
  const prevMonthKeyRef = useRef(null);
  
  const [dateRange, setDateRange] = useState(() => {
    const savedRange = storedSelection?.dateRange;
    if (savedRange?.start && savedRange?.end) {
      return savedRange;
    }
    return getMonthRange({ type: "month" });
  });

  const getAuditAllocationData = async (startOverride, endOverride) => {
    const start = startOverride || dateRange.start;
    const end = endOverride || dateRange.end;

    if (!start || !end) return;

    const key = `${start}|${end}`;
    if (lastFetchedRangeRef.current === key) return;
    lastFetchedRangeRef.current = key;

    const payload = {
      emp_id: emp_id,
      start_date: formatToDDMMYYYY(start),
      end_date: formatToDDMMYYYY(end),
    };
    try {
      const resourceData = await fetchContractAllocations(payload);
      const filteredData = resourceData.filter((data) => data.is_active)
      setResourcePlannedList(filteredData);
      await fetchEmpActivityAllocations(payload, filteredData);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch activity allocations",
      );
    }
  };

  const fetchProfileAndClaims = useCallback(async () => {
    if (!emp_id) return;
    try {
      const profileList = await fetchEmployees({ emp_id });
      const profile = profileList?.[0] || {};
      if (!profile.id) {
        setClaimList([]);
        return;
      }
      const fetchedClaims = await fetchClaims("GET", profile.id, "CY");
      setClaimList(fetchedClaims || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load claims");
      setClaimList([]);
    }
  }, [emp_id, fetchEmployees, fetchClaims]);

  useEffect(() => {
    if (emp_id && dateRange?.start && dateRange?.end) {
      getAuditAllocationData();
    }
  }, [dateRange?.start, dateRange?.end, emp_id]);

  useEffect(() => {
    if (emp_id) {
      fetchProfileAndClaims();
    }
  }, [emp_id, fetchProfileAndClaims]);

  // console.log("groupedDataWithClaims", groupedDataWithClaims);

const handleNavigate = (direction) => {
  // direction = -1 (prev) or +1 (next)

  // 1. Figure out how many months the currently displayed range is away from today
  const today = new Date();
  const currentStart = dateRange?.start ? new Date(dateRange.start) : today;

  const monthsFromToday =
    (currentStart.getFullYear() - today.getFullYear()) * 12 +
    (currentStart.getMonth() - today.getMonth());

  // 2. Apply the step
  const newOffset = monthsFromToday + direction;

  // 3. Let the existing helper do the work
  const range = getMonthRange({
    type: "current",
    mode: "month",
    offset: newOffset,
  });

  setOffset(newOffset);
  setDateRange(range);
  getAuditAllocationData(range.start, range.end);
};

const handleClearFilters = () => {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RECEIVABLE_LIST_STORAGE_KEY);
  }

  setFilter({ search: "", status: "ALL" });
  setSelectedActivityStatus(["AS", "AA", "PS", "PA", "P"]);
  setClaimStatusFilter(null);
  handlePageChange?.(1);
  // dateRange & offset stay the same → no API call
};

const handleResetMonth = () => {
  const current = getMonthRange({ type: "current", mode: "month", offset: 0 });
  setOffset(0);
  setDateRange(current);
};


    // Persist selection to sessionStorage so user returns to same view
    useEffect(() => {
      if (typeof window === "undefined") return;

        window.sessionStorage.setItem(
          RECEIVABLE_LIST_STORAGE_KEY,
          JSON.stringify({ dateRange, offset, filter, selectedActivityStatus })
        );
    }, [dateRange, offset, filter, selectedActivityStatus]);

  const groupedData = groupByOrderItemId(assignedActivity, resourcePlannedList);

  const getActivityDataByStatus = useCallback((statuses) => {
    const statusList = Array.isArray(statuses) ? statuses : [statuses];
    return groupedData.filter((group) => statusList.includes(group.activityStatus)).map((group) => {
        const matchedClaims = matchClaimsToActivity(claimList, group);

        let totalOPE = 0;
        let totalSettlement = 0;

        matchedClaims.forEach((claim) => {
          (claim.claim_items || []).forEach((ci) => {
            const expense = Number(
              ci.expense_amt ?? ci.claim_amt ?? ci.amount ?? 0
            );

            const settlement = Number(ci.settlement_amt ?? 0);

            totalOPE += expense;
            totalSettlement += expense - settlement;
          });
        });

        return {
          ...group,
          claims: matchedClaims,
          hasClaim: matchedClaims.length > 0,
          totalOPE,
          totalSettlement,
        };
      });
  },
  [groupedData, claimList]
);

  const processResourcePlanned = (group) => {
    const allAEntryIds = new Set();
    (group.grouped_data || []).forEach((item) => {
      (item.allAEntries || []).forEach((entry) => {
        if (entry?.id != null) allAEntryIds.add(String(entry.id));
      });
    });

    let actualContractRate = 0;
    let actualApprovedContractRate = 0;
    let plannedContractRate = 0;
    let actualCpRate = 0;
    let plannedCpRate = 0;
    let actualTL = 0;
    let actualEx = 0;
    let plannedTL = 0;
    let plannedEx = 0;
    let plannedTLRate = 0;
    let plannedExRate = 0;

    (group.resource_planned || []).forEach((rp) => {
      const rpId = String(
        rp.allocation_id ?? rp.id ?? rp.activity_id ?? rp.a_entry_id ?? ""
      );
      const empType = String(rp.emp_type ?? "").toUpperCase();
      const days = getDays(rp.start_date, rp.end_date);
      const rate = Number(rp.contract_rate ?? rp.contart_rate ?? 0);
      const amount = rate * days;
      const isActual = allAEntryIds.has(rpId);

      if (isActual) {
        actualContractRate += amount;
        if (rp.is_approve === true || rp.is_approved === true) {
          actualApprovedContractRate += amount;
        }
        if (empType === "T") actualTL += days;
        else if (empType === "E") actualEx += days;
      }
      //  else {
      //   // plannedContractRate += amount;
      //   if (empType === "T") plannedTL += days;
      //   else if (empType === "E") plannedEx += days;
      // }
    });

    const firstItem = (group.grouped_data || [])[0];
    const retainers = firstItem?.original_P?.retainer_list || [];
    const myRetainers = retainers.filter((r) => {
    const retainerEmpId = String(r.emp_id ?? ""); return retainerEmpId === String(emp_id);
     });
    myRetainers
      // .filter((r) => String(r.a_type || "").toUpperCase() === "P")
      .forEach((r) => {
        const days = getDays(r.start_date, r.end_date);
        const aType = String(r.a_type || "").toUpperCase();
        const tlCount = Number(r.tl_count ?? 0);
        const tlRate = Number(r.tl_rate ?? 0);
        const exCount = Number(r.ex_count ?? 0);
        const exRate = Number(r.ex_rate ?? 0);

        const systemAmt = days * (tlCount * tlRate + exCount * exRate);

        const cpRateValue = Number(r.cp_rate ?? 0);
        const finalRate = cpRateValue > 0 ? cpRateValue : systemAmt;

    if (aType === "P") {
      plannedCpRate += finalRate;
      plannedTL += tlCount * days;
      plannedEx += exCount * days;
      plannedContractRate += systemAmt;
      plannedTLRate = tlRate;
      plannedExRate = exRate;
    } else if (aType === "A") {
      actualCpRate += finalRate;
    }
    });

    return {
      actualContractRate,
      actualApprovedContractRate,
      plannedContractRate,
      actualCpRate,
      plannedCpRate,
      actualTL,
      actualEx,
      plannedTL,
      plannedEx,
      plannedTLRate,
      plannedExRate,
    };
  };

  const processClaims = (claims = []) => {
    let totalClaimAmount = 0;
    let totalClaimSettlement = 0;
    let totalClaimApproved = 0;
    let totalClaimNotSubmitted = 0;
    let totalClaimSubmitted = 0;

    claims.forEach((claim) => {
      (claim.claim_items || []).forEach((ci) => {
        const expense = Number(ci.expense_amt ?? ci.claim_amt ?? ci.amount ?? 0);
        const settlement = Number(ci.settlement_amt ?? 0);
        const status = String(ci.expense_status ?? "").toUpperCase();

        totalClaimAmount += expense;
        totalClaimSettlement += settlement;

        if (status === "A") totalClaimApproved += expense;
        else if (status === "N") totalClaimNotSubmitted += expense;
        else totalClaimSubmitted += expense;
      });
    });

    return {
      totalClaimAmount,
      totalClaimSettlement,
      totalClaimApproved,
      totalClaimNotSubmitted,
      totalClaimSubmitted,
    };
  };


  //For stats card calculate amount
  const getOverallClaimTotals = (groupedDataWithClaims = []) => {
  const totals = {
    totalClaimAmount: 0,
    totalClaimSettlement: 0,
    totalClaimApproved: 0,
    totalClaimNotSubmitted: 0,
    totalClaimSubmitted: 0,
    totalActualContractRate: 0,          // actual only
    totalApprovedContractRate: 0,  // actual approved only
    totalPendingContractRate: 0,   // planned only
    totalActualCpRate: 0,  
    totalPlannedCpRate: 0, 
  };

    groupedDataWithClaims.forEach((group) => {
    const claims = processClaims(group.claims);
    Object.keys(claims).forEach((k) => (totals[k] += claims[k]));

    const rp = processResourcePlanned(group);
    totals.totalActualContractRate += rp.actualContractRate;
    totals.totalApprovedContractRate += rp.actualApprovedContractRate;
    totals.totalPendingContractRate += rp.plannedContractRate;
    totals.totalActualCpRate += rp.actualCpRate;
    totals.totalPlannedCpRate += rp.plannedCpRate;
    });

    return totals;
  };

  //for Calculate total rate, TL, EX, claim amount
  const getGroupClaimTotals = (group) => {
    const claims = processClaims(group.claims);
    const rp = processResourcePlanned(group);

    return {
      ...claims,
      totalSettlement: claims.totalClaimSettlement, // keep old name for compatibility
      totalPending: 0, // unused – kept for API stability
      totalActualContractRate: rp.actualContractRate,
      totalPendingContractRate: rp.plannedContractRate,
      totalTL: rp.actualTL,
      totalEx: rp.actualEx,
      totalTLPending: rp.plannedTL,
      totalExPending: rp.plannedEx,
      plannedTLRate: rp.plannedTLRate,
      plannedExRate: rp.plannedExRate,
      plannedCpRate: rp.plannedCpRate,
      actualCpRate: rp.actualCpRate,
    };
  };

  const activityFiltered = useMemo(
  () => getActivityDataByStatus(selectedActivityStatus),
  [getActivityDataByStatus, selectedActivityStatus]
);

  const dataAfterClaimFilter = useMemo(() => {
  if (!claimStatusFilter) return activityFiltered;

  return activityFiltered.filter((group) => {
    const hasApproved = (group.claims || []).some((ci) => String(ci.expense_status || "").toUpperCase() === "A"
      // (c.claim_items || []).some(
        // (ci) => String(ci.expense_status || "").toUpperCase() === "A"
      // )
    );
    const hasSubmitted = (group.claims || []).some((c) =>
      (c.claim_items || []).some((ci) => {
        const s = String(ci.expense_status || "").toUpperCase();
        return s === "S" || (s !== "A" && s !== "N");
      })
    );

    if (claimStatusFilter === "approved") return hasApproved;
    if (claimStatusFilter === "submitted") return hasSubmitted;
    return true;
  });
}, [activityFiltered, claimStatusFilter]);

  const FilteredData = useFilter({
    data: dataAfterClaimFilter,
    fields: [
      "customer_name",
      "order_item_key",
      "product_name",
      "store_name",
      "audit_type",
    ],
    search: filter.search,
    extraFilters: {
      activityStatus: filter.status,
    },
  });

  // const sortedFilteredData = useMemo(() => {
  //   return [...FilteredData].sort((a, b) => {
  //     // 1. NS status always comes first
  //     if (a.activityStatus === "AS" && b.activityStatus !== "AS") return -1;
  //     if (a.activityStatus !== "AS" && b.activityStatus === "AS") return 1;

  //     // 2. Within same status priority, latest start date first
  //     const dateA = new Date(a.planned_start_date);
  //     const dateB = new Date(b.planned_start_date);

  //     return dateB - dateA;
  //   });
  // }, [FilteredData]);

  const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange,} = usePagination(FilteredData, 10);

  useEffect(() => {
  const monthKey = dateRange?.start
    ? (() => {
        const d = new Date(dateRange.start);
        return `${d.getFullYear()}-${d.getMonth() + 1}`;
      })()
    : "";

  if (!mountedRef.current) {
    mountedRef.current = true;
    prevMonthKeyRef.current = monthKey;
    return; // first render – do nothing
  }

  if (prevMonthKeyRef.current && monthKey && prevMonthKeyRef.current !== monthKey) {
    // real month change by user → clear filters, keep the new dateRange
    setFilter({ search: "", status: "ALL" });
    setSelectedActivityStatus(["AS", "AA", "PS", "PA", "P"]);
    setClaimStatusFilter(null);
    handlePageChange?.(1);
  }

  prevMonthKeyRef.current = monthKey;
}, [dateRange?.start]);

  const asData = getActivityDataByStatus(["AS", "AA"]);
  const asTotals = getOverallClaimTotals(asData);

  
  const plannedData = getActivityDataByStatus(["PS", "PA", "P"]);
  const plannedTotals = getOverallClaimTotals(plannedData);


  const applyActivityFilter = (statuses) => {
    setSelectedActivityStatus(statuses);
    setFilter((prev) => ({ ...prev, search: "", status: "ALL" }));
    handlePageChange?.(1);          // safe optional call
  };

  const applyClaimFilter = (type) => {
    setClaimStatusFilter(type);
    setFilter((prev) => ({ ...prev, search: "", status: "ALL" }));
    handlePageChange?.(1);
  };

  // console.log("asTotals", asTotals)
  // console.log("plannedTotals", plannedTotals)

  const statsCard = [
    {
      label: "Total Revenue Amount",
      value: currency(
      //  (asTotals.totalActualContractRate || 0) + (asTotals.totalClaimApproved || 0) + (plannedTotals.totalActualContractRate || 0) + (((plannedTotals.totalPendingContractRate || 0) - ((plannedTotals.totalActualContractRate || 0)) + (plannedTotals.totalClaimSubmitted || 0))) ,
      //  (asTotals.totalActualContractRate || 0) + (plannedTotals.totalActualContractRate || 0) + ((plannedTotals.totalPendingContractRate || 0) + (asTotals.totalPendingContractRate || 0)) - ((plannedTotals.totalActualContractRate || 0) + (asTotals.totalActualContractRate || 0)) + ((asTotals.totalClaimApproved || 0) + (asTotals.totalClaimSubmitted || 0)) + ((plannedTotals.totalClaimApproved || 0) + (plannedTotals.totalClaimSubmitted || 0))),
      (asTotals.totalActualCpRate || 0) +
      (plannedTotals.totalActualCpRate || 0) +
      ((plannedTotals.totalPlannedCpRate || 0) + (asTotals.totalPlannedCpRate || 0)) -
      ((plannedTotals.totalActualCpRate || 0) + (asTotals.totalActualCpRate || 0)) +
      ((asTotals.totalClaimApproved || 0) + (asTotals.totalClaimSubmitted || 0)) +
      ((plannedTotals.totalClaimApproved || 0) + (plannedTotals.totalClaimSubmitted || 0))
    ),
      color: "warning",
      icon: <FaWallet />,
      sections: [
        {
          items: [
            // { label: "Approved", value: currency(((asTotals.totalActualContractRate || 0) + (plannedTotals.totalActualContractRate || 0)) + (asTotals.totalClaimApproved + plannedTotals.totalClaimApproved)), status: "success", subStatus: "actual" },
            { label: "Approved", value: currency(((asTotals.totalActualCpRate || 0) + (plannedTotals.totalActualCpRate || 0)) + (asTotals.totalClaimApproved + plannedTotals.totalClaimApproved)), status: "success", subStatus: "actual" },
            // { label: "Plan", value: currency(((plannedTotals.totalPendingContractRate || asTotals.totalPendingContractRate || 0) - (plannedTotals.totalActualContractRate || asTotals.totalActualContractRate || 0)) + (plannedTotals.totalClaimSubmitted || 0)), status: "info", subStatus: "plan" }
            // { label: "Pending", value: currency((((plannedTotals.totalPendingContractRate || 0) + (asTotals.totalPendingContractRate || 0)) - ((plannedTotals.totalActualContractRate || 0) + (asTotals.totalActualContractRate || 0))) + (asTotals.totalClaimSubmitted + plannedTotals.totalClaimSubmitted)), status: "info", subStatus: "plan" }
            { label: "Pending", value: currency((((plannedTotals.totalPlannedCpRate || 0) + (asTotals.totalPlannedCpRate || 0)) -
                ((plannedTotals.totalActualCpRate || 0) + (asTotals.totalActualCpRate || 0))) +
              (asTotals.totalClaimSubmitted + plannedTotals.totalClaimSubmitted)), status: "info", subStatus: "plan" }
          ]
        },
      ],  
      // onClick: () => applyActivityFilter(["AS", "AA", "PS", "PA", "P"]),
      onItemClick: (item) => {
        if (item.subStatus === "actual") applyActivityFilter(["AS", "AA"]);
        if (item.subStatus === "plan") applyActivityFilter(["PS", "PA", "P"]);
      },
    },
    {
      label: "Resource Amount",
      value: currency((asTotals.totalActualCpRate || 0) + (plannedTotals.totalActualCpRate || 0)),
      color: "info",
      icon: <FaFileContract />,
      sections: [
        {
          items: [
            { label: "Approved", value: currency((asTotals.totalActualCpRate || 0) + (plannedTotals.totalActualCpRate || 0)), status: "success", subStatus: "actual" },
            { label: "System Amt", value: currency((asTotals.totalActualContractRate || 0) + (plannedTotals.totalActualContractRate || 0)), status: "info", subStatus: "system" }
          ]
        },
      ], 
      onItemClick: (item) => {
        if (item.subStatus === "actual") applyActivityFilter(["AS", "AA"]);
        if (item.subStatus === "system") applyActivityFilter(["AS", "AA"]);
      },
    },
    {
      label: "Claim Amount",
      value: currency(((asTotals.totalClaimApproved || 0) + (asTotals.totalClaimSubmitted || 0)) + ((plannedTotals.totalClaimApproved || 0) + (plannedTotals.totalClaimSubmitted || 0))),
      color: "success",
      icon: <FaCheckCircle />,
      sections: [
        {
          items: [
            { label: "Approved", value: currency((asTotals.totalClaimApproved + plannedTotals.totalClaimApproved) || 0), status: "success", subStatus: "approved" },
            { label: "Pending", value: currency((asTotals.totalClaimSubmitted + plannedTotals.totalClaimSubmitted)  || 0), status: "info", subStatus: "submitted" }
          ]
        },
      ],
    // onClick: () => {
    //   setClaimStatusFilter(null);
    //   applyActivityFilter(["AS", "AA", "PS", "PA", "P"]);
    // },
    onItemClick: (item) => {
      if (item.subStatus === "approved") applyClaimFilter("approved") ; applyActivityFilter(["AS", "AA"]);
      if (item.subStatus === "submitted") applyClaimFilter("submitted"); applyActivityFilter(["AS", "AA"]);
    },
    },
    {
      label: "Total Audits",
      value: ((asData?.length || 0) + (plannedData?.length || 0)),
      color: "primary",
      icon: <FaBoxes />,
      sections: [
        {
          items: [
            { label: "Approved", value: asData?.length || 0, status: "success", subStatus: "actual" },
            { label: "Planned", value: plannedData?.length || 0, status: "info", subStatus: "plan" }
          ]
        },
      ],
      onClick: () => applyActivityFilter(["AS", "AA", "PS", "PA", "P"]),
      onItemClick: (item) => {
        if (item.subStatus === "actual") applyActivityFilter(["AS", "AA"]);
        if (item.subStatus === "plan") applyActivityFilter(["PS", "PA", "P"]);
      },
    },
  ];

  const allGroupedForExport = useMemo(() => [...asData, ...plannedData], [asData, plannedData]);

  const rows = allGroupedForExport.map((group) => {
    const totals = getGroupClaimTotals(group);
    const first = group.grouped_data?.[0] || {};
    const claim = group.claims?.[0];

    return {
      customer: group.customer_name,
      orderItemId: group.order_item_key,
      auditType: group.audit_type,
      storeLocation: group.store_name,
      activityStatus: ["AA", "AS"].includes(group.activityStatus) ? "Completed" : "Planned",
      startDate: first.actual_start_date || first.planned_start_date,
      endDate: first.actual_end_date || first.planned_end_date,
      // planRate: totals.totalPendingContractRate,
      planTL: totals.totalTLPending,
      tlRate: totals.plannedTLRate,
      planEX: totals.totalExPending,
      exRate: totals.plannedExRate,
      actualTL: totals.totalTL,
      actualEX: totals.totalEx,
      actualRate: totals.totalActualContractRate,
      payAble: totals.actualCpRate,
      claimStatus: getClaimStatusVariant(claim?.expense_status).label,
      claimAmount: totals.totalClaimApproved,
      total: totals.actualCpRate + totals.totalClaimApproved,
    };
  });

  return (
    <Layout title="Receivables Dashboard">
      <ClaimsHeader>
        <Tagline>View your monthly earnings and receivables summary.</Tagline>

          <div
            style={{
              marginTop: "0.5rem",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <Button
              variant="outline"
              size="sm"
              style={{ padding: "0.25rem 0.5rem" }}
              onClick={() => handleNavigate(-1)}
            >
              &lt; Prev
            </Button>
            <span>{formatMonthLabel(dateRange.start)}</span>
            <Button
              variant="outline"
              size="sm"
              style={{ padding: "0.25rem 0.5rem" }}
              onClick={() => handleNavigate(1)}
            >
              Next &gt;
            </Button>
          </div>
      </ClaimsHeader>

      <StatsGrid>
        {statsCard.map((stats) => (
          <StatsCard
            label={stats.label}
            value={stats.value}
            icon={stats.icon}
            color={stats.color}
            onClick={stats.onClick}
            sections={stats.sections} onItemClick={(item) => { stats.onItemClick(item); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) }}
          />
        ))}
      </StatsGrid>

<Card>
  				<FilterRow style={{ marginBottom: "1rem" }}>
					<SearchBox type="text" placeholder="Search customer name, audit type, location, order item id ..." value={filter.search} onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value, }))} />

          {/* <FilterSelect
            name="status"
            value={Array.isArray(filter.status) ? "" : filter.status}
            onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
          >
						<option value="ALL">All</option>
						<option value="NA">Not Assigned</option>
						<option value="P">In Progress</option>
						<option value="C">Completed</option>
						<option value="NS">Not Started</option>
					</FilterSelect> */}

					<Button variant="outline" size='sm' onClick={handleClearFilters}>Clear Filters</Button>
          <Button variant="outline" size="sm" onClick={handleResetMonth}> Reset Month </Button>
				</FilterRow>
      <DataTable
        columns={column}
        data={paginatedData}
          isLoading={loading}
        renderRow={(group) => {
          // const claims = Array.isArray(employee.claims) ? employee.claims : [];
          const firstClaim = group.claims[0];
          const { variant, label } = getClaimStatusVariant(firstClaim?.expense_status);
          
          const {
            totalActualContractRate, totalTL, totalClaimApproved, totalPendingContractRate,
    totalEx, totalTLPending ,totalExPending, actualCpRate
          } = getGroupClaimTotals(group);

          const Variance = actualCpRate - totalActualContractRate;

          return (
            <>
              <Td>
                <CustomerName>{group.customer_name}</CustomerName>{" "}
                <OrderItemId>{group?.order_item_key}</OrderItemId>
              </Td>
              <Td>
                {group.product_name}
                <br />
                <StoreLocation title={group.store_name || "-"}>
                  {group?.store_name || "-"}
                </StoreLocation>
              </Td>
              <Td>
                <Badge variant={getStatusVariant(group.activityStatus)}>
                 {["AA", "AS"].includes(group.activityStatus) ? "Completed" : "Planned"}
                </Badge>
              </Td>
<Td>
  <RateCell>
    <RateBoxActual>
      {/* <BoxLabel>Actual</BoxLabel> */}
      <BoxAmount>{currency(totalActualContractRate)}</BoxAmount>
      <BoxMetrics>
        <MetricItem>
          <MetricLabel>TL</MetricLabel>
          <MetricValue>{totalTL}</MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>EX</MetricLabel>
          <MetricValue>{totalEx}</MetricValue>
        </MetricItem>
      </BoxMetrics>
    </RateBoxActual>

    <RateBox>
      {/* <BoxLabel as="span" style={{ color: "inherit" }}>
        Plan
      </BoxLabel> */}
      <BoxAmount>{currency(totalPendingContractRate)}</BoxAmount>
      <BoxMetrics>
        <MetricItem>
          <MetricLabel>TL</MetricLabel>
          <MetricValue>{totalTLPending}</MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>EX</MetricLabel>
          <MetricValue>{totalExPending}</MetricValue>
        </MetricItem>
      </BoxMetrics>
    </RateBox>
  </RateCell>
</Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem" , color: theme.colors.success, fontWeight: 600 }}>
                {currency(actualCpRate)}{" "}
              </Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem", color: `${Variance === 0 ? theme.colors.text : Variance > 0 ? theme.colors.success : theme.colors.error}`, fontWeight: 600 }}>
                {currency(Variance)}{" "}
              </Td>
              <Td>
                <Badge variant={variant}>{label}</Badge>
              </Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem" }}>
                {currency(totalClaimApproved)}{" "}
              </Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem", fontWeight: "900", }}>
                {currency((actualCpRate || 0 ) + totalClaimApproved)}{" "}
              </Td>
              <Td>   
                 <Button size='sm' variant='outline' onClick={() => navigate('/clamDetails', { state: { data: { ...group, mode: "settlement" } } })}>
                    <FaEye />
                 </Button>
              </Td>
            </>
          );
        }}
      />

      <PaginationComponent
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        siblingCount={2}
      />
      <div style={{display: "flex", justifyContent: "flex-end", marginTop: "1rem"}}>
      <Button
    onClick={() =>
        ExcelBuilder({
            fileName: "Receivables.xlsx",
            sheetName: "Receivables",
            title: "Receivables Report",
            columns: ProfitabilityDashboardColumns,
            rows,
        })
    }
><FaFileDownload />
    Export Excel
</Button>
      </div>
      </Card>

    </Layout>
  );
};

export default ProfitabilityDashboard;

const getClaimStatusVariant = (expense_status) => {
  const statusMap = {
    N: { variant: "warning", label: "Not Submitted" },
    S: { variant: "success", label: "Submitted" },
    A: { variant: "info", label: "Approved" },
    R: { variant: "error", label: "Rejected" },
    // 'P': { variant: 'info', label: 'Pending' },
  };

  return (
    statusMap[expense_status] || { variant: "warning", label: "Not Submitted" }
  );
};

const column = [
  <>
    Customer
    <br />
    Order Item ID
  </>,
  <>
    Audit Type
    <br />
    Store Location
  </>,
  "Activity status",
  <>System Amt <br/> (Actual/plan)</>,
  "Payable",
  "Variance",
  "Claim status",
  "Claim Approved",
  "Total Amount",
  "Actions",
];

const getDays = (sDate, eDate) => {
    if (!sDate || !eDate) return 0;
    const start = new Date(sDate);
    const end = new Date(eDate);
    if (isNaN(start) || isNaN(end) || end < start) return 0;

    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };