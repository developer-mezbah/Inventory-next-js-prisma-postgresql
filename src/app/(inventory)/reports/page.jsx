"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiBarChart,
  FiCalendar,
  FiUser,
  FiShoppingBag,
  FiBox,
  FiDatabase,
  FiLayers,
  FiRepeat,
  FiCreditCard,
  FiUsers,
  FiPackage,
  FiSettings,
  FiTrendingUp,
  FiShoppingCart,
  FiBook,
  FiFileText,
  FiTrendingDown,
  FiActivity,
  FiBarChart2,
  FiPercent,
  FiFile
} from 'react-icons/fi';
import { TbReportMoney, TbReport, TbReceiptTax } from 'react-icons/tb';
import { MdInventory, MdRequestQuote, MdAccountBalance } from 'react-icons/md';
import { GiReceiveMoney, GiPayMoney } from 'react-icons/gi';
import { AiOutlineStock } from 'react-icons/ai';
import { BsBank } from 'react-icons/bs';
import TabContentWithFilters from './TabContentWithFilters';
import SalePage from '@/components/Sales/SalePage';
import PurchaseTransactionReportPage from '@/components/purchase/PurchaseTransactionReportPage';
import AllTransactionPage from './AllTransactionsPage';
import FinancialStatement from './FinancialStatement';
import LoanAccounts from './LoanAccounts';

