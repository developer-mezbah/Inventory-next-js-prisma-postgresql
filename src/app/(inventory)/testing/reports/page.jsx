"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import { TbReportMoney, TbReport } from 'react-icons/tb';
import TabContentWithFilters from './TabContentWithFilters';



// Import missing icons
const FiTrendingUp = () => <span>📈</span>;
const FiShoppingCart = () => <span>🛒</span>;
const FiBook = () => <span>📖</span>;
const FiFileText = () => <span>📄</span>;
const FiTrendingDown = () => <span>📉</span>;
const FiActivity = () => <span>📊</span>;
const FiBarChart2 = () => <span>📊</span>;
const FiCreditCard = () => <span>💳</span>;
const FiUsers = () => <span>👥</span>;
const FiPackage = () => <span>📦</span>;
const FiSettings = () => <span>⚙️</span>;

// Menu configuration
const menuItems = [
  { 
    id: 'transaction-report', 
    icon: <TbReport />, 
    label: 'Transaction report', 
    description: 'All transaction details', 
    component: TabContentWithFilters,
    type: 'report'
  },
  { 
    id: 'sale', 
    icon: <FiTrendingUp />, 
    label: 'Sale', 
    description: 'Sales reports and analytics', 
    component: () => <div>Sale Report Component</div>,
    type: 'sale'
  },
  { 
    id: 'purchase', 
    icon: <FiShoppingCart />, 
    label: 'Purchase', 
    description: 'Purchase reports', 
    component: () => <div>Purchase Report Component</div>,
    type: 'purchase'
  },
  { 
    id: 'day-book', 
    icon: <FiBook />, 
    label: 'Day book', 
    description: 'Daily transaction records', 
    component: () => <div>Day Book Component</div>,
    type: 'accounting'
  },
  { 
    id: 'all-transactions', 
    icon: <FiFileText />, 
    label: 'All Transactions', 
    description: 'Complete transaction history', 
    component: () => <div>All Transactions Component</div>,
    type: 'report'
  },
  { 
    id: 'profit-loss', 
    icon: <FiTrendingDown />, 
    label: 'Profit And Loss', 
    description: 'Financial performance', 
    component: () => <div>Profit And Loss Component</div>,
    type: 'financial'
  },
  { 
    id: 'bill-wise-profit', 
    icon: <TbReportMoney />, 
    label: 'Bill Wise Profit', 
    description: 'Profit by bill', 
    component: () => <div>Bill Wise Profit Component</div>,
    type: 'financial'
  },
  { 
    id: 'cash-flow', 
    icon: <FiActivity />, 
    label: 'Cash flow', 
    description: 'Cash flow analysis', 
    component: () => <div>Cash Flow Component</div>,
    type: 'financial'
  },
  { 
    id: 'trial-balance', 
    icon: <FiBarChart2 />, 
    label: 'Trial Balance Report', 
    description: 'Accounting trial balance', 
    component: () => <div>Trial Balance Component</div>,
    type: 'accounting'
  },
  { 
    id: 'balance-sheet', 
    icon: <FiCreditCard />, 
    label: 'Balance Sheet', 
    description: 'Financial position', 
    component: () => <div>Balance Sheet Component</div>,
    type: 'financial'
  },
  { 
    id: 'customers', 
    icon: <FiUsers />, 
    label: 'Customers', 
    description: 'Customer management', 
    component: () => <div>Customer Management Component</div>,
    type: 'management'
  },
  { 
    id: 'products', 
    icon: <FiPackage />, 
    label: 'Products', 
    description: 'Product catalog', 
    component: () => <div>Product Catalog Component</div>,
    type: 'management'
  },
  { 
    id: 'sales-orders', 
    icon: <FiTrendingUp />, 
    label: 'Sales Orders', 
    description: 'Order management', 
    component: () => <div>Sales Orders Component</div>,
    type: 'sale'
  },
  { 
    id: 'inventory', 
    icon: <FiPackage />, 
    label: 'Inventory', 
    description: 'Stock management', 
    component: () => <div>Inventory Management Component</div>,
    type: 'management'
  },
  { 
    id: 'settings', 
    icon: <FiSettings />, 
    label: 'Settings', 
    description: 'System configuration', 
    component: () => <div>System Settings Component</div>,
    type: 'settings'
  },
];


const Dashboard = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState('transaction-report');
  
  // Mobile states
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return menuItems.filter(item => 
      item.label.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.type.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

  // Color palette for items
  const colorPalette = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-green-100', text: 'text-green-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
    { bg: 'bg-red-100', text: 'text-red-800' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { bg: 'bg-gray-100', text: 'text-gray-800' },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle tab change with mobile view
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setMobileView('details');
    }
  }, [isMobile]);

  // Handle back to dashboard on mobile
  const handleBackToDashboard = useCallback(() => {
    if (isMobile) {
      setMobileView('dashboard');
    }
  }, [isMobile]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Get active item
  const activeItem = useMemo(() => 
    menuItems.find(item => item.id === activeTab), 
    [activeTab]
  );

  // Get the component for active tab
  const ActiveComponent = activeItem?.component || (() => null);

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Browse all available sections</p>
        <div className="text-sm text-gray-500 mt-1">{filteredItems.length} items</div>
      </header>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <FiSearch className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search sections..."
          className="w-full text-base text-gray-600 placeholder-gray-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="text-gray-500 hover:text-red-600 transition-colors p-1"
            aria-label="Clear Search"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Item List Box */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const colorStyle = colorPalette[index % colorPalette.length];
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg} ${colorStyle.text}`}
              >
                <button
                  onClick={() => handleTabChange(item.id)}
                  className="flex items-center w-full text-left"
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <div className="flex-grow">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-sm opacity-75 mt-1">{item.description}</div>
                  </div>
                  <FiChevronRight className="h-5 w-5 opacity-50" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500 italic">
            No items found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );

  // Render mobile details view
  const renderMobileDetailsView = () => (
    <div className="h-screen flex flex-col">
      {/* Back Button Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center space-x-4">
        <button
          onClick={handleBackToDashboard}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-grow">
          <h2 className="text-lg font-semibold truncate">
            {activeItem?.label || "Details"}
          </h2>
          <p className="text-sm text-gray-600 truncate">{activeItem?.description || "View details"}</p>
        </div>
      </div>

      {/* Render the active component */}
      <div className="flex-grow overflow-auto">
        <ActiveComponent isMobile={true} />
      </div>
    </div>
  );

  // Desktop view
  const renderDesktopView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 xl:w-72">
          <div className="bg-white rounded-xl shadow-md p-4 sticky top-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {filteredItems.length} items
                </span>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sections..."
                  className="w-full text-sm text-gray-600 bg-transparent focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Clear Search"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Item List */}
            <nav className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const colorStyle = colorPalette[index % colorPalette.length];
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors text-left ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className={`text-lg ${colorStyle.text}`}>
                        {item.icon}
                      </span>
                      <div className="flex-grow">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                      {activeTab === item.id && (
                        <FiChevronRight className="text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-gray-500 italic text-sm">
                  No items found for "{searchTerm}"
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header for active tab */}
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {activeItem?.label || 'Select a section'}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeItem?.description || 'Choose a section from the sidebar'}
            </p>
          </header>

          {/* Render the active component */}
          <ActiveComponent isMobile={false} />
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (isMobile) {
    return (
      <>
        {mobileView === 'dashboard' ? renderMobileListBox() : renderMobileDetailsView()}
      </>
    );
  }

  return renderDesktopView();
};

export default Dashboard;