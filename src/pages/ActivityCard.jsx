import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GiBackwardTime, GiCancel } from "react-icons/gi";
import { getCurrentDateTimeDefaults, getTodayApiDateStr, formatDate, formatAPITime, parseApiDate } from '../utils/utils';
import Button from '@/components/Button';
import { FaBuilding, FaChevronDown, FaPlay, FaPlus, FaRegCalendarAlt, FaRegCheckCircle, FaRegClock, FaRegFile, FaUserCheck, FaUserPlus, FaUsers } from 'react-icons/fa';
import Badge from '@/components/Badge';
import { FiEye, FiInfo, FiMapPin, FiUsers } from 'react-icons/fi';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { LuClipboardPen, LuFileText, LuIndianRupee, LuPackage } from "react-icons/lu";
import { theme } from '@/styles/Theme';
import { IoPinOutline } from 'react-icons/io5';
import { MdOutlinePauseCircle } from 'react-icons/md';
import { IoMdTrendingUp } from 'react-icons/io';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { AssignEmployee } from '../components/modal/AssignEmployeeModal';
import AddOPEModal from '../components/modal/AddOPEModal';
import OpeListModal from '../components/modal/OpeListModal';

const CardHover = styled.div`
  background: ${({ theme, shouldHidePrimaryButton }) => shouldHidePrimaryButton ? `${theme.colors?.error}30` : theme.colors?.card || '#fff'};
  border: 1px solid ${({ theme, shouldHidePrimaryButton }) => shouldHidePrimaryButton ? theme.colors?.error : theme.colors?.border || '#e0e0e0'};
  border-radius: ${({ theme }) => theme.cardStyle?.borderRadius || '12px'};
  padding: ${({ theme }) => theme.spacing?.lg || '1rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 6px rgba(0, 0, 0, 0.1)'};
  transition: ${({ theme }) => theme.transitions?.normal || 'all 0.3s ease'};
  
  &:hover {
    border-color: ${({ theme, shouldHidePrimaryButton }) => shouldHidePrimaryButton ? theme.colors?.error : theme.colors?.primary || '#6C63FF'};
    box-shadow: ${({ theme }) =>
    theme.cardStyle?.shadow === 'heavy' ? '0 10px 20px rgba(108,99,255,0.2)' :
      theme.shadows?.lg || '0 4px 12px rgba(108,99,255,0.15)'};
    transform: ${({ theme }) =>
    theme.cardStyle?.animation ? 'translateY(-2px)' : 'none'};
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

const Flex = styled.div`
  display: grid;
 grid-template-columns: ${({ filterType }) => filterType === 'today' || "custom" ? '5fr 1fr' : '1fr'};
  gap: ${({ theme }) => theme.spacing?.xl || '3rem'};
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  }
`;

const Info = styled.div`
  flex: 1;
  min-width: 0
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  min-width: 180px;
  
  @media (max-width: 968px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const Company = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes?.lg || '1.125rem'};
  font-weight: ${({ theme }) => theme.fontWeights?.heading || '600'};
  margin: 0 0 ${({ theme }) => theme.spacing?.xs || '0.25rem'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const Order = styled.div`
  font-family: 'Courier New', monospace;
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.8rem'};
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '0.4rem'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing?.md || '0.75rem'};
  margin: ${({ theme }) => theme.spacing?.md || '1rem'} 0;
`;

const Item = styled.div`
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.85rem'};
  color: ${({ theme }) => theme.colors?.text || '#000'};
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  font-size: ${({ theme }) => theme.fontSizes?.xs || '0.75rem'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.xs || '0.2rem'};
`;
const Label2 = styled.div`
  color: ${({ theme }) => theme.colors?.card || '#666'};
  font-size: ${({ theme }) => theme.fontSizes?.xs || '0.75rem'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.xs || '0.2rem'};
`;

const StatusBadge = styled(Badge)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-weight: 600;

  ${({ status }) =>
    status === "Started" &&
    `
    background: #2196F3;
    color: #fff;
  `}

  ${({ status }) =>
    status === "In Progress" &&
    `
    background: #2196F3;
    color: #fff;
  `}

  ${({ status }) =>
    status === "Completed" &&
    `
    background: #00C853;
    color: #fff;
  `}

  ${({ status }) =>
    status === "Planned" &&
    `
    background: #FFD600;
    color: #000;
  `}

  ${({ status }) =>
    status === "Pending" &&
    `
    background: #9333EA; /* amber/orange */
    color: #fff;
  `}
`


const Progress = styled.div`
  margin: ${({ theme }) => theme.spacing?.md || '0.75rem'} 0;
`;

const Bar = styled.div`
  height: 6px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f0f2f8'};
  border-radius: ${({ theme }) => theme.borderRadius?.full || '999px'};
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  width: ${({ p }) => p}%;
  background: ${({ theme }) => theme.colors?.primary || '#6C63FF'};
  transition: ${({ theme }) => theme.transitions?.normal || 'width 0.4s ease'};
`;

const LogsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing?.md || '1rem'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: ${({ theme }) => theme.borderRadius?.md || '8px'};
  overflow: hidden;
`;

const LogsHeader = styled.div`
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'} ${({ theme }) => theme.spacing?.md || '0.75rem'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.85rem'};
  transition: ${({ theme }) => theme.transitions?.fast || '0.2s ease'};
  
  &:hover {
    background: ${({ theme }) => theme.colors?.primaryLight || '#E8E6FF'};
  }
`;

const LogsToggle = styled.div`
color: "#666";
  transition: ${({ theme }) => theme.transitions?.normal || 'transform 0.3s ease'};
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const LogsContent = styled.div`
  max-height: ${({ isOpen }) => (isOpen ? '400px' : '0')};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions?.normal || 'max-height 0.3s ease'};
