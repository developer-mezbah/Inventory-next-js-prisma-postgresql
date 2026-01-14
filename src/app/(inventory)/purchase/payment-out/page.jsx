"use client";
import TransactionsTable from "@/components/purchase/PaymentOut/TransactionsTable";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useMemo, useState } from "react";
import { BiCheck, BiChevronDown } from "react-icons/bi";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaPlus,
  FaPrint,
} from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";

// Define the component structure for the stats card
const StatsCard = ({
  title,
  amount,
  paidAmount,
  percentageChange,
  isPositive,
}) => {
  // Determine color classes based on the trend (isPositive)
  const percentColor = isPositive
    ? "bg-green-100 text-green-600"
    : "bg-red-100 text-red-600";
  const arrowIcon = isPositive ? (
    <FiArrowUpRight className="inline h-4 w-4" />
  ) : (
    <FiArrowUpRight className="inline h-4 w-4 transform rotate-180" />
  );
  // Note: The original image shows an up-right arrow for 100%, so we stick to FiArrowUpRight.
  const { currencySymbol, formatPrice } = useCurrencyStore();
  return (
    <div className="max-w-xs p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Top Section: Title and Percentage Chip */}
      <div className="flex justify-between items-start gap-4 mb-4">
        {/* Title */}
        <p className="text-sm font-medium text-gray-500">{title}</p>

        {/* Percentage Chip */}
        <div
          className={`flex flex-col items-center p-1 px-2 rounded-lg ${percentColor}`}
        >
          <div className="text-xs font-bold flex items-center">
            {percentageChange}% {arrowIcon}
          </div>
          <span className="text-[10px] text-gray-600 leading-none mt-[1px] whitespace-nowrap">
            vs last month
          </span>
        </div>
      </div>

      {/* Main Amount Display */}
      <div className="flex items-end mb-6">
        <span className="text-4xl font-extrabold text-gray-800 tracking-tight">
          {amount}
        </span>
        <span className="text-3xl font-semibold text-gray-700 ml-1">
          {currencySymbol}
        </span>
      </div>

      {/* Paid Amount Footer */}
      <div className="border-t pt-4 border-gray-100">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">Paid:</span> {paidAmount}{" "}
          {currencySymbol}
        </p>
      </div>
    </div>
  );
};

/** Calculates the start and end date for a given period key. */
const getDatesForPeriod = (key) => {
  const now = new Date();
  let fromDate = new Date();
  let toDate = new Date();

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
      // Default to a wide range or current month if 'All' is selected
      fromDate.setFullYear(now.getFullYear() - 1, 0, 1);
      toDate = new Date();
      break;
  }
  return { fromDate, toDate };
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

/**
 * Custom Dropdown for filter selection.
 */
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

/**
 * Simplified Calendar/Date Picker component to mimic the UI.
 * This is a highly simplified modal focused on UI structure.
 */
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

const cardData = {
  title: "Total Amount",
  amount: 150,
  paidAmount: 150,
  percentageChange: 100,
  isPositive: true,
};

const DocumentMenu = () => {
  const [selectedItem, setSelectedItem] = useState("Sale Invoices");

  const menuItems = [
    "Sale Invoices",
    "Estimate/Quotation",
    "Proforma Invoice",
    "Payment-In",
    "Sale Order",
    "Delivery Challan",
    "Sale Return",
    "Purchase Bills",
  ];

  return (
    <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-2 space-y-1">
        {menuItems.map((item) => {
          const isSelected = item === selectedItem;
          return (
            <div
              key={item}
              className={`flex justify-between items-center px-4 py-2 cursor-pointer rounded-lg transition-colors 
                ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              onClick={() => setSelectedItem(item)}
            >
              <span>{item}</span>
              {isSelected && <BiCheck className="h-4 w-4" />}
            </div>
          );
        })}
      </div>

      {/* Chevron down at the bottom, matching the image look */}
      <div className="flex justify-center p-2 border-t border-gray-100 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
};

// --- Main Component ---

const PaymentOut = () => {
  // State for all filters
  const [period, setPeriod] = useState("All Purchase Invoices");
  const [fromDate, setFromDate] = useState(
    getDatesForPeriod("This Month").fromDate
  );
  const [toDate, setToDate] = useState(getDatesForPeriod("This Month").toDate);
  const [firm, setFirm] = useState("ALL FIRMS");
  const [user, setUser] = useState("ALL USERS");

  // State for date picker visibility
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [topDropDown, setTopDropDown] = useState(false);

  const fromCalederRef = useOutsideClick(() => setShowFromPicker(false));
  const toCalederRef = useOutsideClick(() => setShowToPicker(false));
  const periodDropdownRef = useOutsideClick(() => setShowPeriodDropdown(false));
  const topDropDownRef = useOutsideClick(() => setTopDropDown(false));

  // Mock data for the cards (to be dynamic in a real app)
  const paidAmount = 150.0;
  const unpaidAmount = 0.0;
  const totalAmount = paidAmount + unpaidAmount;

  // Handle period selection update
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setShowPeriodDropdown(false);
    if (newPeriod !== "Custom") {
      const { fromDate, toDate } = getDatesForPeriod(newPeriod);
      setFromDate(fromDate);
      setToDate(toDate);
    }
    // If 'Custom' is selected, dates remain as they were or reset to current month's start/end
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <div className="flex relative flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
        <div ref={topDropDownRef}>
          <button
            onClick={() => setTopDropDown(!topDropDown)}
            className="text-3xl font-bold text-gray-800 mb-4 md:mb-0 flex gap-1 items-center cursor-pointer"
          >
            Payment-Out <BiChevronDown />
          </button>
          {topDropDown && (
            <div className={`absolute z-20 top-10 animate-in`}>
              <DocumentMenu />
            </div>
          )}
        </div>
        <button className="flex items-center px-6 py-2 text-md font-semibold text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition duration-300">
          <FaPlus className="mr-2" />
          Add Payment Out
        </button>
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
                  "All Purchase Invoices",
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
                  onDateSelect={setFromDate}
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
                  onDateSelect={setToDate}
                  onClose={() => setShowToPicker(false)}
                />
              )}
            </div>
          </div>

          {/* Firm Dropdown */}
          <SelectDropdown
            label="ALL FIRMS"
            options={["ALL FIRMS", "Firm A", "Firm B", "Firm C"]}
            selected={firm}
            onSelect={setFirm}
            className="w-full sm:w-32 lg:w-40"
          />

          {/* Users Dropdown */}
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

        {/* Summary Cards Section - Highly Responsive Grid */}
        <div className="flex flex-wrap sm:gap-5 gap-2 mt-6">
          <StatsCard {...cardData} />
        </div>
      </div>

      {/* Placeholder for Purchase Bills Table/List */}
      <div className="mt-4 bg-white p-6 rounded-xl shadow-md">
        <TransactionsTable />
      </div>
    </div>
  );
};

export default PaymentOut;
