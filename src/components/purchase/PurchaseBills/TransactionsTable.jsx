"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { 
  useFloating, 
  offset, 
  flip, 
  shift, 
  autoUpdate,
  safePolygon,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useClick,
  useTransitionStyles
} from "@floating-ui/react";

// Extend dayjs with plugins
dayjs.extend(customParseFormat);

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
  FaRegEye,
  FaRegFilePdf,
  FaRegCopy,
  FaRegTrashAlt,
} from "react-icons/fa";
import { GrMoreVertical } from "react-icons/gr";
import { IoMdPrint } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import { TbPrinter, TbDownload } from "react-icons/tb";

// Components
import InvoicePreview from "@/components/invoice-preview";
import { DeleteAlert } from "@/utils/DeleteAlart";

// Utils & Stores
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { printAndPdfData } from "@/utils/handlePrintAndPdf";
import { useSession } from "next-auth/react";

// Professional Floating UI Dropdown Component with Portal
const ProfessionalDropdown = ({
  items,
  onClose,
  children,
  trigger,
  placement = "bottom-end",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    placement,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  // Interactions
  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Smooth transitions
  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    open: {
      opacity: 1,
      transform: 'scale(1)',
    },
    close: {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    duration: 200,
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-block"
      >
        {trigger}
      </div>

      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              ...styles,
            }}
            {...getFloatingProps()}
            className="z-[9999]"
          >
            <div className="min-w-[200px] rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </div>
              
              {/* Items */}
              <div className="p-1.5">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isDestructive = item.color === "text-red-600";
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                        onClose?.();
                      }}
                      disabled={item.disabled}
                      className={`
                        flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                        transition-all duration-150
                        ${isDestructive 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${item.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
                      `}
                      title={item.tooltip}
                    >
                      <Icon size={16} className={isDestructive ? 'text-red-500' : 'text-gray-500'} />
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-gray-400">{item.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

