/**
 * Party Selector Application
 * This single file contains the main App, the PartySelector component, 
 * a mocked AddPartyModal, and a mocked useOutsideClick hook.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiChevronDown, BiPlus } from 'react-icons/bi';
import { GrClose } from 'react-icons/gr';

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
// ------------------------------------------------------------------
const AddPartyModal = ({ isOpen, onClose, onSave }) => {
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
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
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
// 3. UPDATED: PartySelector Component (Now with Search Input)
// ------------------------------------------------------------------

export default function PartySelector({ selectedParty, onSelect }) {
    // Initial party data (for demonstration)
    const initialParties = [
        { id: 1, name: "Alpha Accounting", balance: 100, status: "active" },
        { id: 2, name: "Baker Industries", balance: 300, status: "pending" },
        { id: 3, name: "Charlie Co.", balance: -248, status: "active" }, // Negative balance for illustration
        { id: 4, name: "Delta Distributors", balance: 50, status: "active" },
        { id: 5, name: "Echo Enterprises", balance: 1500, status: "active" },
    ];
    
    // State management
    const [parties, setParties] = useState(initialParties);
    const [isOpen, setIsOpen] = useState(false);
    const [newPartyName, setNewPartyName] = useState(selectedParty ? selectedParty.name : "");
    const [showAddPartyModal, setShowAddPartyModal] = useState(false);

    // Ref for outside click detection
    const partySelectorRef = useOutsideClick(() => {
        // Only close if the search input is empty or matches the selected party
        // This prevents the search term from being cleared unintentionally
        if (!selectedParty || selectedParty.name === newPartyName) {
            setIsOpen(false);
        }
    });

    // Synchronization effect for initial load or external selection change
    useEffect(() => {
        if (selectedParty && selectedParty.name !== newPartyName) {
            setNewPartyName(selectedParty.name);
        }
    }, [selectedParty]);

    // Handle input change for search and new party name entry
    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewPartyName(value);
        setIsOpen(true); // Open dropdown on typing or focus

        // If the user starts typing a different value, clear the selection in the parent
        if (selectedParty && selectedParty.name !== value) {
            onSelect(null);
        }
    };

    // Filtering logic
    const filteredParties = parties.filter((party) =>
        party.name.toLowerCase().includes(newPartyName.toLowerCase())
    );

    // Select a party from the dropdown
    const handleSelectParty = (party) => {
        onSelect(party); // Propagate selection to parent
        setNewPartyName(party.name); // Update input to show selected party name
        setIsOpen(false);
    };

    // Open the Add Party Modal
    const handleAddPartyClick = () => {
        setShowAddPartyModal(true);
        setIsOpen(false); // Close the dropdown when opening the modal
    };

    // Save handler from modal
    const handleSaveParty = (formData) => {
        if (formData.partyName.trim()) {
            const newId = Math.max(...parties.map((p) => p.id), 0) + 1;
            const newParty = {
                id: newId,
                name: formData.partyName,
                balance: formData.creditBalance.openingBalance,
                status: "active",
                ...formData,
            };
            setParties((prev) => [...prev, newParty]);
            handleSelectParty(newParty); // Select the newly created party
            setShowAddPartyModal(false);
        }
    };

    // Determine if the currently typed name is new/non-matching
    const isNewPartyCandidate = 
        newPartyName.trim() !== '' && 
        !parties.some(p => p.name.toLowerCase() === newPartyName.toLowerCase());

    return (
        <>
            <div ref={partySelectorRef} className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party
                </label>
                
                {/* Search Input Field */}
                <div className="relative">
                    <input
                        type="text"
                        value={newPartyName}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => {
                             // If a party is selected, reset input to the selected party's name 
                             // if the current input doesn't exactly match the selection.
                             if (selectedParty && newPartyName !== selectedParty.name) {
                                setNewPartyName(selectedParty.name);
                             }
                        }}
                        placeholder="Search by Name/Phone *"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 shadow-sm transition duration-150"
                        aria-expanded={isOpen}
                    />
                    <BiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 flex flex-col">
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
                                            <p className="text-xs text-gray-500">ID: {party.id}</p>
                                        </div>
                                        <div className="text-right ml-4 flex flex-col justify-center items-end">
                                            <p className={`font-bold text-sm ${party.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {party.balance >= 0 ? `$${party.balance.toFixed(2)}` : `-$${Math.abs(party.balance).toFixed(2)}`}
                                            </p>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full mt-0.5 ${
                                                    party.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {party.status}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                // No results message
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No parties match "{newPartyName}".
                                </div>
                            )}
                        </div>
                        
                        {/* Add New Party Option (Always visible or conditional based on design) */}
                        <div className="border-t border-gray-100">
                            {isNewPartyCandidate && (
                                <div className="p-2 bg-yellow-50 text-yellow-800 text-sm text-center">
                                    Create new party: <span className="font-bold">"{newPartyName}"</span>
                                </div>
                            )}
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

            <AddPartyModal 
                isOpen={showAddPartyModal} 
                onClose={() => setShowAddPartyModal(false)} 
                onSave={handleSaveParty} 
            />
        </>
    );
}

