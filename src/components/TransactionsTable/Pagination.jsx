import { useRouter, useSearchParams } from "next/navigation";


// Pagination Component (unchanged)
const Pagination = ({ currentPage, totalPages, onPageChange, size = "medium" }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getPageNumbers = () => {
        const pages = [];
        pages.push(1);

        if (currentPage > 3) pages.push("ellipsis-start");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("ellipsis-end");
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    const handlePageClick = (page) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") return;
        onPageChange(page);

        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const getButtonSize = () => {
        switch (size) {
            case "small": return "h-8 w-8 text-sm";
            case "large": return "h-12 w-12 text-lg";
            default: return "h-10 w-10";
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`
          ${getButtonSize()} flex items-center justify-center rounded-lg
          border border-gray-300 bg-white text-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:bg-gray-50 hover:border-gray-400
          active:bg-gray-100 active:scale-95
          transition-all duration-200
        `}
            >
                <FaChevronLeft size={14} />
            </button>

            {pageNumbers.map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className={`${getButtonSize()} flex items-center justify-center text-gray-500`}
                        >
                            <FaEllipsisH size={14} />
                        </span>
                    );
                }

                return (
                    <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`
              ${getButtonSize()} flex items-center justify-center rounded-lg border font-medium
              transition-all duration-200 transform active:scale-95
              ${currentPage === page
                                ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                            }
            `}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`
          ${getButtonSize()} flex items-center justify-center rounded-lg
          border border-gray-300 bg-white text-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:bg-gray-50 hover:border-gray-400
          active:bg-gray-100 active:scale-95
          transition-all duration-200
        `}
            >
                <FaChevronRight size={14} />
            </button>
        </div>
    );
};


export default Pagination;