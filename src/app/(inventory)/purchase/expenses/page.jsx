"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FaFilter, FaPlus, FaSearch, FaTimes, FaChevronLeft } from "react-icons/fa";
import { BiDotsVerticalRounded } from "react-icons/bi";
import TabContents from "@/components/purchase/Expences/TabContents";
import { useFetchData } from "@/hook/useFetchData";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import AddExpenseCategoryModal from "@/components/add-expence-modal";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { toast } from "react-toastify";
import Link from "next/link";

const Expences = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [updateData, setUpdateData] = useState(null);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/expense", ["expense"]);

  // Extract data from the response
  const expenseData = data?.data || [];
  const categoriesData = data?.categories || [];

  const { currencySymbol, formatPrice } = useCurrencyStore();

  // Calculate total amount for each category
  const tabs = useMemo(() => {
    return categoriesData.map(category => {
      // Filter expenses for this category
      const categoryExpenses = expenseData.filter(expense =>
        expense.categoryId === category.id
      );

      // Calculate total amount for the category
      const totalAmount = categoryExpenses.reduce((sum, expense) => {
        // Use price from expense object, default to 0 if null/undefined
        return sum + (expense.price || 0);
      }, 0);

      return {
        id: category.id,
        label: category.name || "Unnamed Category",
        amount: totalAmount,
        expenseType: category.expenseType,
        defaultCat: category.defaultCat || false,
      };
    });
  }, [expenseData, categoriesData]);

  // State for search and mobile view
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'details'
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  // Get the current active tab from the URL search parameters
  const defaultActiveTab = tabs.length > 0 ? tabs[0].id : '';
  const activeTab = searchParams.get('tab') || defaultActiveTab;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set mobile view based on active tab
  useEffect(() => {
    if (isMobile) {
      if (activeTab === "general" || !activeTab) {
        setMobileView("list");
      }
    }
  }, [activeTab, isMobile]);

  // Filtered Tabs based on search term
  const filteredTabs = useMemo(() => {
    if (!searchTerm) {
      return tabs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tabs.filter(tab =>
      tab.label.toLowerCase().includes(lowerCaseSearchTerm) ||
      String(tab.amount).includes(lowerCaseSearchTerm) ||
      (tab.expenseType && tab.expenseType.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [tabs, searchTerm]);

  // Get expenses for the active tab
  const activeTabExpenses = useMemo(() => {
    if (!activeTab) return [];
    return expenseData.filter(expense => expense.categoryId === activeTab);
  }, [expenseData, activeTab]);

  // Get active category data
  const activeCategoryData = useMemo(() => {
    if (!activeTab || tabs.length === 0) {
      return null;
    }
    return categoriesData.find(item => item.id === activeTab);
  }, [categoriesData, activeTab, tabs.length]);

  // Handle dropdown actions
  const handleView = (tabId) => {
    openModal();
    const findData = categoriesData.find(cat => cat.id === tabId);
    setUpdateData(findData);
    setOpenDropdownId(null);
  };

  const handleDelete = (tabId) => {
    DeleteAlert(`/api/expense/category/${tabId}`).then((res) => {
      if (res) {
        refetch()
        toast.success("Expense Category deleted successfully");
        setOpenDropdownId(null);
        // If on mobile and deleting current active tab, go back to list
        if (isMobile && tabId === activeTab) {
          handleBackToList();
        }
      }
    })
  };

  // Handle dropdown click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // Function to clear the search input
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Function to update the URL when a tab is clicked
  const handleTabChange = useCallback((tabId) => {
    if (!tabId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`?${params.toString()}`);
    
    if (isMobile) {
      setMobileView("details");
    } else {
      setIsSidebarOpen(false);
    }
  }, [router, searchParams, isMobile]);

  // Handle back to list on mobile
  const handleBackToList = useCallback(() => {
    if (isMobile) {
      setMobileView("list");
    }
  }, [isMobile]);

  // Ensure a default 'tab' parameter exists in the URL on initial load
  useEffect(() => {
    if (!searchParams.get('tab') && defaultActiveTab) {
      handleTabChange(defaultActiveTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActiveTab]);

  // Define a palette of professional text and background color utility classes.
  const colorPalette = [
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
  ];

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header with Add Buttons */}
      <div className="mb-4 flex justify-between items-center">
        <div className="relative flex flex-wrap items-center gap-2">
          {/* Add Category Button */}
          <button
            onClick={() => {
              openModal();
              setUpdateData(null);
            }}
            className="group flex cursor-pointer items-center rounded-md shadow-sm hover:shadow transition-all duration-150 ease-in-out overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-opacity-50 min-w-fit"
            aria-label="Add new category"
          >
            <div className="flex items-center px-3 h-8 text-white font-medium text-xs bg-[#10B981] hover:bg-[#34D399] transition-all duration-150 ease-in-out">
              <FaPlus className="mr-1.5 w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Add Category</span>
            </div>
          </button>

          {/* Add Expense Link */}
          <Link
            href="/purchase/add-expense"
            className="group flex items-center rounded-md shadow-sm hover:shadow transition-all duration-150 ease-in-out overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-opacity-50 min-w-fit"
            aria-label="Add new expense"
          >
            <div className="flex items-center px-3 h-8 text-white font-medium text-xs bg-[#8B5CF6] hover:bg-[#A78BFA] transition-all duration-150 ease-in-out">
              <FaPlus className="mr-1.5 w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Add Expense</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
        <FaSearch className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Category Name or Item"
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
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category List Box */}
      <div className="space-y-3">
        {filteredTabs.length > 0 ? (
          filteredTabs.map((tab, index) => {
            const originalIndex = tabs.findIndex((t) => t.id === tab.id);
            const colorStyle = colorPalette[originalIndex % colorPalette.length];
            const isDropdownOpen = openDropdownId === tab.id;

            return (
              <div
                key={tab.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg} ${colorStyle.text}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className="text-left font-medium mb-1"
                    >
                      {tab.label}
                    </button>
                    <div className="text-sm opacity-75">
                      {currencySymbol}{tab.amount.toFixed(2)}
                    </div>
                  </div>

                  <div
                    ref={isDropdownOpen ? dropdownRef : null}
                    className="relative"
                  >
                    {!tab?.defaultCat && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(isDropdownOpen ? null : tab.id);
                          }}
                          className={`p-2 rounded-full hover:bg-gray-200 ${
                            isDropdownOpen ? "bg-gray-200" : ""
                          }`}
                        >
                          <span className="text-xl leading-none">...</span>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(tab.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(tab.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500 italic">
            No categories found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );

  // Render tab contents with back button for mobile
  const renderMobileTabContent = () => (
    <div className="h-screen flex flex-col">
      {/* Back Button Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center space-x-4">
        <button
          onClick={handleBackToList}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold truncate">
          {activeCategoryData?.name || "Category Details"}
        </h2>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-auto">
        {activeTabExpenses.length > 0 ? (
          <TabContents expenses={activeTabExpenses} refetch={refetch} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expenses found for this category</p>
            <p className="text-gray-400 mt-2">Add expenses to see them here</p>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop view remains mostly unchanged but optimized
  const renderDesktopView = () => (
    <div className="flex flex-col md:flex-row p-4 md:p-6 w-full mx-auto bg-white shadow rounded-lg">
      {/* 🧭 Sidebar Navigation (Tabs) */}
      <div
        className={`md:w-1/5 min-w-[200px] w-full overflow-x-hidden md:border-r pr-4 transition-all ${
          isSidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="mb-3 flex justify-between items-center">
          <div className="relative flex flex-wrap items-center gap-2">
            {/* Add Category Button */}
            <button
              onClick={() => {
                openModal();
                setUpdateData(null);
              }}
              className="group flex cursor-pointer items-center rounded-md shadow-sm hover:shadow transition-all duration-150 ease-in-out overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-opacity-50 min-w-fit"
              aria-label="Add new category"
            >
              <div className="flex items-center px-3 h-8 text-white font-medium text-xs bg-[#10B981] hover:bg-[#34D399] transition-all duration-150 ease-in-out">
                <FaPlus className="mr-1.5 w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Add Category</span>
              </div>
            </button>

            {/* Add Expense Link */}
            <Link
              href="/purchase/add-expense"
              className="group flex items-center rounded-md shadow-sm hover:shadow transition-all duration-150 ease-in-out overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-opacity-50 min-w-fit"
              aria-label="Add new expense"
            >
              <div className="flex items-center px-3 h-8 text-white font-medium text-xs bg-[#8B5CF6] hover:bg-[#A78BFA] transition-all duration-150 ease-in-out">
                <FaPlus className="mr-1.5 w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Add Expense</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="mx-auto">
          {/* Search Input Field with Close Button */}
          <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-0">
            <FaSearch className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Category Name or Item"
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
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Table Header / Column Row */}
          <div className="flex mt-4 text-gray-700 font-semibold text-sm border-t border-b border-gray-300">
            <div className="flex-1 p-3 flex items-center justify-between border-r border-gray-200 bg-blue-50">
              <span className="truncate">Category</span>
              <FaFilter className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
            </div>
            <div className="w-28 p-3 flex items-center justify-start bg-blue-50">
              <span>Amount</span>
            </div>
          </div>
        </div>

        {/* Tab List with Smooth Effect */}
        <div className="flex flex-col space-y-2 mt-2">
          {filteredTabs.length > 0 ? (
            filteredTabs.map((tab, index) => {
              const colorStyle = colorPalette[index % colorPalette.length];
              const isDropdownOpen = openDropdownId === tab.id;

              return (
                <div
                  key={tab.id}
                  className={`py-2 px-4 text-left rounded-md font-medium transition-all duration-300 ease-in-out flex justify-between items-center ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {/* Left side: Tab Label */}
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className="flex-grow text-left focus:outline-none truncate"
                    title={tab.label}
                  >
                    {tab.label}
                  </button>

                  {/* Right side: Amount and Dropdown Menu */}
                  <div className="flex items-center space-x-3 relative">
                    {/* Tab Amount */}
                    <span
                      className={`${colorStyle.bg} ${colorStyle.text} px-2 py-0.5 rounded-full text-xs font-semibold`}
                    >
                      {currencySymbol}{tab.amount.toFixed(2)}
                    </span>

                    {/* Three Dots Button for Dropdown */}
                    {!tab?.defaultCat && (
                      <div
                        ref={isDropdownOpen ? dropdownRef : null}
                        className="relative"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(isDropdownOpen ? null : tab.id);
                          }}
                          className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none ${
                            isDropdownOpen ? 'bg-gray-200' : ''
                          }`}
                          aria-expanded={isDropdownOpen}
                          aria-label="More options"
                        >
                          <span className="text-xl leading-none">...</span>
                        </button>

                        {/* Dropdown Content */}
                        {isDropdownOpen && (
                          <div className="absolute right-0 md:top-full -top-[80px] mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(tab.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(tab.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500 italic">
              No result found for &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>
      </div>

      {/* 📄 Content Area */}
      <div className="w-full md:w-3/4 pl-0 md:pl-6">
        <div className="transition-opacity duration-300 ease-in-out">
          {activeTab && activeTabExpenses.length > 0 ? (
            <TabContents expenses={activeTabExpenses} refetch={refetch} />
          ) : activeTab ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No expenses found for this category</p>
              <p className="text-gray-400 mt-2">Add expenses to see them here</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Select a category to view expenses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }



  // Show empty state
  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600">No expense categories found</p>
          <p className="text-sm mt-2 text-gray-500">Create your first expense category to get started</p>
          <button
            onClick={openModal}
            className="mt-4 px-6 py-2 bg-[#F3A33A] text-white font-medium rounded-lg hover:bg-[#F5B358] transition duration-150 ease-in-out flex items-center mx-auto"
          >
            <FaPlus className="mr-2" />
            Add Expense Category
          </button>
        </div>
      </div>
    );
  }

  // Main render logic
  return (
    <div>
      <AddExpenseCategoryModal 
        defaultData={updateData} 
        mode={updateData ? "update" : "create"} 
        isOpen={showModal} 
        onClose={closeModal} 
        refetch={refetch} 
      />

      {isMobile ? (
        mobileView === "list"
          ? renderMobileListBox()
          : renderMobileTabContent()
      ) : (
        renderDesktopView()
      )}
    </div>
  );
};

export default Expences;