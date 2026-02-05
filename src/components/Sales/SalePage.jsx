"use client";
import Loading from "@/components/Loading";
import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { useFetchData } from "@/hook/useFetchData";
// import { useFetchData } from '@/hook/useFetchData'; // Assuming this is commented out for local use
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaPlus,
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
      toDate.setMonth(now.getMonth() + 1, 0); // Last day of the current month
      break;
    case "Last Month":
      fromDate.setMonth(now.getMonth() - 1, 1);
      toDate.setMonth(now.getMonth(), 0); // Last day of last month
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
    case "All Purchase Invoices":
    default:
      // Default to a wide range to include all data
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

// --- Custom Components (Unchanged) ---

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

    const firstDayOfMonth = new Date(year, m, 1).getDay(); // 0 for Sunday, 1 for Monday...
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

const SummaryCard = ({ title, amount, color, isTotal = false }) => (
  <div
    className={`px-4 py-3 md:px-6 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02] ${
      isTotal ? "col-span-2 md:col-span-1" : ""
    }`}
    style={{ backgroundColor: color }}
  >
    <p className="text-sm md:text-md font-medium text-gray-800">{title}</p>
    <p className="sm:text-xl text-lg md:text-2xl font-bold text-gray-900 mt-1">
      {amount}
    </p>
  </div>
);

// --- Main Component ---

const SalePage = ({accordion}) => {
  // State for all filters
  const [period, setPeriod] = useState("All Purchase Invoices");
  // Initialize date range with 'All Purchase Invoices' dates
  const initialDates = getDatesForPeriod("All Purchase Invoices");
  const [fromDate, setFromDate] = useState(initialDates.fromDate);
  const [toDate, setToDate] = useState(initialDates.toDate);
  const [firm, setFirm] = useState("ALL FIRMS");
  const [user, setUser] = useState("ALL USERS");

  const { currencySymbol, formatPrice } = useCurrencyStore();

  // Simulate data fetching (using mock data)
  const {
    isInitialLoading,
    error,
    data = [], // Renamed from 'data' to 'fetchedData' in logic to avoid conflict
    refetch,
  } = useFetchData("/api/sale-purchase", ["sale"]);
  const allSalesInvoices = data?.data || [];

  // const isInitialLoading = false;
  // const error = null;
  // Use a refetch mock if needed: const refetch = () => {};

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

  // --- Dynamic Filtering Logic ---
  const filteredBills = useMemo(() => {
    if (isInitialLoading || error) return [];

    const start = fromDate ? fromDate.getTime() : -Infinity;
    const end = toDate ? toDate.getTime() : Infinity;

    return allSalesInvoices.filter((bill) => {
      // 1. Date Filter
      const billDate = new Date(bill.billDate).getTime();
      const isDateMatch = billDate >= start && billDate <= end;
      if (!isDateMatch) return false;

      // 2. Firm (PartyName) Filter
      const isFirmMatch = firm === "ALL FIRMS" || bill.partyName === firm;
      if (!isFirmMatch) return false;

      // 3. User Filter (Assuming 'user' filter corresponds to 'companyId' for this demo, adjust as needed)
      // Since 'user' options are mock ('User 1', 'User 2'), we'll skip this filter or assume 'ALL USERS' always matches.
      const isUserMatch = user === "ALL USERS"; // Logic for other users would go here
      if (!isUserMatch) return false;

      return true;
    });
  }, [allSalesInvoices, fromDate, toDate, firm, user, isInitialLoading, error]);

  // --- Transaction Summary Calculation ---
  const { paidAmount, unpaidAmount, totalAmount } = useMemo(() => {
    let paid = 0;
    let unpaid = 0;
    let total = 0;

    filteredBills.forEach((bill) => {
      const amount = bill.amount || 0;
      total += amount;

      if (bill.isPaid) {
        paid += amount;
      } else {
        unpaid += amount;
      }
    });

    return { paidAmount: paid, unpaidAmount: unpaid, totalAmount: total };
  }, [filteredBills]);

  // --- Extract Unique Firms for Dropdown Options (Dynamic Filter Improvement) ---
  const uniqueFirms = useMemo(() => {
    const firms = new Set(
      allSalesInvoices.map((bill) => bill.partyName).filter(Boolean)
    );
    return ["ALL FIRMS", ...Array.from(firms)];
  }, [allSalesInvoices]);

  // Placeholder for `TransactionsTable` data prop.
  // The table component would use this to render the filtered list.
  const transactionsTableData = filteredBills.map((bill) => ({
    ...bill,
    transactionId: bill.transaction[0]?.transactionId,
    transactionType: bill.transaction[0]?.type,
  }));

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Sale Invoices
        </h1>
        <Link
          href="/sale-management"
          className="flex items-center px-6 py-2 text-md font-semibold text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition duration-300"
        >
          <FaPlus className="mr-2" />
          Add Sale
        </Link>
      </div>

      {/* Filter and Content Box */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl border border-gray-100">
        {/* Filter Bar - Responsive Layout */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-4 border-b border-gray-200">
          {/* Period Dropdown (e.g., This Month) */}
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
                  "All Sale Invoices",
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
            {/* From Date Picker */}
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

            {/* To Date Picker */}
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

          {/* Firm Dropdown (Now Dynamic) */}
          <SelectDropdown
            label="ALL FIRMS"
            options={uniqueFirms}
            selected={firm}
            onSelect={setFirm}
            className="w-full sm:w-32 lg:w-40"
          />

          {/* Users Dropdown (Mock/Unchanged) */}
          <SelectDropdown
            label="ALL USERS"
            options={["ALL USERS", "User 1", "User 2", "User 3"]}
            selected={user}
            onSelect={setUser}
            className="w-full sm:w-32 lg:w-40"
          />

          {/* Report Icons (Align right on desktop, or flow with filters on mobile) */}
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

        {/* Summary Cards Section - NOW DYNAMICALLY POPULATED */}
        <div className="flex flex-wrap sm:gap-5 gap-2 mt-6">
          {/* Paid Card (Green) */}
          <SummaryCard
            title="Paid"
            amount={`${currencySymbol} ${paidAmount.toFixed(2)}`}
            color="#C8F8E2" // Light Mint Green
          />

          <div className="flex items-center justify-center text-3xl font-light text-gray-500 md:flex">
            +
          </div>

          {/* Unpaid Card (Blue) */}
          <SummaryCard
            title="Unpaid"
            amount={`${currencySymbol} ${unpaidAmount.toFixed(2)}`}
            color="#D1E3F8" // Light Pastel Blue
          />

          <div className="flex items-center justify-center text-3xl font-light text-gray-500 md:flex">
            =
          </div>

          {/* Total Card (Orange - Spans 2 columns on mobile, 1 on desktop) */}
          <SummaryCard
            title="Total"
            amount={`${currencySymbol} ${totalAmount.toFixed(2)}`}
            color="#FDE8C7" // Light Pastel Orange
            isTotal={true}
          />
        </div>
      </div>

      {/* Placeholder for Sale Bills Table/List */}
      <div className="mt-8 bg-white sm:p-6 rounded-xl shadow-md">
        {/* Pass filtered data to the table component */}
        <TransactionsTable
          refetch={refetch}
          data={transactionsTableData}
          invoiceType="Sale"
          isMobile={accordion}
        />
      </div>
    </div>
  );
};

export default SalePage;
