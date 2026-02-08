import { useFetchData } from '@/hook/useFetchData';
import React, { useState } from 'react';
import { BiPlus } from 'react-icons/bi';
import PaymentSection from './PaymentSection';

const HeaderSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");
  const [processingFeePaymentType, setProcessingFeePaymentType] = useState("Cash");
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    description: '',
    balanceAsOf: '08-02-2026',
    currentBalance: '',
    interestRate: '',
    termDuration: '',
    processingFee: '',
  });

  const {
    isInitialLoading,
    error,
    data = {},
    refetch,
  } = useFetchData("/api/purchase-init-data", ["purchase-init-data"]);

  const formatDateForInput = (dateStr) => {
    // Convert dd-mm-yyyy to yyyy-mm-dd for input type="date"
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formatDateForDisplay = (dateStr) => {
    // Convert yyyy-mm-dd to dd-mm-yyyy for display
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'balanceAsOf') {
      const formattedDate = formatDateForDisplay(value);
      // For date input, we need to handle the conversion
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    const submissionData = {
      ...formData,
      loanReceivedIn: paymentType,
      processingFeePaidFrom: processingFeePaymentType,
    };
    console.log('Form submitted:', submissionData);
    setShowModal(false);
    // Reset form
    setFormData({
      accountName: '',
      accountNumber: '',
      description: '',
      balanceAsOf: '08-02-2026',
      currentBalance: '',
      interestRate: '',
      termDuration: '',
      processingFee: '',
    });
    setPaymentType("Cash");
    setProcessingFeePaymentType("Cash");
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border-b border-gray-200 pr-10">
        {/* Left Section: Title */}
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="mr-4">
            <h1 className="text-xl font-bold text-gray-800">
              Loan Accounts
            </h1>
          </div>
        </div>

        {/* Right Section: Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            className="hidden sm:inline-flex items-center justify-center 
              bg-slate-100 hover:bg-slate-200 text-slate-700 
              text-sm font-semibold py-2.5 px-5 rounded-lg 
              border border-slate-200
              transition-all duration-200"
            onClick={() => console.log('View Loan Statement')}
          >
            View Loan Statement
          </button>

          <button
            className="flex-1 sm:flex-none inline-flex items-center justify-center 
              bg-emerald-600 hover:bg-emerald-700 text-white 
              text-sm font-semibold py-2.5 px-5 rounded-lg 
              shadow-sm hover:shadow-md 
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 
              transition-all duration-200"
            onClick={() => setShowModal(true)}
          >
            <BiPlus className="w-5 h-5 mr-2" />
            <span className="whitespace-nowrap">Add Loan Account</span>
          </button>
        </div>
      </div>

      {/* Modal for Add Loan Account */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Add Loan Account</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Reduced spacing */}
            <div className="p-4 space-y-4">
              {/* Account Name (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Lender Bank"
                  required
                />
              </div>

              {/* Account Number & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Enter description"
                  />
                </div>
              </div>

              {/* Balance Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor='calanderBa' className="block text-sm font-medium text-gray-700 mb-1">
                    Balance as of
                    <span>{formatDateForDisplay(formData.balanceAsOf)}</span>
                  </label>
                  
                  <input
                  id='calanderBa'
                    type="date"
                    name="balanceAsOf"
                    value={formData.balanceAsOf}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Balance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="currentBalance"
                    value={formData.currentBalance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Payment Type Section */}
              <div className="pt-3 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Payment Information</h3>
                <div className="mb-3">
                  <PaymentSection
                    refetch={refetch}
                    bankData={data?.bank || []}
                    cashData={data?.cash || []}
                    paymentType={paymentType}
                    onPaymentTypeChange={setPaymentType}
                    title="Loan received In"
                    compact={true}
                  />
                </div>
              </div>

              {/* Loan Terms */}
              <div className="pt-3 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Loan Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (% per annum)
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term Duration (in Months)
                    </label>
                    <input
                      type="number"
                      name="termDuration"
                      value={formData.termDuration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Processing Fee */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processing Fee
                    </label>
                    <input
                      type="number"
                      name="processingFee"
                      value={formData.processingFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processing Fee Paid from
                    </label>
                    <PaymentSection
                      refetch={refetch}
                      bankData={data?.bank || []}
                      cashData={data?.cash || []}
                      paymentType={processingFeePaymentType}
                      onPaymentTypeChange={setProcessingFeePaymentType}
                      compact={true}
                      showTitle={false}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 rounded-b-xl">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-1 transition-colors"
                  >
                    Save Loan Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderSection;