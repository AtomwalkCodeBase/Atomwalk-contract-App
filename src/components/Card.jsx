"use client"

import styled from "styled-components"
import { useTheme } from "../context/ThemeContext"

const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme, uiPreferences }) => {
    const cardStyle = uiPreferences?.components?.cardStyle || "default"
    if (cardStyle === "square") return "0"
    if (cardStyle === "rounded") return "16px"
    return "8px" // default
  }};
  box-shadow: ${({ theme, uiPreferences }) => {
    const shadowIntensity = uiPreferences?.components?.shadowIntensity || "medium"
    if (shadowIntensity === "none") return "none"
    if (shadowIntensity === "heavy") return "0 8px 16px rgba(0, 0, 0, 0.2)"
    return "0 4px 6px rgba(0, 0, 0, 0.1)" // medium (default)
  }};
  padding: ${({ theme, uiPreferences }) => {
    const layoutDensity = uiPreferences?.layout?.density || "comfortable"
    if (layoutDensity === "compact") return "1rem"
    if (layoutDensity === "spacious") return "2rem"
    return "1.5rem" // comfortable (default)
  }};
  margin-bottom: ${({ theme, uiPreferences }) => {
    const layoutDensity = uiPreferences?.layout?.density || "comfortable"
    if (layoutDensity === "compact") return "1rem"
    if (layoutDensity === "spacious") return "2rem"
    return "1.5rem" // comfortable (default)
  }};
  transition: ${({ theme }) => `
    transform ${theme.transitions.fast}, 
    box-shadow ${theme.transitions.fast}, 
    background-color ${theme.transitions.fast}
  `};
  border: ${({ theme, uiPreferences }) => {
    const borderStyle = uiPreferences?.components?.borderStyle || "none"
    if (borderStyle === "thin") return `1px solid ${theme.colors.border}`
    if (borderStyle === "thick") return `2px solid ${theme.colors.border}`
    return "none" // default
  }};
  
  ${({ hoverable, theme, uiPreferences }) => {
    const animations = uiPreferences?.components?.animations !== false
    if (hoverable && animations) {
      return `
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
      `
    }
    return ""
  }}
  
  ${({ variant, theme }) => {
    if (variant === "primary") {
      return `border-top: 4px solid ${theme.colors.primary};`
    }
    if (variant === "secondary") {
      return `border-top: 4px solid ${theme.colors.secondary};`
    }
    if (variant === "accent") {
      return `border-top: 4px solid ${theme.colors.accent};`
    }
    return ""
  }}
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme, uiPreferences }) => {
    const layoutDensity = uiPreferences?.layout?.density || "comfortable"
    if (layoutDensity === "compact") return "0.75rem"
    if (layoutDensity === "spacious") return "1.5rem"
    return "1rem" // comfortable (default)
  }};
  
  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme, uiPreferences }) => {
      const fontSize = uiPreferences?.typography?.fontSize || "medium"
      if (fontSize === "small") return "1.1rem"
      if (fontSize === "large") return "1.4rem"
      return "1.2rem" // medium (default)
    }};
    font-weight: ${({ theme, uiPreferences }) => {
      const headingWeight = uiPreferences?.typography?.headingWeight || "semiBold"
      if (headingWeight === "regular") return "400"
      if (headingWeight === "bold") return "700"
      return "600" // semiBold (default)
    }};
    font-family: ${({ theme, uiPreferences }) => {
      const fontFamily = uiPreferences?.typography?.fontFamily || "Poppins"
      return fontFamily
    }}, sans-serif;
  }
`

const CardBody = styled.div`
  font-size: ${({ theme, uiPreferences }) => {
    const fontSize = uiPreferences?.typography?.fontSize || "medium"
    if (fontSize === "small") return "0.9rem"
    if (fontSize === "large") return "1.1rem"
    return "1rem" // medium (default)
  }};
  font-weight: ${({ theme, uiPreferences }) => {
    const bodyWeight = uiPreferences?.typography?.bodyWeight || "regular"
    if (bodyWeight === "light") return "300"
    if (bodyWeight === "medium") return "500"
    return "400" // regular (default)
  }};
  font-family: ${({ theme, uiPreferences }) => {
    const fontFamily = uiPreferences?.typography?.fontFamily || "Poppins"
    return fontFamily
  }}, sans-serif;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const CardFooter = styled.div`
  margin-top: ${({ theme, uiPreferences }) => {
    const layoutDensity = uiPreferences?.layout?.density || "comfortable"
    if (layoutDensity === "compact") return "0.75rem"
    if (layoutDensity === "spacious") return "1.5rem"
    return "1rem" // comfortable (default)
  }};
  padding-top: ${({ theme, uiPreferences }) => {
    const layoutDensity = uiPreferences?.layout?.density || "comfortable"
    if (layoutDensity === "compact") return "0.75rem"
    if (layoutDensity === "spacious") return "1.5rem"
    return "1rem" // comfortable (default)
  }};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme, uiPreferences }) => {
    const fontSize = uiPreferences?.typography?.fontSize || "medium"
    if (fontSize === "small") return "0.85rem"
    if (fontSize === "large") return "1.05rem"
    return "0.95rem" // medium (default)
  }};
`

const Card = ({ title, children, footer, variant, hoverable = true, headerAction, ...props }) => {
  const { theme, uiPreferences } = useTheme()

  return (
    <CardContainer variant={variant} hoverable={hoverable} theme={theme} uiPreferences={uiPreferences} {...props}>
      {(title || headerAction) && (
        <CardHeader theme={theme} uiPreferences={uiPreferences}>
          {title && <h3>{title}</h3>}
          {headerAction}
        </CardHeader>
      )}
      <CardBody theme={theme} uiPreferences={uiPreferences}>
        {children}
      </CardBody>
      {footer && (
        <CardFooter theme={theme} uiPreferences={uiPreferences}>
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  )
}

export default Card