// Menu configuration with all items from images
const menuItems = [
  // Dashboard & Overview
  {
    id: 'dashboard-overview',
    icon: <FiHome />,
    label: 'Dashboard',
    description: 'Overview and key metrics',
    component: TabContentWithFilters,
    type: 'overview'
  },

  // ===== FROM FIRST IMAGE =====
  {
    id: 'sale',
    icon: <FiTrendingUp />,
    label: 'Sale',
    description: 'Sales reports and analytics',
    component: SalePage,
    type: 'sale'
  },
  {
    id: 'purchase',
    icon: <FiShoppingCart />,
    label: 'Purchase',
    description: 'Purchase reports',
    component: PurchaseTransactionReportPage,
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
    component: AllTransactionPage,
    type: 'report'
  },
  {
    id: 'profit-loss',
    icon: <FiTrendingDown />,
    label: 'Profit And Loss',
    description: 'Financial performance',
    component: FinancialStatement,
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
    id: 'trial-balance-report',
    icon: <FiBarChart2 />,
    label: 'Trial Balance Report',
    description: 'Accounting trial balance',
    component: () => <div>Trial Balance Report Component</div>,
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
    id: 'party-report',
    icon: <FiUsers />,
    label: 'Party report',
    description: 'Party related reports',
    component: () => <div>Party Report Component</div>,
    type: 'party'
  },
  {
    id: 'party-statement',
    icon: <FiFileText />,
    label: 'Party Statement',
    description: 'Party account statements',
    component: () => <div>Party Statement Component</div>,
    type: 'party'
  },
  {
    id: 'party-wise-profit-loss',
    icon: <FiTrendingDown />,
    label: 'Party wise Profit & Loss',
    description: 'Profit/Loss by party',
    component: () => <div>Party Wise Profit & Loss Component</div>,
    type: 'party'
  },
  {
    id: 'all-parties',
    icon: <FiUsers />,
    label: 'All parties',
    description: 'List of all parties',
    component: () => <div>All Parties Component</div>,
    type: 'party'
  },
  {
    id: 'party-report-by-item',
    icon: <FiPackage />,
    label: 'Party Report By Item',
    description: 'Item-wise party reports',
    component: () => <div>Party Report By Item Component</div>,
    type: 'party'
  },
  {
    id: 'sale-purchase-by-party',
    icon: <FiTrendingUp />,
    label: 'Sale Purchase By Party',
    description: 'Party-wise sales/purchase',
    component: () => <div>Sale Purchase By Party Component</div>,
    type: 'party'
  },
  {
    id: 'sale-purchase-by-party-group',
    icon: <FiUsers />,
    label: 'Sale Purchase By Party Group',
    description: 'Group-wise sales/purchase',
    component: () => <div>Sale Purchase By Party Group Component</div>,
    type: 'party'
  },

  // ===== FROM THIRD IMAGE =====
  {
    id: 'business-status',
    icon: <FiBarChart />,
    label: 'Business Status',
    description: 'Overall business health',
    component: () => <div>Business Status Component</div>,
    type: 'overview'
  },
  {
    id: 'bank-statement',
    icon: <BsBank />,
    label: 'Bank Statement',
    description: 'Bank transactions report',
    component: () => <div>Bank Statement Component</div>,
    type: 'banking'
  },
  {
    id: 'discount-report',
    icon: <FiPercent />,
    label: 'Discount Report',
    description: 'Discounts given/received',
    component: () => <div>Discount Report Component</div>,
    type: 'financial'
  },

  // Taxes Section
  {
    id: 'taxes',
    icon: <TbReceiptTax />,
    label: 'Taxes',
    description: 'Tax related reports',
    component: () => <div>Taxes Component</div>,
    type: 'tax'
  },
  {
    id: 'tax-report',
    icon: <TbReceiptTax />,
    label: 'Tax Report',
    description: 'Detailed tax reports',
    component: () => <div>Tax Report Component</div>,
    type: 'tax'
  },
  {
    id: 'tax-rate-report',
    icon: <FiPercent />,
    label: 'Tax Rate report',
    description: 'Tax rates configuration',
    component: () => <div>Tax Rate Report Component</div>,
    type: 'tax'
  },

  // Expense Reports
  {
    id: 'expense-report',
    icon: <FiDollarSign />,
    label: 'Expense report',
    description: 'Expense analysis',
    component: () => <div>Expense Report Component</div>,
    type: 'expense'
  },
  {
    id: 'expense',
    icon: <FiDollarSign />,
    label: 'Expense',
    description: 'Expense tracking',
    component: () => <div>Expense Component</div>,
    type: 'expense'
  },
  {
    id: 'expense-category-report',
    icon: <FiFileText />,
    label: 'Expense Category Report',
    description: 'Category-wise expenses',
    component: () => <div>Expense Category Report Component</div>,
    type: 'expense'
  },
  {
    id: 'expense-item-report',
    icon: <FiFileText />,
    label: 'Expense Item Report',
    description: 'Item-wise expenses',
    component: () => <div>Expense Item Report Component</div>,
    type: 'expense'
  },

  // Sale Order Reports
  {
    id: 'sale-order-report',
    icon: <MdRequestQuote />,
    label: 'Sale Order report',
    description: 'Sale order analysis',
    component: () => <div>Sale Order Report Component</div>,
    type: 'sale'
  },
  {
    id: 'sale-orders',
    icon: <MdRequestQuote />,
    label: 'Sale Orders',
    description: 'Manage sale orders',
    component: () => <div>Sale Orders Component</div>,
    type: 'sale'
  },
  {
    id: 'sale-order-item',
    icon: <FiPackage />,
    label: 'Sale Order Item',
    description: 'Item-wise sale orders',
    component: () => <div>Sale Order Item Component</div>,
    type: 'sale'
  },
  {
    id: 'loan-statement',
    icon: <MdAccountBalance />,
    label: 'Loan Statement',
    description: 'View loan transactions and statements',
    component: LoanAccounts,  
    type: 'loan'
  },
  // Previous Items (kept for completeness)
  {
    id: 'transaction-report',
    icon: <TbReport />,
    label: 'Transaction Report',
    description: 'All transaction details and history',
    component: TabContentWithFilters,
    type: 'report'
  },
  {
    id: 'sales-overview',
    icon: <FiTrendingUp />,
    label: 'Sales Overview',
    description: 'Sales performance and trends',
    component: () => <div>Sales Overview Component</div>,
    type: 'sale'
  },
  {
    id: 'sales-by-product',
    icon: <FiShoppingBag />,
    label: 'Sales by Product',
    description: 'Product-wise sales analysis',
    component: () => <div>Sales by Product Component</div>,
    type: 'sale'
  },
  {
    id: 'sales-by-customer',
    icon: <FiUsers />,
    label: 'Sales by Customer',
    description: 'Customer-wise sales breakdown',
    component: () => <div>Sales by Customer Component</div>,
    type: 'sale'
  },
  {
    id: 'sales-by-region',
    icon: <FiBarChart />,
    label: 'Sales by Region',
    description: 'Regional sales performance',
    component: () => <div>Sales by Region Component</div>,
    type: 'sale'
  },
  {
    id: 'sales-orders',
    icon: <MdRequestQuote />,
    label: 'Sales Orders',
    description: 'Order management and tracking',
    component: () => <div>Sales Orders Component</div>,
    type: 'sale'
  },
  {
    id: 'invoice-management',
    icon: <FiFileText />,
    label: 'Invoice Management',
    description: 'Create and manage invoices',
    component: () => <div>Invoice Management Component</div>,
    type: 'sale'
  },
  {
    id: 'purchase-overview',
    icon: <FiShoppingCart />,
    label: 'Purchase Overview',
    description: 'Purchase reports and analysis',
    component: () => <div>Purchase Overview Component</div>,
    type: 'purchase'
  },
  {
    id: 'purchase-orders',
    icon: <FiBox />,
    label: 'Purchase Orders',
    description: 'Manage purchase orders',
    component: () => <div>Purchase Orders Component</div>,
    type: 'purchase'
  },
  {
    id: 'expense-tracking',
    icon: <FiDollarSign />,
    label: 'Expense Tracking',
    description: 'Track and categorize expenses',
    component: () => <div>Expense Tracking Component</div>,
    type: 'purchase'
  },
  {
    id: 'vendor-management',
    icon: <FiUser />,
    label: 'Vendor Management',
    description: 'Manage vendor relationships',
    component: () => <div>Vendor Management Component</div>,
    type: 'purchase'
  },
  {
    id: 'inventory-overview',
    icon: <MdInventory />,
    label: 'Inventory Overview',
    description: 'Stock levels and status',
    component: () => <div>Inventory Overview Component</div>,
    type: 'inventory'
  },
  {
    id: 'inventory-valuation',
    icon: <AiOutlineStock />,
    label: 'Inventory Valuation',
    description: 'Stock valuation and costing',
    component: () => <div>Inventory Valuation Component</div>,
    type: 'inventory'
  },
  {
    id: 'stock-movement',
    icon: <FiRepeat />,
    label: 'Stock Movement',
    description: 'Track stock in/out movements',
    component: () => <div>Stock Movement Component</div>,
    type: 'inventory'
  },
  {
    id: 'low-stock-alerts',
    icon: <FiActivity />,
    label: 'Low Stock Alerts',
    description: 'Get alerts for low inventory',
    component: () => <div>Low Stock Alerts Component</div>,
    type: 'inventory'
  },
  {
    id: 'ledger',
    icon: <FiDatabase />,
    label: 'General Ledger',
    description: 'Complete accounting ledger',
    component: () => <div>General Ledger Component</div>,
    type: 'accounting'
  },
  {
    id: 'trial-balance',
    icon: <FiBarChart2 />,
    label: 'Trial Balance',
    description: 'Accounting trial balance report',
    component: () => <div>Trial Balance Component</div>,
    type: 'accounting'
  },
  {
    id: 'income-statement',
    icon: <FiPieChart />,
    label: 'Income Statement',
    description: 'Revenue and expenses summary',
    component: () => <div>Income Statement Component</div>,
    type: 'financial'
  },
  {
    id: 'customer-management',
    icon: <FiUsers />,
    label: 'Customer Management',
    description: 'Customer database and profiles',
    component: () => <div>Customer Management Component</div>,
    type: 'crm'
  },
  {
    id: 'customer-ledger',
    icon: <FiLayers />,
    label: 'Customer Ledger',
    description: 'Customer account statements',
    component: () => <div>Customer Ledger Component</div>,
    type: 'crm'
  },
  {
    id: 'receivables',
    icon: <GiPayMoney />,
    label: 'Accounts Receivable',
    description: 'Track money owed by customers',
    component: () => <div>Accounts Receivable Component</div>,
    type: 'crm'
  },
  {
    id: 'product-catalog',
    icon: <FiPackage />,
    label: 'Product Catalog',
    description: 'Manage products and services',
    component: () => <div>Product Catalog Component</div>,
    type: 'products'
  },
  {
    id: 'product-performance',
    icon: <FiTrendingUp />,
    label: 'Product Performance',
    description: 'Analyze product sales performance',
    component: () => <div>Product Performance Component</div>,
    type: 'products'
  },
  {
    id: 'service-management',
    icon: <FiSettings />,
    label: 'Service Management',
    description: 'Manage service offerings',
    component: () => <div>Service Management Component</div>,
    type: 'products'
  },
  {
    id: 'business-analytics',
    icon: <FiActivity />,
    label: 'Business Analytics',
    description: 'Advanced analytics and insights',
    component: () => <div>Business Analytics Component</div>,
    type: 'analytics'
  },
  {
    id: 'kpi-dashboard',
    icon: <FiBarChart />,
    label: 'KPI Dashboard',
    description: 'Key performance indicators',
    component: () => <div>KPI Dashboard Component</div>,
    type: 'analytics'
  },
  {
    id: 'forecasting',
    icon: <FiTrendingUp />,
    label: 'Sales Forecasting',
    description: 'Predict future sales trends',
    component: () => <div>Sales Forecasting Component</div>,
    type: 'analytics'
  },
  {
    id: 'system-settings',
    icon: <FiSettings />,
    label: 'System Settings',
    description: 'Configure system preferences',
    component: () => <div>System Settings Component</div>,
    type: 'settings'
  },
  {
    id: 'user-management',
    icon: <FiUsers />,
    label: 'User Management',
    description: 'Manage user accounts and permissions',
    component: () => <div>User Management Component</div>,
    type: 'settings'
  },
  {
    id: 'tax-configuration',
    icon: <FiDollarSign />,
    label: 'Tax Configuration',
    description: 'Set up tax rates and rules',
    component: () => <div>Tax Configuration Component</div>,
    type: 'settings'
  },
  {
    id: 'company-profile',
    icon: <FiHome />,
    label: 'Company Profile',
    description: 'Manage company information',
    component: () => <div>Company Profile Component</div>,
    type: 'settings'
  },
  {
    id: 'data-backup',
    icon: <FiDatabase />,
    label: 'Data Backup',
    description: 'Backup and restore data',
    component: () => <div>Data Backup Component</div>,
    type: 'utilities'
  },
  {
    id: 'audit-log',
    icon: <FiFileText />,
    label: 'Audit Log',
    description: 'System activity log',
    component: () => <div>Audit Log Component</div>,
    type: 'utilities'
  },
  {
    id: 'calendar',
    icon: <FiCalendar />,
    label: 'Calendar',
    description: 'Schedule and appointments',
    component: () => <div>Calendar Component</div>,
    type: 'utilities'
  },
  {
    id: 'custom-reports',
    icon: <TbReport />,
    label: 'Custom Reports',
    description: 'Create and run custom reports',
    component: () => <div>Custom Reports Component</div>,
    type: 'report'
  },
  {
    id: 'export-data',
    icon: <FiFileText />,
    label: 'Export Data',
    description: 'Export reports to various formats',
    component: () => <div>Export Data Component</div>,
    type: 'report'
  }
];

