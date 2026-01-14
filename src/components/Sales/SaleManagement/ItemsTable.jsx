"use client";

import ItemForm from "@/components/ItemForm/ItemForm";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
// --- Portal Component (for rendering outside table overflow) ---
function DropdownPortal({ children, targetRef, isOpen }) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const targetElement = targetRef.current;

  useEffect(() => {
    if (!isOpen || !targetElement) return;

    const calculatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width, // Match the width of the input
      });
    };

    calculatePosition();

    // Re-calculate position on scroll or window resize
    window.addEventListener("scroll", calculatePosition);
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen, targetElement]);

  if (typeof window === "undefined") return null;
  let portalRoot = document.getElementById("dropdown-portal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.setAttribute("id", "dropdown-portal-root");
    document.body.appendChild(portalRoot);
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl min-w-[500px]" // Increased min-width for columns
      style={{
        top: coords.top,
        left: coords.left,
        // The dropdown's width will be at least 500px, but it needs to be positioned relative to the input
        // width: coords.width, // Comment out to allow for min-width > input width
        maxHeight: "250px",
        overflowY: "auto",
      }}
    >
      {children}
    </div>,
    portalRoot
  );
}

// --- Searchable Item Dropdown Component ---
function SearchableItemInput({
  value,
  onChange,
  onAddNewItem,
  availableItems,
  refetch,
  activeId,
  type,
  autoAddItem,
}) {
  // searchTerm now ONLY controls the main input box value (for item name)
  const [searchTerm, setSearchTerm] = useState(value);
  // NEW: searchFilter controls the search input within the dropdown
  const [searchFilter, setSearchFilter] = useState("");
  const [activeItemName, setActiveItemName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [isShowItemForm, setShowItemForm] = useState(false);

  // Use the new item structure properties: id, itemName, salePrice, stock.openingQuantity
  // Filter based on the searchFilter state
  const filteredItems = (availableItems || []).filter((item) =>
    item.itemName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelect = (item) => {
    // Pass the item name back
    onChange(activeId, "item", item.itemName);
    setActiveItemName(item.itemName);
    onChange(
      activeId,
      "price",
      type === "sale" ? item.salePrice : item.purchasePrice || 0
    );
    onChange(activeId, "unit", item.baseUnit || "None");
    onChange(activeId, "itemId", item?.id);
    setSearchTerm(item.itemName); // Update the main input box
    setSearchFilter(""); // Clear the search filter on select
    setIsOpen(false);
  };

  // Handler for the main input box (Input/Enter Item Name)
  const handleMainInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue); // Update the main input box state

    // Do NOT open dropdown or set searchFilter here, it's just for input
  };

  const handleChangeItem = (e) => {
    if (activeItemName !== e.target.value) {
      onChange(activeId, "item", e.target.value);
      onChange(activeId, "price", 0);
      onChange(activeId, "itemId", "");
      onChange(activeId, "amount", 0);
      onChange(activeId, "qty", 1);
      onChange(activeId, "unit", "None");
    }
  };

  // Handler for the dropdown search input
  const handleSearchFilterChange = (e) => {
    setSearchFilter(e.target.value);
  };

  const handleAddItemClick = () => {
    onAddNewItem(searchTerm);
    setIsOpen(false);
  };

  // Effect to close the dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        // We set a small timeout to avoid closing immediately if the click
        // lands on the portal area right after the input loses focus.
        setTimeout(() => {
          setIsOpen(false);
          setSearchFilter(""); // Clear filter when closing
        }, 100);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {isShowItemForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
          <div className="lg:w-4xl bg-white">
            {" "}
            <ItemForm
              priceType={type}
              autoAddItem={autoAddItem}
              refetch={refetch}
              setShowForm={setShowItemForm}
              onClose={() => {
                setShowItemForm(false);
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="relative w-full">
        <div className="relative" ref={inputRef}>
          {/* Main Input Box (Input/Enter Item Name) - REMOVED FiSearch, adjusted padding/placeholder */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleMainInputChange} // Use new handler
            // onFocus={() => setIsOpen(true)}
            onBlur={(e) => handleChangeItem(e)}
            placeholder="Enter Item Name" // Updated placeholder
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8" // Adjusted padding
          />
          {/* Dropdown Toggle Icon */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setSearchFilter(""); // Clear filter when toggling open/closed
            }}
            className="absolute right-0 top-0 h-full px-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FiChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <DropdownPortal targetRef={inputRef} isOpen={isOpen}>
          {/* NEW: Search Input inside the dropdown */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={handleSearchFilterChange}
                placeholder="Search available items..."
                className="w-full pl-8 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                // Optional: Add onFocus to keep the dropdown open if the search input is focused
                onFocus={() => setIsOpen(true)}
              />
            </div>
          </div>

          {/* Dropdown Content Header */}
          <div className="flex bg-gray-50 text-xs font-semibold uppercase text-gray-600 border-b border-gray-200">
            <div className="p-2 w-1/2">Item Name</div>
            <div className="p-2 w-1/6 text-right">Sale Price</div>
            <div className="p-2 w-1/6 text-right">Purchase Price</div>
            <div className="p-2 w-1/6 text-right">Stock</div>
          </div>
          {/* Add Item Button at the bottom of the dropdown */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => setShowItemForm(true)}
              className="flex items-center gap-1 w-full justify-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors font-medium text-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add New Item
            </button>
          </div>
          {/* Item List Body */}
          <div className="divide-y divide-gray-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  // Use item.id from the new structure
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex w-full text-sm text-left cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {/* Use item.itemName */}
                  <div className="p-2 w-1/2 text-gray-800 truncate">
                    {item.itemName}
                  </div>
                  {/* Use item.salePrice */}
                  <div className="p-2 w-1/6 text-right text-gray-600">
                    ${item.salePrice && item.salePrice.toFixed(2)}
                  </div>
                  {/* Use item.purchasePrice */}
                  <div className="p-2 w-1/6 text-right text-gray-600">
                    ${item.purchasePrice && item.purchasePrice.toFixed(2)}
                  </div>
                  {/* Use item.stock.openingQuantity */}
                  <div
                    className={`p-2 w-1/6 text-right font-medium ${
                      item?.stock?.openingQuantity > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item?.stock?.openingQuantity}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No matching items found.
              </div>
            )}
          </div>
        </DropdownPortal>
      </div>
    </>
  );
}

// --- Main ItemsTable Component ---
export default function ItemsTable({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddNewItem,
  itemData,
  refetch,
  type,
  autoAddItem,
}) {
  // Set availableItems to the itemData prop
  const availableItems = itemData || [];

  const units = [
    "None",
    "BAGS (Bag)",
    "BOTTLES (Btl)",
    "BOX (Box)",
    "BUNDLES (Bdl)",
    "CANS (Can)",
    "CARTONS (Ctn)",
    "DOZENS (Dzn)",
    "GRAMMES (Gm)",
    "KILOGRAMS (Kg)",
    "LITRE (Ltr)",
    "METERS (Mtr)",
    "MILILITRE (Ml)",
    "NUMBERS (Nos)",
    "PACKS (Pac)",
    "PAIRS (Prs)",
    "PIECES (Pcs)",
    "QUINTAL (Qtl)",
    "ROLLS (Rol)",
    "SQUARE FEET (Sqf)",
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  #
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  ITEM
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  QTY
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  UNIT
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  PRICE/UNIT
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  AMOUNT
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3">
                    <SearchableItemInput
                      value={item.item}
                      onChange={onUpdateItem}
                      type={type}
                      autoAddItem={autoAddItem}
                      // onChange={(value) => {
                      //   onUpdateItem(item.id, "item", value)
                      //   onUpdateItem(item.id, "price", 100)
                      // }}
                      onAddNewItem={onAddNewItem} // Prop to handle the "Add Item" button click
                      // Pass the items from prop down to the input component
                      availableItems={availableItems}
                      activeId={item.id}
                      refetch={refetch}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={item.qty}
                      onChange={(e) =>
                        onUpdateItem(
                          item.id,
                          "qty",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.unit}
                      // defaultValue={item?.unit}
                      onChange={(e) =>
                        onUpdateItem(item.id, "unit", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item?.price}
                      placeholder="0"
                      // New: Clear the value property if it's 0 when the input gets focus
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = ""; // Temporarily set the input's visual value to empty
                        }
                      }}
                      // New: Revert to 0 if the input is left empty (blur)
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          // This ensures your onUpdateItem handler receives 0
                          onUpdateItem(item.id, "price", 0);
                        }
                      }}
                      onChange={(e) =>
                        onUpdateItem(
                          item.id,
                          "price",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        item?.amount === 0 ||
                        item?.amount === null ||
                        item?.amount === undefined
                          ? ""
                          : item.amount
                      }
                      placeholder="0"
                      onFocus={(e) => {
                        // We check against the actual string '0' that might be in the visual field
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          onUpdateItem(item.id, "amount", 0);
                        }
                      }}
                      onChange={(e) => {
                        onUpdateItem(
                          item.id,
                          "amount",
                          Number.parseFloat(e.target.value) || 0
                        );
                      }}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                  {/* <td className="px-4 py-3 font-medium text-gray-900">{item.amount && (item.amount || 0).toFixed(2)}</td> */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="inline-flex items-center justify-center p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
        >
          <FiPlus className="w-4 h-4" />
          ADD ROW
        </button>
      </div>
    </>
  );
}
