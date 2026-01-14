"use client"

import { useState } from "react"
import TabsNav from "./TabsNav"
import BasicInfo from "./FormSections/BasicInfo"
import PricingTab from "./FormSections/PricingTab"
import StockTab from "./FormSections/StockTab"
import { BiCloset } from "react-icons/bi"
import { IoClose } from "react-icons/io5"

export default function ItemForm({ type, onTypeChange, onSubmit, onClose }) {
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    unit: "piece",
    image: null,
    salePrice: "",
    purchasePrice: "",
    wholesalePrice: "",
    minWholesaleQty: "",
    openingQuantity: "",
    atPrice: "",
    minStock: "",
    location: "",
    asOfDate: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddPrice = () => {
    setFormData((prev) => ({
      ...prev,
      wholePrices: [...(prev.wholePrices || []), { price: "", qty: "" }],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "stock", label: "Stock", icon: "📦" },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Add Item</h2>

          {/* Type Toggle */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-medium text-muted-foreground">Product</span>
            <button
              type="button"
              onClick={() => onTypeChange(type === "product" ? "service" : "product")}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                type === "service" ? "bg-black" : "bg-gray-400"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  type === "service" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-muted-foreground">Service</span>
          </div>
        </div>

        <button type="button" onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <TabsNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === "basic" && <BasicInfo formData={formData} onChange={handleInputChange} type={type} />}
        {activeTab === "pricing" && <PricingTab formData={formData} onChange={handleInputChange} />}
        {activeTab === "stock" && <StockTab formData={formData} onChange={handleInputChange} />}
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
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
        >
          Save Item
        </button>
      </div>
    </form>
  )
}
