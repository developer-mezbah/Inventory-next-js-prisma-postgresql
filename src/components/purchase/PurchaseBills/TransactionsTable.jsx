"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

// Icons
import { BiChevronDown } from "react-icons/bi";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaEdit,
  FaEllipsisH,
  FaFilePdf,
  FaFilter,
  FaPrint,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { GrMoreVertical } from "react-icons/gr";
import { IoMdPrint } from "react-icons/io";
import { IoClose } from "react-icons/io5";

// Components
import InvoicePreview from "@/components/invoice-preview";
import { DeleteAlert } from "@/utils/DeleteAlart";

// Utils & Stores
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { printAndPdfData } from "@/utils/handlePrintAndPdf";
import { useSession } from "next-auth/react";

// Dropdown Component
const ProfessionalDropdown = ({
  items,
  position = { x: 0, y: 0 },
  onClose,
  align = "right",
}) => {
  const getPositionStyle = () => {
    if (align === "right") {
      return {
        right: `calc(100% - ${position.x}px)`,
        top: position.y + 10,
      };
    }
    return {
      left: position.x,
      top: position.y + 10,
    };
  };

  return (
    <>
      {/* <div className="fixed inset-0 z-40" onClick={onClose} /> */}
      <div
        className="z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-200"
        // style={getPositionStyle()}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                item.action();
                onClose();
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${
                index !== items.length - 1 ? "border-b border-gray-100" : ""
              } ${item.color || "text-gray-700"} ${
                item.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={item.disabled}
              title={item.tooltip}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

// Helper function to calculate status
const calculateStatus = (transaction) => {
  // Check if user already provided a status field
  if (transaction.status && typeof transaction.status === "string") {
    return transaction.status;
  }

  // Calculate status based on available properties
  const paidAmount = transaction.paidAmount || 0;
  const balanceDue = transaction.balanceDue || 0;
  const amount = transaction.amount || 0;

  // If amount is 0, return "N/A"
  if (amount === 0) {
    return "N/A";
  }

  // Calculate the actual balance due if not provided
  const actualBalanceDue =
    balanceDue !== undefined ? balanceDue : amount - paidAmount;

  if (paidAmount >= amount || actualBalanceDue <= 0) {
    return "Paid";
  } else if (paidAmount > 0 && paidAmount < amount) {
    return "Partially Paid";
  } else {
    return "Unpaid";
  }
};

// Mobile Accordion Component
function MobileTransactionAccordion({
  transaction,
  menuItems,
  onAction,
  columns,
  customRenderers,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currencySymbol } = useCurrencyStore();
  const hiderBoxRef = useOutsideClick(() => setIsMenuOpen(false));

  const renderValue = (column, value) => {
    if (customRenderers && customRenderers[column.key]) {
      return customRenderers[column.key](value, transaction);
    }

    if (column.type === "currency") {
      return `${value.toFixed(2)} ${currencySymbol}`;
    }

    if (column.type === "currency_with_sign") {
      const amount = parseFloat(value) || 0;
      const sign = amount >= 0 ? "+" : "-";
      const colorClass = amount >= 0 ? "text-green-600" : "text-red-600";
      return (
        <span className={`font-semibold ${colorClass}`}>
          {sign} {currencySymbol} {Math.abs(amount).toFixed(2)}
        </span>
      );
    }

    if (column.type === "date" && column.format) {
      // You can add date formatting logic here
      return value;
    }

    return value || "-";
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BiChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          <div className="text-left">
            <div className="flex items-center gap-2">
              {columns.slice(0, 2).map((column) => (
                <span
                  key={column.key}
                  className="text-sm font-medium text-gray-900"
                >
                  {renderValue(column, transaction[column.key])}
                </span>
              ))}
            </div>
            {columns.length > 2 && (
              <p className="text-xs text-gray-500 mt-1">
                {renderValue(columns[2], transaction[columns[2].key])}
              </p>
            )}
          </div>
        </div>
        {columns.find(
          (c) => c.type === "currency" || c.type === "currency_with_sign"
        ) && (
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {renderValue(
                columns.find(
                  (c) =>
                    c.type === "currency" || c.type === "currency_with_sign"
                ),
                transaction[
                  columns.find(
                    (c) =>
                      c.type === "currency" || c.type === "currency_with_sign"
                  ).key
                ]
              )}
            </p>
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 animate-in fade-in duration-200">
          <div className="space-y-3 mb-4">
            {columns.map((column, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  {column.label}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {renderValue(column, transaction[column.key])}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2">
            <button
              // onClick={() => onAction("print", transaction)}
              onClick={() => {
                /* Print action */
                const findAction = menuItems.find(
                  (item) => item?.label === "Print"
                );
                findAction?.action();
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200"
              title="Print"
            >
              <IoMdPrint />
            </button>
            {/* <button
              onClick={() => onAction("share", transaction)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200"
              title="Share"
            >
              <PiShareFatLight />
            </button> */}
            <div ref={hiderBoxRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(true);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200 relative"
                title="More actions"
              >
                <GrMoreVertical size={18} />
              </button>

              <div className={`absolute z-10 -left-[130px] bottom-0`}>
                {isMenuOpen && (
                  <ProfessionalDropdown
                    items={menuItems}
                    // position={clickPosition}
                    onClose={() => setIsMenuOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Table Row Component
function TransactionRow({
  transaction,
  isAlternate,
  setInvoiceData,
  invoiceType,
  refetch,
  columns,
  menuItems,
  size = "medium",
  customRenderers,
  isLastItem,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const { currencySymbol } = useCurrencyStore();
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState([]);

  const hiderBoxRef = useOutsideClick(() => setIsMenuOpen(false));

  // Responsive column configuration
  useEffect(() => {
    const updateVisibleColumns = () => {
      if (!columns || columns.length === 0) {
        setVisibleColumns([]);
        return;
      }

      const screenWidth = window.innerWidth;
      let columnsToShow;

      // Define breakpoints for different screen sizes
      if (screenWidth < 640) {
        // Small devices (mobile)
        columnsToShow = columns.slice(0, 3);
      } else if (screenWidth < 1024) {
        // Medium devices (tablet)
        columnsToShow = columns.slice(0, 4);
      } else if (screenWidth < 1280) {
        // Large devices
        columnsToShow = columns.slice(0, 5);
      } else {
        // Extra large devices
        // Show all columns or a specific number for XL
        columnsToShow = columns; // Show all columns
      }

      // Always include important columns if they exist (like ID, Name, Amount)
      // You can customize this based on your needs
      const importantKeys = ["id", "partyName", "amount", "date", "status"];
      const importantColumns = columns.filter((col) =>
        importantKeys.includes(col.key)
      );

      // Merge important columns with visible columns, removing duplicates
      const mergedColumns = [...importantColumns];
      columnsToShow.forEach((col) => {
        if (!mergedColumns.some((c) => c.key === col.key)) {
          mergedColumns.push(col);
        }
      });

      setVisibleColumns(mergedColumns.slice(0, columnsToShow.length));
    };

    // Initial call
    updateVisibleColumns();

    // Add event listener for window resize
    window.addEventListener("resize", updateVisibleColumns);

    // Cleanup
    return () => window.removeEventListener("resize", updateVisibleColumns);
  }, [columns]);

  const handleMenuClick = (e) => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-4 py-2 text-xs";
      case "large":
        return "px-8 py-5 text-base";
      default:
        return "px-6 py-4 text-sm";
    }
  };

  const renderCell = (column, transaction) => {
    // Use custom renderer if provided
    if (customRenderers && customRenderers[column.key]) {
      return customRenderers[column.key](transaction[column.key], transaction);
    }

    // Default renderers based on column type
    switch (column.type) {
      case "currency":
        return `${currencySymbol} ${
          transaction[column.key]?.toFixed(2) || "0.00"
        }`;
      case "currency_with_sign":
        const amount = parseFloat(transaction[column.key]) || 0;
        const sign = amount >= 0 ? "+" : "-";
        const colorClass = amount >= 0 ? "text-green-600" : "text-red-600";
        return (
          <span className={`font-semibold ${colorClass}`}>
            {currencySymbol} {sign} {Math.abs(amount).toFixed(2)}
          </span>
        );
      case "date":
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold`}
          >
            {transaction[column.key]}
          </span>
        );
      case "badge":
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              column.badgeColor || "bg-blue-100 text-blue-800"
            }`}
          >
            {transaction[column.key]}
          </span>
        );
      case "status":
        const status = transaction[column.key];
        let statusClass = "bg-gray-100 text-gray-800";
        if (status === "Paid") statusClass = "bg-green-100 text-green-800";
        if (status === "Partially Paid")
          statusClass = "bg-yellow-100 text-yellow-800";
        if (status === "Unpaid") statusClass = "bg-red-100 text-red-800";
        if (status === "N/A") statusClass = "bg-gray-100 text-gray-800";
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
          >
            {status}
          </span>
        );
      default:
        return transaction[column.key] || "-";
    }
  };

  // Show ellipsis for hidden columns on mobile
  const hasHiddenColumns = visibleColumns.length < columns.length;
  return (
    <tr
      className={`border-b border-gray-200 max-h-10 overflow-hidden hover:bg-blue-50 transition-colors ${
        isAlternate ? "bg-white" : "bg-gray-50"
      }`}
    >
      {visibleColumns.map((column) => (
        <td
          key={column.key}
          className={`${getSizeClasses()} ${column.className || ""} ${
            column.cellClassName || ""
          }`}
          style={column.cellStyle}
        >
          <div
            className={column.wrap ? "whitespace-normal" : "whitespace-nowrap"}
          >
            {renderCell(column, transaction)}
          </div>
        </td>
      ))}

      {/* Show indicator for hidden columns on small screens */}
      {hasHiddenColumns && window.innerWidth < 640 && (
        <td className={`${getSizeClasses()} text-center`}>
          <span className="text-gray-400 text-xs">⋯</span>
        </td>
      )}

      <td className={`${getSizeClasses()} text-center`}>
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => {
              /* Print action */
              const findAction = menuItems.find(
                (item) => item?.label === "Print"
              );
              findAction?.action();
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200"
            title="Print"
          >
            <IoMdPrint />
          </button>
          {/* <button
            onClick={() => {
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200"
            title="Share"
          >
            <PiShareFatLight />
          </button> */}
          <div ref={hiderBoxRef} className="relative">
            <button
              onClick={handleMenuClick}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200 relative"
              title="More actions"
            >
              <GrMoreVertical size={18} />
            </button>

            <div
              className={`absolute z-10 -left-[130px] ${
                isLastItem ? "-top-25" : "top-10"
              }`}
            >
              {isMenuOpen && (
                <ProfessionalDropdown
                  items={menuItems}
                  position={clickPosition}
                  onClose={() => setIsMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  size = "medium",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

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
      case "small":
        return "h-8 w-8 text-sm";
      case "large":
        return "h-12 w-12 text-lg";
      default:
        return "h-10 w-10";
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1 mt-6">
      <button
        onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`${getButtonSize()} flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors`}
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
            className={`${getButtonSize()} flex items-center justify-center rounded-lg border font-medium transition-colors ${
              currentPage === page
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`${getButtonSize()} flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors`}
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
};

export default function TransactionsTable({
  data = [],
  invoiceType,
  refetch,
  userProvidedColumns,
  size = "medium",
  showSearch = true,
  showFilters = true,
  title = "TRANSACTIONS",
  itemsPerPage = 10,
  showPagination = true,
  customRenderers = {},
  columnOrder = [],
  defaultSort = null,
  onEditOfCash,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const urlPage = searchParams.get("page");
  const initialPage =
    urlPage && !isNaN(parseInt(urlPage)) ? parseInt(urlPage) : 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [screenSize, setScreenSize] = useState("xl"); // Track screen size

  // Track screen size for responsive columns
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("sm");
      } else if (width < 1024) {
        setScreenSize("md");
      } else if (width < 1280) {
        setScreenSize("lg");
      } else {
        setScreenSize("xl");
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get responsive columns based on screen size
  const getResponsiveColumns = useCallback(
    (cols) => {
      if (!cols || cols.length === 0) return [];

      let visibleCount;

      switch (screenSize) {
        case "sm": // Small devices (mobile)
          visibleCount = 4;
          break;
        case "md": // Medium devices (tablet)
          visibleCount = 6;
          break;
        case "lg": // Large devices
          visibleCount = 6;
          break;
        case "xl": // Extra large devices
        default:
          visibleCount = cols.length; // Show all columns
      }

      // Always include important columns
      const importantKeys = [
        "date",
        "status",
        "partyName",
        "amount",
        "balanceDue",
      ];

      // Filter columns to show
      const importantColumns = cols.filter((col) =>
        importantKeys.includes(col.key)
      );

      // Take the first N columns that are not already in important columns
      const regularColumns = cols.filter((col, index) => {
        const isImportant = importantKeys.includes(col.key);
        const isWithinLimit = index < visibleCount;
        return !isImportant && isWithinLimit;
      });

      // Combine and remove duplicates
      const combinedColumns = [...importantColumns, ...regularColumns];
      const uniqueColumns = [];
      const seenKeys = new Set();

      combinedColumns.forEach((col) => {
        if (!seenKeys.has(col.key)) {
          seenKeys.add(col.key);
          uniqueColumns.push(col);
        }
      });

      // If we have fewer columns than visibleCount, add more from the original array
      if (uniqueColumns.length < visibleCount) {
        cols.forEach((col, index) => {
          if (!seenKeys.has(col.key) && uniqueColumns.length < visibleCount) {
            seenKeys.add(col.key);
            uniqueColumns.push(col);
          }
        });
      }

      return uniqueColumns;
    },
    [screenSize]
  );

  // Default columns if none provided
  const defaultColumns = useMemo(
    () => [
      {
        key: "date",
        label: "Date",
        sortable: true,
        className: "text-left",
        type: "date",
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        className: "text-center",
        type: "status",
      },
      {
        key: "partyName",
        label: "Party Name",
        sortable: true,
        className: "text-left",
      },
      {
        key: "paymentType",
        label: "Payment Type",
        sortable: true,
        className: "text-left",
        type: "badge",
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        className: "text-left font-semibold",
        type: "currency",
      },
      {
        key: "balanceDue",
        label: "Balance Due",
        sortable: true,
        className: "text-left font-semibold",
        type: "currency",
      },
    ],
    []
  );

  // Process userProvidedColumns with status conflict check
  const columns = useMemo(() => {
    if (!userProvidedColumns || userProvidedColumns.length === 0) {
      return defaultColumns;
    }

    // Check if user provided a status column
    const hasUserStatusColumn = userProvidedColumns.some(
      (col) => col.key === "status"
    );

    return userProvidedColumns.map((col) => ({
      key: col.key,
      label: col.label || col.key.charAt(0).toUpperCase() + col.key.slice(1),
      sortable: col.sortable !== undefined ? col.sortable : true,
      className: col.className || "text-left",
      type:
        col.type ||
        (col.key === "status" && !hasUserStatusColumn ? "status" : "text"),
      cellClassName: col.cellClassName || "",
      cellStyle: col.cellStyle || {},
      wrap: col.wrap || false,
      format: col?.format,
      badgeColor: col.badgeColor,
      filterable: col.filterable !== undefined ? col.filterable : true,
    }));
  }, [userProvidedColumns, defaultColumns]);

  // Apply column order if specified
  const orderedColumns = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) {
      return columns;
    }

    const ordered = [];
    const columnMap = new Map(columns.map((col) => [col.key, col]));

    columnOrder.forEach((key) => {
      if (columnMap.has(key)) {
        ordered.push(columnMap.get(key));
        columnMap.delete(key);
      }
    });

    // Add any remaining columns
    columnMap.forEach((col) => ordered.push(col));

    return ordered;
  }, [columns, columnOrder]);

  // Get responsive columns for current screen size
  const responsiveColumns = useMemo(() => {
    return getResponsiveColumns(orderedColumns);
  }, [orderedColumns, getResponsiveColumns]);

  // Helper function to get responsive classes for table headers
  const getResponsiveHeaderClasses = (column, index) => {
    // Default responsive classes based on index
    let responsiveClasses = "";

    switch (screenSize) {
      case "sm": // Small devices: show only first 4 columns
        if (index >= 2) {
          responsiveClasses = "hidden";
        }
        break;
      case "md": // Medium devices: show first 6 columns
        if (index >= 3) {
          responsiveClasses = "hidden";
        }
        break;
      case "lg": // Large devices: show first 6 columns
        if (index >= 4) {
          responsiveClasses = "hidden";
        }
        break;
      case "xl": // Extra large: show all
      default:
        // Show all columns
        break;
    }

    return responsiveClasses;
  };

  const formatData = useCallback((items) => {
    return items.map((item) => {
      // Check if user already provided status in the data
      const hasUserStatus = item.status && typeof item.status === "string";
      const calculatedStatus = calculateStatus(item);

      // Determine if amount should be positive or negative based on type
      let displayAmount = item.amount || 0;

      // For certain transaction types, you might want to show negative amounts
      // This is just an example - adjust based on your business logic
      if (
        item.type === "Reduce Cash" ||
        item.type === "Expense" ||
        item.type === "Purchase" ||
        item.type === "Withdrawal"
      ) {
        // Ensure negative amount is displayed
        displayAmount = -Math.abs(displayAmount);
      } else if (
        item.type === "Add Cash" ||
        item.type === "Income" ||
        item.type === "Sale" ||
        item.type === "Deposit"
      ) {
        // Ensure positive amount is displayed
        displayAmount = Math.abs(displayAmount);
      }

      return {
        id: item.id,
        date: item.date || item.billDate || item.createdAt,
        invoiceNo: item.invoiceNo || item.transactionId,
        partyName: item.partyName || item.name || "N/A",
        partyId: item.partyId,
        paymentType: item.paymentType,
        amount: displayAmount, // Use the adjusted amount
        transactionType: item.transactionType || item.type,
        balanceDue: item.isPaid ? 0 : item.balanceDue || 0,
        paidAmount: item.paidAmount || 0,
        // Only add status if user didn't provide one or we need to calculate it
        ...(hasUserStatus ? {} : { status: calculatedStatus }),
        // Add any additional fields from the data
        ...item,
      };
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: defaultSort?.key || null,
    direction: defaultSort?.direction || "asc",
  });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);

  // Calculate pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, endIndex);

  // Initialize from URL
  useEffect(() => {
    if (!hasInitialized) {
      const urlPage = searchParams.get("page");
      const pageFromUrl =
        urlPage && !isNaN(parseInt(urlPage)) ? parseInt(urlPage) : 1;

      if (pageFromUrl !== currentPage) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(pageFromUrl);
      }

      setHasInitialized(true);
    }
  }, [searchParams, currentPage, hasInitialized]);

  // Update URL when page changes
  useEffect(() => {
    if (!hasInitialized) return;

    const params = new URLSearchParams(searchParams.toString());
    const currentUrlPage = params.get("page");
    const currentUrlPageNum = currentUrlPage ? parseInt(currentUrlPage) : 1;

    if (currentPage === 1) {
      if (params.has("page")) {
        params.delete("page");
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    } else if (currentPage !== currentUrlPageNum) {
      params.set("page", currentPage.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentPage, router, searchParams, hasInitialized]);

  // Process data
  useEffect(() => {
    const formattedData = formatData(data);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredTransactions(formattedData);

    // Apply default sort if specified
    if (defaultSort && defaultSort.key) {
      const sorted = [...formattedData].sort((a, b) => {
        if (!a[defaultSort.key] || !b[defaultSort.key]) return 0;

        // Special handling for status sorting
        if (defaultSort.key === "status") {
          const statusOrder = {
            Paid: 1,
            "Partially Paid": 2,
            Unpaid: 3,
            "N/A": 4,
          };
          const aValue = statusOrder[a[defaultSort.key]] || 5;
          const bValue = statusOrder[b[defaultSort.key]] || 5;
          return defaultSort.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (
          typeof a[defaultSort.key] === "number" &&
          typeof b[defaultSort.key] === "number"
        ) {
          return defaultSort.direction === "asc"
            ? a[defaultSort.key] - b[defaultSort.key]
            : b[defaultSort.key] - a[defaultSort.key];
        }
        return defaultSort.direction === "asc"
          ? String(a[defaultSort.key]).localeCompare(String(b[defaultSort.key]))
          : String(b[defaultSort.key]).localeCompare(
              String(a[defaultSort.key])
            );
      });
      setFilteredTransactions(sorted);
      setSortConfig({ key: defaultSort.key, direction: defaultSort.direction });
    }

    // Reset page if needed
    if (hasInitialized && currentPage > 1) {
      const newTotalPages = Math.ceil(formattedData.length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    }
  }, [
    data,
    formatData,
    itemsPerPage,
    hasInitialized,
    currentPage,
    defaultSort,
  ]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const original = formatData(data);
    const filtered = original.filter((t) =>
      Object.entries(t).some(([key, value]) => {
        const column = columns.find((col) => col.key === key);
        // Skip filtering on non-filterable columns
        if (column && column.filterable === false) return false;
        return String(value).toLowerCase().includes(term);
      })
    );

    setFilteredTransactions(filtered);
    if (filtered.length > 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...filteredTransactions].sort((a, b) => {
      if (!a[key] || !b[key]) return 0;

      // Special handling for status sorting
      if (key === "status") {
        const statusOrder = {
          Paid: 1,
          "Partially Paid": 2,
          Unpaid: 3,
          "N/A": 4,
        };
        const aValue = statusOrder[a[key]] || 5;
        const bValue = statusOrder[b[key]] || 5;
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      return direction === "asc"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });

    setSortConfig({ key, direction });
    setFilteredTransactions(sorted);

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSalePurchaseDelete = async (id, type) => {
    const res = await DeleteAlert(
      `/api/sale-purchase/delete?id=${id}&mode=${type}`, "", "Sale/Purchase transaction"
    );
    if (res) {
      refetch();
      toast.success("Transaction Deleted Successfully!");
    }
  };

  const getMenuItems = (transaction) => [
    {
      label: "View/Edit",
      icon: FaEdit,
      action: () => {
        if (
          transaction?.type === "Add Cash" ||
          transaction?.type === "Reduce Cash"
        ) {
          onEditOfCash
            ? onEditOfCash(transaction)
            : toast.warning("View and Edit not available!");
        } else if (
          transaction?.type === "Sale" ||
          transaction?.type === "Purchase" ||
          invoiceType === "Sale" ||
          invoiceType === "Purchase"
        ) {
          router.push(
            `/update-sale-purchase?id=${transaction?.id}&type=${invoiceType}&partyId=${transaction?.partyId}`
          );
        } else {
          toast.warning("View and Edit not available!");
        }
      },
    },
    {
      label: "Download PDF",
      icon: FaFilePdf,
      action: async () => {
        if (invoiceType === "Sale" || invoiceType === "Purchase") {
          printAndPdfData("pdf", setInvoiceData, transaction?.id, invoiceType);
        } else if (
          transaction?.type === "Sale" ||
          transaction?.type === "Purchase"
        ) {
          printAndPdfData(
            "pdf",
            setInvoiceData,
            transaction?.type === "Sale"
              ? transaction?.saleId
              : transaction?.purchaseId,
            transaction?.type
          );
        } else {
          toast.warning("PDF generator not available in this transaction!");
        }
      },
    },
    {
      label: "Print",
      icon: FaPrint,
      action: () => {
        if (invoiceType === "Sale" || invoiceType === "Purchase") {
          printAndPdfData(
            "print",
            setInvoiceData,
            transaction?.id,
            invoiceType
          );
        } else if (
          transaction?.type === "Sale" ||
          transaction?.type === "Purchase"
        ) {
          printAndPdfData(
            "print",
            setInvoiceData,
            transaction?.type === "Sale"
              ? transaction?.saleId
              : transaction?.purchaseId,
            transaction?.type
          );
        } else {
          toast.warning("Print not available in this transaction!");
        }
      },
    },
    {
      label: "Duplicate",
      icon: FaCopy,
      action: () => {
        /* Duplicate logic */
      },
    },
    {
      label: "Delete",
      icon: FaTrash,
      action: async () => {
        if (
          transaction?.type === "Add Cash" ||
          transaction?.type === "Reduce Cash"
        ) {
          const res = await DeleteAlert(
            `/api/cashadjustment/delete-transaction?id=${transaction?.id}&userId=${session?.user?.id}`, "", "Cash adjustment transaction"
          );
          if (res) {
            refetch();
            toast.success("Transaction Deleted Successfully!");
          }
          return;
        }
        if (invoiceType === "Sale" || invoiceType === "Purchase") {
          handleSalePurchaseDelete(
            transaction?.id,
            transaction?.transactionType.toLowerCase()
          );
        } else {
          const storeId =
            transaction?.type === "Sale"
              ? transaction?.saleId
              : transaction?.purchaseId;
          const storeType = transaction?.type === "Sale" ? "sale" : "purchase";
          handleSalePurchaseDelete(storeId, storeType);
        }
      },
      color: "text-red-600",
    },
  ];

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "text-xs";
      case "large":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const handleClearSearch = () => {
    setFilteredTransactions(formatData(data));
    setSearchTerm("");
    if (currentPage > 1) {
      const newTotalPages = Math.ceil(formatData(data).length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    }
  };

  return (
    <div className="w-full p-4">
      {invoiceData && (
        <div
          className="bg-white hidden overflow-auto max-h-[800px] print:p-0 print:max-h-none"
          data-invoice-preview
        >
          <InvoicePreview data={invoiceData} />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1
          className={`text-3xl font-bold text-gray-900 ${
            size === "small" ? "text-2xl" : size === "large" ? "text-4xl" : ""
          }`}
        >
          {title}
        </h1>

        {showSearch && (
          <div className={`${size === "small" ? "md:w-1/4" : "md:w-1/3"}`}>
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 ${getSizeClasses()} text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {searchTerm && (
                <IoClose
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  size={18}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div
        className={`hidden md:block rounded-lg border border-gray-200 bg-white shadow-sm ${
          size === "small" ? "text-xs" : ""
        }`}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {responsiveColumns.map((column, index) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left ${
                    column.className || ""
                  } ${getResponsiveHeaderClasses(column, index)}`}
                  style={column.headerStyle}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-semibold text-gray-700 uppercase tracking-wider ${getSizeClasses()}`}
                    >
                      {column.label}
                    </span>
                    {showFilters && column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="text-gray-400 hover:text-gray-600"
                        title={`Sort by ${column.label}`}
                      >
                        <FaFilter size={14} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-center">
                <span
                  className={`font-semibold text-gray-700 uppercase tracking-wider ${getSizeClasses()}`}
                >
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((transaction, index) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isAlternate={index % 2 === 0}
                setInvoiceData={setInvoiceData}
                invoiceType={invoiceType}
                refetch={refetch}
                columns={responsiveColumns} // Use responsive columns here
                menuItems={getMenuItems(transaction)}
                size={size}
                customRenderers={customRenderers}
                isLastItem={index === currentItems.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {currentItems.map((transaction) => (
          <MobileTransactionAccordion
            key={transaction.id}
            transaction={transaction}
            menuItems={getMenuItems(transaction)}
            columns={orderedColumns} // Use all columns for mobile accordion
            customRenderers={customRenderers}
            onAction={(action, transaction) => {
              // Handle mobile actions
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>-
              <span className="font-semibold">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-semibold">{totalItems}</span> items
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              size={size}
            />
          </div>
        </div>
      )}
    </div>
  );
}