`;

const LogsGrid = styled.div`
  display: grid;
  gap: 1px;
  background-color: ${({ theme }) => theme.colors?.border || '#e0e0e0'};
`;

const LogRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 2fr;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  align-items: center;
  padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'} ${({ theme }) => theme.spacing?.md || '0.75rem'};
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.8rem'};
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing?.xs || '4px'};
  }
`;

const LogDate = styled.span`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '4px'};
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
`;

const LogTime = styled.span`
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '4px'};
`;

const LogStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  align-items: center;
`;

const LogBadge = styled.span`
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f0f2f8'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '4px'};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes?.xs || '0.75rem'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '4px'};
`;

const LogRemark = styled.div`
  grid-column: 1 / -1;
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  font-style: italic;
  padding-top: ${({ theme }) => theme.spacing?.xs || '4px'};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing?.xs || '4px'};
`;

const NoLogsMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing?.md || '1rem'};
  color: ${({ theme }) => theme.colors?.textLight || '#999'};
  background: ${({ theme }) => theme.colors?.card || '#fff'};
`;

const DetailValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.875rem'};
  color: ${({ theme }) => theme.colors?.text || '#333333'};
  font-weight: 500;
`;
const DetailValue2 = styled.span`
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.875rem'};
  color: ${({ theme }) => theme.colors?.card || '#333333'};
  font-weight: 500;
`;

const PrimaryBtn = styled(Button)`
  background: ${({ theme }) => theme.colors?.primary || '#6C63FF'};
  color: #fff;
  
  &:hover:not(:disabled) {
    background:  '#5a52e0';
  }
      @media (max-width: 768px) {
    width: 100%;
  }
`;

const SuccessBtn = styled(Button)`
  background: ${({ theme }) => theme.colors?.success || '#00C853'};
  color: #fff;
  font-size: 16px;
  
  &:hover:not(:disabled) {
    background: #00b347;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SecondaryBtn = styled(Button)`
  background: ${({ theme }) => theme.colors?.card || '#fff'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  font-size: 16px;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors?.backgroundAlt || '#f5f5f5'};
  }
      @media (max-width: 768px) {
    width: 100%;
  }
