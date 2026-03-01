"use client";

import Loading from "@/components/Loading";
import Media from "@/components/gallery/Media";
import { useFetchData } from "@/hook/useFetchData";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiLoader } from "react-icons/bi";
import { FiPrinter, FiSave, FiShare2 } from "react-icons/fi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { toast } from "react-toastify";
import ItemsTable from "./ItemsTable";
import PartySelector from "./PartySelector";
import PaymentSection from "./PaymentSection";
import WarrantySection from "./WarrantySection"; // Import the new WarrantySection component
import CustomDatePicker from "@/components/DatePicker";

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

function getMode(type) {
  if (type === "sale") {
    return "Sale";
  } else {
    return "Purchase";
  }
}

export default function SalePurchaseForm({
  sale,
  onUpdate,
  isSubmitting,
  mode,
  type,
  initData,
}) {
  const [selectedParty, setSelectedParty] = useState(null);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newParty, setNewParty] = useState(null);
  const [images, setImages] = useState([]);
  const [items, setItems] = useState(
    sale.items.length
      ? sale.items
      : [
        {
          id: 1762926852456,
          item: "",
          qty: 1,
          unit: "NONE",
          price: 0,
          amount: 0,
        },
      ]
  );

  const [paymentType, setPaymentType] = useState("Cash");
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  // Removed setBalanceDue and setPaidAmount from useState for dynamic calculation
  // const [balanceDue, setBalanceDue] = useState("")
  // const [paidAmount, setPaidAmount] = useState("")
  const [description, setDescription] = useState("");

  // New states for Paid Amount feature
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [manualPaidAmount, setManualPaidAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);

  // New states for Warranty feature
  const [warranty, setWarranty] = useState({
    duration: "",
    period: "Years", // Default to Years as shown in the image
    enabled: false,
  });

  useEffect(() => {
    if (mode === "update" && initData?.data) {
      // Set all initial values from initData
      setItems(
        initData.data.items.map((item) => ({
          id: item?.id || "",
          itemId: item?.id || "",
          item: item?.itemName || " ",
          qty:
            initData.invoiceData.find((newItem) => newItem?.itemId === item?.id)
              ?.qty || 1,
          unit: item?.baseUnit || "None",
          price:
            initData.invoiceData.find((newItem) => newItem?.itemId === item?.id)
              ?.unitPrice || 0,
          amount:
            initData.invoiceData.find((newItem) => newItem?.itemId === item?.id)
              ?.price || 0,
        }))
      );

      setDiscount(initData.data.discount || "");
      setTax(initData.data.tax || "");
      setIsFullPayment(initData.data.isPaid || false);
      setPaymentType(
        initData.data.paymentType === "Cash"
          ? "Cash"
          : {
            id: initData.data.paymentTypeId,
            accountdisplayname: initData.data.paymentType,
          }
      );
      setSelectedParty({ ...initData.party, name: initData.party?.partyName });
      setPhoneNumber(initData.data.phoneNumber || "");
      setBillNumber(initData.data.billNumber || "");
      setBillDate(initData.data.billDate || "");
      setImages(initData.data.images || []);
      setDescription(initData.data.description || "");

      // Set warranty data if exists
      if (initData.data.warranty) {
        setWarranty(initData.data.warranty);
      }

      // Only set paidAmount and manualPaidAmount from initData, balanceDue will be calculated
      const initialPaidAmount = initData.data.paidAmount || 0;
      setPaidAmount(initialPaidAmount);
      setManualPaidAmount(initialPaidAmount);

      // Don't set balanceDue here - let the calculation effect handle it
    }
  }, [initData, mode, type]);

  const {
    isInitialLoading,
    error,
    data = {},
    refetch,
  } = useFetchData("/api/purchase-init-data", ["purchase-init-data"]);

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = (itemsTotal * discount) / 100;
    const taxAmount = ((itemsTotal - discountAmount) * tax) / 100;
    return itemsTotal - discountAmount + taxAmount;
  };

  // Effect to calculate paid amount and balance due dynamically
  useEffect(() => {
    const total = calculateTotal();
    let currentPaidAmount = isFullPayment
      ? total
      : Number(manualPaidAmount) || 0;

    // Ensure paid amount doesn't exceed total (optional but good practice)
    currentPaidAmount = Math.min(currentPaidAmount, total);

    const newBalanceDue = total - currentPaidAmount;

    setPaidAmount(currentPaidAmount);
    setBalanceDue(newBalanceDue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, discount, tax, isFullPayment, manualPaidAmount]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: generateUniqueId(),
        item: "",
        qty: 1,
        unit: "",
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

    // Validate warranty if enabled
    if (warranty.enabled && !warranty.duration) {
      return toast.error("Please enter warranty duration");
    }

    // 3. If all validation passes, proceed with saving/updating
    onUpdate({
      items,
      total: calculateTotal(),
      selectedParty,
      newParty,
      billNumber,
      billDate,
      phoneNumber,
      paymentType: paymentType,
      discount,
      tax,
      balanceDue,
      paidAmount,
      images,
      description,
      warranty: warranty.enabled ? warranty : null, // Only include warranty if enabled
    });
  };

  const handleWarrantyChange = (updatedWarranty) => {
    setWarranty(updatedWarranty);
  };

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* All Modals  */}
      {/* Header Actions */}
      <div className="border-b border-gray-200 p-4 sm:p-6 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {getMode(type)} Details
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
          <PartySelector
            setSelectedParty={setSelectedParty}
            mode={type}
            setNewParty={setNewParty}
            partyData={data?.party || []}
            setPhoneNumber={setPhoneNumber}
            selectedParty={selectedParty}
            onSelect={setSelectedParty}
            refetch={refetch}
          />
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Phone NO.
            </label>
            <input
              type="number"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:justify-end lg:max-w-sm">
          <div className="min-w-50">

            <CustomDatePicker
              defaultValue={billDate && billDate}
              size="large"
              label="Bill Date"
              onChange={(date) => setBillDate(date)}
              icon="calendar"
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
          type={type}
        />

        {/* Warranty Section - Added here */}
        <WarrantySection
          warranty={warranty}
          onWarrantyChange={handleWarrantyChange}
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
            <div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images
                </div>
                <Media
                  images={images}
                  setImages={setImages}
                  multiImages={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  $
                  {items
                    .reduce((sum, item) => sum + (item.amount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount ({discount}%)</span>
                <span className="font-medium text-gray-900">
                  -$
                  {(
                    (items.reduce((sum, item) => sum + (item.amount || 0), 0) *
                      discount) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({tax}%)</span>
                <span className="font-medium text-gray-900">
                  +$
                  {(
                    (((items.reduce(
                      (sum, item) => sum + (item.amount || 0),
                      0
                    ) *
                      (100 - discount)) /
                      100) *
                      tax) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* === Paid Amount Box (New addition) === */}
              <div className="border-t border-gray-200 pt-3 flex items-center gap-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFullPayment}
                    onChange={(e) => {
                      setIsFullPayment(e.target.checked);
                      // If checked, clear manual input, as paidAmount is now total
                      if (e.target.checked)
                        setManualPaidAmount(calculateTotal().toFixed(2));
                      // If unchecked, set manual input to the current total, ready for user edit
                      else setManualPaidAmount(calculateTotal().toFixed(2));
                    }}
                    className="form-checkbox text-blue-600 h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Paid
                  </span>
                </label>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    value={
                      isFullPayment
                        ? paidAmount.toFixed(2)
                        : manualPaidAmount === 0
                          ? ""
                          : manualPaidAmount
                    }
                    onChange={(e) =>
                      setManualPaidAmount(
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    disabled={isFullPayment}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${isFullPayment
                        ? "bg-gray-200 cursor-not-allowed"
                        : "border-gray-300"
                      }`}
                  />
                </div>
              </div>
              {/* ======================================= */}

              <div className="flex justify-between text-sm pt-1">
                <span className="font-semibold text-gray-900">Balance Due</span>
                <span
                  className={`text-lg font-bold ${balanceDue > 0 ? "text-red-600" : "text-green-600"
                    }`}
                >
                  ${balanceDue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Discount and Tax Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  placeholder="0"
                  onChange={(e) =>
                    setDiscount(Number.parseFloat(e.target.value) || "")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  placeholder="0"
                  onChange={(e) =>
                    setTax(Number.parseFloat(e.target.value) || "")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                `Update ${getMode(type)}`
              ) : (
                `Save ${getMode(type)}`
              )}
            </button>
            {mode === "update" && (
              <Link
                href={
                  type === "sale"
                    ? "/sales/sale-invoices"
                    : "/purchase/purchase-bils"
                }
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