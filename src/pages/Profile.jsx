"use client"

import { useEffect, useState } from "react"
import styled from "styled-components"
import {
  FaIdCard,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaLock,
  FaCheck,
  FaTimes,
  FaUserTie,
  FaBirthdayCake,
  FaPalette,
  FaMoon,
  FaSun,
  FaWater,
  FaFillDrip,
  FaPuzzlePiece,
  FaFont,
  FaColumns,
  FaUserCog,
  FaPaintBrush,
  FaUndo,
  FaSquare,
  FaBars,
  FaRulerHorizontal,
  FaTextWidth,
  FaTextHeight,
  FaToggleOn,
  FaStar,
  FaSquareFull,
  FaIcons,
  FaSortAlphaDown,
  FaExchangeAlt,
} from "react-icons/fa"
import Card from "../components/Card"
import Button from "../components/Button"
import Badge from "../components/Badge"
import { useTheme } from "../context/ThemeContext"
import { toast } from "react-toastify"
import { getEmployeeInfo } from "../services/authServices"
import { setuserpinview } from "../services/productServices"
import Layout from "../components/Layout"

const PageHeader = styled.div`
  background: linear-gradient(120deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  border-radius: ${({ theme }) => theme.borderRadius?.lg || "16px"};
  padding: ${({ theme }) => theme.spacing?.lg || "2rem"};
  margin-bottom: ${({ theme }) => theme.spacing?.lg || "2rem"};
  color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes?.["2xl"] || "2rem"};
    font-weight: 700;
    color: white;
  }
  
  p {
    opacity: 0.8;
    margin: 0.5rem 0 0;
  }
`

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${({ theme }) => theme.spacing?.lg || "2rem"};
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0;
  }
`

const ProfileSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.lg || "2rem"};
  @media (max-width: 600px) {
    gap: 0.5rem;
    width: 100%;
  }
`

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.borderRadius?.lg || "16px"};
  box-shadow: ${({ theme }) => theme.shadows?.lg || "0 8px 24px rgba(0, 0, 0, 0.08)"};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions?.normal || "transform 0.3s ease, box-shadow 0.3s ease"};
  padding: ${({ theme }) => theme.spacing?.md || "1rem"};
  @media (max-width: 600px) {
    padding: 0.5rem !important;
    min-width: 0;
    box-sizing: border-box;
  }
  
  &:hover {
    transform: ${({ theme }) => (theme.cardStyle?.animation ? "translateY(-5px)" : "none")};
    box-shadow: ${({ theme }) => (theme.cardStyle?.animation ? "0 12px 30px rgba(0, 0, 0, 0.12)" : theme.shadows?.lg || "0 8px 24px rgba(0, 0, 0, 0.08)")};
  }
`

const ProfileImage = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: ${({ theme }) => theme.borderRadius?.lg || "16px"};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  @media (max-width: 600px) {
    margin-bottom: 1rem;
  }
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${({ theme }) => theme.spacing?.md || "1rem"} ${({ theme }) => theme.spacing?.md || "1rem"};
`

const ProfileName = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes?.xl || "1.75rem"};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`

const ProfileRole = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin: 0.5rem 0 1rem;
  text-align: center;
  font-size: 1.1rem;
`

const BadgesContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const StyledBadge = styled(Badge)`
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius?.full || "20px"};
  font-weight: 600;
  font-size: 0.85rem;
  
  &.primary {
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    color: white;
    box-shadow: 0 4px 10px ${({ theme }) => theme.colors.shadow};
  }
  
  &.secondary {
    background: linear-gradient(to right, #11998e, #38ef7d);
    color: white;
    box-shadow: 0 4px 10px rgba(17, 153, 142, 0.3);
  }
`

const ProfileDetail = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing?.sm || "0.8rem"} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-right: ${({ theme }) => theme.spacing?.md || "1rem"};
    min-width: 1.2rem;
    font-size: ${({ theme }) => theme.icons?.size || "1.2rem"};
  }
  
  span {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.lg || "2rem"};
  @media (max-width: 600px) {
    width: 100%;
  }
`

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || "1.5rem"} 0;
  font-size: ${({ theme }) => theme.fontSizes?.lg || "1.4rem"};
  color: ${({ theme }) => theme.colors.text};
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  }
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const DetailCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius?.md || "12px"};
  padding: ${({ theme }) => theme.spacing?.md || "1.25rem"};
  box-shadow: ${({ theme }) => theme.shadows?.sm || "0 4px 12px rgba(0, 0, 0, 0.05)"};
  transition: ${({ theme }) => theme.transitions?.normal || "transform 0.3s ease, box-shadow 0.3s ease"};
  border-top: 4px solid ${(props) => props.color || props.theme.colors.primary};
  
  &:hover {
    transform: ${({ theme }) => (theme.cardStyle?.animation ? "translateY(-3px)" : "none")};
    box-shadow: ${({ theme }) => (theme.cardStyle?.animation ? "0 8px 16px rgba(0, 0, 0, 0.1)" : theme.shadows?.sm || "0 4px 12px rgba(0, 0, 0, 0.05)")};
  }
`

const DetailLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${(props) => props.iconColor || props.theme.colors.primary};
  }
`

const DetailValue = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`

const PinResetSection = styled.div`
  padding: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  background: linear-gradient(to right, ${({ theme }) => theme.colors.backgroundAlt}, ${({ theme }) => theme.colors.background});
  border-radius: ${({ theme }) => theme.borderRadius?.md || "12px"};
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.05);
`

const PinInputGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md || "1rem"};
  margin-bottom: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing?.md || "1rem"};
  }
`

const PinInput = styled.input`
  padding: 0.9rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius?.sm || "8px"};
  flex: 1;
  font-size: 1rem;
  letter-spacing: 0.1em;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.shadow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
    letter-spacing: 0;
  }
