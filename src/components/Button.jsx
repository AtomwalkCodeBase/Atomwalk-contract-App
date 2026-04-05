import styled, { css } from "styled-components"
import { useTheme } from "../context/ThemeContext"

const ButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => {
    const { uiPreferences, size } = props
    const layoutDensity = uiPreferences?.layout?.density || "comfortable"

    // Base size from prop
    let baseSize
    if (size === "sm") baseSize = "small"
    else if (size === "lg") baseSize = "large"
    else baseSize = "medium"

    // Adjust based on layout density
    if (layoutDensity === "compact") {
      if (baseSize === "small") return "0.4rem 0.8rem"
      if (baseSize === "large") return "0.6rem 1.2rem"
      return "0.5rem 1rem" // medium
    } else if (layoutDensity === "spacious") {
      if (baseSize === "small") return "0.6rem 1.2rem"
      if (baseSize === "large") return "0.9rem 1.8rem"
      return "0.75rem 1.5rem" // medium
    } else {
      // comfortable (default)
      if (baseSize === "small") return "0.5rem 1rem"
      if (baseSize === "large") return "0.75rem 1.5rem"
      return "0.625rem 1.25rem" // medium
    }
  }};
  
  font-size: ${(props) => {
    const { uiPreferences, size } = props
    const fontSize = uiPreferences?.typography?.fontSize || "medium"

    // Base size from prop
    let baseSize
    if (size === "sm") baseSize = 0.875
    else if (size === "lg") baseSize = 1.125
    else baseSize = 1

    // Adjust based on typography preference
    if (fontSize === "small") return `${baseSize * 0.9}rem`
    if (fontSize === "large") return `${baseSize * 1.1}rem`
    return `${baseSize}rem` // medium (default)
  }};
  
  font-weight: ${(props) => {
    const { uiPreferences } = props
    const bodyWeight = uiPreferences?.typography?.bodyWeight || "regular"
    if (bodyWeight === "light") return "400" // Still use 400 as minimum for buttons
    if (bodyWeight === "medium") return "500"
    return "500" // default for buttons
  }};
  
  font-family: ${(props) => {
    const { uiPreferences } = props
    const fontFamily = uiPreferences?.typography?.fontFamily || "Poppins"
    return `${fontFamily}, sans-serif`
  }};
  
  border-radius: ${(props) => {
    const { uiPreferences } = props
    const buttonStyle = uiPreferences?.components?.buttonStyle || "default"
    if (buttonStyle === "square") return "0"
    if (buttonStyle === "pill") return "9999px"
    return "4px" // default
  }};
  
  cursor: pointer;
  transition: ${(props) => `
    all ${props.theme.transitions.fast}
  `};
  border: none;
  outline: none;
  
  ${(props) =>
    props.fullWidth &&
    `
    width: 100%;
  `}
  
  ${(props) =>
    props.variant === "primary" &&
    `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primary}dd;
    }
    
    &:active {
      background: ${props.theme.colors.primary}ee;
    }
  `}
  
  ${(props) =>
    props.variant === "secondary" &&
    `
    background: ${props.theme.colors.secondary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.secondary}dd;
    }
    
    &:active {
      background: ${props.theme.colors.secondary}ee;
    }
  `}
  
  ${(props) =>
    props.variant === "outline" &&
    `
    background: transparent;
    color: ${props.theme.colors.primary};
    border: 1px solid ${props.theme.colors.primary};
    
    &:hover {
      background: ${props.theme.colors.primaryLight};
    }
    
    &:active {
      background: ${props.theme.colors.primaryLight}aa;
    }
  `}
   ${(props) =>
     props.variant === "outlines" &&
     `
    background: transparent;
    color: ${props.theme.colors.error};
    border: 1px solid ${props.theme.colors.primary};
    
    &:hover {
      background: ${props.theme.colors.primaryLight};
    }
    
    &:active {
      background: ${props.theme.colors.primaryLight}aa;
    }
  `}
  
  ${(props) =>
    props.variant === "ghost" &&
    `
    background: transparent;
    color: ${props.theme.colors.primary};
    
    &:hover {
      background: ${props.theme.colors.primaryLight};
    }
    
    &:active {
      background: ${props.theme.colors.primaryLight}aa;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: ${(props) => (props.iconOnly ? "0" : "0.5rem")};
    font-size: ${(props) => {
      const { uiPreferences } = props
      const iconSize = uiPreferences?.components?.iconSize || "medium"
      if (iconSize === "small") return "0.9em"
      if (iconSize === "large") return "1.3em"
      return "1.1em" // medium (default)
    }};
  }
  
  ${(props) => {
    const { uiPreferences } = props
    const animations = uiPreferences?.components?.animations !== false
    if (!animations) {
      return `
        transition: none;
        &:hover, &:active {
          transform: none;
        }
      `
    }
    return ""
  }}
`

const StyledButton = styled.button`
  ${ButtonStyles}
`

const StyledLink = styled.a`
  ${ButtonStyles}
  text-decoration: none;
`

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  as = "button",
  ...props
}) => {
  const { theme, uiPreferences } = useTheme();

  const buttonProps = {
    variant,
    size,
    fullWidth,
    iconOnly,
    theme,
    uiPreferences,
    ...props,
  }

  if (as === "a") {
    return <StyledLink {...buttonProps}>{children}</StyledLink>
  }

  return <StyledButton {...buttonProps}>{children}</StyledButton>
}

export default Button
