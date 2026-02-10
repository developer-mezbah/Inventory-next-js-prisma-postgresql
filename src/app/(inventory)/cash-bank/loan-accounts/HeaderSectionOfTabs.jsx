import { useFetchData } from '@/hook/useFetchData';
import React, { useState } from 'react';
import { BiLoader, BiPlus } from 'react-icons/bi';
import PaymentSection from './PaymentSection';
import useOutsideClick from '@/hook/useOutsideClick';
import client_api from '@/utils/API_FETCH';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

const HeaderSection = ({ data, refetch }) => {
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");
  const [processingFeePaymentType, setProcessingFeePaymentType] = useState("Cash");
  const [formData, setFormData] = useState({
    accountName: '',
    lenderBank: '',
    accountNumber: '',
    description: '',
    balanceAsOfDate: '',
    currentBalance: '',
    interestRate: '',
    termDuration: '',
    processingFee: '',
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useOutsideClick(() => setShowModal(false));

  const formatDateForInput = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formatDateForDisplay = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'balanceAsOfDate') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const { data: session } = useSession()
  const handleSubmit = () => {

    if (!formData.accountName || !formData.currentBalance) {
      toast.error("Please fill in all required fields (Account Name and Current Balance).");
      return;
    }
    setLoading(true);
    // Prepare submission data according to your specified format
    const submissionData = {
      accountName: formData.accountName,
      lenderBank: formData.lenderBank,
      accountNumber: formData.accountNumber,
      description: formData.description,
      balanceAsOfDate: formData.balanceAsOfDate ? new Date(formData.balanceAsOfDate) : null,
      currentBalance: parseFloat(formData.currentBalance) || 0,
      loanReceivedIn: paymentType,
      loanReceivedInId: paymentType?.id || "",
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
      termDurationMonths: formData.termDuration ? parseInt(formData.termDuration) : null,
      processingFee: formData.processingFee ? parseFloat(formData.processingFee) : null,
      processingFeePaidFrom: processingFeePaymentType || "Cash", // Convert to boolean
      processingFeePaidFromId: processingFeePaymentType?.id || "",
      userId: session?.user?.id
    };

    client_api.create("/api/loan-accounts", "", submissionData).then(res => {
      if (res.status) {
        toast.success("Loan account created successfully:");
        // Optionally refetch data if needed
        if (refetch) {
          refetch();
        }
      } else {
        console.error("Failed to create loan account:", res.message);
      }
    }).catch(err => {
      console.error("Error creating loan account:", err);
      toast.error("Failed to create loan account. Please try again.")
    }).finally(() => {
      setLoading(false);
      setShowModal(false);
      setPaymentType("Cash");
      setProcessingFeePaymentType("Cash");
      // Reset form
      setFormData({
        accountName: '',
        lenderBank: '',
        accountNumber: '',
        description: '',
        balanceAsOfDate: '',
        currentBalance: '',
        interestRate: '',
        termDuration: '',
        processingFee: '',
      });
    });





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
          <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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
              {/* Account Name (Required) and Lender Bank */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Enter account name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lender Bank
                  </label>
                  <input
                    type="text"
                    name="lenderBank"
                    value={formData.lenderBank}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Enter lender bank name"
                  />
                </div>
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
                    <span>{formatDateForDisplay(formData.balanceAsOfDate)}</span>
                  </label>

                  <input
                    id='calanderBa'
                    type="date"
                    name="balanceAsOfDate"
                    value={formData.balanceAsOfDate}
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
                    <PaymentSection
                      refetch={refetch}
                      bankData={data?.bank || []}
                      cashData={data?.cash || []}
                      paymentType={processingFeePaymentType}
                      onPaymentTypeChange={setProcessingFeePaymentType}
                      compact={true}
                      showTitle={false}
                      title="Processing Fee Paid from"
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
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-1 transition-colors"
                  >
                    {loading ? <span><BiLoader className="inline mr-2 animate-spin" /> Saving...</span> : "Save Loan Account"}
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