// Professional Mobile Action Sheet with Center Display
const MobileActionSheet = ({
  isOpen,
  onClose,
  menuItems,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay
        lockScroll
        className="bg-black/60 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className={`
            w-full max-w-sm bg-white rounded-2xl shadow-2xl
            transition-all duration-300 ease-out
            ${isOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Actions Grid */}
          <div className="p-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isDestructive = item.color === "text-red-600";
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    disabled={item.disabled}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-xl
                      transition-all duration-200
                      ${isDestructive 
                        ? 'text-red-600 hover:bg-red-50 active:bg-red-100' 
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                      }
                      ${item.disabled ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    <div className={`
                      p-3 rounded-full mb-2
                      ${isDestructive ? 'bg-red-50' : 'bg-gray-100'}
                    `}>
                      <Icon size={22} className={isDestructive ? 'text-red-600' : 'text-gray-700'} />
                    </div>
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FloatingOverlay>
    </FloatingPortal>
  );
};

// Helper function to calculate status (unchanged)
const calculateStatus = (transaction) => {
  if (transaction.status && typeof transaction.status === "string") {
    return transaction.status;
  }

  const paidAmount = transaction.paidAmount || 0;
  const balanceDue = transaction.balanceDue || 0;
  const amount = transaction.amount || 0;

  if (amount === 0) return "N/A";

  const actualBalanceDue = balanceDue !== undefined ? balanceDue : amount - paidAmount;

  if (paidAmount >= amount || actualBalanceDue <= 0) return "Paid";
  else if (paidAmount > 0 && paidAmount < amount) return "Partially Paid";
  else return "Unpaid";
};

// Mobile Accordion Component - Optimized for Mobile with Professional Design
function MobileTransactionAccordion({
  transaction,
  menuItems,
  columns,
  customRenderers,
  size = "medium",
  showStatusBadge = true,
  theme = "default",
  isDesktop = false,
  dateFormat = "DD/MM/YYYY",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { currencySymbol } = useCurrencyStore();

  // Theme configuration
  const themes = {
    default: {
      bg: "bg-white",
      border: "border-gray-200",
      headerBg: "bg-white",
      headerHover: "active:bg-gray-50",
      expandedBg: "bg-gray-50",
      text: "text-gray-900",
      subtext: "text-gray-600",
    },
    modern: {
      bg: "bg-white",
      border: "border-gray-200",
      headerBg: "bg-gradient-to-r from-white to-blue-50/30",
      headerHover: "active:from-blue-50 active:to-white",
      expandedBg: "bg-gradient-to-r from-gray-50 to-blue-50/20",
      text: "text-gray-900",
      subtext: "text-gray-700",
    },
  };

  const currentTheme = themes[theme] || themes.default;

  // Size configuration
  const sizeClasses = {
    small: { padding: "p-2", text: "text-xs", icon: "text-sm", gap: "gap-1" },
    medium: { padding: "p-3", text: "text-sm", icon: "text-base", gap: "gap-2" },
    large: { padding: "p-4", text: "text-base", icon: "text-lg", gap: "gap-3" },
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

  const statusColumn = columns.find(col => col.key === "status");
  const statusValue = statusColumn ? transaction[statusColumn.key] : null;
  
  const amountColumn = columns.find(col =>
    col.type === "currency" || col.type === "currency_with_sign"
  );

  const headerColumns = columns.slice(0, 2);
  const detailColumns = columns;

  const formatDate = (dateValue, format) => {
    if (!dateValue) return "-";
    
    const parsedDate = dayjs(dateValue);
    if (parsedDate.isValid()) return parsedDate.format(format);
    
    const formats = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD", "DD-MM-YYYY", "MM-DD-YYYY"];
    for (const fmt of formats) {
      const parsed = dayjs(dateValue, fmt);
      if (parsed.isValid()) return parsed.format(format);
    }
    
    return dateValue;
  };

  const renderValue = (column, value, truncate = true) => {
    if (customRenderers && customRenderers[column.key]) {
      return customRenderers[column.key](value, transaction);
    }

    if (column.type === "currency") {
      return (
        <span className="font-mono font-semibold">
          {currencySymbol}{parseFloat(value || 0).toFixed(2)}
        </span>
      );
    }

    if (column.type === "currency_with_sign") {
      const amount = parseFloat(value) || 0;
      const sign = amount >= 0 ? "+" : "-";
      const colorClass = amount >= 0 ? "text-green-600" : "text-red-600";
      return (
        <span className={`font-mono font-semibold ${colorClass}`}>
          {sign} {currencySymbol}{Math.abs(amount).toFixed(2)}
        </span>
      );
    }

    if (column.type === "status") {
      const status = value;
      let statusClass = "bg-gray-100 text-gray-800";
      if (status === "Paid") statusClass = "bg-green-100 text-green-800";
      if (status === "Partially Paid") statusClass = "bg-yellow-100 text-yellow-800";
      if (status === "Unpaid") statusClass = "bg-red-100 text-red-800";
      return (
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
          {status}
        </span>
      );
    }

    if (column.type === "date") {
      const dateFormatFromProps = column.dateFormat || dateFormat;
      return (
        <span className="font-mono text-sm">
          {formatDate(value, dateFormatFromProps)}
        </span>
      );
    }

    const displayValue = value || "-";
    return truncate && typeof displayValue === 'string' && displayValue.length > 20 
      ? displayValue.substring(0, 20) + "..." 
      : displayValue;
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-400";
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-500";
      case "partially paid": return "bg-yellow-500";
      case "unpaid": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  // Desktop mode
  if (isDesktop) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden`}>
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
          {amountColumn && (
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {renderValue(amountColumn, transaction[amountColumn.key])}
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
                onClick={() => {
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
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionSheet(true);
                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200 relative"
                  title="More actions"
                >
                  <GrMoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Action Sheet for Desktop mode */}
        <MobileActionSheet
          isOpen={showActionSheet}
          onClose={() => setShowActionSheet(false)}
          menuItems={menuItems}
        />
      </div>
    );
  }

  // Mobile optimized version
  return (
    <>
      <div className={`
        rounded-xl border ${currentTheme.border} ${currentTheme.bg}
        shadow-sm overflow-hidden transition-all duration-200
        ${isExpanded ? 'shadow-md' : ''}
      `}>
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            w-full ${currentSize.padding} flex items-center ${currentSize.gap}
            ${currentTheme.headerBg} ${currentTheme.headerHover}
            cursor-pointer transition-all select-none
          `}
        >
          {/* Left: Chevron and Status */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`
              transform transition-transform duration-300 ease-spring
              ${isExpanded ? 'rotate-180' : ''}
            `}>
              <BiChevronDown
                size={currentSize.icon === "text-lg" ? 22 : 20}
                className={currentTheme.subtext}
              />
            </div>
            {showStatusBadge && statusValue && (
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(statusValue)} ml-1 animate-pulse`} />
            )}
          </div>

          {/* Middle: Primary Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {headerColumns.map((column) => (
                <span
                  key={column.key}
                  className={`${currentSize.text} ${currentTheme.text} font-medium truncate max-w-[120px]`}
                >
                  {renderValue(column, transaction[column.key], true)}
                </span>
              ))}
            </div>
            
            {!isExpanded && detailColumns.length > 2 && (
              <p className={`${currentSize.text} ${currentTheme.subtext} truncate mt-1 opacity-75`}>
                {detailColumns.slice(2, 4).map((col, idx) => (
                  <span key={col.key}>
                    {renderValue(col, transaction[col.key], true)}
                    {idx < Math.min(detailColumns.length - 2, 2) - 1 && " • "}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Right: Amount and 3-dots */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {amountColumn && (
              <span className={`font-bold ${currentSize.text} ${currentTheme.text} whitespace-nowrap`}>
                {renderValue(amountColumn, transaction[amountColumn.key], false)}
              </span>
            )}
            
            {/* Professional 3-dots button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionSheet(true);
              }}
              className={`
                p-2 rounded-lg ${currentTheme.subtext}
                hover:bg-gray-200 active:bg-gray-300
                transition-all duration-150 transform active:scale-95
              `}
              aria-label="More actions"
            >
              <HiDotsVertical size={currentSize.icon === "text-lg" ? 18 : 16} />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className={`
            border-t ${currentTheme.border} ${currentTheme.expandedBg}
            p-4 animate-in slide-in-from-top-2 duration-200
          `}>
            <div className="grid grid-cols-2 gap-4">
              {detailColumns.map((column) => (
                <div key={column.key} className="col-span-1 space-y-1">
                  <div className={`text-xs ${currentTheme.subtext} font-medium uppercase tracking-wider`}>
                    {column.label}
                  </div>
                  <div className={`${currentSize.text} ${currentTheme.text} font-medium break-words`}>
                    {renderValue(column, transaction[column.key], false)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Professional Mobile Action Sheet - Centered */}
      <MobileActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        menuItems={menuItems}
      />
    </>
  );
}

// Table Row Component (unchanged but with ProfessionalDropdown integration)
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
  dateFormat = "DD/MM/YYYY",
}) {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const { currencySymbol } = useCurrencyStore();
  const router = useRouter();

  useEffect(() => {
    const updateVisibleColumns = () => {
      if (!columns || columns.length === 0) {
        setVisibleColumns([]);
        return;
      }

      const screenWidth = window.innerWidth;
      let columnsToShow;

      if (screenWidth < 640) {
        columnsToShow = columns.slice(0, 3);
      } else if (screenWidth < 1024) {
        columnsToShow = columns.slice(0, 4);
      } else if (screenWidth < 1280) {
        columnsToShow = columns.slice(0, 5);
      } else {
        columnsToShow = columns;
      }

      const importantKeys = ["id", "partyName", "amount", "date", "status"];
      const importantColumns = columns.filter((col) =>
        importantKeys.includes(col.key)
      );

      const mergedColumns = [...importantColumns];
      columnsToShow.forEach((col) => {
        if (!mergedColumns.some((c) => c.key === col.key)) {
          mergedColumns.push(col);
        }
      });

      setVisibleColumns(mergedColumns.slice(0, columnsToShow.length));
    };

    updateVisibleColumns();
    window.addEventListener("resize", updateVisibleColumns);
    return () => window.removeEventListener("resize", updateVisibleColumns);
  }, [columns]);

  const getSizeClasses = () => {
    switch (size) {
      case "small": return "px-4 py-2 text-xs";
      case "large": return "px-8 py-5 text-base";
      default: return "px-6 py-4 text-sm";
    }
  };

  const formatDate = (dateValue, format) => {
    if (!dateValue) return "-";
    
    const parsedDate = dayjs(dateValue);
    if (parsedDate.isValid()) return parsedDate.format(format);
    
    const formats = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD", "DD-MM-YYYY", "MM-DD-YYYY"];
    for (const fmt of formats) {
      const parsed = dayjs(dateValue, fmt);
      if (parsed.isValid()) return parsed.format(format);
    }
    
    return dateValue;
  };

  const renderCell = (column, transaction) => {
    if (customRenderers && customRenderers[column.key]) {
      return customRenderers[column.key](transaction[column.key], transaction);
    }

    switch (column.type) {
      case "currency":
        return (
          <span className="font-mono">
            {currencySymbol}{transaction[column.key]?.toFixed(2) || "0.00"}
          </span>
        );
      case "currency_with_sign":
        const amount = parseFloat(transaction[column.key]) || 0;
        const sign = amount >= 0 ? "+" : "-";
        const colorClass = amount >= 0 ? "text-green-600" : "text-red-600";
        return (
          <span className={`font-mono font-semibold ${colorClass}`}>
            {sign} {currencySymbol}{Math.abs(amount).toFixed(2)}
          </span>
        );
      case "date":
        const dateFormatFromProps = column.dateFormat || dateFormat;
        return formatDate(transaction[column.key], dateFormatFromProps);
      case "badge":
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${column.badgeColor || "bg-blue-100 text-blue-800"}`}
          >
            {transaction[column.key]}
          </span>
        );
      case "status":
        const status = transaction[column.key];
        let statusClass = "bg-gray-100 text-gray-800";
        if (status === "Paid") statusClass = "bg-green-100 text-green-800";
        if (status === "Partially Paid") statusClass = "bg-yellow-100 text-yellow-800";
        if (status === "Unpaid") statusClass = "bg-red-100 text-red-800";
        if (status === "N/A") statusClass = "bg-gray-100 text-gray-800";
        return (
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
            {status}
          </span>
        );
      default:
        return transaction[column.key] || "-";
    }
  };

  const hasHiddenColumns = visibleColumns.length < columns.length;

  return (
    <tr className={`
      border-b border-gray-200 hover:bg-blue-50/50 transition-colors
      ${isAlternate ? "bg-white" : "bg-gray-50/50"}
    `}>
      {visibleColumns.map((column) => (
        <td
          key={column.key}
          className={`${getSizeClasses()} ${column.className || ""} ${column.cellClassName || ""}`}
          style={column.cellStyle}
        >
          <div className={column.wrap ? "whitespace-normal" : "whitespace-nowrap"}>
            {renderCell(column, transaction)}
          </div>
        </td>
      ))}

      {hasHiddenColumns && window.innerWidth < 640 && (
        <td className={`${getSizeClasses()} text-center`}>
          <span className="text-gray-400 text-xs">⋯</span>
        </td>
      )}

      <td className={`${getSizeClasses()} text-center`}>
        <div className="flex justify-center items-center gap-1">
          {/* Print Button */}
          <button
            onClick={() => {
              const findAction = menuItems.find(item => item?.label === "Print");
              findAction?.action();
            }}
            className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            title="Print"
          >
            <TbPrinter size={18} />
          </button>

          {/* More Actions Dropdown */}
          <ProfessionalDropdown
            items={menuItems}
            trigger={
              <button
                className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                title="More actions"
              >
                <HiDotsVertical size={18} />
              </button>
            }
            placement="bottom-end"
          />
        </div>
      </td>
    </tr>
  );
}

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

