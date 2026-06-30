import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import styled from 'styled-components';
import Card from '../components/Card';
import { formatDate, formatRetainerActivities, formatToDDMMYYYY, getMonthRange, getStatusVariant, formatMonthLabel, formatWeekLabel } from '../utils/utils';
import { getEmpAllocationData } from '../services/productServices';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import { parse } from 'date-fns';
import { ActivityCard, ActivityLogs } from './ActivityCard';
import { usePagination } from '../hooks/usePagination';
import DataTable, { Td } from '../components/DataTable';
import PaginationComponent from '../components/Pagination';
// import { AssignEmployee } from '../components/modal/AssignEmployeeModal';
import AddOPEModal from '../components/modal/AddOPEModal';
import OpeListModal from '../components/modal/OpeListModal';
import Badge from '../components/Badge';
import { theme } from '../styles/Theme';
import { useFilter } from '../hooks/useFilter';
import { AssignEmployee } from '../components/modal/Assignemployee';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaUserCheck, FaUsers, FaUserTimes } from 'react-icons/fa';
import StatsCard from '../components/StatsCard';

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  overflow-y: hidden;

  th {
    text-align: left;
    padding: 12px;
    background: #f3f4f6;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;


const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;
  return parse(dateStr, "dd-MMM-yyyy", new Date());
};

const activityColumn = [<>Customer<br />Order Item ID</>, "Audit Type", "Planned Date", "Resources", "Status", "Actions"]

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

const ActivityListScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [assignEmployeeModal, setAssignEmployeeModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [isOpeModalOpen, setIsOpeModalOpen] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "" })

  const [assignedActivity, setAssignedActivity] = useState([]);
  const [activeRangeType, setActiveRangeType] = useState("month");
  const [offset, setOffset] = useState(0);
  const emp_id = localStorage.getItem("cust_emp_id");
  const [dateRange, setDateRange] = useState(() => getMonthRange({ type: "current", mode: "month" }));

  useEffect(() => {
    if (emp_id) {
      fetchEmpAllocationData()
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

  const getFilteredAndSortedActivities = () => {
    return assignedActivity;
  };

  const filteredActivities = getFilteredAndSortedActivities();

  const FilteredData = useFilter({
    data: filteredActivities, fields: ["customer_name", "order_item_key", "store_name", "audit_type"],
    search: filter.search,
    extraFilters: {
      activityStatus: filter.status,
    },
  });

  const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(FilteredData, 10)

  console.log("filteredActivities", filteredActivities)

  const handleViewOPE = (employee, e) => {
    e.stopPropagation();
    setSelectedActivity(employee);
    setIsOpeModalOpen(true);
  };

  const handleAssignResources = (employee, e) => {
    e.stopPropagation();
    setSelectedActivity(employee);
    // navigate('/resource-list', { state: { data: employee } });
    setAssignEmployeeModal(true);

  };
  const handleAssignResources1 = (employee, e) => {
    e.stopPropagation();
    setSelectedActivity(employee);
    navigate('/resource-list', { state: { data: employee } });
    // setAssignEmployeeModal(true);

  };

  const handleAddOPE = (employee, e) => {
    e.stopPropagation();
    setSelectedActivity(employee);
    setOpenOpeModal(true);
  };

  console.log("filteredActivities", filteredActivities)
  // console.log("expandedRowId", expandedRowId)

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

  const getStatusCount = (arr, status) => {
    return arr.filter(item => item.statusDisplay === status).length;
  };

  const assignedCount = getStatusCount(filteredActivities, "Completed");
  const notAssignedCount = getStatusCount(filteredActivities, "Not Assigned");

  const statsData = [
    {
      icon: <FaClipboardList />,
      label: "Total Activity",
      value: filteredActivities.length,
      color: "primary",
    },
    {
      icon: <FaUserTimes />,
      label: "Not Assigned",
      value: notAssignedCount,
      color: "error",
    },
    {
      icon: <FaUserCheck />,
      label: "Activity Completed",
      value: assignedCount,
      color: "success",
    },
  ]

  return (
    <Layout title="Activity List">
      <ClaimsHeader>
        <Tagline>Track and manage your assigned audit tasks</Tagline>
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
        {statsData.map((stats) =>
          <StatsCard icon={stats.icon} label={stats.label} value={stats.value} color={stats.color} />)}
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
          renderRow={(employee) => {
            const displayPlannedDate = () => {
              if (employee.planned_start_date === employee.planned_end_date) {
                return formatDate(employee.planned_start_date)
              } else {
                return (
                  <>
                    {formatDate(employee.planned_start_date)} to  {formatDate(employee.planned_end_date)}
                    {/* <br /> */}
                    {/* {formatDate(employee.planned_end_date)} */}
                  </>
                );
              }
            }
            const isResourceAssigned = employee?.original_A?.resource_list;
            const PlannedResource = getMatchingRetainerList(employee?.original_P)
            return (
              <>
                <Td>
                  <CustomerName>{employee.customer_name}</CustomerName> <OrderItemId>{employee?.original_P?.order_item_key}</OrderItemId>
                </Td>
                <Td>
                  {employee.audit_type}<br />
                  <StoreLocation title={employee.original_P?.store_name || '-'}>
                    {employee.original_P?.store_name || '-'}
                  </StoreLocation>
                </Td>
                <Td>{displayPlannedDate()}</Td>
                {/* <Td>{employee.original_P?.store_name || '-'}</Td> */}
                {/* <Td>BM: {PlannedResource[0].}</Td> */}
                <Td>
                  <ResourcesRow variant="primary">
                    {/* <ResourcesLabel variant="primary">BM:</ResourcesLabel> */}
                    <ResourcesValue>
                      <ResourceCount variant="primary">{PlannedResource[0].tl_count || 0}</ResourceCount> TL /
                      <ResourceCount variant="primary">{PlannedResource[0].ex_count || 0}</ResourceCount> EX
                    </ResourcesValue>
                  </ResourcesRow>
                </Td>
                <Td><Badge variant={getStatusVariant(employee.activityStatus)}>{employee.statusDisplay}</Badge></Td>
                <Td>
                  <ButtonGroup>
                    {/* <Button variant={`${isResourceAssigned ? 'outline' : 'primary'}`} onClick={(e) => handleAssignResources(employee, e)}>
                      {isResourceAssigned ? "Planned" : "Assign"} Resources
                    </Button> */}
                    <Button variant={`${isResourceAssigned ? 'outline' : 'primary'}`} onClick={(e) => handleAssignResources1(employee, e)}>
                      {isResourceAssigned ? "Planned" : "Assign"} Resources
                      {/* Assign Resources */}
                    </Button>
                  </ButtonGroup>
                </Td>
              </>
            )
          }}
          rowAction={(row) => setExpandedRowId(expandedRowId === row.p_id ? null : row.p_id)}
          expandedRow={expandedRowId}
          renderExpandedRow={(employee) => {
            const isResourceAssigned = employee?.original_A?.resource_list
            return (
              <div style={{ padding: '1rem', backgroundColor: '#f9f9f9' }}>
                <ActivityLogs
                  activity={employee}
                  logs={employee.day_logs}
                  isOpen={true}
                  onToggle={() => { }}
                />

                {isResourceAssigned &&
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <Button variant='primary' onClick={(e) => handleAddOPE(employee, e)}>
                      Add OPE
                    </Button>
                    <Button variant='outline' onClick={(e) => handleViewOPE(employee, e)}>
                      View OPE
                    </Button>
                  </div>
                }
              </div>
            )
          }}

        />
        <PaginationComponent
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          siblingCount={2}
        />


        {/* <AssignEmployee
          isOpen={assignEmployeeModal}
          onClose={() => setAssignEmployeeModal(false)}
          activityData={selectedActivity}
          refreshData={fetchEmpAllocationData}
        /> */}

        <AssignEmployee
          isOpen={assignEmployeeModal}
          onClose={() => setAssignEmployeeModal(false)}
          activityData={selectedActivity}
          refreshData={fetchEmpAllocationData}
        />


        <AddOPEModal
          isOpen={openOpeModal}
          onClose={() => setOpenOpeModal(false)}
        />

        <OpeListModal
          isOpen={isOpeModalOpen}
          onClose={() => setIsOpeModalOpen(false)}
          // opeList={selectedActivity?.ope_list || []}
          opeList={[
            { id: 'OPE-001', submitted_date: '03-Jun-2026', amount: '1250.00', submitted_file: 'https://example.com/file1.pdf', file_name: 'receipt_june.pdf' },
            { id: 'OPE-002', submitted_date: '05-Jun-2026', amount: '340.50', submitted_file: null },
          ]}
        />



      </Card>

    </Layout>
  )
}

export default ActivityListScreen