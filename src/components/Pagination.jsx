import { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components following your exact pattern
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const PaginationInfo = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    text-align: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const PaginationButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.card};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${({ theme, active }) => 
      active ? theme.colors.primary : theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    min-width: 36px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

// Additional styled components following the same pattern
const PaginationEllipsis = styled.span`
  padding: ${({ theme }) => `0 ${theme.spacing.xs}`};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const PaginationExtras = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ theme }) => theme.spacing.lg};
  padding-left: ${({ theme }) => theme.spacing.lg};
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: ${({ theme }) => theme.spacing.md};
    padding-left: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    width: 100%;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const PageSizeSelect = styled.select`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const GoToPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const GoToPageInput = styled.input`
  width: 60px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &::-webkit-inner-spin-button, 
  &::-webkit-outer-spin-button {
    opacity: 0.5;
  }
`;

const GoToPageButton = styled(PaginationButton)`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme }) => theme.colors.secondary};
  border-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  min-width: auto;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PageStats = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  white-space: nowrap;
`;

// Main Pagination Component
const PaginationComponent = ({ 
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  siblingCount = 1,
  showFirstLast = false,
  showPageSize = false,
  showGoToPage = false
}) => {
  const [pageInput, setPageInput] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isMobile = windowWidth <= 576;
  const isTablet = windowWidth <= 768;

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageCount = totalPages;
    
    const actualSiblingCount = isMobile ? 0 : (isTablet ? 1 : siblingCount);
    
    const leftSiblingIndex = Math.max(currentPage - actualSiblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + actualSiblingCount, totalPageCount);
    
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    if (!shouldShowLeftDots && !shouldShowRightDots) {
      for (let i = 1; i <= totalPageCount; i++) {
        pageNumbers.push(i);
      }
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      for (let i = 1; i <= (isMobile ? 2 : 3); i++) pageNumbers.push(i);
      pageNumbers.push('...');
      for (let i = totalPageCount - (isMobile ? 1 : 2); i <= totalPageCount; i++) pageNumbers.push(i);
    } else if (!shouldShowLeftDots && shouldShowRightDots) {
      for (let i = 1; i <= (isMobile ? 2 : 3); i++) pageNumbers.push(i);
      pageNumbers.push('...');
      for (let i = totalPageCount - (isMobile ? 1 : 2); i <= totalPageCount; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pageNumbers.push(i);
      pageNumbers.push('...');
      pageNumbers.push(totalPageCount);
    }

    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    setPageInput('');
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Pagination>
      <PaginationInfo>
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} audits
      </PaginationInfo>
      
      <PaginationButtons>
        {/* First Page Button */}
        {showFirstLast && !isMobile && (
          <PaginationButton 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            «
          </PaginationButton>
        )}

        {/* Previous Button */}
        <PaginationButton 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </PaginationButton>

        {/* Page Numbers with Ellipsis */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <PaginationEllipsis key={`ellipsis-${index}`}>...</PaginationEllipsis>
          ) : (
            <PaginationButton
              key={page}
              active={currentPage === page}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PaginationButton>
          )
        ))}

        {/* Next Button */}
        <PaginationButton 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </PaginationButton>

        {/* Last Page Button */}
        {showFirstLast && !isMobile && (
          <PaginationButton 
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </PaginationButton>
        )}
      </PaginationButtons>

      {/* Extras Section */}
      {(showPageSize || showGoToPage) && (
        <PaginationExtras>
          {/* Page Size Selector */}
          {showPageSize && (
            <PageSizeSelect 
              value={itemsPerPage}
              onChange={(e) => onPageChange(1, parseInt(e.target.value))}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </PageSizeSelect>
          )}

          {/* Go to Page Input */}
          {showGoToPage && (
            <GoToPageContainer>
              <GoToPageInput
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Page"
                onKeyPress={(e) => e.key === 'Enter' && handleGoToPage(e)}
              />
              <GoToPageButton 
                onClick={handleGoToPage}
                disabled={!pageInput}
              >
                Go
              </GoToPageButton>
            </GoToPageContainer>
          )}

          {/* Page Stats */}
          <PageStats>
            {currentPage}/{totalPages}
          </PageStats>
        </PaginationExtras>
      )}
    </Pagination>
  );
};

export default PaginationComponent;