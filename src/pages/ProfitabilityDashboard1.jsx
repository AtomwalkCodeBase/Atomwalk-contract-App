import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import StatsCard from '../components/StatsCard'
import { FaBoxes, FaFileInvoice, FaHandHoldingUsd, FaUsers, FaWallet } from 'react-icons/fa'
import DataTable, { Td } from '../components/DataTable'
import { usePagination } from '../hooks/usePagination'
import Button from '../components/Button'
import PaginationComponent from '../components/Pagination'
import styled from 'styled-components'
import { theme } from '../styles/Theme'
import Badge from '../components/Badge'
import OrderDetailModal from '../components/modal/OrderDetailModal'
import Card from '../components/Card'
import { useNavigate } from 'react-router-dom'
import { formatDate2, formatRetainerActivities, formatToDDMMYYYY, getMonthRange, getStatusVariant } from '../utils/utils'
import { getEmpAllocationData } from '../services/productServices'
import Tabs from '../components/Tabs'
import { useFilter } from '../hooks/useFilter'

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ResourcesRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.8125rem;
  padding: 0.5rem;
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



const stats_card = [
    {label: "Total Order Items", value: 20, color: "primary",   icon:  <FaBoxes /> },
    {label: "Total Cost", value: "120,000", color: "warning",   icon:  <FaWallet />  },
    {label: "Total OPE", value: "15,000", color: "success",   icon:  <FaFileInvoice /> },
    {label: "AMOUNT TO BE PAID", value: "135,000", color: "error",   icon: <FaHandHoldingUsd /> }
]

const column = [<>Customer<br />Order Item ID</>, <>Audit Type<br />Store Location</>,"No of resource(planned)", "Activity status", "Payment Status", "Payout Amount", "OPE Amount", "Actions"]


const ACTIVITY_LIST_STORAGE_KEY = 'ReceivableListSelection';

const getStoredActivityListSelection = () => {
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.sessionStorage.getItem(ACTIVITY_LIST_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
};

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

const ProfitabilityDashboard = () => {
  const today = new Date();
  const emp_id = localStorage.getItem("cust_emp_id");
    const storedSelection = getStoredActivityListSelection();
    const [isLoading, setIsLoading] = useState(false);
    const [assignedActivity, setAssignedActivity] = useState([]);
    const [tab, setTab] = useState(storedSelection?.tab || "month")
      const [filter, setFilter] = useState({ search: "", status: "" })

      const [activeRangeType, setActiveRangeType] = useState(storedSelection?.activeRangeType || "month");
    

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
        fetchEmpAllocationData(dateRange.start, dateRange.end)
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

  const navigate = useNavigate();
    const [isOpeModalOpen, setIsOpeModalOpen] = useState(false);
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    // const [data, setData] = useState(profitabilityDashboard.orders);

      const FilteredData = useFilter({
        data: assignedActivity, fields: ["customer_name", "order_item_key", "store_name", "audit_type"],
        search: filter.search,
        extraFilters: {
          activityStatus: filter.status,
        },
      });

    
      const { paginatedData, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(FilteredData, 10)
  const TABS = [
    { key: "month", label: "Monthly view" },
    { key: "week", label: "Weekly view" }
  ]

  console.log(paginatedData)

  return (
    <Layout title="Receivable Dashboard">
        <StatsGrid>

        {stats_card.map((stats) => (
            <StatsCard label={stats.label} value={stats.value} icon={stats.icon} color={stats.color} />
        ))}
        </StatsGrid>

<Card>

          <Tabs tabs={TABS} activeTab={tab} setActiveTab={(value) => {
          setTab(value);
          handleRangeChange(value);
        }} />

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
            onClick={() => setFilter({ search: "", status: "ALL" })}
          >
            Clear Filters
          </Button>
        </FilterRow>

        <DataTable
        columns={column}
        data={paginatedData}
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
            return(
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
                 <Td>
                  <ResourcesRow variant="primary">
                    {/* <ResourcesLabel variant="primary">P:</ResourcesLabel> */}
                    <ResourcesValue>
                      <ResourceCount variant="primary">{PlannedResource[0].tl_count || 0}</ResourceCount> TL /
                      <ResourceCount variant="primary">{PlannedResource[0].ex_count || 0}</ResourceCount> EX
                    </ResourcesValue>
                  </ResourcesRow>
                  {/* <ResourcesRow variant="success">
                    <ResourcesLabel variant="success">A:</ResourcesLabel>
                    <ResourcesValue>
                      <ResourceCount variant="success">{orders?.actual_tl || 0}</ResourceCount> TL /
                      <ResourceCount variant="success">{orders?.actual_ex || 0}</ResourceCount> EX
                    </ResourcesValue>
                  </ResourcesRow> */}
                 </Td>
                <Td><Badge variant={getStatusVariant(employee.activityStatus)}>{employee.statusDisplay}</Badge></Td>
                <Td>
                    <Badge variant="error">NO</Badge>
                </Td>
                <Td>4000</Td>
                <Td>1200</Td>
                <Td>
                    <Button onClick={() => navigate("/clamDetails", { state: { data: employee, mode: "VIEW" },})}>
                  View
                </Button>
                </Td>
                </>

            )
        }
    }
        
        />
        <PaginationComponent
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          siblingCount={2}
        />
</Card>

        {/* <OrderDetailModal
  isOpen={isOpeModalOpen}
  onClose={() => setIsOpeModalOpen(false)}
  data={profitabilityDashboard.order_detail_page}
/> */}



        
    </Layout>
  )
}

