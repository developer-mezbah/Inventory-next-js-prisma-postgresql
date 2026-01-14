"use client"

import PurchaseForm from "@/components/PurchaseForm/PurchaseForm"
import { useState } from "react"

export default function Home() {
  const [purchases, setPurchases] = useState([{ id: 1, name: "Purchase #1", items: [], total: 0 }])
  const [activeTab, setActiveTab] = useState(1)

  const addPurchase = () => {
    const newId = Math.max(...purchases.map((p) => p.id), 0) + 1
    setPurchases([
      ...purchases,
      {
        id: newId,
        name: `Purchase #${newId}`,
        items: [],
        total: 0,
      },
    ])
    setActiveTab(newId)
  }

  const removePurchase = (id) => {
    if (purchases.length > 1) {
      const filtered = purchases.filter((p) => p.id !== id)
      setPurchases(filtered)
      setActiveTab(filtered[0].id)
    }
  }

  const updatePurchase = (id, updates) => {
    setPurchases(purchases.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const activePurchase = purchases.find((p) => p.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Purchase Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and track your purchases with ease</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-0 overflow-x-auto pb-0">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="relative flex-shrink-0">
                <button
                  onClick={() => setActiveTab(purchase.id)}
                  className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors relative ${
                    activeTab === purchase.id ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {purchase.name}
                  {activeTab === purchase.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                {purchases.length > 1 && (
                  <button
                    onClick={() => removePurchase(purchase.id)}
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
            onClick={addPurchase}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            + Add Purchase
          </button>
        </div>

        {/* Purchase Form */}
        {activePurchase && (
          <PurchaseForm purchase={activePurchase} onUpdate={(updates) => updatePurchase(activePurchase.id, updates)} />
        )}
      </div>
    </div>
  )
}
