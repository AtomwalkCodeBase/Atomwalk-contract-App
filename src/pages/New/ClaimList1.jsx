import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import styled from 'styled-components';
import { MonthToggleComponent } from './ActivityListScreen';
import { DateForApiFormate, formatDate, formatToDDMMYYYY, getMonthRange, getStatusVariant, groupByOrderItemId, matchClaimsToActivity } from '../../utils/utils';
import { useActivity } from '../../context/ActivityClaimContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import { FaBoxes, FaEye, FaFileInvoice, FaHandHoldingUsd, FaPlus, FaWallet } from 'react-icons/fa';
import DataTable, { Td } from '../../components/DataTable';
import Badge from '../../components/Badge';
import { useFilter } from '../../hooks/useFilter';
import { usePagination } from '../../hooks/usePagination';
import PaginationComponent from '../../components/Pagination';
import StatsCard from '../../components/StatsCard';

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
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  align-items: center;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
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

const ClaimTitle = styled.span`
  font-weight: 600;
  color: ${({ theme, value }) =>  value ? theme.colors.textLight : theme.colors.text};
`;


const CLAIM_LIST_STORAGE_KEY = 'claimListSelection';
const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const activityColumn = [<>Customer<br />Order Item ID</>, "Audit Type", "Planned Date", "Claim Amount", "Approved/Total Claims","Planned slots", "Claim Status", "Actions"]

