"use client";

import Loading from "@/components/Loading";
import { useFetchData } from "@/hook/useFetchData";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiLoader } from "react-icons/bi";
import { FiPrinter, FiSave, FiShare2 } from "react-icons/fi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { toast } from "react-toastify";
import ItemsTable from "./ItemsTable";
import ExpenceCSelector from "./ExpenceCSelector";
import PaymentSection from "./PaymentSection";
import { useCurrencyStore } from "@/stores/useCurrencyStore";

function generateUniqueId() {
  // Check for the availability of the modern Crypto API
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // Fallback for very old or non-standard environments (less secure/unique)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

export default function ExpenceForm({
  onUpdate,
  isSubmitting,
  mode,
  initData,
}) {
  const [selectedECategory, setSelectedECategory] = useState(null);
   const { currencySymbol, formatPrice } = useCurrencyStore();
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newECategory, setNewExpenceCategory] = useState(null);
  const [items, setItems] = useState(
    [
      {
        id: 1762926852456,
        item: "",
        qty: 1,
        price: 0,
        amount: 0,
      },
    ]
  );

  const [paymentType, setPaymentType] = useState("Cash");

  useEffect(() => {
    if (mode === "update" && initData?.expense) {
      // Set all initial values from initData
      setItems(
        initData.expense.items.map((item) => ({
          id: item?.id || "",
          itemId: item?.id || "",
          item: item?.itemName || " ",
          qty:
            initData?.expense.invoiceData.find((newItem) => newItem?.itemId === item?.id)
              ?.qty || 1,
          price:
            initData.expense.invoiceData.find((newItem) => newItem?.itemId === item?.id)
              ?.price || 0,
          amount:
            initData.expense.invoiceData.find((newItem) => newItem?.itemId === item?.id)
              ?.price || 0,
        }))
      );

      setPaymentType(
        initData.expense.paymentType === "Cash"
          ? "Cash"
          : {
            id: initData.expense.paymentTypeId,
            accountdisplayname: initData.expense.paymentType,
          }
      );
      setSelectedECategory({ ...initData.category, name: initData.category?.name });
      setBillNumber(initData.expense.billNumber || "");
      setBillDate(initData.expense.billDate || "");

      // Set payment amounts from initData
      const initialPaidAmount = initData.expense.paidAmount || 0;
    }
  }, [mode, initData]);

  const {
    isInitialLoading,
    error,
    data = {},
    refetch,
  } = useFetchData("/api/expense/init-data", ["expence-init-data"]);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: generateUniqueId(),
        item: "",
        qty: 1,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        const price = Number(updated.price) || 0;
        const qty = Number(updated.qty) || 0;
        const amount = Number(updated.amount) || 0;

        // If user edits QTY → recalc amount
        if (field === "qty") {
          updated.amount = qty * price;
        }

        // If user edits PRICE → recalc amount
        if (field === "price") {
          updated.amount = qty * price;
        }

        // If user edits AMOUNT → recalc price (NOT qty)
        if (field === "amount") {
          updated.price = qty ? amount / qty : 0;
        }
        return updated;
      })
    );
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // 1. Check if at least one item is present
    if (items.length === 0) {
      return toast.error("At least one item should be included.");
    }
    // 2. Validate each item and exit on the first error
    for (let i = 0; i < items.length; i++) {
      const checkItem = items[i];

      // Validation 1: Check for Item Name
      if (!checkItem.item) {
        return toast.error(`Item name must be required in row no: ${i + 1}`);
      }

      // Validation 2: Check for Item Price (must be a positive number)
      // We check for falsy values (null, undefined, 0, '') OR if it's not a positive number
      if (!checkItem.price || Number(checkItem.price) <= 0) {
        return toast.error(
          `Item price must be greater than zero in row no: ${i + 1}`
        );
      }
    }
    // 3. If all validation passes, proceed with saving/updating
    onUpdate({
      items,
      total: calculateTotal(),
      selectedParty: selectedECategory,
      newCategory: newECategory,
      billNumber,
      billDate,
      paymentType: paymentType,
    });
  };

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* All Modals */}
      {/* Header Actions */}
      <div className="border-b border-gray-200 p-4 sm:p-6 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Expence Details
        </h2>
        <div className="flex flex-wrap gap-2">
          {mode === "update" && (
            <Link
              href="/sales/sale-invoices"
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl`}
            >
              <RiArrowGoBackLine />
            </Link>
          )}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print"
          >
            <FiPrinter className="w-5 h-5 text-gray-600" />
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleSave}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            title="Save"
          >
            {isSubmitting ? (
              <BiLoader />
            ) : (
              <FiSave className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Search and Date Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ExpenceCSelector
            setSelectedExpenceC={setSelectedECategory}
            setNewECategory={setNewExpenceCategory}
            expenceCData={data?.expenceCategory || []}
            selectedECategory={selectedECategory}
            onSelect={setSelectedECategory}
            refetch={refetch}
          />
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Bill Number
            </label>
            <input
              type="number"
              placeholder="Bill Number"
              value={billNumber}
              onChange={(e) => setBillNumber(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
           <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Bill Date
            </label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

      

        {/* Items Table */}
        <ItemsTable
          items={items}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          itemData={data?.item || []}
          refetch={refetch}
          autoAddItem={setItems}
        />

        {/* Totals and Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <PaymentSection
              refetch={refetch}
              bankData={data?.bank || []}
              cashData={data?.cash || []}
              paymentType={paymentType}
              onPaymentTypeChange={setPaymentType}
            />
          </div>

          {/* Summary - Simplified */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              {/* Total Amount Display */}
              <div className="border-b border-gray-200 pb-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-lg">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {currencySymbol}{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleSave}
              className={`w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1 justify-center">
                  <BiLoader /> {mode === "update" ? "Updating..." : "Saving..."}
                </span>
              ) : mode === "update" ? (
                `Update Expence`
              ) : (
                `Save Expence`
              )}
            </button>
            {mode === "update" && (
              <Link
                href={"/purchase/expenses"}
                className={`w-full block text-center bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Go Back
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
