import styled from "styled-components"

const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  
  ${(props) =>
    props.variant === "primary" &&
    `
    background: ${props.theme.colors.primaryLight};
    color: ${props.theme.colors.primary};
  `}
  
  ${(props) =>
    props.variant === "secondary" &&
    `
    background: ${props.theme.colors.secondaryLight};
    color: ${props.theme.colors.secondary};
  `}
  
  ${(props) =>
    props.variant === "success" &&
    `
    background: ${props.theme.colors.success}22;
    color: ${props.theme.colors.success};
  `}
  
  ${(props) =>
    props.variant === "warning" &&
    `
    background: ${props.theme.colors.warning}22;
    color: ${props.theme.colors.warning};
  `}
  
  ${(props) =>
    props.variant === "error" &&
    `
    background: ${props.theme.colors.error}22;
    color: ${props.theme.colors.error};
  `}
  
  ${(props) =>
    props.variant === "info" &&
    `
    background: ${props.theme.colors.info}22;
    color: ${props.theme.colors.info};
  `}

  ${(props) =>
  props.variant === "forward" &&
  `
  background: #f3e8fd;
  color: #8e44ad;
`}

${(props) =>
  props.variant === "back" &&
  `
  background: #fef5e7 ; 
  color: #f39c12;
`}

${(props) =>
  props.variant === "settle" &&
  `
  background: #eaf2f8;
  color: #2980b9;
`}

${(props) =>
  props.variant === "notPlanned" &&
  `
  background: #66666622;
  color: #666666;
`}
`

const Badge = ({ children, variant = "primary", ...props }) => {
  return (
    <BadgeContainer variant={variant} {...props}>
      {children}
    </BadgeContainer>
  )
}

export default Badge

