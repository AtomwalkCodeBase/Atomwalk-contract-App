import React, { useCallback, useMemo, useState } from "react";
import Card from "../Card";
import { buildDayWindow, DateForApiFormate, formatDate, formatToApiDate } from "../../utils/utils";
import { FaCalendarAlt, FaCheck, FaSearch, FaUser, FaUserPlus, FaUsers } from "react-icons/fa";
import { useFilter } from "../../hooks/useFilter";
import { usePagination } from "../../hooks/usePagination";
import DataTable, { Td } from "../DataTable";
import PaginationComponent from "../Pagination";
import styled from "styled-components";
import Badge from "../Badge";
import Button from "../Button";

const InfoStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const InfoPill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 99px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#f4f5f7"};
  border: 1px solid ${({ theme }) => theme.colors?.border || "#e5e7eb"};
  font-size: ${({ theme }) => theme.fontSizes?.sm || "0.5rem"};
  color: ${({ theme }) => theme.colors?.text || "#333"};

  svg {
    color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
  }

  span {
    color: ${({ theme }) => theme.colors?.textLight || "#888"};
    margin-right: 0.15rem;
  }
`;

const SearchWrap = styled.div`
  position: relative;
  display: inline-block;
  flex: 1;
`

const SearchInput = styled.input`
  padding: ${({ theme }) => `${theme?.spacing?.sm || '0.35rem'} ${theme?.spacing?.lg || '1.2rem'}`};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 0.375rem;
  font-size: 0.72rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.textLight || '#bbb'};
  pointer-events: none;
  display: flex;
  align-items: center;
`

const FilterSelect = styled.select`
  padding: ${({ theme }) => `${theme?.spacing?.sm || '0.35rem'} ${theme?.spacing?.md || '0.8rem'}`};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 0.375rem;
  font-size: 0.72rem;
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6C5CE7'};
  }
`

const ResourceCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ResourceName = styled.span`
  font-size: 0.76rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`
const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ color }) => color || '#e5e7eb'};
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
`
const ShortPill = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: #ef4444;
  margin-left: 0.25rem;
`

const shortDay = (date) => ({
    num: String(date.getDate()).padStart(2, "0"),
    dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
});

const AVATAR_COLORS = ['#6C5CE7', '#0984e3', '#00b894', '#e17055', '#fd79a8', '#74b9ff', '#55efc4']
const avatarColor = (str) => AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length]
const initials = (name) => (name || '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const ResourceAvailability = ({
  employees,
  dayWindow,
  activityData,
  activityDates,
  activityStart,
  activityEnd,
  assignedIds,
  selectedDates,
  getBusyDates,
  allResourceAllocationList,
  // computeFreeDates,
  handleDateSelect,
  handleAdd,
  // availSearch,
  // setAvailSearch,
  // roleFilter,
  // setRoleFilter,
}) => {
    const [filter, setFilter] = useState({ search: "", roleFilter: "ALL" });
    // const [selectedDates, setSelectedDates] = useState({});
    
    // const activityStart = activityData?.original_P?.start_date || activityData?.planned_start_date || "";
    // const activityEnd =activityData?.original_P?.end_date || activityData?.planned_end_date || "";

    // const dayWindow = useMemo( () => buildDayWindow(activityStart, 6), [activityStart],);

    console.log("selectedDates", selectedDates)

    const mappedEmployees = useMemo(() => employees.map((emp) => ({
      ...emp, role: Number(emp.grade_level) > 1 ? "TL" : "EX",
    })), [employees]);
    
    const filteredEmployees = useFilter({
      data: mappedEmployees,
      fields: ["name", "emp_id"],
      search: filter.search,
      extraFilters: filter.roleFilter === "ALL" ? {} : { role: filter.roleFilter },
    });
    
     const { paginatedData: paginatedEmployees, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(filteredEmployees, 25);
    
    const matchingRetainer = (activityData?.original_P?.retainer_list || []).find((r) => r.a_type === "P" && r.start_date === activityData?.original_P?.start_date && r.end_date === activityData?.original_P?.end_date,);

    const plannedTL = matchingRetainer?.tl_count || 0;
    const plannedEX = matchingRetainer?.ex_count || 0;
    const activeTL = allResourceAllocationList.filter( (s) => s.emp_type === "T" && !s._deleted,).length;
    const activeEX = allResourceAllocationList.filter( (s) => s.emp_type === "E" && !s._deleted, ).length;

    const isEmployeeAssignedOnDate = useCallback((emp_id, dateStr) => {
      return allResourceAllocationList.some(alloc => {
        if (alloc.emp_id !== emp_id || alloc._deleted || !alloc.is_active) return false;
        const allocStart = DateForApiFormate(alloc.start_date, true);
        const allocEnd = DateForApiFormate(alloc.end_date, true);
        const targetDate = DateForApiFormate(dateStr, true);
        return targetDate >= allocStart && targetDate <= allocEnd;
      });
    }, [allResourceAllocationList]);

      // const activityDates = useMemo(() => {
      //   const dates = [];
      //   const startComparable = DateForApiFormate(activityStart, true);
      //   const endComparable = DateForApiFormate(activityEnd, true);
      //   if (!startComparable || !endComparable) return dates;
      //   const [sY, sM, sD] = startComparable.split("-").map(Number);
      //   const [eY, eM, eD] = endComparable.split("-").map(Number);
      //   const cur = new Date(sY, sM - 1, sD);
      //   const end = new Date(eY, eM - 1, eD);
      //   let limit = 0;
      //   while (cur <= end && limit < 366) {
      //     dates.push(new Date(cur));
      //     cur.setDate(cur.getDate() + 1);
      //     limit++;
      //   }
      //   return dates;
      // }, [activityStart, activityEnd]);

    //  const assignedIds = useMemo(() => new Set(allResourceAllocationList.filter((s) => !s._deleted).map((s) => s.emp_id)), [allResourceAllocationList]);

      // const computeFreeDates = useCallback((emp_id) => {
      //   if (!activityDates.length) return { start_date: '', end_date: '', freeDates: [] }
      //   const busy = getBusyDates(emp_id)
      //   const freeDates = []
    
      //   // Check if employee is completely free for entire activity period
      //   const completelyFree = activityDates.every(d => !busy.has(formatToApiDate(d)))
        
      //   if (completelyFree) {
      //     // Return entire activity period if completely free
      //     return {
      //       start_date: formatToApiDate(activityDates[0]),
      //       end_date: formatToApiDate(activityDates[activityDates.length - 1]),
      //       freeDates: activityDates.map(d => formatToApiDate(d))
      //     }
      //   }
    
      //   // Get contiguous block of free dates from start
      //   let firstFree = null
      //   for (const d of activityDates) {
      //     if (!busy.has(formatToApiDate(d))) { firstFree = d; break }
      //   }
      //   if (!firstFree) return { start_date: '', end_date: '', freeDates: [] }
    
      //   let lastFree = firstFree
      //   for (const d of activityDates) {
      //     if (d <= firstFree) continue
      //     if (!busy.has(formatToApiDate(d))) {
      //       lastFree = d
      //       freeDates.push(formatToApiDate(d))
      //     } else break
      //   }
      //   freeDates.unshift(formatToApiDate(firstFree))
        
      //   const actEndStr = DateForApiFormate(activityEnd, true)
      //   if (actEndStr) {
      //     const [aeY, aeM, aeD] = actEndStr.split("-").map(Number)
      //     const actEnd = new Date(aeY, aeM - 1, aeD)
      //     if (!isNaN(actEnd) && lastFree > actEnd) lastFree = actEnd
      //   }
    
      //   return { start_date: formatToApiDate(firstFree), end_date: formatToApiDate(lastFree), freeDates }
      // }, [activityDates, getBusyDates, activityEnd])

        // const handleDateSelect = useCallback((empId, dateStr, checked) => {
        //   setSelectedDates(prev => {
        //     const current = prev[empId] || [];
            
        //     if (checked) {
        //       return { ...prev, [empId]: [...new Set([...current, dateStr])] };
        //     } else {
        //       return { ...prev, [empId]: current.filter(d => d !== dateStr) };
        //     }
        //   });
        // }, []);

    const columns = useMemo(() => {
        const cols = ["Resource"];

        dayWindow.forEach((d) => {
            const { num, dow } = shortDay(d);
            cols.push(`${num} ${dow}`);
        });

        cols.push("Action");

        return cols;
    }, [dayWindow]);

    return (
        <Card
            title={`Resource Availability (${formatDate(activityStart)} – ${formatDate(activityEnd)}})`}
        >
            <InfoStrip>
                <InfoPill>
                    <FaCalendarAlt size={10} />
                    <span>Activity:</span>
                    {formatDate(activityStart)} – {formatDate(activityEnd)}
                </InfoPill>
                <InfoPill>
                    <FaUsers size={10} />
                    <span>TL:</span>
                    {activeTL} / {plannedTL}
                    {activeTL < plannedTL && (
                        <ShortPill>Short {plannedTL - activeTL} TL</ShortPill>
                    )}
                </InfoPill>
                <InfoPill>
                    <FaUser size={10} />
                    <span>EX:</span>
                    {activeEX} / {plannedEX}
                    {activeEX < plannedEX && (
                        <ShortPill>Short {plannedEX - activeEX} EX</ShortPill>
                    )}
                </InfoPill>
            </InfoStrip>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                }}
            >
                <SearchWrap>
                    <SearchIcon>
                        <FaSearch size={11} />
                    </SearchIcon>
                    <SearchInput
                        placeholder="Search resources..."
                        value={filter.search}
                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    />
                </SearchWrap>
                <FilterSelect
                    value={filter.roleFilter}
                    onChange={(e) => setFilter(prev => ({ ...prev, roleFilter: e.target.value }))}
                >
                    <option value="ALL">All Roles</option>
                    <option value="TL">Team Leads (TL)</option>
                    <option value="EX">Executives (EX)</option>
                </FilterSelect>
            </div>

             <DataTable
            columns={columns}
            data={paginatedEmployees}
            emptyMessage="No matching employees found"
            renderRow={(emp) => {
              const busy = getBusyDates(emp.emp_id);
              const hasAssignableDate = activityDates.some((d) => {
                const dStr = formatToApiDate(d);
                const isBusy = busy.has(dStr);
                const isAlreadyAssigned = isEmployeeAssignedOnDate(emp.emp_id, dStr);
                const isSelected = selectedDates[emp.emp_id]?.includes(dStr) || false;
                const isAfterEnd = activityEnd ? (dStr > DateForApiFormate(activityEnd, true)) : false;
                return !isBusy && !isAlreadyAssigned && !isSelected && !isAfterEnd;
              });

              return (
                <>
                  <Td>
                    <ResourceCell>
                      <Avatar color={avatarColor(emp.name)} style={{ width: 24, height: 24, fontSize: '0.55rem' }}>
                        {initials(emp.name)}
                      </Avatar>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <ResourceName>{emp.name}</ResourceName>
                        <span style={{ fontSize: '0.62rem', color: '#999' }}>{emp.emp_id} • <Badge variant={emp.role === 'TL' ? 'forward' : 'info'}>
                          {emp.role}
                        </Badge></span>
                      </div>
                    </ResourceCell>
                  </Td>
                  {dayWindow.map((d) => {
                    const dStr = formatToApiDate(d)
                    const isBusy = busy.has(dStr)
                    const isSelected = selectedDates[emp.emp_id]?.includes(dStr) || false;
                    const isAlreadyAssigned = isEmployeeAssignedOnDate(emp.emp_id, dStr);
                    const isAfterEnd = activityEnd ? (dStr > DateForApiFormate(activityEnd, true)) : false;
                    const isDisabled = isBusy || isAfterEnd;

                    console.log("dStr", dStr)
                    console.log("busy", busy)
                    console.log("isAlreadyAssigned", isAlreadyAssigned)

                    return (
                      <Td key={dStr} style={{ textAlign: "left" }}>
                        {/* <Dot color={isBusy ? '#ef4444' : '#10b981'} /> */}
                       {/* {isBusy ? '❌' : '✅' } */}
                       <input
                          type="checkbox"
                          checked={isBusy || isSelected || isAlreadyAssigned}
                          // checked={true}
                          // disabled={isDisabled}
                          onChange={(e) =>  handleDateSelect(emp.emp_id, dStr, e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#6C5CE7', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          title={isAlreadyAssigned ? 'Already assigned on this date' : (isBusy ? 'Not available on this date' : (isAfterEnd ? 'After activity end date' : 'Click to select'))}
                        />
                      </Td>
                    );
                  })}
                  <Td>
                    <div style={{ marginLeft: '0.5rem' }}>
                      {hasAssignableDate ? (
                        <Button
                          variant="primary"
                          iconOnly={true}
                          onClick={() => handleAdd(emp)}
                          title="Click to auto-assign available dates"
                        >
                          <FaUserPlus size={12} />
                        </Button>
                      ) : (
                        <Button variant="outline" iconOnly={true} disabled={true} title="Already assigned / No free dates for this activity">
                          <FaCheck size={11} />
                        </Button>
                      )}
                    </div>
                  </Td>
                </>
              )
            }}
          />

          {filteredEmployees.length > 0 && (
            <PaginationComponent
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </Card>
    );
};
