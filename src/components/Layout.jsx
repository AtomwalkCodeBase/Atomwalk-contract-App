"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { FaTachometerAlt, FaUserClock, FaCalendarAlt, FaReceipt, FaFileInvoiceDollar } from "react-icons/fa" // Import necessary icons
import "../styles/fonts.css" // Import global styles

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`

const MainContent = styled.main`
  flex: 1;
  margin-left: ${(props) => props.sidebarWidth};
  padding: 90px 20px 20px;
  transition: margin-left 0.3s ease;
  background: ${({ theme }) => theme.colors.background};
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 90px 15px 15px;
    width: 100%;
  }
`

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.primary};
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: ${(props) => (props.show ? "block" : "none")};
  
  @media (min-width: 769px) {
    display: none;
  }
`

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth <= 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen)
  }

  const handleMobileMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Example navItems array (assuming Sidebar uses this)
  const navItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { label: "Attendance Tracking", icon: <FaUserClock />, path: "/attendance-tracking" },
    { label: "Leave Management", icon: <FaCalendarAlt />, path: "/leave-management" },
    { label: "My Claims", icon: <FaReceipt />, path: "/my-claims" },
    { label: "My Pay Slip", icon: <FaFileInvoiceDollar />, path: "/my-pay-slip" },
  ]

  return (
    <LayoutContainer>
      <Sidebar onToggle={handleSidebarToggle} initialOpen={sidebarOpen} navItems={navItems} />
      <Overlay show={isMobile && sidebarOpen} onClick={handleOverlayClick} />
      <MainContent sidebarWidth={sidebarOpen ? "250px" : "70px"}>
        <Header sidebarWidth={sidebarOpen ? "250px" : "70px"} onMobileMenuClick={handleMobileMenuClick} />
        {title && <PageTitle>{title}</PageTitle>}
        {children}
      </MainContent>
    </LayoutContainer>
  )
}

export default Layout
