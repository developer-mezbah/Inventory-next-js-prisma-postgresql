"use client";

import useDropdownPosition from "@/hook/useDropdownPosition";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useRef, useState } from "react";
import {
  FiChevronDown,
  FiClock,
  FiEye,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

const ActionDropdown = ({ item, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const { position } = useDropdownPosition(buttonRef);
  const hiderBoxRef = useOutsideClick(() => setIsOpen(false));

  return (
    <div ref={hiderBoxRef} className="inline-block">
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
            top: position.top - 200 ?? 0, // Use 0 as fallback or handle null/loading state
            left: position.left - 150 ?? 0,
            border: "1px solid black",
            padding: "10px",
            zIndex: 10,
            // You'll likely need to conditionally render this element
            display: position.top === null ? "none" : "block",
          }}
          className="mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
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

export default function MobileAccountAccordion({ item, onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const isCredit = item?.type == "Add Cash";
  const { currencySymbol, formatPrice } = useCurrencyStore();

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Accordion Header */}
      <button
        className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500">{item.type}</div>
          <div className="text-base font-semibold text-gray-900">
            {item.name}
          </div>
        </div>
        <FiChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ml-2 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3 animate-in fade-in-0 slide-in-from-top-2">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Date:</span>{" "}
              {new Date(item.date).toLocaleDateString("en-US")}
            </div>
            <div
              className={`text-sm font-semibold ${
                isCredit ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="font-medium text-gray-900">Amount:</span>{" "}
              {isCredit ? "+" : ""}
              {item.amount.toFixed(2)} {currencySymbol}
            </div>
            {item.description && (
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Description:</span>{" "}
                {item.description}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-2 border-t border-gray-200">
            <ActionDropdown item={item} onAction={onAction} />
          </div>
        </div>
      )}
    </div>
  );
}
