"use client";
import ItemForm from "@/components/ItemForm/ItemForm";
import TabContents from "@/components/Items/Products/TabContents";
import Loading from "@/components/Loading";
import PortalDropdown from "@/components/PortalDropdown";
import { useFetchData } from "@/hook/useFetchData";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  FaChevronDown,
  FaChevronLeft,
  FaFilter,
  FaPlus,
  FaRegFileAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Products = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addItemDD, setAddItemDD] = useState(false);
  const [threeDotDD, setThreeDotDD] = useState(false);
  const [updateFormData, setUpdateFormData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Store trigger refs for each dropdown
  const triggerRefs = useRef({});

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'details'

  const {
    isInitialLoading,
    error,
    data = { items: [] },
    refetch,
  } = useFetchData("/api/items", ["items"]);

  const tabs = useMemo(() => {
    return data?.items && data.items.length > 0
      ? data.items.map((item) => ({
          id: item?.id,
          label: item?.itemName,
          amount: item?.stock?.openingQuantity,
        }))
      : [];
  }, [data?.items]);

  const defaultActiveTabId = tabs.length > 0 ? tabs[0].id : null;
  const activeTab = searchParams.get("tab") || defaultActiveTabId;

  const activeItemData = useMemo(() => {
    return data?.items?.find((item) => item?.id === activeTab);
  }, [data?.items, activeTab]);

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
      if (!activeTab || tabs.length === 0) {
        setMobileView("list");
      } else {
        setMobileView("details");
      }
    }
  }, [activeTab, isMobile, tabs.length]);

  const handleEdit = (tabId) => {
    const findData = data?.items.find((item) => item?.id === tabId);
    setUpdateFormData(findData);
    setShowForm(true);
    setOpenDropdownId(null);
  };

  const handleDelete = (tabId) => {
    DeleteAlert(`/api/items/${tabId}`).then((res) => {
      if (res) {
        refetch();
        toast.success("Item Deleted Successfully!");
        setOpenDropdownId(null);
        // If on mobile and deleting current active tab, go back to list
        if (isMobile && tabId === activeTab) {
          handleBackToList();
        }
      }
    });
  };

  const filteredTabs = useMemo(() => {
    if (!searchTerm) {
      return tabs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tabs.filter(
      (tab) =>
        tab.label.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(tab.amount).includes(lowerCaseSearchTerm)
    );
  }, [tabs, searchTerm]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleTabChange = useCallback(
    (tabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`?${params.toString()}`);

      if (isMobile) {
        setMobileView("details");
      } else {
        setIsSidebarOpen(false);
      }
    },
    [router, searchParams, isMobile]
  );

  const handleBackToList = useCallback(() => {
    if (isMobile) {
      setMobileView("list");
      // Optionally clear the tab from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      router.replace(`?${params.toString()}`);
    }
  }, [isMobile, router, searchParams]);

  useEffect(() => {
    if (data?.items && data.items.length > 0 && !searchParams.get("tab")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", data.items[0].id);
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.items]);

  const colorPalette = [
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
  ];

  if (isInitialLoading) {
    return <Loading />;
  }

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header with Add Item and Menu */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => {
            setShowForm(true);
            setUpdateFormData(null);
          }}
          className="flex items-center px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
        >
          <FaPlus className="mr-2" />
          Add Item
        </button>

        <div className="relative">
          <button onClick={() => setThreeDotDD(!threeDotDD)} className="p-2">
            <BiDotsVerticalRounded className="text-2xl text-gray-600" />
          </button>

          {threeDotDD && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setThreeDotDD(false)}
            />
          )}

          {threeDotDD && (
            <div className="absolute right-0 mt-2 z-20">
              <ul className="bg-white border rounded-lg shadow-md w-48 p-2">
                <li className="whitespace-nowrap p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Import Items
                </li>
                <li className="whitespace-nowrap p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Bulk Inactive
                </li>
                <li className="whitespace-nowrap p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Bulk Active
                </li>
                <li className="whitespace-nowrap p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Bulk Assign Code
                </li>
                <li className="whitespace-nowrap p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Assign Units
                </li>
                <li className="whitespace-nowrap p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Bulk Update Items
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
        <FaSearch className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Item Name or Stock Qty"
          className="w-full text-base text-gray-600 placeholder-gray-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="text-gray-500 hover:text-red-600 transition-colors p-1"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Item List Box */}
      <div className="space-y-3">
        {filteredTabs.length > 0 ? (
          filteredTabs.map((tab, index) => {
            const originalIndex = tabs.findIndex((t) => t.id === tab.id);
            const colorStyle =
              colorPalette[originalIndex % colorPalette.length];
            const isDropdownOpen = openDropdownId === tab.id;

            return (
              <div
                key={tab.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className="flex-grow text-left font-medium text-gray-800"
                  >
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-sm mt-1">
                      Stock:{" "}
                      <span className={`${colorStyle.text} font-bold`}>
                        {tab.amount}
                      </span>
                    </div>
                  </button>

                  <div className="relative ml-2">
                    <button
                      ref={el => triggerRefs.current[tab.id] = el}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(isDropdownOpen ? null : tab.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <span className="text-xl text-gray-600">...</span>
                    </button>

                    <PortalDropdown
                      isOpen={isDropdownOpen}
                      onClose={() => setOpenDropdownId(null)}
                      triggerRef={{ current: triggerRefs.current[tab.id] }}
                      position="bottom-end"
                    >
                      <button
                        onClick={() => handleEdit(tab.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View / Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tab.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </PortalDropdown>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center">
            {tabs.length === 0 ? (
              <>
                <p className="text-gray-500 mb-4">No items found.</p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setUpdateFormData(null);
                  }}
                  className="px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
                >
                  <FaPlus className="inline mr-2" /> Add Item
                </button>
              </>
            ) : (
              <p className="text-gray-500 italic">
                No result found for &quot;{searchTerm}&quot;.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render mobile details view
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
          {activeItemData?.itemName || "Item Details"}
        </h2>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-auto">
        {activeItemData ? (
          <TabContents itemData={activeItemData} />
        ) : (
          <div className="p-4 text-gray-600 text-center">
            No item data available.
          </div>
        )}
      </div>
    </div>
  );

  // Render desktop view (original layout)
  const renderDesktopView = () => {
    if (!tabs || tabs.length === 0) {
      return (
        <div className="p-10 text-center text-xl text-gray-500 bg-white shadow rounded-lg">
          No items found. Click &apos;Add Item&apos; to start.
          <button
            onClick={() => {
              setShowForm(true);
              setUpdateFormData(null);
            }}
            className="ml-4 px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
          >
            <FaPlus className="inline mr-2" /> Add Item
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row p-4 md:p-6 w-full mx-auto bg-white shadow rounded-lg">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div
          className={`md:w-1/5 min-w-[200px] w-full overflow-x-hidden md:border-r pr-4 transition-all ${
            isSidebarOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="mb-3 flex justify-between items-center">
            <div className="relative">
              <button className="flex cursor-pointer items-center rounded-lg shadow-md overflow-hidden">
                <div
                  onClick={() => {
                    setShowForm(true);
                    setUpdateFormData(null);
                  }}
                  className="flex items-center px-4 h-9 text-white font-medium text-base bg-[#F3A33A] hover:bg-[#F5B358] transition duration-150 ease-in-out"
                >
                  <FaPlus className="mr-2" />
                  Add Item
                </div>

                <div
                  onClick={() => setAddItemDD(!addItemDD)}
                  className="flex items-center justify-center bg-[#D48D2F] hover:bg-[#F5B358] px-2 h-9 border-l border-orange-500"
                >
                  <FaChevronDown
                    className="text-white transition-all"
                    style={{ rotate: addItemDD ? "180deg" : "0deg" }}
                  />
                </div>
              </button>
              {addItemDD && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setAddItemDD(!addItemDD)}
                />
              )}
              <div
                className={`shadow-xl z-20 p-3 justify-between items-center bg-white border gap-2 absolute right-0 cursor-pointer rounded-lg ${
                  addItemDD ? "animate-in flex" : "hidden"
                }`}
              >
                <FaRegFileAlt />
                <span>Import Items</span>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setThreeDotDD(!threeDotDD)}
                className="cursor-pointer"
              >
                <BiDotsVerticalRounded className="text-2xl" />
              </button>

              {threeDotDD && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setThreeDotDD(!threeDotDD)}
                />
              )}
              <div className="absolute z-20 right-0 top-5">
                <ul
                  className={`flex-col bg-white border rounded-lg shadow-md mt-2 w-48 justify-start p-2 ${
                    threeDotDD ? "animate-in flex" : "hidden"
                  }`}
                >
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">
                    Bulk Inactive
                  </li>
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">
                    Bulk Active
                  </li>
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">
                    Bulk Assign Code
                  </li>
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">
                    Bulk Assign Code
                  </li>
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">
                    Assign Units
                  </li>
                  <li className="whitespace-nowrap p-1 hover:bg-gray-200 transition-all rounded">
                    Bulk Update Items
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mx-auto">
            <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-0">
              <FaSearch className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Item Name or Stock Qty"
                className="w-full text-base text-gray-600 placeholder-gray-400 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-500 hover:text-red-600 transition-colors p-1"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex mt-4 text-gray-700 font-semibold text-sm border-t border-b border-gray-300">
              <div className="flex-1 p-3 flex items-center justify-between border-r border-gray-200 bg-blue-50">
                <span className="truncate">Item Name</span>
                <FaFilter className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
              </div>
              <div className="w-28 p-3 flex items-center justify-start bg-blue-50">
                <span>Stock Qty</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-2">
            {filteredTabs.length > 0 ? (
              filteredTabs.map((tab, index) => {
                const originalIndex = tabs.findIndex((t) => t.id === tab.id);
                const colorStyle =
                  colorPalette[originalIndex % colorPalette.length];
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
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className="flex-grow line-clamp-2 text-left focus:outline-none"
                    >
                      {tab.label}
                    </button>

                    <div className="flex items-center space-x-3 relative ml-2">
                      <span
                        className={`${colorStyle.bg} ${colorStyle.text} px-2 py-0.5 rounded-full text-xs font-semibold`}
                      >
                        {tab?.amount}
                      </span>

                      <button
                        ref={el => triggerRefs.current[tab.id] = el}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : tab.id);
                        }}
                        className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none ${
                          isDropdownOpen ? "bg-gray-200" : ""
                        }`}
                      >
                        <span className="text-xl leading-none">...</span>
                      </button>

                      <PortalDropdown
                        isOpen={isDropdownOpen}
                        onClose={() => setOpenDropdownId(null)}
                        triggerRef={{ current: triggerRefs.current[tab.id] }}
                        position="right-start"
                      >
                        <button
                          onClick={() => handleEdit(tab.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View / Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tab.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </PortalDropdown>
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

        {/* Content Area */}
        <div className="w-full md:w-3/4 pl-0 md:pl-6">
          {activeItemData ? (
            <TabContents itemData={activeItemData} />
          ) : (
            <div className="p-4 text-center text-gray-500 italic">
              Select an item from the sidebar to view its details.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render logic
  if (isMobile) {
    return (
      <>
        {mobileView === "list"
          ? renderMobileListBox()
          : renderMobileTabContent()}

        {showForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full mx-4 rounded-lg max-h-[90vh] overflow-y-auto">
              <ItemForm
                initialData={updateFormData || null}
                onClose={() => setShowForm(false)}
                updateFormData={updateFormData}
                setShowForm={setShowForm}
                refetch={refetch}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {renderDesktopView()}

      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white lg:w-4xl">
            <ItemForm
              initialData={updateFormData || null}
              onClose={() => setShowForm(false)}
              updateFormData={updateFormData}
              setShowForm={setShowForm}
              refetch={refetch}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Products;