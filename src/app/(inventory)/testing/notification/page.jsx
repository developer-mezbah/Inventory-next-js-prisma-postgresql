"use client";
import React, { useState } from 'react';
import { BiBell, BiPackage, BiUser } from 'react-icons/bi';
import { CiShoppingCart } from 'react-icons/ci';
import { FaShoppingCart } from 'react-icons/fa';

// --- Mock Data ---
const mockNotifications = [
  {
    id: 1,
    icon: CiShoppingCart,
    title: 'New Sale Order Placed',
    message: 'Sale Invoice #INV-2023-001 has been generated for $1,250.',
    time: '2 minutes ago',
    read: false,
    type: 'success',
  },
  {
    id: 2,
    icon: BiUser,
    title: 'Profile Updated',
    message: 'Your Business Details were successfully saved by Admin.',
    time: '1 hour ago',
    read: true,
    type: 'info',
  },
  {
    id: 3,
    icon: BiPackage,
    title: 'Low Stock Alert',
    message: 'Product "Premium Widget" is critically low (only 5 units remaining).',
    time: 'Yesterday',
    read: false,
    type: 'warning',
  },
  {
    id: 4,
    icon: FaShoppingCart,
    title: 'Purchase Bill Received',
    message: 'A new Purchase Bill from Supplier ABC has been added.',
    time: '3 days ago',
    read: true,
    type: 'default',
  },
];

// --- Helper Components ---

const NotificationItem = ({ notification }) => {
  const IconComponent = notification.icon;

  const colorClasses = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <div
      className={`
        flex items-start p-4 border-b last:border-b-0 cursor-pointer
        ${!notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'}
        transition-colors duration-150
      `}
    >
      <div
        className={`
          flex-shrink-0 p-3 rounded-full mr-3
          ${colorClasses[notification.type] || colorClasses.default}
        `}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className={`text-sm font-semibold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </h3>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{notification.time}</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 break-words">
          {notification.message}
        </p>
      </div>
    </div>
  );
};

// Component for the original "No Notifications yet" state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
    <div className="p-4 mb-4 rounded-full bg-gray-100 text-gray-500">
      <BiBell className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      No Notifications yet!
    </h3>
    <p className="text-sm text-gray-500">
      Stay tuned! Notifications about your activity will show up here.
    </p>
  </div>
);

// --- Main Component ---
const App = () => {
  // Toggle between mock data and empty state for demonstration
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-end p-4 sm:p-6 font-inter">
      {/*
        Notification Drawer Container (Simulates a fixed/absolute drawer on the right)
        Note: Fixed width on larger screens, full width on mobile
      */}
      <div className="w-full max-w-sm sm:max-w-md lg:w-96 bg-white shadow-2xl rounded-xl overflow-hidden mt-0 sm:mt-4 border border-gray-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          <button 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
            onClick={() => setNotifications(hasNotifications ? [] : mockNotifications)}
          >
            {hasNotifications ? 'Clear All (Toggle Demo)' : 'Load Mock Data'}
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[80vh] overflow-y-auto">
          {hasNotifications ? (
            <div>
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
              <div className="p-4 border-t text-center">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View All Notifications
                  </button>
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;