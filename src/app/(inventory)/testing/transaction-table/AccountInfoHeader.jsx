'use client'

import { useState } from 'react'
import { FiCopy, FiShare2, FiChevronDown } from 'react-icons/fi'
import { SiGmail, SiWhatsapp } from 'react-icons/si'
import { MdOutlineSms } from 'react-icons/md'
import useOutsideClick from '@/hook/useOutsideClick'

const AccountInfoHeader = ({ account }) => {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [copied, setCopied] = useState(null)

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleShare = (platform) => {
    const text = `Account: ${account.accountdisplayname} (${account.BankName})`
    
    switch(platform) {
      case 'email':
        window.location.href = `mailto:?subject=Account Details&body=${encodeURIComponent(text)}`
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
        break
      case 'sms':
        window.location.href = `sms:?body=${encodeURIComponent(text)}`
        break
    }
    setIsShareOpen(false)
  }

  const socialRef = useOutsideClick(() => setIsShareOpen(false));
  const actionRef = useOutsideClick(() => setIsActionOpen(false));

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header with title and buttons */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-sm font-medium text-gray-600">Account Information</h2>
          <p className="mt-1 text-lg font-semibold text-gray-900">{account.accountdisplayname}</p>
        </div>
        
        <div ref={socialRef} className="flex gap-3">
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiShare2 className="w-4 h-4" />
              Share
              <FiChevronDown className={`w-4 h-4 transition-transform ${isShareOpen ? 'rotate-180' : ''}`} />
            </button>

            {isShareOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                <button
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 transition-colors"
                >
                  <SiGmail className="w-4 h-4 text-red-500" />
                  Email
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 transition-colors"
                >
                  <SiWhatsapp className="w-4 h-4 text-green-500" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('sms')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                >
                  <MdOutlineSms className="w-4 h-4 text-blue-500" />
                  SMS
                </button>
              </div>
            )}
          </div>

          {/* Action Dropdown */}
          <div ref={actionRef} className="relative">
            <button
              onClick={() => setIsActionOpen(!isActionOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Deposit / Withdraw
              <FiChevronDown className={`w-4 h-4 transition-transform ${isActionOpen ? 'rotate-180' : ''}`} />
            </button>

            {isActionOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 transition-colors">
                  Bank to Cash Transfer
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 transition-colors">
                  Cash to Bank Transfer
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 transition-colors">
                  Bank to Bank Transfer
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  Adjust Bank Balance
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bank Name */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Bank Name</label>
          <p className="mt-1 text-sm font-semibold text-gray-900">{account.BankName}</p>
        </div>

        {/* Account Number */}
        {account.accountnumber && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Number</label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{account.accountnumber}</p>
              <button
                onClick={() => handleCopy(account.accountnumber, 'account')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy account number"
              >
                <FiCopy className="w-4 h-4" />
              </button>
              {copied === 'account' && <span className="text-xs text-green-600">Copied!</span>}
            </div>
          </div>
        )}

        {/* IFSC Code */}
        {account.IFSCCode && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">IFSC Code</label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{account.IFSCCode}</p>
              <button
                onClick={() => handleCopy(account.IFSCCode, 'ifsc')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy IFSC code"
              >
                <FiCopy className="w-4 h-4" />
              </button>
              {copied === 'ifsc' && <span className="text-xs text-green-600">Copied!</span>}
            </div>
          </div>
        )}

        {/* UPI ID */}
        {account.UPIID && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">UPI ID</label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{account.UPIID}</p>
              <button
                onClick={() => handleCopy(account.UPIID, 'upi')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy UPI ID"
              >
                <FiCopy className="w-4 h-4" />
              </button>
              {copied === 'upi' && <span className="text-xs text-green-600">Copied!</span>}
            </div>
          </div>
        )}

        {/* Account Holder Name */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Holder</label>
          <p className="mt-1 text-sm font-semibold text-gray-900">{account.AccountHolderName}</p>
        </div>
      </div>
    </div>
  )
}

export default AccountInfoHeader
