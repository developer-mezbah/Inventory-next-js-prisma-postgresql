"use client";

import { useState } from "react";
import {
  FaCopy,
  FaEdit,
  FaExchangeAlt,
  FaEye,
  FaFilePdf,
  FaHistory,
  FaPrint,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { IoMdPrint } from "react-icons/io";

import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { GrMoreVertical } from "react-icons/gr";
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

export default function TransactionRow({ transaction, isAlternate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currencySymbol, formatPrice } = useCurrencyStore();

  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const handleClick = (event) => {
    // Coordinates relative to the whole document (takes scroll into account)
    const pageX = event.pageX;
    const pageY = event.pageY;

    // Coordinates relative to the viewport (the visible part of the screen)
    const clientX = event.clientX;
    const clientY = event.clientY;

    // Update state with the coordinates
    setClickPosition({
      x: pageX, // Or clientX, depending on your need
      y: pageY, // Or clientY
    });

    console.log(`Page Coordinates: X=${pageX}, Y=${pageY}`);
    console.log(`Client (Viewport) Coordinates: X=${clientX}, Y=${clientY}`);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    handleClick(e);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  function openModal({ title, body }) {
    // This function would integrate with your modal system.
    // For demonstration, we'll just log the action.
    console.log("Modal Opened:", title, body);
  }

  // Define the menu items that will trigger the modal
  const menuItems = [
    {
      label: "View/Edit",
      icon: FaEdit,
      action: () =>
        openModal({
          title: "View/Edit Transaction",
          body: `Viewing/Editing transaction ${transaction.number}`,
        }),
    },
    {
      label: "Cancel Invoice",
      icon: FaTimes,
      action: () =>
        openModal({
          title: "Cancel Invoice",
          body: `Are you sure you want to cancel invoice ${transaction.number}? This action cannot be undone.`,
        }),
      color: "text-red-600",
    },
    {
      label: "Delete",
      icon: FaTrash,
      action: () =>
        openModal({
          title: "Delete Transaction",
          body: `Are you sure you want to delete transaction ${transaction.number}? This action is permanent.`,
        }),
      color: "text-red-600",
    },
    {
      label: "Duplicate",
      icon: FaCopy,
      action: () =>
        openModal({
          title: "Duplicate Transaction",
          body: `Duplicating transaction ${transaction.number}`,
        }),
    },
    {
      label: "Open PDF",
      icon: FaFilePdf,
      action: () =>
        openModal({
          title: "Open PDF",
          body: `Opening PDF view for transaction ${transaction.number}`,
        }),
    },
    {
      label: "Preview",
      icon: FaEye,
      action: () =>
        openModal({
          title: "Preview Transaction",
          body: `Previewing transaction details for ${transaction.number}`,
        }),
    },
    {
      label: "Print",
      icon: FaPrint,
      action: () =>
        openModal({
          title: "Print Transaction",
          body: `Preparing print view for transaction ${transaction.number}`,
        }),
    },
    {
      label: "Preview As Delivery Challan",
      icon: FaEye,
      action: () =>
        openModal({
          title: "Preview Delivery Challan",
          body: `Previewing delivery challan for ${transaction.number}`,
        }),
    },
    {
      label: "Convert To Return",
      icon: FaExchangeAlt,
      action: () =>
        openModal({
          title: "Convert to Return",
          body: `Converting transaction ${transaction.number} to a return document`,
        }),
    },
    {
      label: "View History",
      icon: FaHistory,
      action: () =>
        openModal({
          title: "Transaction History",
          body: `Viewing history logs for transaction ${transaction.number}`,
        }),
    },
  ];

  return (
    <>
      <tr
        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
          isAlternate ? "bg-white" : "bg-gray-50"
        }`}
      >
        <td className="px-6 py-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getTypeColor(
              transaction.date
            )}`}
          >
            {transaction.date}
          </span>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          {transaction.invoiceNo || "-"}
        </td>
        <td className="px-6 py-4 text-sm text-gray-700">
          {transaction.partyName}
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
          {transaction.paymentType} {currencySymbol}
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
          {transaction.amount.toFixed(2)} {currencySymbol}
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
          {transaction.balanceDue.toFixed(2)} {currencySymbol}
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <button className="rounded-xl p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200">
              <IoMdPrint />
            </button>
            <button className="rounded-xl p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200">
              <PiShareFatLight />
            </button>
            <button
              onClick={handleMenuClick}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200"
            >
              <GrMoreVertical size={18} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={handleMenuClose} />
                <div
                  className="absolute top-full z-20 mt-2 w-40 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-200"
                  style={{ top: `${clickPosition.y + 5}px` }}
                >
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
        </td>
      </tr>
    </>
  );
}