// Main TransactionsTable Component (unchanged but with updated imports)
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
  isMobile = false,
  dateFormat = "DD/MM/YYYY",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const urlPage = searchParams.get("page");
  const initialPage = urlPage && !isNaN(parseInt(urlPage)) ? parseInt(urlPage) : 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [screenSize, setScreenSize] = useState("xl");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize("sm");
      else if (width < 1024) setScreenSize("md");
      else if (width < 1280) setScreenSize("lg");
      else setScreenSize("xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getResponsiveColumns = useCallback((cols) => {
    if (!cols || cols.length === 0) return [];

    let visibleCount;
    switch (screenSize) {
      case "sm": visibleCount = 4; break;
      case "md": visibleCount = 6; break;
      case "lg": visibleCount = 6; break;
      case "xl": default: visibleCount = cols.length;
    }

    const importantKeys = ["date", "status", "partyName", "amount", "balanceDue"];
    const importantColumns = cols.filter(col => importantKeys.includes(col.key));
    const regularColumns = cols.filter((col, index) => {
      const isImportant = importantKeys.includes(col.key);
      const isWithinLimit = index < visibleCount;
      return !isImportant && isWithinLimit;
    });

    const combinedColumns = [...importantColumns, ...regularColumns];
    const uniqueColumns = [];
    const seenKeys = new Set();

    combinedColumns.forEach(col => {
      if (!seenKeys.has(col.key)) {
        seenKeys.add(col.key);
        uniqueColumns.push(col);
      }
    });

    if (uniqueColumns.length < visibleCount) {
      cols.forEach(col => {
        if (!seenKeys.has(col.key) && uniqueColumns.length < visibleCount) {
          seenKeys.add(col.key);
          uniqueColumns.push(col);
        }
      });
    }

    return uniqueColumns;
  }, [screenSize]);

  const defaultColumns = useMemo(() => [
    { key: "date", label: "Date", sortable: true, className: "text-left", type: "date", dateFormat },
    { key: "status", label: "Status", sortable: true, className: "text-center", type: "status" },
    { key: "partyName", label: "Party Name", sortable: true, className: "text-left" },
    { key: "paymentType", label: "Payment Type", sortable: true, className: "text-left", type: "badge" },
    { key: "amount", label: "Amount", sortable: true, className: "text-left font-semibold", type: "currency" },
    { key: "balanceDue", label: "Balance Due", sortable: true, className: "text-left font-semibold", type: "currency" },
  ], [dateFormat]);

  const columns = useMemo(() => {
    if (!userProvidedColumns || userProvidedColumns.length === 0) return defaultColumns;

    const hasUserStatusColumn = userProvidedColumns.some(col => col.key === "status");

    return userProvidedColumns.map(col => ({
      key: col.key,
      label: col.label || col.key.charAt(0).toUpperCase() + col.key.slice(1),
      sortable: col.sortable !== undefined ? col.sortable : true,
      className: col.className || "text-left",
      type: col.type || (col.key === "status" && !hasUserStatusColumn ? "status" : "text"),
      cellClassName: col.cellClassName || "",
      cellStyle: col.cellStyle || {},
      wrap: col.wrap || false,
      format: col?.format,
      badgeColor: col.badgeColor,
      filterable: col.filterable !== undefined ? col.filterable : true,
      dateFormat: col.dateFormat || dateFormat,
    }));
  }, [userProvidedColumns, defaultColumns, dateFormat]);

  const orderedColumns = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) return columns;

    const ordered = [];
    const columnMap = new Map(columns.map(col => [col.key, col]));

    columnOrder.forEach(key => {
      if (columnMap.has(key)) {
        ordered.push(columnMap.get(key));
        columnMap.delete(key);
      }
    });

    columnMap.forEach(col => ordered.push(col));
    return ordered;
  }, [columns, columnOrder]);

  const responsiveColumns = useMemo(() => getResponsiveColumns(orderedColumns), [orderedColumns, getResponsiveColumns]);

  const getResponsiveHeaderClasses = (column, index) => {
    let responsiveClasses = "";
    switch (screenSize) {
      case "sm": if (index >= 2) responsiveClasses = "hidden"; break;
      case "md": if (index >= 3) responsiveClasses = "hidden"; break;
      case "lg": if (index >= 4) responsiveClasses = "hidden"; break;
      case "xl": default: break;
    }
    return responsiveClasses;
  };

  const formatData = useCallback((items) => {
    return items.map(item => {
      const hasUserStatus = item.status && typeof item.status === "string";
      const calculatedStatus = calculateStatus(item);

      let displayAmount = item.amount || 0;
      if (["Reduce Cash", "Expense", "Purchase", "Withdrawal"].includes(item.type)) {
        displayAmount = -Math.abs(displayAmount);
      } else if (["Add Cash", "Income", "Sale", "Deposit"].includes(item.type)) {
        displayAmount = Math.abs(displayAmount);
      }

      return {
        id: item.id,
        date: item.date || item.billDate || item.createdAt,
        invoiceNo: item.invoiceNo || item.transactionId,
        partyName: item.partyName || item.name || "N/A",
        partyId: item.partyId,
        paymentType: item.paymentType,
        amount: displayAmount,
        transactionType: item.transactionType || item.type,
        balanceDue: item.isPaid ? 0 : item.balanceDue || 0,
        paidAmount: item.paidAmount || 0,
        ...(hasUserStatus ? {} : { status: calculatedStatus }),
        ...item,
      };
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: defaultSort?.key || null, direction: defaultSort?.direction || "asc" });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    if (!hasInitialized) {
      const urlPage = searchParams.get("page");
      const pageFromUrl = urlPage && !isNaN(parseInt(urlPage)) ? parseInt(urlPage) : 1;
      if (pageFromUrl !== currentPage) setCurrentPage(pageFromUrl);
      setHasInitialized(true);
    }
  }, [searchParams, currentPage, hasInitialized]);

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

  useEffect(() => {
    const formattedData = formatData(data);
    setFilteredTransactions(formattedData);

    if (defaultSort && defaultSort.key) {
      const sorted = [...formattedData].sort((a, b) => {
        if (!a[defaultSort.key] || !b[defaultSort.key]) return 0;

        if (defaultSort.key === "status") {
          const statusOrder = { Paid: 1, "Partially Paid": 2, Unpaid: 3, "N/A": 4 };
          const aValue = statusOrder[a[defaultSort.key]] || 5;
          const bValue = statusOrder[b[defaultSort.key]] || 5;
          return defaultSort.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (typeof a[defaultSort.key] === "number" && typeof b[defaultSort.key] === "number") {
          return defaultSort.direction === "asc" ? a[defaultSort.key] - b[defaultSort.key] : b[defaultSort.key] - a[defaultSort.key];
        }
        return defaultSort.direction === "asc"
          ? String(a[defaultSort.key]).localeCompare(String(b[defaultSort.key]))
          : String(b[defaultSort.key]).localeCompare(String(a[defaultSort.key]));
      });
      setFilteredTransactions(sorted);
      setSortConfig({ key: defaultSort.key, direction: defaultSort.direction });
    }

    if (hasInitialized && currentPage > 1) {
      const newTotalPages = Math.ceil(formattedData.length / itemsPerPage);
      if (currentPage > newTotalPages) setCurrentPage(1);
    }
  }, [data, formatData, itemsPerPage, hasInitialized, currentPage, defaultSort]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const original = formatData(data);
    const filtered = original.filter(t =>
      Object.entries(t).some(([key, value]) => {
        const column = columns.find(col => col.key === key);
        if (column && column.filterable === false) return false;
        return String(value).toLowerCase().includes(term);
      })
    );

    setFilteredTransactions(filtered);
    if (filtered.length > 0 && currentPage !== 1) setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";

    const sorted = [...filteredTransactions].sort((a, b) => {
      if (!a[key] || !b[key]) return 0;

      if (key === "status") {
        const statusOrder = { Paid: 1, "Partially Paid": 2, Unpaid: 3, "N/A": 4 };
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
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSalePurchaseDelete = async (id, type) => {
    const res = await DeleteAlert(`/api/sale-purchase/delete?id=${id}&mode=${type}`, "", "Sale/Purchase transaction");
    if (res) {
      refetch();
      toast.success("Transaction Deleted Successfully!");
    }
  };

  const pathname = usePathname();

  const getMenuItems = (transaction) => [
    {
      label: "View/Edit",
      icon: FaRegEye,
      action: () => {
        if (transaction?.type === "Add Cash" || transaction?.type === "Reduce Cash") {
          onEditOfCash ? onEditOfCash(transaction) : toast.warning("View and Edit not available!");
        } else if (transaction?.type === "Sale" || transaction?.type === "Purchase" || invoiceType === "Sale" || invoiceType === "Purchase") {
          router.push(`/update-sale-purchase?id=${transaction?.id}&type=${invoiceType}&partyId=${transaction?.partyId}`);
        } else if (transaction?.type === "LOAN_PAYMENT") {
          const params = new URLSearchParams(searchParams.toString());
          params.set("makepayment", "update");
          params.set("paymentId", transaction?.id);
          router.push(`/cash-bank/loan-accounts?${params.toString()}`);
        } else if (transaction?.type === "LOAN_INCREASE") {
          const params = new URLSearchParams(searchParams.toString());
          params.set("takeloan", "update");
          params.set("takeloanId", transaction?.id);
          router.push(`/cash-bank/loan-accounts?${params.toString()}`);
        } else if (transaction?.type === "LOAN_CHARGE") {
          const params = new URLSearchParams(searchParams.toString());
          params.set("charges", "update");
          params.set("chargesId", transaction?.id);
          router.push(`/cash-bank/loan-accounts?${params.toString()}`);
        } else {
          toast.warning("View and Edit not available!");
        }
      },
    },
    {
      label: "Download PDF",
      icon: FaRegFilePdf,
      action: async () => {
        if (invoiceType === "Sale" || invoiceType === "Purchase") {
          printAndPdfData("pdf", setInvoiceData, transaction?.id, invoiceType);
        } else if (transaction?.type === "Sale" || transaction?.type === "Purchase") {
          printAndPdfData(
            "pdf",
            setInvoiceData,
            transaction?.type === "Sale" ? transaction?.saleId : transaction?.purchaseId,
            transaction?.type
          );
        } else {
          toast.warning("PDF generator not available in this transaction!");
        }
      },
    },
    {
      label: "Print",
      icon: TbPrinter,
      action: () => {
        if (invoiceType === "Sale" || invoiceType === "Purchase") {
          printAndPdfData("print", setInvoiceData, transaction?.id, invoiceType);
        } else if (transaction?.type === "Sale" || transaction?.type === "Purchase") {
          printAndPdfData(
            "print",
            setInvoiceData,
            transaction?.type === "Sale" ? transaction?.saleId : transaction?.purchaseId,
            transaction?.type
          );
        } else {
          toast.warning("Print not available in this transaction!");
        }
      },
    },
    {
      label: "Duplicate",
      icon: FaRegCopy,
      action: () => {},
    },
    {
      label: "Delete",
      icon: FaRegTrashAlt,
      action: async () => {
        if (transaction?.type === "Add Cash" || transaction?.type === "Reduce Cash") {
          const res = await DeleteAlert(`/api/cashadjustment/delete-transaction?id=${transaction?.id}&userId=${session?.user?.id}`, "", "Cash adjustment transaction");
          if (res) {
            refetch();
            toast.success("Transaction Deleted Successfully!");
          }
          return;
        }
        if (invoiceType === "Sale" || invoiceType === "Purchase") {
          handleSalePurchaseDelete(transaction?.id, transaction?.transactionType.toLowerCase());
        } else if (transaction?.type === "Loan Disbursement") {
          return toast.error("Cannot delete account with existing transactions. Please delete transactions first.");
        } else if (transaction?.type === "LOAN_PROCESSING_FEE") {
          return toast.error("It is not allowed to delete loan processing fee transaction. Please contact support team.");
        } else if (transaction?.type === "LOAN_PAYMENT") {
          const params = new URLSearchParams(searchParams.toString());
          DeleteAlert(`/api/loan-accounts/make-payment?accountId=${params.get("tab")}&paymentId=${transaction?.id}`).then(res => {
            if (res) {
              refetch();
              return toast.success("Transaction Deleted Successfully!");
            }
          });
        } else if (transaction?.type === "LOAN_INCREASE") {
          const params = new URLSearchParams(searchParams.toString());
          DeleteAlert(`/api/loan-accounts/take-more-loan?accountId=${params.get("tab")}&takeLoanId=${transaction?.id}`).then(res => {
            if (res) {
              refetch();
              return toast.success("Transaction Deleted Successfully!");
            }
          });
        } else if (transaction?.type === "LOAN_CHARGE") {
          const params = new URLSearchParams(searchParams.toString());
          DeleteAlert(`/api/loan-accounts/charges?accountId=${params.get("tab")}&chargeId=${transaction?.id}`).then(res => {
            if (res) {
              refetch();
              return toast.success("Transaction Deleted Successfully!");
            }
          });
        } else {
          const storeId = transaction?.type === "Sale" ? transaction?.saleId : transaction?.purchaseId;
          const storeType = transaction?.type === "Sale" ? "sale" : "purchase";
          handleSalePurchaseDelete(storeId, storeType);
        }
      },
      color: "text-red-600",
    },
  ];

  const getSizeClasses = () => {
    switch (size) {
      case "small": return "text-xs";
      case "large": return "text-base";
      default: return "text-sm";
    }
  };

  const handleClearSearch = () => {
    setFilteredTransactions(formatData(data));
    setSearchTerm("");
    if (currentPage > 1) {
      const newTotalPages = Math.ceil(formatData(data).length / itemsPerPage);
      if (currentPage > newTotalPages) setCurrentPage(1);
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
        <h1 className={`font-bold text-gray-900 ${size === "small" ? "text-2xl" : size === "large" ? "text-4xl" : "text-3xl"}`}>
          {title}
        </h1>

        {showSearch && (
          <div className={`${size === "small" ? "md:w-1/4" : "md:w-1/3"}`}>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearch}
                className={`
                  w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4
                  ${getSizeClasses()} text-gray-900 placeholder-gray-500
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
                  transition-all duration-200
                `}
              />
              {searchTerm && (
                <IoClose
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                  size={18}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table/Accordion View */}
      {!isMobile ? (
        <>
          {/* Desktop Table */}
          <div className={`hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${size === "small" ? "text-xs" : ""}`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {responsiveColumns.map((column, index) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left ${column.className || ""} ${getResponsiveHeaderClasses(column, index)}`}
                      style={column.headerStyle}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold text-gray-700 uppercase tracking-wider ${getSizeClasses()}`}>
                          {column.label}
                        </span>
                        {showFilters && column.sortable && (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title={`Sort by ${column.label}`}
                          >
                            <FaFilter size={14} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center">
                    <span className={`font-semibold text-gray-700 uppercase tracking-wider ${getSizeClasses()}`}>
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
                    columns={responsiveColumns}
                    menuItems={getMenuItems(transaction)}
                    size={size}
                    customRenderers={customRenderers}
                    isLastItem={index === currentItems.length - 1}
                    dateFormat={dateFormat}
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
                columns={orderedColumns}
                customRenderers={customRenderers}
                dateFormat={dateFormat}
              />
            ))}
          </div>
        </>
      ) : (
        // Mobile accordion view when isMobile is true
        <div className="space-y-3">
          {currentItems.map((transaction) => (
            <MobileTransactionAccordion
              key={transaction.id}
              transaction={transaction}
              menuItems={getMenuItems(transaction)}
              columns={orderedColumns}
              customRenderers={customRenderers}
              dateFormat={dateFormat}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
          <p className="text-gray-500 text-lg">No transactions found</p>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>-
              <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-semibold">{totalItems}</span> items
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