`

const AlertBox = styled.div`
  padding: ${({ theme }) => theme.spacing?.md || "1rem"};
  border-radius: ${({ theme }) => theme.borderRadius?.sm || "8px"};
  margin-bottom: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  display: flex;
  align-items: center;
  
  &.success {
    background-color: ${({ theme }) => theme.colors.success}22;
    color: ${({ theme }) => theme.colors.success};
    border-left: 4px solid ${({ theme }) => theme.colors.success};
  }
  
  &.error {
    background-color: ${({ theme }) => theme.colors.error}22;
    color: ${({ theme }) => theme.colors.error};
    border-left: 4px solid ${({ theme }) => theme.colors.error};
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md || "1rem"};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`

const StyledButton = styled(Button)`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.buttons?.borderRadius || "8px"};
  font-weight: 600;
  transition: ${({ theme }) => theme.transitions?.normal || "all 0.3s ease"};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &.primary {
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border: none;
    color: white;
    box-shadow: ${({ theme }) => (theme.buttons?.shadow ? "0 4px 10px " + theme.colors.shadow : "none")};
    
    &:hover {
      box-shadow: ${({ theme }) => (theme.buttons?.shadow && theme.buttons?.animation ? "0 6px 15px " + theme.colors.shadow : theme.buttons?.shadow ? "0 4px 10px " + theme.colors.shadow : "none")};
      transform: ${({ theme }) => (theme.buttons?.animation ? "translateY(-2px)" : "none")};
    }
  }
  
  &.outline {
    background: ${({ theme }) => theme.colors.card};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    
    &:hover {
      background: ${({ theme }) => theme.colors.primaryLight};
      transform: ${({ theme }) => (theme.buttons?.animation ? "translateY(-2px)" : "none")};
    }
  }
  
  &.danger {
    background: linear-gradient(to right, #ff4b2b, #ff416c);
    border: none;
    color: white;
    
    &:hover {
      box-shadow: ${({ theme }) => (theme.buttons?.shadow && theme.buttons?.animation ? "0 6px 15px rgba(255, 75, 43, 0.4)" : "none")};
      transform: ${({ theme }) => (theme.buttons?.animation ? "translateY(-2px)" : "none")};
    }
  }
`

const TabContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing?.lg || "2rem"};
`

const TabGroup = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing?.lg || "2rem"};
  overflow-x: auto;
  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  
  &::-webkit-scrollbar {
    height: 0;
    display: none;
  }
`

const TabButton = styled.button`
  padding: ${({ theme }) => theme.spacing?.md || "1rem"} ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  background: transparent;
  border: none;
  border-bottom: 3px solid ${(props) => (props.active ? props.theme.colors.primary : "transparent")};
  color: ${(props) => (props.active ? props.theme.colors.primary : props.theme.colors.textLight)};
  font-weight: ${(props) => (props.active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
  @media (max-width: 600px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
    min-width: 90px;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`

const StatCard = styled.div`
  background: linear-gradient(135deg, ${(props) => props.bgStart || props.theme.colors.primary}, ${(props) => props.bgEnd || props.theme.colors.secondary});
  border-radius: ${({ theme }) => theme.borderRadius?.md || "12px"};
  padding: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  position: relative;
`

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes?.["4xl"] || "2.5rem"};
  font-weight: 700;
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes?.md || "1rem"};
  opacity: 0.9;
  font-weight: 500;
`

const StatIcon = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 2rem;
  opacity: 0.15;
`

// Theme selection components
const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  margin-bottom: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`

const ThemeCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius?.md || "12px"};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows?.sm || "0 4px 12px rgba(0, 0, 0, 0.1)"};
  transition: ${({ theme }) => theme.transitions?.normal || "all 0.3s ease"};
  cursor: pointer;
  border: 2px solid ${(props) => (props.isActive ? props.theme.colors.primary : "transparent")};
  
  &:hover {
    transform: ${({ theme }) => (theme.cardStyle?.animation ? "translateY(-5px)" : "none")};
    box-shadow: ${({ theme }) => (theme.cardStyle?.animation ? "0 8px 20px rgba(0, 0, 0, 0.15)" : theme.shadows?.sm || "0 4px 12px rgba(0, 0, 0, 0.1)")};
  }
`

const ThemePreview = styled.div`
  height: 120px;
  background: linear-gradient(135deg, ${(props) => props.colors.primary}, ${(props) => props.colors.secondary});
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    width: 60%;
    height: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50px;
    left: 20px;
    width: 80%;
    height: 40px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
  }
`

const ThemeInfo = styled.div`
  padding: ${({ theme }) => theme.spacing?.md || "1rem"};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ThemeName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const ThemeActiveIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 0.8rem;
  }
`

const ThemeIcon = styled.div`
  margin-right: 0.5rem;
  color: ${(props) => props.color || props.theme.colors.primary};
`

const ColorPickerCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius?.md || "12px"};
  padding: ${({ theme }) => theme.spacing?.md || "1.25rem"};
  box-shadow: ${({ theme }) => theme.shadows?.sm || "0 4px 12px rgba(0, 0, 0, 0.05)"};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ColorPickerLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ColorPickerInput = styled.input`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius?.sm || "8px"};
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius?.sm || "8px"};
  }
`

const ColorPickerValue = styled.div`
  font-family: monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`

const PreviewSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing?.lg || "2rem"};
`

const PreviewContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const PreviewCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius?.lg || "12px"};
  box-shadow: ${({ theme }) => theme.shadows?.md || "0 4px 12px rgba(0, 0, 0, 0.1)"};
  overflow: hidden;
  
  &.component-preview-card {
    border-radius: ${({ theme }) =>
      theme.uiPreferences?.cardStyle?.borderRadius === "square"
        ? "0"
        : theme.uiPreferences?.cardStyle?.borderRadius === "rounded"
          ? "16px"
          : "8px"};
    box-shadow: ${({ theme }) =>
      theme.uiPreferences?.cardStyle?.shadow === "none"
        ? "none"
        : theme.uiPreferences?.cardStyle?.shadow === "heavy"
          ? "0 15px 25px rgba(0, 0, 0, 0.15)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)"};
    transition: ${({ theme }) =>
      theme.uiPreferences?.cardStyle?.animation ? "transform 0.3s ease, box-shadow 0.3s ease" : "none"};
    
    &:hover {
      transform: ${({ theme }) => (theme.uiPreferences?.cardStyle?.animation ? "translateY(-5px)" : "none")};
      box-shadow: ${({ theme }) =>
        theme.uiPreferences?.cardStyle?.animation && theme.uiPreferences?.cardStyle?.shadow !== "none"
          ? "0 20px 30px rgba(0, 0, 0, 0.15)"
          : theme.uiPreferences?.cardStyle?.shadow === "none"
            ? "none"
            : theme.uiPreferences?.cardStyle?.shadow === "heavy"
              ? "0 15px 25px rgba(0, 0, 0, 0.15)"
              : "0 4px 12px rgba(0, 0, 0, 0.1)"};
    }
  }
