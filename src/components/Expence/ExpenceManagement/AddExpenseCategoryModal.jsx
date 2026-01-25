import { useState } from 'react';
import { PiMarkerCircleDuotone } from 'react-icons/pi';

const AddExpenseCategoryModal = ({ isOpen, onClose, onSave }) => {
  const [expenseType, setExpenseType] = useState('Indirect Expense');
  const [categoryName, setCategoryName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (categoryName.trim()) {
      onSave({
        name: categoryName,
        type: expenseType
      });
      setCategoryName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setCategoryName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          
          {/* Modal header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Expense Category
              </h3>
              <button
                onClick={handleCancel}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PiMarkerCircleDuotone className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4">
            {/* Expense Category Name */}
            <div className="mb-6">
              <label 
                htmlFor="category-name" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Expense Category
              </label>
              <input
                type="text"
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category name"
              />
            </div>

            {/* Expense Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Expense Type
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="indirect-expense"
                    name="expense-type"
                    value="Indirect Expense"
                    checked={expenseType === 'Indirect Expense'}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label 
                    htmlFor="indirect-expense" 
                    className="ml-3 block text-sm text-gray-700"
                  >
                    Indirect Expense
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="direct-expense"
                    name="expense-type"
                    value="Direct Expense"
                    checked={expenseType === 'Direct Expense'}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label 
                    htmlFor="direct-expense" 
                    className="ml-3 block text-sm text-gray-700"
                  >
                    Direct Expense
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="other-expense"
                    name="expense-type"
                    value="Other Expense"
                    checked={expenseType === 'Other Expense'}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label 
                    htmlFor="other-expense" 
                    className="ml-3 block text-sm text-gray-700"
                  >
                    Other Expense
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!categoryName.trim()}
                className="w-full sm:w-auto ml-0 sm:ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseCategoryModal;