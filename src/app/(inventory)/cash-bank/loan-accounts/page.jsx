"use client";
import AddPartyModal from "@/components/add-party-modal";
import HeaderSection from "./HeaderSectionOfTabs";
import TabContents from "./TabContents";
import { useFetchData } from "@/hook/useFetchData";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const LoanAccounts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [updateFormData, setUpdateFormData] = useState(null);

  const activeTab = searchParams.get("tab") || "general";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'details'

  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/party", ["party"]);

  const tabs =
    data && data.length > 0
      ? data.map((item) => ({ id: item?.id, label: item?.partyName }))
      : [];

  const activePartyData = useMemo(() => {
    if (activeTab === "general" || !data || data.length === 0) {
      return null;
    }
    return data.find((item) => item.id === activeTab);
  }, [data, activeTab]);

  const filteredTabs = useMemo(() => {
    if (!searchTerm) {
      return tabs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tabs.filter((tab) =>
      tab.label.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [tabs, searchTerm]);

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

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
      // else {
      //   setMobileView("details");
      // }
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
      // Optionally clear the tab from URL or keep it
      // const params = new URLSearchParams(searchParams.toString());
      // params.delete("tab");
      // router.replace(`?${params.toString()}`);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!searchParams.get("tab") && tabs.length === 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "general");
      router.replace(`?${params.toString()}`);
    } else if (!searchParams.get("tab") && tabs.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabs[0].id);
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  const colorPalette = [
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
  ];

  const handleEdit = (tabId) => {
    setIsUpdateModalOpen(true);
    const findData = data.find((item) => item?.id === tabId);
    setUpdateFormData(findData);
  };

  const handleDelete = (tabId) => {
    DeleteAlert(`/api/party/${tabId}`).then((res) => {
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

  const handleClose = () => {
    setIsUpdateModalOpen(false);
    setUpdateFormData(null);
  };

  const dropdownRef = useRef(null);

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

  // Render list box view for mobile
  const renderMobileListBox = () => (
    <div className="p-4">
      <HeaderSection setIsModalOpen={setIsModalOpen} />

      {/* Search Bar */}
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
        <FaSearch className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Party Name"
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

      {/* Party List Box */}
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
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg} ${colorStyle.text}`}
              >
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className="flex-grow text-left font-medium"
                  >
                    {tab.label}
                  </button>

                  <div
                    ref={isDropdownOpen ? dropdownRef : null}
                    className="relative"
                  >
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
                            handleEdit(tab.id);
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
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500 italic">
            No parties found for "{searchTerm}".
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
          {activePartyData?.partyName || "Party Details"}
        </h2>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-auto">
        {activePartyData ? (
          <TabContents
            phoneNumber={activePartyData.phoneNumber}
            transaction={activePartyData.transaction}
            partyName={activePartyData.partyName}
            refetch={refetch}
          />
        ) : (
          <div className="p-4 text-gray-600">No party data available.</div>
        )}
      </div>
    </div>
  );

  // Desktop view remains unchanged
  const renderDesktopView = () => (
    <div>
      <HeaderSection setIsModalOpen={setIsModalOpen} />

      <AddPartyModal
        refetch={refetch}
        isOpen={isUpdateModalOpen}
        onClose={handleClose}
        mode="update"
        defaultData={updateFormData}
      />

      <AddPartyModal
        refetch={refetch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
      />

      <div className="flex flex-col md:flex-row p-4 md:p-6 w-full mx-auto bg-white shadow rounded-lg">
        {/* Mobile Sidebar Toggle - Hidden on mobile since we have new UI */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            {isSidebarOpen ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        {/* Desktop Sidebar */}
        <div
          className={`md:w-1/5 min-w-[200px] w-full overflow-x-hidden md:border-r pr-4 transition-all ${
            isSidebarOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="mx-auto">
            <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-0">
              <FaSearch className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Party Name or Amount"
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
                <span>Amount</span>
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
                      className="flex-grow text-left focus:outline-none"
                    >
                      {tab.label}
                    </button>

                    <div
                      ref={isDropdownOpen ? dropdownRef : null}
                      className="flex items-center space-x-3 relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(isDropdownOpen ? null : tab.id);
                        }}
                        className={`p-1 rounded-full hover:bg-gray-200 focus:outline-none ${
                          isDropdownOpen ? "bg-gray-200" : ""
                        }`}
                        aria-expanded={isDropdownOpen}
                        aria-label="More options"
                      >
                        <span className="text-xl leading-none">...</span>
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute right-0 md:top-full -top-[80px] mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(tab.id);
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
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 italic">
                No parties found for "{searchTerm}".
              </div>
            )}
          </div>
        </div>

        {/* Desktop Content Area */}
        <div className="w-full md:w-3/4 pl-0 md:pl-6">
          <div className="transition-opacity duration-300 ease-in-out">
            {activePartyData && activeTab !== "general" ? (
              <TabContents
                phoneNumber={activePartyData.phoneNumber}
                transaction={activePartyData.transaction}
                partyName={activePartyData.partyName}
                refetch={refetch}
              />
            ) : activeTab === "general" ? (
              <div className="p-4 text-gray-600">
                Select a party from the left panel to view its details.
              </div>
            ) : (
              <div className="p-4 text-gray-600">
                No party data available or party not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (isMobile) {
    return (
      <>
        <AddPartyModal
          refetch={refetch}
          isOpen={isUpdateModalOpen}
          onClose={handleClose}
          mode="update"
          defaultData={updateFormData}
        />

        <AddPartyModal
          refetch={refetch}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode="create"
        />

        {mobileView === "list"
          ? renderMobileListBox()
          : renderMobileTabContent()}
      </>
    );
  }

  return renderDesktopView();
};

export default LoanAccounts;
