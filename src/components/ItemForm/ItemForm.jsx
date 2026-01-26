"use client";

import client_api from "@/utils/API_FETCH";
import { useId, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const REQUIRED_FIELDS = ["itemName", "price"];

export default function ItemForm({
  initialData = {},
  onClose,
  updateFormData,
  refetch,
  autoAddItem,
}) {
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: initialData?.itemName || "",
    price: initialData?.price || "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const uniqueId = useId();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when the user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    REQUIRED_FIELDS.forEach((field) => {
      const value = formData[field];
      if (value === null || value === undefined || value === "") {
        errors[field] = true;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all required fields.",
      });
      return;
    }
    
    setFormLoading(true);
    
    const dataToSubmit = {
      itemName: formData.itemName,
      price: parseFloat(formData.price) || 0,
    };

    if (updateFormData) {
      client_api
        .update(`/api/expense/${updateFormData?.id}`, "token", dataToSubmit)
        .then((res) => {
          if (res) {
            refetch();
            toast.success("Item Updated successfully");
            onClose();
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error Updating item");
        })
        .finally(() => {
          setFormLoading(false);
          onClose();
        });
    } else {
      client_api
        .create("/api/expense", "token", dataToSubmit)
        .then((res) => {
          if (res.status) {
            refetch();
            toast.success("Item added successfully");
            console.log(res);
            onClose();
            
            const autoUpdateData = {
              id: uniqueId,
              item: res?.item?.itemName || "",
              qty: 1,
              unit: "None",
              price: res?.item?.price || 0,
              amount: res?.item?.price || 0,
              itemId: res?.item?.id,
            };
            
            autoAddItem &&
              autoAddItem((prev) =>
                prev.map((prevItem) =>
                  prevItem?.item === "" ? autoUpdateData : prevItem
                )
              );
          }
        })
        .catch((err) => {
          toast.error("Error adding item");
        })
        .finally(() => {
          setFormLoading(false);
          onClose();
        });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Add Expense Item
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-6">
          {/* Item Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleInputChange("itemName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                validationErrors.itemName ? "border-red-500" : "border-border"
              }`}
              placeholder="Enter item name"
            />
            {validationErrors.itemName && (
              <p className="text-sm text-red-500">Item name is required</p>
            )}
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Pricing
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                validationErrors.price ? "border-red-500" : "border-border"
              }`}
              placeholder="Enter price"
              step="0.01"
            />
            {validationErrors.price && (
              <p className="text-sm text-red-500">Price is required</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-border/50 bg-secondary/50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-foreground bg-muted hover:bg-border rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
        >
          {formLoading ? (
            <span className="flex items-center gap-1">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-neutral-tertiary animate-spin fill-brand me-2"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              Saving
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}