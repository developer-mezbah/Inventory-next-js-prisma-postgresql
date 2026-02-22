"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaPlus,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaPrint,
  FaEye,
  FaTrash,
  FaEdit,
  FaFileInvoice,
  FaHistory,
  FaChartLine
} from 'react-icons/fa';
import { IoCalendarOutline, IoBusinessOutline, IoCashOutline } from 'react-icons/io5';
import { GiReceiveMoney, GiPayMoney } from 'react-icons/gi';
import { MdAccountBalance, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { TbReportMoney } from 'react-icons/tb';
import { BsBank, BsGraphUp } from 'react-icons/bs';
import { FiSearch, FiX, FiFilter, FiRefreshCw, FiDownload, FiUpload } from 'react-icons/fi';
import Loading from "@/components/Loading";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useFetchData } from '@/hook/useFetchData';

// Date utility functions
const getDatesForPeriod = (key) => {
  const now = new Date();
  let fromDate = new Date();
  let toDate = new Date();

  const resetToStartOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const resetToEndOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

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
    case "All Loans":
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

const formatDate = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Custom Components
const SelectDropdown = ({ label, options, selected, onSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
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
        <div className="absolute z-50 w-full min-w-max mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDayOfMonth; i++) {
      days.push(new Date(year, m, i));
    }
    return days;
  }, [month]);

  const goToPrevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const goToNextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthName = month.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-white border border-gray-300 rounded-xl shadow-2xl w-[250px]">
      <div className="flex items-center justify-between mb-4 p-2 bg-indigo-100 rounded-lg">
        <button onClick={goToPrevMonth} className="p-1 rounded-full text-gray-700 hover:bg-indigo-200">
          <FaChevronLeft size={14} />
        </button>
        <span className="font-semibold text-lg text-indigo-800">{monthName}</span>
        <button onClick={goToNextMonth} className="p-1 rounded-full text-gray-700 hover:bg-indigo-200">
          <FaChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
        {dayNames.map((day) => (<span key={day}>{day}</span>))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="h-8"></div>;
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div
              key={day.toISOString()}
              onClick={() => { onDateSelect(day); onClose(); }}
              className={`flex items-center justify-center h-8 text-sm rounded-lg cursor-pointer transition-colors 
                ${isToday ? "bg-yellow-300 font-bold" : "hover:bg-indigo-100"}
                ${currentDate && day.toDateString() === currentDate.toDateString() ? "bg-blue-600 text-white shadow-md" : ""}`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, amount, icon: Icon, color, bgColor, subtitle }) => (
  <div className={`${bgColor} rounded-xl p-6 shadow-lg border border-gray-100 transition-transform hover:scale-[1.02]`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-2">{amount}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const LoanCard = ({ loan, onView, onDelete, currencySymbol, formatPrice }) => {
  const status = loan.currentBalance > 0 ? 'active' : 'paid';
  const statusColors = {
    active: 'bg-blue-100 text-blue-700 border-blue-200',
    paid: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${status === 'active' ? 'bg-blue-100' : 'bg-green-100'}`}>
              {status === 'active' ? 
                <GiReceiveMoney className="h-5 w-5 text-blue-600" /> : 
                <GiPayMoney className="h-5 w-5 text-green-600" />
              }
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{loan.accountName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <BsBank className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">{loan.lenderBank || 'No Bank'}</span>
              </div>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[status]}`}>
            {status === 'active' ? 'Active' : 'Paid'}
          </span>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Current Balance</p>
          <p className="text-xl font-bold text-gray-800">
            {formatPrice(loan.currentBalance || 0)}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Interest Rate</p>
            <p className="font-medium text-gray-700">{loan.interestRate || 0}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Account No.</p>
            <p className="font-medium text-gray-700 truncate">{loan.accountNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(loan.id)}
            className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
          >
            <FaEye className="h-3 w-3" />
            <span>View</span>
          </button>
          <button
            onClick={() => onDelete(loan.id)}
            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FaTrash className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const LoanAccounts = ({ isMobile = false, accordion = true }) => {
  const router = useRouter();
  const { currencySymbol, formatPrice } = useCurrencyStore();
  
  // Filter states
  const [period, setPeriod] = useState("All Loans");
  const initialDates = getDatesForPeriod("All Loans");
  const [fromDate, setFromDate] = useState(initialDates.fromDate);
  const [toDate, setToDate] = useState(initialDates.toDate);
  const [status, setStatus] = useState("ALL");
  const [lender, setLender] = useState("ALL BANKS");
  const [searchTerm, setSearchTerm] = useState("");

   const {
      isInitialLoading,
      error,
      data = [],
      refetch,
    } = useFetchData("/api/reports?id=summary", ["reports-loan"]);
  console.log(data)

  // UI states
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const itemsPerPage = isMobile ? 5 : 10;

  // Refs
  const fromCalederRef = useOutsideClick(() => setShowFromPicker(false));
  const toCalederRef = useOutsideClick(() => setShowToPicker(false));
  const periodDropdownRef = useOutsideClick(() => setShowPeriodDropdown(false));

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setShowPeriodDropdown(false);
    if (newPeriod !== "Custom") {
      const { fromDate, toDate } = getDatesForPeriod(newPeriod);
      setFromDate(fromDate);
      setToDate(toDate);
    }
  };

  // Filter loans
  const filteredLoans = useMemo(() => {
    if (loading) return [];

    const start = fromDate ? fromDate.getTime() : -Infinity;
    const end = toDate ? toDate.getTime() : Infinity;

    return loans.filter(loan => {
      // Date filter
      const loanDate = loan.balanceAsOfDate ? new Date(loan.balanceAsOfDate).getTime() : Date.now();
      if (loanDate < start || loanDate > end) return false;

      // Status filter
      if (status !== "ALL") {
        if (status === "ACTIVE" && loan.currentBalance <= 0) return false;
        if (status === "PAID" && loan.currentBalance > 0) return false;
      }

      // Lender filter
      if (lender !== "ALL BANKS" && loan.lenderBank !== lender) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          loan.accountName?.toLowerCase().includes(searchLower) ||
          loan.lenderBank?.toLowerCase().includes(searchLower) ||
          loan.accountNumber?.includes(searchTerm) ||
          loan.description?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [loans, fromDate, toDate, status, lender, searchTerm, loading]);

  // Calculate summary
  const summary = useMemo(() => {
    const activeLoans = filteredLoans.filter(l => l.currentBalance > 0);
    return {
      totalLoans: filteredLoans.length,
      activeLoans: activeLoans.length,
      totalOutstanding: filteredLoans.reduce((sum, loan) => sum + (loan.currentBalance || 0), 0),
      totalInterest: filteredLoans.reduce((sum, loan) => sum + (loan.interestRate || 0), 0) / (filteredLoans.length || 1),
      totalProcessingFees: filteredLoans.reduce((sum, loan) => sum + (loan.processingFee || 0), 0),
    };
  }, [filteredLoans]);

  // Get unique lenders
  const uniqueLenders = useMemo(() => {
    const lenders = new Set(loans.map(loan => loan.lenderBank).filter(Boolean));
    return ["ALL BANKS", ...Array.from(lenders)];
  }, [loans]);

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle view loan
  const handleViewLoan = async (loanId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/loan-accounts?id=${loanId}`);
      const data = await response.json();
      setSelectedLoan(data);
      setViewMode('details');
      if (isMobile) {
        // In mobile, we'll show details view
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteLoan = async (loanId) => {
    if (!confirm('Are you sure you want to delete this loan account?')) return;
    try {
      const response = await fetch(`/api/loan-accounts?id=${loanId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchLoans();
        if (selectedLoan?.id === loanId) {
          setSelectedLoan(null);
          setViewMode('list');
        }
      }
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  if (loading) return <Loading />;

  // Mobile Details View
  if (isMobile && viewMode === 'details' && selectedLoan) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setViewMode('list')} className="p-2 hover:bg-gray-100 rounded-full">
            <FaChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-lg">Loan Details</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <MdAccountBalance className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedLoan.accountName}</h3>
                <p className="text-blue-100">{selectedLoan.lenderBank || 'No Bank'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-xs">Account Number</p>
                <p className="font-medium text-sm">{selectedLoan.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">As of Date</p>
                <p className="font-medium text-sm">{formatDate(new Date(selectedLoan.balanceAsOfDate))}</p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-gray-600 text-sm mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-gray-800">
              {formatPrice(selectedLoan.currentBalance)}
            </p>
            {selectedLoan.openingBalance > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Opening: {formatPrice(selectedLoan.openingBalance)}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h4 className="font-medium text-gray-800 mb-4">Loan Information</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-semibold text-gray-800">
                  {selectedLoan.interestRate ? `${selectedLoan.interestRate}% p.a.` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Term Duration</span>
                <span className="font-semibold text-gray-800">
                  {selectedLoan.termDurationMonths ? `${selectedLoan.termDurationMonths} months` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-semibold text-gray-800">
                  {formatPrice(selectedLoan.processingFee)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid From</span>
                <span className="font-semibold text-gray-800">
                  {selectedLoan.processingFeePaidFrom || 'Cash'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedLoan.description && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h4 className="font-medium text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600">{selectedLoan.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleDeleteLoan(selectedLoan.id)}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Delete Loan
            </button>
            <Link
              href={`/transactions?loanId=${selectedLoan.id}`}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-center"
            >
              View Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mobile List View
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800">Loan Accounts</h1>
            <Link
              href="/loans/add"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              <FaPlus className="mr-2 h-3 w-3" />
              Add Loan
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <FiX className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="p-2 bg-gray-100 rounded-lg"
            >
              <FiFilter className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Quick Filters */}
          {showPeriodDropdown && (
            <div className="mt-3 p-3 bg-white rounded-lg shadow-lg border">
              <div className="space-y-2">
                <button
                  onClick={() => { setStatus('ALL'); setShowPeriodDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${status === 'ALL' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  All Loans
                </button>
                <button
                  onClick={() => { setStatus('ACTIVE'); setShowPeriodDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${status === 'ACTIVE' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  Active Loans
                </button>
                <button
                  onClick={() => { setStatus('PAID'); setShowPeriodDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${status === 'PAID' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  Paid Loans
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Chips */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          <div className="bg-blue-100 rounded-lg px-3 py-2 flex-shrink-0">
            <p className="text-xs text-blue-600">Outstanding</p>
            <p className="text-sm font-bold text-blue-800">{formatPrice(summary.totalOutstanding)}</p>
          </div>
          <div className="bg-green-100 rounded-lg px-3 py-2 flex-shrink-0">
            <p className="text-xs text-green-600">Active Loans</p>
            <p className="text-sm font-bold text-green-800">{summary.activeLoans}</p>
          </div>
          <div className="bg-purple-100 rounded-lg px-3 py-2 flex-shrink-0">
            <p className="text-xs text-purple-600">Avg Interest</p>
            <p className="text-sm font-bold text-purple-800">{summary.totalInterest.toFixed(1)}%</p>
          </div>
        </div>

        {/* Loans List */}
        <div className="flex-1 overflow-auto px-4 pb-4">
          {paginatedLoans.length > 0 ? (
            <div className="space-y-3">
              {paginatedLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onView={handleViewLoan}
                  onDelete={handleDeleteLoan}
                  currencySymbol={currencySymbol}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MdAccountBalance className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No loans found</p>
              <Link
                href="/loans/add"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Add Your First Loan
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-50"
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-50"
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Loan Accounts</h1>
          <p className="text-gray-600 mt-1">Manage and track all your loans</p>
        </div>
        <Link
          href="/loans/add"
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0"
        >
          <FaPlus className="mr-2" />
          Add New Loan
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Filter Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Dropdown */}
            <div className="relative w-48">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center justify-between w-full h-10 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span>{period}</span>
                <FaChevronDown className={`ml-2 text-xs transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showPeriodDropdown && (
                <div ref={periodDropdownRef} className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-xl">
                  {["All Loans", "This Month", "Last Month", "This Quarter", "This Year", "Custom"].map(option => (
                    <div
                      key={option}
                      onClick={() => handlePeriodChange(option)}
                      className={`p-3 text-sm cursor-pointer hover:bg-indigo-50 ${period === option ? 'bg-indigo-100 font-medium' : ''}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">From</span>
              <div ref={fromCalederRef} className="relative">
                <input
                  type="text"
                  value={formatDate(fromDate)}
                  readOnly
                  onClick={() => setShowFromPicker(true)}
                  className="h-10 px-3 text-sm border rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <IoCalendarOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {showFromPicker && (
                  <CalendarModal
                    currentDate={fromDate}
                    onDateSelect={(date) => { setFromDate(date); setPeriod("Custom"); }}
                    onClose={() => setShowFromPicker(false)}
                  />
                )}
              </div>

              <span className="text-sm text-gray-500">To</span>
              <div ref={toCalederRef} className="relative">
                <input
                  type="text"
                  value={formatDate(toDate)}
                  readOnly
                  onClick={() => setShowToPicker(true)}
                  className="h-10 px-3 text-sm border rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <IoCalendarOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {showToPicker && (
                  <CalendarModal
                    currentDate={toDate}
                    onDateSelect={(date) => { setToDate(date); setPeriod("Custom"); }}
                    onClose={() => setShowToPicker(false)}
                  />
                )}
              </div>
            </div>

            {/* Status Dropdown */}
            <SelectDropdown
              label="Status"
              options={["ALL", "ACTIVE", "PAID"]}
              selected={status}
              onSelect={setStatus}
              className="w-32"
            />

            {/* Lender Dropdown */}
            <SelectDropdown
              label="Lender"
              options={uniqueLenders}
              selected={lender}
              onSelect={setLender}
              className="w-40"
            />

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={fetchLoans} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Refresh">
                <FiRefreshCw className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Export to Excel">
                <FaFileExcel className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Print">
                <FaPrint className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Loans"
            amount={summary.totalLoans}
            icon={MdAccountBalance}
            color="bg-blue-600"
            bgColor="bg-blue-50"
          />
          <SummaryCard
            title="Active Loans"
            amount={summary.activeLoans}
            icon={GiReceiveMoney}
            color="bg-green-600"
            bgColor="bg-green-50"
            subtitle={`${((summary.activeLoans / summary.totalLoans) * 100 || 0).toFixed(1)}% of total`}
          />
          <SummaryCard
            title="Total Outstanding"
            amount={formatPrice(summary.totalOutstanding)}
            icon={TbReportMoney}
            color="bg-purple-600"
            bgColor="bg-purple-50"
          />
          <SummaryCard
            title="Avg Interest Rate"
            amount={`${summary.totalInterest.toFixed(2)}%`}
            icon={BsGraphUp}
            color="bg-orange-600"
            bgColor="bg-orange-50"
            subtitle={`Total Fees: ${formatPrice(summary.totalProcessingFees)}`}
          />
        </div>

        {/* Loans Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank/Account No</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Fee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${loan.currentBalance > 0 ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {loan.currentBalance > 0 ? 
                          <GiReceiveMoney className="h-4 w-4 text-blue-600" /> : 
                          <GiPayMoney className="h-4 w-4 text-green-600" />
                        }
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{loan.accountName}</div>
                        {loan.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{loan.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-800">{loan.lenderBank || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{loan.accountNumber || 'No account'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${loan.currentBalance > 0 ? 'text-gray-800' : 'text-green-600'}`}>
                      {formatPrice(loan.currentBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {loan.interestRate || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {loan.termDurationMonths ? `${loan.termDurationMonths}m` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {formatPrice(loan.processingFee)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewLoan(loan.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/transactions?loanId=${loan.id}`}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="View Transactions"
                      >
                        <FaHistory className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLoans.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLoans.length)} of {filteredLoans.length} loans
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanAccounts;