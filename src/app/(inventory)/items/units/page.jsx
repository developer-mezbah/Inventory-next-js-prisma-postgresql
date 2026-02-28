"use client";
import CustomModal from "@/components/Items/Units/CustomModal";
import TabContents from "@/components/Items/Units/TabContents";
import PortalDropdown from "@/components/PortalDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  FaChevronLeft,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
const tabs = [
  {
    id: "bags",
    label: "BAGS",
    shortName: "Bag",
    conversion: [
      "1 Bag = variable quantity depending on item (e.g., 50 kg of rice)",
    ],
  },
  {
    id: "bottles",
    label: "BOTTLES",
    shortName: "Btl",
    conversion: ["1 Bottle = variable volume (e.g., 500 ml, 1 L)"],
  },
  {
    id: "box",
    label: "BOX",
    shortName: "Box",
    conversion: ["1 Box = multiple pieces/items (e.g., 12 pcs, 24 pcs)"],
  },
  {
    id: "bundles",
    label: "BUNDLES",
    shortName: "Bdl",
    conversion: ["1 Bundle = variable count (e.g., 10 units, 100 sheets)"],
  },
  {
    id: "cans",
    label: "CANS",
    shortName: "Can",
    conversion: ["1 Can = variable volume (e.g., 330 ml, 500 ml)"],
  },
  {
    id: "cartons",
    label: "CARTONS",
    shortName: "Ctn",
    conversion: [
      "1 Carton = multiple boxes or pieces (e.g., 12 boxes, 24 pcs)",
    ],
  },
  {
    id: "dozens",
    label: "DOZENS",
    shortName: "Dzn",
    conversion: ["1 Dozen = 12 pieces", "1 DOZENS = 12 NUMBERS"],
  },
  {
    id: "grammes",
    label: "GRAMMES",
    shortName: "Gm",
    conversion: ["1 Gram = 0.001 Kilogram", "1000 Gram = 1 Kilogram"],
  },
  {
    id: "kilograms",
    label: "KILOGRAMS",
    shortName: "Kg",
    conversion: [
      "1 Kilogram = 1000 Grams",
      "1 Kilogram = 2.20462 Pounds",
      "KILOGRAMS = 0.01 QUINTAL",
    ],
  },
  {
    id: "litre",
    label: "LITRE",
    shortName: "Ltr",
    conversion: ["1 Litre = 1000 Millilitres", "1 Litre = 1.0567 Quarts"],
  },
  {
    id: "meters",
    label: "METERS",
    shortName: "Mtr",
    conversion: ["1 Meter = 100 Centimeters", "1 Meter = 3.28084 Feet"],
  },
  {
    id: "mililitre",
    label: "MILILITRE",
    shortName: "Ml",
    conversion: ["1000 Millilitres = 1 Litre", "1 MILILITRE = 0.001 LITRE"],
  },
  {
    id: "numbers",
    label: "NUMBERS",
    shortName: "Nos",
    conversion: ["1 Number = 1 Unit/Piece"],
  },
  {
    id: "packs",
    label: "PACKS",
    shortName: "Pac",
    conversion: ["1 Pack = multiple units (e.g., 6 pcs, 12 pcs)"],
  },
  {
    id: "pairs",
    label: "PAIRS",
    shortName: "Prs",
    conversion: ["1 Pair = 2 Pieces"],
  },
  {
    id: "pieces",
    label: "PIECES",
    shortName: "Pcs",
    conversion: ["1 Piece = 1 Unit"],
  },
  {
    id: "quintal",
    label: "QUINTAL",
    shortName: "Qtl",
    conversion: ["1 Quintal = 100 Kilograms"],
  },
  {
    id: "rolls",
    label: "ROLLS",
    shortName: "Rol",
    conversion: ["1 Roll = variable length (e.g., 10 meters, 100 meters)"],
  },
  {
    id: "squarefeet",
    label: "SQUARE FEET",
    shortName: "Sqf",
    conversion: [
      "1 Square Foot = 0.092903 Square Meter",
      "1 Square Meter = 10.7639 Square Feet",
    ],
  },
  {
    id: "squaremeters",
    label: "SQUARE METERS",
    shortName: "Sqm",
    conversion: [
      "1 Square Meter = 10.7639 Square Feet",
      "1 Square Foot = 0.092903 Square Meter",
    ],
  },
  {
    id: "tablets",
    label: "TABLETS",
    shortName: "Tbs",
    conversion: [
      "1 Tablet = 1 Unit (medicine or compressed item)",
      "1 TABLETS = 10 ROLLS",
    ],
  },
];

