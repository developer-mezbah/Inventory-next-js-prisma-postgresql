"use client"

import useOutsideClick from "@/hook/useOutsideClick"
import { useState } from "react"
import { FiChevronDown, FiPlus } from "react-icons/fi"
import BankAccountForm from "../../CashAndBank/BankAccounts/BankAccountForm"

export default function PaymentSection({ paymentType, onPaymentTypeChange, cashData, bankData, refetch }) {
  const paymentTypes = ["Cash", "Cheque", "Bkash", "Card"]
  const [isOpen, setIsOpen] = useState(false)
  const [isCreateModal, setCreateModal] = useState(false)

  const dropdowRef = useOutsideClick(() => setIsOpen(false));

  return (
    <>
      {isCreateModal && <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50
    transition-opacity">
        <div className="lg:w-4xl"><BankAccountForm isShowForm={isCreateModal} onClose={() => {
          setCreateModal(false)
          setIsOpen(true)
        }} refetch={refetch} /></div></div>}
      <div className="space-y-4">
        <div ref={dropdowRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span className="text-sm">{paymentType?.accountdisplayname || "Cash"}</span>
            <FiChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {isOpen && (
            <div className="absolute overflow-y-scroll max-h-60 z-50 w-full sm:w-48 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setCreateModal(true)
                }}
                className="w-full px-4 py-3 text-left text-blue-600 font-medium text-sm hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100"
              >
                <FiPlus className="w-4 h-4" />
                Add Payment Type
              </button>
              <button
              onClick={() => {
                    onPaymentTypeChange("Cash")
                    setIsOpen(false)
                  }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
              >
                Cash
              </button>
              {bankData.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    onPaymentTypeChange(type)
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
                >
                  {type?.accountdisplayname}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
