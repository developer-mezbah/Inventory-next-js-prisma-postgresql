"use client";

import client_api from "@/utils/API_FETCH";
import { useState, useEffect } from "react";
import { BiLoader } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

// Floating Input Component (same as before)
const FloatingInput = ({
  id,
  type = "text",
  label,
  value,
  onChange,
  placeholder = "",
  isRequired = false,
}) => {
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
    </div>
  );
};

// Floating Select Component for Expense Type
const FloatingSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  isRequired = false,
}) => {
  const selectClass =
    "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
  const labelClass =
    "absolute text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";
  
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={selectClass}
      >
        <option value="" disabled>Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className={labelClass}>
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default function AddExpenseCategoryModal({
  isOpen,
  onClose,
  defaultData = null,
  mode = "create",
  refetch,
}) {
  const [categoryName, setCategoryName] = useState("");
  const [expenseType, setExpenseType] = useState("Indirect Expense");
  const [formLoading, setFormLoading] = useState(false);

  // Expense type options
  const expenseTypeOptions = [
    { value: "Indirect Expense", label: "Indirect Expense" },
    { value: "Direct Expense", label: "Direct Expense" },
  ];

  // Load default data if in update mode
  useEffect(() => {
    if (defaultData && mode === "update") {
      setCategoryName(defaultData.name || "");
      setExpenseType(defaultData.expenseType || "Indirect Expense");
    } else {
      // Reset form for create mode
      setCategoryName("");
      setExpenseType("Indirect Expense");
    }
  }, [defaultData, mode]);

  if (!isOpen) return null;

   const handleSave = () => {
    // Validate required fields
    if (!categoryName.trim()) {
      toast.error("Expense Category Name is required!");
      return;
    }

    if (!expenseType) {
      toast.error("Expense Type is required!");
      return;
    }

    // Prepare data
    const expenseData = {
      name: categoryName.trim(),
      expenseType,
    };

    setFormLoading(true);

    if (mode === "create") {
      client_api.create("/api/expense/category", "token", expenseData)
        .then((res) => {
          if (res?.status) {
            toast.success(
              res?.message || `Expense Category ${mode === "create" ? "created" : "updated"} successfully.`
            );
            onClose();
            refetch();
          } else {
            toast.error(res?.error || `Failed to ${mode === "create" ? "create" : "update"} Expense Category.`);
          }
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else if (mode === "update" && defaultData?.id) {
      client_api.update(`/api/expense/category/${defaultData.id}`, "token", expenseData)
        .then((res) => {
          if (res?.status) {
            toast.success(
              res?.message || `Expense Category ${mode === "create" ? "created" : "updated"} successfully.`
            );
            onClose();
            refetch();
          } else {
            toast.error(res?.error || `Failed to ${mode === "create" ? "create" : "update"} Expense Category.`);
          }
        })
        .finally(() => {
          setFormLoading(false);
        });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "create" ? "Add Expense Category" : "Edit Expense Category"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <IoClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Expense Category Name */}
            <div>
              <FloatingInput
                id="categoryName"
                label="Expense Category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                isRequired={true}
                placeholder=" "
              />
            </div>

            {/* Expense Type Dropdown */}
            <div>
              <FloatingSelect
                id="expenseType"
                label="Expense Type"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                options={expenseTypeOptions}
                isRequired={true}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <BiLoader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "create" ? "Add Expense Category" : "Edit Expense Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <IoClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Expense Category Name */}
          <div>
            <FloatingInput
              id="categoryName"
              label="Expense Category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              isRequired={true}
              placeholder=" "
            />
          </div>

          {/* Expense Type Dropdown */}
          <div>
            <FloatingSelect
              id="expenseType"
              label="Expense Type"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              options={expenseTypeOptions}
              isRequired={true}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <BiLoader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}