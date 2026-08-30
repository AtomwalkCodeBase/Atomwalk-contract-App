import styled from "styled-components"
import { FaArrowUp, FaArrowDown } from "react-icons/fa"

// resolves either a theme color key ("primary") or a raw custom hex/rgb ("#ff6b00")
const resolveColor = (props, key, fallback) => {
  const c = props[key]
  if (!c) return fallback
  return props.theme.colors[c] || c
}

const StatsCardContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: ${(props) => (props.hasSections ? "1.25rem 1.5rem 1.5rem" : "1.4rem 1.5rem 1.6rem")};
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 4px;
    background: ${(props) => resolveColor(props, "color", props.theme.colors.primary)};
  }

  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }
  `}
`

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  ${(props) => props.clickable && `cursor: pointer;`}
`

const IconBadge = styled.div`
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(props) => `${resolveColor(props, "color", props.theme.colors.primary)}1A`};
  color: ${(props) => resolveColor(props, "color", props.theme.colors.primary)};

  ${(props) =>
    props.large
      ? `
    width: 52px;
    height: 52px;
    font-size: 1.4rem;
    align-self: center;
  `
      : `
    width: 42px;
    height: 42px;
    font-size: 1.15rem;
    align-self: flex-start;
  `}
`

const MainStats = styled.div`
  flex: 1;
  min-width: 0;
`

const MainLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MainValue = styled.div`
  font-size: clamp(1.15rem, 1.6vw + 0.6rem, 1.6rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
  word-break: break-word;
`

const StatsChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.4rem;
  color: ${(props) =>
    props.type === "increase" ? props.theme.colors.success : props.theme.colors.error};
`

const SectionContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
  margin-top: 1.1rem;
  padding-top: 0.9rem;

  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    transition: opacity 0.2s ease;
    &:hover { opacity: 0.75; }
  `}
`

const SectionTitle = styled.h4`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const StatsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1 1 auto;
  min-width: 110px;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  background: ${(props) =>
    props.color ? `${resolveColor(props, "color", "")}14` : props.theme.colors.background};
  transition: background-color 0.2s ease;

  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
    &:hover { filter: brightness(0.97); }
  `}
`

const StatItemLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
`

const StatItemValue = styled.span`
  font-size: clamp(0.85rem, 0.8vw + 0.55rem, 1rem);
  font-weight: 700;
  word-break: break-word;
  color: ${(props) =>
    props.status ? resolveColor(props, "status", props.theme.colors.black) : props.theme.colors.black};
`

const MessageBox = styled.div`
  margin-top: 1rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.4;
  color: ${(props) => resolveColor(props, "color", props.theme.colors.textLight)};
  background: ${(props) => `${resolveColor(props, "color", props.theme.colors.textLight)}14`};
  border-left: 3px solid ${(props) => resolveColor(props, "color", props.theme.colors.textLight)};
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
  onItemClick,
  messageText,
  messageColor,
}) => {
  const handleHeaderClick = (e) => {
    if (onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  const handleSectionClick = (e, sectionIndex, section) => {
    if (onSectionClick) {
      e.stopPropagation()
      onSectionClick(sectionIndex, section)
    }
  }

  const handleItemClick = (e, item) => {
    if (onItemClick) {
      e.stopPropagation()
      onItemClick(item)
    }
  }

  return (
    <StatsCardContainer clickable={!!onClick} color={color}>
      <CardHeader clickable={!!onClick} onClick={handleHeaderClick}>
        <MainStats>
          <MainLabel>{label}</MainLabel>
          <MainValue>{value}</MainValue>
          {change && (
            <StatsChange type={changeType}>
              {changeType === "increase" ? <FaArrowUp size={11} /> : <FaArrowDown size={11} />}
              {change}
            </StatsChange>
          )}
        </MainStats>
        <IconBadge color={color} large={sections.length === 0}>{icon}</IconBadge>
      </CardHeader>

      {sections.map((section, sectionIndex) => (
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
                onClick={(e) => handleItemClick(e, item)}
                color={item.color}
              >
                <StatItemLabel>{item.label}</StatItemLabel>
                <StatItemValue status={item.status}>{item.value}</StatItemValue>
              </StatItem>
            ))}
          </StatsGrid>
        </SectionContainer>
      ))}

      {messageText && <MessageBox color={messageColor}>{messageText}</MessageBox>}
    </StatsCardContainer>
  )
}

export default StatsCard