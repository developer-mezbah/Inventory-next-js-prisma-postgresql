"use client"

import { useState } from "react"
import { FiShare2, FiPrinter, FiSave } from "react-icons/fi"
import PartySelector from "./PartySelector"
import ItemsTable from "./ItemsTable"
import PaymentSection from "./PaymentSection"

export default function PurchaseForm({ purchase, onUpdate }) {
  const [selectedParty, setSelectedParty] = useState(null)
  const [billNumber, setBillNumber] = useState("")
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [images, setImages] = useState([])
  const [items, setItems] = useState(purchase.items.length ? purchase.items : [{
    id: 1762926852456,
    item: "",
    qty: 1,
    unit: "NONE",
    price: 0,
    amount: 0
}])

  const [paymentType, setPaymentType] = useState("Cash")
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [description, setDescription] = useState("")

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discountAmount = (itemsTotal * discount) / 100
    const taxAmount = ((itemsTotal - discountAmount) * tax) / 100
    return itemsTotal - discountAmount + taxAmount
  }

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), item: "", qty: 1, unit: "NONE", price: 0, amount: 0 }])
  }

  const handleUpdateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "qty" || field === "price") {
            updated.amount = (updated.qty || 0) * (updated.price || 0)
          }
          return updated
        }
        return item
      }),
    )
  }

  const handleDeleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSave = () => {
    onUpdate({
      items,
      total: calculateTotal(),
      selectedParty,
      billNumber,
      billDate,
      phoneNumber,
      paymentType,
      discount,
      tax,
      description,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Actions */}
      <div className="border-b border-gray-200 p-4 sm:p-6 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Purchase Details</h2>
        <div className="flex flex-wrap gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
            <FiPrinter className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={handleSave} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Save">
            <FiSave className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Search and Date Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PartySelector selectedParty={selectedParty} onSelect={setSelectedParty} />
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone NO.</label>
            <input
              type="number"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Bill Number</label>
            <input
              type="text"
              placeholder="Bill Number"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:justify-end lg:max-w-sm">
          <div className="min-w-50">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Bill Date</label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Items Table */}
        <ItemsTable
          items={items}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />

        {/* Totals and Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <PaymentSection paymentType={paymentType} onPaymentTypeChange={setPaymentType} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount ({discount}%)</span>
                <span className="font-medium text-gray-900">
                  -${((items.reduce((sum, item) => sum + (item.amount || 0), 0) * discount) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({tax}%)</span>
                <span className="font-medium text-gray-900">
                  +$
                  {(
                    (((items.reduce((sum, item) => sum + (item.amount || 0), 0) * (100 - discount)) / 100) * tax) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Discount and Tax Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Save Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
