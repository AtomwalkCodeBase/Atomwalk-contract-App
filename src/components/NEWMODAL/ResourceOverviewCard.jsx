import React, { useCallback, useEffect, useState } from 'react'
import Card from '../Card'
import { DateForApiFormate, formatToApiDate, getMonthRange } from '../../utils/utils';
import { useFilter } from '../../hooks/useFilter';
import { useActivity } from '../../context/ActivityClaimContext';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const ScrollableTableWrapper = styled.div`
  max-height: 800px;
  overflow-y: auto;

  border-radius: 8px;
`;

const DateBlock = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#e0e0e0'}88;
  border-radius: 8px;
  overflow: hidden;
`;

const DateHeader = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const HeaderDate = styled.div`
  font-size: ${({ theme }) => theme.fontSize?.md || '0.95rem'};
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.primary || '#333'};
`;

const CountPill = styled.div`
  font-size: 0.8rem;
  color: #555;
  strong { color: #222; }
`;

const Section = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  &:last-child { border-bottom: none; }
`;

const SectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.primary || '#888'};
  margin-bottom: 8px;
`;

const PlanActualGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const FormLabel = styled.label`
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
`;

const FormInput = styled.input`
  padding: 0.25rem 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ccc'};
  border-radius: 4px;
  font-size: 0.7rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`;

const FormSelect = styled.select`
  padding: 0.25rem 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ccc'};
  border-radius: 4px;
  font-size: 0.7rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`;

const EmptyRow = styled.div`
  padding: 14px 10px;
  text-align: center;
  font-size: 0.75rem;
  color: #999;
`;


const ResourceOverviewCard = ({
	dateWiseAssignments,
	dayWindow,
	editingId,
	handleEditDate,
	handleDeleteDate,
	handleFieldChange,
	handleConfirmUpdate,
	handleCancelEdit,
	activityStart,
	activityEnd,
	activityData,
	isActual,
	employeeList,
}) => {
	  const loggedEmpId = localStorage.getItem("cust_emp_id");
	const { activityState, resourceAllocationState, employeeState, fetchEmpActivityAllocations, fetchContractAllocations, fetchEmployees, } = useActivity();
	const { data: resourceAllocationData, loading: resourceAllocationLoading, error: resourceAllocationError } = resourceAllocationState;
	const { start, end } = getMonthRange();


	const [loading, setLoading] = useState(false);

	const [filterDate, setFilterDate] = useState({ start: "", end: "" });
	const [actualDraftsByDate, setActualDraftsByDate] = useState({});
		const [resourceList, setResourceList] = useState([]);


const fetchResourceData = useCallback(async () => {
  const allocationIds = [
    ...new Set(
      (activityData?.allAEntries || [])
        .map((item) => item.id)
        .filter(Boolean)
    )
  ];

  if (!allocationIds.length) {
    setResourceList([]);
    return;
  }

  try {
    setLoading(true);

    // Call API only if data is not already available
    if (!resourceAllocationData || resourceAllocationData.length === 0) {
      await fetchContractAllocations({
        emp_id: loggedEmpId,
        start_date: DateForApiFormate(start),
        end_date: DateForApiFormate(end),
      });
    }

    // Filter the data from context (do not set anything inside fetchContractAllocations)
    const rawData = resourceAllocationData || [];

    const filteredData = Array.isArray(rawData)
      ? rawData.filter((item) =>
          item?.is_active === true &&
          allocationIds.includes(item?.allocation_id || item?.id)
        )
      : [];

    setResourceList(filteredData);
  } catch (error) {
    console.error("Failed to fetch resource data:", error);
    toast.error("Failed to load resource data");
    setResourceList([]);
  } finally {
    setLoading(false);
  }
}, [
  activityData,
  loggedEmpId,
  start,
  end,
  resourceAllocationData,
  fetchContractAllocations,
]);

useEffect(() => {
  fetchResourceData();
}, [fetchResourceData]);

	const plannedDates = [
		...dayWindow
			.filter((d) => {
				const dStr = formatToApiDate(d);
				const hasPlan = (dateWiseAssignments[dStr] || []).length > 0;
				const hasActualDraft = (actualDraftsByDate[dStr]?.rows || []).length > 0;
				return hasPlan || hasActualDraft;
			})
			.map((d) => ({ d, dStr: formatToApiDate(d), date: DateForApiFormate(d, true) })),
	].sort((a, b) => a.d - b.d);

	const filteredPlannedDates = useFilter({
		data: plannedDates,
		fields: [],
		search: "",
		extraFilters: {
			dateRange: {
				field: "date",
				from: filterDate.start ? filterDate.start : null,
				to: filterDate.end ? filterDate.end : null,
			},
		},
	});

	return (
		<Card title="Resource Overview">
			{filteredPlannedDates.length !== 0 &&
				<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
					<FormField>
						<FormLabel>From</FormLabel>
						<FormInput type="date" value={filterDate.start} onChange={(e) => setFilterDate({ ...e, start: e.target.value })} />
					</FormField>
					<FormField>
						<FormLabel>To</FormLabel>
						<FormInput type="date" value={filterDate.end} onChange={(e) => setFilterDate({ ...e, end: e.target.value })} />
					</FormField>
					{(filterDate.start || filterDate.end) && (
						<Button size="sm" variant="outlines" onClick={() => { setFilterDate({ start: "", end: "" }) }}>
							Clear
						</Button>
					)}
				</div>
			}
			<ScrollableTableWrapper>
				{filteredPlannedDates.filter(({ d }) => d instanceof Date && !isNaN(d)).length === 0 ? (
					<EmptyRow style={{ fontSize: "1rem", padding: "2rem" }}>
						No resource allocated
					</EmptyRow>
				) : (
					filteredPlannedDates.filter(({ d }) => d instanceof Date && !isNaN(d))
						.map(({ d, dStr }) => {
							const planAssignments = dateWiseAssignments[dStr] || [];
							const tlCount = planAssignments.filter((a) => a.emp_type === 'T').length;
							const exCount = planAssignments.filter((a) => a.emp_type === 'E').length;

							const actualResourcesForDate = resourceList.filter((row) => {
											if (!row?.s_date || !row?.e_date) return false;
							
											const currentDate = DateForApiFormate(dStr, true);
											const startDate = DateForApiFormate(row.s_date, true);
											const endDate = DateForApiFormate(row.e_date, true);
											
											return (
											  currentDate &&
											  startDate &&
											  endDate &&
											  currentDate >= startDate &&
											  currentDate <= endDate
											);
										  })

										  console.log("actualResourcesForDate", actualResourcesForDate)

}))} 



			</ScrollableTableWrapper>

		</Card>
	)
}

export default ResourceOverviewCard