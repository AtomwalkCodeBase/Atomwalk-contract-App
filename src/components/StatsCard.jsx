import styled from "styled-components"
import { FaArrowUp, FaArrowDown } from "react-icons/fa"

const StatsCardContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }
  `}
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  
  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
  `}
`

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  
  ${(props) =>
    props.color === "primary" &&
    `
    background: ${props.theme.colors.primaryLight};
    color: ${props.theme.colors.primary};
  `}
  
  ${(props) =>
    props.color === "secondary" &&
    `
    background: ${props.theme.colors.secondaryLight};
    color: ${props.theme.colors.secondary};
  `}
  
  ${(props) =>
    props.color === "accent" &&
    `
    background: ${props.theme.colors.accentLight};
    color: ${props.theme.colors.accent};
  `}
  
  ${(props) =>
    props.color === "success" &&
    `
    background: ${props.theme.colors.success}22;
    color: ${props.theme.colors.success};
  `}
  
  ${(props) =>
    props.color === "warning" &&
    `
    background: ${props.theme.colors.warning}22;
    color: ${props.theme.colors.warning};
  `}
  
  ${(props) =>
    props.color === "error" &&
    `
    background: ${props.theme.colors.error}22;
    color: ${props.theme.colors.error};
  `}
`

const MainStats = styled.div`
  flex: 1;
`

const MainValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const MainLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.5rem;
`

const StatsChange = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  
  ${(props) =>
    props.type === "increase" &&
    `
    color: ${props.theme.colors.success};
  `}
  
  ${(props) =>
    props.type === "decrease" &&
    `
    color: ${props.theme.colors.error};
  `}
  
  svg {
    margin-right: 0.25rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  background: ${({ theme, color }) => color ? `${theme.colors[color]}` : theme.colors.background};

  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;

    &:hover {
      background: ${ props.color ? props.theme.colors[props.color]: props.theme.colors.backgroundDark || "#f0f0f0"};
    }
  `}
`;


const StatItemLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.black};
`

const StatItemValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.black};
  
  ${(props) =>
    props.status === "success" &&
    `
    color: ${props.theme.colors.success};
  `}
  
  ${(props) =>
    props.status === "warning" &&
    `
    color: ${props.theme.colors.warning};
  `}
  
  ${(props) =>
    props.status === "error" &&
    `
    color: ${props.theme.colors.error};
  `}

  ${(props) =>
    props.status === "info" &&
    `
    color: ${props.theme.colors.info};
  `}
`

const SectionContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 1.5rem;
  
  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 0.8;
    }
  `}
`

const SectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const StatsCard = ({ 
  icon, 
  label, 
  value, 
  change, 
  changeType = "increase", 
  color = "primary",
  sections = [],
  onClick,
  onSectionClick,
  onItemClick 
}) => {
  const handleHeaderClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  }

  const handleSectionClick = (e, sectionIndex, section) => {
    if (onSectionClick) {
      e.stopPropagation();
      onSectionClick(sectionIndex, section);
    }
  }

  const handleItemClick = (e, sectionIndex, itemIndex, item, section) => {
    if (onItemClick) {
      e.stopPropagation();
      onItemClick(item);
    }
  }

  return (
    <StatsCardContainer clickable={!!onClick}>
      <CardHeader clickable={!!onClick} onClick={handleHeaderClick}>
        <IconContainer color={color}>{icon}</IconContainer>
        <MainStats>
          <MainLabel>{label}</MainLabel>
          <MainValue>{value}</MainValue>
          {change && (
            <StatsChange type={changeType}>
              {changeType === "increase" ? <FaArrowUp /> : <FaArrowDown />}
              {change}
            </StatsChange>
          )}
        </MainStats>
      </CardHeader>

     {sections.length !== 0 && (sections.map((section, sectionIndex) => (
        <SectionContainer 
          key={sectionIndex}
          clickable={!!onSectionClick}
          onClick={(e) => handleSectionClick(e, sectionIndex, section)}
        >
          {section.title && <SectionTitle>{section.title}</SectionTitle>}
          <StatsGrid>
            {section.items.map((item, itemIndex) => (
              <StatItem 
                key={itemIndex}
                clickable={!!onItemClick}
                onClick={(e) => handleItemClick(e, sectionIndex, itemIndex, item, section)}
                color={item.status}
              >
                <StatItemLabel>{item.label}</StatItemLabel>
                <StatItemValue>
                  {item.value}
                </StatItemValue>
              </StatItem>
            ))}
          </StatsGrid>
        </SectionContainer>
      )))}
    </StatsCardContainer>
  )
}

export default StatsCard