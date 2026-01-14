"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { FaPlus } from 'react-icons/fa';
import { BiDotsVerticalRounded } from "react-icons/bi";
import TabContents from "@/components/purchase/Expences/TabContents";




  const tabs = [
    { id: "general", label: "General", amount: 100 },
    { id: "files-media", label: "Files & Media", amount: 2 },
    { id: "price-stock", label: "Price & Stock", amount: 5 },
    { id: "seo", label: "SEO", amount: 3 },
    { id: "frequently-bought", label: "Frequently Brought", amount: 1 },
  ];


const Expences = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addItemDD, setAddItemDD] = useState(false)
  const [threeDotDD, setThreeDotDD] = useState(false)
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  

  // 1. New state for the search input value
  const [searchTerm, setSearchTerm] = useState("");

  // Get the current active tab from the URL search parameters, default to "general"
  const activeTab = searchParams.get('tab') || 'general';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile view

  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Placeholder functions for dropdown actions
  const handleView = (tabId) => { console.log('Viewing tab:', tabId); /* Your view logic */ setOpenDropdownId(null); };
  const handleDelete = (tabId) => { console.log('Deleting tab:', tabId); /* Your delete logic */ setOpenDropdownId(null); };


  // 2. Filtered Tabs based on search term
  const filteredTabs = useMemo(() => {
    if (!searchTerm) {
      return tabs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tabs.filter(tab =>
      // Search by label (Party Name) or amount
      tab.label.toLowerCase().includes(lowerCaseSearchTerm) ||
      String(tab.amount).includes(lowerCaseSearchTerm)
    );
  }, [tabs, searchTerm]);

  // Function to clear the search input
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Function to update the URL when a tab is clicked
  const handleTabChange = useCallback((tabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    // Use replace() to update the URL without adding a new entry to browser history
    router.replace(`?${params.toString()}`);
    // Auto-close sidebar on mobile
    setIsSidebarOpen(false);
  }, [router, searchParams]);

  // Ensure a default 'tab' parameter exists in the URL on initial load
  useEffect(() => {
    if (!searchParams.get('tab')) {
      handleTabChange('general');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define a palette of professional text and background color utility classes.
  const colorPalette = [
    { bg: 'bg-indigo-100', text: 'text-indigo-800' }, // Soft Indigo
    { bg: 'bg-teal-100', text: 'text-teal-800' }, // Muted Teal
    { bg: 'bg-orange-100', text: 'text-orange-800' }, // Warm Orange
    { bg: 'bg-pink-100', text: 'text-pink-800' },  // Subtle Pink
    { bg: 'bg-purple-100', text: 'text-purple-800' }, // Light Purple
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row p-4 md:p-6 w-full mx-auto bg-white shadow rounded-lg">
        {/* 📱 Mobile Sidebar Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        {/* 🧭 Sidebar Navigation (Tabs) */}
        <div
          className={`md:w-1/5 min-w-[200px] w-full overflow-x-hidden md:border-r pr-4 transition-all ${isSidebarOpen ? "block" : "hidden md:block"
            }`}
        >
          <div className="mb-3 flex justify-between items-center">
            <div className="relative">
              <button
                onClick={openModal} className="flex cursor-pointer items-center rounded-lg shadow-md overflow-hidden">
                {/* Plus icon and text section */}
                <div className="flex items-center px-4 h-9 text-white font-medium text-base bg-[#F3A33A] hover:bg-[#F5B358] transition duration-150 ease-in-out">
                  <FaPlus className="mr-2" />
                  Add Expense
                </div>
              </button>
            </div>
            <div className="relative">
              <button onClick={() => setThreeDotDD(!threeDotDD)} className="cursor-pointer"><BiDotsVerticalRounded className="text-2xl" /></button>

              {threeDotDD && <div className="fixed inset-0 z-10" onClick={() => setThreeDotDD(!threeDotDD)} />}
              <div className="absolute z-20 right-0 top-5">
                <ul className={`flex-col bg-white border rounded-lg shadow-md mt-2 w-48 justify-start p-2 ${threeDotDD ? "animate-in flex" : "hidden"}`}>
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">No Options available</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mx-auto">
            {/* 1. Search Input Field with Close Button */}
            <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-0">
              {/* Search Icon */}
              <FaSearch className="h-5 w-5 text-gray-400" />

              {/* Input Field */}
              <input
                type="text"
                placeholder="Search Category Name or Item"
                className="w-full text-base text-gray-600 placeholder-gray-400 focus:outline-none"
                value={searchTerm} // Controlled component
                onChange={(e) => setSearchTerm(e.target.value)} // Update state on change
              />

              {/* Close Button (Conditional Rendering) */}
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

            {/* 2. Table Header / Column Row */}
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
                // Find the original index for color styling
                const originalIndex = tabs.findIndex(t => t.id === tab.id);
                const colorStyle = colorPalette[originalIndex % colorPalette.length];
                // Check if the current tab's dropdown is open
                const isDropdownOpen = openDropdownId === tab.id;

                return (
                  <div
                    key={tab.id}
                    // The main item is now a div or a list item to contain the button and the dropdown
                    // The button will handle the main tab click, and the dropdown button will handle the menu
                    className={`py-2 px-4 text-left rounded-md font-medium transition-all duration-300 ease-in-out flex justify-between items-center ${activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {/* Left side: Tab Label */}
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className="flex-grow text-left focus:outline-none"
                    >
                      {tab.label}
                    </button>

                    {/* Right side: Amount and Dropdown Menu (Flex container for alignment) */}
                    <div className="flex items-center space-x-3 relative">
                      {/* Tab Amount */}
                      <span
                        className={`${colorStyle.bg} ${colorStyle.text} px-2 py-0.5 rounded-full text-xs font-semibold`}
                      >
                        {tab?.amount}
                      </span>

                      {/* Three Dots Button for Dropdown */}
                      <button
                        onClick={(e) => {
                          // Stop event propagation to prevent the main tab click
                          e.stopPropagation();
                          // Toggle the dropdown state for this tab
                          setOpenDropdownId(isDropdownOpen ? null : tab.id);
                        }}
                        className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none ${isDropdownOpen ? 'bg-gray-200' : ''}`}
                        aria-expanded={isDropdownOpen}
                        aria-label="More options"
                      >
                        {/* Three Dots Icon (Horizontal ellipsis) */}
                        <span className="text-xl leading-none">...</span>
                      </button>

                      {/* Dropdown Content */}
                      {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />}
                      {isDropdownOpen && (
                        <div className="absolute right-0 md:top-full -top-[80px] mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(tab.id); // Call your view function
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(tab.id); // Call your delete function
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // No results message
              <div className="p-4 text-center text-gray-500 italic">
                No result found for &quot;{searchTerm}&quot;.
              </div>
            )}
          </div>
        </div>

        {/* 📄 Content Area (Page Code) */}
        <div className="w-full md:w-3/4 pl-0 md:pl-6">
          {/* Conditional rendering based on the activeTab read from the URL */}
          {/* You can add a transition here for content as well if needed */}
          <div className="transition-opacity duration-300 ease-in-out">
            {activeTab === "general" && <TabContents />}
            {activeTab === "files-media" && "Files & Media Tab Content Here"}
            {activeTab === "price-stock" && "Price & Stock Tab Content Here"}
            {activeTab === "seo" && "SEO Tab Content Here"}
            {activeTab === "frequently-bought" && "Frequently Bought Tab Content Here"}
          </div>

          {/* Placeholder for any content not tied to a specific tab, like the submission buttons */}
          <div className="pt-8">
            <p className="text-gray-500 italic">
              *The rest of your form submission buttons/logic would follow here, outside the main tab content area.*
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Expences;