`

const PreviewCardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing?.md || "1.25rem"};
  background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`

const PreviewCardContent = styled.div`
  padding: ${({ theme }) => theme.spacing?.md || "1.25rem"};
  color: ${({ theme }) => theme.colors.text};
`

const PreviewButton = styled.button`
  padding: 0.75rem 1.25rem;
  margin-right: 10px;
  border: none;
  border-radius: ${({ theme }) =>
    theme.uiPreferences?.buttonStyle?.borderRadius === "0"
      ? "0"
      : theme.uiPreferences?.buttonStyle?.borderRadius === "9999px"
        ? "9999px"
        : "8px"};
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => (theme.uiPreferences?.buttonStyle?.animation ? "all 0.3s ease" : "none")};
  box-shadow: ${({ theme }) => (theme.uiPreferences?.buttonStyle?.shadow ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none")};
  
  &:hover {
    transform: ${({ theme }) => (theme.uiPreferences?.buttonStyle?.animation ? "translateY(-2px)" : "none")};
    box-shadow: ${({ theme }) =>
      theme.uiPreferences?.buttonStyle?.shadow && theme.uiPreferences?.buttonStyle?.animation
        ? "0 6px 8px rgba(0, 0, 0, 0.15)"
        : theme.uiPreferences?.buttonStyle?.shadow
          ? "0 4px 6px rgba(0, 0, 0, 0.1)"
          : "none"};
  }
  
  ${(props) =>
    props.primary &&
    `
    background: linear-gradient(to right, ${props.theme.colors.primary}, ${props.theme.colors.secondary});
    color: white;
  `}
  
  ${(props) =>
    props.secondary &&
    `
    background: ${props.theme.colors.card};
    color: ${props.theme.colors.primary};
    border: 2px solid ${props.theme.colors.primary};
  `}
`

const ComponentSection = styled.div`
  margin-bottom: 2rem;
`

const ComponentSectionTitle = styled.h4`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  margin: 1.5rem 0 1rem;
  color: ${({ theme }) => theme.colors.text};
  
  svg {
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const OptionCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  border: 2px solid ${(props) => (props.isActive ? props.theme.colors.primary : "transparent")};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`

