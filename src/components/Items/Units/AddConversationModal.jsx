import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi'; // Using react-icons/fi for the close icon

// --- AddConversionModal Component ---

const AddConversionModal = ({ onClose }) => {
  // Ref for the modal content to detect clicks inside
  const modalRef = useRef(null);

  const [baseUnit, setBaseUnit] = useState('1patha (pa)');
  const [rate, setRate] = useState(0);
  const [secondaryUnit, setSecondaryUnit] = useState('None');

  // Dummy options for the dropdowns
  const baseUnitOptions = [
    { value: '1patha (pa)', label: '1patha (pa)' },
    { value: 'other1', label: 'Other Unit 1' },
    { value: 'other2', label: 'Other Unit 2' },
    { value: 'other3', label: 'Other Unit 3' },
    { value: 'other4', label: 'Other Unit 4' },
    { value: 'other5', label: 'Other Unit 5' },
    { value: 'other6', label: 'Other Unit 6' },
  ];

  const secondaryUnitOptions = [
    { value: 'None', label: 'None' },
    { value: 'LITRE', label: 'LITRE' },
    { value: 'KILOGRAM', label: 'KILOGRAM' },
    { value: 'KILOGRAM2', label: 'KILOGRAM 2' },
    { value: 'KILOGRAM3', label: 'KILOGRAM 3' },
    { value: 'KILOGRAM4', label: 'KILOGRAM 4' },
    { value: 'KILOGRAM5', label: 'KILOGRAM 5' },
    { value: 'KILOGRAM6', label: 'KILOGRAM 6' },
  ];

  // Handler functions
  const handleBaseUnitChange = (e) => setBaseUnit(e.target.value);
  const handleRateChange = (e) => setRate(e.target.value);
  const handleSecondaryUnitChange = (e) => setSecondaryUnit(e.target.value);

  const handleSave = () => {
    console.log('Save:', { baseUnit, rate, secondaryUnit });
    onClose();
  };

  const handleSaveAndNew = () => {
    console.log('Save & New:', { baseUnit, rate, secondaryUnit });
    // Reset fields for new entry
    setBaseUnit('1patha (pa)');
    setRate(0);
    setSecondaryUnit('None');
  };
  
  // Logic for closing the modal when clicking the backdrop
  const handleBackdropClick = (e) => {
    // Check if the click occurred on the outer container (the backdrop)
    // and not inside the modal content area (using modalRef).
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    // Outer fixed container acts as the backdrop
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      aria-modal="true"
      onClick={handleBackdropClick} // Attach click handler to the backdrop
    >
      {/* Modal Content */}
      <div
        ref={modalRef} // Attach ref to the modal content box
        className="relative bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100"
        // Prevent clicks on the content from bubbling up to the backdrop handler
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <button className="text-xl font-semibold text-gray-800 cursor-pointer">Add Conversion</button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Conversion Row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          
          {/* Base Unit */}
          <div className="flex-1 w-full">
            <label htmlFor="base-unit" className="block text-xs font-bold tracking-wider text-gray-500 mb-1">
              BASE UNIT
            </label>
            <select
              id="base-unit"
              value={baseUnit}
              onChange={handleBaseUnitChange}
              className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border shadow-sm cursor-pointer transition-shadow hover:shadow-md"
            >
              {baseUnitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Custom arrow icon for better appearance (React Icons) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 top-0 sm:right-auto sm:left-[30%] flex items-center px-2 text-gray-700">
              {/* Note: In a true select, this icon position needs complex positioning/wrapping, 
              but we simulate the visual look here, often done via CSS for true select elements. */}
            </div>
          </div>

          <span className="text-2xl sm:block hidden font-normal text-gray-700 w-full sm:w-auto text-center sm:pt-6 sm:pb-0 py-2">=</span>

          {/* Rate */}
          <div className="flex-none sm:w-20 w-full">
            <label htmlFor="rate" className="block text-xs font-bold tracking-wider text-gray-500 mb-1">
              RATE
            </label>
            <input
              id="rate"
              type="number"
              value={rate}
              onChange={handleRateChange}
              className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border text-center py-2.5 focus:ring-blue-500 focus:border-blue-500 transition-shadow hover:shadow-md"
              placeholder="0"
            />
          </div>

          {/* Secondary Unit */}
          <div className="flex-1 w-full">
            <label htmlFor="secondary-unit" className="block text-xs font-bold tracking-wider text-gray-500 mb-1">
              SECONDARY UNIT
            </label>
            <select
              id="secondary-unit"
              value={secondaryUnit}
              onChange={handleSecondaryUnitChange}
              className="appearance-none block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border shadow-sm cursor-pointer transition-shadow hover:shadow-md"
            >
              {secondaryUnitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
          >
            SAVE
          </button>
          <button
            onClick={handleSaveAndNew}
            className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
          >
            SAVE & NEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConversionModal;