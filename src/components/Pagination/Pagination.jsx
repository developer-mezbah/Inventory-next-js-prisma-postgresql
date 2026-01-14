"use client";
import { useEffect, useState } from "react";
import "./style.css";

const Pagination = ({ itemsPerPage, data, onPageChange }) => {
  // Set the number of items per page in "itemsPerPage"

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage); // Calculate total pages

  // Calculate the index of the first and last items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // const totalPages = Math.round(data.length / 6)

  // set data for Main Page
  useEffect(() => {
    // Slice the data array based on the current page
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    onPageChange(currentItems);

    // Go to the top when click pagination
    function topFunction() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    topFunction();
  }, [data, indexOfFirstItem, indexOfLastItem, onPageChange]);

  const handlePageChange = (page) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers.map((number) => {
      if (
        number === 1 ||
        number === totalPages ||
        (number >= currentPage - 1 && number <= currentPage + 1)
      ) {
        return (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={number === currentPage ? "active" : ""}
          >
            {number}
          </button>
        );
      } else if (number === currentPage - 2 || number === currentPage + 2) {
        return <span key={number}>...</span>;
      }
      return null;
    });
  };

  return (
    <div className="pagination">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;