"use client";
import AccountInfoHeader from "@/components/CashAndBank/BankAccounts/AccountInfoHeader";
import BankAccountForm from "@/components/CashAndBank/BankAccounts/BankAccountForm";
import WelcomeBankAccounts from "@/components/CashAndBank/BankAccounts/WelcomeBankAccount";
import Loading from "@/components/Loading";
import PortalDropdown from "@/components/PortalDropdown";
import TransactionsTable from "@/components/purchase/PurchaseBills/TransactionsTable";
import { useFetchData } from "@/hook/useFetchData";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  FaChevronLeft,
  FaFilter,
  FaPlus,
  FaRegFileAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [addItemDD, setAddItemDD] = useState(false);
  const [threeDotDD, setThreeDotDD] = useState(false);
  const [updateFormId, setUpdateFormId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const activeTab = searchParams.get("id");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Store trigger refs for each dropdown
  const triggerRefs = useRef({});

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'details'

  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/cashandbank", ["cashandbank"]);

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
      if (!activeTab) {
        setMobileView("list");
      } else {
        setMobileView("details");
      }
    }
  }, [activeTab, isMobile]);

  const handleBackToList = useCallback(() => {
    if (isMobile) {
      setMobileView("list");
      const params = new URLSearchParams();
      router.replace(`?${params.toString()}`);
    }
  }, [isMobile, router]);

  const handleEdit = (tabId) => {
    handleTabChange(tabId, "update-cash-bank");
    setUpdateFormId(tabId);
    setOpenDropdownId(null);
  };

  const handleDelete = (tabId) => {
    DeleteAlert(`/api/cashandbank/${tabId}`).then((res) => {
      if (res) {
        refetch();
        toast.success("Item Deleted Successfully!");
        setOpenDropdownId(null);
        // If on mobile and deleting current active account, go back to list
        if (isMobile && tabId === activeTab) {
          handleBackToList();
        }
      }
    });
  };

  const tabs =
    data && data.length > 0
      ? data.map((item) => ({
          id: item?.id,
          label: item?.accountdisplayname,
          amount: item?.openingbalance || "00",
        }))
      : [];

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
    (pageId, pageName) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(pageName, pageId);
      router.replace(`?${params.toString()}`);

      if (isMobile) {
        if (pageName === "id") {
          setMobileView("details");
        } else {
          // For create/update forms, we handle them separately
          // Keep mobile view as list
        }
      } else {
        setIsSidebarOpen(false);
      }
    },
    [router, searchParams, isMobile]
  );

  useEffect(() => {
    if (!searchParams.get("id") && data.length) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("id", data[0]?.id);
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const colorPalette = [
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
  ];

  const formatTransactionData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    return transactions.map((item) => ({
      id: item.id,
      paymentType: item.paymentType || "N/A",
      amount: item.totalAmount || 0,
      transactionId: item.transactionId,
      type: item.type,
      description: item.description,
      ...item,
    }));
  };

  if (isInitialLoading) {
    return <Loading />;
  }

  if (!data.length && searchParams.size === 0) {
    return <WelcomeBankAccounts pathname={pathname} />;
  }

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header with Add Bank and Menu */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => {
            handleTabChange("open", "create-cash-bank");
            setUpdateFormId(null);
          }}
          className="flex items-center px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
        >
          <FaPlus className="mr-2" />
          Add Bank
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
          placeholder="Search Account Name or Balance"
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

      {/* Bank Accounts List Box */}
      <div className="space-y-3">
        {filteredTabs.length > 0 ? (
          filteredTabs.map((tab, index) => {
            const colorStyle = colorPalette[index % colorPalette.length];
            const isDropdownOpen = openDropdownId === tab.id;

            return (
              <div
                key={tab.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => handleTabChange(tab.id, "id")}
                    className="flex-grow text-left"
                  >
                    <div className="font-semibold text-gray-800">
                      {tab.label}
                    </div>
                    <div className="text-sm mt-1">
                      Balance:{" "}
                      <span className={`${colorStyle.text} font-bold`}>
                        ${tab.amount}
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
            {data.length === 0 ? (
              <>
                <p className="text-gray-500 mb-4">No bank accounts found.</p>
                <button
                  onClick={() => {
                    handleTabChange("open", "create-cash-bank");
                    setUpdateFormId(null);
                  }}
                  className="px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
                >
                  <FaPlus className="inline mr-2" /> Add Bank
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
  const renderMobileTabContent = () => {
    const activeAccount = data.find((item) => item.id === activeTab);
    const transactionData = activeAccount?.transaction || [];
    const formattedTransactionData = formatTransactionData(transactionData);

    return (
      <div className="h-screen flex flex-col">
        {/* Back Button Header */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center space-x-4">
          <button
            onClick={handleBackToList}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">
              {activeAccount?.accountdisplayname || "Bank Account"}
            </h2>
            {activeAccount?.openingbalance && (
              <p className="text-sm text-gray-600">
                Balance: ${activeAccount.openingbalance}
              </p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="p-4 bg-white">
          {activeAccount && <AccountInfoHeader account={activeAccount} />}
        </div>

        {/* Transactions Table */}
        <div className="flex-grow overflow-auto p-4">
          {activeAccount ? (
            <div className="bg-white rounded-lg shadow-sm">
              <TransactionsTable
                data={formattedTransactionData}
                invoiceType="bank-transaction"
                refetch={refetch}
                title={`Transactions`}
                showSearch={false} // Simplified for mobile
                showFilters={false}
                itemsPerPage={5}
                showPagination={true}
                userProvidedColumns={[
                  {
                    key: "type",
                    label: "Type",
                    sortable: true,
                    className: "text-left",
                    type: "badge",
                    badgeColor: "bg-blue-100 text-blue-800",
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    sortable: true,
                    className: "text-left font-semibold",
                    type: "currency",
                  },
                  {
                    key: "transactionId",
                    label: "ID",
                    sortable: true,
                    className: "text-left text-sm",
                  },
                ]}
                columnOrder={["type", "amount", "transactionId"]}
                customRenderers={{
                  type: (value) => (
                    <span className="inline-block rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                      {value || "N/A"}
                    </span>
                  ),
                }}
                size="small" // Smaller for mobile
              />
            </div>
          ) : (
            <div className="p-4 text-gray-600 text-center">
              No account data available.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get current active account for desktop
  const activeAccount = data.find((item) => item.id === activeTab);
  const transactionData = activeAccount?.transaction || [];
  const formattedTransactionData = formatTransactionData(transactionData);

  // Render desktop view (original layout)
  const renderDesktopView = () => (
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
        className={`md:w-1/5 max-h-screen pb-10 min-w-[200px] w-full overflow-x-hidden md:border-r pr-4 transition-all ${
          isSidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="mb-3 flex justify-between items-center">
          <div className="relative">
            <button className="flex cursor-pointer items-center rounded-lg shadow-md overflow-hidden">
              <div
                onClick={() => {
                  handleTabChange("open", "create-cash-bank");
                  setUpdateFormId(null);
                }}
                className="flex items-center px-4 h-9 text-white font-medium text-base bg-[#F3A33A] hover:bg-[#F5B358] transition duration-150 ease-in-out"
              >
                <FaPlus className="mr-2" />
                Add Bank
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
              placeholder="Search Account Name or Balance"
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
                  <button
                    onClick={() => handleTabChange(tab.id, "id")}
                    className="flex-grow cursor-pointer text-left focus:outline-none"
                  >
                    {tab.label}
                  </button>

                  <div className="flex items-center space-x-3 relative ml-2">
                    <span
                      className={`${colorStyle.bg} ${colorStyle.text} px-2 py-0.5 rounded-full text-xs font-semibold`}
                    >
                      ${tab?.amount}
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
        <div>
          {activeAccount && <AccountInfoHeader account={activeAccount} />}
        </div>

        <div className="transition-opacity duration-300 ease-in-out">
          {activeAccount ? (
            <TransactionsTable
              data={formattedTransactionData}
              invoiceType="bank-transaction"
              refetch={refetch}
              title={`Transactions - ${activeAccount?.accountdisplayname}`}
              showSearch={true}
              showFilters={true}
              itemsPerPage={10}
              showPagination={true}
              userProvidedColumns={[
                {
                  key: "transactionId",
                  label: "Transaction ID",
                  sortable: true,
                  className: "text-left",
                },
                {
                  key: "type",
                  label: "Type",
                  sortable: true,
                  className: "text-left",
                  type: "badge",
                  badgeColor: "bg-blue-100 text-blue-800",
                },
                {
                  key: "amount",
                  label: "Amount",
                  sortable: true,
                  className: "text-left font-semibold",
                  type: "currency",
                },
              ]}
              columnOrder={["type", "amount", "transactionId"]}
              customRenderers={{
                type: (value) => (
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                    {value || "N/A"}
                  </span>
                ),
              }}
              size="medium"
            />
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-lg font-medium">No account selected</p>
              <p className="text-sm mt-2">
                Please select a bank account from the sidebar to view
                transactions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (isMobile) {
    return (
      <>
        {mobileView === "list"
          ? renderMobileListBox()
          : renderMobileTabContent()}

        {(searchParams.get("update-cash-bank") ||
          searchParams.get("create-cash-bank")) && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-full mx-4">
              <BankAccountForm
                initialData={data || []}
                updateFormId={
                  updateFormId || searchParams.get("update-cash-bank")
                }
                onClose={() => {
                  router.push(pathname);
                }}
                isShowForm={
                  searchParams.get("update-cash-bank") ||
                  searchParams.get("create-cash-bank")
                }
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

      {(searchParams.get("update-cash-bank") ||
        searchParams.get("create-cash-bank")) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="lg:w-4xl">
            <BankAccountForm
              initialData={data || []}
              updateFormId={
                updateFormId || searchParams.get("update-cash-bank")
              }
              onClose={() => {
                router.push(pathname);
              }}
              isShowForm={
                searchParams.get("update-cash-bank") ||
                searchParams.get("create-cash-bank")
              }
              refetch={refetch}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Page;