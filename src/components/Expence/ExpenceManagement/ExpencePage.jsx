"use client";

import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import ExpenceForm from "./ExpenceForm";



export default function ExpencePage({ mode, initData }) {
  const [salesPurchases, setSalesPurcashses] = useState([
    { id: 1, name: `Expence #1`, items: [], total: 0 },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();

  const router = useRouter();





  const updateExpence = (id, updates) => {
    if (!updates?.selectedParty && !updates?.newCategory) {
      return toast.error(
        `Expence name doesn't exist, please create a new Expence.`
      );
    }
    setIsSubmitting(true);
    setSalesPurcashses(
      salesPurchases.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    if (mode === "update") {
      client_api
        .update("/api/expense/update", "token", {
          ...updates,
          id: initData?.expense?.id,
          userId: session?.user?.id,
        })
        .then((res) => {
          if (res?.status) {
            toast.success(
              res?.message || `Expence Updated successfully.`
            );
            router.push(
              "/purchase/expenses?"
            );
          } else {
            toast.error(res?.error || `Failed to update Expence.`);
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      // console.log( { ...updates,id: initData?.data?.id, userId: session?.user?.id });
    } else {
      client_api
        .create("/api/expense", "token", {
          ...updates,
          userId: session?.user?.id,
        })
        .then((res) => {
          if (res?.status) {
            toast.success(
              res?.message || `Expence created successfully.`
            );
            router.push(
              "/purchase/expenses?"
            );
          } else {
            toast.error(res?.error || `Failed to create Expence.`);
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
            Expence Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and track your Expence with ease
          </p>
        </div>





        {/* Purchase Form */}
        {activeSale && (
          <ExpenceForm
            mode={mode}
            initData={initData}
            isSubmitting={isSubmitting}
            onUpdate={(updates) => updateExpence(activeSale.id, updates)}
          />
        )}
      </div>
    </div>
  );
}
