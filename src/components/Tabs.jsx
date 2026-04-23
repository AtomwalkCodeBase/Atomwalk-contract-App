import React from 'react'
import styled from 'styled-components'

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1.5rem;
  overflow-x: auto;
`

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? props.theme.colors.primary : "transparent")};
  color: ${(props) => (props.active ? props.theme.colors.primary : props.theme.colors.text)};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const Tabs = ({tabs, activeTab, setActiveTab}) => {
  return (
        <TabContainer>
          {tabs.map(t => (
            <Tab key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </Tab>
          ))}
        </TabContainer>
  )
}

export default Tabs