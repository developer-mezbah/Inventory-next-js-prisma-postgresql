"use client";

import client_api from "@/utils/API_FETCH";
import { useEffect, useState } from "react";
import { BiLoader } from "react-icons/bi";
import {
  IoCalendarOutline,
  IoClose,
  IoEyeOutline,
  IoInformationCircleOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";

const FloatingInput = ({
  id,
  type = "text",
  label,
  value,
  onChange,
  placeholder = "",
  isRequired = false,
  icon = null,
}) => {
  const hasValue = value !== "";

  const inputClass =
    "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
  const labelClass =
    "absolute text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={inputClass}
      />
      <label htmlFor={id} className={labelClass}>
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      {icon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    </div>
  );
};

const FloatingTextarea = ({ id, label, value, onChange, rows = 2 }) => {
  const inputClass =
    "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
  const labelClass =
    "absolute text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";
  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        rows={rows}
        className={inputClass}
      />
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    </div>
  );
};

export default function AddPartyModal({
  isOpen,
  onClose,
  defaultData = null,
  mode = "create",
  refetch,
  setSelectedParty,
}) {
  const [activeTab, setActiveTab] = useState("address");
  const [partyName, setPartyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailId, setEmailId] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [balanceType, setBalanceType] = useState("ToReceive"); // "ToPay" or "ToReceive"
  const [asOfDate, setAsOfDate] = useState("MM/DD/YY");
  const [creditLimitType, setCreditLimitType] = useState("no-limit");
  const [creditLimit, setCreditLimit] = useState("");
  const [additionalFields, setAdditionalFields] = useState([
    { id: 1, name: "", value: "", showInPrint: true },
    { id: 2, name: "", value: "", showInPrint: false },
    { id: 3, name: "", value: "", showInPrint: false },
    { id: 4, name: "", value: "", showInPrint: false, isDate: true },
  ]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (defaultData && mode === "update") {
      setPartyName(defaultData.partyName || "");
      setPhoneNumber(defaultData.phoneNumber || "");
      setEmailId(defaultData.emailId || "");
      setBillingAddress(defaultData.billingAddress || "");
      setShippingEnabled(defaultData.shippingEnabled || false);
      setShippingAddress(defaultData.shippingAddress || "");
      setOpeningBalance(defaultData.openingBalance || "");
      setBalanceType(defaultData.balanceType || "ToReceive");
      setAsOfDate(defaultData.asOfDate || "20/11/2025");
      setCreditLimitType(defaultData.creditLimitType || "no-limit");
      setCreditLimit(defaultData.creditLimit || "");
      if (defaultData?.additionalFields.length) {
        setAdditionalFields(defaultData.additionalFields);
      } else {
        setAdditionalFields([
          { id: 1, name: "", value: "", showInPrint: true },
          { id: 2, name: "", value: "", showInPrint: false },
          { id: 3, name: "", value: "", showInPrint: false },
          { id: 4, name: "", value: "", showInPrint: false, isDate: true },
        ]);
      }
    }
  }, [defaultData, mode]);

  if (!isOpen) return null;

  const handleCreateParty = () => {
    if (partyName === "") {
      return toast.error("Party Name Must be Fill up!");
    }
    const partyData = {
      partyName,
      phoneNumber,
      emailId,
      billingAddress,
      shippingEnabled,
      shippingAddress,
      openingBalance,
      balanceType,
      asOfDate,
      creditLimitType,
      creditLimit: parseFloat(creditLimit),
      additionalFields: additionalFields.filter((f) => f.name || f.value),
    };

    setFormLoading(true);
    client_api
      .create(`/api/party`, "token", partyData)
      .then((res) => {
        if (res) {
          setSelectedParty &&
            setSelectedParty({ ...res?.data, name: res?.data?.partyName });
          refetch();
          toast.success("Party Added successfully");
          onClose();
        }
      })
      .catch((err) => {
        toast.error("Error Creating Party");
      })
      .finally(() => {
        setFormLoading(false);
      });
  };

  const handleUpdateParty = () => {
    if (partyName === "") {
      return toast.error("Party Name Must be Fill up!");
    }
    const partyData = {
      partyName,
      phoneNumber,
      emailId,
      billingAddress,
      shippingEnabled,
      shippingAddress,
      openingBalance,
      balanceType,
      asOfDate,
      creditLimitType,
      creditLimit: parseFloat(creditLimit),
      additionalFields: additionalFields.filter((f) => f.name || f.value),
    };
    setFormLoading(true);
    client_api
      .update(`/api/party/${defaultData?.id}`, "token", partyData)
      .then((res) => {
        if (res) {
          refetch();
          toast.success("Party Updated successfully");
          onClose();
        }
      })
      .catch((err) => {
        toast.error("Error Updating Party");
      })
      .finally(() => {
        setFormLoading(false);
      });
  };

  const handleSave = () => {
    if (mode === "create") {
      handleCreateParty();
    } else {
      handleUpdateParty();
    }
  };

  const handleSaveAndNew = () => {
    if (mode === "create") {
      handleCreateParty();
      // Reset form for new entry
      resetForm();
    }
  };

  const resetForm = () => {
    setPartyName("");
    setPhoneNumber("");
    setEmailId("");
    setBillingAddress("");
    setShippingEnabled(false);
    setShippingAddress("");
    setOpeningBalance("");
    setBalanceType("ToReceive");
    setAsOfDate("20/11/2025");
    setCreditLimitType("no-limit");
    setCreditLimit("");
    setAdditionalFields([
      { id: 1, name: "", value: "", showInPrint: true },
      { id: 2, name: "", value: "", showInPrint: false },
      { id: 3, name: "", value: "", showInPrint: false },
      { id: 4, name: "", value: "", showInPrint: false, isDate: true },
    ]);
    setActiveTab("address");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {mode === "create" ? "Add Party" : "Update Party"}
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-white/70 rounded-xl transition-all duration-200 hover:scale-105">
              <IoSettingsOutline className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 cursor-pointer hover:bg-white/70 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <IoClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Top Form Fields */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-5">
            <FloatingInput
              id="partyName"
              label="Party Name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              isRequired={true}
            />
            <FloatingInput
              id="phoneNumber"
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-gray-100 bg-white">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("address")}
              className={`px-6 py-3.5 text-sm font-semibold rounded-t-xl transition-all duration-200 ${
                activeTab === "address"
                  ? "bg-gradient-to-b from-blue-50 to-transparent text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Address
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-6 py-3.5 text-sm font-semibold rounded-t-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === "credit"
                  ? "bg-gradient-to-b from-blue-50 to-transparent text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Credit & Balance
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm">
                New
              </span>
            </button>
            <button
              onClick={() => setActiveTab("additional")}
              className={`px-6 py-3.5 text-sm font-semibold rounded-t-xl transition-all duration-200 ${
                activeTab === "additional"
                  ? "bg-gradient-to-b from-blue-50 to-transparent text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Additional Fields
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="space-y-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4">
                  <FloatingInput
                    id="emailId"
                    label="Email ID"
                    type="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                  />
                </div>
                <div className="col-span-8 space-y-5">
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Billing Address
                    </h3>
                    <FloatingTextarea
                      id="billingAddress"
                      label="Billing Address"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                    />
                    <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-medium transition-colors">
                      <IoEyeOutline className="w-4 h-4" />
                      Show Detailed Address
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Shipping Address
                      </h3>
                      {!shippingEnabled && (
                        <button
                          onClick={() => setShippingEnabled(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                        >
                          <span className="text-lg">+</span> Enable Shipping
                          Address
                        </button>
                      )}
                    </div>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        shippingEnabled
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <FloatingTextarea
                        id="shippingAddress"
                        label="Shipping Address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Address Tab */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gray-300 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Credit & Balance Tab */}
          {activeTab === "credit" && (
            <div className="space-y-6">
              {/* Credit Balance Section */}
              <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Opening Balance
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FloatingInput
                      id="openingBalance"
                      label="Opening Balance"
                      type="number"
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(e.target.value)}
                    />

                    {/* ToPay/ToReceive Selector */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setBalanceType("ToPay")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all duration-200 ${
                          balanceType === "ToPay"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            balanceType === "ToPay"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <span className="font-medium">ToPay</span>
                      </button>
                      <button
                        onClick={() => setBalanceType("ToReceive")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all duration-200 ${
                          balanceType === "ToReceive"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            balanceType === "ToReceive"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <span className="font-medium">ToReceive</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FloatingInput
                      id="asOfDate"
                      label="As Of Date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                      icon={<IoCalendarOutline className="w-5 h-5" />}
                    />

                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-medium mb-1">Balance Type:</p>
                      <p
                        className={`font-semibold ${
                          balanceType === "ToPay"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {balanceType === "ToPay"
                          ? "You owe this party"
                          : "Party owes you"}
                      </p>
                      <p className="text-xs mt-2 text-gray-400">
                        {balanceType === "ToPay"
                          ? "This amount will be deducted from your account"
                          : "This amount will be added to your account"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Limit Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-semibold text-gray-800">
                    Credit Limit
                  </label>
                  <IoInformationCircleOutline className="w-4 h-4 text-blue-500" />
                </div>

                <div className="flex items-center gap-6 mb-5">
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        creditLimitType === "no-limit"
                          ? "text-blue-700"
                          : "text-gray-500"
                      }`}
                    >
                      No Limit
                    </span>
                    <button
                      onClick={() =>
                        setCreditLimitType(
                          creditLimitType === "no-limit"
                            ? "custom-limit"
                            : "no-limit"
                        )
                      }
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                        creditLimitType === "custom-limit"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                          creditLimitType === "custom-limit"
                            ? "translate-x-7"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        creditLimitType === "custom-limit"
                          ? "text-blue-700"
                          : "text-gray-500"
                      }`}
                    >
                      Custom Limit
                    </span>
                  </div>
                </div>

                {/* Smooth transition for credit limit input */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    creditLimitType === "custom-limit"
                      ? "max-h-24 opacity-100 mt-4"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <FloatingInput
                    id="creditLimit"
                    label="Credit Limit"
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Fields Tab */}
          {activeTab === "additional" && (
            <div className="space-y-6">
              {/* "Show in Print" toggle for every additional field */}
              {additionalFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <FloatingInput
                      id={`fieldName${index}`}
                      label={`Additional Field ${index + 1} Name`}
                      value={field.name}
                      onChange={(e) => {
                        const newFields = [...additionalFields];
                        newFields[index].name = e.target.value;
                        setAdditionalFields(newFields);
                      }}
                    />

                    <FloatingInput
                      id={`fieldValue${index}`}
                      label="Enter Value for new field"
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...additionalFields];
                        newFields[index].value = e.target.value;
                        setAdditionalFields(newFields);
                      }}
                      placeholder={field.isDate ? "dd/mm/yyyy" : ""}
                    />
                  </div>

                  {/* Show in Print toggle for every field */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                      Show In Print
                    </span>
                    <button
                      onClick={() => {
                        const newFields = [...additionalFields];
                        newFields[index].showInPrint =
                          !newFields[index].showInPrint;
                        setAdditionalFields(newFields);
                      }}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                        field.showInPrint
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                          field.showInPrint ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50">
          {mode === "create" && (
            <button
              onClick={handleSaveAndNew}
              className="px-6 py-2.5 cursor-pointer text-sm font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-sm"
            >
              {formLoading ? (
                <span className="flex gap-2 items-center">
                  <BiLoader /> Saving
                </span>
              ) : (
                "Save & New"
              )}
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 cursor-pointer text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-md"
          >
            {formLoading ? (
              <span className="flex gap-2 items-center">
                <BiLoader /> Saving
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
