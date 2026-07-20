import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import StatsCard from '../components/StatsCard'
import { FaBoxes, FaFileInvoice, FaHandHoldingUsd, FaWallet } from 'react-icons/fa'
import { DateForApiFormate, formatMonthLabel, formatRetainerActivities, formatToDDMMYYYY, formatWeekLabel, getMonthRange, matchClaimsToActivity } from '../utils/utils'
import { getContractAllocationData, getEmpAllocationData, getEmpClaim, getemployeeLists } from '../services/productServices'
import Button from '../components/Button'
import styled from 'styled-components'

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
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ProfitabilityDashboard = () => {
    const [assignedActivity, setAssignedActivity] = useState([]);
    const [claimList, setClaimList] = useState([]);
    const emp_id = localStorage.getItem("cust_emp_id");
    const [activeRangeType, setActiveRangeType] = useState("month");
    const [isLoading, setIsLoading] = useState(false);
    const [resourcePlannedList , setResourcePlannedList] = useState([]);
    const [dateRange, setDateRange] = useState(() => getMonthRange({ type: "current", mode: "month" }));
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (emp_id) {
            fetchEmpAllocationData();
            fetchProfileAndClaims();
            fetchEmpPlannedAllocation();
        }
    }, [emp_id]);

    const fetchEmpAllocationData = async (startOverride, endOverride) => {
        const emp_id = localStorage.getItem("cust_emp_id")
        const start = startOverride || dateRange.start
        const end = endOverride || dateRange.end

        const startDateObj = new Date(start)
        const endDateObj = new Date(end)

        if (endDateObj < startDateObj) {
            toast.info("End date cannot be earlier than start date")
            return false;
        }
        const payload = {
            emp_id: emp_id,
            start_date: formatToDDMMYYYY(start),
            end_date: formatToDDMMYYYY(end),
        }

        setIsLoading(true);

        try {
            const response = await getEmpAllocationData(payload);
            setAssignedActivity(formatRetainerActivities(response.data))
            // console.log("normalizeProjects(response.data)", formatRetainerActivities(response.data))
        } catch (error) {
            toast.error("No data found...")
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

      const fetchEmpPlannedAllocation = async (startOverride, endOverride) => {
        const emp_id = localStorage.getItem("cust_emp_id")
        const start = startOverride || dateRange.start
        const end = endOverride || dateRange.end
    
        const startDateObj = new Date(start)
        const endDateObj = new Date(end)
    
        if (endDateObj < startDateObj) {
          toast.info("End date cannot be earlier than start date")
          return false;
        }
        const payload = {
          emp_id: emp_id,
          start_date: formatToDDMMYYYY(start),
          end_date: formatToDDMMYYYY(end),
        }
    
        setIsLoading(true);
    
        try {
          const response = await getContractAllocationData(payload);
          setResourcePlannedList(response.data)
          // console.log("normalizeProjects(response.data)", formatRetainerActivities(response.data))
        } catch (error) {
          toast.error("No data found...")
          setIsLoading(false)
        } finally {
          setIsLoading(false)
        }
      }

    const fetchProfileAndClaims = useCallback(async () => {
        if (!emp_id) return;

        try {
            const profileRes = await getemployeeLists({ emp_id: emp_id });
            const profile = profileRes?.data?.[0] || {};

            if (profile.id) {
                const claimRes = await getEmpClaim("GET", profile.id, "CY");
                setClaimList(claimRes?.data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile or claims");
            setClaimList([]);
        }
    }, [emp_id]);

    const filteredClaimsByDate = useMemo(() => {
        if (!Array.isArray(claimList)) return [];
        const startDate = dateRange.start;
        const endDate = dateRange.end;

        return claimList.filter((claim) => {
            if (!claim?.claim_date) return false;

            const hasMatchingItem = claim.claim_items.some((item) => {
                if (!item?.expense_date) return false;

                const formattedExpenseDate = DateForApiFormate(item?.expense_date, true);

                return formattedExpenseDate >= startDate && formattedExpenseDate <= endDate;
            });

            return hasMatchingItem;
        });
    }, [claimList, dateRange.start, dateRange.end]);



    const activitiesWithClaims = useMemo(() => {
        if (!Array.isArray(assignedActivity)) return [];

        return assignedActivity.map((activity) => {
            const matchedClaims = matchClaimsToActivity(filteredClaimsByDate, activity);

            return {
                ...activity,
                claims: matchedClaims,
                hasClaim: matchedClaims.length > 0,
            };
        });
    }, [assignedActivity, filteredClaimsByDate]);

    console.log("activitiesWithClaims", activitiesWithClaims)

const profitabilityData = useMemo(() => {
  if (!Array.isArray(activitiesWithClaims)) return [];
  if (!Array.isArray(resourcePlannedList)) return [];

  // Normalize ID: "000123" -> "123"
  const normalizeId = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).replace(/^0+/, "");
  };

  // ---------------------------------------------------------
  // Create resource lookup by allocation_id
  // This avoids running .find() again and again
  // ---------------------------------------------------------
  const resourceMap = new Map();

  resourcePlannedList.forEach((resource) => {
    const allocationId = normalizeId(resource?.allocation_id);

    if (allocationId) {
      resourceMap.set(allocationId, resource);
    }
  });

  const groups = {};

  activitiesWithClaims.forEach((activity) => {
    const orderItemKey =
      activity?.original_P?.order_item_id ||
      activity?.order_item_id;

    if (!orderItemKey) return;

    const normalizedOrderItemKey = normalizeId(orderItemKey);

    if (!groups[normalizedOrderItemKey]) {
      groups[normalizedOrderItemKey] = {
        order_item_key: orderItemKey,
        customer_name: activity?.customer_name || "-",

        plannedAllocations: new Map(),
        actualAllocations: new Map(),
      };
    }

    const group = groups[normalizedOrderItemKey];

    // ========================================================
    // PLANNED
    //
    // activity.p_id === resourcePlannedList[].allocation_id
    // ========================================================

    const plannedAllocationId = normalizeId(activity?.p_id);

    if (plannedAllocationId) {
      const plannedResource = resourceMap.get(plannedAllocationId);

      if (plannedResource) {
        group.plannedAllocations.set(
          plannedAllocationId,
          plannedResource
        );
      }
    }

    // ========================================================
    // ACTUAL
    //
    // allAEntries[].id === resourcePlannedList[].allocation_id
    // ========================================================

    const allAEntries = Array.isArray(activity?.allAEntries)
      ? activity.allAEntries
      : Array.isArray(activity?.original_A?.allAEntries)
      ? activity.original_A.allAEntries
      : [];

    allAEntries.forEach((entry) => {
      const actualAllocationId = normalizeId(entry?.id);

      if (!actualAllocationId) return;

      const actualResource = resourceMap.get(actualAllocationId);

      if (actualResource) {
        group.actualAllocations.set(
          actualAllocationId,
          actualResource
        );
      }
    });
  });

  // =========================================================
  // BUILD FINAL DATA PER ORDER ITEM
  // =========================================================

  return Object.values(groups).map((group) => {
    const normalizedOrderItemKey = normalizeId(
      group.order_item_id
    );

    const plannedAllocations = Array.from(
      group.plannedAllocations.values()
    );

    const actualAllocations = Array.from(
      group.actualAllocations.values()
    );

    // =======================================================
    // MATCH CLAIMS DIRECTLY USING claim_items[].o_item_id
    // =======================================================

    const matchedClaims = filteredClaimsByDate
      .map((claim) => {
        const matchedItems = (claim?.claim_items || []).filter(
          (item) => {
            const claimOrderItemId = normalizeId(
              item?.o_item_id
            );

            return (
              claimOrderItemId === normalizedOrderItemKey
            );
          }
        );

        if (matchedItems.length === 0) return null;

        return {
          ...claim,
          claim_items: matchedItems,
        };
      })
      .filter(Boolean);

    // =======================================================
    // TL / EX
    // =======================================================

    const getEmpType = (item) =>
      String(
        item?.emp_type ||
        item?.employee_type ||
        item?.resource_type ||
        ""
      ).toUpperCase();

    const plannedTL = plannedAllocations.filter(
      (item) => getEmpType(item) === "T"
    );

    const plannedEX = plannedAllocations.filter(
      (item) => getEmpType(item) === "E"
    );

    const actualTL = actualAllocations.filter(
      (item) => getEmpType(item) === "T"
    );

    const actualEX = actualAllocations.filter(
      (item) => getEmpType(item) === "E"
    );

    // =======================================================
    // RATE CALCULATION
    // =======================================================

    const calculateRate = (items) =>
      items.reduce(
        (sum, item) =>
          sum + Number(item?.contract_rate || 0),
        0
      );

    const plannedTLRate = calculateRate(plannedTL);
    const plannedEXRate = calculateRate(plannedEX);

    const actualTLRate = calculateRate(actualTL);
    const actualEXRate = calculateRate(actualEX);

    const totalPlannedRate =
      plannedTLRate + plannedEXRate;

    const totalActualRate =
      actualTLRate + actualEXRate;

    // =======================================================
    // CLAIM ITEMS
    //
    // We already filtered claim_items by o_item_id,
    // so only this Order Item's claim items are here.
    // =======================================================

    const matchedClaimItems = matchedClaims.flatMap(
      (claim) => claim?.claim_items || []
    );

    // IMPORTANT:
    // Change expense_amt if claim item uses another field
    const totalClaimAmount = matchedClaimItems.reduce(
      (sum, item) =>
        sum + Number(
          item?.expense_amt ||
          item?.claim_amt ||
          item?.amount ||
          0
        ),
      0
    );

    const totalSettlement = matchedClaimItems.reduce(
      (sum, item) =>
        sum + Number(
          item?.settlement_amt ||
          0
        ),
      0
    );

    // =======================================================
    // STATUS
    // =======================================================

    let status = "Not Claimed";

    if (matchedClaimItems.length > 0) {
      const allApproved = matchedClaimItems.every(
        (item) => item?.is_approved
      );

      status = allApproved
        ? "Approved"
        : "Pending";
    }

    return {
      order_item_key: group.order_item_key,
      customer_name: group.customer_name,

      // -------------------------
      // Planned
      // -------------------------
      plannedTLCount: plannedTL.length,
      plannedEXCount: plannedEX.length,

      plannedTLRate,
      plannedEXRate,

      totalPlannedRate,

      // -------------------------
      // Actual
      // -------------------------
      actualTLCount: actualTL.length,
      actualEXCount: actualEX.length,

      actualTLRate,
      actualEXRate,

      totalActualRate,

      // -------------------------
      // Total Rate
      // -------------------------
      totalRate: totalActualRate,

      // -------------------------
      // Claims
      // -------------------------
      totalClaimAmount,
      totalSettlement,

      claimsCount: matchedClaimItems.length,
      status,

      // Raw matched data
      plannedAllocations,
      actualAllocations,
      claims: matchedClaims,
      claimItems: matchedClaimItems,
    };
  });
}, [
  activitiesWithClaims,
  resourcePlannedList,
  filteredClaimsByDate,
]);

console.log("activitiesWithClaims", activitiesWithClaims);
console.log("resourcePlannedList", resourcePlannedList);
console.log("profitabilityData", profitabilityData);

    // ADD — group activitiesWithClaims by order_item_key
    const groupedActivities = useMemo(() => {
        const groups = {};

        activitiesWithClaims.forEach((activity) => {
            const key = activity?.original_P?.order_item_key || activity?.order_item_key || "UNKNOWN";

            if (!groups[key]) {
                groups[key] = {
                    order_item_key: key,
                    customer_name: activity.customer_name,
                    grouped_data: [],
                };
            }

            groups[key].grouped_data.push(activity);
        });

        return Object.values(groups)
            .map((group) => {
                // sort items within the group by planned_start_date, earliest first
                const sortedItems = [...group.grouped_data].sort((a, b) =>
                    (a.planned_start_date || "").localeCompare(b.planned_start_date || "")
                );

                const earliestPlannedDate = sortedItems[0]?.planned_start_date || null;
                const latestPlannedDate = sortedItems[sortedItems.length - 1]?.planned_end_date || null;

                // CHANGE claim aggregation — dedupe claims by their unique id before summing,
                // since the same claim can get matched to multiple activities under one order_item_key
                const allClaimsRaw = sortedItems.flatMap((item) => (Array.isArray(item.claims) ? item.claims : []));

                const uniqueClaimsMap = new Map();
                allClaimsRaw.forEach((c) => {
                    const claimId = c?.id || c?.claim_id;
                    if (claimId != null && !uniqueClaimsMap.has(claimId)) {
                        uniqueClaimsMap.set(claimId, c);
                    }
                });
                const allClaims = Array.from(uniqueClaimsMap.values());
                const uniqueClaims = Array.from(uniqueClaimsMap.values());
                const allClaimItems = uniqueClaims.flatMap((c) => (Array.isArray(c.claim_items) ? c.claim_items : []));


                const totalOPE = allClaims.reduce((sum, c) => sum + Number(c?.expense_amt || 0), 0);
                const totalSettlement = allClaims.reduce((sum, c) => sum + Number(c?.settlement_amt || 0), 0);
                const approvedCount = allClaimItems.filter((ci) => ci?.is_approved).length;
                const claimsCount = allClaimItems.length;
                const claimsItem = allClaims;


                // aggregate claims across all items in this group
                // const allClaims = sortedItems.flatMap((item) => (Array.isArray(item.claims) ? item.claims : []));
                // const totalOPE = allClaims.reduce((sum, c) => sum + Number(c?.expense_amt || 0), 0);
                // const totalSettlement = allClaims.reduce((sum, c) => sum + Number(c?.settlement_amt || 0), 0);
                // const approvedCount = allClaims.filter((c) => c?.is_approved).length;

                return {
                    ...group,
                    items: sortedItems,
                    grouped_data: sortedItems,
                    earliestPlannedDate,
                    latestPlannedDate,
                    claimsCount,
                    totalOPE,
                    totalSettlement,
                    approvedCount,
                    claimsItem
                };
            })
            // sort groups themselves by earliest planned date, least to latest
            .sort((a, b) => (a.earliestPlannedDate || "").localeCompare(b.earliestPlannedDate || ""));
    }, [activitiesWithClaims]);

      const handleRangeChange = (type) => {
        setActiveRangeType(type);
        setOffset(0);
        const range = getMonthRange({ type: "current", mode: type, offset: 0 });
        setDateRange(range);
        fetchEmpAllocationData(range.start, range.end);
      };

        const handleNavigate = (direction) => {
          const newOffset = offset + direction;
          setOffset(newOffset);
          const range = getMonthRange({ type: "current", mode: activeRangeType, offset: newOffset });
          setDateRange(range);
          fetchEmpAllocationData(range.start, range.end);
        };

    const stats_card = [
        { label: "Total Order Items", value: groupedActivities.length, color: "primary", icon: <FaBoxes /> },
        { label: "Total Cost", value: "120,000", color: "warning", icon: <FaWallet /> },
        { label: "Total OPE", value: "15,000", color: "success", icon: <FaFileInvoice /> },
        { label: "AMOUNT TO BE PAID", value: "135,000", color: "error", icon: <FaHandHoldingUsd /> }
    ]

    console.log("groupedActivities", groupedActivities)

    return (
        <Layout>
             <ClaimsHeader>
        <Tagline>Track and manage your clams</Tagline>
        <div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: "flex-end" }}>
            <Button
              variant={activeRangeType === 'month' ? 'primary' : 'outline'}
              onClick={() => handleRangeChange('month')}
            >
              Month
            </Button>
            <Button
              variant={activeRangeType === 'week' ? 'primary' : 'outline'}
              onClick={() => handleRangeChange('week')}
            >
              Week
            </Button>
          </div>

          <div style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleNavigate(-1)}>
              &lt; Prev
            </Button>
            <span>
              {activeRangeType === 'month' ? formatMonthLabel(dateRange.start) : formatWeekLabel(dateRange.start, dateRange.end)}
            </span>
            <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleNavigate(1)}>
              Next &gt;
            </Button>
          </div>

        </div>
      </ClaimsHeader>
            <StatsGrid>

                {stats_card.map((stats) => (
                    <StatsCard label={stats.label} value={stats.value} icon={stats.icon} color={stats.color} />
                ))}
            </StatsGrid>


        </Layout>
    )
}

export default ProfitabilityDashboard