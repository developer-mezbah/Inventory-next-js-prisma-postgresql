"use client";

import useDropdownPosition from "@/hook/useDropdownPosition";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiClock,
  FiEye,
  FiMoreVertical,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import MobileAccountAccordion from "./MobileAccountAccordion";

// Desktop table row component
const TransactionRow = ({ item, isAlternate, onAction }) => {
  const { currencySymbol, formatPrice } = useCurrencyStore();

  return (
    <tr
      className={`${
        isAlternate ? "bg-white" : "bg-gray-50"
      } border-b border-gray-200 hover:bg-gray-100 transition-colors`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(item.date).toLocaleDateString("en-US")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {item.paymentType}
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
          item?.amount >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {item?.amount >= 0 ? "+" : "-"}
        {Math.abs(item?.amount || 0).toFixed(2)} {currencySymbol}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <ActionDropdown item={item} onAction={onAction} />
      </td>
    </tr>
  );
};

const ActionDropdown = ({ item, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hiderBoxRef = useOutsideClick(() => setIsOpen(false));

  const buttonRef = useRef(null);

  // 2. Use the custom hook, passing the button ref
  const { position } = useDropdownPosition(buttonRef);

  return (
    <div ref={hiderBoxRef} className=" inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-200 rounded-md transition-colors"
        aria-label="Actions"
      >
        <FiMoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: position.top - 180 ?? 0,
            left: position.left - 150 ?? 0,
            border: "1px solid black",
            padding: "10px",
            zIndex: 10,
            display: position.top === null ? "none" : "block",
          }}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <button
            onClick={() => {
              onAction("view", item);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 flex items-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            View/Edit
          </button>
          <button
            onClick={() => {
              onAction("history", item);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 flex items-center gap-2"
          >
            <FiClock className="w-4 h-4" />
            View History
          </button>
          <button
            onClick={() => {
              onAction("delete", item);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default function TransactionTable({ transactions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    if (transactions) {
      setFilteredTransactions(transactions);
    }
  }, [transactions]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = transactions.filter(
      (item) =>
        (item.paymentType?.toLowerCase() || "").includes(term)
    );
    setFilteredTransactions(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...filteredTransactions].sort((a, b) => {
      if (key === "amount") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      if (key === "date") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      return direction === "asc"
        ? String(a[key] || "").localeCompare(String(b[key] || ""))
        : String(b[key] || "").localeCompare(String(a[key] || ""));
    });

    setSortConfig({ key, direction });
    setFilteredTransactions(sorted);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <FiArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <FiArrowDown className="inline w-4 h-4 ml-1" />
    );
  };

  const handleAction = (action, item) => {
    if (action === "view") {
      toast.warning("Can not view/edit this Transaction!");
    }
    if (action === "delete") {
      toast.warning("Can not delete this Transaction!");
    }
  };

  return (
    <div className="w-full mt-5">
      {/* Removed AccountInfoHeader since we don't have account prop */}
      
      {/* Header with title and search */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">Expense</h1>
        <div className="md:w-1/3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payment type..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setFilteredTransactions(transactions || []);
                  setSearchTerm("");
                }}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Date {getSortIndicator("date")}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("paymentType")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Payment Type {getSortIndicator("paymentType")}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Amount {getSortIndicator("amount")}
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item, index) => (
              <TransactionRow
                key={item.id}
                item={item}
                isAlternate={index % 2 === 0}
                onAction={handleAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.map((item) => (
          <MobileAccountAccordion
            key={item.id}
            item={item}
            onAction={handleAction}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredTransactions.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}
    </div>
  );
}