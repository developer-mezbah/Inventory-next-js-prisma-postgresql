"use client";

import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { FaCopy, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { GrMoreVertical } from "react-icons/gr";
import { IoMdPrint } from "react-icons/io";
import { PiShareFatLight } from "react-icons/pi";

function getTypeColor(type) {
  const colors = {
    Sale: "bg-green-100 text-green-800",
    "Purchase Order": "bg-blue-100 text-blue-800",
    "Debit Note": "bg-orange-100 text-orange-800",
    Refund: "bg-purple-100 text-purple-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export default function MobileTransactionAccordion({ transaction }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { currencySymbol, formatPrice } = useCurrencyStore();

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    {
      label: "View",
      icon: FaEye,
      action: () => console.log("View", transaction),
    },
    {
      label: "Edit",
      icon: FaEdit,
      action: () => console.log("Edit", transaction),
    },
    {
      label: "Duplicate",
      icon: FaCopy,
      action: () => console.log("Duplicate", transaction),
    },
    {
      label: "Delete",
      icon: FaTrash,
      action: () => console.log("Delete", transaction),
      color: "text-red-600",
    },
  ];

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
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getTypeColor(
                  transaction.type
                )}`}
              >
                {transaction.partyName}
              </span>
              <span className="text-sm font-medium text-gray-900">
                #{transaction.invoiceNo || "N/A"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{transaction.date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {transaction.amount.toFixed(2)} {currencySymbol}
          </p>
          <p className="text-xs text-gray-500">
            {transaction.balanceDue.toFixed(2)} {currencySymbol}
          </p>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 animate-in fade-in duration-200">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Date
              </span>
              <span className="text-sm font-medium text-gray-900">
                {transaction.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Invoice NO.
              </span>
              <span className="text-sm font-medium text-gray-900">
                {transaction.invoiceNo || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Party Name
              </span>
              <span className="text-sm font-medium text-gray-900">
                {transaction.partyName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Payment Type
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {transaction.paymentType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Amount
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {transaction.amount.toFixed(2)} {currencySymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Balance Due
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {transaction.balanceDue.toFixed(2)} {currencySymbol}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex justify-center items-center gap-2">
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center">
              <IoMdPrint />
            </button>
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center">
              <PiShareFatLight />
            </button>
            <button
              onClick={handleMenuClick}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
            >
              <GrMoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={handleMenuClose} />
                <div className="absolute left-0 right-0 z-20 w-full rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-200 -mt-20">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setIsMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-100 transition-colors ${
                          index !== menuItems.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        } ${item.color || "text-gray-700"}`}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
