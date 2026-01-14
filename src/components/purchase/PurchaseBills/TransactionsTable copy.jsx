"use client";

import InvoicePreview from "@/components/invoice-preview";
import { useEffect, useState } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

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
import { BiChevronDown } from "react-icons/bi";
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

function MobileTransactionAccordion({ transaction }) {
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

function TransactionRow({
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

export default function TransactionsTable({ data = [], invoiceType, refetch }) {
  /** Convert incoming props to your old structure */
  const formatData = (items) => {
    return items.map((item) => ({
      id: item.id,
      date: item.billDate,
      invoiceNo: item.transactionId,
      partyName: item.partyName,
      partyId: item.partyId,
      paymentType: item.paymentType,
      amount: item.amount,
      transactionType: item.transactionType,
      balanceDue: item.isPaid ? 0 : item.balanceDue,
    }));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    companyName: "My Company",
    phone: "18070707707",
    email: "info@mycompany.com",
    address: "123 Business Street",
    logoUrl: "/generic-company-logo.png",
    invoiceNumber: "1",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    billTo: "buyer Name",
    billToEmail: "client@example.com",
    items: [
      {
        id: 1,
        description: "Product/Service",
        quantity: 1,
        rate: 100,
        amount: 100,
      },
    ],
    notes: "Thanks for doing business with us!",
    termsAndConditions: "Payment due within 30 days",
  });

  // Load formatted props on mount/update
  useEffect(() => {
    setFilteredTransactions(formatData(data));
  }, [data]);

  /** SEARCH */
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const original = formatData(data);

    const filtered = original.filter(
      (t) =>
        t.partyName.toLowerCase().includes(term) ||
        t.invoiceNo.toLowerCase().includes(term) ||
        t.date.includes(term) ||
        t.paymentType.toLowerCase().includes(term)
    );

    setFilteredTransactions(filtered);
  };

  /** SORT */
  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...filteredTransactions].sort((a, b) => {
      if (key === "amount" || key === "balanceDue") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      return direction === "asc"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });

    setSortConfig({ key, direction });
    setFilteredTransactions(sorted);
  };

  return (
    <div className="w-full p-4">
      {/* Header */}
      {invoiceData && (
        <div
          className="bg-white hidden overflow-auto max-h-[800px] print:p-0 print:max-h-none"
          data-invoice-preview
        >
          <InvoicePreview data={invoiceData} />
        </div>
      )}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">TRANSACTIONS</h1>

        <div className="md:w-1/3">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by party, invoice, date, or payment type..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchTerm && (
              <IoClose
                onClick={() => {
                  setFilteredTransactions(formatData(data));
                  setSearchTerm("");
                }}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                size={18}
              />
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </span>
                  <button
                    onClick={() => handleSort("date")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaFilter size={16} />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Invoice NO.
                  </span>
                  <button
                    onClick={() => handleSort("invoiceNo")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaFilter size={16} />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Party Name
                  </span>
                  <button
                    onClick={() => handleSort("partyName")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaFilter size={16} />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Type
                  </span>
                  <button
                    onClick={() => handleSort("paymentType")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaFilter size={16} />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </span>
                  <button
                    onClick={() => handleSort("amount")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaFilter size={16} />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Balance Due
                  </span>
                  <button
                    onClick={() => handleSort("balanceDue")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaFilter size={16} />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-center">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <TransactionRow
                refetch={refetch}
                invoiceType={invoiceType}
                setInvoiceData={setInvoiceData}
                key={transaction.id}
                transaction={transaction}
                isAlternate={index % 2 === 0}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.map((transaction) => (
          <MobileTransactionAccordion
            key={transaction.id}
            transaction={transaction}
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
