"use client";
import Loading from "@/components/Loading";
import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { useFetchData } from "@/hook/useFetchData";
import useOutsideClick from "@/hook/useOutsideClick";
import { useMemo, useState } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";

/** Calculates the start and end date for a given period key. */
const getDatesForPeriod = (key) => {
  const now = new Date();
  let fromDate = new Date();
  let toDate = new Date();

  // Reset time to start/end of day for accurate comparison
  const resetToStartOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const resetToEndOfDay = (date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );

  switch (key) {
    case "This Month":
      fromDate.setDate(1);
      toDate.setMonth(now.getMonth() + 1, 0);
      break;
    case "Last Month":
      fromDate.setMonth(now.getMonth() - 1, 1);
      toDate.setMonth(now.getMonth(), 0);
      break;
    case "This Quarter":
      const currentMonth = now.getMonth();
      const quarterStartMonth = currentMonth - (currentMonth % 3);
      fromDate.setMonth(quarterStartMonth, 1);
      toDate.setMonth(quarterStartMonth + 3, 0);
      break;
    case "This Year":
      fromDate.setMonth(0, 1);
      toDate.setMonth(11, 31);
      break;
    case "All Transactions":
    default:
      fromDate.setFullYear(now.getFullYear() - 5, 0, 1);
      toDate = now;
      break;
  }
  return {
    fromDate: resetToStartOfDay(fromDate),
    toDate: resetToEndOfDay(toDate),
  };
};

/** Formats a Date object into DD/MM/YYYY string. */
const formatDate = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// --- Custom Components ---

const SelectDropdown = ({
  label,
  options,
  selected,
  onSelect,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectDropDownRef = useOutsideClick(() => setIsOpen(false));

  return (
    <div ref={selectDropDownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
      >
        <span className="truncate pr-1">{selected || label}</span>
        <FaChevronDown
          className={`ml-2 text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full min-w-max mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`p-3 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                selected === option ? "bg-indigo-100 font-medium" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CalendarModal = ({ currentDate, onDateSelect, onClose }) => {
  const [month, setMonth] = useState(currentDate || new Date());

  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const days = [];

    const firstDayOfMonth = new Date(year, m, 1).getDay();
    const lastDayOfMonth = new Date(year, m + 1, 0).getDate();

    // Fill in leading empty days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Fill in actual days
    for (let i = 1; i <= lastDayOfMonth; i++) {
      days.push(new Date(year, m, i));
    }

    return days;
  }, [month]);

  const goToPrevMonth = () =>
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthName = month.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="absolute top-full left-0 mt-2 z-20 p-4 bg-white border border-gray-300 rounded-xl shadow-2xl w-[250px]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 p-2 bg-indigo-100 rounded-lg">
        <button
          onClick={goToPrevMonth}
          className="p-1 rounded-full text-gray-700 hover:bg-indigo-200"
        >
          <FaChevronLeft size={14} />
        </button>
        <span className="font-semibold text-lg text-indigo-800">
          {monthName}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full text-gray-700 hover:bg-indigo-200"
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
        {dayNames.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-8"></div>;
          }
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toISOString()}
              onClick={() => {
                onDateSelect(day);
                onClose();
              }}
              className={`flex items-center justify-center h-8 text-sm rounded-lg cursor-pointer transition-colors duration-100 ${
                isToday ? "bg-yellow-300 font-bold" : "hover:bg-indigo-100"
              } ${
                currentDate && day.toDateString() === currentDate.toDateString()
                  ? "bg-blue-600 text-white shadow-md"
                  : ""
              }`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Custom renderers for TransactionsTable
const customRenderers = {
  // Custom date formatting
  date: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  },
  
  // Custom payment type badge
  paymentType: (value) => {
    if (!value || value === "N/A") return "-";
    
    const badgeColors = {
      "Cash": "bg-green-100 text-green-800",
      "Bkash": "bg-blue-100 text-blue-800",
      "Nagad": "bg-purple-100 text-purple-800",
      "Card": "bg-yellow-100 text-yellow-800",
      "Bank Transfer": "bg-indigo-100 text-indigo-800",
      "Check": "bg-pink-100 text-pink-800",
    };
    
    const colorClass = badgeColors[value] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
        {value}
      </span>
    );
  },
  
  // Custom transaction type display
  type: (value, transaction) => {
    const typeColors = {
      "Sale": "bg-blue-100 text-blue-800",
      "Purchase": "bg-purple-100 text-purple-800",
      "Expense": "bg-red-100 text-red-800",
      "Add Cash": "bg-green-100 text-green-800",
      "Opening Balance": "bg-yellow-100 text-yellow-800",
      "Reduce Cash": "bg-orange-100 text-orange-800",
    };
    
    const colorClass = typeColors[value] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
        {value}
      </span>
    );
  },
  
  // Custom amount display with sign based on transaction type
  amount: (value, transaction) => {
    const amount = parseFloat(value) || 0;
    
    // Determine if amount should be positive or negative
    let displayAmount = amount;
    let sign = "+";
    let colorClass = "text-green-600";
    
    if (transaction.type === "Purchase" || 
        transaction.type === "Expense" || 
        transaction.type === "Reduce Cash") {
      sign = "-";
      colorClass = "text-red-600";
      displayAmount = Math.abs(amount);
    }
    
    return (
      <span className={`font-semibold ${colorClass}`}>
        {sign} ${displayAmount.toFixed(2)}
      </span>
    );
  },
  
  // Custom status display
  status: (value) => {
    let statusClass = "bg-gray-100 text-gray-800";
    if (value === "Paid") statusClass = "bg-green-100 text-green-800";
    if (value === "Partially Paid") statusClass = "bg-yellow-100 text-yellow-800";
    if (value === "Unpaid") statusClass = "bg-red-100 text-red-800";
    if (value === "N/A") statusClass = "bg-gray-100 text-gray-800";
    
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
        {value}
      </span>
    );
  },
};

// Custom columns configuration for TransactionsTable
const transactionColumns = [
  {
    key: "date",
    label: "Date",
    sortable: true,
    className: "text-left w-32",
    type: "date",
    format: "DD/MM/YYYY",
  },
  {
    key: "invoiceNo",
    label: "Invoice No",
    sortable: true,
    className: "text-left w-40",
  },
  {
    key: "partyName",
    label: "Party/Description",
    sortable: true,
    className: "text-left min-w-40",
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    className: "text-center w-32",
    type: "badge",
  },
  {
    key: "paymentType",
    label: "Payment Method",
    sortable: true,
    className: "text-center w-36",
    type: "badge",
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    className: "text-right w-32 font-semibold",
    type: "currency_with_sign",
  },
  {
    key: "balanceDue",
    label: "Balance Due",
    sortable: true,
    className: "text-right w-32 font-semibold",
    type: "currency",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    className: "text-center w-28",
    type: "status",
  },
];

// Column order for responsive display
const columnOrder = [
  "type",
  "date",
  "invoiceNo", 
  "partyName",
  "paymentType",
  "amount",
  "balanceDue",
  "status"
];

// --- Main Component ---

const AllTransactionPage = ({accordion}) => {
  // State for all filters
  const [period, setPeriod] = useState("All Transactions");
  const initialDates = getDatesForPeriod("All Transactions");
  const [fromDate, setFromDate] = useState(initialDates.fromDate);
  const [toDate, setToDate] = useState(initialDates.toDate);
  const [transactionType, setTransactionType] = useState("ALL TYPES");
  const [paymentType, setPaymentType] = useState("ALL PAYMENTS");

  // Simulate data fetching
  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/reports?id=transactions", ["reports-transactions"]);
  
  // Use the provided data structure
  const allTransactions = data || [];

  // State for date picker visibility
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const fromCalederRef = useOutsideClick(() => setShowFromPicker(false));
  const toCalederRef = useOutsideClick(() => setShowToPicker(false));
  const periodDropdownRef = useOutsideClick(() => setShowPeriodDropdown(false));

  // Handle period selection update
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setShowPeriodDropdown(false);
    if (newPeriod !== "Custom") {
      const { fromDate, toDate } = getDatesForPeriod(newPeriod);
      setFromDate(fromDate);
      setToDate(toDate);
    }
  };

  // Extract unique transaction types for dropdown
  const uniqueTransactionTypes = useMemo(() => {
    const types = new Set(
      allTransactions.map((transaction) => transaction.type).filter(Boolean)
    );
    return ["ALL TYPES", ...Array.from(types)];
  }, [allTransactions]);

  // Extract unique payment types for dropdown
  const uniquePaymentTypes = useMemo(() => {
    const payments = new Set(
      allTransactions.map((transaction) => transaction.paymentType).filter(Boolean)
    );
    return ["ALL PAYMENTS", ...Array.from(payments).filter(p => p !== null)];
  }, [allTransactions]);

  // --- Format data for TransactionsTable ---
  const formatTransactionData = useMemo(() => {
    return allTransactions.map(transaction => {
      // Calculate status based on balanceDue
      const amount = Math.abs(transaction.amount) || 0;
      
      
      // Determine party name
      let partyName = transaction.name || "N/A";
      if (!partyName || partyName === "N/A") {
        // Try to extract from description or other fields
        if (transaction.description) {
          partyName = transaction.description;
        } else if (transaction.transactionId) {
          partyName = `Transaction ${transaction.transactionId.slice(-6)}`;
        }
      }
      
      // Format date
      const date = transaction.date || transaction.createdAt;
      
      // Calculate paid amount
      const paidAmount = transaction.totalAmount ? 
        (transaction.totalAmount - (transaction.balanceDue || 0)) : 
        (amount - (transaction.balanceDue || 0));
      
      return {
        id: transaction.id,
        date: date,
        invoiceNo: transaction.invoiceNo || transaction.transactionId || `TRX-${transaction.id.slice(-6)}`,
        partyName: partyName,
        partyId: transaction.partyId,
        type: transaction.type,
        paymentType: transaction.paymentType || "N/A",
        amount: Math.abs(transaction.amount) || 0,
        totalAmount: transaction.totalAmount || Math.abs(transaction.amount) || 0,
        balanceDue: transaction.balanceDue || 0,
        paidAmount: paidAmount,
        transactionId: transaction.transactionId,
        description: transaction.description || "",
        // Include original data for potential use
        originalData: transaction,
        // Fields needed for specific actions
        saleId: transaction.saleId,
        purchaseId: transaction.purchaseId,
        cashAdjustmentId: transaction.cashAdjustmentId,
      };
    });
  }, [allTransactions]);

  // --- Dynamic Filtering Logic ---
  const filteredTransactions = useMemo(() => {
    if (isInitialLoading || error) return [];

    const start = fromDate ? fromDate.getTime() : -Infinity;
    const end = toDate ? toDate.getTime() : Infinity;

    return formatTransactionData.filter((transaction) => {
      // 1. Date Filter
      const transactionDate = new Date(transaction.date).getTime();
      const isDateMatch = transactionDate >= start && transactionDate <= end;
      if (!isDateMatch) return false;

      // 2. Transaction Type Filter
      const isTypeMatch = transactionType === "ALL TYPES" || transaction.type === transactionType;
      if (!isTypeMatch) return false;

      // 3. Payment Type Filter
      const isPaymentMatch = paymentType === "ALL PAYMENTS" || 
                            (transaction.paymentType === paymentType) ||
                            (paymentType === "ALL PAYMENTS" && transaction.paymentType === "N/A");
      if (!isPaymentMatch) return false;

      return true;
    });
  }, [formatTransactionData, fromDate, toDate, transactionType, paymentType, isInitialLoading, error]);

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 font-sans">
      {/* Filter and Content Box */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl border border-gray-100">
        {/* Filter Bar - Responsive Layout */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-6">
          {/* Period Dropdown */}
          <div className="relative w-full sm:w-auto min-w-[120px]">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center justify-between w-full h-10 px-4 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-150"
            >
              <span className="truncate pr-1">{period} </span>
              <FaChevronDown
                className={`ml-2 text-xs transition-transform duration-200 ${
                  showPeriodDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {showPeriodDropdown && (
              <div
                ref={periodDropdownRef}
                className="absolute z-30 w-full min-w-max mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
              >
                {[
                  "All Transactions",
                  "This Month",
                  "Last Month",
                  "This Quarter",
                  "This Year",
                  "Custom",
                ].map((option) => (
                  <div
                    key={option}
                    onClick={() => handlePeriodChange(option)}
                    className={`p-3 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                      period === option ? "bg-indigo-100 font-medium" : ""
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-gray-500 text-sm">Between</span>
            <div ref={fromCalederRef} className="relative">
              <input
                type="text"
                value={formatDate(fromDate)}
                readOnly
                onClick={() => {
                  setShowFromPicker(!showFromPicker);
                  setShowToPicker(false);
                }}
                className="h-10 px-3 text-sm border border-gray-300 rounded-lg w-32 md:w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition duration-150"
              />
              <IoCalendarOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              {showFromPicker && (
                <CalendarModal
                  currentDate={fromDate || new Date()}
                  onDateSelect={(date) => {
                    setFromDate(date);
                    setPeriod("Custom");
                  }}
                  onClose={() => setShowFromPicker(false)}
                />
              )}
            </div>

            <span className="text-gray-500 text-sm">To</span>
            <div ref={toCalederRef} className="relative">
              <input
                type="text"
                value={formatDate(toDate)}
                readOnly
                onClick={() => {
                  setShowToPicker(!showToPicker);
                  setShowFromPicker(false);
                }}
                className="h-10 px-3 text-sm border border-gray-300 rounded-lg w-32 md:w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition duration-150"
              />
              <IoCalendarOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              {showToPicker && (
                <CalendarModal
                  currentDate={toDate || new Date()}
                  onDateSelect={(date) => {
                    setToDate(date);
                    setPeriod("Custom");
                  }}
                  onClose={() => setShowToPicker(false)}
                />
              )}
            </div>
          </div>

          {/* Transaction Type Dropdown */}
          <SelectDropdown
            label="ALL TYPES"
            options={uniqueTransactionTypes}
            selected={transactionType}
            onSelect={setTransactionType}
            className="w-full sm:w-32 lg:w-40"
          />

          {/* Payment Type Dropdown */}
          <SelectDropdown
            label="ALL PAYMENTS"
            options={uniquePaymentTypes}
            selected={paymentType}
            onSelect={setPaymentType}
            className="w-full sm:w-32 lg:w-40"
          />

          {/* Report Icons */}
          <div className="flex items-center space-x-4 ml-auto mt-2 sm:mt-0">
            <div className="text-center cursor-pointer text-gray-600 hover:text-indigo-600 transition-colors">
              <FaFileExcel size={24} className="mx-auto" />
              <span className="text-xs mt-1 block">Excel Report</span>
            </div>
            <div className="text-center cursor-pointer text-gray-600 hover:text-indigo-600 transition-colors">
              <FaPrint size={24} className="mx-auto" />
              <span className="text-xs mt-1 block">Print</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-8 bg-white sm:p-6 rounded-xl shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            All Transactions ({filteredTransactions.length})
          </h2>
          <div className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of {formatTransactionData.length} transactions
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No transactions found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <TransactionsTable
            refetch={refetch}
            data={filteredTransactions}
            invoiceType="Transaction"
            isMobile={accordion}
            // Custom configurations
            userProvidedColumns={transactionColumns}
            columnOrder={columnOrder}
            customRenderers={customRenderers}
            title=" "
            itemsPerPage={10}
            showSearch={true}
            showFilters={true}
            showPagination={true}
            size="medium"
            defaultSort={{ key: "date", direction: "desc" }}
            // Optional: Add callback for edit actions if needed
            onEditOfCash={(transaction) => {
              // Handle edit of cash transactions
              console.log("Edit cash transaction:", transaction);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AllTransactionPage;