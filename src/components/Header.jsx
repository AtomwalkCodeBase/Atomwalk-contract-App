"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import {
  FaSearch,
  FaUser,
  FaBars,
  FaSignOutAlt,
  FaQuestion,
  FaTicketAlt,
  FaFileAlt,
  FaGift,
  FaUserCircle,
  FaKey,
  FaHome,
  FaUsers,
  FaTasks,
} from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { theme } from "../styles/Theme"
import { IoTicket } from "react-icons/io5"
import ConfirmPopup from "./ConfirmPopup"


const HeaderContainer = styled.header`
  background: white;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  right: 0;
  left: ${(props) => props.sidebarWidth};
  z-index: 99;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    left: 0;
    width: 100%;
    padding: 0 15px;
  }
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 15px;
  padding: 4px 15px;
  width: 300px;
  position: relative;
  @media (max-width: 768px) {
    width: 40px;
    transition: all 0.3s ease;
    
    ${(props) =>
    props.expanded &&
    `
      position: absolute;
      top: 5px;
      left: 60px;
      right: 15px;
      width: auto;
      z-index: 100;
    `}
    
    input {
      display: ${(props) => (props.expanded ? "block" : "none")};
    }
  }
`

const SearchInput = styled.input`
  border: none;
  background: transparent;
  margin-left: 10px;
  width: 100%;
  color:${({ theme }) => theme.colors.textLight};
  &:focus {
    outline: none;
  }
`

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  display: ${(props) => (props.show ? "block" : "none")};
  color: #242424;
`

const SearchResultItem = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
  
  svg {
    margin-right: 10px;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.2rem;
  margin-left: 15px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    margin-left: 10px;
  }
`

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    margin-left: 10px;
  }
`

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
`

const UserName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
  @media (max-width: 768px) {
    display: none;
  }
`

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    display: block;
    margin-right: 10px;
  }
`

const LogoutButton = styled(ActionButton)`
  color: ${({ theme }) => theme.colors.error};
  
  &:hover {
    color: ${({ theme }) => theme.colors.error};
    opacity: 0.8;
  }
`
// const Imagelogo = styled.img`
//   width: 80px;

