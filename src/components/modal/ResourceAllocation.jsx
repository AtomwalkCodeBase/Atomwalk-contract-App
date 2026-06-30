import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../Layout";
import { buildDayWindow, DateForApiFormate, formatToApiDate, generateDatesBetween, getMonthRange } from "../../utils/utils";
import { useLocation } from "react-router-dom";
import { ResourceAvailability } from "../ScreenComponents/ResourceAvaiblityCard";
import CurrentAssignments from "../ScreenComponents/CurrentAssignResourceList";
import { getContractAllocationData, getemployeeLists, postActivityAllocationData, postAllocationData } from "../../services/productServices";
import { toast } from "react-toastify";
import Tabs from "../Tabs";
import Button from "../Button";
import Card from "../Card";

const ResourceAllocation = () => {
  const location = useLocation();
  const activityData = location.state?.data;
  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const { start, end } = getMonthRange();

  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [availSearch, setAvailSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState("PLAN");

  const [employees, setEmployees] = useState([]);
  const [allResourceAllocationList, setAllResourceAllocationList] = useState([]);
  const [activityAllocationList, setActivityAllocationList] = useState([]);

  const [originalEditRows, setOriginalEditRows] = useState({});
  const [selectedDates, setSelectedDates] = useState({});

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
      const [allResource, activityAlloc] = await Promise.all([
        loadExisting({ allocation_id, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
        loadExisting({ emp_id: loggedEmpId, start_date: DateForApiFormate(start), end_date: DateForApiFormate(end) }),
      ]);

      setAllResourceAllocationList(
        allResource.filter((item) => item.is_active).map((item) => ({
          ...item,
          _rowKey: String(item.id || `new_${item.emp_id}_${Date.now()}`),
        }))
      );

      setActivityAllocationList(
        activityAlloc.filter((item) => item.is_active).map((item) => ({
          ...item,
          _rowKey: String(item.id || `avail_${item.emp_id}_${Date.now()}`),
        }))
      );
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

  const getBusyDates = useCallback((emp_id) => {
    const busy = new Set()
    activityAllocationList.forEach((s) => {
      if (s.emp_id !== emp_id || s._deleted || !s.is_active) return
      const fromStr = DateForApiFormate(s.start_date, true)
      const toStr = DateForApiFormate(s.end_date, true)
      if (!fromStr || !toStr) return
      const [fY, fM, fD] = fromStr.split("-").map(Number)
      const [tY, tM, tD] = toStr.split("-").map(Number)
      const cur = new Date(fY, fM - 1, fD)
      const end = new Date(tY, tM - 1, tD)
      while (cur <= end) {
        busy.add(formatToApiDate(cur))
        cur.setDate(cur.getDate() + 1)
      }
    })
    return busy
  }, [activityAllocationList])

  const computeFreeDates = useCallback(
    (emp_id) => {
      if (!activityDates.length) return { start_date: "", end_date: "", freeDates: [] };

      const busy = getBusyDates(emp_id);
      const completelyFree = activityDates.every((d) => !busy.has(formatToApiDate(d)));

      if (completelyFree) {
        return {
          start_date: formatToApiDate(activityDates[0]),
          end_date: formatToApiDate(activityDates[activityDates.length - 1]),
          freeDates: activityDates.map((d) => formatToApiDate(d)),
        };
      }

      let firstFree = null;
      for (const d of activityDates) {
        if (!busy.has(formatToApiDate(d))) {
          firstFree = d;
          break;
        }
      }
      if (!firstFree) return { start_date: "", end_date: "", freeDates: [] };

      const freeDates = [formatToApiDate(firstFree)];
      let lastFree = firstFree;

      for (const d of activityDates) {
        if (d <= firstFree) continue;
        if (!busy.has(formatToApiDate(d))) {
          lastFree = d;
          freeDates.push(formatToApiDate(d));
        } else break;
      }

      return { start_date: formatToApiDate(firstFree), end_date: formatToApiDate(lastFree), freeDates };
    },
    [activityDates, getBusyDates]
  );

  const handleMarkDelete = useCallback((rowKey, specificDate = null) => {
    const item = allResourceAllocationList.find(r => r._rowKey === rowKey);
    if (item && specificDate) {
      const specComparable = DateForApiFormate(specificDate, true);
      setSelectedDates(prev => {
        const current = prev[item.emp_id] || [];
        return {
          ...prev,
          [item.emp_id]: current.filter(d => DateForApiFormate(d, true) !== specComparable)
        };
      });
    } else if (item && !specificDate) {
      const datesToRemove = new Set(generateDatesBetween(item.start_date, item.end_date));
      setSelectedDates(prev => {
        const current = prev[item.emp_id] || [];
        return {
          ...prev,
          [item.emp_id]: current.filter(d => !datesToRemove.has(d))
        };
      });
    }

    setAllResourceAllocationList(prev => {
      const list = [];
      prev.forEach(item => {
        if (item._rowKey !== rowKey) {
          list.push(item);
          return;
        }

        if (!specificDate) {
          if (!item.id) {
            return;
          }
          list.push({ ...item, _deleted: true });
          return;
        }

        const startComparable = DateForApiFormate(item.start_date, true);
        const endComparable = DateForApiFormate(item.end_date, true);
        const specComparable = DateForApiFormate(specificDate, true);

        if (startComparable === specComparable && endComparable === specComparable) {
          if (!item.id) {
            return;
          }
          list.push({ ...item, _deleted: true });
        } else if (startComparable === specComparable) {
          const nextDay = new Date(specComparable);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = formatToApiDate(nextDay);
          list.push({ ...item, start_date: DateForApiFormate(nextDayStr, true), _updated: true });
        } else if (endComparable === specComparable) {
          const prevDay = new Date(specComparable);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevDayStr = formatToApiDate(prevDay);
          list.push({ ...item, end_date: DateForApiFormate(prevDayStr, true), _updated: true });
        } else if (specComparable > startComparable && specComparable < endComparable) {
          const prevDay = new Date(specComparable);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevDayStr = formatToApiDate(prevDay);

          const nextDay = new Date(specComparable);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = formatToApiDate(nextDay);

          list.push({ ...item, end_date: DateForApiFormate(prevDayStr, true), _updated: true });

          const tempKey = `split_${item.emp_id}_${Date.now()}`;
          list.push({
            ...item,
            id: undefined,
            _rowKey: tempKey,
            start_date: DateForApiFormate(nextDayStr, true),
          });
        } else {
          list.push(item);
        }
      });
      return list;
    });
  }, [allResourceAllocationList]);

  const handleDateSelect = useCallback((empId, dateStr, checked) => {
    if (!checked) {
      setAllResourceAllocationList(prev => {
        const list = [];
        prev.forEach(item => {
          if (item.emp_id !== empId || item._deleted || !item.is_active) {
            list.push(item);
            return;
          }
          const startComparable = DateForApiFormate(item.start_date, true);
          const endComparable = DateForApiFormate(item.end_date, true);
          const specComparable = DateForApiFormate(dateStr, true);

          if (specComparable >= startComparable && specComparable <= endComparable) {
            if (startComparable === specComparable && endComparable === specComparable) {
              if (!item.id) {
                return;
              }
              list.push({ ...item, _deleted: true });
            } else if (startComparable === specComparable) {
              const nextDay = new Date(specComparable);
              nextDay.setDate(nextDay.getDate() + 1);
              const nextDayStr = formatToApiDate(nextDay);
              list.push({ ...item, start_date: DateForApiFormate(nextDayStr, true), _updated: true });
            } else if (endComparable === specComparable) {
              const prevDay = new Date(specComparable);
              prevDay.setDate(prevDay.getDate() - 1);
              const prevDayStr = formatToApiDate(prevDay);
              list.push({ ...item, end_date: DateForApiFormate(prevDayStr, true), _updated: true });
            } else {
              const prevDay = new Date(specComparable);
              prevDay.setDate(prevDay.getDate() - 1);
              const prevDayStr = formatToApiDate(prevDay);

              const nextDay = new Date(specComparable);
              nextDay.setDate(nextDay.getDate() + 1);
              const nextDayStr = formatToApiDate(nextDay);

              list.push({ ...item, end_date: DateForApiFormate(prevDayStr, true), _updated: true });

              const tempKey = `split_${item.emp_id}_${Date.now()}`;
              list.push({
                ...item,
                id: undefined,
                _rowKey: tempKey,
                start_date: DateForApiFormate(nextDayStr, true),
              });
            }
          } else {
            list.push(item);
          }
        });
        return list;
      });

      setSelectedDates(prev => {
        const current = prev[empId] || [];
        return { ...prev, [empId]: current.filter(d => d !== dateStr) };
      });
      return;
    }

    const normDate = DateForApiFormate(dateStr, true);
    const tempKey = `new_${empId}_${normDate}`;
    const emp = employees.find(e => e.emp_id === empId);
    const newAlloc = {
      _rowKey: tempKey,
      emp_id: empId,
      employee_name: emp?.name || empId,
      emp_type: Number(emp?.grade_level || 0) <= 1 ? "E" : "T",
      start_date: normDate,
      end_date: normDate,
      remarks: "",
      is_active: true
    };

    setAllResourceAllocationList(prev => [...prev, newAlloc]);
    setSelectedDates(prev => ({
      ...prev,
      [empId]: [...(prev[empId] || []), dateStr]
    }));
  }, [employees]);

  const handleAdd = useCallback((emp) => {
    const free = computeFreeDates(emp.emp_id);
    if (!free.start_date || !free.end_date) {
      toast.info("No free dates available for this employee.");
      return;
    }

    const datesToAssign = free.freeDates || generateDatesBetween(free.start_date, free.end_date);
    if (!datesToAssign.length) return;

    setSelectedDates(prev => ({
      ...prev,
      [emp.emp_id]: [...new Set([...(prev[emp.emp_id] || []), ...datesToAssign])]
    }));

    const newAllocs = datesToAssign.map((dateStr, idx) => {
      const normDate = DateForApiFormate(dateStr, true);
      return {
        _rowKey: `new_${emp.emp_id}_${normDate}_${Date.now()}_${idx}`,
        emp_id: emp.emp_id,
        employee_name: emp.name,
        emp_type: Number(emp.grade_level) <= 1 ? "E" : "T",
        start_date: normDate,
        end_date: normDate,
        remarks: "",
        is_active: true,
      };
    });

    setAllResourceAllocationList((prev) => [...prev, ...newAllocs]);
  },
    [computeFreeDates]
  );

  const handleStartEdit = useCallback((row, specificDate = null) => {
    let rowToEdit = row;

    if (specificDate) {
      const startComparable = DateForApiFormate(row.start_date, true);
      const endComparable = DateForApiFormate(row.end_date, true);
      const specComparable = DateForApiFormate(specificDate, true);

      if (startComparable !== specComparable || endComparable !== specComparable) {
        let newRowKey = `edit_split_${row.emp_id}_${Date.now()}`;
        let newSingleDayRow = null;

        setAllResourceAllocationList(prev => {
          const list = [];
          prev.forEach(item => {
            if (item._rowKey !== row._rowKey) {
              list.push(item);
              return;
            }

            if (startComparable === specComparable) {
              const nextDay = new Date(specComparable);
              nextDay.setDate(nextDay.getDate() + 1);
              const nextDayStr = formatToApiDate(nextDay);
              list.push({ ...item, start_date: DateForApiFormate(nextDayStr, true), _updated: true });

              newSingleDayRow = {
                ...item,
                id: undefined,
                _rowKey: newRowKey,
                start_date: specComparable,
                end_date: specComparable,
              };
              list.push(newSingleDayRow);
            } else if (endComparable === specComparable) {
              const prevDay = new Date(specComparable);
              prevDay.setDate(prevDay.getDate() - 1);
              const prevDayStr = formatToApiDate(prevDay);
              list.push({ ...item, end_date: DateForApiFormate(prevDayStr, true), _updated: true });

              newSingleDayRow = {
                ...item,
                id: undefined,
                _rowKey: newRowKey,
                start_date: specComparable,
                end_date: specComparable,
              };
              list.push(newSingleDayRow);
            } else {
              const prevDay = new Date(specComparable);
              prevDay.setDate(prevDay.getDate() - 1);
              const prevDayStr = formatToApiDate(prevDay);

              const nextDay = new Date(specComparable);
              nextDay.setDate(nextDay.getDate() + 1);
              const nextDayStr = formatToApiDate(nextDay);

              list.push({ ...item, end_date: DateForApiFormate(prevDayStr, true), _updated: true });

              const nextRowKey = `split_next_${item.emp_id}_${Date.now()}`;
              list.push({
                ...item,
                id: undefined,
                _rowKey: nextRowKey,
                start_date: DateForApiFormate(nextDayStr, true),
              });

              newSingleDayRow = {
                ...item,
                id: undefined,
                _rowKey: newRowKey,
                start_date: specComparable,
                end_date: specComparable,
              };
              list.push(newSingleDayRow);
            }
          });
          return list;
        });

        rowToEdit = {
          ...row,
          id: undefined,
          _rowKey: newRowKey,
          start_date: specComparable,
          end_date: specComparable,
        };
      }
    }

    setOriginalEditRows((prev) => (prev[rowToEdit._rowKey] ? prev : { ...prev, [rowToEdit._rowKey]: { ...rowToEdit } }));
    setEditingId({ rowKey: rowToEdit._rowKey, date: specificDate });
  }, []);

  const handleFieldChange = useCallback((rowKey, field, value) => {
    setAllResourceAllocationList((prev) =>
      prev.map((e) =>
        e._rowKey === rowKey ? { ...e, [field]: value, ...(e.id ? { _updated: true } : {}) } : e
      )
    );
  }, []);

  const handleCancelEdit = useCallback(
    (rowKey) => {
      const editingRowKey = editingId && typeof editingId === 'object' ? editingId.rowKey : editingId;
      if (editingRowKey !== rowKey) return;
      const original = originalEditRows[rowKey];
      if (original) {
        setAllResourceAllocationList((prev) => prev.map((e) => (e._rowKey === rowKey ? original : e)));
      }
      setEditingId(null);
      setOriginalEditRows((prev) => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
    },
    [editingId, originalEditRows]
  );

  // const handleMarkDelete = useCallback(
  //   (rowKey) => {
  //     const sel = allResourceAllocationList.find((s) => s._rowKey === rowKey);
  //     if (!sel) return;

  //     if (!sel.id) {
  //       setAllResourceAllocationList((p) => p.filter((e) => e._rowKey !== rowKey));
  //       if (editingId === rowKey) setEditingId(null);
  //       return;
  //     }

  //     setAllResourceAllocationList((p) => p.map((e) => (e._rowKey === rowKey ? { ...e, _deleted: true } : e)));
  //     if (editingId === rowKey) setEditingId(null);
  //   },
  //   [allResourceAllocationList, editingId]
  // );

  const handleUndoDelete = useCallback((rowKey) => {
    setAllResourceAllocationList((p) => p.map((e) => (e._rowKey === rowKey ? { ...e, _deleted: false } : e)));
  }, []);

  const handleConfirmUpdate = useCallback((rowKey) => {
    setEditingId(null);
    setOriginalEditRows((prev) => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
  }, []);

  const getDateWiseAssignments = useMemo(() => {
    const map = {};
    dayWindow.forEach((d) => (map[formatToApiDate(d)] = []));

    allResourceAllocationList.forEach((row) => {
      if (row._deleted || !row.is_active || !row.start_date || !row.end_date) return;
      const dates = generateDatesBetween(row.start_date, row.end_date);
      dates.forEach((dStr) => {
        if (map[dStr]) {
          map[dStr].push({
            emp_id: row.emp_id,
            name: row.employee_name || row.emp_id,
            type: row.emp_type,
            _rowKey: row._rowKey,
          });
        }
      });
    });
    return map;
  }, [allResourceAllocationList, dayWindow]);

  const assignedIds = useMemo(
    () => new Set(allResourceAllocationList.filter((s) => !s._deleted).map((s) => s.emp_id)),
    [allResourceAllocationList]
  );

  const handleSubmit = async () => {
    try {
      const p_id = activityData?.original_P?.id;
      if (!p_id) {
        toast.error("Activity ID is missing");
        return;
      }

      const activeResources = allResourceAllocationList.filter((s) => !s._deleted);
      const newRows = activeResources.filter((s) => !s.id);
      const updatedRows = activeResources.filter((s) => s.id && s._updated);
      const deletedRows = allResourceAllocationList.filter((s) => s.id && s._deleted);

      if (deletedRows.length) {
        const fd = new FormData();
        fd.append('emp_id', loggedEmpId);
        fd.append('call_mode', 'DELETE');
        fd.append('p_id', p_id);
        const deletePayloadList = allResourceAllocationList.map((s) => ({
          id: s.id,
          ...(s._deleted ? { is_deleted: true } : {
            emp_id: s.emp_id,
            emp_type: s.emp_type,
            start_date: DateForApiFormate(s.start_date),
            end_date: DateForApiFormate(s.end_date),
            remarks: s.remarks || '',
            contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
          })
        }));
        fd.append('c_emp_list', JSON.stringify(deletePayloadList));
        await postAllocationData(fd);
      }

      if (newRows.length || updatedRows.length) {
        const fd = new FormData();
        fd.append('emp_id', loggedEmpId);
        fd.append('p_id', p_id);
        fd.append('call_mode', newRows.length && !updatedRows.length && !allResourceAllocationList.some(s => s.id && !s._deleted) ? 'ADD' : 'UPDATE');

        const payloadList = activeResources.map((s) => {
          const item = {
            emp_id: s.emp_id,
            emp_type: s.emp_type,
            start_date: DateForApiFormate(s.start_date),
            end_date: DateForApiFormate(s.end_date),
            remarks: s.remarks || '',
            contract_rate: s.contract_rate ? parseFloat(s.contract_rate) : 0
          };
          if (s.id) item.id = s.id;
          if (s._updated) item.is_updated = true;
          return item;
        });
        fd.append('c_emp_list', JSON.stringify(payloadList));
        await postAllocationData(fd);
      }

      // RESOURCE_ADD
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

      toast.success('All changes saved');
      await loadAllData();
      setSelectedDates({});
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save changes';
      toast.error(errorMessage);
    }
  };

  const newRows = allResourceAllocationList.filter((s) => !s.id && !s._deleted);
  const updatedRows = allResourceAllocationList.filter((s) => s.id && s._updated && !s._deleted,);
  const deletedRows = allResourceAllocationList.filter((s) => s.id && s._deleted);
  const pendingCount = newRows.length + updatedRows.length + deletedRows.length;

  const saveLabel =
    [newRows.length && `Add ${newRows.length}`, updatedRows.length && `Update ${updatedRows.length}`, deletedRows.length && `Remove ${deletedRows.length}`]
      .filter(Boolean)
      .join(" · ") || "Save Changes";

  const TABS = [
    { key: "PLAN", label: "Resource Planning" },
    { key: "ACTUAL", label: "Actual Resource" },
  ]

  console.log("allResourceAllocationList main", allResourceAllocationList)

  return (
    <Layout>
      <Card>
        <Tabs tabs={TABS} activeTab={tab} setActiveTab={setTab} />

        {tab === "PLAN" && (
          <>
            <ResourceAvailability
              employees={employees}
              dayWindow={dayWindow}
              activityData={activityData}
              activityDates={activityDates}
              activityStart={activityStart}
              activityEnd={activityEnd}
              assignedIds={assignedIds}
              selectedDates={selectedDates}
              getBusyDates={getBusyDates}
              computeFreeDates={computeFreeDates}
              handleDateSelect={handleDateSelect}
              handleAdd={handleAdd}
              availSearch={availSearch}
              setAvailSearch={setAvailSearch}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              allResourceAllocationList={allResourceAllocationList}
            />

            <CurrentAssignments
              allResourceAllocationList={allResourceAllocationList}
              dayWindow={dayWindow}
              getDateWiseAssignments={getDateWiseAssignments}
              editingId={editingId}
              handleStartEdit={handleStartEdit}
              handleMarkDelete={handleMarkDelete}
              handleUndoDelete={handleUndoDelete}
              handleFieldChange={handleFieldChange}
              handleConfirmUpdate={handleConfirmUpdate}
              handleCancelEdit={handleCancelEdit}
              activityStart={activityStart}
              activityEnd={activityEnd}
            />
          </>
        )
        }
        {tab === "ACTUAL" && (
          <>
            <CurrentAssignments
              allResourceAllocationList={allResourceAllocationList}
              dayWindow={dayWindow}
              getDateWiseAssignments={getDateWiseAssignments}
              editingId={editingId}
              handleStartEdit={handleStartEdit}
              handleMarkDelete={handleMarkDelete}
              handleUndoDelete={handleUndoDelete}
              handleFieldChange={handleFieldChange}
              handleConfirmUpdate={handleConfirmUpdate}
              handleCancelEdit={handleCancelEdit}
              activityStart={activityStart}
              activityEnd={activityEnd}
            />
          </>
        )}

        {pendingCount > 0 && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef3c7", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{[newRows.length && `${newRows.length} to add`, updatedRows.length && `${updatedRows.length} to update`, deletedRows.length && `${deletedRows.length} to remove`].filter(Boolean).join(" · ")}</span>
            <Button onClick={handleSubmit} color="primary">{saveLabel}</Button>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default ResourceAllocation;
