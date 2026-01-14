"use client";

import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import SalePurchaseForm from "./SalePurchaseForm";

function getMode(type) {
  if (type === "sale") {
    return "Sale";
  } else {
    return "Purchase";
  }
}

export default function SalePurchasePage({ mode, type, initData }) {
  const [salesPurchases, setSalesPurcashses] = useState([
    { id: 1, name: `${getMode(type)} #1`, items: [], total: 0 },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();

  const router = useRouter();

  const addSalePurchase = () => {
    const newId = Math.max(...salesPurchases.map((p) => p.id), 0) + 1;
    setSalesPurcashses([
      ...salesPurchases,
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
    if (salesPurchases.length > 1) {
      const filtered = salesPurchases.filter((p) => p.id !== id);
      setSalesPurcashses(filtered);
      setActiveTab(filtered[0].id);
    }
  };

  const updatePurchase = (id, updates) => {
    if (!updates?.selectedParty && !updates?.newParty) {
      return toast.error(
        `${
          type === "sale" ? "Party" : "Customer"
        } name doesn't exist, please create a new ${
          type === "sale" ? "Party" : "Customer"
        }.`
      );
    }
    setIsSubmitting(true);
    setSalesPurcashses(
      salesPurchases.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    if (mode === "update") {
      client_api
        .update("/api/sale-purchase/update", "token", {
          ...updates,
          id: initData?.data?.id,
          userId: session?.user?.id,
          mode: type === "sale" ? "sale" : "purchase",
        })
        .then((res) => {
          if (res?.status) {
            toast.success(
              res?.message || `${getMode(type)} Updated successfully.`
            );
            router.push(
              type === "sale"
                ? "/sales/sale-invoices"
                : "/purchase/purchase-bils"
            );
          } else {
            toast.error(res?.error || `Failed to update ${getMode(type)}.`);
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      // console.log( { ...updates,id: initData?.data?.id, userId: session?.user?.id });
    } else {
      client_api
        .create("/api/sale-purchase", "token", {
          ...updates,
          userId: session?.user?.id,
          mode: type === "sale" ? "sale" : "purchase",
        })
        .then((res) => {
          if (res?.status) {
            toast.success(
              res?.message || `${getMode(type)} created successfully.`
            );
            router.push(
              type === "sale"
                ? "/sales/sale-invoices"
                : "/purchase/purchase-bils"
            );
          } else {
            toast.error(res?.error || `Failed to create ${getMode(type)}.`);
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const activeSale = salesPurchases.find((p) => p.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {getMode(type)} Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and track your {getMode(type)} with ease
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-0 overflow-x-auto pb-0">
            {salesPurchases.map((purchase) => (
              <div key={purchase.id} className="relative flex-shrink-0">
                <button
                  onClick={() => setActiveTab(purchase.id)}
                  className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors relative ${
                    activeTab === purchase.id
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {purchase.name}
                  {activeTab === purchase.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                {salesPurchases.length > 1 && (
                  <button
                    onClick={() => removeSale(purchase.id)}
                    className="absolute -right-1 top-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Purchase Button */}
        <div className="mb-6">
          <button
            onClick={addSalePurchase}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            + Add {getMode(type)}
          </button>
        </div>

        {/* Purchase Form */}
        {activeSale && (
          <SalePurchaseForm
            mode={mode}
            type={type}
            initData={initData}
            isSubmitting={isSubmitting}
            sale={activeSale}
            onUpdate={(updates) => updatePurchase(activeSale.id, updates)}
          />
        )}
      </div>
    </div>
  );
}
