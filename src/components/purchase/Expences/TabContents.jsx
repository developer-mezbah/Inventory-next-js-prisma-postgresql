import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useState, useMemo } from "react";
import TransactionsTable from "./TransactionsTable";

const TabContents = ({ expenses = [] }) => {
  const { currencySymbol, formatPrice } = useCurrencyStore();
  console.log(expenses);
  // Calculate totals
  const { totalAmount, balanceDue } = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { totalAmount: 0, balanceDue: 0 };
    }
    
    const total = expenses.reduce((sum, expense) => {
      // Use price from expense, default to 0
      return sum + (expense.price || 0);
    }, 0);
    
    // Calculate balance due from transactions
    const balance = expenses.reduce((sum, expense) => {
      if (expense.transaction && expense.transaction.length > 0) {
        // Assuming first transaction contains balance due
        return sum + (expense.transaction[0].balanceDue || 0);
      }
      return sum;
    }, 0);
    
    return { totalAmount: total, balanceDue: balance };
  }, [expenses]);
  
  // Get category name from first expense if available
  const categoryName = useMemo(() => {
    if (expenses.length > 0 && expenses[0].categoryId) {
      // In a real app, you might want to pass the category name as a prop
      // or look it up from a categories array
      return "Category Expenses";
    }
    return "Expenses";
  }, [expenses]);

  // Prepare transaction data for TransactionsTable
  const allTransactions = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    return expenses.flatMap(expense => {
      if (!expense.transaction || expense.transaction.length === 0) return [];
      
      return expense.transaction.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        invoiceNo: transaction.invoiceNo,
        description: transaction.description || `${expense.items?.length || 0} items`,
        amount: transaction.amount,
        balanceDue: transaction.balanceDue,
        type: transaction.type,
        paymentType: transaction.paymentType,
        // Add expense reference if needed
        expenseId: expense.id,
        expenseBillNumber: expense.billNumber,
        expenseItems: expense.items
      }));
    });
  }, [expenses]);

  if (!expenses || expenses.length === 0) {
    return (
      <div className="font-inter antialiased">
        {/* Main Card Container */}
        <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
          {/* Header Section */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              {/* Title and Link Icon (Left Side) */}
              <div className="flex items-center text-lg font-semibold text-gray-800">
                <span className="mr-1">{categoryName}</span>
              </div>

              {/* Action/Status Icons (Right Side) */}
              <div>
                <div className="text-right">
                  Total :{" "}
                  <span className="text-red-400">
                    {formatPrice ? formatPrice(0) : `0.00 ${currencySymbol}`}
                  </span>
                </div>
                <div className="text-right">
                  Balance :{" "}
                  <span className="text-red-400">
                    {formatPrice ? formatPrice(0) : `0.00 ${currencySymbol}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Bottom Border */}
          <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
          
          {/* Empty State */}
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No expenses found</p>
            <p className="text-gray-400 mt-1">Add expenses to this category to see them here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter antialiased">
      {/* Main Card Container */}
      <div className="w-full bg-white border sm:p-4 p-2 border-gray-300 rounded-xl shadow-md">
        {/* Header Section */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            {/* Title and Link Icon (Left Side) */}
            <div className="flex items-center text-lg font-semibold text-gray-800">
              <span className="mr-1">{categoryName}</span>
              <span className="ml-2 text-xs font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
              </span>
            </div>

            {/* Action/Status Icons (Right Side) */}
            <div>
              <div className="text-right">
                Total :{" "}
                <span className="text-red-400">
                  {formatPrice ? formatPrice(totalAmount) : `${totalAmount.toFixed(2)} ${currencySymbol}`}
                </span>
              </div>
              <div className="text-right">
                Balance :{" "}
                <span className={`${balanceDue > 0 ? 'text-red-400' : 'text-green-500'}`}>
                  {formatPrice ? formatPrice(balanceDue) : `${balanceDue.toFixed(2)} ${currencySymbol}`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Expense Summary */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium mr-1">Cash Expenses:</span>
              <span>
                {formatPrice ? 
                  formatPrice(expenses.filter(e => e.paymentType === 'Cash').reduce((sum, e) => sum + (e.price || 0), 0)) :
                  `${expenses.filter(e => e.paymentType === 'Cash').reduce((sum, e) => sum + (e.price || 0), 0).toFixed(2)} ${currencySymbol}`
                }
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">Latest:</span>
              <span>
                {expenses.length > 0 ? 
                  new Date(expenses[0].billDate || expenses[0].createdAt).toLocaleDateString() : 
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Border (Matching the bottom line in the image) */}
        <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
        
        {/* Pass the transactions to TransactionsTable */}
        <TransactionsTable transactions={allTransactions} />
        
        {/* Optional: Additional summary section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-gray-500">Total Expenses</div>
              <div className="text-xl font-semibold text-gray-800 mt-1">
                {formatPrice ? formatPrice(totalAmount) : `${totalAmount.toFixed(2)} ${currencySymbol}`}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-gray-500">Items Count</div>
              <div className="text-xl font-semibold text-gray-800 mt-1">
                {expenses.reduce((sum, expense) => sum + (expense.items?.length || 0), 0)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-gray-500">Average per Expense</div>
              <div className="text-xl font-semibold text-gray-800 mt-1">
                {formatPrice ? 
                  formatPrice(totalAmount / expenses.length) : 
                  `${(totalAmount / expenses.length).toFixed(2)} ${currencySymbol}`
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContents;