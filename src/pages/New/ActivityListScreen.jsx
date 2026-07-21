import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import styled from 'styled-components';
import { useActivity } from '../../context/ActivityClaimContext';
import { toast } from 'react-toastify';
import { formatDate, formatMonthLabel, formatToDDMMYYYY, formatWeekLabel, getMonthRange, getStatusVariant, groupByOrderItemId } from '../../utils/utils';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';
import { useFilter } from '../../hooks/useFilter';
import { usePagination } from '../../hooks/usePagination';
import DataTable, { Td } from '../../components/DataTable';
import { useNavigate } from 'react-router-dom';
import PaginationComponent from '../../components/Pagination';
import Badge from '../../components/Badge';
import { FaCheck, FaClipboardList, FaEye, FaEyeSlash, FaMinusCircle, FaMoneyBillWave, FaUserPlus, FaUserTimes } from 'react-icons/fa';
import StatsCard from '../../components/StatsCard';
import { PiClockClockwise } from 'react-icons/pi';

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

const ResourcesValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  /* background: ${({ theme, variant }) => `${theme.colors.primary}10`}; */
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

const ACTIVITY_LIST_STORAGE_KEY = 'activityListSelection';
const activityColumn = [<>Customer<br />Order Item ID</>, <>Audit Type<br />Store Location</>, "Planned Date", "Plan slots" , "Status", "Actions"]

const ActivityListScreen = () => {
	const emp_id = localStorage.getItem("cust_emp_id");
	const navigate = useNavigate();
	const {activityState, fetchEmpActivityAllocations, fetchContractAllocations, getStoredActivityListSelection } = useActivity();
	const { data: assignedActivity, loading, error } = activityState;
	const storedSelection = getStoredActivityListSelection(ACTIVITY_LIST_STORAGE_KEY) || {};

	  const [filter, setFilter] = useState({ search: "", status: "" })
	  const [offset, setOffset] = useState(storedSelection?.offset || 0);
	  const [activeRangeType, setActiveRangeType] = useState(storedSelection?.activeRangeType || "month");  
	   const [expandedRow, setExpandedRow] = useState(null);

	const [resourcePlannedList , setResourcePlannedList] = useState([]);
	const [selectedActivity, setSelectedActivity] = useState(null);

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
        if (emp_id && dateRange?.start && dateRange?.end) {
            getAuditAllocationData();
        }
    }, [dateRange, emp_id]);

useEffect(() => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(
      ACTIVITY_LIST_STORAGE_KEY,
      JSON.stringify({ activeRangeType, offset, dateRange,})
    );
  }
}, [activeRangeType, offset, dateRange]);

	const getAuditAllocationData = async (startOverride, endOverride) => {
		const start = startOverride || dateRange.start;
    	const end = endOverride || dateRange.end;

		if (!start || !end) return;

		const payload = {
			emp_id : emp_id,
			start_date: formatToDDMMYYYY(start),
			end_date: formatToDDMMYYYY(end),
		}
		try {
			const resourceData = await fetchContractAllocations(payload);
			setResourcePlannedList(resourceData);
			await fetchEmpActivityAllocations(payload, resourceData);
		} catch (error) {
			toast.error(error?.response?.data?.message || "Failed to fetch activity allocations");
		}
	}

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
		  window.sessionStorage.removeItem(ACTIVITY_LIST_STORAGE_KEY);
		}
	
		const currentMonthRange = getMonthRange({ type: "current", mode: "month"});
	
		setFilter({ search: "", status: "ALL",});
		setActiveRangeType("month");
		setDateRange(currentMonthRange);
	
		getAuditAllocationData();
	  };

	const handleExpandRow = (row) => {
      setExpandedRow((prev) => prev === row.order_item_id ? null : row.order_item_id,);
    };

	const handleAssignResources = (employee, e) => {
		e.stopPropagation();
		setSelectedActivity(employee);
		navigate('/resource-list', { state: { data: employee } });
  	};

	const groupedData = groupByOrderItemId(assignedActivity, resourcePlannedList);

	  const FilteredData = useFilter({
		data: groupedData,
		fields: [ "customer_name", "order_item_key", "product_name", "store_name", "audit_type",],
		search: filter.search,
		extraFilters: {
		  activityStatus: filter.status,
		},
	  });

	    const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(FilteredData, 10);

		const notAssignedCount = getStatusCount(groupedData, "Not Planned");
		const notStartedCount = getStatusCount(groupedData, "Not Started");
		const completedCount = getStatusCount(groupedData, "Completed");
		const inProgressCount = getStatusCount(groupedData, "In Progress");

		  const statsData = [
			{
			  icon: <FaClipboardList />,
			  label: "Total Audit Item",
			  value: groupedData.length,
			  color: "primary",
			  onClick: (prev) => setFilter({ ...prev, status: "ALL" }),
			},
			{
			  icon: <FaUserTimes />,
			  label: "Not Planned",
			  value: notAssignedCount,
			  color: "error",
			  onClick: (prev) => setFilter({ ...prev, status: "NA" }),
			},
			{
			  icon: <PiClockClockwise />,
			  label: "In Progress",
			  value: inProgressCount,
			  color: "info",
			  onClick: (prev) => setFilter({ ...prev, status: "P" }),
			},
			{
			  icon: <FaCheck />,
			  label: "Audit Completed",
			  value: completedCount,
			  color: "success",
			  onClick: (prev) => setFilter({ ...prev, status: "C" }),
			},
			{
			  icon: <FaMinusCircle />,
			  label: "Not Stared",
			  value: notStartedCount,
			  color: "warning",
			  onClick: (prev) => setFilter({ ...prev, status: "NS" }),
			}
		  ]


  return (
	<Layout title="Audit/OrderItem Allocation List">
		<ClaimsHeader>
        	<Tagline>Track and manage your assigned audit tasks</Tagline>
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
        {statsData.map((stats) =>
          <StatsCard icon={stats.icon} label={stats.label} value={stats.value} color={stats.color}
            sections={stats?.sections} onClick={() => { stats?.onClick(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }} onItemClick={(item) => { stats.onItemClick(item); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) }}
          />)}
      </StatsGrid>

	  <Card title="Audit List" headerAction={
		<MonthToggleComponent activeRangeType={activeRangeType} dateRange={dateRange} handleNavigate={handleNavigate}  />
		} 
		>
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
		    columns={activityColumn}
          	data={[...paginatedData].reverse()}
			isLoading={loading}
			modifiedId
          	modifiedIdName="order_item_id"
          	expandedRow={expandedRow}
			rowAction={handleExpandRow}
				  renderRow={(employee) => {
					  const firstItem = employee?.grouped_data?.[0] || {};
					  return (
						  <>
							  <Td>
								  <CustomerName>{employee.customer_name}</CustomerName> <OrderItemId>{employee?.order_item_key}</OrderItemId>
							  </Td>
							  <Td>
								  {employee.product_name}<br />
								  <StoreLocation title={firstItem.store_name || '-'}>
									  {firstItem?.store_name || '-'}
								  </StoreLocation>
							  </Td>
							  <Td>
								  {employee.planned_start_date === employee.planned_end_date ? (
									  formatDate(employee.planned_start_date)
								  ) : (
									  <>
										  {formatDate(employee.planned_start_date)}
										  <br />
										  {formatDate(employee.planned_end_date)}
									  </>
								  )}
							  </Td>
							  <Td style={{ paddingLeft: "2.5rem" }}>
								  {employee.total_planned_item || 0}
							  </Td>
							  <Td>
								  <Badge variant={getStatusVariant(employee.activityStatus)}>
									  {employee.statusDisplay}
								  </Badge>
							  </Td>
							  <Td>
								  <ButtonGroup>
									 {(employee.activityStatus === "C" || employee.activityStatus === "AP" || employee.activityStatus === "AS") ? (
										  <Button
											  size='sm'
											  onClick={() => navigate('/clamDetails', { state: { data: { ...employee, mode: "ADD" } } })}
										  >
											  <FaMoneyBillWave />
											  Claim
										  </Button> 
									  ) :  (
            <div style={{ width: '100px' }} />  
        )}
									  
									  {employee.total_planned_item === 1 &&
									   (employee.activityStatus === "NS" || employee.activityStatus === "NP") ? (
										  <Button
											  size='sm'
											  variant="primary"
											  onClick={(e) => {
												  e.stopPropagation();
												  const firstItem = employee?.grouped_data?.[0] || {};
												  handleAssignResources(firstItem, e);
											  }}
										  >
											  <FaUserPlus size={16} />
											  Assign Resources
										  </Button>
									  ) : (
										  <Button
											  size='sm'
											  variant="outline"
											  onClick={(e) => {
												  e.stopPropagation();
												  handleExpandRow(employee);
											  }}
										  >
											  {expandedRow === employee.order_item_id ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
											  {expandedRow === employee.order_item_id ? "Hide Allocations" : "View Allocations"}
										  </Button>
									  )}
								  </ButtonGroup>
							  </Td>
						  </>
					  )
				  }}

				  renderExpandedRow={(employee) => {
					const groupedData = employee?.grouped_data || [];
				  
					return (
					  <DataTable
						columns={[ "Sl No.", "Planned Date", "Planned Resource", "Status", "Action"]}
						data={groupedData}
						renderRow={(item) => {
						  const index = groupedData.findIndex((data) => data === item);
						  const plannedResource = getMatchingRetainerList(item?.original_P);
						  const resource = plannedResource?.[0];
						  const isResourceAssigned = item?.original_A?.resource_list?.length > 0;
				  
						  const displayPlannedDate = item.planned_start_date === item.planned_end_date
							  ? formatDate(item.planned_start_date)
							  : `${formatDate(item.planned_start_date)} to ${formatDate(item.planned_end_date)}`;
				  
						  return (
							<>
							  <Td style={{paddingLeft: "1.5rem"}}>{index + 1}</Td>
							  <Td>{displayPlannedDate}</Td>
		
							  <Td>
								  <ResourcesValue>
									<ResourceCount variant="primary">{resource?.tl_count || 0}</ResourceCount>
									{" "}TL /{" "}
									<ResourceCount variant="primary">{resource?.ex_count || 0}</ResourceCount>
									{" "}EX
								  </ResourcesValue>
							  </Td>
				  
							  <Td>
								<Badge variant={getStatusVariant(item.activityStatus)}>
								  {item.statusDisplay}
								</Badge>
							  </Td>
	
							  <Td>
								<Button size='sm'
								  variant={ isResourceAssigned ? "outline" : "primary"}
								  onClick={(e) => {
									e.stopPropagation();
									handleAssignResources(item, e);
								  }}
								>
								  {isResourceAssigned && (item.activityStatus === "NS" || item.activityStatus === "NP")  ? <FaUserPlus /> : <FaEye />}
								  {isResourceAssigned &&  (item.activityStatus === "NS" || item.activityStatus === "NP") ? "Assign" : "View"}{" "}Resources
								</Button>
							  </Td>
							</>
						  );
						}}
					  />
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
  )
}

export default ActivityListScreen

export const MonthToggleComponent = ({activeRangeType, dateRange, handleNavigate}) => {
	return (
	<div>
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
	)
}

function getMatchingRetainerList(original_P = {}) {
  const {
    start_date: originalStartDate,
    end_date: originalEndDate,
    retainer_list = []
  } = original_P;

  return retainer_list.filter(item => {
    return (
      item.a_type === "P" &&
      item.start_date === originalStartDate &&
      item.end_date === originalEndDate
    );
  });
}

  const getStatusCount = (arr, status) => {
    return arr.filter(item => item.statusDisplay === status).length;
  }