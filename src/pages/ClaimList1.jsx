import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import styled from 'styled-components';
import { theme } from '../styles/Theme';
import StatsCard from '../components/StatsCard';
import Button from '../components/Button';
import { DateForApiFormate, formatDate, formatMonthLabel, formatRetainerActivities, formatToDDMMYYYY, formatWeekLabel, getMonthRange, getStatusVariant, matchClaimsToActivity } from '../utils/utils';
import { toast } from 'react-toastify';
import { getEmpAllocationData, getEmpClaim, getemployeeLists } from '../services/productServices';
import DataTable, { Td } from '../components/DataTable';
import { useFilter } from '../hooks/useFilter';
// import { formatDate } from 'date-fns';
import Card from '../components/Card';
import { FaBoxes, FaFileInvoice, FaHandHoldingUsd, FaWallet } from 'react-icons/fa';
import { usePagination } from '../hooks/usePagination';
import PaginationComponent from '../components/Pagination';
import Badge from '../components/Badge';
import { useNavigate } from 'react-router-dom';

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
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.sm}) {
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
const CustomRangeRow = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.5rem;
  border-radius: 8px;
  background: #fafafa;
  border: 1px dashed ${({ theme }) => theme.colors.border};

  span {
    color: #666;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 1024px) {
    gap: 0.7rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
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

const DateInput = styled.input`
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: white;

  @media (max-width: 768px) {
    width: 45%;
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

const ResourcesRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, variant }) =>
    variant === "primary" ? `${theme.colors.primary}10` :
      variant === "success" ? `${theme.colors.success}10` :
        'transparent'
  };
  border-radius:  ${({ theme }) => theme.borderRadius.lg};
`;

const ResourcesLabel = styled.span`
  font-weight: 700;
  min-width: 25px;
  color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.primary :
      variant === "success" ? theme.colors.success :
        theme.colors.primary
  };
`;

const ResourcesValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

const ResourceCount = styled.span`
  font-weight: 600;
  color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.primary :
      variant === "success" ? theme.colors.success :
        theme.colors.primary
  };
  background: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const SearchBox = styled.input`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.sm};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;
const ClaimTitle = styled.span`
  font-weight: 600;
  color: ${({ theme, value }) =>  value ? theme.colors.textLight : theme.colors.text};
`;

const activityColumn = [<>Customer<br />Order Item ID</>, "Audit Type", "Planned Date", "Claim Amount", "Approved/Total Claims","Planned Items", "Claim Status"]

const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function getMatchingRetainerList(original_P = {}) {
  const {
    start_date: originalStartDate,
    end_date: originalEndDate,
    retainer_list = []
  } = original_P;

  return retainer_list.filter(item => {
    return (
      item?.a_type === "P" &&
      item?.start_date === originalStartDate &&
      item?.end_date === originalEndDate
    );
  });
}

const ClamList1 = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({ search: "", status: "" })
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [assignedActivity, setAssignedActivity] = useState([]);
  const [claimList, setClaimList] = useState([]);
  const [activeRangeType, setActiveRangeType] = useState("month");
  const [offset, setOffset] = useState(0);
  const emp_id = localStorage.getItem("cust_emp_id");
  const [dateRange, setDateRange] = useState(() => getMonthRange({ type: "current", mode: "month" }));
  useEffect(() => {
    if (emp_id) {
      fetchEmpAllocationData();
      fetchProfileAndClaims();
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

  // ADD — group activitiesWithClaims by order_item_key
    const groupedActivities = useMemo(() => {
    const groups = {};

    activitiesWithClaims.forEach((activity) => {
        const key = activity?.original_P?.order_item_key || activity?.order_item_key || "UNKNOWN";

        if (!groups[key]) {
        groups[key] = {
            order_item_key: key,
            customer_name: activity.customer_name,
            items: [],
        };
        }

        groups[key].items.push(activity);
    });

    return Object.values(groups)
        .map((group) => {
        // sort items within the group by planned_start_date, earliest first
        const sortedItems = [...group.items].sort((a, b) =>
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

        // aggregate claims across all items in this group
        // const allClaims = sortedItems.flatMap((item) => (Array.isArray(item.claims) ? item.claims : []));
        // const totalOPE = allClaims.reduce((sum, c) => sum + Number(c?.expense_amt || 0), 0);
        // const totalSettlement = allClaims.reduce((sum, c) => sum + Number(c?.settlement_amt || 0), 0);
        // const approvedCount = allClaims.filter((c) => c?.is_approved).length;

        return {
            ...group,
            items: sortedItems,
            earliestPlannedDate,
            latestPlannedDate,
            claimsCount,
            totalOPE,
            totalSettlement,
            approvedCount,
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

  const getFilteredAndSortedActivities = () => {
    return groupedActivities;
  };

  const filteredActivities = getFilteredAndSortedActivities();

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
      value: activitiesWithClaims.length,
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
    data: filteredActivities, fields: ["customer_name", "order_item_key", "store_name", "audit_type"],
    search: filter.search,
    extraFilters: {
      activityStatus: filter.status,
    },
  });

  const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(FilteredData, 10);

  const handleRowClick = (group) => {
  setExpandedRowId((prev) => (prev === group.order_item_key ? null : group.order_item_key));
};


// console.log("paginatedData",paginatedData)

  return (
    <Layout title="Clam screen">
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

      <Card>
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
        isLoading={isLoading}
        rowAction={handleRowClick}
        expandedRow={expandedRowId}
        modifiedId={true}
        modifiedIdName="order_item_key"
        renderRow={(group) => {
            const firstItem = group.items[0] || {};
            const totalItems = group.items.length;

              const displayPlannedDate = () => {
                if (group.earliestPlannedDate === group.latestPlannedDate) {
                return formatDate(group.earliestPlannedDate);
                }
                return (
                <>
                    {formatDate(group.earliestPlannedDate)} to {formatDate(group.latestPlannedDate)}
                </>
                );
            };

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
                <Td>{totalItems} activities</Td>
                <Td>
                <Badge variant="info">Click to expand</Badge>
                </Td>
                {/* <Td>—</Td>
                <Td>—</Td> */}
            </>
            );
        }}
        renderExpandedRow={(group) => (
            <DataTable
            columns={["Audit Type / Store", "Planned Date", "Clam Approved", "Claim Status", "Activity Status", "Actions"]}
            data={group.items}
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
                    <Td>
                    <Badge variant={firstClaim?.is_approved ? 'success' : 'error'}>
                        {firstClaim?.is_approved ? 'YES' : 'NO'}
                    </Badge>
                    </Td>
                    <Td><Badge variant={variant}>{label}</Badge></Td>
                    <Td><Badge variant={getStatusVariant(employee.activityStatus)}>{employee.statusDisplay}</Badge></Td>
                    <Td>
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
                    </Td>
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

export default ClamList1;

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