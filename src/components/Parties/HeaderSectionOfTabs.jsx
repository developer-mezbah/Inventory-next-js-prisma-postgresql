import React, { useState, useEffect, useRef } from 'react';
import { BiCheck, BiChevronDown, BiPlus } from 'react-icons/bi';
import { CiSettings } from 'react-icons/ci';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuEllipsisVertical } from 'react-icons/lu';

// Note: You must install Lucide React: npm install lucide-react

const DropdownMenu = ({ children, isVisible, positionClass = 'left-0' }) => {
  return (
    <div
      className={`absolute top-full mt-2 w-max min-w-[200px] z-20 
        bg-white rounded-lg shadow-xl py-2 
        transition-opacity duration-200 ease-out 
        ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'} 
        ${positionClass}`}
    >
      {children}
    </div>
  );
};

const DropdownItem = ({ children, isSelected = false }) => (
  <div 
    className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer 
    flex justify-between items-center text-sm"
  >
    {children}
    {isSelected && <BiCheck className="w-4 h-4 text-blue-600" />}
  </div>
);


const HeaderSection = ({setIsModalOpen}) => {
  const [isPartiesOpen, setIsPartiesOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  
  const partiesRef = useRef(null);
  const moreOptionsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (partiesRef.current && !partiesRef.current.contains(event.target)) {
        setIsPartiesOpen(false);
      }
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
        setIsMoreOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleParties = () => {
    setIsPartiesOpen(!isPartiesOpen);
    setIsMoreOptionsOpen(false); // Close the other menu
  };

  const toggleMoreOptions = () => {
    setIsMoreOptionsOpen(!isMoreOptionsOpen);
    setIsPartiesOpen(false); // Close the other menu
  };

  return (
    <div className="flex flex-wrap justify-between items-center p-4 bg-white border-b border-gray-200">
      {/* 1. Parties Dropdown */}
      <div className="relative" ref={partiesRef}>
        <button
          onClick={toggleParties}
          className="flex items-center text-xl font-bold text-gray-800 focus:outline-none"
        >
          Parties
          <BiChevronDown
            className={`w-5 h-5 ml-1 transition-transform duration-200 text-blue-600 ${isPartiesOpen ? 'rotate-180' : 'rotate-0'}`} 
          />
        </button>

        <DropdownMenu isVisible={isPartiesOpen}>
          {/* Content from image_3fcbce.png */}
          <DropdownItem isSelected={true}>Parties</DropdownItem>
          {/* Example of more content, hidden in the image but typically present in a filter */}
          {/* <div className="px-4 py-2 text-gray-400 text-xs">Search Party Name</div> */}
        </DropdownMenu>
      </div>

      {/* 2. Actions (Add Party Button + Three Dots Menu) */}
      <div className="flex items-center space-x-2">
        {/* Add Party Button */}
        <button
        onClick={() => setIsModalOpen(true)}
          className="flex cursor-pointer items-center bg-red-600 hover:bg-red-700 text-white 
            font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm transition duration-150 shadow-md"
        >
          <BiPlus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add Party</span> {/* Fully visible on sm+ screens */}
          <span className="sm:hidden">Add</span> {/* Condensed text for mobile */}
        </button>
         <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none"
            aria-label="More options"
          >
            <IoSettingsOutline className="w-5 h-5" />
          </button>

        {/* Three-dot Menu Dropdown */}
        <div className="relative" ref={moreOptionsRef}>
          <button
            onClick={toggleMoreOptions}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none"
            aria-label="More options"
          >
            <LuEllipsisVertical className="w-5 h-5" />
          </button>

          <DropdownMenu isVisible={isMoreOptionsOpen} positionClass="right-0">
            {/* Content from image_3fcbe6.png */}
            <DropdownItem>Import from Excel</DropdownItem>
            <DropdownItem>Import from Phone</DropdownItem>
            <DropdownItem>Import Via Sync</DropdownItem>
            <hr className="my-2 border-gray-200" />
            <DropdownItem>Party Statement (Report)</DropdownItem>
            <DropdownItem>All Parties (Report)</DropdownItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;