const OptionCardPreview = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  overflow: hidden;
  
  .square-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .rounded-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .default-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .no-shadow-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  .medium-shadow-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .heavy-shadow-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  .square-button-preview {
    padding: 0.5rem 1rem;
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    color: white;
    font-weight: 600;
    border-radius: 0;
  }
  
  .default-button-preview {
    padding: 0.5rem 1rem;
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    color: white;
    font-weight: 600;
    border-radius: 8px;
  }
  
  .pill-button-preview {
    padding: 0.5rem 1rem;
    background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    color: white;
    font-weight: 600;
    border-radius: 9999px;
  }
  
  .small-icon-preview {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .medium-icon-preview {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .large-icon-preview {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .animation-on-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      100% {
        left: 100%;
      }
    }
  }
  
  .animation-off-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .small-font-preview {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .medium-font-preview {
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .large-font-preview {
    font-size: 2.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .light-heading-preview {
    font-size: 2rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .medium-heading-preview {
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .light-body-preview {
    font-size: 1rem;
    font-weight: 300;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .regular-body-preview {
    font-size: 1rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .medium-body-preview {
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
   .Centra-preview {
    font-family: 'Centra', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  .poppins-preview {
    font-family: 'Poppins', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .roboto-preview {
    font-family: 'Roboto', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .opensans-preview {
    font-family: 'Open Sans', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .compact-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    
    .density-line {
      width: 80%;
      height: 8px;
      background: ${({ theme }) => theme.colors.card};
      border-radius: 4px;
    }
  }
  
  .comfortable-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    
    .density-line {
      width: 80%;
      height: 8px;
      background: ${({ theme }) => theme.colors.card};
      border-radius: 4px;
    }
  }
  
  .spacious-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    
    .density-line {
      width: 80%;
      height: 8px;
      background: ${({ theme }) => theme.colors.card};
      border-radius: 4px;
    }
  }
  
  .narrow-container-preview {
    width: 40px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    margin: 0 auto;
  }
  
  .standard-container-preview {
    width: 50px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    margin: 0 auto;
  }
  
  .wide-container-preview {
    width: 60px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 8px;
    margin: 0 auto;
  }
  
  .compact-sidebar-preview {
    width: 20px;
    height: 60px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 8px;
    
    .sidebar-icon {
      width: 12px;
      height: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }
  }
  
  .standard-sidebar-preview {
    width: 40px;
    height: 60px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 8px;
    
    .sidebar-item {
      width: 30px;
      height: 8px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
    }
  }
  
  .floating-sidebar-preview {
    width: 40px;
    height: 60px;
    background: ${({ theme }) => theme.colors.card};
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    .sidebar-item {
      width: 30px;
      height: 8px;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 4px;
    }
  }
`
const ButtonContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const OptionCardLabel = styled.div`
  font-size: 0.85rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`

const Profile = () => {
  const [isEditingPin, setIsEditingPin] = useState(false)
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [pinSuccess, setPinSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("personal")
  const [profileData, setProfileData] = useState({})
  const [activeThemeTab, setActiveThemeTab] = useState("presets")
  const isFmsLogin = localStorage.getItem("fmsUser")
  const {
    theme,
    currentTheme,
    changeTheme,
    baseThemes,
    customColors,
    updateCustomColors,
    uiPreferences,
    updateUIPreferences,
    isCustomTheme,
    resetCustomizations,
  } = useTheme()
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getEmployeeInfo()
        setProfileData(res?.data[0])
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }
    fetchProfile()
  }, [])

  const getExperience = (joiningDate) => {
    if (!joiningDate) return "0 years"

    const joinDate = new Date(joiningDate)
    const now = new Date()

    let years = now.getFullYear() - joinDate.getFullYear()
    const hasNotCompletedThisYear =
      now.getMonth() < joinDate.getMonth() ||
      (now.getMonth() === joinDate.getMonth() && now.getDate() < joinDate.getDate())

    if (hasNotCompletedThisYear) {
      years--
    }

    return `${years} + year${years !== 1 ? "s" : ""}`
  }

  const handleThemeChange = (themeName) => {
    changeTheme(themeName)
    toast.success(`Theme changed to ${theme[themeName]}`)
  }

  const handlePinReset = async () => {
    // Reset error and success messages
    setPinError("")
    setPinSuccess("")

    // Validate PIN inputs
    if (!currentPin || !newPin || !confirmPin) {
      setPinError("All fields are required")
      return
    }

    if (newPin !== confirmPin) {
      setPinError("New PIN and Confirm PIN do not match")
      return
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError("PIN must be a 4-digit number")
      return
    }

    const response = await setuserpinview(currentPin, newPin)
    if (response?.status === 200) {
      setPinSuccess("PIN reset successfully")
      setIsEditingPin(false)
    } else {
      setPinError("Failed to reset PIN. Please try again.")
      setIsEditingPin(true)
    }

    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
  }

  const cancelPinReset = () => {
    setIsEditingPin(false)
    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
    setPinError("")
    setPinSuccess("")
  }
    const getShiftLabel = (shiftNo) => {
    switch (shiftNo) {
      case 1:
        return "Morning Shift"
      case 2:
        return "Evening Shift"
      case 3:
        return "Night Shift"
      default:
        return "Working Day"
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <>
            <SectionTitle>Personal Information</SectionTitle>
            <DetailGrid>
              <DetailCard color="#4776E6">
                <DetailLabel iconColor="#4776E6">
                  <FaIdCard /> Employee ID
                </DetailLabel>
                <DetailValue>{profileData.emp_id || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#8E54E9">
                <DetailLabel iconColor="#8E54E9">
                  <FaUserTie /> Role
                </DetailLabel>
                <DetailValue>{profileData.grade_name || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#38A169">
                <DetailLabel iconColor="#38A169">
                  <FaBuilding /> Department
                </DetailLabel>
                <DetailValue>{profileData.department_name || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#DD6B20">
                <DetailLabel iconColor="#DD6B20">
                  <FaCalendarAlt /> Join Date
                </DetailLabel>
                <DetailValue>{profileData.date_of_join || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#3182CE">
                <DetailLabel iconColor="#3182CE">
                  <FaPhone /> Mobile
                </DetailLabel>
                <DetailValue>{profileData.mobile_number || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#805AD5">
                <DetailLabel iconColor="#805AD5">
                  <FaEnvelope /> Email
                </DetailLabel>
                <DetailValue>{profileData.email_id || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#D53F8C">
                <DetailLabel iconColor="#D53F8C">
                  <FaBirthdayCake /> Birthday
                </DetailLabel>
                <DetailValue>{profileData.dob || "Not specified"}</DetailValue>
              </DetailCard>

              <DetailCard color="#2B6CB0">
                <DetailLabel iconColor="#2B6CB0">
                  <FaExchangeAlt /> My Shift
                </DetailLabel>
                <DetailValue>{getShiftLabel(profileData.current_shift) || "Not specified"}</DetailValue>
              </DetailCard>
            </DetailGrid>
          </>
        )

      // case "permissions":
      //   return (
      //     <>
      //       <SectionTitle>Approval Permissions</SectionTitle>
      //       <DetailGrid>
      //         <StatCard bgStart="#4776E6" bgEnd="#8E54E9" style={{ position: "relative" }}>
      //           <StatIcon>
      //             <FaTrophy />
      //           </StatIcon>
      //           <StatLabel>Grade Level</StatLabel>
      //           <StatValue>{profileData.grade_level}</StatValue>
      //         </StatCard>

      //         <StatCard bgStart="#11998e" bgEnd="#38ef7d" style={{ position: "relative" }}>
      //           <StatIcon>
      //             <FaShieldAlt />
      //           </StatIcon>
      //           <StatLabel>Claim Grade Level</StatLabel>
      //           <StatValue>{profileData.approve_data?.[0]?.claim_grade_level}</StatValue>
      //         </StatCard>

      //         <StatCard bgStart="#FF416C" bgEnd="#FF4B2B" style={{ position: "relative" }}>
      //           <StatIcon>
      //             <FaCalendarAlt />
      //           </StatIcon>
      //           <StatLabel>Max Leave Days</StatLabel>
      //           <StatValue>{profileData.approve_data?.[2]?.max_days}</StatValue>
      //         </StatCard>

      //         <StatCard bgStart="#6B46C1" bgEnd="#9F7AEA" style={{ position: "relative" }}>
      //           <StatIcon>
      //             <FaIdCard />
      //           </StatIcon>
      //           <StatLabel>Max Claim Amount</StatLabel>
      //           <StatValue>₹{profileData.approve_data?.[1]?.max_claim_amt}</StatValue>
      //         </StatCard>
      //       </DetailGrid>
      //     </>
      //   )

      case "security":
        return (
          <>
            <SectionTitle>Security Settings</SectionTitle>

            <StyledCard>
              <div style={{ padding: "1.5rem" }}>
                {pinSuccess && (
                  <AlertBox className="success">
                    <FaCheck />
                    {pinSuccess}
                  </AlertBox>
                )}

                {!isEditingPin ? (
                  <div>
                    <p style={{ marginBottom: "1.5rem", color: "#4a5568" }}>
                      Your PIN is used for secure transactions and approvals. It's recommended to change your PIN
                      periodically.
                    </p>
                    <StyledButton className="primary" onClick={() => setIsEditingPin(true)}>
                      <FaLock /> Reset PIN
                    </StyledButton>
                  </div>
                ) : (
                  <PinResetSection>
                    <SectionTitle>Reset Your PIN</SectionTitle>

                    {pinError && (
                      <AlertBox className="error">
                        <FaTimes />
                        {pinError}
                      </AlertBox>
                    )}

                    <DetailLabel>
                      <FaLock /> Current PIN
                    </DetailLabel>
                    <PinInput
                      type="password"
                      maxLength={6}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="Enter current PIN"
                    />

                    <PinInputGroup>
                      <div style={{ flex: 1 }}>
                        <DetailLabel>
                          <FaLock /> New PIN
                        </DetailLabel>
                        <PinInput
                          type="password"
                          maxLength={6}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Enter new PIN"
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <DetailLabel>
                          <FaCheck /> Confirm PIN
                        </DetailLabel>
                        <PinInput
                          type="password"
                          maxLength={6}
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          placeholder="Confirm new PIN"
                        />
                      </div>
                    </PinInputGroup>

                    <ButtonGroup>
                      <StyledButton className="primary" onClick={handlePinReset}>
                        <FaCheck /> Reset PIN
                      </StyledButton>
                      <StyledButton className="outline" onClick={cancelPinReset}>
                        <FaTimes /> Cancel
                      </StyledButton>
                    </ButtonGroup>
                  </PinResetSection>
                )}
              </div>
            </StyledCard>
          </>
        )

      case "theme":
        return (
          <>
            <SectionTitle>Theme Personalization</SectionTitle>
            <p style={{ marginBottom: "1.5rem", color: "#4a5568" }}>
              Customize every aspect of your HRMS interface to match your personal preferences.
            </p>

            <TabContainer>
              <TabGroup style={{ marginBottom: "1rem" }}>
                <TabButton active={activeThemeTab === "presets"} onClick={() => setActiveThemeTab("presets")}>
                  <FaPalette /> Theme Presets
                </TabButton>
                <TabButton active={activeThemeTab === "colors"} onClick={() => setActiveThemeTab("colors")}>
                  <FaFillDrip /> Colors
                </TabButton>
                <TabButton active={activeThemeTab === "components"} onClick={() => setActiveThemeTab("components")}>
                  <FaPuzzlePiece /> Components
                </TabButton>
                <TabButton active={activeThemeTab === "typography"} onClick={() => setActiveThemeTab("typography")}>
                  <FaFont /> Typography
                </TabButton>
                <TabButton active={activeThemeTab === "layout"} onClick={() => setActiveThemeTab("layout")}>
                  <FaColumns /> Layout
                </TabButton>
              </TabGroup>

              {activeThemeTab === "presets" && (
                <>
                  <ThemeGrid>
                    <ThemeCard
                      isActive={currentTheme === "default" && !isCustomTheme}
                      onClick={() => handleThemeChange("default")}
                    >
                      <ThemePreview colors={baseThemes.default.colors} />
                      <ThemeInfo>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ThemeIcon color={baseThemes.default.colors.primary}>
                            <FaPalette />
                          </ThemeIcon>
                          <ThemeName>{baseThemes.default.name}</ThemeName>
                        </div>
                        {currentTheme === "default" && !isCustomTheme && (
                          <ThemeActiveIndicator>
                            <FaCheck />
                          </ThemeActiveIndicator>
                        )}
                      </ThemeInfo>
                    </ThemeCard>

                    <ThemeCard
                      isActive={currentTheme === "ocean" && !isCustomTheme}
                      onClick={() => handleThemeChange("ocean")}
                    >
                      <ThemePreview colors={baseThemes.ocean.colors} />
                      <ThemeInfo>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ThemeIcon color={baseThemes.ocean.colors.primary}>
                            <FaWater />
                          </ThemeIcon>
                          <ThemeName>{baseThemes.ocean.name}</ThemeName>
                        </div>
                        {currentTheme === "ocean" && !isCustomTheme && (
                          <ThemeActiveIndicator>
                            <FaCheck />
                          </ThemeActiveIndicator>
                        )}
                      </ThemeInfo>
                    </ThemeCard>

                    <ThemeCard
                      isActive={currentTheme === "sunset" && !isCustomTheme}
                      onClick={() => handleThemeChange("sunset")}
                    >
                      <ThemePreview colors={baseThemes.sunset.colors} />
                      <ThemeInfo>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ThemeIcon color={baseThemes.sunset.colors.primary}>
                            <FaSun />
                          </ThemeIcon>
                          <ThemeName>{baseThemes.sunset.name}</ThemeName>
                        </div>
                        {currentTheme === "sunset" && !isCustomTheme && (
                          <ThemeActiveIndicator>
                            <FaCheck />
                          </ThemeActiveIndicator>
                        )}
                      </ThemeInfo>
                    </ThemeCard>

                    <ThemeCard
                      isActive={currentTheme === "dark" && !isCustomTheme}
                      onClick={() => handleThemeChange("dark")}
                    >
                      <ThemePreview colors={baseThemes.dark.colors} />
                      <ThemeInfo>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ThemeIcon color={baseThemes.dark.colors.primary}>
                            <FaMoon />
                          </ThemeIcon>
                          <ThemeName>{baseThemes.dark.name}</ThemeName>
                        </div>
                        {currentTheme === "dark" && !isCustomTheme && (
                          <ThemeActiveIndicator>
                            <FaCheck />
                          </ThemeActiveIndicator>
                        )}
                      </ThemeInfo>
                    </ThemeCard>

                    {isCustomTheme && (
                      <ThemeCard isActive={isCustomTheme} onClick={() => {}}>
                        <ThemePreview colors={theme.colors} />
                        <ThemeInfo>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <ThemeIcon color={theme.colors.primary}>
                              <FaUserCog />
                            </ThemeIcon>
                            <ThemeName>Custom</ThemeName>
                          </div>
                          <ThemeActiveIndicator>
                            <FaCheck />
                          </ThemeActiveIndicator>
                        </ThemeInfo>
                      </ThemeCard>
                    )}
                  </ThemeGrid>

                  <ButtonContainer>
                    <StyledButton className="outline" onClick={resetCustomizations}>
                      <FaUndo /> Reset All Customizations
                    </StyledButton>
                    <StyledButton className="primary" onClick={() => setActiveThemeTab("colors")}>
                      <FaPaintBrush /> Customize Theme
                    </StyledButton>
                  </ButtonContainer>
                </>
              )}

              {activeThemeTab === "colors" && (
                <>
                  <SectionTitle>Color Customization</SectionTitle>
                  <DetailGrid>
                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Primary Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.primary || theme.colors.primary}
                        onChange={(e) => updateCustomColors({ primary: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.primary || theme.colors.primary}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Secondary Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.secondary || theme.colors.secondary}
                        onChange={(e) => updateCustomColors({ secondary: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.secondary || theme.colors.secondary}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Accent Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.accent || theme.colors.accent}
                        onChange={(e) => updateCustomColors({ accent: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.accent || theme.colors.accent}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Background Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.background || theme.colors.background}
                        onChange={(e) => updateCustomColors({ background: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.background || theme.colors.background}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Card Background
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.card || theme.colors.card}
                        onChange={(e) => updateCustomColors({ card: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.card || theme.colors.card}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Text Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.text || theme.colors.text}
                        onChange={(e) => updateCustomColors({ text: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.text || theme.colors.text}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Success Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.success || theme.colors.success}
                        onChange={(e) => updateCustomColors({ success: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.success || theme.colors.success}</ColorPickerValue>
                    </ColorPickerCard>

                    <ColorPickerCard>
                      <ColorPickerLabel>
                        <FaPalette /> Error Color
                      </ColorPickerLabel>
                      <ColorPickerInput
                        type="color"
                        value={customColors.error || theme.colors.error}
                        onChange={(e) => updateCustomColors({ error: e.target.value })}
                      />
                      <ColorPickerValue>{customColors.error || theme.colors.error}</ColorPickerValue>
                    </ColorPickerCard>
                  </DetailGrid>

                  <PreviewSection>
                    <SectionTitle>Preview</SectionTitle>
                    <PreviewContainer>
                      <PreviewCard>
                        <PreviewCardHeader>Sample Card</PreviewCardHeader>
                        <PreviewCardContent>
                          <p>This is how your cards will look with the selected colors.</p>
                          <PreviewButton primary>Primary Button</PreviewButton>
                          <PreviewButton secondary>Secondary Button</PreviewButton>
                        </PreviewCardContent>
                      </PreviewCard>
                    </PreviewContainer>
                  </PreviewSection>
                </>
              )}

              {activeThemeTab === "components" && (
                <>
                  <SectionTitle>Component Styles</SectionTitle>

                  <ComponentSection>
                    <ComponentSectionTitle>
                      <FaSquare /> Card Style
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.cardStyle.borderRadius === "square"}
                        onClick={() => updateUIPreferences("cardStyle", { borderRadius: "square" })}
                      >
                        <OptionCardPreview>
                          <div className="square-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Square</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.cardStyle.borderRadius === "rounded"}
                        onClick={() => updateUIPreferences("cardStyle", { borderRadius: "rounded" })}
                      >
                        <OptionCardPreview>
                          <div className="rounded-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Rounded</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.cardStyle.borderRadius === "16px"}
                        onClick={() => updateUIPreferences("cardStyle", { borderRadius: "16px" })}
                      >
                        <OptionCardPreview>
                          <div className="default-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Default</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaSortAlphaDown /> Shadow Style
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.cardStyle.shadow === "none"}
                        onClick={() => updateUIPreferences("cardStyle", { shadow: "none" })}
                      >
                        <OptionCardPreview>
                          <div className="no-shadow-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>No Shadow</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.cardStyle.shadow === "medium"}
                        onClick={() => updateUIPreferences("cardStyle", { shadow: "medium" })}
                      >
                        <OptionCardPreview>
                          <div className="medium-shadow-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Medium</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.cardStyle.shadow === "heavy"}
                        onClick={() => updateUIPreferences("cardStyle", { shadow: "heavy" })}
                      >
                        <OptionCardPreview>
                          <div className="heavy-shadow-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Heavy</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaSquareFull /> Button Style
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.buttonStyle.borderRadius === "0"}
                        onClick={() => updateUIPreferences("buttonStyle", { borderRadius: "0" })}
                      >
                        <OptionCardPreview>
                          <div className="square-button-preview">Button</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Square</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.buttonStyle.borderRadius === "8px"}
                        onClick={() => updateUIPreferences("buttonStyle", { borderRadius: "8px" })}
                      >
                        <OptionCardPreview>
                          <div className="default-button-preview">Button</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Default</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.buttonStyle.borderRadius === "9999px"}
                        onClick={() => updateUIPreferences("buttonStyle", { borderRadius: "9999px" })}
                      >
                        <OptionCardPreview>
                          <div className="pill-button-preview">Button</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Pill</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaIcons /> Icon Style
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.iconStyle.size === "small"}
                        onClick={() => updateUIPreferences("iconStyle", { size: "small" })}
                      >
                        <OptionCardPreview>
                          <FaStar className="small-icon-preview" />
                        </OptionCardPreview>
                        <OptionCardLabel>Small</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.iconStyle.size === "medium"}
                        onClick={() => updateUIPreferences("iconStyle", { size: "medium" })}
                      >
                        <OptionCardPreview>
                          <FaStar className="medium-icon-preview" />
                        </OptionCardPreview>
                        <OptionCardLabel>Medium</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.iconStyle.size === "large"}
                        onClick={() => updateUIPreferences("iconStyle", { size: "large" })}
                      >
                        <OptionCardPreview>
                          <FaStar className="large-icon-preview" />
                        </OptionCardPreview>
                        <OptionCardLabel>Large</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaToggleOn /> Animation
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.cardStyle.animation}
                        onClick={() => updateUIPreferences("cardStyle", { animation: true })}
                      >
                        <OptionCardPreview>
                          <div className="animation-on-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Enabled</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={!uiPreferences.cardStyle.animation}
                        onClick={() => updateUIPreferences("cardStyle", { animation: false })}
                      >
                        <OptionCardPreview>
                          <div className="animation-off-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Disabled</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>
                  </ComponentSection>

                  <PreviewSection>
                    <SectionTitle>Component Preview</SectionTitle>
                    <PreviewContainer>
                      <PreviewCard className="component-preview-card">
                        <PreviewCardHeader>Sample Card</PreviewCardHeader>
                        <PreviewCardContent>
                          <p>This is how your components will look with the selected styles.</p>
                          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            <PreviewButton primary>
                              {uiPreferences.buttonStyle.iconPosition === "left" && (
                                <FaCheck style={{ marginRight: "0.5rem" }} />
                              )}
                              Primary Button
                              {uiPreferences.buttonStyle.iconPosition === "right" && (
                                <FaCheck style={{ marginLeft: "0.5rem" }} />
                              )}
                            </PreviewButton>
                            <PreviewButton secondary>
                              {uiPreferences.buttonStyle.iconPosition === "left" && (
                                <FaTimes style={{ marginRight: "0.5rem" }} />
                              )}
                              Secondary Button
                              {uiPreferences.buttonStyle.iconPosition === "right" && (
                                <FaTimes style={{ marginLeft: "0.5rem" }} />
                              )}
                            </PreviewButton>
                          </div>
                        </PreviewCardContent>
                      </PreviewCard>
                    </PreviewContainer>
                  </PreviewSection>
                </>
              )}

              {activeThemeTab === "typography" && (
                <>
                  <SectionTitle>Typography Settings</SectionTitle>

                  <ComponentSection>
                    <ComponentSectionTitle>
                      <FaFont /> Font Size
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.typography.fontSize === "small"}
                        onClick={() => updateUIPreferences("typography", { fontSize: "small" })}
                      >
                        <OptionCardPreview>
                          <div className="small-font-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Small</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.fontSize === "medium"}
                        onClick={() => updateUIPreferences("typography", { fontSize: "medium" })}
                      >
                        <OptionCardPreview>
                          <div className="medium-font-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Medium</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.fontSize === "large"}
                        onClick={() => updateUIPreferences("typography", { fontSize: "large" })}
                      >
                        <OptionCardPreview>
                          <div className="large-font-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Large</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaTextHeight /> Heading Weight
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.typography.headingWeight === "400"}
                        onClick={() => updateUIPreferences("typography", { headingWeight: "400" })}
                      >
                        <OptionCardPreview>
                          <div className="light-heading-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Regular</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.headingWeight === "600"}
                        onClick={() => updateUIPreferences("typography", { headingWeight: "600" })}
                      >
                        <OptionCardPreview>
                          <div className="medium-heading-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Semi-Bold</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.headingWeight === "700"}
                        onClick={() => updateUIPreferences("typography", { headingWeight: "700" })}
                      >
                        <OptionCardPreview>
                          <div className="bold-heading-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Bold</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaTextWidth /> Body Text Weight
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.typography.bodyWeight === "300"}
                        onClick={() => updateUIPreferences("typography", { bodyWeight: "300" })}
                      >
                        <OptionCardPreview>
                          <div className="light-body-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Light</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.bodyWeight === "400"}
                        onClick={() => updateUIPreferences("typography", { bodyWeight: "400" })}
                      >
                        <OptionCardPreview>
                          <div className="regular-body-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Regular</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.bodyWeight === "500"}
                        onClick={() => updateUIPreferences("typography", { bodyWeight: "500" })}
                      >
                        <OptionCardPreview>
                          <div className="medium-body-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Medium</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaFont /> Font Family
                    </ComponentSectionTitle>
                    <OptionGrid>
                        <OptionCard
                        isActive={uiPreferences.typography.fontFamily === "'Centra', sans-serif"}
                        onClick={() => updateUIPreferences("typography", { fontFamily: "'Centra', sans-serif" })}
                      >
                        <OptionCardPreview>
                          <div className="Centra-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Centra</OptionCardLabel>
                      </OptionCard>
                      <OptionCard
                        isActive={uiPreferences.typography.fontFamily === "'poppins', sans-serif"}
                        onClick={() => updateUIPreferences("typography", { fontFamily: "'poppins', sans-serif" })}
                      >
                        <OptionCardPreview>
                          <div className="poppins-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Poppins</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.fontFamily === "'Roboto', sans-serif"}
                        onClick={() => updateUIPreferences("typography", { fontFamily: "'Roboto', sans-serif" })}
                      >
                        <OptionCardPreview>
                          <div className="roboto-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Roboto</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.typography.fontFamily === "'Open Sans', sans-serif"}
                        onClick={() => updateUIPreferences("typography", { fontFamily: "'Open Sans', sans-serif" })}
                      >
                        <OptionCardPreview>
                          <div className="opensans-preview">Aa</div>
                        </OptionCardPreview>
                        <OptionCardLabel>Open Sans</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>
                  </ComponentSection>

                  <PreviewSection>
                    <SectionTitle>Typography Preview</SectionTitle>
                    <PreviewContainer>
                      <PreviewCard className="typography-preview-card">
                        <PreviewCardHeader>Typography Sample</PreviewCardHeader>
                        <PreviewCardContent>
                          <h1 style={{ marginBottom: "0.5rem" }}>Heading 1</h1>
                          <h2 style={{ marginBottom: "0.5rem" }}>Heading 2</h2>
                          <h3 style={{ marginBottom: "0.5rem" }}>Heading 3</h3>
                          <p style={{ marginBottom: "1rem" }}>
                            This is a paragraph of text that demonstrates how body text will appear with your selected
                            typography settings. The quick brown fox jumps over the lazy dog.
                          </p>
                          <p>
                            <strong>Bold text</strong> and <em>italic text</em> examples.
                          </p>
                        </PreviewCardContent>
                      </PreviewCard>
                    </PreviewContainer>
                  </PreviewSection>
                </>
              )}

              {activeThemeTab === "layout" && (
                <>
                  <SectionTitle>Layout Settings</SectionTitle>

                  <ComponentSection>
                    <ComponentSectionTitle>
                      <FaRulerHorizontal /> Layout Density
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.layout.density === "compact"}
                        onClick={() => updateUIPreferences("layout", { density: "compact" })}
                      >
                        <OptionCardPreview>
                          <div className="compact-preview">
                            <div className="density-line"></div>
                            <div className="density-line"></div>
                            <div className="density-line"></div>
                          </div>
                        </OptionCardPreview>
                        <OptionCardLabel>Compact</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.layout.density === "comfortable"}
                        onClick={() => updateUIPreferences("layout", { density: "comfortable" })}
                      >
                        <OptionCardPreview>
                          <div className="comfortable-preview">
                            <div className="density-line"></div>
                            <div className="density-line"></div>
                            <div className="density-line"></div>
                          </div>
                        </OptionCardPreview>
                        <OptionCardLabel>Comfortable</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.layout.density === "spacious"}
                        onClick={() => updateUIPreferences("layout", { density: "spacious" })}
                      >
                        <OptionCardPreview>
                          <div className="spacious-preview">
                            <div className="density-line"></div>
                            <div className="density-line"></div>
                            <div className="density-line"></div>
                          </div>
                        </OptionCardPreview>
                        <OptionCardLabel>Spacious</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaColumns /> Container Width
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.layout.containerWidth === "narrow"}
                        onClick={() => updateUIPreferences("layout", { containerWidth: "narrow" })}
                      >
                        <OptionCardPreview>
                          <div className="narrow-container-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Narrow</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.layout.containerWidth === "standard"}
                        onClick={() => updateUIPreferences("layout", { containerWidth: "standard" })}
                      >
                        <OptionCardPreview>
                          <div className="standard-container-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Standard</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.layout.containerWidth === "wide"}
                        onClick={() => updateUIPreferences("layout", { containerWidth: "wide" })}
                      >
                        <OptionCardPreview>
                          <div className="wide-container-preview"></div>
                        </OptionCardPreview>
                        <OptionCardLabel>Wide</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>

                    <ComponentSectionTitle>
                      <FaBars /> Sidebar Style
                    </ComponentSectionTitle>
                    <OptionGrid>
                      <OptionCard
                        isActive={uiPreferences.layout.sidebarStyle === "compact"}
                        onClick={() => updateUIPreferences("layout", { sidebarStyle: "compact" })}
                      >
                        <OptionCardPreview>
                          <div className="compact-sidebar-preview">
                            <div className="sidebar-icon"></div>
                            <div className="sidebar-icon"></div>
                            <div className="sidebar-icon"></div>
                          </div>
                        </OptionCardPreview>
                        <OptionCardLabel>Compact</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.layout.sidebarStyle === "standard"}
                        onClick={() => updateUIPreferences("layout", { sidebarStyle: "standard" })}
                      >
                        <OptionCardPreview>
                          <div className="standard-sidebar-preview">
                            <div className="sidebar-item"></div>
                            <div className="sidebar-item"></div>
                            <div className="sidebar-item"></div>
                          </div>
                        </OptionCardPreview>
                        <OptionCardLabel>Standard</OptionCardLabel>
                      </OptionCard>

                      <OptionCard
                        isActive={uiPreferences.layout.sidebarStyle === "floating"}
                        onClick={() => updateUIPreferences("layout", { sidebarStyle: "floating" })}
                      >
                        <OptionCardPreview>
                          <div className="floating-sidebar-preview">
                            <div className="sidebar-item"></div>
                            <div className="sidebar-item"></div>
                            <div className="sidebar-item"></div>
                          </div>
                        </OptionCardPreview>
                        <OptionCardLabel>Floating</OptionCardLabel>
                      </OptionCard>
                    </OptionGrid>
                  </ComponentSection>
                </>
              )}
            </TabContainer>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Layout>
      <PageHeader>
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </PageHeader>

      <ProfileContainer>
        <ProfileSidebar>
          <StyledCard>
            <ProfileImage>
              <img src={profileData.image || "/placeholder.svg"} alt={profileData.name} />
            </ProfileImage>

            <ProfileInfo>
              <ProfileName>{profileData.name}</ProfileName>
              <ProfileRole>{profileData.grade_name}</ProfileRole>

              <BadgesContainer>
                <StyledBadge variant="primary">{profileData.is_manager ? "Manager" : "Employee"}</StyledBadge>
                <StyledBadge variant="secondary"> {getExperience(profileData.date_of_join)}</StyledBadge>
              </BadgesContainer>

              <div>
                <ProfileDetail>
                  <FaIdCard />
                  <span>Employee ID: {profileData.emp_id}</span>
                </ProfileDetail>
                <ProfileDetail>
                  <FaBuilding />
                  <span>{profileData.department_name || "Not specified"}</span>
                </ProfileDetail>
                <ProfileDetail>
                  <FaPhone />
                  <span>{profileData.mobile_number || "Not specified"}</span>
                </ProfileDetail>
                <ProfileDetail>
                  <FaEnvelope />
                  <span>{profileData.email_id || "Not specified"}</span>
                </ProfileDetail>
                <ProfileDetail>
                  <FaCalendarAlt />
                  <span>Joined: {profileData.date_of_join || "Not specified"}</span>
                </ProfileDetail>
                <ProfileDetail>
                  <FaExchangeAlt/>
                  <span>{getShiftLabel(profileData.current_shift) || "Not specified"}</span>
                </ProfileDetail>
              </div>
            </ProfileInfo>
          </StyledCard>

          {!isFmsLogin && 
          <StyledCard>
            <div style={{ padding: "1.5rem" }}>
              <SectionTitle>Quick Stats</SectionTitle>
              <div style={{ display: "grid", gap: "1rem" }}>
                <StatCard bgStart="#4C51BF" bgEnd="#6B46C1" style={{ position: "relative", minHeight: "120px" }}>
                  <StatIcon>
                    <FaCalendarAlt />
                  </StatIcon>
                  <StatLabel>Leave Balance</StatLabel>
                  <StatValue>{profileData.max_no_leave} Days</StatValue>
                </StatCard>
              </div>
            </div>
          </StyledCard>}
        </ProfileSidebar>

        <ProfileContent>
          <StyledCard>
            <TabContainer>
              <TabGroup>
                <TabButton active={activeTab === "personal"} onClick={() => setActiveTab("personal")}>
                  <FaIdCard /> Personal Info
                </TabButton>
                {/* <TabButton active={activeTab === "permissions"} onClick={() => setActiveTab("permissions")}>
                  <FaShieldAlt /> Permissions
                </TabButton> */}
                <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")}>
                  <FaLock /> Security
                </TabButton>
                <TabButton active={activeTab === "theme"} onClick={() => setActiveTab("theme")}>
                  <FaPalette /> Themes
                </TabButton>
              </TabGroup>

              {renderTabContent()}
            </TabContainer>
          </StyledCard>
        </ProfileContent>
      </ProfileContainer>
    </Layout>
  )
}

export default Profile