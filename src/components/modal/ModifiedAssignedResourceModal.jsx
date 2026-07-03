import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../Layout";
import { buildDayWindow, buildPayloads, DateForApiFormate, formatToApiDate, generateDatesBetween, getMonthRange, groupDatesIntoRanges, mergeAllocations, normalizeApiAllocations, normalizeOverlappingAllocations, splitAllocationByDate, splitAllocationForEdit } from "../../utils/utils";
import { useLocation } from "react-router-dom";
import { getContractAllocationData, getemployeeLists, postActivityAllocationData, postAllocationData } from "../../services/productServices";
import { toast } from "react-toastify";
import Tabs from "../Tabs";
import Button from "../Button";
import Card from "../Card";
import { ResourceAvailability } from "../ScreenComponents/ResourceAvaiblityCard copy";
import CurrentAssignments from "../ScreenComponents/CurrentAssignResourceList copy";
import { MdArrowBack } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";

const ResourceAllocation = () => {
  const location = useLocation();
  const activityData = location.state?.data;
  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const { start, end } = getMonthRange();

  const [editingId, setEditingId]=useState(null);
  const [tab, setTab] = useState("PLAN");
  const [loading, setLoading] =useState(false)

  const [employees, setEmployees] = useState([]);
  const [workingAllocations, setWorkingAllocations] = useState([]);
  const [busyAllocations, setBusyAllocations] = useState([]);
  const [editBackup,setEditBackup] = useState({});

  const activityStart = activityData?.original_P?.start_date || activityData?.planned_start_date || "";
  const activityEnd = activityData?.original_P?.end_date || activityData?.planned_end_date || "";

  const activityDates = useMemo(() => {
    const dates = [];
    const startComparable = DateForApiFormate(activityStart, true);
    const endComparable = DateForApiFormate(activityEnd, true);
    if (!startComparable || !endComparable) return dates;
    const [sY, sM, sD] = startComparable.split("-").map(Number);
    const [eY, eM, eD] = endComparable.split("-").map(Number);
    const cur = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);
    let limit = 0;
    while (cur <= end && limit < 366) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
      limit++;
    }
    return dates;
  }, [activityStart, activityEnd]);

  const dayWindow = useMemo(() => activityDates, [activityDates]);

  const employeeDateMap = useMemo(()=>{
    const map={};

    workingAllocations.filter(x=> x.action !== "DELETE" && x.is_active).forEach(row=>{
        if(!map[row.emp_id])
            map[row.emp_id]={};

        const dates=generateDatesBetween(row.start_date, row.end_date );
        dates.forEach(d=>{
            map[row.emp_id][d]=row.rowKey;
        })
    });
    return map;

},[workingAllocations]);

  const busyDateMap = useMemo(()=>{
    const map={};
    busyAllocations.filter( row => row.action !== "DELETE" && row.action!=="EDIT" && row.is_active).forEach(row=>{
          if (row.allocation_id === activityData?.original_P?.id) return;
        if(!map[row.emp_id])  map[row.emp_id]={};

        const dates=generateDatesBetween(row.start_date, row.end_date);
        dates.forEach(date=>{
			// map[row.emp_id][d]=true;
			 if (!employeeDateMap[row.emp_id]?.[date]) {
				map[row.emp_id][date] = true;
				}
		})
    })
    return map;
},[busyAllocations, employeeDateMap]);
  //       const dayWindow = useMemo(() => {
  //   return activityDates; // Use full activity range instead of buildDayWindow
  // }, [activityDates]);

  useEffect(() => {
	fetchEmployees();
	loadAllData();
  }, []);

  const loadExisting = async (params = {}) => {
	if (!params) return;

	try {
	  const res = await getContractAllocationData(params);
	  return (res?.data || []).map((item) => ({
		...item,
		_rowKey: item.id || `existing_${item.emp_id}_${item.start_date || item.s_date}`,
		start_date: item.start_date
		  ? DateForApiFormate(item.start_date, true)
		  : item.s_date
			? DateForApiFormate(item.s_date, true)
			: "",
		end_date: item.end_date
		  ? DateForApiFormate(item.end_date, true)
		  : item.e_date
			? DateForApiFormate(item.e_date, true)
			: "",
	  }));
	} catch (error) {
	  toast.error("Failed to load existing allocations");
	}
  };

  const loadAllData = async () => {
	const { id: allocation_id } = activityData?.original_P || {};
	try {
	  const [ currentAllocations, busyData ] = await Promise.all([
		//Resource for Particular Activity
		loadExisting({ allocation_id, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
		//Resource comes under that retainer
		loadExisting({ emp_id: loggedEmpId, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
	  ]);

	 setWorkingAllocations(normalizeApiAllocations(currentAllocations));
	 setBusyAllocations(normalizeApiAllocations(busyData)
    .filter(
        x =>
        x.allocation_id !==
        activityData?.original_P?.id
    ));

	} catch {
	  toast.error("Failed to load allocation data");
	}
  };

  const fetchEmployees = async () => {
	try {
	  setLoading(true);
	  const res = await getemployeeLists({ rm_emp_id: loggedEmpId });
	  setEmployees(res?.data?.filter((e) => e.is_verified) || []);
	} catch {
	  toast.error("Failed to fetch employees");
	} finally {
	  setLoading(false);
	}
  };

	const handleDeleteAllocation = (rowKey) => {
	setEditingId(null);
	setWorkingAllocations(prev => prev.map(row => {

		if (row.rowKey !== rowKey)
			return row;

		// new row
		if (!row.id) {
			return {
			...row,
			action: "DELETE"
			};
		}

		// existing row
		return {
			...row,
			action: "DELETE"
		};

		})
	);

	};

//   const handleToggleAllocation=(emp,date,checked)=>{
//     if(checked){
//         const newRow = {
//             rowKey:`new_${Date.now()}`,
//             emp_id:emp.emp_id,
//             employee_name:emp.name,
//             start_date:date,
//             end_date:date,
//             emp_type:Number(emp.grade_level)>1?"T":"E",
//             remarks:"",
//             is_approved:false,
//             action:"ADD"
//         }
//         setWorkingAllocations(prev=>[...prev,newRow])
//     }else{
//         const rowKey = employeeDateMap[emp.emp_id]?.[date];
//         handleDeleteAllocation(rowKey,date);
//     }
// }

	const handleEditDate = (row, targetDate) => {
		if ( row.is_approved || activityData?.allAEntries?.length) {
			toast.info("Cannot edit approved/actual started allocation");
			return;
		}

    console.log("hello",row, targetDate)

    setEditBackup(prev=>({ ...prev, [row.rowKey] : row }));

  const targetDateComparable = DateForApiFormate(targetDate, true);
  const splitRows = splitAllocationForEdit( row, targetDateComparable);
  const editRow = splitRows.find(x => x.action === "EDIT");

  console.log("editRow", editRow)

	 setWorkingAllocations(prev => [
        ...prev.filter( x => x.rowKey !== row.rowKey),
        ...splitRows
    ]);

  if (editRow) {
    setEditingId(editRow.rowKey);
  }

};

const handleFieldChange = ( rowKey, field, value ) => {
    setWorkingAllocations(prev =>
        prev.map(row => {
            if (row.rowKey !== rowKey) return row;

            return {
                ...row,
                [field]: value
            };

        })
    );

};

const handleCancelEdit = rowKey => {
    setWorkingAllocations(prev => {

        const editRow = prev.find( x => x.rowKey === rowKey);
        if (!editRow) return prev;

        // Restore original row
        const original = editBackup[editRow.parent_id];
        if (!original) return prev;
        return [
            ...prev.filter(x => x.parent_id !== editRow.parent_id && x.rowKey !== editRow.parent_id),
            original
        ];
    });

    setEditingId(null);
};

const handleAutoAssign = emp => {

    const freeDates = activityDates.map(formatToApiDate).filter(d=>{
        const assigned = employeeDateMap[emp.emp_id]?.[d];
        const busy = busyDateMap[emp.emp_id]?.[d];
        return !assigned && !busy;
    });

    if(!freeDates.length){
        toast.info("No dates available");
        return;
    }
  const ranges = groupDatesIntoRanges(freeDates);

    const newRows = ranges.map(range => ({
    rowKey: crypto.randomUUID(),
    id: null,
    parent_id: null,
    emp_id: emp.emp_id,
    employee_name: emp.name,
    start_date: DateForApiFormate(range.start_date, true),
    end_date: DateForApiFormate(range.end_date, true),
    emp_type: Number(emp.grade_level) > 1 ? "T" : "E",
    remarks: "",
    is_approved: false,
    is_active: true,
    action: "ADD"
  }));

  setWorkingAllocations(prev => [...prev, ...newRows ]);
  toast.success(`Assigned ${freeDates.length} date(s) to ${emp.name}`);
};

const handleToggleAllocation = ( emp, targetDate, checked )=>{
 if (checked) {
  // const prevDates = Object.keys(employeeDateMap[emp.emp_id] || {});
  const prevDates = generateDatesBetween(
    ...workingAllocations.filter(x => x.emp_id === emp.emp_id && x.action !== "DELETE").
    reduce((acc, row) => {
                acc.push(...generateDatesBetween(row.start_date, row.end_date));
                return acc;
            },[])
);

  const allDates = [...prevDates, targetDate ];

  const ranges = groupDatesIntoRanges([...new Set(allDates)]);

  setWorkingAllocations(prev => {
    // const withoutEmp = prev.filter( x => x.emp_id !== emp.emp_id || x.action === "DELETE");
    const withoutEmp = [...prev];

    const newRows = ranges.map(range => ({
      rowKey: crypto.randomUUID(),
      id: null,
      parent_id: null,
      emp_id: emp.emp_id,
      employee_name: emp.name,
      start_date: DateForApiFormate(range.start_date, true),
      end_date: DateForApiFormate(range.end_date, true),
      emp_type: Number(emp.grade_level) > 1 ? "T" : "E",
      remarks: "",
      is_approved: false,
      is_active: true,
      action: "ADD"
    }));
    const newState = [...withoutEmp, ...newRows];
    return normalizeOverlappingAllocations(newState);
  });
}
    else{
        const rowKey = employeeDateMap[emp.emp_id]?.[targetDate];
        const row = workingAllocations.find(x=>x.rowKey===rowKey);

        if(row){ handleDeleteDate( row, targetDate );
        }
    }
};

const handleConfirmUpdate = rowKey => {
    setWorkingAllocations(prev => {
        const currentRow = prev.find( x => x.rowKey === rowKey);

        if (!currentRow) return prev;

        const updatedRows = prev.map(row => {
            if (row.rowKey !== rowKey)
                return row;

            if ( currentRow.action === "ADD") {
                return row;
            }

            return {
                ...row,
                action: currentRow.id ? "UPDATE" : "ADD"
            };
        });
        return normalizeOverlappingAllocations(updatedRows);
    });
    setEditingId(null);
};

	const handleDeleteDate = (row, targetDate) => {

	if (row.is_approved || activityData?.allAEntries?.length) {
		toast.info("Cannot delete");
		return;
	}

	setWorkingAllocations(prev => {
		const targetDateComparable = DateForApiFormate(targetDate, true);
		const splitRows = splitAllocationByDate( row, targetDateComparable, "DELETE");
    // console.log("splitRows", splitRows)


		return [
		...prev.filter( x => x.rowKey !== row.rowKey), ...splitRows
		];
	});
	};

const dateWiseAssignments = useMemo(() => {
  const map = {};
  dayWindow.forEach(d => {
    map[formatToApiDate(d)] = [];
  });

  workingAllocations.filter( row => row.action !== "DELETE" && row.is_active)
    .forEach(row => {

      generateDatesBetween( row.start_date, row.end_date).forEach(date => {

        if (map[date]) {

          map[date].push({
            date,
            rowKey: row.rowKey,
            id: row.id,
            emp_id: row.emp_id,
            employee_name: row.employee_name,
            emp_type: row.emp_type,
            remarks: row.remarks,
            start_date: row.start_date,
            end_date: row.end_date,
            is_approved: row.is_approved,
            action: row.action
          });
        }
      });
    });
  return map;

}, [ workingAllocations, dayWindow ]);

	// const addRows = workingAllocations.filter( row => row.action === "ADD" );

	// const updateRows = workingAllocations.filter( row => row.action === "UPDATE");

	// const deleteRows = workingAllocations.filter( row => row.action === "DELETE" );

	// const deletePayload = deleteRows.filter(row => row.id).map(row => ({
	// 	id: row.id,
	// 	is_deleted: true
	// }));

	// const updatePayload = updateRows.map(row => ({
	// 	id: row.id,
	// 	emp_id: row.emp_id,
	// 	emp_type: row.emp_type,
	// 	start_date: DateForApiFormate(row.start_date),
	// 	end_date: DateForApiFormate(row.end_date),
	// 	remarks: row.remarks || "",
	// 	is_updated: true
	// }));

	// const addPayload = addRows.map(row => ({
	// 	emp_id: row.emp_id,
	// 	emp_type: row.emp_type,
	// 	start_date: DateForApiFormate(row.start_date),
	// 	end_date: DateForApiFormate(row.end_date),
	// 	remarks: row.remarks || ""
	// }));
	 
const normalizedAllocations = normalizeOverlappingAllocations( workingAllocations );

const mergedAllocations = mergeAllocations(normalizedAllocations);

const { addPayload, updatePayload, deletePayload} = buildPayloads( mergedAllocations );

const handleSubmit = async () => {
    try {
        const p_id = activityData?.original_P?.id;
        if (!p_id) return;

        const hasNew = mergedAllocations.some(row => row.action === "ADD");
        const hasUpdate = mergedAllocations.some(row => row.action === "UPDATE");
        const hasExistingActive = mergedAllocations.some(row => row.id && row.action !== "DELETE");

        const activeResources = mergedAllocations.filter(row => row.action !== "DELETE");
        const deletedRows = mergedAllocations.filter(row => row.action === "DELETE" && row.id);

        // 1. Send DELETE if there are deleted items
        if (deletedRows.length) {
            const fd = new FormData();
            fd.append("emp_id", loggedEmpId);
            fd.append("call_mode", "DELETE");
            fd.append("p_id", p_id);

            const deletePayloadList = deletedRows.map(s => ({
                  id: s.id,
                  is_deleted: true
              }));

              fd.append("c_emp_list", JSON.stringify(deletePayloadList));
              await postAllocationData(fd);
          }

        // 2. Send ADD/UPDATE if there are new or updated items
        if (hasNew || hasUpdate) {
            const fd = new FormData();
            fd.append("emp_id", loggedEmpId);
            fd.append("p_id", p_id);
            
            const callMode = hasNew && !hasUpdate && !hasExistingActive ? "ADD" : "UPDATE";
            fd.append("call_mode", callMode);

            const payloadList = activeResources.map(s => {
                const item = {
                    emp_id: s.emp_id,
                    emp_type: s.emp_type,
                    start_date: DateForApiFormate(s.start_date),
                    end_date: DateForApiFormate(s.end_date),
                    remarks: s.remarks || '',
                    contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
                };
                if (s.id) item.id = s.id;
                if (s.action === "UPDATE") item.is_updated = true;
                return item;
            });
            fd.append("c_emp_list", JSON.stringify(payloadList));
            await postAllocationData(fd);
        }

        // 3. Send RESOURCE_ADD to sync resources on parent activity
        if (activeResources.length > 0) {
            const resourceListStr = activeResources
                .map((r) => `${r.emp_id}^${r.employee_name || ''}^${r.emp_type}`)
                .join('|');

            const activityFd = new FormData();
            activityFd.append('emp_id', loggedEmpId);
            activityFd.append('call_mode', 'RESOURCE_ADD');
            activityFd.append('a_id', p_id);
            activityFd.append('geo_type', 'O');
            activityFd.append('resource_list', resourceListStr);
            await postActivityAllocationData(activityFd);
        }

        toast.success("Saved successfully");
        loadAllData();
    }
    catch (err) {
        toast.error(err?.response?.data?.message || "Save failed");
    }
};
  
  const pendingCount = addPayload.length + updatePayload.length + deletePayload.length;

  const saveLabel =
	[addPayload.length && `Add ${addPayload.length}`, updatePayload.length && `Update ${updatePayload.length}`, deletePayload.length && `Remove ${deletePayload.length}`]
	  .filter(Boolean)
	  .join(" · ") || "Save Changes";

  // const TABS = [
	// { key: "PLAN", label: "Resource Planning" },
	// { key: "ACTUAL", label: "Actual Resource" },
  // ]

//   const actualDateWiseAssignments = useMemo(() => {
//     const map = {};

//     dayWindow.forEach(d => {
//         map[formatToApiDate(d)] = [];
//     });

//     activityData?.allAEntries?.forEach(entry => {
//         entry.retainer_list?.forEach(retainer => {
//             const start = DateForApiFormate(retainer.start_date, true);
//             const end = DateForApiFormate(retainer.end_date, true);

//             generateDatesBetween(start, end).forEach(date => {
//                 if (!map[date]) return;

//                 map[date].push({
//                     rowKey: retainer.a_id,
//                     allocation_id: retainer.a_id,
//                     employee_name: retainer.employee_name,
//                     emp_id: retainer.emp_id,
//                     start_date: start,
//                     end_date: end,
//                     tl_count: retainer.tl_count,
//                     ex_count: retainer.ex_count,
//                     no_of_items: retainer.no_of_items,
//                     is_actual: true,
//                 });
//             });
//         });
//     });

//     return map;
// }, [activityData, dayWindow]);

// const actualDateWiseAssignments = useMemo(() => {
//     const map = {};

//     dayWindow.forEach(d => {
//         map[formatToApiDate(d)] = [];
//     });

//     activityData?.allAEntries?.forEach(entry => {

//         entry.employee_list?.forEach(emp => {

//             const start = DateForApiFormate(emp.start_date, true);
//             const end = DateForApiFormate(emp.end_date, true);

//             generateDatesBetween(start, end).forEach(date => {

//                 if (!map[date]) return;

//                 map[date].push({
//                     rowKey: crypto.randomUUID(),
//                     employee_name: emp.employee_name,
//                     emp_id: emp.emp_id,
//                     emp_type: emp.emp_type,
//                     remarks: emp.remarks,
//                     start_date: start,
//                     end_date: end,
//                     is_actual: true
//                 });

//             });

//         });

//     });

//     return map;

// }, [activityData, dayWindow]);

const actualDateWiseAssignments = useMemo(() => {
    const map = {};

    // Initialize all dates
    dayWindow.forEach(d => {
        map[formatToApiDate(d)] = [];
    });

    activityData?.allAEntries?.forEach(entry => {
        const start = DateForApiFormate(entry.start_date, true);
        const end = DateForApiFormate(entry.end_date, true);

        entry.resource_list?.forEach(resource => {
            const [
                emp_id,
                employee_name,
                count,
                emp_type
            ] = resource.split("^");

            generateDatesBetween(start, end).forEach(date => {
                if (!map[date]) return;

                map[date].push({
                    rowKey: `${emp_id}_${date}`,
                    emp_id,
                    employee_name,
                    emp_type: emp_type === "TL" ? "T" : "E",
                    resource_count: Number(count),
                    start_date: start,
                    end_date: end,
                    remarks: "",
                    is_actual: true
                });
            });
        });
    });

    return map;
}, [activityData, dayWindow]);

  return (
	<Layout>
<div style={{ display: "flex", justifyContent: "flex-end" }}>
  <Button size="md" onClick={() => window.history.back()}>
    <FaArrowLeft />Back
  </Button>
</div>
	  <Card hoverable={false} style={{marginTop: "1rem"}}>
		{/* <Tabs tabs={TABS} activeTab={tab} setActiveTab={setTab} /> */}
{/* 
		{tab === "PLAN" && ( */}
		  <>
		{/* {activityData.activityStatus !== "C" &&  */}

    <CurrentAssignments
			  dateWiseAssignments={dateWiseAssignments}
			  dayWindow={dayWindow}
			  editingId={editingId}
			  handleEditDate={handleEditDate}
			  handleDeleteDate={handleDeleteDate}
			  handleFieldChange={handleFieldChange}
			  handleConfirmUpdate={handleConfirmUpdate}
			  handleCancelEdit={handleCancelEdit}
			  activityStart={activityStart}
			  activityEnd={activityEnd}
			  activityData={activityData}
			  isActual={false}
			/>
    
    
    <ResourceAvailability
			  employees={employees}
			  dayWindow={dayWindow}
			  activityData={activityData}
			  activityDates={activityDates}
			  activityStart={activityStart}
			  activityEnd={activityEnd}
			  busyDateMap={busyDateMap}
			  employeeDateMap={employeeDateMap}
			  handleToggleAllocation={handleToggleAllocation}
			  workingAllocations={workingAllocations}
			  handleAutoAssign={handleAutoAssign}
			/>
      
      {/* } */}

		  </>
		{/* )} */}

		{/* {tab === "ACTUAL" && (
		  <CurrentAssignments
			dateWiseAssignments={actualDateWiseAssignments}
			dayWindow={dayWindow}
			editingId={editingId}
			handleEditDate={handleEditDate}
			handleDeleteDate={handleDeleteDate}
			handleFieldChange={handleFieldChange}
			handleConfirmUpdate={handleConfirmUpdate}
			handleCancelEdit={handleCancelEdit}
			activityStart={activityStart}
			activityEnd={activityEnd}
			activityData={activityData}
			isActual={true}
		  />
		)} */}

		{pendingCount > 0 && (
		  <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
			 {/* <span>{[addPayload.length && `${addPayload.length} to add`, updatePayload.length && `${updatePayload.length} to update`, deletePayload.length && `${deletePayload.length} to remove`].filter(Boolean).join(" · ")}</span> */}
			<Button onClick={handleSubmit} color="primary" style={{marginLeft: "auto"}}>{saveLabel}</Button>
		  </div>
		)}
	  </Card>
	</Layout>
  );
};

export default ResourceAllocation;
