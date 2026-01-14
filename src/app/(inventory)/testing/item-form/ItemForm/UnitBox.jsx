import React, { useEffect, useRef } from 'react';
import { BiChevronDown } from 'react-icons/bi';



// --- Data ---
const unitOptions = [
    'None',
    'BAGS (Bag)', 'BOTTLES (Btl)', 'BOX (Box)', 'BUNDLES (Bdl)', 'CANS (Can)', 
    'CARTONS (Ctn)', 'DOZENS (Dzn)', 'GRAMMES (Gm)', 'KILOGRAMS (Kg)', 'LITRE (Ltr)', 
    'METERS (Mtr)', 'MILILITRE (Ml)', 'NUMBERS (Nos)', 'PACKS (Pac)', 'PAIRS (Prs)', 
    'PIECES (Pcs)', 'QUINTAL (Qtl)', 'ROLLS (Rol)', 'SQUARE FEET (Sqf)'
];

// --- Dropdown Component ---
const UnitBox = ({ label, selectedUnit, onSelect, activeDropdown, setActiveDropdown, id }) => {
    const dropdownRef = useRef(null);
    const isOpen = activeDropdown === id;

    // Closes dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && isOpen) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, setActiveDropdown, id]);

    const handleToggle = () => {
        // If it's open, close it. If it's closed, open it and close others.
        setActiveDropdown(isOpen ? null : id);
    };

    const handleSelect = (unit) => {
        onSelect(unit);
        setActiveDropdown(null);
    };

    return (
        <div ref={dropdownRef} className="w-full relative z-10">
            <label className="block text-xs font-semibold uppercase text-blue-700 mb-1">{label}</label>
            
            {/* Dropdown Button/Display */}
            <div 
                onClick={handleToggle}
                className={`flex items-center justify-between w-full h-10 px-4 py-2 border rounded-md cursor-pointer bg-white shadow-sm transition-all duration-150 
                            ${isOpen ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-500'}`}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={`${id}-menu`}
            >
                <span className="dropdown-display-text text-gray-800">{selectedUnit}</span>
                <BiChevronDown className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div id={`${id}-menu`} role="listbox" className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl origin-top animate-fade-in">
                    <ul className="dropdown-options-list max-h-60 overflow-y-auto custom-scrollbar-react">
                        {unitOptions.map((unit) => (
                            <li
                                key={unit}
                                role="option"
                                aria-selected={selectedUnit === unit}
                                onClick={() => handleSelect(unit)}
                                className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 
                                            ${selectedUnit === unit ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                            >
                                {unit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UnitBox;