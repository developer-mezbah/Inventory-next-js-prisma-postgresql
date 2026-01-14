"use client";

import useDropdownPosition from "@/hook/useDropdownPosition";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useRef, useState } from "react";
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
import AccountInfoHeader from "./AccountInfoHeader";
import MobileAccountAccordion from "./MobileAccountAccordion";

const TRANSACTIONS_DATA = [
  {
    id: 1,
    type: "Opening Balance",
    name: "Opening Balance",
    date: "2025-11-17",
    amount: 15000,
    description: "Initial account balance",
  },
  {
    id: 2,
    type: "Deposit",
    name: "Client Payment",
    date: "2025-11-16",
    amount: 5000,
    description: "Payment received from ABC Corp",
  },
  {
    id: 3,
    type: "Withdrawal",
    name: "Office Supplies",
    date: "2025-11-15",
    amount: -1200,
    description: "Stationery and office equipment",
  },
  {
    id: 4,
    type: "Transfer",
    name: "Bank Transfer Out",
    date: "2025-11-14",
    amount: -2500,
    description: "Transfer to savings account",
  },
  {
    id: 5,
    type: "Deposit",
    name: "Interest Credit",
    date: "2025-11-13",
    amount: 150,
    description: "Monthly interest credited",
  },
  {
    id: 6,
    type: "Withdrawal",
    name: "Vendor Payment",
    date: "2025-11-12",
    amount: -3000,
    description: "Payment to vendor XYZ Ltd",
  },
  {
    id: 7,
    type: "Deposit",
    name: "Refund Received",
    date: "2025-11-11",
    amount: 800,
    description: "Refund for returned goods",
  },
];

// Desktop table row component
const TransactionRow = ({ item, isAlternate, onAction }) => {
  const isCredit = item.amount > 0;
  const { currencySymbol, formatPrice } = useCurrencyStore();

  return (
    <tr
      className={`${
        isAlternate ? "bg-white" : "bg-gray-50"
      } border-b border-gray-200 hover:bg-gray-100 transition-colors`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {item.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {item.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(item.date).toLocaleDateString("en-US")}
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
          isCredit ? "text-green-600" : "text-red-600"
        }`}
      >
        {isCredit ? "+" : ""}
        {item.amount.toFixed(2)} {currencySymbol}
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
            position: "fixed", // Required for top/left to work
            top: position.top - 180 ?? 0, // Use 0 as fallback or handle null/loading state
            left: position.left - 150 ?? 0,
            border: "1px solid black",
            padding: "10px",
            zIndex: 10,
            // You'll likely need to conditionally render this element
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

export default function TransactionTable({
  account = {
    accountnumber: "324234",
    IFSCCode: null,
    UPIID: null,
    BankName: "Bkash",
    AccountHolderName: "Office Administrator",
  },
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filteredTransactions, setFilteredTransactions] =
    useState(TRANSACTIONS_DATA);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = TRANSACTIONS_DATA.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
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
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
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
    console.log(`Action: ${action}`, item);
  };

  return (
    <div className="w-full">
      <AccountInfoHeader account={account} />

      {/* Header with title and search */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="md:w-1/3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setFilteredTransactions(TRANSACTIONS_DATA);
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
                  onClick={() => handleSort("type")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Type {getSortIndicator("type")}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Name {getSortIndicator("name")}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Date {getSortIndicator("date")}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </span>
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
