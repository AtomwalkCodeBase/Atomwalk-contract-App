import React, { useMemo, useState } from 'react'
import Card from '../Card'
import { DateForApiFormate, formatDate, formatToApiDate } from '../../utils/utils'
import styled from 'styled-components';
import PaginationComponent from '../Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter';
import DataTable, { Td } from '../DataTable';
import Button from '../Button';
import { FaCalendarAlt, FaCheck, FaChevronLeft, FaChevronRight, FaSearch, FaUndo, FaUser, FaUserPlus, FaUsers } from 'react-icons/fa';
import Badge from '../Badge';

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

const FilterSection = styled.div`
  display: "flex";
  alignItems: "center";
  gap: "0.75rem";
  flexWrap: "wrap";
  marginBottom: "1rem";
`

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


const ResourceAvailabilityCard = ({
  activityData,
  plannedTL,
  plannedEX,
  employeeList,
  dayWindow,
  employeeAvailabilityMap,
  handleToggleAllocation,
  handleAutoAssign,
  handleUndoAutoAssign,
  lastAutoAssign
}) => {
  const [filter, setFilter] = useState({ search: "", roleFilter: "ALL" });

  const activityStart = activityData?.original_P?.start_date || activityData?.planned_start_date || "";
  const activityEnd = activityData?.original_P?.end_date || activityData?.planned_end_date || "";

  const mappedEmployees = useMemo(() => (employeeList || []).map((emp) => ({
    ...emp, role: normalizeRole(emp.grade_level),
  })), [employeeList]);

  const WINDOW_SIZE = 6;               // was 7 — align with the 6-day pill strip
  const [weekOffset, setWeekOffset] = useState(0);
  const needsPaging = dayWindow.length > 6;

  const displayedDayWindow = useMemo(() => {
    if (!needsPaging) return dayWindow;
    return dayWindow.slice(weekOffset, weekOffset + WINDOW_SIZE);
  }, [dayWindow, weekOffset, needsPaging]);

  const canGoPrev = weekOffset > 0;
  const canGoNext = weekOffset + WINDOW_SIZE < dayWindow.length;

  const handlePrevWeek = () => setWeekOffset((w) => Math.max(0, w - WINDOW_SIZE));
  const handleNextWeek = () => setWeekOffset((w) => Math.min(dayWindow.length - WINDOW_SIZE, w + WINDOW_SIZE));

    const columns = useMemo(() => {
    const cols = ["Resource"];

      if (needsPaging) {
    cols.push(
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          size="sm"
          variant="outline"
          iconOnly
          disabled={!canGoPrev}
          onClick={handlePrevWeek}
          title="Previous 7 days"
        >
          <FaChevronLeft size={11} />
        </Button>
      </div>
    );
  }

    displayedDayWindow.forEach((d) => {
      const { num, dow } = shortDay(d);
      cols.push(`${num} ${dow}`);
    });


  if (needsPaging) {
    cols.push(
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          size="sm"
          variant="outline"
          iconOnly
          disabled={!canGoNext}
          onClick={handleNextWeek}
          title="Next 7 days"
        >
          <FaChevronRight size={11} />
        </Button>
      </div>
    );
  }

    cols.push("Action");
    return cols;
  }, [displayedDayWindow]);

const selectedCountsByDate = useMemo(() => {
  const counts = {};
  dayWindow.forEach((d) => {
    counts[formatToApiDate(d)] = { tl: 0, ex: 0 };
  });

  mappedEmployees.forEach((emp) => {
    Object.entries(employeeAvailabilityMap[emp.emp_id] || {}).forEach(([dStr, info]) => {
      if (!info?.isAssigned || !counts[dStr]) return;
      if (emp.role === "TL") counts[dStr].tl += 1;
      else counts[dStr].ex += 1;
    });
  });

  return counts;
}, [employeeAvailabilityMap, mappedEmployees, dayWindow]);

      const filteredEmployees = useFilter({
        data: mappedEmployees,
        fields: ["name", "emp_id"],
        search: filter.search,
        extraFilters: filter.roleFilter === "ALL" ? {} : { role: filter.roleFilter },
      });
    
      const { paginatedData: paginatedEmployees, currentPage, itemsPerPage, totalItems, handlePageChange, } = usePagination(filteredEmployees, 25);



  return (
    <Card hoverable={false}
      title={`Resource Availability (${formatDate(activityStart)} – ${formatDate(activityEnd)})`}
    >
      <InfoStrip>
        <InfoPill>
          <FaCalendarAlt size={10} />
          <span>Activity:</span>
          {formatDate(activityStart)} – {formatDate(activityEnd)}
        </InfoPill>
        <InfoPill>
          <FaUsers size={10} />TL
          <span style={{ fontWeight: 600 }}>Planned:</span> {plannedTL}
        </InfoPill>
        <InfoPill>
          <FaUser size={10} />EX
          <span style={{ fontWeight: 600 }}>Planned:</span> {plannedEX}

        </InfoPill>
      </InfoStrip>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {needsPaging && (
          <Button size="sm" variant="outline" iconOnly disabled={!canGoPrev} onClick={handlePrevWeek} title="Previous 7 days">
            <FaChevronLeft size={11} />
          </Button>
        )}
        {displayedDayWindow.map((d) => {
          const dStr = formatToApiDate(d);
          const { num, dow } = shortDay(d);
          const c = selectedCountsByDate[dStr] || { tl: 0, ex: 0 };
          return (
            <InfoPill key={dStr} style={{ fontSize: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>{num} {dow}:</span> TL {c.tl} · EX {c.ex}
            </InfoPill>
          );
        })}
        {needsPaging && (
          <Button size="sm" variant="outline" iconOnly disabled={!canGoNext} onClick={handleNextWeek} title="Next 7 days">
            <FaChevronRight size={11} />
          </Button>
        )}
      </div>

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

              <Button size='sm' onClick={() => setFilter({ search: "", roleFilter: "ALL" })}>Clear</Button>
        </div>

        <DataTable
        columns={columns}
        data={paginatedEmployees}
        emptyMessage="No matching employees found"
        renderRow={(emp) => {

          const hasAssignableDate = dayWindow.some((d) => {
            const dStr = formatToApiDate(d);
            return !employeeAvailabilityMap[emp.emp_id]?.[dStr];
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
             {needsPaging &&  <Td></Td>}
              {displayedDayWindow.map((d) => {
                const dStr = formatToApiDate(d)
                const info = employeeAvailabilityMap[emp.emp_id]?.[dStr];
                const isAssigned = !!info?.isAssigned;
                const isBusy = !!info?.isBusy;
                const isAfterEnd = activityEnd ? (dStr > DateForApiFormate(activityEnd, true)) : false;

                return (
                  <Td key={dStr} style={{ textAlign: "left" }}>
                    {/* <Dot color={isBusy ? '#ef4444' : '#10b981'} /> */}
                    {/* {isBusy ? '❌' : '✅' } */}
                    <input
                      type="checkbox"
                      checked={isAssigned || isBusy}
                      disabled={isBusy}
                      onChange={(e) => handleToggleAllocation(emp, dStr, e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#6C5CE7', cursor: isBusy ? 'not-allowed' : 'pointer' }}
                      title={isAssigned ? 'Already assigned on this date' : (isBusy ? 'Not available on this date' : (isAfterEnd ? 'After activity end date' : 'Click to select'))}
                    />
                  </Td>
                );
              })}
             {needsPaging && <Td></Td>}
              <Td>
                <div style={{ marginLeft: '0.5rem' }}>
                  {hasAssignableDate ? (
                    <Button
                      variant="primary"
                      iconOnly={true}
                      onClick={() => handleAutoAssign(emp)}
                      title="Click to auto-assign available dates"
                    >
                      <FaUserPlus size={12} />
                    </Button>
                  ) : (
                    <Button variant="outline" iconOnly={true} disabled={true} title="Already assigned / No free dates for this activity">
                      <FaCheck size={11} />
                    </Button>
                  )}
                  {lastAutoAssign?.[emp.emp_id]?.length > 0 && (
                    <Button
                      variant="outline"
                      iconOnly={true}
                      onClick={() => handleUndoAutoAssign(emp)}
                      title="Undo last auto-assign for this resource"
                    >
                      <FaUndo size={11} />
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
  )
}

export default ResourceAvailabilityCard

const normalizeRole = (grade) => {
  const val = String(grade ?? "").trim().toUpperCase();
  return ["2", "T"].includes(val) ? "TL" : "EX";
};