`;

const AccordionSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-radius: ${({ theme }) => theme.borderRadius?.md || '8px'};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

const AccordionHeader = styled.div`
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  padding: ${({ theme }) => theme.spacing?.sm || '0.75rem'} ${({ theme }) => theme.spacing?.lg || '1rem'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: ${({ theme }) => theme.transitions?.fast || '0.2s ease'};
  
  &:hover {
    background: ${({ theme }) => theme.colors?.primaryLight || '#E8E6FF'};
  }
`;

const AccordionTitle = styled.div`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.875rem'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
`;

const AccordionToggle = styled.div`
  color: ${({ theme }) => theme.colors?.textLight || '#666'};
  transition: ${({ theme }) => theme.transitions?.normal || 'transform 0.3s ease'};
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  display: flex;
  align-items: center;
`;

const AccordionContent = styled.div`
  max-height: ${({ isOpen }) => (isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions?.normal || 'max-height 0.3s ease'};
  background: ${({ theme }) => theme.colors?.card || '#fff'};
`;

const ActionsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  align-items: center;
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'} 0;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing?.md || '0.75rem'};
  padding: ${({ theme }) => theme.spacing?.md || '1rem'} 0;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing?.md || '0.75rem'};
  padding: ${({ theme }) => theme.spacing?.lg || '1rem'};
`;
const RemarkItem = styled.div`
  grid-column: 1 / -1;
  font-size: ${({ theme }) => theme.fontSizes?.sm || '0.85rem'};
  color: ${({ theme }) => theme.colors?.text || '#000'};
`;
const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  align-items: center;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ResourceGrid = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing?.xs || '6px'};
  margin-top: ${({ theme }) => theme.spacing?.xs || '4px'};
  max-height: 160px;
  overflow-y: auto;
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || '#ccc'};
    border-radius: 4px;
  }
`;

const ResourceCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f8f9fc'};
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '6px'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e0e0e0'};
`;

const ResourceAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ color }) => color}22;
  color: ${({ color }) => color};
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ResourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ResourceName = styled.span`
  font-weight: 600;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResourceMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TypeBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: ${({ color }) => color};
  background: ${({ color }) => color}18;
  padding: 1px 6px;
  border-radius: 3px;
`;