const Units = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threeDotDD, setThreeDotDD] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const [searchTerm, setSearchTerm] = useState("");
  const activeTab = searchParams.get("tab") || "general";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Store trigger refs for each dropdown
  const triggerRefs = useRef({});

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'details'

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
      if (activeTab === "general") {
        setMobileView("list");
      } else {
        setMobileView("details");
      }
    }
  }, [activeTab, isMobile]);

  const handleBackToList = useCallback(() => {
    if (isMobile) {
      setMobileView("list");
      // Optionally clear the tab from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      router.replace(`?${params.toString()}`);
    }
  }, [isMobile, router, searchParams]);

  const handleView = (tabId) => {
    console.log("Viewing tab:", tabId);
    setOpenDropdownId(null);
  };

  const handleDelete = (tabId) => {
    console.log("Deleting tab:", tabId);
    setOpenDropdownId(null);
  };

  const filteredTabs = useMemo(() => {
    if (!searchTerm) {
      return tabs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tabs.filter(
      (tab) =>
        tab.label.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(tab.shortName).toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

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

  useEffect(() => {
    if (!searchParams.get("tab")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "general");
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colorPalette = [
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
  ];

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header with Add Unit and Menu */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
        >
          <FaPlus className="mr-2" />
          Add Units
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
                  No Options available
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
          placeholder="Search Full or Short Name"
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

      {/* Units List Box */}
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
                    onClick={() => handleTabChange(tab.id)}
                    className="flex-grow text-left"
                  >
                    <div className="font-semibold text-gray-800">
                      {tab.label}
                    </div>
                    <div className="text-sm mt-1">
                      Short:{" "}
                      <span className={`${colorStyle.text} font-bold`}>
                        {tab.shortName}
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
                        onClick={() => handleView(tab.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View
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
            <p className="text-gray-500 italic">
              No result found for &quot;{searchTerm}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render mobile details view
  const renderMobileTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);

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
              {activeTabData?.label || "Unit"}
            </h2>
            {activeTabData?.shortName && (
              <p className="text-sm text-gray-600">
                ({activeTabData.shortName})
              </p>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-grow overflow-auto">
          {activeTabData ? (
            <TabContents content={activeTabData} />
          ) : (
            <div className="p-4 text-gray-600 text-center">
              No unit data available.
            </div>
          )}
        </div>
      </div>
    );
  };

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
        className={`md:w-1/5 min-w-[200px] w-full overflow-x-hidden md:border-r pr-4 transition-all ${
          isSidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="mb-3 flex justify-between items-center">
          <div className="relative">
            <button
              onClick={openModal}
              className="flex cursor-pointer items-center rounded-lg shadow-md overflow-hidden"
            >
              <div className="flex items-center px-4 h-9 text-white font-medium text-base bg-[#F3A33A] hover:bg-[#F5B358] transition duration-150 ease-in-out">
                <FaPlus className="mr-2" />
                Add Units
              </div>
            </button>
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
                  No Options available
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
              placeholder="Search Full or Short Name"
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
              <span className="truncate">Full Name</span>
              <FaFilter className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
            </div>
            <div className="w-28 p-3 flex items-center justify-start bg-blue-50">
              <span>Short Name</span>
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
                    onClick={() => handleTabChange(tab.id)}
                    className="flex-grow text-left focus:outline-none cursor-pointer"
                  >
                    {tab.label}
                  </button>

                  <div className="flex items-center space-x-3 relative ml-2">
                    <span
                      className={`${colorStyle.bg} ${colorStyle.text} px-2 py-0.5 rounded-full text-xs font-semibold`}
                    >
                      {tab?.shortName}
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
                      <span className="text-xl leading-none cursor-pointer">
                        ...
                      </span>
                    </button>

                    <PortalDropdown
                      isOpen={isDropdownOpen}
                      onClose={() => setOpenDropdownId(null)}
                      triggerRef={{ current: triggerRefs.current[tab.id] }}
                      position="right-start"
                    >
                      <button
                        onClick={() => handleView(tab.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View
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
        <div className="transition-opacity duration-300 ease-in-out">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && <TabContents key={tab.id} content={tab} />
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

        {/* Modal for mobile and desktop */}
        <CustomModal isOpen={showModal} onClose={closeModal}>
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">New Unit</h2>
            <button
              onClick={closeModal}
              className="p-1 text-gray-400 rounded-full hover:bg-gray-50 hover:text-gray-600 transition"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Name
            </label>
            <input
              type="text"
              placeholder="Unit Name e.g., Kilogram"
              className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner"
            />
            <label className="block text-sm font-medium text-gray-700 my-2">
              Short Name
            </label>
            <input
              type="text"
              placeholder="Short Name e.g., Kg"
              className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner"
            />
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => {
                console.log("Category created!");
                closeModal();
              }}
              className="w-full py-3 bg-red-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-red-700 transition duration-150 ease-in-out transform hover:scale-[1.01]"
            >
              Create
            </button>
          </div>
        </CustomModal>
      </>
    );
  }

  return (
    <>
      {renderDesktopView()}

      <CustomModal isOpen={showModal} onClose={closeModal}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">New Unit</h2>
          <button
            onClick={closeModal}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-50 hover:text-gray-600 transition"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit Name
          </label>
          <input
            type="text"
            placeholder="Unit Name e.g., Kilogram"
            className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner"
          />
          <label className="block text-sm font-medium text-gray-700 my-2">
            Short Name
          </label>
          <input
            type="text"
            placeholder="Short Name e.g., Kg"
            className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner"
          />
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={() => {
              console.log("Category created!");
              closeModal();
            }}
            className="w-full py-3 bg-red-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-red-700 transition duration-150 ease-in-out transform hover:scale-[1.01]"
          >
            Create
          </button>
        </div>
      </CustomModal>
    </>
  );
};

export default Units;