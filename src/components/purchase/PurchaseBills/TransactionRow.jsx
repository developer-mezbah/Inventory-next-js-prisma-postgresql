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

import { generatePDF } from "@/lib/pdf-generator";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import client_api from "@/utils/API_FETCH";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { useRouter } from "next/navigation";
import { GrMoreVertical } from "react-icons/gr";
import { PiShareFatLight } from "react-icons/pi";
import { toast } from "react-toastify";

function getTypeColor(type) {
  const colors = {
    Sale: "bg-green-100 text-green-800",
    "Purchase Order": "bg-blue-100 text-blue-800",
    "Debit Note": "bg-orange-100 text-orange-800",
    Refund: "bg-purple-100 text-purple-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export default function TransactionRow({
  transaction,
  isAlternate,
  setInvoiceData,
  invoiceType,
  refetch,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currencySymbol, formatPrice } = useCurrencyStore();

  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
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

    // console.log(`Page Coordinates: X=${pageX}, Y=${pageY}`);
    // console.log(`Client (Viewport) Coordinates: X=${clientX}, Y=${clientY}`);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    handleClick(e);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=1200");
    const invoiceElement = document.querySelector("[data-invoice-preview]");
    if (invoiceElement) {
      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((el) => el.outerHTML)
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${styles}
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
              body {
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 10mm;
                margin: 0;
                line-height: 1.4;
                color: #1f2937;
              }
              @page {
                size: A4;
                margin: 0;
              }
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                html, body {
                  width: 210mm;
                  height: auto;
                  margin: 0;
                  padding: 0;
                }
                body {
                  margin: 0;
                  padding: 10mm;
                  background: white;
                }
                [data-invoice-preview] {
                  width: 100%;
                  max-width: 100%;
                  margin: 0;
                  padding: 0;
                  box-shadow: none;
                  page-break-after: avoid;
                }
              }
              [data-invoice-preview] {
                width: 100%;
                overflow: visible;
              }
              /* Prevent page breaks in critical sections */
              .invoice-section {
                page-break-inside: avoid;
              }
              /* Ensure table fits without splitting */
              table {
                width: 100%;
              }
              tr {
                page-break-inside: avoid;
              }
              /* Reduce padding for print */
              @media print {
                [data-invoice-preview] div {
                  margin-bottom: 8px !important;
                }
                p, span, td, th {
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
            </style>
          </head>
          <body>
            ${invoiceElement.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  function printData(printType) {
    client_api
      .get(
        `/api/print-data?id=${transaction?.id}&type=${
          invoiceType === "Sale" ? "Sale" : "Purchase"
        }`
      )
      .then(async (res) => {
        if (res?.status) {
          const storePrintData = {
            companyName: res?.printData?.company?.name || "My Company",
            phone: res?.printData?.company?.phoneNumber || "18XXXXXXXX",
            email: res?.printData?.company?.emailId || "info@mycompany.com",
            address:
              res?.printData?.company?.businessAddress || "123 Business Street",
            logoUrl:
              res?.printData?.company?.logoUrl || "/generic-company-logo.png",
            signatureUrl: res?.printData?.company?.signatureUrl,
            invoiceNumber: "1",
            date: new Date().toISOString().split("T")[0],
            dueDate: "",
            billTo: res?.printData?.partyName || "Sakib",
            billToEmail: res?.printData?.phoneNumber || "client@example.com",
            paymentMethod: res?.printData?.paymentType,
            items: res?.printData?.invoiceData.map((item, index) => ({
              id: index + 1,
              description: item.itemName,
              quantity: item.qty,
              rate: item.unitPrice,
              amount: item.price,
            })),
            totalAmount: res?.printData?.amount,
            paidAmount: res?.printData?.paidAmount,
            tax: res?.printData?.tax,
            discount: res?.printData?.discount,
            isPaid: res?.printData?.isPaid,
            balanceDue: res?.printData?.balanceDue,
            notes: "Thanks for doing business with us!",
            termsAndConditions: "Payment due within 30 days",
          };
          setInvoiceData(storePrintData);
          printType === "pdf"
            ? await generatePDF(storePrintData)
            : setTimeout(() => {
                handlePrint();
              }, 400);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function openModal({ title, body }) {
    // This function would integrate with your modal system.
    // For demonstration, we'll just log the action.
    // console.log("Modal Opened:", title, body);

    if (title === "Print Transaction") {
      printData();
    }
    if (title === "Download PDF") {
      printData("pdf");
    }
    if (title === "View/Edit Transaction") {
      router.push(
        `/update-sale-purchase?id=${transaction?.id}&type=${
          transaction?.transactionType === "Sale" ? "Sale" : "Purchase"
        }&partyId=${transaction?.partyId}`
      );
    }
    if (title === "Delete Transaction") {
      DeleteAlert(
        `/api/sale-purchase/delete?id=${transaction?.id}&mode=${
          transaction?.transactionType === "Sale" ? "sale" : "purchase"
        }`
      ).then((res) => {
        if (res) {
          refetch();
          toast.success("Transaction Deleted Successfully!");
        }
      });
    }
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
      label: "Download PDF",
      icon: FaFilePdf,
      action: () =>
        openModal({
          title: "Download PDF",
          body: `Download PDF view for transaction ${transaction.number}`,
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
            <button
              onClick={printData}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-200 transition-all duration-200"
            >
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
