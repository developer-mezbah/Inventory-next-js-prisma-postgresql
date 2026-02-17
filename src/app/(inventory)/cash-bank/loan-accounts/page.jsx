"use client";
import HeaderSection from "./HeaderSectionOfTabs";
import TabContents from "./TabContents";
import { useFetchData } from "@/hook/useFetchData";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { createPortal } from "react-dom";

// Simple dropdown component using portal
const PortalDropdown = ({ isOpen, onClose, triggerRef, children, position = "bottom-end" }) => {
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate dropdown dimensions (approximate)
      const dropdownWidth = 160; // w-40 = 10rem = 160px
      const dropdownHeight = 88; // approximate height for 2 buttons

      let top, left;

      if (position === "bottom-end") {
        left = trigger.right - dropdownWidth;
        top = trigger.bottom + 5;

        // Check if dropdown goes below viewport
        if (top + dropdownHeight > viewportHeight) {
          top = trigger.top - dropdownHeight - 5;
        }

        // Check if dropdown goes off left edge
        if (left < 5) {
          left = trigger.left;
        }

        // Check if dropdown goes off right edge
        if (left + dropdownWidth > viewportWidth - 5) {
          left = viewportWidth - dropdownWidth - 5;
        }
      } else if (position === "right-start") {
        left = trigger.right + 5;
        top = trigger.top;

        // Check if dropdown goes off right edge
        if (left + dropdownWidth > viewportWidth - 5) {
          left = trigger.left - dropdownWidth - 5;
        }

        // Check if dropdown goes below viewport
        if (top + dropdownHeight > viewportHeight) {
          top = viewportHeight - dropdownHeight - 5;
        }
      }

      setDropdownStyle({
        position: 'fixed',
        top: `${Math.max(5, top)}px`,
        left: `${Math.max(5, left)}px`,
        zIndex: 99999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, triggerRef, position]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

const LoanAccounts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [updateFormData, setUpdateFormData] = useState(null);
  const activeTab = searchParams.get("tab") || "general";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState("list");
  const [hasSetDefaultTab, setHasSetDefaultTab] = useState(false);

  // Store trigger refs for each dropdown
  const triggerRefs = useRef({});

  const {
    isInitialLoading,
    error,
    data = {},
    refetch,
  } = useFetchData("/api/loan-accounts", ["loan-accounts-data"]);

  const accountData = data?.accountData || [];
  const { formatPrice } = useCurrencyStore();

  const tabs =
    accountData && accountData.length > 0
      ? accountData.map((item) => ({ id: item?.id, label: item?.accountName }))
      : [];

  const activePartyData = useMemo(() => {
    if (activeTab === "general" || !accountData || accountData.length === 0) {
      return null;
    }
    return accountData.find((item) => item.id === activeTab);
  }, [accountData, activeTab]);

  const filteredTabs = useMemo(() => {
    if (!searchTerm) {
      return tabs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tabs.filter((tab) =>
      tab.label.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [tabs, searchTerm]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hasSetDefaultTab && tabs.length > 0 && !searchParams.get("tab")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabs[0].id);
      router.replace(`?${params.toString()}`);
      setHasSetDefaultTab(true);
    }

    if (tabs.length === 0 && !searchParams.get("tab")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "general");
      router.replace(`?${params.toString()}`);
      setHasSetDefaultTab(true);
    }
  }, [tabs, searchParams, router, hasSetDefaultTab]);

  useEffect(() => {
    if (isMobile) {
      if (activeTab === "general" || !activeTab) {
        setMobileView("list");
      } else {
        setMobileView("details");
      }
    }
  }, [activeTab, isMobile]);

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
    }
  }, [isMobile]);

  const colorPalette = [
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
  ];

  const handleEdit = (tabId) => {
    setShowModal(true);
    const findData = accountData.find((item) => item?.id === tabId);
    setUpdateFormData(findData);
    setOpenDropdownId(null);
  };

  const handleDelete = (tabId) => {
    setOpenDropdownId(null)
    DeleteAlert(`/api/loan-accounts?id=${tabId}`).then((res) => {
      if (res) {
        refetch();
        toast.success("Loan Account Deleted Successfully!");
        setOpenDropdownId(null);
        if (isMobile && tabId === activeTab) {
          handleBackToList();
        }
      }
    });
  };

  const handleClose = () => {
    setShowModal(false);
    setUpdateFormData(null);
  };

  const getAccountBalance = (accountId) => {
    const account = accountData.find((item) => item.id === accountId);
    return account ? account.currentBalance : 0;
  };

  const handleCombinedRefetch = useCallback(() => {
    refetch();
  }, [refetch, activeTab]);

  // Render list box view for mobile
  const renderMobileListBox = () => (
    <div className="p-4">
      <HeaderSection data={data} refetch={refetch} showModal={showModal} setShowModal={setShowModal} updateFormData={updateFormData} setUpdateFormData={setUpdateFormData} />

      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
        <FaSearch className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Account Name"
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

      <div className="space-y-3">
        {filteredTabs.length > 0 ? (
          filteredTabs.map((tab, index) => {
            const originalIndex = tabs.findIndex((t) => t.id === tab.id);
            const colorStyle = colorPalette[originalIndex % colorPalette.length];
            const isDropdownOpen = openDropdownId === tab.id;
            const balance = getAccountBalance(tab.id);

            return (
              <div
                key={tab.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg} ${colorStyle.text}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className="text-left w-full"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{tab.label}</div>
                        <div className="font-semibold">{formatPrice(balance)}</div>
                      </div>
                    </button>
                  </div>

                  <div className="relative ml-2">
                    <button
                      ref={el => triggerRefs.current[tab.id] = el}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(isDropdownOpen ? null : tab.id);
                      }}
                      className={`p-2 rounded-full hover:bg-gray-200 ${isDropdownOpen ? "bg-gray-200" : ""}`}
                    >
                      <span className="text-xl leading-none">...</span>
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
          <div className="p-4 text-center text-gray-500 italic">
            No accounts found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );

  // Render tab contents with back button for mobile
  const renderMobileTabContent = () => (
    <div className="h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center space-x-4">
        <button
          onClick={handleBackToList}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold truncate">
          {activePartyData?.accountName || "Account Details"}
        </h2>
      </div>

      <div className="flex-grow overflow-auto">
        {activePartyData ? (
          <TabContents
            accountData={activePartyData}
            refetch={refetch}
            data={data}
            transaction={activePartyData?.transactions}
            updateFormData={updateFormData}
            setUpdateFormData={setUpdateFormData}
          />
        ) : (
          <div className="p-4 text-gray-600">No account data available.</div>
        )}
      </div>
    </div>
  );

  // Desktop view
  const renderDesktopView = () => (
    <div>
      <HeaderSection data={data} refetch={refetch} showModal={showModal} setShowModal={setShowModal} updateFormData={updateFormData} setUpdateFormData={setUpdateFormData} />
      <div className="flex flex-col md:flex-row p-4 md:p-6 w-full mx-auto bg-white shadow rounded-lg">
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        <div
          className={`md:w-1/5 min-w-[200px] w-full md:border-r pr-4 transition-all ${isSidebarOpen ? "block" : "hidden md:block"
            }`}
        >
          <div className="mx-auto">
            <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-0">
              <FaSearch className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Account Name"
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

            <div className="flex mt-4 text-gray-700 font-semibold text-sm border-t border-b border-gray-300">
              <div className="flex-1 p-3 flex items-center justify-between border-r border-gray-200 bg-blue-50">
                <span className="truncate">Account Name</span>
                <FaFilter className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
              </div>
              <div className="w-28 p-3 flex items-center justify-start bg-blue-50">
                <span>Balance</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-2">
            {filteredTabs.length > 0 ? (
              filteredTabs.map((tab, index) => {
                const originalIndex = tabs.findIndex((t) => t.id === tab.id);
                const colorStyle = colorPalette[originalIndex % colorPalette.length];
                const isDropdownOpen = openDropdownId === tab.id;
                const balance = getAccountBalance(tab.id);

                return (
                  <div
                    key={tab.id}
                    className={`py-2 px-4 text-left rounded-md font-medium transition-all duration-300 ease-in-out flex justify-between items-center ${activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className="flex-grow text-left focus:outline-none flex justify-between items-center w-full"
                    >
                      <div className="font-medium truncate pr-2">{tab.label}</div>
                      <div className="font-semibold whitespace-nowrap">
                        {formatPrice(balance)}
                      </div>
                    </button>

                    <div className="flex items-center space-x-3 relative ml-2">
                      <button
                        ref={el => triggerRefs.current[tab.id] = el}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : tab.id);
                        }}
                        className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none ${isDropdownOpen ? "bg-gray-200" : ""
                          }`}
                        aria-expanded={isDropdownOpen}
                        aria-label="More options"
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
                No accounts found for "{searchTerm}".
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-3/4 pl-0 md:pl-6">
          <div className="transition-opacity duration-300 ease-in-out">
            {activePartyData && activeTab !== "general" ? (
              <TabContents
                accountData={activePartyData}
                refetch={handleCombinedRefetch}
                transaction={activePartyData?.transactions}
                data={data}
                updateFormData={updateFormData}
                setUpdateFormData={setUpdateFormData}
              />
            ) : activeTab === "general" ? (
              <div className="p-4 text-gray-600">
                Select a loan account from the left panel to view its details.
              </div>
            ) : (
              <div className="p-4 text-gray-600">
                No account data available or account not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {mobileView === "list" ? renderMobileListBox() : renderMobileTabContent()}
      </>
    );
  }

  return renderDesktopView();
};

export default LoanAccounts;