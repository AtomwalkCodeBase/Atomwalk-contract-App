import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import styled from 'styled-components';
import Card from '../components/Card';
import { formatDate, formatRetainerActivities, formatToDDMMYYYY, getMonthRange, getStatusVariant, formatMonthLabel, formatWeekLabel, getWeekRange, formatDate2, getGroupStatus } from '../utils/utils';
import { getContractAllocationData, getEmpAllocationData } from '../services/productServices';
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
import { FaCheck, FaChevronDown, FaChevronUp, FaClipboardList, FaEye, FaEyeSlash, FaMinusCircle, FaMoneyBillWave, FaUserCheck, FaUserPlus, FaUsers, FaUserTimes } from 'react-icons/fa';
import StatsCard from '../components/StatsCard';
import Tabs from '../components/Tabs';

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

const ACTIVITY_LIST_STORAGE_KEY = 'activityListSelection';

const getStoredActivityListSelection = () => {
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.sessionStorage.getItem(ACTIVITY_LIST_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
};

const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const activityColumn = [<>Customer<br />Order Item ID</>, <>Audit Type<br />Store Location</>, "Planned Date", "Plan slots" , "Status", "Actions"]

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

const groupByOrderItemId = (data = [], resourcePlannedList = []) => {
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

const ActivityListScreen = () => {
  const today = new Date();
  const navigate = useNavigate();
  const storedSelection = getStoredActivityListSelection();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [assignEmployeeModal, setAssignEmployeeModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [isOpeModalOpen, setIsOpeModalOpen] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "" })
  const [expandedRow, setExpandedRow] = useState(null);

  const [assignedActivity, setAssignedActivity] = useState([]);
  const [resourcePlannedList , setResourcePlannedList] = useState([]);
  const [tab, setTab] = useState(storedSelection?.tab || "month")
  const [activeRangeType, setActiveRangeType] = useState(storedSelection?.activeRangeType || "month");
  const [offset, setOffset] = useState(0);
  const emp_id = localStorage.getItem("cust_emp_id");
  const [dateRange, setDateRange] = useState(() => {
    const savedRange = storedSelection?.dateRange;
    if (savedRange?.start && savedRange?.end) {
      return savedRange;
    }
    return getMonthRange({ type: "current", mode: "month" });
  });
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);

  const getCurrentMonth = () =>
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const getCurrentWeek = () => {
    const date = new Date(today);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);

    const yearStart = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);

    return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(storedSelection?.selectedMonth || getCurrentMonth());
  const [selectedWeek, setSelectedWeek] = useState(storedSelection?.selectedWeek || getCurrentWeek());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        ACTIVITY_LIST_STORAGE_KEY,
        JSON.stringify({
          tab,
          activeRangeType,
          selectedMonth,
          selectedWeek,
          dateRange,
        })
      );
    }
  }, [tab, activeRangeType, selectedMonth, selectedWeek, dateRange]);

  useEffect(() => {
    if (emp_id) {
      fetchEmpAllocationData(dateRange.start, dateRange.end);
      fetchEmpPlannedAllocation(dateRange.start, dateRange.end)
    }
  }, [emp_id]);

  const handleMonthChange = (e) => {
    const value = e.target.value;

    setSelectedMonth(value);

    const [year, month] = value.split("-").map(Number);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const range = {
      start: formatDate2(start),
      end: formatDate2(end),
    };

    setDateRange(range);
    fetchEmpAllocationData(range.start, range.end);
  };

  const handleWeekChange = (e) => {
    const value = e.target.value;

    setSelectedWeek(value);

    const range = getWeekRange(value);

    const formattedRange = {
      start: formatDate2(new Date(range.start)),
      end: formatDate2(new Date(range.end)),
    };

    setDateRange(formattedRange);
    fetchEmpAllocationData(formattedRange.start, formattedRange.end);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);

    const start = new Date(value);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const range = {
      start: formatDate2(start),
      end: formatDate2(end),
    };

    setDateRange(range);
    fetchEmpAllocationData(range.start, range.end);
  };
  const handleRangeChange = (type) => {
    setActiveRangeType(type);

    if (type === "month") {
      const [year, month] = selectedMonth.split("-").map(Number);

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      const range = {
        start: formatDate2(start),
        end: formatDate2(end),
      };

      setDateRange(range);
      fetchEmpAllocationData(range.start, range.end);
    } else {
      const range = getWeekRange(selectedWeek);

      const formattedRange = {
        start: formatDate2(new Date(range.start)),
        end: formatDate2(new Date(range.end)),
      };

      setDateRange(formattedRange);
      fetchEmpAllocationData(formattedRange.start, formattedRange.end);
    }
  };

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



  const getFilteredAndSortedActivities = () => {
    return assignedActivity;
  };

  const filteredActivities = getFilteredAndSortedActivities();

  const groupedData = groupByOrderItemId(filteredActivities, resourcePlannedList);

