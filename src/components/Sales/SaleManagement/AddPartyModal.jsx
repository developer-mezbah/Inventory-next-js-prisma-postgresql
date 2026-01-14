"use client"

import { useState } from "react"
import { FiX, FiSettings, FiEye, FiPlus } from "react-icons/fi"

export default function AddPartyModal({ isOpen, onClose, onSave, partyModalRef }) {
  const [activeTab, setActiveTab] = useState("address")
  const [formData, setFormData] = useState({
    partyName: "",
    phoneNumber: "",
    address: {
      emailId: "",
      billingAddress: "",
      shippingAddress: "",
    },
    creditBalance: {
      openingBalance: "",
      creditLimitType: "noLimit",
      customLimit: "",
      asOfDate: "",
    },
    additionalFields: [
      { id: 1, name: "", value: "", type: "text", checked: false },
      { id: 2, name: "", value: "", type: "text", checked: false },
      { id: 3, name: "", value: "", type: "text", checked: false },
      { id: 4, name: "", value: "", type: "date", checked: false },
    ],
  })

  const handlePartyNameChange = (e) => {
    setFormData({ ...formData, partyName: e.target.value })
  }

  const handlePhoneChange = (e) => {
    setFormData({ ...formData, phoneNumber: e.target.value })
  }

  const handleAddressChange = (field, value) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [field]: value },
    })
  }

  const handleCreditBalanceChange = (field, value) => {
    setFormData({
      ...formData,
      creditBalance: { ...formData.creditBalance, [field]: value },
    })
  }

  const handleAdditionalFieldChange = (id, field, value) => {
    setFormData({
      ...formData,
      additionalFields: formData.additionalFields.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    })
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={partyModalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Party</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <FiSettings className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Party Name and Phone */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              Party Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.partyName}
              onChange={handlePartyNameChange}
              placeholder="Enter party name"
              className="w-full px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-0 px-6 overflow-x-auto">
            {["address", "creditBalance", "additionalFields"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`sm:px-6 px-2 py-3 font-medium ${i != 0 ? "border-l-2": "border-l-0"} text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-blue-600 border-b-2 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
                style={activeTab === tab ? {
                    color: "#2563EB",
                    borderBottomColor: "#2563EB",
                }: { borderBottomColor: "transparent", color: "#4B5563" }}
              >
                {tab === "address" && "Address"}
                {tab === "creditBalance" && "Credit & Balance"}
                {tab === "additionalFields" && "Additional Fields"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                <input
                  type="email"
                  value={formData.address.emailId}
                  onChange={(e) => handleAddressChange("emailId", e.target.value)}
                  placeholder="Enter email ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                  <textarea
                    value={formData.address.billingAddress}
                    onChange={(e) => handleAddressChange("billingAddress", e.target.value)}
                    placeholder="Enter billing address"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                  <textarea
                    value={formData.address.shippingAddress}
                    onChange={(e) => handleAddressChange("shippingAddress", e.target.value)}
                    placeholder="Enter shipping address"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                    <FiPlus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>
              </div>

              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 mt-4">
                <FiEye className="w-4 h-4" />
                Show Detailed Address
              </button>
            </div>
          )}

          {/* Credit & Balance Tab */}
          {activeTab === "creditBalance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
                  <input
                    type="number"
                    value={formData.creditBalance.openingBalance}
                    onChange={(e) => handleCreditBalanceChange("openingBalance", e.target.value)}
                    placeholder="Enter opening balance"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">As Of Date</label>
                  <input
                    type="date"
                    value={formData.creditBalance.asOfDate}
                    onChange={(e) => handleCreditBalanceChange("asOfDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Credit Limit</label>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="creditLimit"
                      value="noLimit"
                      checked={formData.creditBalance.creditLimitType === "noLimit"}
                      onChange={(e) => handleCreditBalanceChange("creditLimitType", e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-blue-600">No Limit</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="creditLimit"
                      value="customLimit"
                      checked={formData.creditBalance.creditLimitType === "customLimit"}
                      onChange={(e) => handleCreditBalanceChange("creditLimitType", e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Custom Limit</span>
                  </label>

                  {formData.creditBalance.creditLimitType === "customLimit" && (
                    <input
                      type="number"
                      value={formData.creditBalance.customLimit}
                      onChange={(e) => handleCreditBalanceChange("customLimit", e.target.value)}
                      placeholder="Enter custom limit"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Fields Tab */}
          {activeTab === "additionalFields" && (
            <div className="space-y-4">
              {formData.additionalFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={field.checked}
                    onChange={(e) => handleAdditionalFieldChange(field.id, "checked", e.target.checked)}
                    className="w-4 h-4 mt-3 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 flex gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleAdditionalFieldChange(field.id, "name", e.target.value)}
                      placeholder={`Additional Field ${index + 1} Name`}
                      className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {field.type === "date" && (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleAdditionalFieldChange(field.id, "value", e.target.value)}
                        placeholder="dd/mm/yyyy"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            Save & New
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
