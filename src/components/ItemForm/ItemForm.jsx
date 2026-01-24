"use client";

import client_api from "@/utils/API_FETCH";
import { useId, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import BasicInfo from "./FormSections/BasicInfo";
import PricingTab from "./FormSections/PricingTab";
import StockTab from "./FormSections/StockTab";
import TabsNav from "./TabsNav";

// Required fields from the Prisma Item model: itemType, itemName, description
// Required fields from the embedded StockInfo model: openingQuantity, atPrice, asOfDate, minStockToMaintain
const REQUIRED_FIELDS = ["itemName"];

export default function ItemForm({
  initialData = {},
  onClose,
  updateFormData,
  refetch,
  autoAddItem,
}) {
  const [formLoading, setFormLoading] = useState(false);
  const [type, setType] = useState("product");
  const [activeTab, setActiveTab] = useState("basic");
  // Initial state mapped directly from Prisma model fields (using sensible defaults)
  const [formData, setFormData] = useState({
    itemType: type, // Matches 'itemType' in model
    itemName: initialData?.itemName || "", // Matches 'itemName' in model
    itemCode: initialData?.itemCode || "", // Matches 'itemCode' in model (Optional)
    description: initialData?.description || "", // Matches 'description' in model
    // Category Relation (Optional fields)
    categoryId: initialData?.categoryId || "",
    subCategoryId: initialData?.subCategoryId || "",
    // Units (Optional fields, mapping from your component's flow)
    baseUnit: initialData?.baseUnit || "",
    secondaryUnit: initialData?.secondaryUnit || "",
    unitQty: initialData?.unitQty || 0,
    // Pricing (Optional fields)
    salePrice: initialData?.salePrice || "",
    purchasePrice: initialData?.purchasePrice || "",
    wholesalePrice: initialData?.wholesalePrice || "",
    minimumWholesaleQty: initialData?.minimumWholesaleQty || "", // Matches 'minimumWholesaleQty'
    // Stock/ (Embedded Document fields are required if StockInfo exists)
    openingQuantity: initialData?.stock?.openingQuantity || "", // Mapped from StockInfo
    atPrice: initialData?.stock?.atPrice || "", // Mapped from StockInfo
    asOfDate: initialData?.stock?.asOfDate || "", // Mapped from StockInfo
    minStockToMaintain: initialData?.stock?.minStockToMaintain || "", // Mapped from StockInfo
    location: initialData?.stock?.location || "", // Mapped from StockInfo (Optional)
    // Media (Optional field, mapping from your component's flow)
    images: initialData?.images || [], // Matches 'images' in model
  });

  const [validationErrors, setValidationErrors] = useState({});

  const uniqueId = useId();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when the user starts typing/selecting
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Update itemType when the toggle is used
  const handleTypeChange = (newType) => {
    setType(newType);
    setFormData((prev) => ({ ...prev, itemType: newType }));
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
        text: "Please fill in all required fields (marked with a red border).",
      });
      // Optionally navigate to the first tab with an error
      if (validationErrors.itemName || validationErrors.description)
        setActiveTab("basic");
      else if (validationErrors.salePrice)
        setActiveTab(
          "pricing"
        ); // SalePrice is NOT required by model, but you might want to make it required in form
      else if (
        validationErrors.openingQuantity ||
        validationErrors.atPrice ||
        validationErrors.asOfDate ||
        validationErrors.minStockToMaintain
      )
        setActiveTab("stock");
      return;
    }
    setFormLoading(true);
    // Construct the final object to match the Prisma model structure before submission
    const dataToSubmit = {
      itemType: formData.itemType,
      itemName: formData.itemName,
      itemCode: formData.itemCode,
      description: formData.description,
      categoryId: formData.categoryId || null,
      subCategoryId: formData.subCategoryId || null,
      baseUnit: formData.baseUnit,
      secondaryUnit: formData.secondaryUnit || null,
      unitQty: parseInt(formData.unitQty) || null,
      salePrice: parseFloat(formData.salePrice) || null,
      purchasePrice: parseFloat(formData.purchasePrice) || null,
      wholesalePrice: parseFloat(formData.wholesalePrice) || null,
      minimumWholesaleQty: parseInt(formData.minimumWholesaleQty) || null,
      images: formData.images,
    };

    // Add StockInfo as an embedded object (Prisma `type` model is embedded)
    if (formData.itemType === "product") {
      dataToSubmit.stock = {
        openingQuantity: parseFloat(formData.openingQuantity) || 0,
        atPrice: parseFloat(formData.atPrice) || 0,
        asOfDate: formData?.asOfDate || "",
        minStockToMaintain: parseFloat(formData.minStockToMaintain) || 0,
        location: formData.location || "",
      };
    } else {
      dataToSubmit.stock = null; // Services don't have stock
    }

    if (updateFormData) {
      client_api
        .update(`/api/items/${updateFormData?.id}`, "token", dataToSubmit)
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
        .create("/api/items", "token", dataToSubmit)
        .then((res) => {
          if (res.status) {
            refetch();
            toast.success("Item added successfully");
            console.log(res);
            onClose();
            // autoAddItem((prev) => (prev.length > 0 ? :))
            const autoUpdateData = {
              id: uniqueId,
              item: res?.item?.itemName || "",
              qty: 1,
              unit: res?.item?.baseUnit || "None",
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

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    // Only show stock for products based on Prisma model logic
    ...(formData.itemType === "product"
      ? [{ id: "stock", label: "Stock", icon: "📦" }]
      : []),
  ];

  return (
    // The form wrapper is removed, as requested, but we need to handle the submit manually
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {initialData?.id ? "Edit Item" : "Add Item"}
          </h2>

          {/* Type Toggle */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-medium text-muted-foreground">
              Product
            </span>
            <button
              type="button"
              onClick={() =>
                handleTypeChange(
                  formData.itemType === "product" ? "service" : "product"
                )
              }
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                formData.itemType === "service" ? "bg-black" : "bg-gray-400"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  formData.itemType === "service"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              Service
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <TabsNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === "basic" && (
          <BasicInfo
            formData={formData}
            onChange={handleInputChange}
            type={formData.itemType}
            validationErrors={validationErrors}
            initialData={initialData}
          />
        )}
        {activeTab === "pricing" && (
          <PricingTab
            formData={formData}
            onChange={handleInputChange}
            validationErrors={validationErrors}
          />
        )}
        {activeTab === "stock" && formData.itemType === "product" && (
          <StockTab
            formData={formData}
            onChange={handleInputChange}
            validationErrors={validationErrors}
            initialData={initialData}
          />
        )}
      </div>

      {/* Footer (Using button onClick for manual submit since no <form> is used) */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-border/50 bg-secondary/50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-foreground bg-muted hover:bg-border rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        {/* Changed type to 'button' and call handleSubmit onClick to validate */}
        <button
          type="button"
          onClick={handleSubmit} // Manual call to handleSubmit
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
        >
          {formLoading ? (
            <span className=" flex items-center gap-1">
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
              Saveing
            </span>
          ) : (
            "Save Item"
          )}
        </button>
      </div>
    </div>
  );
}