export const ActivityCard = ({ activity, filterType, onAction, isManager, onNavigateToRetainer, onNavigateToOpe, refreshData, onAddPincode }) => {
  const [assignEmployeeModal, setAssignedEmployeeModal] = useState(false);
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isOpeModalOpen, setIsOpeModalOpen] = useState(false);
  const progress = activity.total_no_of_items || 0;
  const totalEffort = activity.original_P.no_of_items || 0;
  const todayApiDateStr = getTodayApiDateStr();

  const isActivityStart = !!activity.original_A;

  // Check if max_audit_end_date exists
  const hasMaxAuditEndDate = !!activity?.original_P?.max_audit_end_date;

  // Check if audit end date has passed (only if date exists)
  const isAuditEndDatePass = hasMaxAuditEndDate && parseApiDate(activity?.original_P?.max_audit_end_date) < parseApiDate(todayApiDateStr);

  const isNonNegotiable = activity?.original_P?.is_non_negotiable_date;
  const isCompleted = activity.project_period_status === "Completed";

  const todayLog = activity.day_logs?.[getTodayApiDateStr()] || {};
  const todayCheckedIn = !!todayLog.check_in;
  const todayCheckedOut = !!todayLog.check_out;

  const hasOpenSession = (todayCheckedIn && !todayCheckedOut) || activity.hasPendingCheckout;
  const hasPendingCheckoutOnly = activity.hasPendingCheckout && !todayCheckedIn;

  const shouldShowRedBackground =
    isNonNegotiable &&           // Must be non-negotiable
    hasMaxAuditEndDate &&        // Must have max_audit_end_date
    isAuditEndDatePass &&        // Date must be passed
    !isCompleted &&              // Not completed
    (hasOpenSession || !hasOpenSession);

  const shouldShowExceedMessage =
    hasMaxAuditEndDate &&        // Must have max_audit_end_date
    isAuditEndDatePass &&        // Date must be passed
    !isCompleted;

  const shouldHidePrimaryButton =
    isNonNegotiable &&           // Must be non-negotiable
    hasMaxAuditEndDate &&        // Must have max_audit_end_date
    isAuditEndDatePass &&        // Date must be passed
    !isCompleted &&              // Not completed
    !hasOpenSession;

  const finalHideButtons = shouldHidePrimaryButton;

  // Hide buttons only when:
  // - Audit date is passed AND is non-negotiable AND there's NO open session
  // When is_non_negotiable_date is false, buttons always show (even after deadline)
  // When is_non_negotiable_date is true, buttons only hide if no session to close
  // const shouldHidePrimaryButton = isAuditEndDatePass && isNonNegotiable && !hasOpenSession;

  // Show error message whenever the audit date exists and has passed
  // const showAuditExceededMessage = isAuditEndDatePass;

  const { todayISO } = getCurrentDateTimeDefaults();

  const isImageFile = (url = "") => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

  const getFileNameFromUrl = (url = "") => decodeURIComponent(url.split("/").pop().split("?")[0]);

  const handleFileClick = (url) => {
    if (isImageFile(url)) {
      // Open image in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Force download for non-image files
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileNameFromUrl(url);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const opeAmount = activity?.original_A?.ope_amt || activity?.original_P?.ope_amt || "0.00";
  const hasOPEAmount = opeAmount && opeAmount !== "0.00";

  const displayPlannedDate = () => {
    if (activity.planned_start_date === activity.planned_end_date) {
      return formatDate(activity.planned_start_date)
    } else {
      return `${formatDate(activity.planned_start_date)} to ${formatDate(activity.planned_end_date)}`
    }
  }

  return (
    <CardHover shouldHidePrimaryButton={shouldShowRedBackground}>
      <MainContent>
        <HeaderSection>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

            <Company>
              <FaBuilding size={18} />
              {activity.customer_name}
              {(activity.original_P.retainer_list.filter(r => r.a_type === "P").length !== 0) && (
                <Badge variant='info' style={{ cursor: "pointer" }} onClick={onNavigateToRetainer}>
                  <FiUsers size={14} style={{ marginRight: "0.4rem" }} />
                  Retainer assigned: {activity.original_P.retainer_list.filter(r => r.a_type === "P").length}
                </Badge>
              )}
              {activity.is_ope_actual && (
                <Badge variant={hasOPEAmount ? 'info' : 'warning'} style={{ cursor: "pointer" }} onClick={onNavigateToOpe}>
                  <LuIndianRupee size={14} style={{ marginRight: "0.4rem" }} />
                  {hasOPEAmount ? "OPE Given" : "OPE Pending"}
                </Badge>
              )}
            </Company>
            <StatusBadge status={activity.project_period_status || activity.todaysStatus}>
              <StatusIcon status={activity.project_period_status || activity.todaysStatus} />
              {activity.project_period_status || activity.todaysStatus}
            </StatusBadge>
          </div>
          <Order>
            <LuFileText size={14} />
            {activity.project_code || activity.order_item_key}
          </Order>
        </HeaderSection>

        <MainGrid>
          <Item>
            <Label><LuFileText size={14} />Audit Type</Label>
            <DetailValue>{activity.audit_type}</DetailValue>
          </Item>
          <Item>
            <Label><LuPackage size={14} />Total No. of Item Audit</Label>
            <DetailValue>{activity.original_P.no_of_items || 0}</DetailValue>
          </Item>
          <Item>
            <Label><FaRegCalendarAlt size={14} />Planned Date</Label>
            {/* <DetailValue>{formatDate(activity.planned_start_date)} to {formatDate(activity.planned_end_date)}<br /></DetailValue> */}
            <DetailValue>{displayPlannedDate()}</DetailValue>
          </Item>
          {/* <Item>
            <Label><CalendarEvent size={14} />Actual Date</Label>
            <DetailValue>{activity.actual_start_date ? `${formatDate(activity.actual_start_date)} to ${formatDate(activity.actual_end_date)}` : "Not started"}</DetailValue>
          </Item> */}
          {activity.original_P.store_name && (
            <Item>
              <Label><FiMapPin size={14} />Location</Label>
              <DetailValue>{activity.original_P.store_name}</DetailValue>
            </Item>
          )}
        </MainGrid>
        <Grid2>
          {activity?.original_P?.is_non_negotiable_date && <Item>
            <Label><CalendarEvent size={14} />Is audit date negotiable ?</Label>
            <Badge variant={activity?.original_P?.is_non_negotiable_date ? "error" : "success"}>{activity?.original_P?.is_non_negotiable_date ? "No" : "Yes"}</Badge><br />
            <DetailValue>{(activity?.original_P?.audit_date || activity?.original_P?.max_audit_end_date) ? `${formatDate(activity?.original_P?.audit_date)} to ${formatDate(activity?.original_P?.max_audit_end_date)}` : ""}</DetailValue>
          </Item>}
          {activity?.original_P?.is_non_negotiable_date && activity?.original_P?.max_audit_end_date &&
            <div style={{ background: theme.colors.error, padding: "0.5rem", borderRadius: theme.borderRadius.lg }}>
              <Label2><FaRegCalendarAlt size={14} />Non negotiable date</Label2>
              <DetailValue2>{(activity?.original_P?.audit_date || activity?.original_P?.max_audit_end_date) ? `${formatDate(activity?.original_P?.audit_date)} to ${formatDate(activity?.original_P?.max_audit_end_date)}` : ""}</DetailValue2>
            </div>

          }
        </Grid2>

        <ActionsRow>

          {(activity?.original_P?.status === "S" || activity?.original_P?.status === "C") &&
            !finalHideButtons && (
              <TodayActionButtons
                activity={activity}
                todayCheckedIn={todayCheckedIn}
                todayCheckedOut={todayCheckedOut}
                isActivityStart={isActivityStart}
                hasPendingCheckout={activity.hasPendingCheckout}
                pendingCheckoutDate={activity.pendingCheckoutDate}
                complete={activity.complete}
                onAction={onAction}
                todayISO={todayISO}
                getTodayApiDateStr={getTodayApiDateStr}
                retainerPage={false}
                isManager={isManager}
                showAuditExceededMessage={shouldShowExceedMessage}
                setAssignedEmployeeModal={setAssignedEmployeeModal}
                setOpenOpeModal={setOpenOpeModal}
                setIsOpeModalOpen={setIsOpeModalOpen}
              />
            )}
        </ActionsRow>
      </MainContent>

      {Object.keys(activity.day_logs || {}).length > 0 && <ActivityLogs
        activity={activity}
        logs={activity.day_logs}
        isOpen={isLogsOpen}
        onToggle={() => setIsLogsOpen(!isLogsOpen)}
      />}

      <AssignEmployee isOpen={assignEmployeeModal} onClose={() => setAssignedEmployeeModal(false)} activityData={activity} refreshData={refreshData} />

      <AddOPEModal isOpen={openOpeModal} onClose={() => setOpenOpeModal(false)} />

      <OpeListModal
        isOpen={isOpeModalOpen}
        onClose={() => setIsOpeModalOpen(false)}
        opeList={[
          { id: 'OPE-001', submitted_date: '03-Jun-2026', amount: '1250.00', submitted_file: 'https://example.com/file1.pdf', file_name: 'receipt_june.pdf' },
          { id: 'OPE-002', submitted_date: '05-Jun-2026', amount: '340.50', submitted_file: null },
        ]}
      />
    </CardHover>
  );
};

//Status Icon
const StatusIcon = ({ status }) => {
  switch (status) {
    case "Planned":
      return <FaRegCalendarAlt size={14} />;
    case "Started":
      return <FaPlay size={14} />;
    case "In Progress":
      return <IoMdTrendingUp size={14} />;
    case "Pending":
      return <MdOutlinePauseCircle size={14} />;
    case "Completed":
      return <FaRegCheckCircle size={14} />;
    default:
      return null;
  }
};

//ProgressBar for audit Items
const ProgressBar = ({ completed, total, label = 'Progress' }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Progress>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
        <span style={{ color: "#666" }}>{label}</span>
        {/* <strong style={{color: "#666"}}>{percentage}%</strong> */}
      </div>
      <Bar><Fill p={percentage} /></Bar>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
        {/* <span>{completed}h spent</span> */}
        <span>{completed}</span>
        {/* <span>{total}h total</span> */}
        <span>{total}</span>
      </div>
    </Progress>
  );
};