const FilteredData = useFilter({
  data: groupedData,
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

  const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(FilteredData, 10)

  console.log("paginatedData", paginatedData);

  const handleExpandRow = (row) => {
    setExpandedRow((prev) =>
      prev === row.order_item_id ? null : row.order_item_id
    );
  };

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

  const handleClearFilters = () => {

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ACTIVITY_LIST_STORAGE_KEY);
    }

    const currentMonth = getCurrentMonth();
    const currentMonthRange = getMonthRange({
      type: "current",
      mode: "month",
    });

    setFilter({ search: "", status: "ALL",});

    setTab("month");
    setActiveRangeType("month");
    setSelectedMonth(currentMonth);
    setSelectedWeek(getCurrentWeek());
    setDateRange(currentMonthRange);

    fetchEmpAllocationData( currentMonthRange.start, currentMonthRange.end);
  };
  
  // console.log("expandedRowId", expandedRowId)

  // const handleRangeChange = (type) => {
  //   setActiveRangeType(type);
  //   setOffset(0);
  //   const range = getMonthRange({ type: "current", mode: type, offset: 0 });
  //   setDateRange(range);
  //   fetchEmpActivityAllocations(range.start, range.end);
  // };

  const handleNavigate = (direction) => {
    const newOffset = offset + direction;
    setOffset(newOffset);
    const range = getMonthRange({ type: "current", mode: activeRangeType, offset: newOffset });
    setDateRange(range);
    fetchEmpActivityAllocations(range.start, range.end);
  };

  const getStatusCount = (arr, status) => {
    return arr.filter(item => item.statusDisplay === status).length;
  }

  console.log("groupedData",groupedData)

  const notAssignedCount = getStatusCount(groupedData, "Not Assigned");
  // const assignedCount = getStatusCount(filteredActivities, "Not Started", "Completed");
  const notStartedCount = getStatusCount(groupedData, "Not Started");
  const completedCount = getStatusCount(groupedData, "Completed");

  const statsData = [
    // value={filter.status}
    //       onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
    {
      icon: <FaClipboardList />,
      label: "Total Audit Item",
      value: groupedData.length,
      color: "primary",
      onClick: (prev) => setFilter({ ...prev, status: "ALL" }),
    },
    {
      icon: <FaUserTimes />,
      label: "Resource Not Assigned",
      value: notAssignedCount,
      color: "error",
      onClick: (prev) => setFilter({ ...prev, status: "NA" }),
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

  const TABS = [
    { key: "month", label: "Monthly view" },
    { key: "week", label: "Weekly view" }
  ]

  return (
    <Layout title="Audit/OrderItem Allocation List">
      <ClaimsHeader>
        <Tagline>Track and manage your assigned audit tasks</Tagline>
        <div>

          {/* <div style={{ display: 'flex', gap: '0.5rem', justifyContent: "flex-end" }}>
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
          </div> */}

        </div>
      </ClaimsHeader>

      <StatsGrid>
        {statsData.map((stats) =>
          <StatsCard icon={stats.icon} label={stats.label} value={stats.value} color={stats.color}
            sections={stats?.sections} onClick={() => { stats?.onClick(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }} onItemClick={(item) => { stats.onItemClick(item); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) }}
          />)}
      </StatsGrid>

      <Card>
        <Tabs tabs={TABS} activeTab={tab} setActiveTab={(value) => {
          setTab(value);
          handleRangeChange(value);
        }} />
        {/* {tab === "week" && 
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
       
       } */}


        <FilterRow style={{ marginBottom: "1rem" }}>
          <SearchBox type="text" placeholder="Search Auditor's name, ID..." value={filter.search} onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value, }))} />
          {tab === "month" && (<DateInput type="month" value={selectedMonth} onChange={handleMonthChange} />)}

          {tab === "week" && (<DateInput type="week" value={selectedWeek} onChange={handleWeekChange} />)}

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
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </FilterRow>


        <DataTable
          columns={activityColumn}
          data={[...paginatedData].reverse()}
          isLoading={isLoading}
          modifiedId
          modifiedIdName="order_item_id"
          expandedRow={expandedRow}

          rowAction={handleExpandRow}
          renderRow={(employee) => {
            const firstItem = employee?.grouped_data?.[0] || {};

            console.log("employee", employee)

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
      <br/>
      {formatDate(employee.planned_end_date)}
    </>
  )}
