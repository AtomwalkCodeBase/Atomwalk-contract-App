import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  currency,
  formatMonthLabel,
  formatToDDMMYYYY,
  formatWeekLabel,
  getMonthRange,
  getStatusVariant,
  groupByOrderItemId,
  matchClaimsToActivity,
} from "../utils/utils";
import styled from "styled-components";
import { useActivity } from "../context/ActivityClaimContext";
import Button from "../components/Button";
import { toast } from "react-toastify";
import {
  FaBoxes,
  FaCheckCircle,
  FaCheckDouble,
  FaClock,
  FaExclamationCircle,
  FaEye,
  FaFileContract,
  FaFileInvoice,
  FaHandHoldingUsd,
  FaWallet,
} from "react-icons/fa";
import StatsCard from "../components/StatsCard";
import DataTable, { Td } from "../components/DataTable";
import Badge from "../components/Badge";
import PaginationComponent from "../components/Pagination";
import { useFilter } from "../hooks/useFilter";
import { usePagination } from "../hooks/usePagination";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

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
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  line-height: 1.3;
`;

const OrderItemId = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-family: monospace;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 0.2rem 0.2rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
`;

const StoreLocation = styled.div`
  font-size: 0.75rem;
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

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: white;
  min-width: 150px;

  @media (max-width: 768px) {
    width: 45%;
    min-width: unset;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;


const ProfitabilityDashboard = () => {
    const navigate = useNavigate();
  const emp_id = localStorage.getItem("cust_emp_id");
  const {
    activityState,
    fetchEmpActivityAllocations,
    fetchContractAllocations,
    getStoredActivityListSelection,
    fetchClaims,
    fetchEmployees,
  } = useActivity();
  const { data: assignedActivity, loading, error } = activityState;
  const [claimList, setClaimList] = useState([]);
  const [resourcePlannedList, setResourcePlannedList] = useState([]);
  const [filter, setFilter] = useState({ search: "", status: "" });
  const [offset, setOffset] = useState(0);
  // const [dateRange, setDateRange] = useState(() => {
  //     if (storedSelection?.dateRange?.start && storedSelection?.dateRange?.end) {
  //         return storedSelection.dateRange;
  //     }

  //     return getMonthRange({
  //         type: "current",
  //         mode: storedSelection?.activeRangeType || "month",
  //         offset: storedSelection?.offset || 0,
  //     });
  // });
  const [dateRange, setDateRange] = useState(() =>
    getMonthRange({ type: "month" }),
  );

  const getAuditAllocationData = async (startOverride, endOverride) => {
    const start = startOverride || dateRange.start;
    const end = endOverride || dateRange.end;

    if (!start || !end) return;

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
  }, [dateRange, emp_id]);

  useEffect(() => {
    if (emp_id) {
      fetchProfileAndClaims();
    }
  }, [emp_id, fetchProfileAndClaims]);

  // console.log("groupedDataWithClaims", groupedDataWithClaims);

  const handleNavigate = (direction) => {
    const newOffset = offset + direction;
    setOffset(newOffset);

    const range = getMonthRange({
      type: "current",
      mode: "month",
      offset: newOffset,
    });

    setDateRange(range);
    getAuditAllocationData(range.start, range.end);
  };

    const handleClearFilters = () => {
      // if (typeof window !== "undefined") {
      //   window.sessionStorage.removeItem(ACTIVITY_LIST_STORAGE_KEY);
      // }
  
      // const currentMonthRange = getMonthRange({ type: "current", mode: "month" });
  
      setFilter({ search: "", status: "ALL", });
      // setActiveRangeType("month");
      // setDateRange(currentMonthRange);
  
      // getAuditAllocationData();
    };

  const groupedData = groupByOrderItemId(assignedActivity, resourcePlannedList);

  const groupedDataWithClaims = groupedData.filter((data) => data.activityStatus === "AS").map((group) => {
    const matchedClaims = matchClaimsToActivity(claimList, group);

    let totalOPE = 0;
    let totalSettlement = 0;

    matchedClaims.forEach((claim) => {
      (claim.claim_items || []).forEach((ci) => {
        const expense = Number(
          ci.expense_amt ?? ci.claim_amt ?? ci.amount ?? 0,
        );
        const settlement = Number(ci.settlement_amt ?? 0);

        totalOPE += expense;
        totalSettlement += expense - settlement;
      });
    });

    return {
      ...group,
      claims: matchedClaims, // or claim: matchedClaims
      hasClaim: matchedClaims.length > 0,
      totalOPE,
      totalSettlement,
    };
  });

  const FilteredData = useFilter({
    data: groupedDataWithClaims,
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

  const sortedFilteredData = useMemo(() => {
    return [...FilteredData].sort((a, b) => {
      // 1. NS status always comes first
      if (a.activityStatus === "AS" && b.activityStatus !== "AS") return -1;
      if (a.activityStatus !== "AS" && b.activityStatus === "AS") return 1;

      // 2. Within same status priority, latest start date first
      const dateA = new Date(a.planned_start_date);
      const dateB = new Date(b.planned_start_date);

      return dateB - dateA;
    });
  }, [FilteredData]);

  const {
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    handlePageChange,
  } = usePagination(sortedFilteredData, 10);

  const getOverallClaimTotals = (groupedDataWithClaims = []) => {
    let totalClaimAmount = 0;
    let totalClaimSettlement = 0;
    let totalClaimApproved = 0;
    let totalClaimNotSubmitted = 0;
    let totalClaimSubmitted = 0;
    let totalContractRate = 0;
    let totalApprovedContractRate = 0;

    groupedDataWithClaims.forEach((group) => {
      // ---- claims ----
      (group.claims || []).forEach((claim) => {
        (claim.claim_items || []).forEach((ci) => {
          const expense = Number(
            ci.expense_amt ?? ci.claim_amt ?? ci.amount ?? 0,
          );
          const settlement = Number(ci.settlement_amt ?? 0);
          const status = String(ci.expense_status ?? "").toUpperCase();

          totalClaimAmount += expense;
          totalClaimSettlement += settlement;

          if (status === "A") {
            totalClaimApproved += expense;
          } else if (status === "N") {
            totalClaimNotSubmitted += expense;
          } else {
            // status === "S" or others
            totalClaimSubmitted += expense;
          }
        });
      });

      // ---- collect allAEntries ids from this group's grouped_data ----
      const allAEntryIds = new Set();
      (group.grouped_data || []).forEach((item) => {
        (item.allAEntries || []).forEach((entry) => {
          if (entry?.id != null) {
            allAEntryIds.add(String(entry.id));
          }
        });
      });


      // ---- filter resource_planned, rate × days ----
      (group.resource_planned || []).forEach((rp) => {
         const rpId = String(rp.allocation_id ?? rp.id ?? rp.activity_id ?? rp.a_entry_id ?? "");

        if (!allAEntryIds.has(rpId)) return;

        const days = getDays(rp.start_date, rp.end_date);
        const rate = Number(rp.contract_rate ?? rp.contart_rate ?? 0);
        const amount = rate * days;

        totalContractRate += amount;

        if (rp.is_approve === true || rp.is_approved === true) {
          totalApprovedContractRate += amount;
        }
      });
    });

    return {
      totalClaimAmount,
      totalClaimSettlement,
      totalClaimApproved,
      totalClaimNotSubmitted,
      totalClaimSubmitted,
      totalContractRate,          // rate × days (matched only)
      totalApprovedContractRate,  // rate × days where is_approve === true
    };
  };

const getGroupClaimTotals = (group) => {
  let totalClaimAmount = 0;
  let totalSettlement = 0;
  let totalPending = 0;
  let totalContractRate = 0;
  let totalClaimApproved = 0;
  let totalClaimNotSubmitted = 0;
  let totalClaimSubmitted = 0;
  let totalTL = 0; // emp_type === "T"
  let totalEx = 0; // emp_type === "E"

  // ---- claims ----
  (group.claims || []).forEach((claim) => {
    (claim.claim_items || []).forEach((ci) => {
      const expense = Number(
        ci.expense_amt ?? ci.claim_amt ?? ci.amount ?? 0,
      );
      const settlement = Number(ci.settlement_amt ?? 0);
      const status = String(ci.expense_status ?? "").toUpperCase();

      totalClaimAmount += expense;
      totalSettlement += settlement;

    if (status === "A") {
            totalClaimApproved += expense;
          } else if (status === "N") {
            totalClaimNotSubmitted += expense;
          } else {
            // status === "S" or others
            totalClaimSubmitted += expense;
          }
    });
  });

  // ---- collect all allAEntries ids from grouped_data ----
  const allAEntryIds = new Set();

  (group.grouped_data || []).forEach((item) => {
    (item.allAEntries || []).forEach((entry) => {
      if (entry?.id != null) {
        allAEntryIds.add(String(entry.id));
      }
    });
  });

  // ---- filter resource_planned, calc rate × days, count TL/Ex ----
  (group.resource_planned || []).forEach((rp) => {
    const rpId = String(rp.allocation_id ?? rp.id ?? rp.activity_id ?? rp.a_entry_id ?? "");

    // only matched activities
    if (!allAEntryIds.has(rpId)) return;

    const days = getDays(rp.start_date, rp.end_date);
    const rate = Number(rp.contract_rate ?? rp.contart_rate ?? 0);

    totalContractRate += rate * days;

    const empType = String(rp.emp_type ?? "").toUpperCase();
    if (empType === "T") {
      totalTL += days;
    } else if (empType === "E") {
      totalEx += days;
    }
  });

  return {
    totalClaimAmount,
    totalSettlement,
    totalPending,
    totalClaimApproved, totalClaimNotSubmitted, totalClaimSubmitted,
    totalContractRate, // rate × days (matched only)
    totalTL,
    totalEx,
  };
};

  // usage
  const overallTotals = getOverallClaimTotals(groupedDataWithClaims);

  const stats_card_detailed = [
    {
      label: "Expected Earnings",
      value: currency(
        (overallTotals.totalContractRate || 0) + (overallTotals.totalClaimApproved || 0),
      ),
      color: "warning",
      icon: <FaWallet />,
      tooltip: `Approved: ${currency(overallTotals.totalClaimApproved)} + Contract Rate: ${currency(overallTotals.totalContractRate)}`,
      // sections: [
      //   {
      //     items: [
      //       { label: "Rate", value: currency(overallTotals.totalContractRate), status: "info" },
      //       { label: "Approved", value: currency(overallTotals.totalClaimApproved), status: "success", }
      //     ]
      //   },
      // ],
    },
    // {
    //   label: "Payment Received",
    //   value: currency((0) + (overallTotals.totalClaimApproved || 0)),
    //   color: "warning",
    //   icon: <FaWallet />,
    //   tooltip: `Approved: ${currency(overallTotals.totalClaimApproved)} + Contract Rate: ${currency(overallTotals.totalContractRate)}`,
    // },
        {
      label: "Contract Rate",
      value: currency(overallTotals.totalContractRate || 0),
      color: "info",
      icon: <FaFileContract />,
    },
    {
      label: "Approved Claim Amount",
      value: currency(overallTotals.totalClaimApproved || 0),
      color: "success",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Settlement",
      value: currency(overallTotals.totalClaimSettlement || 0),
      color: "info",
      icon: <FaHandHoldingUsd />,
    },
    {
      label: "Total Claims",
      value: currency(overallTotals.totalClaimAmount || 0),
      color: "success",
      icon: <FaFileInvoice />,
    },
    {
      label: "Claims Under Review",
      value: currency(overallTotals.totalClaimSubmitted || 0),
      color: "error",
      icon: <FaExclamationCircle />,
    },
    {
      label: "Claims Yet to Submit",
      value: currency(overallTotals.totalClaimNotSubmitted || 0),
      color: "error",
      icon: <FaExclamationCircle />,
    },
    {
      label: "Total Order Items",
      value: groupedDataWithClaims?.length || 0,
      color: "primary",
      icon: <FaBoxes />,
    },
    // {
    //   label: "Claim Pending Amount",
    //   // value: currency(overallTotals.totalPending || 0),
    //   value: currency(
    //     (overallTotals.totalClaimAmount || 0) - (overallTotals.totalClaimSettlement || 0),
    //   ),
    //   color: "warning",
    //   icon: <FaClock />,
    // },
    // {
    //   label: "Approved Contract Rate",
    //   value: currency(overallTotals.totalApprovedContractRate || 0),
    //   color: "success",
    //   icon: <FaCheckDouble />,
    // },
  ];
  return (
    <Layout title="Receivables Dashboard">
      <ClaimsHeader>
        <Tagline>Track and manage your clams</Tagline>
        <div>
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
        </div>
      </ClaimsHeader>

      <StatsGrid>
        {stats_card_detailed.map((stats) => (
          <StatsCard
            label={stats.label}
            value={stats.value}
            icon={stats.icon}
            color={stats.color}
            sections={stats.sections} 
          />
        ))}
      </StatsGrid>


<Card>
  				<FilterRow style={{ marginBottom: "1rem" }}>
					<SearchBox type="text" placeholder="Search Auditor's name, ID..." value={filter.search} onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value, }))} />

					<FilterSelect
						name="status"
						value={filter.status}
						onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
					>
						<option value="ALL">All</option>
						<option value="NA">Not Assigned</option>
						<option value="P">In Progress</option>
						<option value="C">Completed</option>
						<option value="NS">Not Started</option>
					</FilterSelect>

					<Button variant="outline" size='sm' onClick={handleClearFilters}>
						Clear Filters
					</Button>
				</FilterRow>
      <DataTable
        columns={column}
        data={paginatedData}
          isLoading={loading}
        renderRow={(group) => {
          // const claims = Array.isArray(employee.claims) ? employee.claims : [];
          const firstClaim = group.claims[0];
          const { variant, label } = getClaimStatusVariant(
            firstClaim?.expense_status,
          );
          const {
            totalClaimAmount,
            totalSettlement,
            totalContractRate,
            totalPending, totalTL, totalClaimApproved, totalClaimNotSubmitted, totalClaimSubmitted,
    totalEx,
          } = getGroupClaimTotals(group);
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
                  {group.statusDisplay}
                </Badge>
              </Td>
              <Td>
                <Badge variant={variant}>{label}</Badge>
              </Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem" }}>
                {currency(totalContractRate)}{" "}<br/>
                TL: {totalTL} EX: {totalEx}
              </Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem" }}>
                {currency(totalClaimApproved)}{" "}
              </Td>
              <Td style={{ textAlign: "right", paddingRight: "3rem" }}>
                {currency(totalSettlement)}{" "}
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
  "Claim status",
  "Resource Rate",
  "Approved Claim Amount",
  "Settlement",
  "Actions",
];

const getDays = (sDate, eDate) => {
    if (!sDate || !eDate) return 0;
    const start = new Date(sDate);
    const end = new Date(eDate);
    if (isNaN(start) || isNaN(end) || end < start) return 0;

    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };