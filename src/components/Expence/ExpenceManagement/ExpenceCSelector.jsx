import AddExpenseCategoryModal from "@/components/add-expence-modal";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useEffect, useRef, useState } from "react";
import { BiChevronDown, BiPlus, BiSearch } from "react-icons/bi";

// ------------------------------------------------------------------
// 1. MOCK: useOutsideClick Hook (Client-side hook replacement)
// ------------------------------------------------------------------
const useOutsideClick = (callback) => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);
  return ref;
};


export default function ExpenceCSelector({
  setNewECategory,
  selectedECategory,
  onSelect,
  expenceCData,
  refetch,
  setSelectedExpenceC,
}) {
  // Helper function to map data structure
  const mapPartyData = (data) =>
    data
      ? data.map((item) => ({
          id: item?.id,
          name: item?.name,
          ...item, // Keep all original properties
        }))
      : [];

  const { currencySymbol, formatPrice } = useCurrencyStore();

  const initialParties = mapPartyData(expenceCData);

  // State management
  const [parties, setParties] = useState(initialParties);
  const [isOpen, setIsOpen] = useState(false);
  // Renamed newPartyName to mainInputValue for clarity of where it's used
  const [mainInputValue, setMainInputValue] = useState(
    selectedECategory ? selectedECategory.name : ""
  );
  // New state for the separate search input in the dropdown
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);

  // Ref for outside click detection
  const partySelectorRef = useOutsideClick(() => {
    // Only close if the main input is empty or matches the selected party
    if (!selectedECategory || selectedECategory.name === mainInputValue) {
      setIsOpen(false);
    }
  });

  // Synchronization effects
  useEffect(() => {
    setParties(mapPartyData(expenceCData));
  }, [expenceCData]);

  useEffect(() => {
    if (selectedECategory && selectedECategory.name !== mainInputValue) {
      setMainInputValue(selectedECategory.name);
    } else if (!selectedECategory) {
      setMainInputValue("");
    }
  }, [selectedECategory]);

  // 🔥 New useEffect to call setNewParty when mainInputValue changes and it's a new party candidate
  useEffect(() => {
    const isNewPartyCandidate =
      mainInputValue.trim() !== "" &&
      !parties.some(
        (p) => p.name.toLowerCase() === mainInputValue.toLowerCase()
      );

    if (isNewPartyCandidate) {
      // Call the prop with the desired object structure
      setNewECategory(mainInputValue);
    } else if (!isNewPartyCandidate && mainInputValue.trim() !== "") {
    
      setNewECategory(null);
    } else if (mainInputValue.trim() === "") {
      setNewECategory(null);
    }
  }, [mainInputValue, parties, setNewECategory]); // Depend on mainInputValue, parties, and setNewParty

  // Handle input change for main input field
  const handleMainInputChange = (e) => {
    const value = e.target.value;
    setMainInputValue(value);

    // If the user starts typing a different value, clear the selection in the parent
    if (selectedECategory && selectedECategory.name !== value) {
      onSelect(null);
    }
  };

  // Toggle Dropdown visibility - TRIGGERED BY ICON CLICK
  const handleIconClick = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
    // Clear dropdown search term when opening/closing
    setDropdownSearchTerm("");
  };

  // Handle dropdown search input change
  const handleDropdownSearchChange = (e) => {
    setDropdownSearchTerm(e.target.value);
  };

  // Filtering logic: Use dropdownSearchTerm if dropdown is open, otherwise use mainInputValue
  const currentSearchTerm = isOpen ? dropdownSearchTerm : mainInputValue;
  const filteredParties = parties.filter((party) =>
    party.name && party.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
  );

  // Select a party from the dropdown
  const handleSelectParty = (party) => {
    onSelect(party);
    setMainInputValue(party.name);
    setIsOpen(false);
    setDropdownSearchTerm(""); // Clear dropdown search on selection
  };

  // Open the Add Party Modal
  const handleAddPartyClick = () => {
    setShowAddPartyModal(true);
    setIsOpen(false);
  };

  // Save handler from modal - (Simulated client-side update only)
  const handleSaveParty = (formData) => {
    if (formData.name.trim()) {
      const currentIds = parties
        .map((p) => p.id)
        .filter((id) => typeof id === "number");
      const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 1;

  

      setShowAddPartyModal(false);
    }
  };


  return (
    <>
      <AddExpenseCategoryModal
        isOpen={showAddPartyModal}
        onClose={() => {
          setShowAddPartyModal(false);
          setIsOpen(false);
        }}
        refetch={refetch}
        onSave={handleSaveParty}
        setSelectedParty={setSelectedExpenceC}
      />

      <div ref={partySelectorRef} className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expence Category
        </label>

        <div className="relative">
          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
          <input
            type="text"
            value={mainInputValue}
            onChange={handleMainInputChange}
            onBlur={() => {
              if (selectedECategory && mainInputValue !== selectedECategory.name) {
                setMainInputValue(selectedECategory.name);
                setSelectedExpenceC(null);
              }
            }}
            placeholder={`Inter Expence Category Name *`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 shadow-sm transition duration-150"
            aria-expanded={isOpen}
          />
          {/* Clickable Icon */}
          <button
            type="button"
            onClick={handleIconClick}
            className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition duration-150 rounded-r-lg"
            aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
          >
            <BiChevronDown
              className={`w-5 h-5 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 flex flex-col">
            {/* 🔥 New Search Input in Dropdown */}
            <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-100">
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={dropdownSearchTerm}
                  onChange={handleDropdownSearchChange}
                  autoFocus // Focus automatically when dropdown opens
                  placeholder="Search party list..."
                  className="w-full px-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Display Filtered Parties */}
              {filteredParties.length > 0 ? (
                filteredParties.map((party) => (
                  <button
                    key={party.id}
                    onClick={() => handleSelectParty(party)}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 transition-colors flex justify-between items-center ${
                      selectedECategory && selectedECategory.id === party.id
                        ? "bg-blue-100 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {party.name}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex flex-col justify-center items-end">
                      <p
                        className={`font-bold text-sm ${
                          party?.openingBalance
                            ? party?.balanceType === "ToReceive"
                              ? "text-green-600"
                              : "text-red-600"
                            : "text-gray-500" // Fallback color if no opening balance exists
                        }`}
                      >
                        {
                          party.openingBalance
                            ? parseFloat(party.openingBalance) >= 0
                              ? `${currencySymbol}${parseFloat(
                                  party.openingBalance
                                ).toFixed(2)}`
                              : `-${currencySymbol}${Math.abs(
                                  parseFloat(party.openingBalance)
                                ).toFixed(2)}`
                            : `${currencySymbol}0.00` // Default to $0.00 if openingBalance is null/undefined/empty
                        }
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                // No results message
                <div className="p-4 text-center text-gray-500 text-sm">
                  No parties match "{dropdownSearchTerm}".
                </div>
              )}
            </div>

            {/* Add New Party Option (moved to bottom) */}
            <div className="border-t border-gray-100 sticky bottom-0 bg-white">
              {/* The 'isNewPartyCandidate' check should only apply to the main input, 
                                but showing a hint here is good for UX. Using the dropdown search term 
                                only makes sense if there are no filtered results. 
                                We'll keep the Add Party button standard. */}
              <button
                onClick={handleAddPartyClick}
                className="w-full px-4 py-3 text-left text-blue-600 font-medium text-sm hover:bg-blue-50 flex items-center gap-2 transition duration-150 rounded-b-lg"
              >
                <BiPlus className="w-4 h-4" />
                Add Party
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