export default ProfitabilityDashboard

const profitabilityDashboard = {
  summary_cards: {
    total_retainers: 24,
    total_revenue: 48250,
    total_cost: 24500,
    total_ope: 3850,
    net_profit: 19900,
    profit_margin: "41.2%",
    pending_payment: 18200,
    overdue_payment: 5400,
  },

  profitability_trend: [
    { month: "Jan", revenue: 32000, cost: 18000, profit: 14000 },
    { month: "Feb", revenue: 35000, cost: 19500, profit: 15500 },
    { month: "Mar", revenue: 41000, cost: 22500, profit: 18500 },
    { month: "Apr", revenue: 39000, cost: 21000, profit: 18000 },
    { month: "May", revenue: 48250, cost: 24500, profit: 19900 },
  ],

  budget_vs_actual: {
    retainer_budget: 75000,
    consumed_amount: 55800,
    remaining_balance: 19200,
    usage_percentage: "74.4%",
  },

  payment_summary: {
    total_invoiced: 48250,
    received_payment: 30050,
    pending_payment: 12800,
    overdue_payment: 5400,
  },

  resource_utilization: [
    {
      employee_name: "Sarah Miller",
      role: "Lead Systems Architect",
      billable_hours: 148,
      non_billable_hours: 12,
      utilization: "92%",
      total_cost: 11250,
    },
    {
      employee_name: "James Davidson",
      role: "Security Consultant",
      billable_hours: 122,
      non_billable_hours: 18,
      utilization: "87%",
      total_cost: 8450,
    },
    {
      employee_name: "Kaitlyn Thompson",
      role: "Infrastructure Tech",
      billable_hours: 164,
      non_billable_hours: 10,
      utilization: "94%",
      total_cost: 4800,
    },
  ],

  ope_breakdown: [
    {
      category: "Travel",
      amount: 1450,
    },
    {
      category: "Equipment",
      amount: 1200,
    },
    {
      category: "Accommodation",
      amount: 750,
    },
    {
      category: "Miscellaneous",
      amount: 450,
    },
  ],

  status_summary: {
    completed: 18,
    in_progress: 4,
    pending: 2,
  },

  alerts: [
    {
      type: "warning",
      message: "3 retainers exceeded planned budget",
    },
    {
      type: "danger",
      message: "2 invoices overdue by more than 30 days",
    },
    {
      type: "info",
      message: "Infrastructure team utilization exceeded 90%",
    },
  ],

  orders: [
    {
      order_id: "VSTA_20_DACF_01_2027_S00013",
      project_name: "Enterprise Infrastructure Audit",
      client_name: "TechNova Solutions",
      assigned_employees: [
        "Sarah Miller",
        "James Davidson",
        "Kaitlyn Thompson",
      ],
      submitted_photos: 6,
      order_status: "Completed",
      payment_status: "Paid",
      ope_amount: 1690.5,
      payout_amount: 18335,
      total_amount: 20025.5,
      margin: "38%",
      invoice_date: "2025-05-08",
      planned_tl: 3,
      planned_ex: 5,
      actual_tl: 5,
      actual_ex: 5,
    },

    {
      order_id: "VSTA_20_DACF_01_2027_S00014",
      project_name: "Quarterly Tax Compliance",
      client_name: "FinEdge Corp",
      assigned_employees: [
        "Robert Miles",
      ],
      submitted_photos: 0,
      order_status: "In Progress",
      payment_status: "Pending",
      ope_amount: 0,
      payout_amount: 4850,
      total_amount: 4850,
      margin: "22%",
      invoice_date: "2025-05-11",
    planned_tl: 5,
      planned_ex: 10,
      actual_tl: 5,
      actual_ex: 8,
    },

    {
      order_id: "VSTA_20_DACF_01_2027_S00015",
      project_name: "Data Migration Strategy",
      client_name: "CloudAxis Ltd",
      assigned_employees: [
        "Sarah Miller",
        "Daniel Clark",
      ],
      submitted_photos: 3,
      order_status: "Completed",
      payment_status: "Paid",
      ope_amount: 425,
      payout_amount: 1920,
      total_amount: 2345,
      margin: "44%",
      invoice_date: "2025-05-15",
            planned_tl: 3,
      planned_ex: 9,
      actual_tl: 2,
      actual_ex: 6,
    },

    {
      order_id: "VSTA_20_DACF_01_2027_S00016",
      project_name: "Cyber Security Assessment",
      client_name: "SecureNet Inc",
      assigned_employees: [
        "James Davidson",
        "Kaitlyn Thompson",
      ],
      submitted_photos: 4,
      order_status: "Completed",
      payment_status: "Pending",
      ope_amount: 850,
      payout_amount: 5200,
      total_amount: 6050,
      margin: "31%",
      invoice_date: "2025-05-17",
            planned_tl: 2,
      planned_ex: 8,
      actual_tl: 2,
      actual_ex: 9,
    },

    {
      order_id: "VSTA_20_DACF_01_2027_S00017",
      project_name: "Cloud Optimization Review",
      client_name: "SkyBridge Tech",
      assigned_employees: [
        "Daniel Clark",
      ],
      submitted_photos: 2,
      order_status: "Pending",
      payment_status: "Pending",
      ope_amount: 310,
      payout_amount: 2750,
      total_amount: 3060,
      margin: "19%",
      invoice_date: "2025-05-19",
            planned_tl: 7,
      planned_ex: 13,
      actual_tl: 8,
      actual_ex: 12,
    },
  ],

  order_detail_page: {
    order_id: "ORD-99201",
    project_name: "Enterprise Infrastructure Audit",
    client_name: "TechNova Solutions",
    audit_date: "2025-05-08",
    retainer_contract_value: 50000,
    consumed_retainer_value: 31800,
    remaining_retainer_balance: 18200,
    approval_status: "Approved",

    assigned_resources: [
      {
        employee_name: "Sarah Miller",
        role: "TL",
        hours: 42.5,
        rate: 210,
        total: 8925,
      },
      {
        employee_name: "James Davidson",
        role: "EX",
        hours: 18,
        rate: 185,
        total: 3330,
      },
      {
        employee_name: "Kaitlyn Thompson",
        role: "EX",
        hours: 64,
        rate: 95,
        total: 6080,
      },
    ],

    ope_expenses: [
      {
        date: "2025-05-10",
        description: "On-site specialized sensing rental",
        category: "Equipment",
        amount: 1240,
      },
      {
        date: "2025-05-11",
        description: "Regional HQ site access travel",
        category: "Travel",
        amount: 450.5,
      },
    ],

    invoice_history: [
      {
        invoice_no: "INV-2201",
        amount: 8500,
        status: "Paid",
        date: "2025-05-12",
      },
      {
        invoice_no: "INV-2208",
        amount: 11525.5,
        status: "Pending",
        date: "2025-05-18",
      },
    ],

    activity_timeline: [
      {
        activity: "Audit initiated",
        time: "09:00 AM",
        date: "2025-05-08",
      },
      {
        activity: "Resources assigned",
        time: "10:30 AM",
        date: "2025-05-08",
      },
      {
        activity: "Infrastructure photos uploaded",
        time: "02:15 PM",
        date: "2025-05-09",
      },
      {
        activity: "Final report submitted",
        time: "05:40 PM",
        date: "2025-05-11",
      },
    ],
  },
};