'use client';
import React from 'react';
import { BiChevronRight } from 'react-icons/bi';

// Data structure representing the menu items
const menuData = [
  {
    title: 'SALE',
    items: [
      { name: 'Sale Invoice', subText: null, isActive: true },
      { name: 'Payment-In', subText: null },
      { name: 'Sale Return', subText: 'Cr Note' },
      { name: 'Sale Order', subText: null },
      { name: 'Estimate/Quotation', subText: null },
      { name: 'Proforma Invoice', subText: null },
      { name: 'Delivery Challan', subText: null },
    ],
  },
  {
    title: 'PURCHASE',
    items: [
      { name: 'Purchase Bill', subText: null },
      { name: 'Payment-Out', subText: null },
      { name: 'Purchase Return', subText: 'Dr Note' },
      { name: 'Purchase Order', subText: null },
    ],
  },
  {
    title: 'OTHERS',
    items: [
      { name: 'Expenses', subText: null },
      { name: 'Party To Party Transfer', subText: null },
    ],
  },
];

// Helper component for a single menu item
const MenuItem = ({ name, subText, isActive }) => (
  <button
    // Use flex for alignment, and w-full to ensure the button takes full width
    className={`
      flex items-center justify-between w-full p-2 rounded-lg text-left
      ${isActive
        ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-500 transition-colors duration-200'
        : 'text-gray-700 hover:bg-gray-100 transition-colors duration-150'
      }
    `}
    onClick={() => console.log(`Navigating to: ${name}`)}
  >
    <div className="flex items-center">
      {/* Icon */}
      <BiChevronRight
        className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
      />
      
      {/* Name and SubText */}
      <div>
        <span className="text-sm sm:text-base">{name}</span>
        {subText && (
          <span className="block text-xs text-gray-400 font-normal ml-6 -mt-0.5">
            {subText}
          </span>
        )}
      </div>
    </div>
  </button>
);

// Helper component for a menu column
const MenuColumn = ({ title, items }) => (
  <div className="p-4 border-b md:border-b-0 md:border-r last:border-r-0 border-gray-200 min-w-0">
    {/* Column Title */}
    <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">
      {title}
    </h2>
    
    {/* List of Menu Items */}
    <div className="space-y-1">
      {items.map((item) => (
        <MenuItem
          key={item.name}
          name={item.name}
          subText={item.subText}
          isActive={item.isActive}
        />
      ))}
    </div>
  </div>
);

// Main Application Component (The Modal)
const App = () => {
  return (
    <div className="bg-gray-100 flex items-start justify-center p-4 sm:p-6 font-inter">
      {/* Main Container / Modal simulation */}
      <div className=" bg-white shadow-2xl rounded-xl overflow-hidden mt-10">
        
        {/*
          Responsive Grid for the three columns
          lg:grid-cols-3 -> 3 columns on large screens
          md:grid-cols-2 -> 2 columns on medium screens
          sm:grid-cols-1 -> 1 column on small screens (stacked)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y divide-gray-200 lg:divide-y-0 lg:divide-x">
          {menuData.map((column) => (
            <MenuColumn
              key={column.title}
              title={column.title}
              items={column.items}
            />
          ))}
        </div>
        
        {/* NOTE: The shortcut bar has been omitted as per the user's request: "i don't need shortkey value" */}
        
      </div>
    </div>
  );
};

export default App;