"use client";

import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SalePurchaseForm from "./SalePurchaseForm";
import { useFetchData } from "@/hook/useFetchData";
import Loading from "@/components/Loading";

function getMode(type) {
  return type === "sale" ? "Sale" : "Purchase";
}

export default function SalePurchasePage({ mode, type, initData }) {
  // For create mode: enable tabs
  // For update mode: disable tabs (only one)
  const isUpdateMode = mode === "update";

  const [salesPurchases, setSalesPurchases] = useState(() => {
    if (isUpdateMode) {
      // In update mode, only one tab with existing data
      // Use placeholder first, actual data will be loaded in useEffect
      return [{
        id: 1,
        name: `${getMode(type)} #1`,
        items: [],
        total: 0
      }];
    } else {
      // In create mode, start with one empty tab
      return [{
        id: 1,
        name: `${getMode(type)} #1`,
        items: [],
        total: 0
      }];
    }
  });

  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTabs, setSubmittedTabs] = useState(new Set()); // Track which tabs are successfully submitted
  const [formData, setFormData] = useState({});

  const {
    isInitialLoading,
    error,
    data = {},
    refetch,
  } = useFetchData("/api/purchase-init-data", ["purchase-init-data"]);

  const { data: session } = useSession();
  const router = useRouter();

  // Initialize form data when editing - FIXED for your data structure
  useEffect(() => {
    if (isUpdateMode && initData?.data) {
      // Format items for the form
      const formattedItems = initData.invoiceData?.map(invoiceItem => {
        const itemDetails = initData.data.items?.find(item => item.id === invoiceItem.itemId);
        return {
          id: invoiceItem.id || generateUniqueId(),
          itemId: invoiceItem.itemId,
          item: invoiceItem.itemName,
          qty: invoiceItem.qty || 1,
          unit: itemDetails?.baseUnit || "None",
          price: invoiceItem.unitPrice || 0,
          amount: invoiceItem.price || 0,
        };
      }) || [];

      // Update salesPurchases with actual data
      setSalesPurchases([{
        id: 1,
        name: `${getMode(type)} #1`,
        items: formattedItems,
        total: initData.data.amount || initData.data.total || 0
      }]);

      // Format party object
      const partyObject = initData.party ? {
        id: initData.party.id,
        name: initData.party.partyName,
        phoneNumber: initData.party.phoneNumber,
        emailId: initData.party.emailId,
        billingAddress: initData.party.billingAddress,
        ...initData.party
      } : null;

      // Initialize form data - Convert discount and tax to strings or null
      const initialFormData = {};
      initialFormData[1] = {
        selectedParty: partyObject,
        newParty: null,
        partyName: initData.data.partyName,
        partyId: initData.data.partyId,
        items: formattedItems,
        total: initData.data.amount || initData.data.total || 0,
        billNumber: initData.data.billNumber || "",
        billDate: initData.data.billDate || new Date().toISOString().split('T')[0],
        phoneNumber: initData.data.phoneNumber || "",
        paymentType: initData.data.paymentType || "Cash",
        paymentTypeId: initData.data.paymentTypeId,
        // FIXED: Convert numbers to strings, keep null if not present
        discount: initData.data.discount ? String(initData.data.discount) : null,
        tax: initData.data.tax ? String(initData.data.tax) : null,
        description: initData.data.description || "",
        isFullPayment: initData.data.isPaid || false,
        manualPaidAmount: initData.data.paidAmount || 0,
        paidAmount: initData.data.paidAmount || 0,
        balanceDue: initData.data.balanceDue || 0,
        images: initData.data.images || [],
        warranty: initData.data.warranty || {
          duration: "",
          period: "Years",
          enabled: false,
        },
      };
      setFormData(initialFormData);
    }
  }, [isUpdateMode, initData, type]);

  // Helper function to generate unique ID (copied from your form)
  const generateUniqueId = () => {
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
  };

  const addSalePurchase = () => {
    if (isUpdateMode) return; // No adding tabs in update mode

    const newId = Math.max(...salesPurchases.map((p) => p.id), 0) + 1;
    setSalesPurchases(prev => [
      ...prev,
      {
        id: newId,
        name: `${getMode(type)} #${newId}`,
        items: [],
        total: 0,
      },
    ]);
    setActiveTab(newId);
  };

  const removeSale = (id) => {
    if (isUpdateMode) return; // No removing tabs in update mode
    if (salesPurchases.length > 1) {
      // Add confirmation dialog
      if (!confirm(`Are you sure you want to remove ${salesPurchases.find(p => p.id === id)?.name}?`)) {
        return;
      }

      setSalesPurchases(prev => {
        const filtered = prev.filter((p) => p.id !== id);
        return filtered;
      });

      // Update active tab to the first available tab
      setActiveTab(prev => {
        const remainingIds = salesPurchases.filter(p => p.id !== id).map(p => p.id);
        return remainingIds.includes(prev) ? prev : remainingIds[0];
      });

      // Clean up form data and submitted status for removed tab
      setFormData(prev => {
        const newFormData = { ...prev };
        delete newFormData[id];
        return newFormData;
      });

      setSubmittedTabs(prev => {
        const newSubmitted = new Set(prev);
        newSubmitted.delete(id);
        return newSubmitted;
      });

      toast.success("Tab removed successfully");
    }
  };

  const handleFormUpdate = (id, updates) => {
    // Don't allow updates if tab is already submitted
    if (submittedTabs.has(id)) return;

    // Update form data for the specific tab - use functional update to avoid dependency issues
    setFormData(prev => {
      // Check if the data actually changed to prevent unnecessary updates
      const currentData = prev[id] || {};
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(updates);

      if (!hasChanges) return prev;

      return {
        ...prev,
        [id]: { ...currentData, ...updates }
      };
    });

    // Update the salesPurchases state with items and total - only if items/total changed
    setSalesPurchases(prev =>
      prev.map((p) => {
        if (p.id !== id) return p;

        // Check if items or total actually changed
        if (JSON.stringify(p.items) === JSON.stringify(updates.items) &&
          p.total === updates.total) {
          return p;
        }

        return {
          ...p,
          items: updates.items || p.items,
          total: updates.total !== undefined ? updates.total : p.total,
        };
      })
    );
  };

  const handleSubmit = async (id) => {
    // Don't allow resubmitting if already submitted
    if (submittedTabs.has(id)) {
      toast.info("This item has already been submitted");
      return;
    }

    const currentFormData = formData[id];

    if (!currentFormData) {
      toast.error("No data to submit");
      return;
    }

    // Final validation
    if (!currentFormData.selectedParty && !currentFormData.newParty) {
      return toast.error(
        `Please select or create a ${type === "sale" ? "customer" : "party"}`
      );
    }

    // Validate that items exist and are not empty
    if (!currentFormData.items || currentFormData.items.length === 0) {
      return toast.error("At least one item is required");
    }

    // Check if any item has empty name or zero price
    for (let i = 0; i < currentFormData.items.length; i++) {
      const item = currentFormData.items[i];
      if (!item.item || item.item.trim() === "") {
        return toast.error(`Item name is required in row ${i + 1}`);
      }
      if (!item.price || Number(item.price) <= 0) {
        return toast.error(`Item price must be greater than zero in row ${i + 1}`);
      }
    }

    setIsSubmitting(true);

    // Prepare submit data - convert discount and tax from strings to numbers if needed
    const submitData = {
      ...currentFormData,
      // Convert discount and tax back to numbers for API
      discount: currentFormData.discount ? Number(currentFormData.discount) : 0,
      tax: currentFormData.tax ? Number(currentFormData.tax) : 0,
      userId: session?.user?.id,
      mode: type === "sale" ? "sale" : "purchase",
    };


    if (isUpdateMode) {
      submitData.id = initData?.data?.id;
    }
    try {
      const response = await (isUpdateMode
        ? client_api.update("/api/sale-purchase/update", "token", submitData)
        : client_api.create("/api/sale-purchase", "token", submitData));

      if (response?.status) {
        toast.success(
          response?.message || `${getMode(type)} ${isUpdateMode ? "updated" : "created"} successfully.`
        );

        // Mark this tab as submitted
        setSubmittedTabs(prev => new Set(prev).add(id));

        if (isUpdateMode) {
          // In update mode, redirect after successful update
          router.push(
            type === "sale"
              ? "/sales/sale-invoices"
              : "/purchase/purchase-bills"
          );
        } else {
          // In create mode with multiple tabs
          if (salesPurchases.length > 1 && id !== salesPurchases[salesPurchases.length - 1].id) {
            // Move to next unsaved tab
            const currentIndex = salesPurchases.findIndex(p => p.id === id);
            if (currentIndex < salesPurchases.length - 1) {
              setActiveTab(salesPurchases[currentIndex + 1].id);
            }
          }
        }
      } else {
        toast.error(response?.error || `Failed to ${isUpdateMode ? "update" : "create"} ${getMode(type)}.`);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    if (isUpdateMode) return; // No submit all in update mode

    const unsavedTabs = [];
    const validationErrors = [];

    // Check each tab for validation
    for (const purchase of salesPurchases) {
      if (submittedTabs.has(purchase.id)) continue;

      const data = formData[purchase.id];

      if (!data) {
        unsavedTabs.push(purchase.name);
        continue;
      }

      // Check party selection
      if (!data.selectedParty && !data.newParty) {
        validationErrors.push(`${purchase.name}: Please select or create a ${type === "sale" ? "customer" : "party"}`);
        continue;
      }

      // Check if items exist
      if (!data.items || data.items.length === 0) {
        validationErrors.push(`${purchase.name}: At least one item is required`);
        continue;
      }

      // Check each item in the tab
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (!item.item || item.item.trim() === "") {
          validationErrors.push(`${purchase.name}: Item name is required in row ${i + 1}`);
          break;
        }
        if (!item.price || Number(item.price) <= 0) {
          validationErrors.push(`${purchase.name}: Item price must be greater than zero in row ${i + 1}`);
          break;
        }
      }
    }

    // Show validation errors if any
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    if (unsavedTabs.length > 0) {
      toast.warning(`Please complete ${unsavedTabs.join(", ")} before submitting all.`);
      return;
    }

    setIsSubmitting(true);
    let hasError = false;

    for (const purchase of salesPurchases) {
      // Skip already submitted tabs
      if (submittedTabs.has(purchase.id)) continue;

      const currentFormData = formData[purchase.id];

      if (currentFormData) {
        // Prepare submit data - convert discount and tax from strings to numbers
        const submitData = {
          ...currentFormData,
          discount: currentFormData.discount ? Number(currentFormData.discount) : 0,
          tax: currentFormData.tax ? Number(currentFormData.tax) : 0,
          userId: session?.user?.id,
          mode: type === "sale" ? "sale" : "purchase",
        };

        try {
          const response = await client_api.create("/api/sale-purchase", "token", submitData);

          if (response?.status) {
            // Mark this tab as submitted
            setSubmittedTabs(prev => new Set(prev).add(purchase.id));
          } else {
            toast.error(`Failed to submit ${purchase.name}: ${response?.error || "Unknown error"}`);
            hasError = true;
            break;
          }
        } catch (error) {
          toast.error(`Error submitting ${purchase.name}`);
          hasError = true;
          break;
        }
      }
    }

    if (!hasError) {
      // Check if all tabs are now submitted
      const allSubmitted = salesPurchases.every(p => submittedTabs.has(p.id));

      if (allSubmitted) {
        toast.success(`All ${getMode(type)}s processed successfully.`);
      } else {
        toast.success(`Progress saved. Continue with remaining items.`);
      }
    }

    setIsSubmitting(false);
  };

  const activeSale = salesPurchases.find((p) => p.id === activeTab);
  const isActiveTabSubmitted = activeSale ? submittedTabs.has(activeSale.id) : false;

  if (isInitialLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {getMode(type)} {isUpdateMode ? "Update" : "Management"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isUpdateMode
              ? `Update your ${getMode(type).toLowerCase()} details`
              : `Manage and track your ${getMode(type).toLowerCase()}s with ease`}
          </p>
        </div>

        {/* Tabs - Only show in create mode */}
        {!isUpdateMode && (
          <div className="mb-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-1">
              {salesPurchases.map((purchase) => {
                const isSubmitted = submittedTabs.has(purchase.id);
                const isActive = activeTab === purchase.id;
                return (
                  <div
                    key={purchase.id}
                    className={`relative group ${isActive ? "z-10" : "z-0"}`}
                  >
                    <button
                      onClick={() => setActiveTab(purchase.id)}
                      className={`
                        px-4 sm:px-6 py-3 text-sm sm:text-base font-medium 
                        transition-all duration-200 relative
                        ${isActive
                          ? "text-blue-700 bg-white border-t-2 border-l border-r border-gray-200 rounded-t-lg font-semibold shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg"
                        }
                        ${isSubmitted ? 'border-green-500' : ''}
                      `}
                    >
                      {purchase.name}
                      {isSubmitted && (
                        <span className="ml-2 text-green-600 font-bold text-lg">✓</span>
                      )}
                    </button>

                    {/* Show remove button for ALL tabs when there's more than one tab */}
                    {salesPurchases.length > 1 && (
                      <button
                        onClick={() => removeSale(purchase.id)}
                        className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 text-white rounded-full 
                                 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 
                                 transition-opacity duration-200 hover:bg-red-600"
                        title={`Remove ${purchase.name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Tab Button */}
              <button
                onClick={addSalePurchase}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 
                         hover:bg-blue-50 rounded-lg transition-colors ml-2 border border-dashed border-blue-300"
                title={`Add new ${getMode(type)}`}
              >
                + Add New
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons - Only show in create mode with multiple tabs */}
        {!isUpdateMode && salesPurchases.length > 1 && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg 
                       hover:bg-green-700 transition-colors text-sm sm:text-base
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : `Submit All ${getMode(type)}s`}
            </button>
          </div>
        )}

        {/* Purchase Form */}
        {activeSale && (
          <SalePurchaseForm
            key={activeTab}
            mode={mode}
            type={type}
            initData={mode === "update" ? initData : null}
            isSubmitting={isSubmitting}
            isSubmitted={isActiveTabSubmitted}
            sale={activeSale}
            formData={formData[activeTab]}
            onUpdate={(updates) => handleFormUpdate(activeSale.id, updates)}
            onSubmit={() => handleSubmit(activeSale.id)}
            data={data}
            refetch={refetch}
            hideTabs={isUpdateMode}
          />
        )}
      </div>
    </div>
  );
}