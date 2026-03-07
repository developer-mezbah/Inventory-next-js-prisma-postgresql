"use client";

import Media from "@/components/gallery/Media";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BiLoader } from "react-icons/bi";
import { FiPrinter, FiSave, FiShare2 } from "react-icons/fi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { toast } from "react-toastify";
import ItemsTable from "./ItemsTable";
import PartySelector from "./PartySelector";
import PaymentSection from "./PaymentSection";
import WarrantySection from "./WarrantySection";
import CustomDatePicker from "@/components/DatePicker";
import useSettingsStore from "@/stores/settingsStore";

function generateUniqueId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
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
  return type === "sale" ? "Sale" : "Purchase";
}

export default function SalePurchaseForm({
  sale,
  onUpdate,
  onSubmit,
  isSubmitting,
  isSubmitted = false,
  mode,
  type,
  initData,
  data = {},
  refetch,
  formData: initialFormData = {},
  hideTabs = false,
}) {
  // Get form settings from Zustand store
  const { settings } = useSettingsStore();
  const formSettings = settings?.formSettings || {
    warranty: true,
    tax: true,
    discount: true,
  };

  const [selectedParty, setSelectedParty] = useState(initialFormData?.selectedParty || null);
  const [billNumber, setBillNumber] = useState(initialFormData?.billNumber || "");
  const [billDate, setBillDate] = useState(
    initialFormData?.billDate || new Date().toISOString().split("T")[0]
  );
  const [phoneNumber, setPhoneNumber] = useState(initialFormData?.phoneNumber || "");
  const [newParty, setNewParty] = useState(initialFormData?.newParty || null);
  const [images, setImages] = useState(initialFormData?.images || []);
  const [items, setItems] = useState(
    initialFormData?.items?.length
      ? initialFormData.items
      : sale?.items?.length
        ? sale.items
        : [
          {
            id: generateUniqueId(),
            item: "",
            qty: 1,
            unit: "NONE",
            price: 0,
            amount: 0,
          },
        ]
  );

  const [paymentType, setPaymentType] = useState(initialFormData?.paymentType || "Cash");
  const [discount, setDiscount] = useState(initialFormData?.discount || "");
  const [tax, setTax] = useState(initialFormData?.tax || "");
  const [description, setDescription] = useState(initialFormData?.description || "");

  const [isFullPayment, setIsFullPayment] = useState(initialFormData?.isFullPayment || false);
  const [manualPaidAmount, setManualPaidAmount] = useState(initialFormData?.manualPaidAmount || 0);
  const [paidAmount, setPaidAmount] = useState(initialFormData?.paidAmount || 0);
  const [balanceDue, setBalanceDue] = useState(initialFormData?.balanceDue || 0);

  const [warranty, setWarranty] = useState(
    initialFormData?.warranty || {
      duration: "",
      period: "Years",
      enabled: false,
    }
  );

  // Reset isInitialMount when sale changes (tab changes)
  useEffect(() => {
    isInitialMount.current = true;
  }, [sale?.id]);

  // Initialize with initData when in update mode
  useEffect(() => {
    if (mode === "update" && initData?.data && !initialFormData?.selectedParty) {
      setItems(
        initData.data.items?.map((item) => ({
          id: item?.id || generateUniqueId(),
          itemId: item?.id || "",
          item: item?.itemName || " ",
          qty:
            initData.invoiceData?.find((newItem) => newItem?.itemId === item?.id)
              ?.qty || 1,
          unit: item?.baseUnit || "None",
          price:
            initData.invoiceData?.find((newItem) => newItem?.itemId === item?.id)
              ?.unitPrice || 0,
          amount:
            initData.invoiceData?.find((newItem) => newItem?.itemId === item?.id)
              ?.price || 0,
        })) || []
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
      setBillDate(initData.data.billDate || new Date().toISOString().split("T")[0]);
      setImages(initData.data.images || []);
      setDescription(initData.data.description || "");

      if (initData.data.warranty) {
        setWarranty(initData.data.warranty);
      }

      const initialPaidAmount = initData.data.paidAmount || 0;
      setPaidAmount(initialPaidAmount);
      setManualPaidAmount(initialPaidAmount);
    }
  }, [initData, mode, initialFormData]);

  const isInitialMount = useRef(true);
  const prevFormDataString = useRef('');

  // Auto-update parent when form data changes (for tab persistence)
  useEffect(() => {
    // Skip if submitted
    if (isSubmitted) return;
    
    // Skip the first render to prevent infinite loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const formState = {
      selectedParty,
      billNumber,
      billDate,
      phoneNumber,
      newParty,
      images,
      items,
      paymentType,
      discount,
      tax,
      description,
      isFullPayment,
      manualPaidAmount,
      paidAmount,
      balanceDue,
      warranty,
    };

    // Only update if data actually changed
    const currentFormString = JSON.stringify(formState);
    if (prevFormDataString.current !== currentFormString) {
      prevFormDataString.current = currentFormString;
      onUpdate(formState);
    }
  }, [
    selectedParty,
    billNumber,
    billDate,
    phoneNumber,
    newParty,
    images,
    items,
    paymentType,
    discount,
    tax,
    description,
    isFullPayment,
    manualPaidAmount,
    paidAmount,
    balanceDue,
    warranty,
    onUpdate,
    isSubmitted
  ]);

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = formSettings.discount ? (itemsTotal * (Number(discount) || 0)) / 100 : 0;
    const taxAmount = formSettings.tax ? ((itemsTotal - discountAmount) * (Number(tax) || 0)) / 100 : 0;
    return itemsTotal - discountAmount + taxAmount;
  };

  useEffect(() => {
    const total = calculateTotal();
    let currentPaidAmount = isFullPayment
      ? total
      : Number(manualPaidAmount) || 0;

    currentPaidAmount = Math.min(currentPaidAmount, total);

    const newBalanceDue = total - currentPaidAmount;

    setPaidAmount(currentPaidAmount);
    setBalanceDue(newBalanceDue);
  }, [items, discount, tax, isFullPayment, manualPaidAmount, formSettings]);

  const handleAddItem = () => {
    if (isSubmitted) return;
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
    if (isSubmitted) return;
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        const price = Number(updated.price) || 0;
        const qty = Number(updated.qty) || 0;
        const amount = Number(updated.amount) || 0;

        if (field === "qty") {
          updated.amount = qty * price;
        }

        if (field === "price") {
          updated.amount = qty * price;
        }

        if (field === "amount") {
          updated.price = qty ? amount / qty : 0;
        }
        return updated;
      })
    );
  };

  const handleDeleteItem = (id) => {
    if (isSubmitted) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const validateForm = () => {
    if (items.length === 0) {
      toast.error("At least one item should be included.");
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const checkItem = items[i];

      if (!checkItem.item) {
        toast.error(`Item name must be required in row no: ${i + 1}`);
        return false;
      }

      if (!checkItem.price || Number(checkItem.price) <= 0) {
        toast.error(
          `Item price must be greater than zero in row no: ${i + 1}`
        );
        return false;
      }
    }

    if (formSettings.warranty && warranty.enabled && !warranty.duration) {
      toast.error("Please enter warranty duration");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (isSubmitted) {
      toast.info("This item has already been submitted");
      return;
    }
    
    if (!validateForm()) return;

    const total = calculateTotal();

    const submitData = {
      items,
      total,
      selectedParty,
      newParty,
      billNumber,
      billDate,
      phoneNumber,
      paymentType,
      discount: formSettings.discount ? discount : 0,
      tax: formSettings.tax ? tax : 0,
      balanceDue,
      paidAmount,
      images,
      description,
      warranty: formSettings.warranty && warranty.enabled ? warranty : null,
    };

    if (onSubmit) {
      onSubmit(submitData);
    } else {
      onUpdate(submitData);
    }
  };

  const handleWarrantyChange = (updatedWarranty) => {
    if (isSubmitted) return;
    setWarranty(updatedWarranty);
  };

  const total = calculateTotal();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Actions */}
      <div className="border-b border-gray-200 p-4 sm:p-6 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {getMode(type)} Details {!hideTabs && `- ${sale?.name}`}
          {isSubmitted && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Submitted
            </span>
          )}
        </h2>
        <div className="flex flex-wrap gap-2">
          {mode === "update" && (
            <Link
              href={type === "sale" ? "/sales/sale-invoices" : "/purchase/purchase-bills"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
            >
              <RiArrowGoBackLine />
            </Link>
          )}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
            disabled={isSubmitted}
          >
            <FiShare2 className={`w-5 h-5 ${isSubmitted ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print"
            disabled={isSubmitted}
          >
            <FiPrinter className={`w-5 h-5 ${isSubmitted ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <button
            disabled={isSubmitting || isSubmitted}
            onClick={handleSave}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
              isSubmitting || isSubmitted ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={isSubmitted ? "Already submitted" : "Save"}
          >
            {isSubmitting ? (
              <BiLoader className="animate-spin w-5 h-5" />
            ) : (
              <FiSave className={`w-5 h-5 ${isSubmitted ? 'text-green-600' : 'text-gray-600'}`} />
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
            disabled={isSubmitted}
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
              disabled={isSubmitted}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              onChange={(e) => setBillNumber(parseInt(e.target.value) || "")}
              disabled={isSubmitted}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:justify-end lg:max-w-sm">
          <div className="min-w-50">
            <CustomDatePicker
              defaultValue={billDate}
              size="large"
              label="Bill Date"
              onChange={(date) => setBillDate(date)}
              icon="calendar"
              disabled={isSubmitted}
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
          disabled={isSubmitted}
        />

        {/* Warranty Section - Only show if enabled in settings */}
        {formSettings.warranty && (
          <WarrantySection
            warranty={warranty}
            onWarrantyChange={handleWarrantyChange}
            disabled={isSubmitted}
          />
        )}

        {/* Totals and Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <PaymentSection
              refetch={refetch}
              bankData={data?.bank || []}
              cashData={data?.cash || []}
              paymentType={paymentType}
              onPaymentTypeChange={setPaymentType}
              disabled={isSubmitted}
            />
            <div>
              <div className="mb-4">
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images
                </div>
                <Media
                  images={images}
                  setImages={setImages}
                  multiImages={true}
                  disabled={isSubmitted}
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
                  disabled={isSubmitted}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  ${items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
                </span>
              </div>

              {/* Discount - Only show if enabled in settings */}
              {formSettings.discount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount ({discount || 0}%)</span>
                  <span className="font-medium text-gray-900">
                    -$
                    {(
                      (items.reduce((sum, item) => sum + (item.amount || 0), 0) *
                        (Number(discount) || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Tax - Only show if enabled in settings */}
              {formSettings.tax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({tax || 0}%)</span>
                  <span className="font-medium text-gray-900">
                    +$
                    {(
                      ((items.reduce((sum, item) => sum + (item.amount || 0), 0) *
                        (100 - (Number(discount) || 0))) /
                        100 *
                        (Number(tax) || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Paid Amount Box */}
              <div className="border-t border-gray-200 pt-3 flex items-center gap-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFullPayment}
                    onChange={(e) => {
                      setIsFullPayment(e.target.checked);
                      if (e.target.checked) {
                        setManualPaidAmount(total);
                      }
                    }}
                    disabled={isSubmitted}
                    className="form-checkbox text-blue-600 h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Paid
                  </span>
                </label>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      isFullPayment
                        ? paidAmount.toFixed(2)
                        : manualPaidAmount || ""
                    }
                    onChange={(e) =>
                      setManualPaidAmount(Number.parseFloat(e.target.value) || 0)
                    }
                    disabled={isFullPayment || isSubmitted}
                    placeholder="Enter amount"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${
                      isFullPayment || isSubmitted
                        ? "bg-gray-100 cursor-not-allowed"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </div>

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

            {/* Discount and Tax Inputs - Only show based on settings */}
            <div className="space-y-3">
              {formSettings.discount && (
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
                      setDiscount(e.target.value)
                    }
                    disabled={isSubmitted}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {formSettings.tax && (
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
                      setTax(e.target.value)
                    }
                    disabled={isSubmitted}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <button
              disabled={isSubmitting || isSubmitted}
              onClick={handleSave}
              className={`w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base ${
                isSubmitting || isSubmitted ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <BiLoader className="animate-spin" />
                  {mode === "update" ? "Updating..." : "Saving..."}
                </span>
              ) : isSubmitted ? (
                `Already ${mode === "update" ? "Updated" : "Saved"}`
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
                    : "/purchase/purchase-bills"
                }
                className="w-full block text-center bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
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