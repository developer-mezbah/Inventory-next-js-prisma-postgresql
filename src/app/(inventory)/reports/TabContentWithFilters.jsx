// components/TabContent/TabContentWithFilters.jsx
"use client";
import { useFetchData } from '@/hook/useFetchData';
import React, { useState, useMemo, useCallback } from 'react';
import { 
  FiFilter, 
  FiCalendar, 
  FiDollarSign, 
  FiCreditCard,
  FiActivity,
  FiBarChart2,
  FiChevronDown,
  FiSearch,
  FiX
} from 'react-icons/fi';

const TabContentWithFilters = ({
  title = "Tab Content",
  description = "This is a tab content component",
  type = "report",
  isMobile = false,
  onRefresh,
  onExport,
  onPrint,
  onAddNew
}) => {
  // State for filters
  const [dateRange, setDateRange] = useState('This Month');
  const [customDateFrom, setCustomDateFrom] = useState('01/01/2024');
  const [customDateTo, setCustomDateTo] = useState('31/12/2024');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');


 const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/reports?id=sales", ["reports-sales"]);
console.log(data);


  // Options for dropdowns
  const entities = ['All', 'Firm A', 'Firm B', 'Firm C', 'Firm D', 'Firm E'];
  const timeFilters = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'This Quarter', 'This Year', 'Custom'];

  // Sample data
  const sampleData = useMemo(() => [
    { id: 1, name: 'Transaction #001', date: '2024-01-15', amount: 1250.50, status: 'Completed', type: 'Sale' },
    { id: 2, name: 'Transaction #002', date: '2024-01-14', amount: 890.00, status: 'Pending', type: 'Purchase' },
    { id: 3, name: 'Transaction #003', date: '2024-01-13', amount: 2350.75, status: 'Completed', type: 'Sale' },
    { id: 4, name: 'Transaction #004', date: '2024-01-12', amount: 450.25, status: 'Cancelled', type: 'Return' },
    { id: 5, name: 'Transaction #005', date: '2024-01-11', amount: 1780.00, status: 'Completed', type: 'Purchase' },
  ], []);

  // Filter data based on search and entity
  const filteredData = useMemo(() => {
    let filtered = sampleData;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Entity filter (simulated)
    if (selectedEntity !== 'All') {
      filtered = filtered.filter(item => item.name.includes(selectedEntity));
    }
    
    return filtered;
  }, [sampleData, searchTerm, selectedEntity]);

  // Get stats based on filtered data
  const stats = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const completedCount = filteredData.filter(item => item.status === 'Completed').length;
    const pendingCount = filteredData.filter(item => item.status === 'Pending').length;
    const avgAmount = filteredData.length > 0 ? totalAmount / filteredData.length : 0;
    
    return {
      totalAmount,
      totalCount: filteredData.length,
      completedCount,
      pendingCount,
      avgAmount
    };
  }, [filteredData]);

  // Render Calendar Component
  const renderCalendar = () => (
    <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-2xl border p-4 md:p-6 w-80 md:w-96">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Select Date Range</h3>
        <button 
          onClick={() => setShowCalendar(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={customDateFrom}
            onChange={(e) => setCustomDateFrom(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={customDateTo}
            onChange={(e) => setCustomDateTo(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Quick Select</h4>
        <div className="grid grid-cols-2 gap-2">
          {['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'This Year'].map(option => (
            <button
              key={option}
              onClick={() => {
                setDateRange(option);
                setShowCalendar(false);
              }}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button 
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
          onClick={() => setShowCalendar(false)}
        >
          Cancel
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {
            setShowCalendar(false);
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );

  // Render Stats Cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Amount Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Total Amount</h3>
          <FiDollarSign className="text-blue-600 text-xl" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          ${stats.totalAmount.toFixed(2)}
        </div>
        <div className="text-gray-600">{stats.totalCount} items</div>
      </div>
      
      {/* Completed Card */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
          <FiCreditCard className="text-green-600 text-xl" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stats.completedCount}</div>
        <div className="text-gray-600">Completed transactions</div>
      </div>
      
      {/* Pending Card */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Pending</h3>
          <FiActivity className="text-purple-600 text-xl" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stats.pendingCount}</div>
        <div className="text-gray-600">Awaiting action</div>
      </div>
      
      {/* Average Card */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Average</h3>
          <FiBarChart2 className="text-orange-600 text-xl" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          ${stats.avgAmount.toFixed(2)}
        </div>
        <div className="text-gray-600">Average per item</div>
      </div>
    </div>
  );

  // Render Filter Section
  const renderFilterSection = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <FiFilter className="text-blue-600 text-xl" />
        <h2 className="text-xl font-semibold text-gray-800">Filter Options</h2>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        {/* Date Range Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg transition-colors min-w-[150px]"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <FiCalendar />
            <span>{dateRange}</span>
            <FiChevronDown />
          </button>
          {showCalendar && renderCalendar()}
        </div>
        
        {/* Entity Selection */}
        <div className="relative">
          <select 
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg transition-colors appearance-none pr-10 cursor-pointer min-w-[120px]"
          >
            {entities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
        </div>
        
        {/* Date Display */}
        <div className="text-lg font-medium text-blue-600">
          {customDateFrom} To {customDateTo}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );

  // Render Data Table
  const renderDataTable = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-gray-700 font-semibold">Name</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Date</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Amount</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Status</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-gray-600">{item.date}</td>
                <td className="p-4 font-bold text-gray-900">
                  ${item.amount.toFixed(2)}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    item.type === 'Sale' ? 'bg-green-100 text-green-800' :
                    item.type === 'Purchase' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedEntity('All');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
        <div className="flex items-center gap-2 mt-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {type.toUpperCase()}
          </span>
          <span className="text-sm text-gray-500">
            Showing {filteredData.length} of {sampleData.length} records
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filter Section */}
      {renderFilterSection()}

      {/* Data Table */}
      {renderDataTable()}
    </div>
  );
};

export default TabContentWithFilters;