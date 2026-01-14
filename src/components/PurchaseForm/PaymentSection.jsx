"use client"

import useOutsideClick from "@/hook/useOutsideClick"
import { useState } from "react"
import { FiChevronDown, FiPlus } from "react-icons/fi"

export default function PaymentSection({ paymentType, onPaymentTypeChange }) {
  const paymentTypes = ["Cash", "Cheque", "Bkash", "Card"]
  const [isOpen, setIsOpen] = useState(false)

  const dropdowRef = useOutsideClick(() => setIsOpen(false));

  return (
    <div ref={dropdowRef} className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="text-sm">{paymentType}</span>
          <FiChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full sm:w-48 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {paymentTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onPaymentTypeChange(type)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 text-left text-blue-600 font-medium text-sm hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100"
            >
              <FiPlus className="w-4 h-4" />
              Add Payment Type
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bank A/C</label>
        <input
          type="text"
          placeholder="Select bank account"
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  )
}
