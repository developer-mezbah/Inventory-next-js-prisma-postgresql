"use client";
import TabContents from "@/components/Category/TabContents";
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
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import CategroyButton from "../../Categroy/CategoryButton";
import PortalDropdown from "@/components/PortalDropdown";
const colorPalette = [
  { bg: "bg-indigo-100", text: "text-indigo-800" },
  { bg: "bg-teal-100", text: "text-teal-800" },
  { bg: "bg-orange-100", text: "text-orange-800" },
  { bg: "bg-pink-100", text: "text-pink-800" },
  { bg: "bg-purple-100", text: "text-purple-800" },
];

const Category = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [addItemDD, setAddItemDD] = useState(false);
  const [threeDotDD, setThreeDotDD] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openSubcategoryId, setOpenSubcategoryId] = useState(null);
  const [updateCategoryData, setUpdateCategoryData] = useState(null);

  // Store trigger refs for each dropdown
  const triggerRefs = useRef({});

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'details'

  const {
    isInitialLoading,
    error,
    data: fetchedCategories = [],
    refetch,
  } = useFetchData("/api/categories/categories-items", ["category-items"]);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const handleDeleteCategory = (categoryId) => {
    DeleteAlert(
      `/api/categories/${categoryId}`,
      "your_token_here",
      "This will delete all associated subcategories.",
      ""
    )
      .then((res) => {
        if (res) {
          toast.success("Category deleted successfully!");
          refetch();
          setOpenDropdownId(null);
          // If on mobile and deleting current active category, go back to list
          if (isMobile && categoryId === activeCategoryId) {
            handleBackToList();
          }
        }
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
      });
  };

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // URL/Routing Logic
  const activeCategoryId = searchParams.get("categoryId");
  const activeSubcategoryId = searchParams.get("subcategoryId");

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set mobile view based on active selection
  useEffect(() => {
    if (isMobile) {
      if (!activeCategoryId) {
        setMobileView("list");
      } else {
        setMobileView("details");
      }
    }
  }, [activeCategoryId, isMobile]);

  const handleSelectionChange = useCallback(
    (categoryId, subcategoryId = null) => {
      const params = new URLSearchParams();
      params.set("categoryId", categoryId);

      if (subcategoryId) {
        params.set("subcategoryId", subcategoryId);
      }

      router.replace(`?${params.toString()}`);

      if (isMobile) {
        setMobileView("details");
      } else {
        setIsSidebarOpen(false);
      }
    },
    [router, isMobile]
  );

  const handleBackToList = useCallback(() => {
    if (isMobile) {
      setMobileView("list");
      // Optionally clear URL params
      const params = new URLSearchParams();
      params.delete("categoryId");
      params.delete("subcategoryId");
      router.replace(`?${params.toString()}`);
    }
  }, [isMobile, router]);

  useEffect(() => {
    if (fetchedCategories.length > 0 && !activeCategoryId) {
      const params = new URLSearchParams();
      params.set("categoryId", fetchedCategories[0].id);
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedCategories.length]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) {
      return fetchedCategories;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return fetchedCategories.filter((category) => {
      if (category.name.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }
      if (
        category.items.some((item) =>
          item.itemName.toLowerCase().includes(lowerCaseSearchTerm)
        )
      ) {
        return true;
      }
      if (
        category.subcategories.some((sub) =>
          sub.name.toLowerCase().includes(lowerCaseSearchTerm)
        )
      ) {
        return true;
      }
      return false;
    });
  }, [fetchedCategories, searchTerm]);

  const currentCategory = useMemo(() => {
    return fetchedCategories.find((cat) => cat.id === activeCategoryId) || null;
  }, [fetchedCategories, activeCategoryId]);

  const currentSubcategory = useMemo(() => {
    if (currentCategory && activeSubcategoryId) {
      return currentCategory.subcategories.find(
        (sub) => String(sub.id) === activeSubcategoryId
      );
    }
    return null;
  }, [currentCategory, activeSubcategoryId]);

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-blue-500 font-semibold">
          Loading Categories and Items...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">
        <p>Error loading data: {error.message}</p>
      </div>
    );
  }

  // Render mobile list box view
  const renderMobileListBox = () => (
    <div className="p-4">
      {/* Mobile Header with Add Category and Menu */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
        >
          <FaPlus className="mr-2" />
          Add Category
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
          placeholder="Search Category, Item, or Subcategory"
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

      {/* Category List Box */}
      <div className="space-y-3">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => {
            const colorStyle = colorPalette[index % colorPalette.length];
            const isDropdownOpen = openDropdownId === category.id;
            const itemCount = category.items ? category.items.length : 0;
            const hasSubcategories =
              category.subcategories && category.subcategories.length > 0;
            const isSubcategoryCollapsedOpen =
              openSubcategoryId === category.id;

            return (
              <div
                key={category.id}
                className={`p-4 rounded-lg shadow-sm border ${colorStyle.bg}`}
              >
                {/* Main Category Info */}
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => handleSelectionChange(category.id)}
                    className="flex-grow text-left"
                  >
                    <div className="font-semibold text-gray-800">
                      {category.name}
                    </div>
                    <div className="text-sm mt-1">
                      Items:{" "}
                      <span className={`${colorStyle.text} font-bold`}>
                        {itemCount}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Subcategory Toggle Button */}
                    {hasSubcategories && (
                      <button
                        onClick={() => {
                          setOpenSubcategoryId(
                            isSubcategoryCollapsedOpen ? null : category.id
                          );
                        }}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <FaChevronDown
                          className={`text-gray-600 transition-all ${
                            isSubcategoryCollapsedOpen
                              ? "rotate-0"
                              : "-rotate-90"
                          }`}
                          size={14}
                        />
                      </button>
                    )}

                    {/* Menu Button */}
                    <div className="relative ml-2">
                      <button
                        ref={el => triggerRefs.current[category.id] = el}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(
                            isDropdownOpen ? null : category.id
                          );
                        }}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <span className="text-xl text-gray-600">...</span>
                      </button>

                      <PortalDropdown
                        isOpen={isDropdownOpen}
                        onClose={() => setOpenDropdownId(null)}
                        triggerRef={{ current: triggerRefs.current[category.id] }}
                        position="bottom-end"
                      >
                        <button
                          onClick={() => {
                            setUpdateCategoryData(category);
                            setShowModal(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </PortalDropdown>
                    </div>
                  </div>
                </div>

                {/* Subcategories (Collapsible) */}
                {hasSubcategories && isSubcategoryCollapsedOpen && (
                  <div className="mt-3 ml-2 pl-3 border-l border-gray-300">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Subcategories:
                    </p>
                    <div className="space-y-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() =>
                            handleSelectionChange(category.id, sub.id)
                          }
                          className="block w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center">
            {fetchedCategories.length === 0 ? (
              <>
                <p className="text-gray-500 mb-4">No categories found.</p>
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-[#F3A33A] text-white rounded-md hover:bg-[#F5B358] transition"
                >
                  <FaPlus className="inline mr-2" /> Add Category
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
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold truncate">
            {currentCategory?.name || "Category"}
          </h2>
          {currentSubcategory && (
            <p className="text-sm text-gray-600 truncate">
              {currentSubcategory.name}
            </p>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-auto">
        {currentCategory ? (
          <TabContents
            category={currentCategory}
            subcategory={currentSubcategory}
            categoryName={`${currentCategory.name}${
              currentSubcategory ? ` / ${currentSubcategory.name}` : ""
            }`}
          />
        ) : (
          <div className="p-4 text-gray-600 text-center">
            No category data available.
          </div>
        )}
      </div>
    </div>
  );

  // Render desktop view (original layout)
  const renderDesktopView = () => (
    <div>
      <CategroyButton
        refetchCategoryPage={refetch}
        isOpened={showModal}
        closeModal={closeModal}
        isButton={false}
      />
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
                  Add Category
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
                placeholder="Search Category, Item, or Subcategory"
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
                <span className="truncate">Category</span>
                <FaFilter className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
              </div>
              <div className="w-28 p-3 flex items-center justify-start bg-blue-50">
                <span>Items</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => {
                const colorStyle = colorPalette[index % colorPalette.length];
                const isDropdownOpen = openDropdownId === category.id;
                const isCategoryActive = category.id === activeCategoryId;
                const isSubcategoryCollapsedOpen =
                  openSubcategoryId === category.id;
                const itemCount = category.items ? category.items.length : 0;

                return (
                  <div key={category.id} className="w-full">
                    <div
                      className={`py-2 px-2 text-left rounded-md font-medium transition-all duration-300 ease-in-out flex justify-between items-center ${
                        isCategoryActive
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setOpenSubcategoryId(
                            isSubcategoryCollapsedOpen ? null : category.id
                          );
                        }}
                        className="flex-grow text-left focus:outline-none flex items-center"
                      >
                        <FaChevronDown
                          className={`text-gray-400 mr-2 transition-all duration-300 ${
                            isSubcategoryCollapsedOpen
                              ? "rotate-0"
                              : "-rotate-90"
                          }`}
                          size={12}
                        />
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectionChange(category.id);
                          }}
                        >
                          {category.name}
                        </span>
                      </button>

                      <div className="flex items-center space-x-3 relative ml-2">
                        <span
                          className={`${colorStyle.bg} ${colorStyle.text} px-2 py-0.5 rounded-full text-xs font-semibold`}
                        >
                          {itemCount}
                        </span>

                        <button
                          ref={el => triggerRefs.current[category.id] = el}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              isDropdownOpen ? null : category.id
                            );
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
                          triggerRef={{ current: triggerRefs.current[category.id] }}
                          position="right-start"
                        >
                          <button
                            onClick={() => {
                              setUpdateCategoryData(category);
                              setShowModal(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </PortalDropdown>
                      </div>
                    </div>

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isSubcategoryCollapsedOpen
                          ? "max-h-96 opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-6 border-l border-gray-300 pl-2">
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          category.subcategories.map((sub) => {
                            const isSubActive =
                              String(sub.id) === activeSubcategoryId &&
                              isCategoryActive;

                            return (
                              <button
                                key={sub.id}
                                onClick={() =>
                                  handleSelectionChange(category.id, sub.id)
                                }
                                className={`block w-full text-left text-sm py-1.5 pl-2 pr-4 rounded transition-colors duration-150 ${
                                  isSubActive
                                    ? "bg-blue-50 text-blue-500 font-semibold"
                                    : "text-gray-500 hover:bg-gray-100"
                                }`}
                              >
                                {sub.name}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-400 py-1.5 pl-2 italic">
                            No subcategories
                          </p>
                        )}
                      </div>
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
            <TabContents
              category={currentCategory}
              subcategory={currentSubcategory}
              categoryName={`${currentCategory?.name || "Category Name"} ${
                currentSubcategory ? ` / ${currentSubcategory.name}` : ""
              }`}
            />
          </div>
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

        <CategroyButton
          refetchCategoryPage={refetch}
          isOpened={showModal}
          closeModal={closeModal}
          isButton={false}
          initialData={updateCategoryData}
          setUpdateCategoryData={setUpdateCategoryData}
        />
      </>
    );
  }

  return (
    <>
      {renderDesktopView()}
      <CategroyButton
        refetchCategoryPage={refetch}
        isOpened={showModal}
        closeModal={closeModal}
        isButton={false}
        initialData={updateCategoryData}
        setUpdateCategoryData={setUpdateCategoryData}
      />
    </>
  );
};

export default Category;