const Header = ({ sidebarWidth = "250px", onMobileMenuClick }) => {
  const { logout, profile, companyInfo } = useAuth()
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const fmsdata = localStorage.getItem("fmsUser")

  // Menu items for search
  const menuItems = fmsdata ?
    [
      { path: "/fmsdashboard", name: "Overall", icon: <FaHome /> },
      { path: "/tasks", name: "Task List", icon: <FaTasks /> },
      { path: "/ticketList", name: "Ticket List", icon: <IoTicket /> },
      { path: "/customerList", name: "Customer List", icon: <FaUsers /> }
    ] :
    [
      { path: "/dashboard", name: "Dashboard", icon: <FaUser /> },
      { path: "/employees", name: "Employees", icon: <FaUser /> },
      { path: "/attendance-tracking", name: "Attendance", icon: <FaUser /> },
      { path: "/leave-management", name: "Leave Management", icon: <FaUser /> },
      { path: "/holidays", name: "Holiday Calendar", icon: <FaUser /> },
      { path: "/timesheet", name: "Timesheet", icon: <FaUser /> },
      { path: "/shifts", name: "Shift Scheduling", icon: <FaUser /> },
      { path: "/claims", name: "My Claims", icon: <FaUser /> },
      { path: "/appointees", name: "Appointees", icon: <FaUser /> },
      { path: "/analytics", name: "Analytics", icon: <FaUser /> },
      { path: "/helpdesk", name: "Help Desk", icon: <FaQuestion /> },
      { path: "/requestdesk", name: "Request Desk", icon: <FaTicketAlt /> },
      // { path: "/appraisal", name: "Appraisal", icon: <BsGraphUpArrow /> },
      { path: "/resolvedesk", name: "Resolve Desk", icon: <FaKey /> },
      { path: "/payslip", name: "Pay Slip", icon: <FaFileAlt /> },
      { path: "/wishes", name: "My Wishes", icon: <FaGift /> },
      { path: "/attendance-tracking", name: "check in", icon: <FaUser /> },
      { path: "/profile", name: "profile", icon: <FaUserCircle /> },
    ]

  const handleSearchClick = () => {
    setSearchExpanded(!searchExpanded)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase().trim()
    setSearchQuery(query)

    if (query === "") {
      setShowResults(false)
      return
    }

    // Enhanced search with fuzzy matching and keyword mapping
    const results = menuItems.filter((item) => {
      const itemName = item.name.toLowerCase()

      // Exact match
      if (itemName.includes(query)) return true

      // Keyword mapping for common terms
      const keywordMap = {
        'time': ['timesheet', 'attendance'],
        'shift': ['shifts'],
        'leave': ['leave management'],
        'holiday': ['holidays'],
        'pay': ['payslip'],
        'help': ['helpdesk'],
        'request': ['requestdesk'],
        // 'appraisal': ['appraisal'],
        'resolve': ['resolvedesk'],
        'wish': ['wishes'],
        'employee': ['employees'],
        'analytics': ['analytics'],
        'check in': ['attendance'],
        'check out': ['attendance'],
        'clock in': ['attendance'],
        'clock out': ['attendance']
      }

      // Check if query matches any keywords
      for (const [keyword, matches] of Object.entries(keywordMap)) {
        if (query.includes(keyword)) {
          return matches.some(match => itemName.includes(match))
        }
      }

      // Fuzzy matching - check if any word in the query partially matches
      const queryWords = query.split(' ')
      return queryWords.some(word =>
        word.length > 2 && // Only check words longer than 2 characters
        itemName.includes(word)
      )
    })

    setSearchResults(results)
    setShowResults(results.length > 0)
  }

  const handleResultClick = (path) => {
    navigate(path)
    setSearchQuery("")
    setShowResults(false)
    setSearchExpanded(false)
  }

  const handleLogout = () => {
    logout()
  }

  const handleprofile = () => {
    navigate("/profile")
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false)
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])
  const onClose = () => {
    setIsOpen(false)
  }
  const handleLogoutConfirm = () => {
    setIsOpen(true)
  }
  return (
    <HeaderContainer sidebarWidth={sidebarWidth}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <MobileMenuButton onClick={onMobileMenuClick}>
          <FaBars />
        </MobileMenuButton>
        <img src={companyInfo.image} alt="Company Logo" style={{ width: "80px", height: "50px", borderRadius: "10px", marginRight: "10px", border: "0.2px solid #000" }} />
        <SearchBar expanded={searchExpanded}>
          <FaSearch onClick={handleSearchClick} style={{ cursor: "pointer", color: `${theme.colors.textLight}` }} />
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
          />
        </SearchBar>

        <SearchResults show={showResults}>
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => (
              <SearchResultItem key={index} onClick={() => handleResultClick(item.path)}>
                {item.icon}
                {item.name}
              </SearchResultItem>
            ))
          ) : (
            <SearchResultItem>No results found</SearchResultItem>
          )}
        </SearchResults>
      </div>

      <HeaderActions>
        {/* {!checkedIn ? (
          <AttendanceButton onClick={handleCheckIn}>
            <FaSignInAlt />
            <span>Check In</span>
          </AttendanceButton>
        ) : (
          <AttendanceButton onClick={handleCheckOut} active>
            <FaCheckOut />
            <span>Check Out</span>
          </AttendanceButton>
        )} */}

        {/* <ActionButton>
          <FaBell />
          <NotificationBadge>3</NotificationBadge>
        </ActionButton>

        <ActionButton>
          <FaEnvelope />
          <NotificationBadge>5</NotificationBadge>
        </ActionButton> */}

        {/* <UserProfile onClick={handleprofile}>
          <UserAvatar>{profile?.name?.charAt(0) || <FaUser />}</UserAvatar>
          <UserName>{profile?.name || "User"}</UserName>
        </UserProfile> */}

        <UserProfile onClick={handleprofile}>
          {profile?.image ? (
            <img src={profile.image} alt="Profile" style={{ width: "50px", height: "50px", marginRight: "1rem", borderRadius: "50%", border: "2px solid rgb(245, 247, 214)" }} />
          ) : (
            <UserAvatar>
              {profile?.name?.charAt(0) || <FaUser />}
            </UserAvatar>
          )}
          <UserName>{profile?.name || "User"}</UserName>
        </UserProfile>

        <LogoutButton onClick={handleLogoutConfirm} title="Logout">
          <FaSignOutAlt />
        </LogoutButton>
      </HeaderActions>
      <ConfirmPopup
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => handleLogout()}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
      />
    </HeaderContainer>
  )
}

export default Header
