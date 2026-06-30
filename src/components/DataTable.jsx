import React from "react"
import styled from "styled-components"

const TableWrap = styled.div`
  overflow-x: auto;
  background: ${({ theme, color }) => color ? `${theme.colors[color]}` : theme.colors.background};
  border-radius: 8px;
  padding: 0.4rem;
  min-height: 140px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
  color: ${({ theme }) => theme.colors.text};
`

const Th = styled.th`
  text-align: left;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`

const EmptyMessage = styled.td`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
`

const LoadingMessage = styled.td`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
`

const ExpandableRow = styled.tr`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  
  td {
    padding: 0;
  }
`

const ExpandableContent = styled.div`
  padding: 1rem;
`

const StyledRow = styled.tr`
  cursor: ${({ rowAction }) => rowAction ? 'pointer' : 'default'};
  
  td {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
`

function DataTable({ 
  columns, 
  data, 
  renderRow, 
  expandedRow, 
  renderExpandedRow, 
  emptyMessage = "No data available",  
  isLoading = false, 
  rowAction = null, 
  modifiedId = false,
  modifiedIdName = "id",
}) {
  const safeData = Array.isArray(data) ? data : [];
  const hasData = safeData.length > 0;
  const columnsCount = Array.isArray(columns) && columns.length > 0 ? columns.length : 1;
    const getRowId = (row) => {
    if (modifiedId && modifiedIdName) {
      return row[modifiedIdName];
    }
    return row?.id || row?.p_id || row?.emp_id || row?.unique_id;
  };

  return (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            {columns?.map((col, index) => (
              <Th key={index}>{col}</Th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <EmptyMessage colSpan={columnsCount}>
                Loading...
              </EmptyMessage>
            </tr>
          ) : hasData ? (
            safeData.map((row, index) =>  {
              const rowId = getRowId(row);
              const isExpanded = expandedRow === rowId;
              
              return (
              <React.Fragment key={rowId || index}>
                <StyledRow onClick={() => rowAction?.(row)} rowAction={rowAction}>
                  {renderRow(row)}
                </StyledRow>

                {isExpanded && renderExpandedRow && (
                  <ExpandableRow>
                    <td colSpan={columnsCount}>
                      <ExpandableContent>
                        {renderExpandedRow(row)}
                      </ExpandableContent>
                    </td>
                  </ExpandableRow>
                )}
              </React.Fragment>
              );
            })
          ) : (
            <tr>
              <EmptyMessage colSpan={columnsCount}>
                {emptyMessage}
              </EmptyMessage>
            </tr>
          )}
        </tbody>
      </Table>
    </TableWrap>
  )
}

export { Td }
export default DataTable