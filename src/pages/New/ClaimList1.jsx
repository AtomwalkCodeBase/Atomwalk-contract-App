import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import styled from 'styled-components';
import { MonthToggleComponent } from './ActivityListScreen';
import { DateForApiFormate, formatToDDMMYYYY, getMonthRange, groupByOrderItemId, matchClaimsToActivity } from '../../utils/utils';
import { useActivity } from '../../context/ActivityClaimContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { toast } from 'react-toastify';

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
  padding: ${({ theme }) =>{theme.spacing.sm}} ${({ theme }) =>{theme.spacing.md}};
  border: 1px solid ${({ theme }) =>{theme.colors.border}};
  border-radius: ${({ theme }) =>{theme.borderRadius.md}};
  font-family: ${({ theme }) =>{theme.fonts.body}};
  font-size: ${({ theme }) =>{theme.fontSizes.sm}};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) =>{theme.colors.primary}};
  }
  
  &::placeholder {
    color: ${({ theme }) =>{theme.colors.textLight}};
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


const CLAIM_LIST_STORAGE_KEY = 'claimListSelection';

const ClaimList = () => {
    const emp_id = localStorage.getItem("cust_emp_id");
    const navigate = useNavigate();
    const {activityState, employeeState, claimState, fetchEmpActivityAllocations, fetchContractAllocations, getStoredActivityListSelection, fetchEmployees, fetchClaims } = useActivity();
    const { data: assignedActivity, loading, error } = activityState;
    const { data: profile, loading: employeeLoading, error: employeeError } = employeeState;
    const { data: claimList, loading: claimLoading, error: claimError } = claimState;
    const storedSelection = getStoredActivityListSelection(CLAIM_LIST_STORAGE_KEY) || {};

        const [filter, setFilter] = useState({ search: "", status: "" })
        const [offset, setOffset] = useState(storedSelection?.offset || 0);
            const [activeRangeType, setActiveRangeType] = useState(storedSelection?.activeRangeType || "month");  
             const [expandedRow, setExpandedRow] = useState(null);

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
      // 1. Fetch assigned activity if context has no data
      if (!assignedActivity?.length) {
        const payload = {
          emp_id,
          start_date: formatToDDMMYYYY(dateRange.start),
          end_date: formatToDDMMYYYY(dateRange.end),
        };

        await fetchEmpActivityAllocations(payload);
      }

      // 2. Get employee profile from context or API
      let employeeProfile = profile?.[0];

      if (!employeeProfile?.id) {
        const profileData = await fetchEmployees({emp_id,});

        employeeProfile = profileData?.[0];
      }

      if (!employeeProfile?.id) return;

      // 3. Fetch claims if context has no claim data
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

      	const groupedData = groupByOrderItemId(activitiesWithClaims);

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
              
                const currentMonthRange = getMonthRange({ type: "current", mode: "month"});
              
                setFilter({ search: "", status: "ALL",});
                setActiveRangeType("month");
                setDateRange(currentMonthRange);
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

    	  <Card title="Audit List" headerAction={
		<MonthToggleComponent  activeRangeType={activeRangeType} dateRange={dateRange} handleNavigate={handleNavigate}  />
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

    </Card>
    </Layout>
  )
}

export default ClaimList