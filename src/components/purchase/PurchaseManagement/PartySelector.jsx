import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiChevronDown, BiPlus, BiSearch } from 'react-icons/bi';
import { GrClose } from 'react-icons/gr';
import AddExpenceModal from '../../add-party-modal';

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
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [callback]);
    return ref;
};

// ------------------------------------------------------------------
// 2. MOCK: AddPartyModal Component (Styled with Tailwind)
//   (Using AddPartyModal2 name to avoid conflict if the original is also used)
// ------------------------------------------------------------------
const AddPartyModal2 = ({ isOpen, onClose, onSave }) => {
    const [partyName, setPartyName] = useState('');
    const [openingBalance, setOpeningBalance] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            partyName: partyName,
            creditBalance: { openingBalance: parseFloat(openingBalance) || 0 }
        });
        setPartyName('');
        setOpeningBalance('');
        onClose(); // Close modal on save
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Add New Party</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                        <GrClose className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1">Party Name *</label>
                        <input
                            type="text"
                            id="partyName"
                            value={partyName}
                            onChange={(e) => setPartyName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (Optional)</label>
                        <input
                            type="number"
                            id="balance"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="e.g., 500"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-md"
                        >
                            Save Party
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ------------------------------------------------------------------
// 3. UPDATED: PartySelector Component 
// ------------------------------------------------------------------

export default function PartySelector({ setNewParty, setPhoneNumber, selectedParty, onSelect, partyData, refetch }) {
    // Helper function to map data structure
    const mapPartyData = (data) => data ? data.map(item => ({
        id: item?.id,
        name: item?.partyName,
        balance: item?.creditBalance?.openingBalance || 0, // Ensure balance is number
        ...item // Keep all original properties
    })) : [];

    const initialParties = mapPartyData(partyData);

    // State management
    const [parties, setParties] = useState(initialParties);
    const [isOpen, setIsOpen] = useState(false);
    // Renamed newPartyName to mainInputValue for clarity of where it's used
    const [mainInputValue, setMainInputValue] = useState(selectedParty ? selectedParty.name : "");
    // New state for the separate search input in the dropdown
    const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
    const [showAddPartyModal, setShowAddPartyModal] = useState(false);


    // Ref for outside click detection
    const partySelectorRef = useOutsideClick(() => {
        // Only close if the main input is empty or matches the selected party
        if (!selectedParty || selectedParty.name === mainInputValue) {
            setIsOpen(false);
        }
    });

    // Synchronization effects
    useEffect(() => {
        setParties(mapPartyData(partyData));
    }, [partyData]);

    useEffect(() => {
        if (selectedParty && selectedParty.name !== mainInputValue) {
            setMainInputValue(selectedParty.name);
        } else if (!selectedParty) {
            setMainInputValue("");
        }
    }, [selectedParty]);

    // 🔥 New useEffect to call setNewParty when mainInputValue changes and it's a new party candidate
    useEffect(() => {
        const isNewPartyCandidate =
            mainInputValue.trim() !== '' &&
            !parties.some(p => p.name.toLowerCase() === mainInputValue.toLowerCase());

        if (isNewPartyCandidate) {
            // Call the prop with the desired object structure
            setNewParty(mainInputValue);
        } else if (!isNewPartyCandidate && mainInputValue.trim() !== '') {
            // Clear the new party suggestion if the name now matches an existing one
            // or if it was cleared and we want to ensure setNewParty is called with null/empty if the name matches a party in the list.
            // You might need to refine this based on your specific backend logic for 'new' vs 'selected'.
            // For now, we only call setNewParty if it's a *new* party candidate.
            // If a party is selected, `onSelect` handles it.
            // If the input is cleared, it should send null to clear the new party state.
            setNewParty(null);
        } else if (mainInputValue.trim() === '') {
            setNewParty(null);
            setPhoneNumber("")
        }
    }, [mainInputValue, parties, setNewParty]); // Depend on mainInputValue, parties, and setNewParty

    // Handle input change for main input field
    const handleMainInputChange = (e) => {
        const value = e.target.value;
        setMainInputValue(value);

        // If the user starts typing a different value, clear the selection in the parent
        if (selectedParty && selectedParty.name !== value) {
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
        party.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
    );

    // Select a party from the dropdown
    const handleSelectParty = (party) => {
        onSelect(party);
        setPhoneNumber(party?.phoneNumber || "")
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
        if (formData.partyName.trim()) {
            // Logic to add the new party to the local state, assuming a successful API call.
            // (You should replace this with actual logic after an API save and refetch).
            const currentIds = parties.map((p) => p.id).filter(id => typeof id === 'number');
            const newId = currentIds.length > 0 ? Math.max(...currentIds) + 1 : 1;

            const newParty = {
                id: newId,
                name: formData.partyName,
                balance: formData.creditBalance.openingBalance,
                ...formData,
            };

            // Assuming refetch prop works, or you handle state update after successful save
            // For now, we'll just close the modal. If you need to immediately add it to the list:
            // setParties((prev) => [...prev, newParty]);
            // handleSelectParty(newParty);

            setShowAddPartyModal(false);
        }
    };

    // Determine if the currently typed name in the main input is new/non-matching
    const isNewPartyCandidate =
        mainInputValue.trim() !== '' &&
        !parties.some(p => p.name.toLowerCase() === mainInputValue.toLowerCase());

    return (
        <>
            {/* Using the original AddPartyModal for better integration */}
            {/* If AddPartyModal is not defined in the original scope, you should use AddPartyModal2 */}
            <AddExpenceModal isOpen={showAddPartyModal} onClose={() => {
                setShowAddPartyModal(false)
                setIsOpen(false) // Keep dropdown closed after modal interaction
            }} refetch={refetch} onSave={handleSaveParty} />


            <div ref={partySelectorRef} className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party
                </label>

                {/* Main Input Field with Icon Button (For New Party Entry/Display Selected) */}
                <div className="relative">
                    <input
                        type="text"
                        value={mainInputValue}
                        onChange={handleMainInputChange}
                        onBlur={() => {
                            if (selectedParty && mainInputValue !== selectedParty.name) {
                                setMainInputValue(selectedParty.name);
                            }
                        }}
                        placeholder="Inter Party Name *"
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
                        <BiChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
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
                                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 transition-colors flex justify-between items-center ${selectedParty && selectedParty.id === party.id ? 'bg-blue-100 font-semibold' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{party.name}</p>
                                        </div>
                                        <div className="text-right ml-4 flex flex-col justify-center items-end">
                                            <p className={`font-bold text-sm ${party.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {party.balance >= 0 ? `$${party.balance.toFixed(2)}` : `-$${Math.abs(party.balance).toFixed(2)}`}
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