export const ActivityLogs = ({ activity, retainer, resourceList, logs, isOpen, onToggle }) => {
  console.log("retainer", activity)
  const logEntries = retainer
    ? (retainer?.parentActivity?.original_A?.retainer_list?.filter(r => r.a_type === 'A') || [])
    : Object.values(logs || {});
  const unit = retainer?.parentActivity?.original_P?.product_unit
  const hasRetainerList = logEntries.some(log => log.resourceList && log.resourceList !== "");

  return (
    <LogsSection>
      <LogsHeader onClick={onToggle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: "#666" }}>
          <LuFileText size={16} /> {retainer ? 'Retainer Activity Logs' : 'Activity Logs'} <span style={{ fontWeight: 400 }}>({logEntries.length})</span>
        </span>
        {/* <LogsToggle isOpen={isOpen}><FaChevronDown size={18} color="#666" /></LogsToggle> */}
      </LogsHeader>
      <LogsContent isOpen={isOpen}>
        {(!retainer || logEntries.length === 0 || (retainer && !hasRetainerList)) ? (
          <NoLogsMessage>No activity recorded yet</NoLogsMessage>
        ) : (
          <LogsGrid>
            {logEntries.map((log, i) => {
              if (!retainer) {
                return (
                  <LogRow key={i}>
                    <LogDate><FaRegCalendarAlt size={14} />{log.section}</LogDate>

                    <LogStats>
                      <LogBadge><LuPackage size={12} />Items: {log.no_of_items || 0}</LogBadge>
                      <LogBadge>
                        <FaUsers size={12} />
                        TL: {(log.resourceList || []).filter(r => r.split('^')[3] === 'TL').length}
                      </LogBadge>
                      <LogBadge>
                        <FaUsers size={12} />
                        EX: {(log.resourceList || []).filter(r => r.split('^')[3] === 'EX').length}
                      </LogBadge>
                    </LogStats>

                    {log.resourceList && log.resourceList.length > 0 && (
                      <ResourceGrid resourceCount={log.resourceList.length}>
                        {log.resourceList.map((resStr, index) => {
                          const [emp_id, name, items, typeCode] = resStr.split('^');
                          const typeStr = typeCode === 'TL' ? 'Team Lead' : typeCode === 'EX' ? 'Executive' : typeCode;
                          const typeColor = typeCode === 'TL' ? '#6C5CE7' : '#00B894';
                          return (
                            <ResourceCard key={index}>
                              <ResourceAvatar color={typeColor}>{name?.[0]}</ResourceAvatar>
                              <ResourceInfo>
                                <ResourceName>{name}</ResourceName>
                                <ResourceMeta>
                                  <TypeBadge color={typeColor}>{typeStr}</TypeBadge>
                                  <span style={{ fontSize: '0.68rem', color: '#888' }}>
                                    · {items} {unit || 'item'}{items !== '1' ? 's' : ''}
                                  </span>
                                </ResourceMeta>
                              </ResourceInfo>
                            </ResourceCard>
                          );
                        })}
                      </ResourceGrid>
                    )}
                  </LogRow>
                );
              }

              return (
                <LogRow key={i}>
                  <LogDate><FaRegCalendarAlt size={14} />{log.section}</LogDate>
                  <LogTime><FaRegClock size={14} />{log.check_in?.time || "Not Check in"} - {log.check_out?.time || 'Not Check Out'}</LogTime>
                  <LogStats>
                    <LogBadge><LuPackage size={12} />No of item audit: {log.no_of_items}</LogBadge>
                  </LogStats>
                </LogRow>
              );
            })}
            {activity?.emp_remarks && (
              <div style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.9rem", gap: "0.5rem" }}>
                <LuClipboardPen size={16} color='#666' />
                <LogRemark>{activity?.emp_remarks || "No Remarks found"}</LogRemark>
              </div>
            )}
          </LogsGrid>
        )}
      </LogsContent>
    </LogsSection>
  );
};

