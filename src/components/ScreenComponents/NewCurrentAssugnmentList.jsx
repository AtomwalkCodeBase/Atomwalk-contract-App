import React, { useCallback, useEffect, useState } from 'react'
import Card from '../Card'
import styled from 'styled-components';
import { DateForApiFormate, formatToApiDate, generateDateRange, normalizeApiAllocations } from '../../utils/utils';
import { toast } from 'react-toastify';
import { getContractAllocationData } from '../../services/productServices';
import ResourceDataRow, { ActualEditForm, PlanEditForm } from './CurrentAssignmentComponents';
import Button from '../Button';
import { LuCopy, LuCopyPlus } from 'react-icons/lu';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';

const ScrollableTableWrapper = styled.div`
  max-height: 800px;
  overflow-y: auto;
  border-radius: 8px;
`;

const EmptyRow = styled.div`
  padding: 14px 10px;
  text-align: center;
  font-size: 0.75rem;
  color: #999;
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

const SubPanel = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
`;

const SubPanelHeader = styled.div`
  background: ${({ $variant, theme }) =>
    $variant === 'plan'
      ? (theme.colors?.backgroundAlt || '#f1f5f9')
      : '#fff7ed'};
  padding: 6px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ $variant }) => ($variant === 'plan' ? '#334155' : '#9a5b13')};
`;

const ResourceRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid #f1f1f1;
  &:first-of-type { border-top: none; }
`;

const ResourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ResourceName = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const ResourceMeta = styled.div`
  font-size: 0.68rem;
  color: #888;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;
const ButtonRows = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings?.md || '0.5rem'};
  margin-bottom: ${({ theme }) => theme.spacings?.md || '0.5rem'};
  gap: ${({ theme }) => theme.spacings?.md || '0.5rem'};
`;
const TotalsBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f9fafb'};
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #333;
`;

