"use client"

import { useState } from "react"
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
  const { logout, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
  }

  const handleprofile = () => {
    navigate("/profile")
  }

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
        <img src={profile?.image} alt="Company Logo" style={{ width: "50px", height: "50px", borderRadius: "10px", marginRight: "10px", border: "0.2px solid #000" }} />
      </div>

      <HeaderActions>

        <UserProfile onClick={handleprofile}>
            <UserAvatar>
              {profile?.name?.charAt(0) || <FaUser />}
            </UserAvatar>
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