</Td>
                 <Td style={{paddingLeft: "2.5rem"}}>
          {employee.total_planned_item || 0}
        </Td>
        <Td>
  <Badge variant={getStatusVariant(employee.activityStatus)}>
    {employee.statusDisplay}
  </Badge>
</Td>
         <Td>
 <ButtonGroup>
    {employee.total_planned_item === 1 ? (
      <Button 
        size='sm' 
        variant="primary"
        onClick={(e) => {
          e.stopPropagation();
          const firstItem = employee?.grouped_data?.[0] || {};
          handleAssignResources1(firstItem, e);
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
    {(employee.activityStatus === "C" || employee.activityStatus === "AP" || employee.activityStatus === "AS")  && (
      <Button 
        size='sm' 
        onClick={() => navigate('/clamDetails', { state: { data: {...employee, mode: "ADD"} } })}
      >
        <FaMoneyBillWave />
        Claim
      </Button>
    )}
  </ButtonGroup>
        </Td>
                {/* <Td>{employee.original_P?.store_name || '-'}</Td> */}
                {/* <Td>BM: {PlannedResource[0].}</Td> */}
                
              </>
            )
          }}
renderExpandedRow={(employee) => {
  const groupedData = employee?.grouped_data || [];

  return (
    <DataTable
      columns={[
        "Sl No.",
        "Planned Date",
        "Planned Resource",
        "Status",
        "Action",
      ]}
      data={groupedData}
      renderRow={(item) => {
        const index = groupedData.findIndex(
          (data) => data === item
        );

        const plannedResource =
          getMatchingRetainerList(item?.original_P);

        const resource = plannedResource?.[0];

        const isResourceAssigned =
          item?.original_A?.resource_list?.length > 0;

        const displayPlannedDate =
          item.planned_start_date === item.planned_end_date
            ? formatDate(item.planned_start_date)
            : `${formatDate(
                item.planned_start_date
              )} to ${formatDate(
                item.planned_end_date
              )}`;

        return (
          <>
            {/* Serial No */}
            <Td style={{paddingLeft: "1.5rem"}}>{index + 1}</Td>

            {/* Planned Date */}
            <Td>{displayPlannedDate}</Td>

            {/* Planned Resource */}
            <Td>
              {/* <ResourcesRow variant="primary"> */}
                <ResourcesValue>
                  <ResourceCount variant="primary">
                    {resource?.tl_count || 0}
                  </ResourceCount>
                  {" "}TL /{" "}
                  <ResourceCount variant="primary">
                    {resource?.ex_count || 0}
                  </ResourceCount>
                  {" "}EX
                </ResourcesValue>
              {/* </ResourcesRow> */}
            </Td>

            {/* Status */}
            <Td>
              <Badge
                variant={getStatusVariant(
                  item.activityStatus
                )}
              >
                {item.statusDisplay}
              </Badge>
            </Td>

            {/* Action */}
            <Td>
              <Button size='sm'
                variant={
                  isResourceAssigned
                    ? "outline"
                    : "primary"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignResources1(item, e);
                }}
              >
                {isResourceAssigned ? <FaEye /> : <FaUserPlus />}
                {isResourceAssigned ? "View" : "Assign"}{" "}Resources
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


        {/* <AssignEmployee
          isOpen={assignEmployeeModal}
          onClose={() => setAssignEmployeeModal(false)}
          activityData={selectedActivity}
          refreshData={fetchEmpActivityAllocations}
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

// {/* <Td>
//                   <ResourcesRow variant="primary">
//                     {/* <ResourcesLabel variant="primary">BM:</ResourcesLabel> */}
//                     <ResourcesValue>
//                       <ResourceCount variant="primary">{PlannedResource[0].tl_count || 0}</ResourceCount> TL /
//                       <ResourceCount variant="primary">{PlannedResource[0].ex_count || 0}</ResourceCount> EX
//                     </ResourcesValue>
//                   </ResourcesRow>
//                 </Td>
//                 <Td><Badge variant={getStatusVariant(employee.activityStatus)}>{employee.statusDisplay}</Badge></Td>
//                 <Td>
//                   <ButtonGroup>
//                     {/* <Button variant={`${isResourceAssigned ? 'outline' : 'primary'}`} onClick={(e) => handleAssignResources(employee, e)}>
//                       {isResourceAssigned ? "Planned" : "Assign"} Resources
//                     </Button> */}
//                     <Button variant={`${isResourceAssigned ? 'outline' : 'primary'}`} onClick={(e) => handleAssignResources1(employee, e)}>
//                       {/* {isResourceAssigned ? "Planned" : "Assign"} Resources */}
//                       {isResourceAssigned ? "View" : "Assign"} Resources
//                       {/* Assign Resources */}
//                     </Button>
//                   </ButtonGroup>
//                 </Td> */}