const Reports = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'dashboard-overview'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboard-active-tab');
      return savedTab || 'dashboard-overview';
    }
    return 'dashboard-overview';
  });

  // Mobile states - Initialize based on URL
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState(() => {
    // Check if there's an active tab in URL, if yes, start in details view
    if (typeof window !== 'undefined') {
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      const savedTab = localStorage.getItem('dashboard-active-tab');
      return (urlTab || savedTab) ? 'details' : 'dashboard';
    }
    return 'dashboard';
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Sync URL with active tab
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
      localStorage.setItem('dashboard-active-tab', currentTab);

      // If we're on mobile and URL has a tab, switch to details view
      if (isMobile) {
        setMobileView('details');
      }
    }
  }, [searchParams, activeTab, isMobile]);

  // Update URL when active tab changes
  const updateUrl = useCallback((tabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return menuItems.filter(item =>
      item.label.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.type.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.id.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

  // Color palette for items
  const colorPalette = [
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // If we're switching to mobile and have an active tab, show details view
      if (mobile && activeTab && activeTab !== 'dashboard-overview') {
        setMobileView('details');
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [activeTab]);

  // Handle tab change with mobile view and URL update
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('dashboard-active-tab', tabId);
    updateUrl(tabId);

    if (isMobile) {
      setMobileView('details');
    }
  }, [isMobile, updateUrl]);

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
  const ActiveComponent = activeItem?.component || (() => <div>Select a section from the menu</div>);

  // Get color for item
  const getItemColor = (index) => {
    return colorPalette[index % colorPalette.length];
  };

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Business Dashboard</h1>
        <p className="text-gray-600 mt-2">Access all business sections</p>
        <div className="text-sm text-gray-500 mt-1">
          {filteredItems.length} of {menuItems.length} sections
        </div>
      </header>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <FiSearch className="h-5 w-5 text-gray-400 flex-shrink-0" />
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
            className="text-gray-500 hover:text-red-600 transition-colors p-1 flex-shrink-0"
            aria-label="Clear Search"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Item List Box */}
      <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pb-10">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const colorStyle = getItemColor(index);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.border} ${activeTab === item.id ? 'ring-2 ring-blue-500' : ''
                  }`}
              >
                <button
                  onClick={() => handleTabChange(item.id)}
                  className="flex items-center w-full text-left"
                >
                  <span className={`text-xl mr-3 flex-shrink-0 ${colorStyle.text}`}>
                    {item.icon}
                  </span>
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800">{item.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    {activeTab === item.id && (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                          Currently Active
                        </span>
                      </div>
                    )}
                  </div>
                  <FiChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500 italic bg-white rounded-lg border">
            No sections found for "{searchTerm}"
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
          <p className="text-sm text-gray-600 truncate">
            {activeItem?.description || "View details"}
          </p>
        </div>
      </div>

      {/* Render the active component */}
      <div className="flex-grow overflow-auto sm:p-4">
        <ActiveComponent isMobile={true} accordion={true} />
      </div>
    </div>
  );

  // Desktop view with smaller sidebar
  const renderDesktopView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Navigation - Made Smaller */}
        <div className="w-full lg:w-64">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">Menu</h3>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {filteredItems.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                <FiSearch className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full text-sm text-gray-600 bg-transparent focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
                    aria-label="Clear Search"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Item List - Compact */}
            <nav className="space-y-1 overflow-y-auto flex-grow">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const colorStyle = getItemColor(index);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex items-center gap-2 w-full px-2 py-2 rounded text-left text-sm transition-colors ${activeTab === item.id
                          ? `${colorStyle.bg} ${colorStyle.text} font-medium border-l-2 ${colorStyle.border}`
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      title={item.description}
                    >
                      <span className={`${colorStyle.text} flex-shrink-0`}>
                        {item.icon}
                      </span>
                      <div className="flex-grow truncate">
                        {item.label}
                      </div>
                      {activeTab === item.id && (
                        <FiChevronRight className={`h-3 w-3 flex-shrink-0 ${colorStyle.text}`} />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-2 text-center text-gray-500 italic text-xs bg-gray-50 rounded">
                  No results found
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <p className="truncate">{filteredItems.length} of {menuItems.length} items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Takes more space */}
        <div className="flex-1 min-w-0">


          {/* Render the active component */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <ActiveComponent isMobile={false} accordion={true} />
          </div>
          {/* Bottom for active tab */}
          <div className="bg-white mt-5 rounded-lg border border-gray-200 p-4 md:p-5 mb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {activeItem?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm mt-1 truncate">
                  {activeItem?.description || 'Select a section from the menu'}
                </p>
              </div>
              {activeItem?.type && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {activeItem.type}
                  </span>
                </div>
              )}
            </div>
          </div>
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

export default Reports;