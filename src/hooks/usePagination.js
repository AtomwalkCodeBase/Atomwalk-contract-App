import { useEffect, useMemo, useState } from "react";

export const usePagination = (data = [], initialPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [data, itemsPerPage, currentPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page, perPage = itemsPerPage) => {
    if (perPage !== itemsPerPage) {
      setItemsPerPage(perPage);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    itemsPerPage,
    paginatedData,
    totalItems: data.length,
    handlePageChange,
    setCurrentPage,      // optional control
    setItemsPerPage,     // optional control
  };
};