const StatusMessage = ({ children, type }) => (
  <div style={{ color: `${type === "success" ? theme.colors.success : theme.colors.error}`, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
    {type === "success" ? <FaRegCheckCircle size={24} /> : <GiCancel size={24} />}
    {children}
  </div>
);

export const TodayActionButtons = ({
  activity,
  todayCheckedIn,
  todayCheckedOut,
  isActivityStart,
  hasPendingCheckout,
  pendingCheckoutDate,
  complete,
  onAction,
  todayISO,
  getTodayApiDateStr, isManager,
  retainerPage = false,
  retainer,
  onRetainerUpdate,
  showAuditExceededMessage,
  setAssignedEmployeeModal,
  setOpenOpeModal,
  setIsOpeModalOpen
}) => {
  const todayApiDate = getTodayApiDateStr();
  const plannedEnd = activity.planned_end_date || activity.original_P?.planned_end_date;
  const isPlannedEndToday = plannedEnd === todayISO;

  const todayLogs = Object.entries(activity.day_logs || {})
    .filter(([key]) => key.startsWith(todayApiDate))
    .map(([, log]) => log);

  const hasOngoingSessionToday = todayLogs.some((log) => log.check_in && !log.check_out);
  const isActivityCompleted = activity?.original_A?.status === "S";

  const isResourceAssigned = activity?.original_A?.resource_list


  // for Retainer flow
  if (!retainer) {
    if (isManager) {
      return (
        <> </>
      );
    }

    const { ui } = activity;
    if (ui?.isCompleted) {
      return (
        <>
          <StatusMessage type="success">Activity is completed for today</StatusMessage>
          <PrimaryBtn size="md" onClick={() => onAction({ type: "update_retainer", activity, retainerPage, retainer, onRetainerUpdate })}>
            <FaRegPenToSquare /> Update
          </PrimaryBtn>
        </>
      );
    }

    if (ui?.showCompleteBtn) {
      return (
        <SuccessBtn size="md" onClick={() => onAction({ type: "complete", activity, retainerPage, retainer, onRetainerUpdate })}>
          <FaRegCheckCircle /> Complete
        </SuccessBtn>
      );
    }

    if (ui?.showStartBtn) {
      return (
        <ButtonGroup>
          {/* <PrimaryBtn
          size="md"
          onClick={() => onAction({ type: "start", activity, retainerPage, retainer, onRetainerUpdate })}
        >
          Start Activity
        </PrimaryBtn> */}

          <PrimaryBtn
            size="md"
            onClick={() => setAssignedEmployeeModal(true)}
          >
            {!isResourceAssigned ? <FaUserPlus /> : <FaUserCheck />} {!isResourceAssigned ? "Assign" : "Assigned"} Resources
          </PrimaryBtn>

          {isResourceAssigned &&
            <>
              <SecondaryBtn onClick={() => setOpenOpeModal(true)}>Add OPE</SecondaryBtn>
              <SecondaryBtn onClick={() => setIsOpeModalOpen(true)}>View OPE</SecondaryBtn>
            </>
          }
        </ButtonGroup>
      );
    }

    return <></>;
  }

  // 1. Fully complete
  if (isActivityCompleted) {
    return (<ButtonGroup>
      {/* <StatusMessage type="success">Activity is completed</StatusMessage> */}
      <PrimaryBtn size="md" onClick={() => onAction({ type: "start_a", activity, retainerPage, retainer, isMaxAuditEndDatePass: showAuditExceededMessage })}>
        <PlayCircle /> Start Again
      </PrimaryBtn>

      {activity?.original_A?.status !== "A" &&
        <SecondaryBtn size="md" onClick={() => onAction({ type: 'reverse', activity, retainerPage, retainer, onRetainerUpdate })}>
          <GiBackwardTime /> Reverse Audit Status
        </SecondaryBtn>}
    </ButtonGroup>);
  }

  // 3. Pending checkout from yesterday
  if (hasPendingCheckout && pendingCheckoutDate !== todayApiDate) {
    return (
      <ButtonGroup>
        <PrimaryBtn size="md" onClick={() => onAction({ type: "checkout_yesterday", activity, retainerPage, retainer, onRetainerUpdate })}>
          <FaRegCheckCircle /> Close Check-in
        </PrimaryBtn>
        <SecondaryBtn size="lg" onClick={() => onAction({ type: "complete_y", activity, retainerPage, retainer, onRetainerUpdate })}>
          <FaRegCheckCircle /> Completed
        </SecondaryBtn>
      </ButtonGroup>
    );
  }

  // 4. Checked in today → Show Complete / Pause Activity
  if (hasOngoingSessionToday) {
    return isPlannedEndToday ? (
      <ButtonGroup>
        <SuccessBtn size="lg" onClick={() => onAction({ type: "complete", activity, retainerPage, retainer, onRetainerUpdate })}>
          <FaRegCheckCircle /> Completed
        </SuccessBtn>
        <SecondaryBtn size="sm" onClick={() => onAction({ type: "continue", activity, retainerPage, retainer, onRetainerUpdate })}>
          <PauseCircle /> Pause Activity
        </SecondaryBtn>
      </ButtonGroup>
    ) : (
      <ButtonGroup>
        <SuccessBtn size="sm" onClick={() => onAction({ type: "continue", activity, retainerPage, retainer, onRetainerUpdate })}>
          <PauseCircle /> Pause Activity
        </SuccessBtn>
        <SecondaryBtn size="lg" onClick={() => onAction({ type: "complete", activity, retainerPage, retainer, onRetainerUpdate })}>
          <FaRegCheckCircle /> Completed
        </SecondaryBtn>
      </ButtonGroup>
    );
  }

  // 5. Not checked in today
  if (!todayCheckedIn) {
    if (isActivityStart) {
      return (
        <ButtonGroup>
          <PrimaryBtn size="md" onClick={() => onAction({ type: "resume", activity, retainerPage, retainer, onRetainerUpdate, isMaxAuditEndDatePass: showAuditExceededMessage })}>
            <PlayCircle /> Resume Activity
          </PrimaryBtn>
          <SecondaryBtn size="md" onClick={() => onAction({ type: "force_complete", activity, retainerPage, retainer, onRetainerUpdate })}>
            <CheckCircle2 /> Mark as complete
          </SecondaryBtn>
        </ButtonGroup>
      );
    }
    return (
      <ButtonGroup>
        <PrimaryBtn size="md" onClick={() => onAction({ type: "start", activity, retainerPage, retainer, isMaxAuditEndDatePass: showAuditExceededMessage })}>
          <PlayCircle /> Start Activity
        </PrimaryBtn>
      </ButtonGroup>
    );
  }

  // 6. Fallback: Awaiting start (future scheduled)
  return (
    <ButtonGroup>
      <PrimaryBtn size="md" onClick={() => onAction({ type: "resume", activity, retainerPage, retainer, onRetainerUpdate, isMaxAuditEndDatePass: showAuditExceededMessage })}>
        <PlayCircle /> Resume Activity
      </PrimaryBtn>
      <SecondaryBtn size="md" onClick={() => onAction({ type: "force_complete", activity, retainerPage, retainer, onRetainerUpdate })}>
        <CheckCircle2 /> Mark as complete
      </SecondaryBtn>
    </ButtonGroup>
  );
};