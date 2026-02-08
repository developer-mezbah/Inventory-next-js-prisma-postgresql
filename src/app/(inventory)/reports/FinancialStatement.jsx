import { useFetchData } from '@/hook/useFetchData';
import React from 'react';

const FinancialStatement = () => {
  const {
    isInitialLoading,
    error,
    data = null,
    refetch,
  } = useFetchData("/api/reports?id=financial-statement", ["reports-financial-statement"]);

  // Handle loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 h-96"></div>
              <div className="bg-white rounded-lg shadow-md p-6 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading financial statement: {error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default data if API returns null
  const financialData = data || {
    // Profit & Loss Summary
    grossProfit: 100.00,
    otherIncome: 0.00,
    indirectExpenses: {
      otherExpense: 0.00,
      loanInterestExpense: 0.00,
      loanProcessingFeeExpense: 0.00,
      loanChargesExpense: 0.00,
    },
    netProfit: 100.00,
    
    // Particulars
    particulars: {
      saleAmount: 100.00,
      creditNote: 0.00,
      saleFA: 0.00,
      purchaseAmount: 232.00,
      debitNote: 0.00,
      purchaseFA: 0.00,
      otherDirectExpenses: 0.00,
      paymentInDiscount: 0.00,
      taxPayable: 0.00,
      tcsPayable: 0.00,
    },
    
    // Currency info
    currencySymbol: '₺',
    currencyCode: 'TRY',
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} ${financialData.currencySymbol || '$'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Container */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Financial Statement
          </h1>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Left Column - Profit Section */}
          <div className="bg-white rounded-lg shadow-md p-5 md:p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-3 border-b">
              Profit & Loss Summary
            </h2>
            
            <div className="space-y-4">
              {/* Gross Profit */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Gross Profit</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(financialData.grossProfit)}
                </span>
              </div>
              
              {/* Other Income */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Other Income (+)</span>
                </div>
                <span className={financialData.otherIncome > 0 ? "text-green-600" : "text-gray-500"}>
                  {formatCurrency(financialData.otherIncome)}
                </span>
              </div>
              
              {/* Indirect Expenses Section */}
              <div className="pt-2">
                <h3 className="text-gray-700 font-medium mb-3">Indirect Expenses(-)</h3>
                <div className="ml-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Other Expense</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.indirectExpenses?.otherExpense || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loan Interest Expense</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.indirectExpenses?.loanInterestExpense || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loan Processing Fee Expense</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.indirectExpenses?.loanProcessingFeeExpense || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loan Charges Expense</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.indirectExpenses?.loanChargesExpense || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Net Profit */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-800">Net Profit</span>
                <span className={`text-2xl font-bold ${
                  financialData.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financialData.netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Particulars Section */}
          <div className="bg-white rounded-lg shadow-md p-5 md:p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-3 border-b">
              Particulars
            </h2>
            
            <div className="space-y-5">
              {/* Sale (+) */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">+</span>
                  Sale (+)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(financialData.particulars?.saleAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Credit Note (-) */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">-</span>
                  Credit Note (-)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.creditNote || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sale FA (+) */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">+</span>
                  Sale FA (+)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.saleFA || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Purchase (-) */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">-</span>
                  Purchase (-)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(financialData.particulars?.purchaseAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Debit Note (+) */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">+</span>
                  Debit Note (+)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.debitNote || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Purchase FA (-) */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">-</span>
                  Purchase FA (-)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.purchaseFA || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Direct Expenses */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">-</span>
                  Direct Expenses(-)
                </h3>
                <div className="ml-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Direct Expenses (-)</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.otherDirectExpenses || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment-in Discount (-)</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.paymentInDiscount || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tax Payable */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">-</span>
                  Tax Payable (-)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Payable (-)</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.taxPayable || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* TCS Payable */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">-</span>
                  TCS Payable (-)
                </h3>
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TCS Payable (-)</span>
                    <span className="text-gray-500">
                      {formatCurrency(financialData.particulars?.tcsPayable || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Bar - For Mobile */}
        <div className="lg:hidden mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Net Profit</p>
              <p className={`text-lg font-bold ${
                financialData.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(financialData.netProfit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Gross Profit</p>
              <p className="text-md font-semibold text-green-600">
                {formatCurrency(financialData.grossProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Currency Info */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          All amounts are in {financialData.currencyCode || 'TRY'} ({financialData.currencySymbol || '$'})
        </div>
      </div>
    </div>
  );
};

export default FinancialStatement;