const NewCurrentAssugnmentList = ({
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
	employees = [],
}) => {
	const loggedEmpId = localStorage.getItem("cust_emp_id");
	const [resourceList, setResourceList] = useState([]);
	const [loading, setLoading] = useState(false);
	  const [actualDraftsByDate, setActualDraftsByDate] = useState({});
	const [allAEntries, setAllAEntries] = useState(activityData?.allAEntries || []);
	const [actualCutoffDate, setActualCutoffDate] = useState(null);
	  const a_id = activityData?.original_A?.id || activityData?.a_id || null;
	  const [activityStarted, setActivityStarted] = useState(!!a_id);
	// const [isModalOpen, setIsModalOpen] = useState(false);

	// console.log("dateWiseAssignments", JSON.stringify(dateWiseAssignments))
	// console.log("dayWindow", JSON.stringify(dayWindow))
	// console.log("employees", employees)
	// console.log("activityData", activityData)
	// console.log("editingId", editingId)

	//dates having allocated resources,
	const plannedDates =  dayWindow.filter((d) => {
		const dStr = formatToApiDate(d);
		return (dateWiseAssignments[dStr] || []).length > 0;
	  });

	  //fetch all resource for actual
	  	const fetchResourceData = useCallback(async () => {
			  const startDate = activityData?.planned_start_date;
			  const endDate = activityData?.planned_end_date;
			  const allocationIds = [...new Set((activityData?.allAEntries || []).map(item => item.id).filter(Boolean))];
		
			  if (!startDate || !endDate || !allocationIds.length) {
			  // if (!startDate || !endDate) {
				setResourceList([]);
				return;
			  }
		
			  try {
				setLoading(true);
				const responses = await Promise.all(allocationIds.map(allocationId => 
				getContractAllocationData({
					  emp_id: loggedEmpId,
					  allocation_id: allocationId,
					})
				  )
				);
				const mergedData = responses.flatMap((response) => Array.isArray(response?.data) ? response.data : []);
				setResourceList(normalizeApiAllocations(mergedData));
				// console.log("mergedData", mergedData)
			  } catch (error) {
				console.error("Failed to fetch resource data:", error);
				toast.error("Failed to load resource data");
				setResourceList([]);
			  } finally {
				setLoading(false);
			  }
			}, [activityData, loggedEmpId]);
		
		  useEffect(() => {
			fetchResourceData();
		  }, [fetchResourceData]);

// 		  useEffect(() => {
//   if (!resourceList.length) return;

//   const normalizedResources = normalizeApiAllocations(resourceList);

//   setActualDraftsByDate((prev) => {
//     const next = { ...prev };

//     normalizedResources.forEach((resource) => {
//       if (!resource.start_date || !resource.end_date) return;

//       const resourceDates = generateDateRange( resource.start_date, resource.end_date, { format: true });

//       resourceDates.forEach((dStr) => {
//         if (!next[dStr]) {
//           next[dStr] = {
//             confirmed: false,
//             rows: [],
//           };
//         }

//         const rowKey =`resource-${resource.allocation_id}-${resource.emp_id}-${dStr}`;
//         const alreadyExists = next[dStr].rows.some(
//           (row) => row.source === "api" &&  row.id === resource.id && row.allocation_id === resource.allocation_id
//         );

//         if (!alreadyExists) {
//           next[dStr] = {
//             ...next[dStr],
//             rows: [
//               ...next[dStr].rows,
//               {
//                 ...resource,
// 				rowKey,

//                 // required by your edit logic
//                 original_emp_id: resource.emp_id,
//                 resource_id: resource.id,

//                 // identify source
//                 source: "api",
//               },
//             ],
//           };
//         }
//       });
//     });

//     return next;
//   });
// }, [resourceList]);

const getApiActualRowsForDate = useCallback(
  (dStr) => {
    const currentDate = DateForApiFormate(dStr, true);

    return resourceList
      .filter(
        (row) =>
          row.start_date &&
          row.end_date &&
          currentDate >= row.start_date &&
          currentDate <= row.end_date
      )
      .map((row) => ({
        ...row,
        rowKey: `resource-${row.id}-${row.allocation_id}-${dStr}`,
        resource_id: row.id,
        original_emp_id: row.emp_id,

        // this UI row represents this date
        actual_date: currentDate,
        source: "api",
      }));
  },
  [resourceList]
);

const getActualRowsForDate = useCallback(
  (dStr) => {
    const draft = actualDraftsByDate[dStr];

    // edited/copied/new draft exists
    if (draft) {
      return {
        rows: draft.rows || [],
        source: "draft",
        hasApiData:
          getApiActualRowsForDate(dStr).length > 0,
      };
    }

    const apiRows = getApiActualRowsForDate(dStr);

    return {
      rows: apiRows,
      source: "api",
      hasApiData: apiRows.length > 0,
    };
  },
  [
    actualDraftsByDate,
    getApiActualRowsForDate,
  ]
);

// const getActualRowsForDate = useCallback(
//   (dStr) => {
//     const apiRows = getApiActualRowsForDate(dStr);

//     // API exists for this date
//     if (apiRows.length > 0) {
//       return {
//         rows: apiRows,
//         source: "api",
//         hasApiData: true,
//       };
//     }

//     // No API data -> use copy/new draft
//     const draftRows =
//       actualDraftsByDate[dStr]?.rows || [];

//     return {
//       rows: draftRows,
//       source: "draft",
//       hasApiData: false,
//     };
//   },
//   [
//     getApiActualRowsForDate,
//     actualDraftsByDate,
//   ]
// );

const canUseActualDate = useCallback(
  (dStr) => {
    if (!allAEntries.length) return false;

    const currentDate =
      DateForApiFormate(dStr, true);

    const latestStartedDate = allAEntries
      .map((entry) =>
        DateForApiFormate(
          entry.start_date,
          true
        )
      )
      .filter(Boolean)
      .sort()
      .at(-1);

    if (!latestStartedDate) return false;

    return currentDate <= latestStartedDate;
  },
  [allAEntries]
);

const createActualRow = ({ row, dStr, source = "copy"}) => {
  const dateComparable = DateForApiFormate(dStr, true);

  return {
    id: row.id ?? null,
    rowKey: row.rowKey || crypto.randomUUID(),
    resource_id: row.resource_id ?? row.id ?? null,
    allocation_id: row.allocation_id ?? null,
    original_emp_id: row.original_emp_id ?? row.emp_id ?? null,
    emp_id: row.emp_id,
    employee_name: row.employee_name || row.name || "",
    emp_type: row.emp_type,
    remarks:row.remarks || "",
    contract_rate: Number(row.contract_rate) || 0,
    start_date: row.start_date || dateComparable,
    end_date: row.end_date || dateComparable,
    is_approved: Boolean(row.is_approved),
    is_present:Boolean(row.is_present),
    is_active: row.is_active ?? true,
    order_item_id: row.order_item_id,
    approve_date: row.approve_date,
    ope_amt: Number(row.ope_amt) || 0,
    app_remarks: row.app_remarks || "",
    source,
  };
};

const handleActualEmployeeChange = ( dStr, rowKey, empId ) => {
  const employee = employees.find((emp) => String(emp.emp_id) === String(empId));

  if (!employee) return;

  setActualDraftsByDate((prev) => {
    const existingDraft = prev[dStr];
    const baseRows = existingDraft?.rows?.length ? existingDraft.rows : getApiActualRowsForDate(dStr);
    const targetRow = baseRows.find((row) => row.rowKey === rowKey);

    if (!targetRow) return prev;

    if ( targetRow.is_present || targetRow.is_approved) {
      return prev;
    }

    return {
      ...prev,
      [dStr]: {
        confirmed: false,
        rows: baseRows.map((row) =>
          row.rowKey === rowKey
            ? {
                ...row,
                emp_id: employee.emp_id,
				original_emp_id: row.original_emp_id ?? row.emp_id,
                employee_name: employee.name || employee.employee_name,
                emp_type: Number( employee.grade_level) > 1 ? "T" : "E",
                __dirty: true,
              }
            : row
        ),
      },
    };
  });
};

const handleRemoveActualRow = ( dStr, rowKey) => {
  setActualDraftsByDate((prev) => {
    const existingDraft = prev[dStr];

    const baseRows = existingDraft?.rows?.length ? existingDraft.rows : getApiActualRowsForDate(dStr);
    const targetRow =baseRows.find(
        (row) => row.rowKey === rowKey
      );

    if (!targetRow) return prev;

    if ( targetRow.is_present || targetRow.is_approved) {
      toast.info("Present or approved resource cannot be deleted");
      return prev;
    }

    return {
      ...prev,
      [dStr]: {
        confirmed: false,
        rows: baseRows.filter((row) =>
            row.rowKey !== rowKey
        ),
      },
    };
  });
};

const handleCopyActual = ({ isAll = false, dStr = null, planAssignments = []} = {}) => {
  setActualDraftsByDate((prev) => {
    const next = { ...prev };

    const copyForDate = (dateKey, assignments) => {
      if (!assignments.length) return;

      // API actual exists for this date -> don't copy
      const apiRows = getApiActualRowsForDate(dateKey);
      if (apiRows.length > 0) return;

      // Draft already exists -> don't overwrite
      if (next[dateKey]?.rows?.length) return;

      const comparableDate = DateForApiFormate(dateKey, true);

      next[dateKey] = {
        confirmed: false,

        rows: assignments.map((row) =>
          createActualRow({
            row: {
              ...row,
              start_date: comparableDate,
              end_date: comparableDate,
            },
            dStr: dateKey,
            source: "copy",
          })
        ),
      };
    };

    // COPY ALL
    if (isAll) {
      plannedDates.forEach((date) => {
        const dateKey = formatToApiDate(date);

        // only up to started/current allowed date
        if (!canUseActualDate(dateKey)) return;

        const assignments = dateWiseAssignments[dateKey] || [];
        copyForDate(dateKey, assignments);
      });

      return next;
    }

    // COPY SINGLE
    if (!dStr || !canUseActualDate(dStr)) {
      return prev;
    }

    copyForDate(dStr, planAssignments);

    return next;
  });
};

const handleActualFieldChange = ( dStr, rowKey, field, value) => {
  setActualDraftsByDate((prev) => {
    const existingDraft = prev[dStr];
    const baseRows = existingDraft?.rows?.length ? existingDraft.rows : getApiActualRowsForDate(dStr);
    const targetRow = baseRows.find((row) => row.rowKey === rowKey);

    if (!targetRow) return prev;

    // locked actual
    if ( targetRow.is_present === true || targetRow.is_approved === true) {
      return prev;
    }

    const updatedRow = {
      ...targetRow,
      [field]: value,
      __dirty: true,
    };

    const activityStartComparable = DateForApiFormate(activityStart, true);

    const maxActualDate = actualCutoffDate;

    // Validate start date
    if (field === "start_date") {
      const newStart = DateForApiFormate(value, true);

      if ( activityStartComparable && newStart < activityStartComparable) {
        toast.error("Start date cannot be before activity start date");
        return prev;
      }

      if (updatedRow.end_date && newStart > DateForApiFormate(updatedRow.end_date,true)) {
        toast.error("Start date cannot be after end date");
        return prev;
      }

      updatedRow.start_date = newStart;
    }

    // Validate end date
    if (field === "end_date") {
      const newEnd = DateForApiFormate(value, true);

      if ( maxActualDate && newEnd > maxActualDate) {
        toast.error("End date cannot be after current allowed actual date");
        return prev;
      }

      if ( updatedRow.start_date && newEnd < DateForApiFormate(updatedRow.start_date, true)) {
        toast.error("End date cannot be before start date");
        return prev;
      }

      updatedRow.end_date = newEnd;
    }

    return {
      ...prev,

      [dStr]: {
        confirmed: false,
        rows: baseRows.map((row) =>
          row.rowKey === rowKey ? updatedRow : row
        ),
      },
    };
  });
};

const handleStartActivity = async (dStr) => {
  try {
    
	console.log("api is calling handleStartActivity ")

    setActualCutoffDate(
      DateForApiFormate(dStr, true)
    );

    toast.success("Activity started");
  } catch (error) {
    toast.error("Failed to start activity");
  }
};

const getEditableActualRows = useCallback(
  (prev, dStr) => {
    // Once a draft exists, continue editing that draft
    if (prev[dStr]) {
      return prev[dStr].rows || [];
    }

    // Otherwise clone API rows for this date
    return getApiActualRowsForDate(dStr);
  },
  [getApiActualRowsForDate]
);

const handleCancelCopyActual = (dStr) => {
  setActualDraftsByDate((prev) => {
    const draft = prev[dStr];

    if (!draft) return prev;

    if (draft.confirmed) {
      toast.info("Confirmed actual cannot be cancelled");
      return prev;
    }

    const next = { ...prev };
    delete next[dStr];

    return next;
  });
};

const handleAddActualRow = (dStr) => {
  if (!canUseActualDate(dStr)) {
    toast.info("Actual cannot be added for this date");
    return;
  }

  setActualDraftsByDate((prev) => {
    const baseRows =
      getEditableActualRows(prev, dStr);

    const dateComparable =
      DateForApiFormate(dStr, true);

    const newRow = {
      id: null,
      resource_id: null,
      allocation_id: null,

      rowKey: crypto.randomUUID(),

      original_emp_id: null,

      emp_id: "",
      employee_name: "",
      emp_type: "E",

      start_date: dateComparable,
      end_date: dateComparable,

      remarks: "",
      contract_rate: 0,

      is_approved: false,
      is_present: false,
      is_active: true,

      source: "extra",

      __isNew: true,
      __dirty: true,
    };

    return {
      ...prev,

      [dStr]: {
        confirmed: false,

        rows: [
          ...baseRows.map((row) => ({
            ...row,
          })),
          newRow,
        ],
      },
    };
  });
};

const handleConfirmActual = (dStr) => {
  const {
    rows,
  } = getActualRowsForDate(dStr);

  if (!rows.length) {
    toast.error("No actual resources to confirm");
    return;
  }

  const hasIncompleteRow = rows.some(
    (row) =>
      !row.emp_id ||
      !row.emp_type ||
      !row.start_date ||
      !row.end_date
  );

  if (hasIncompleteRow) {
    toast.error(
      "Please complete all resource details"
    );
    return;
  }

  const hasInvalidRange = rows.some(
    (row) => {
      const start =
        DateForApiFormate(
          row.start_date,
          true
        );

      const end =
        DateForApiFormate(
          row.end_date,
          true
        );

      return (
        !start ||
        !end ||
        start > end ||
        (
          actualCutoffDate &&
          end > actualCutoffDate
        )
      );
    }
  );

  if (hasInvalidRange) {
    toast.error(
      "Actual dates are invalid or exceed the allowed date"
    );
    return;
  }

  const duplicateEmployees = rows.some(
    (row, index) =>
      rows.findIndex(
        (item) =>
          item.emp_id === row.emp_id
      ) !== index
  );

  if (duplicateEmployees) {
    toast.error(
      "Same resource cannot be added twice"
    );
    return;
  }

  // Important:
  // If rows currently come directly from API,
  // clone them into draft before confirming.
  setActualDraftsByDate((prev) => {
    const baseRows =
      getEditableActualRows(prev, dStr);

    return {
      ...prev,

      [dStr]: {
        confirmed: true,

        rows: baseRows.map((row) => ({
          ...row,
        })),
      },
    };
  });

  toast.success("Actual confirmed");
};
const handleEditActualAgain = (dStr) => {
  setActualDraftsByDate((prev) => {
    const existingDraft = prev[dStr];

    // Already have local draft
    if (existingDraft) {
      return {
        ...prev,

        [dStr]: {
          ...existingDraft,
          confirmed: false,
        },
      };
    }

    // No draft yet -> clone API rows
    const apiRows =
      getApiActualRowsForDate(dStr);

    if (!apiRows.length) {
      return prev;
    }

    return {
      ...prev,

      [dStr]: {
        confirmed: false,

        rows: apiRows.map((row) => ({
          ...row,
        })),
      },
    };
  });
};

const handleCancelCopyAllActual = () => {
  setActualDraftsByDate((prev) => {
    const next = {};

    Object.entries(prev).forEach(
      ([dStr, draft]) => {
        // keep confirmed drafts
        if (draft.confirmed) {
          next[dStr] = draft;
        }
      }
    );

    return next;
  });
};

  const hasUnconfirmedDrafts = Object.values(actualDraftsByDate).some((d) => !d.confirmed);


  return (
	<>
	<Card title="Current Assignments" hoverable={false}
    headerAction={
      <RenderButton
        activityStarted={activityStarted}
        handleStartActivity={handleStartActivity}
        hhandleCopyAllActual={() => handleCopyActual({ isAll: true })}
        handleCancelCopyAllActual={handleCancelCopyAllActual}
        hasUnconfirmedDrafts={hasUnconfirmedDrafts}
        // handleOpenActualRangeModal={handleOpenActualRangeModal}
	/>
	}
	>
		<ScrollableTableWrapper>
			 {plannedDates.length === 0 ? (
            <EmptyRow style={{ fontSize: "1rem", padding: "2rem" }}>
              No resource allocated
            </EmptyRow>
          ) : (
			//resources for planned tab
			 plannedDates.map((d) => {
						  const dStr = formatToApiDate(d);
						  const planAssignments = dateWiseAssignments[dStr] || [];
						  const tlCount = planAssignments.filter((a) => a.emp_type === 'T').length;
						  const exCount = planAssignments.filter((a) => a.emp_type === 'E').length;

						  //resources for actual tab
			const { rows: displayedActualRows,  hasApiData,confirmed,} = getActualRowsForDate(dStr);

			const actualDraft = actualDraftsByDate[dStr];

			const canAddActual = canUseActualDate(dStr);

			const hasResourceActual = displayedActualRows.length > 0;

			 //for identify emp is replaces or not  
			  const planEmpIds = new Set(planAssignments.map((a) => a.emp_id));

			  //Total Amount for planned and actual contract rate
			  const planTotal = planAssignments.reduce((sum, r) => sum + (Number(r.contract_rate) || 0),0);
			const actualTotal = displayedActualRows.reduce((sum, r) => sum + (Number(r.contract_rate) || 0), 0);

			const hasActual = allAEntries.some((entry) => entry.start_date === dStr);
			const hasUnlockedRows = displayedActualRows.some((row) => !row.is_present && !row.is_approved );

			return(
				<DateBlock key={dStr}>
					<DateHeader>
                    <HeaderDate>
                      {d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }).toUpperCase()}
                    </HeaderDate>
                    <CountPill>
                      TL: <strong>{tlCount}</strong> &nbsp;&nbsp; EX: <strong>{exCount}</strong>
                    </CountPill>
                  </DateHeader>

				  <Section>
					<SectionTitle>Resource Details</SectionTitle>
					<PlanActualGrid>
						{/* PLAN */}
						<SubPanel>
                        <SubPanelHeader $variant="plan"  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span>Plan</span>

                           {/* {canAddActual && !hasApiData && !actualDraft && planAssignments.length > 0 && ( */}
                              <Button size="sm" variant="outline" onClick={() => handleCopyActual({ isAll: false, dStr, planAssignments })}>
                                <LuCopy /> Copy Actual
                              </Button>
                            {/* )} */}

                            {activityStarted && actualDraft && !actualDraft.confirmed && (
                              <Button size="sm" variant="outlines" onClick={() => handleCancelCopyActual(dStr)}>
                                Cancel Copy Actual
                              </Button>
                            )}
                        </SubPanelHeader>
                        {planAssignments.length === 0 ? (
                          <EmptyRow>No resources planned</EmptyRow>
                        ) : (
                          planAssignments.map((row) => {
                            const disableAction = row.is_approved || activityData?.allAEntries?.length;
                            const isEditing = editingId === row.rowKey;

                            if (isEditing) {
                              return (
                                <PlanEditForm
                                  key={row.rowKey}
                                  row={row}
                                  onChange={handleFieldChange}
                                  onConfirm={handleConfirmUpdate}
                                  onCancel={handleCancelEdit}
                                  activityStart={activityStart}
                                  activityEnd={activityEnd}
                                />
                              );
                            }

                            return (
							<ResourceDataRow
								key={row.rowKey}
								row={row}
								showActions={true}
								disableActions={disableAction}
								onEdit={handleEditDate}
								onDelete={handleDeleteDate}
								onDateStr={dStr}
								showDates={true} // Explicitly show dates
							/>
                            );
                          })
                        )}
                      </SubPanel>
						{/* ACTUAL */}
						  <SubPanel>
						<SubPanelHeader $variant="actual" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span>Actual</span>
						</SubPanelHeader>

						  {displayedActualRows.length === 0 && ( <EmptyRow>No actual data recorded</EmptyRow>)}

						  {displayedActualRows.map((row) => {
							const disableActualAction = row.is_approved === true || row.is_present === true;
							const isReplaced = row.original_emp_id != null && row.emp_id !== row.original_emp_id;
  							const isNotPlanned = !planEmpIds.has(row.emp_id);

							return (
							<ActualEditForm
								key={row.rowKey}
								row={row}
								employees={employees}
								readOnly={disableActualAction}
								isReplaced={isReplaced}
								notPlannedForDate={isNotPlanned}
								onFieldChange={(field, value) => {
								if (disableActualAction) return;
								handleActualFieldChange( dStr, row.rowKey, field, value);
								}}

								onEmployeeChange={(emp_id) => {
								if (disableActualAction) return;
								handleActualEmployeeChange( dStr, row.rowKey, emp_id);
								}}

								onRemove={() => {
								if (disableActualAction) return;
								handleRemoveActualRow( dStr, row.rowKey);
								}}
							/>
							);
						})}

						{!canUseActualDate(dStr) && !confirmed && (
							<div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", padding: "8px 10px",}}>
								<Button size="sm" variant="outline" onClick={() => handleAddActualRow(dStr)}>
								<FaUserPlus /> Add resource
								</Button>

								{displayedActualRows.length > 0  > 0 && (
								<Button size="sm" variant="success" onClick={() => handleConfirmActual(dStr)}>
									<FaUserCheck /> Confirm
								</Button>
								)}
							</div>
							)}

							{confirmed && canUseActualDate(dStr) && (
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px",}}>
								<Badge variant="success" style={{ fontSize: "0.6rem" }}>
								Confirmed
								</Badge>

								<Button size="sm" variant="outlines" onClick={() => handleEditActualAgain(dStr)}>
								Edit
								</Button>
							</div>
							)}
						</SubPanel>


					</PlanActualGrid>
					                    <TotalsBar style={{ marginTop: 10 }}>
                      <span>Plan Total: ₹{planTotal}</span>
                      <span>Actual Total: ₹{actualTotal}</span>
                    </TotalsBar>

				  </Section>
				                    <ButtonRows>
                    {hasActual &&
                      <>
                        <Button>Add claims</Button>
                        <Button>View claims</Button>
                      </>
                    }
{/* 
                    {planAssignments.length !== 0 && activityData.activityStatus === "C" && <Button onClick={() => handleOpenActualModal(dStr)}>
                      {hasActual ? "Update Actual" : "Add Actual"}
                    </Button>} */}
                     {/* <Button onClick={() => handleConfirmFinalActual(dStr)}>
                      Add Actual for all Dates
                    </Button> */}
                  </ButtonRows>
				</DateBlock>
			)


})
		)}

		</ScrollableTableWrapper>

	</Card>
	</>
  )
}

export default NewCurrentAssugnmentList

const RenderButton = ({ activityStarted, handleStartActivity, handleCopyAllActual, handleCancelCopyAllActual, hasUnconfirmedDrafts, handleOpenActualRangeModal}) => {

  if (!activityStarted) {
    return (
      <ButtonRows>
        <Button size="sm" variant="primary" onClick={handleStartActivity}>
          Start Activity
        </Button>
      </ButtonRows>
    );
  }

  return(
    <ButtonRows>
     <Button size="sm" variant="primary" onClick={handleCopyAllActual}>
      <LuCopyPlus /> Copy Actual (All Dates)
    </Button> 

    {hasUnconfirmedDrafts && (
        <Button size="sm" variant="outlines" onClick={() => handleCancelCopyAllActual()}>
          Cancel Copy Actual
        </Button>
      )}

     {/* <Button size="sm" variant="outline" onClick={() => handleOpenActualRangeModal()}>
        {hasActual ? "Update Actual" : "Add Actual"}
        <FaPlus /> Add Actual
      </Button> */}
    
    </ButtonRows>
  )
}