const ClaimList = () => {
  const emp_id = localStorage.getItem("cust_emp_id");
  const navigate = useNavigate();
  const { activityState, employeeState, claimState, fetchEmpActivityAllocations, fetchContractAllocations, getStoredActivityListSelection, fetchEmployees, fetchClaims } = useActivity();
  const { data: assignedActivity, loading, error } = activityState;
  const { data: profile, loading: employeeLoading, error: employeeError } = employeeState;
  const { data: claimList, loading: claimLoading, error: claimError } = claimState;
  const storedSelection = getStoredActivityListSelection(CLAIM_LIST_STORAGE_KEY) || {};

  const [filter, setFilter] = useState({ search: "", status: "" })
  const [offset, setOffset] = useState(storedSelection?.offset || 0);
  const [activeRangeType, setActiveRangeType] = useState(storedSelection?.activeRangeType || "month");
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [dateRange, setDateRange] = useState(() => {
    if (storedSelection?.dateRange?.start && storedSelection?.dateRange?.end) {
      return storedSelection.dateRange;
    }

    return getMonthRange({
      type: "current",
      mode: storedSelection?.activeRangeType || "month",
      offset: storedSelection?.offset || 0,
    });
  });

useEffect(() => {
  const loadData = async () => {
    if (!emp_id || !dateRange?.start || !dateRange?.end) return;

    try {
      // Always fetch activities for the selected date range
      const payload = {
        emp_id,
        start_date: formatToDDMMYYYY(dateRange.start),
        end_date: formatToDDMMYYYY(dateRange.end),
      };

      await fetchEmpActivityAllocations(payload);

      // Fetch profile only once
      let employeeProfile = profile?.[0];

      if (!employeeProfile?.id) {
        const profileData = await fetchEmployees({ emp_id });
        employeeProfile = profileData?.[0];
      }

      if (!employeeProfile?.id) return;

      // Claims don't depend on month/week, so fetch only once
      if (!claimList?.length) {
        await fetchClaims("GET", employeeProfile.id, "CY");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    }
  };

  loadData();
}, [emp_id, dateRange]);

useEffect(() => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      CLAIM_LIST_STORAGE_KEY,
      JSON.stringify({ activeRangeType, offset, dateRange,})
    );
  }
}, [activeRangeType, offset, dateRange]);

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

  const groupedDataRaw = useMemo(() => {
    return groupByOrderItemId(activitiesWithClaims);
  }, [activitiesWithClaims]);

  const groupedData = useMemo(() => {
    if (!Array.isArray(groupedDataRaw)) return [];

    return groupedDataRaw.map((group) => {
      // Extract all claims from grouped_data (activities)
      const allClaims = group.grouped_data.flatMap((activity) => {
        return Array.isArray(activity.claims) ? activity.claims : [];
      });

      // Deduplicate claims by ID
      const uniqueClaimsMap = new Map();
      allClaims.forEach((claim) => {
        const claimId = claim?.id || claim?.claim_id;
        if (claimId != null && !uniqueClaimsMap.has(claimId)) {
          uniqueClaimsMap.set(claimId, claim);
        }
      });

      const uniqueClaims = Array.from(uniqueClaimsMap.values());

      // Calculate aggregates
      let totalOPE = 0;
      let totalSettlement = 0;
      let approvedCount = 0;
      let claimsCount = 0;

      uniqueClaims.forEach((claim) => {
        totalOPE += Number(claim?.expense_amt || 0);
        totalSettlement += Number(claim?.settlement_amt || 0);

        const claimItems = claim?.claim_items || [];
        claimsCount += claimItems.length;

        claimItems.forEach((claimItem) => {
          if (claimItem?.is_approved) {
            approvedCount += 1;
          }
        });
      });

      // Return group with additional fields
      return {
        ...group,
        claimsItem: uniqueClaims,
        claimsCount,
        totalOPE,
        totalSettlement,
        approvedCount,
      };
    });
  }, [groupedDataRaw]);


  const handleRangeChange = (type) => {
    setActiveRangeType(type);
    setOffset(0);
    const range = getMonthRange({ type: "current", mode: type, offset: 0 });
    setDateRange(range);
  };

  const handleNavigate = (direction) => {
    const newOffset = offset + direction;
    setOffset(newOffset);
    const range = getMonthRange({ type: "current", mode: activeRangeType, offset: newOffset });
    setDateRange(range);
  };

  const handleClearFilters = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(CLAIM_LIST_STORAGE_KEY);
    }

    const currentMonthRange = getMonthRange({ type: "current", mode: "month" });

    setFilter({ search: "", status: "ALL", });
    setActiveRangeType("month");
    setDateRange(currentMonthRange);
  };

    const claimStats = useMemo(() => {
    return filteredClaimsByDate.reduce(
      (acc, claim) => {
        acc.totalOPE += Number(claim?.expense_amt || 0);
        acc.totalSettlement += Number(claim?.settlement_amt || 0);
  
        return acc;
      },
      {
        totalOPE: 0,
        totalSettlement: 0,
      }
    );
  }, [filteredClaimsByDate]);
  
  const amountToBePaid = claimStats.totalOPE - claimStats.totalSettlement;

  const stats_card = useMemo(
    () => [
      {
        label: "Total Order Items",
        value: groupedData.length,
        color: "primary",
        icon: <FaBoxes />,
      },
      {
        label: "Total OPE",
        value: currency(claimStats.totalOPE),
        color: "success",
        icon: <FaFileInvoice />,
      },
      {
        label: "Total Settlement",
        value: currency(claimStats.totalSettlement),
        color: "warning",
        icon: <FaWallet />,
      },
      {
        label: "AMOUNT TO BE PAID",
        value: currency(amountToBePaid),
        color: "error",
        icon: <FaHandHoldingUsd />,
      },
    ],
    [activitiesWithClaims.length, claimStats.totalSettlement, claimStats.totalOPE, amountToBePaid,]
  );
  
    const FilteredData = useFilter({
      data: groupedData, fields: ["customer_name", "order_item_key", "store_name", "audit_type"],
      search: filter.search,
      extraFilters: {
        activityStatus: filter.status,
      },
    });
  
    const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(FilteredData, 10);
  
    const handleRowClick = (group) => {
    setExpandedRowId((prev) => (prev === group.order_item_key ? null : group.order_item_key));
  };

  return (
    <Layout>
      <ClaimsHeader>
        <Tagline>Track and manage your clams</Tagline>
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
      </ClaimsHeader>

      <StatsGrid>
        {stats_card.map((stats) => (
          <StatsCard label={stats.label} value={stats.value} icon={stats.icon} color={stats.color} />
        ))}
      </StatsGrid>

      <Card title="Audit List" headerAction={
        <MonthToggleComponent activeRangeType={activeRangeType} dateRange={dateRange} handleNavigate={handleNavigate} />
      }
      >
        <FilterRow>
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

          <Button variant="outline" size='sm'
            onClick={() => setFilter({ search: "", status: "ALL" })}
          >
            Clear Filters
          </Button>
        </FilterRow>

         <DataTable
        columns={activityColumn}
        data={paginatedData.reverse()}
        isLoading={loading ||claimLoading}
        rowAction={handleRowClick}
        expandedRow={expandedRowId}
        modifiedId={true}
        modifiedIdName="order_item_key"
        renderRow={(group) => {
                const firstItem = group.items?.[0] || group.grouped_data?.[0] || {};
    const totalItems = group.items?.length || group.grouped_data?.length || 0;

            const displayPlannedDate = () => {
              if (group.planned_start_date === group.planned_end_date) {
                return formatDate(group.planned_start_date);
              }
              return (
                <>
                  {formatDate(group.planned_start_date)} <br /> {formatDate(group.planned_end_date)}
                </>
              );
            };
            const ClaimItem = group.claimsItem?.[0];
            const { variant, label } = getClaimStatusVariant(ClaimItem?.expense_status);

            return (
            <>
                <Td>
                <CustomerName>{group.customer_name}</CustomerName>{" "}
                <OrderItemId>{group.order_item_key}</OrderItemId>
                </Td>
                <Td>{firstItem.audit_type}</Td>
                <Td>{displayPlannedDate()}</Td>
                 <Td>
                    {group.claimsCount > 0 ? (
                    <>
                        <ClaimTitle>OPE:</ClaimTitle> <ClaimTitle value={true}>{currency(group.totalOPE)}</ClaimTitle>
                        <br />
                        <ClaimTitle>Settled:</ClaimTitle> <ClaimTitle value={true}>{currency(group.totalSettlement)}</ClaimTitle>
                    </>
                    ) : (
                    "No claims"
                    )}
                </Td>
                <Td>
                    <Badge variant={group.approvedCount > 0 ? "success" : "error"}>
                    {group.approvedCount}/{group.claimsCount} approved
                    </Badge>
                </Td>
                <Td>{totalItems}</Td>
                <Td>
                <Badge variant={variant}>{label}</Badge>
                </Td>
                <Td>
                  {group.activityStatus === "C" && <ButtonGroup>
                    {group?.claimsItem?.length === 0 ? (
                      <Button size='sm' onClick={() => navigate('/clamDetails', { state: { data: { ...group, mode: "ADD" } } })}>
                       <FaPlus /> Add Clam
                      </Button>
                    ) : (
                      <Button size='sm' variant='outline' onClick={() => navigate('/clamDetails', { state: { data: { ...group, mode: "VIEW" } } })}>
                        <FaEye /> View Clam
                      </Button>
                    )}
                  </ButtonGroup>}
                </Td>
            </>
            );
        }}
        
        renderExpandedRow={(group) => (
            <DataTable
            columns={["Audit Type / Store", "Planned Date", "Activity Status"]}
            data={group.items || group.grouped_data || []}
            modifiedId={true}
            modifiedIdName="unique_id" // ensure each item in group.items has a stable unique key; fallback below if not
            renderRow={(employee) => {
                const displayPlannedDate = () => {
                if (employee?.planned_start_date === employee?.planned_end_date) {
                    return formatDate(employee?.planned_start_date);
                }
                return (
                    <>
                    {formatDate(employee?.planned_start_date)} to {formatDate(employee?.planned_end_date)}
                    </>
                );
                };

                const claims = Array.isArray(employee.claims) ? employee.claims : [];
                const firstClaim = claims[0];
                const { variant, label } = getClaimStatusVariant(firstClaim?.expense_status);
                const is_ope_actual = employee?.original_P?.is_ope_actual

                return (
                <>
                    <Td>
                    {employee.audit_type}<br />
                    <StoreLocation title={employee.original_P?.store_name || '-'}>
                        {employee.original_P?.store_name || '-'}
                    </StoreLocation>
                    </Td>
                    <Td>{displayPlannedDate()}</Td>
                    {/* <Td>
                    <Badge variant={firstClaim?.is_approved ? 'success' : 'error'}>
                        {firstClaim?.is_approved ? 'YES' : 'NO'}
                    </Badge>
                    </Td> */}
                    {/* <Td><Badge variant={variant}>{label}</Badge></Td> */}
                    <Td><Badge variant={getStatusVariant(employee.activityStatus)}>{employee.statusDisplay}</Badge></Td>
                    {/* <Td>
                      {is_ope_actual &&
                    employee.activityStatus !== "C" && <Button disabled={true}>Cannot claim</Button>}

                    {!is_ope_actual && <Button disabled={true}>OPE fix , can't claimable</Button>}

                     <Button onClick={() => navigate('/clamDetails', { state: { data: { ...employee, mode: "ADD" } } })}>
                        Add Clam
                      </Button>

                    {employee.activityStatus === "C" && is_ope_actual && (
                  <ButtonGroup>
                    {employee.claims.length === 0 ? (
                      <Button onClick={() => navigate('/clamDetails', { state: { data: { ...employee, mode: "ADD" } } })}>
                        Add Clam
                      </Button>
                    ) : firstClaim?.is_approved && (
                      <Button onClick={() => navigate('/clamDetails', { state: { data: { ...employee, mode: "VIEW" } } })}>
                        View Clam
                      </Button>
                    )}
                  </ButtonGroup>
                )}
                    </Td> */}
                </>
                );
            }}
            />
        )}
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
  )
}

export default ClaimList

const getClaimStatusVariant = (expense_status) => {
  const statusMap = {
    'N': { variant: 'warning', label: 'Not Submitted' },
    'S': { variant: 'success', label: 'Submitted' },
    'A': { variant: 'info', label: 'Approved' },
    'R': { variant: 'error', label: 'Rejected' },
    // 'P': { variant: 'info', label: 'Pending' },
  };

  return statusMap[expense_status] || { variant: 'warning', label: 'Not Submitted' };
};