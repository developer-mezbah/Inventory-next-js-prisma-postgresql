"use client";
import React, { useState } from 'react';
import { BiEdit, BiGlobe, BiHelpCircle, BiLogOut, BiSun } from 'react-icons/bi';
import { CiClock1, CiShare2 } from 'react-icons/ci';
import { FaArrowRight, FaDollarSign, FaUserSecret } from 'react-icons/fa';
import { FiRefreshCw, FiSmartphone } from 'react-icons/fi';
import { GrClose } from 'react-icons/gr';
import { LuMonitorPlay } from 'react-icons/lu';

// --- Mock Data ---

const settingItems = [
  {
    category: 'App Settings',
    items: [
      { icon: FaDollarSign, name: 'Subscription', value: null, action: 'arrow' },
      { icon: BiGlobe, name: 'Language', value: 'English', action: 'dropdown' },
      { icon: BiSun, name: 'Theme', value: 'Light', action: 'dropdown' },
      { icon: CiClock1, name: 'Limit Chart & Usage', value: null, action: 'arrow' },
      { icon: FiSmartphone, name: 'Hishabee Android App', value: null, action: 'arrow' },
      { icon: LuMonitorPlay, name: 'App Training', value: null, action: 'arrow' },
    ],
  },
  {
    category: 'Others',
    items: [
      { icon: CiShare2, name: 'Refer/Invite', value: null, action: 'arrow' },
      { icon: FaUserSecret, name: 'Facebook Community', value: null, action: 'arrow' },
      { icon: BiHelpCircle, name: 'Help & Support Center', value: null, action: 'arrow' },
    ],
  },
];

// --- Helper Components ---

const SettingsItem = ({ item }) => {
  const IconComponent = item.icon;

  const content = (
    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition duration-150 rounded-lg">
      <div className="flex items-center">
        <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
        <span className="text-base text-gray-800">{item.name}</span>
      </div>

      <div className="flex items-center space-x-2 text-gray-500">
        {item.value && (
          <span className="text-sm font-medium">
            {item.value}
          </span>
        )}

        {item.action === 'dropdown' && (
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        )}
        
        {item.action === 'arrow' && (
          <FaArrowRight className="w-4 h-4" />
        )}
      </div>
    </div>
  );

  return (
    <div onClick={() => console.log(`Action for: ${item.name}`)}>
      {content}
    </div>
  );
};

// --- Main Component ---

const SettingsModal = ({ isVisible, onClose }) => {
  // We'll use a local state to manage the animation classes
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  // Effect to handle showing/hiding with animation
  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Give a small delay to ensure the component is mounted before applying the "show" class
      const timer = setTimeout(() => {
        setAnimationClass('translate-x-0 opacity-100');
      }, 50); // Small delay to allow initial render outside viewport
      return () => clearTimeout(timer);
    } else {
      setAnimationClass('translate-x-full opacity-0');
      // After animation, unmount the component
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Duration of the transition
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // If we shouldn't render, return null immediately
  if (!shouldRender) return null;

  return (
    // Backdrop with transition
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end items-start transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Modal Content - uses transform and opacity for smooth animation */}
      <div
        className={`w-full max-w-sm sm:max-w-md bg-white h-screen overflow-y-auto shadow-2xl 
                    transition-all duration-300 ease-in-out 
                    ${animationClass}
                    ${!isVisible ? 'pointer-events-none' : ''} // Prevent interaction when hiding
                   `}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition"
            aria-label="Close settings"
          >
            <GrClose className="w-6 h-6" />
          </button>
        </div>

        {/* Profile/Shop Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Initials Circle */}
              <div className="w-12 h-12 flex items-center justify-center bg-blue-500 rounded-full text-white font-bold text-lg mr-4">
                MU
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Mezbah Uddin</p>
                <p className="text-sm text-gray-500">01320392401</p>
              </div>
            </div>
            <button className="flex items-center px-3 py-1 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <BiEdit className="w-4 h-4 mr-1" />
              Edit Shop
            </button>
          </div>

          <button className="flex items-center justify-center w-full mt-4 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Switch your Shop
          </button>
        </div>

        {/* Settings List */}
        <div className="p-4 space-y-6">
          {settingItems.map((group) => (
            <div key={group.category}>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                {group.category}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SettingsItem key={item.name} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 mt-6">
            <p className="text-center text-xs text-gray-400 mb-4">Version : 2.0.4</p>
            <button
                className="flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                onClick={() => console.log('Logging out...')}
            >
                <BiLogOut className="w-5 h-5 mr-2" />
                Logout
            </button>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to manage modal state for demonstration
const App = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Start closed

    return (
        <div className="min-h-screen bg-gray-200 p-8 font-inter">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Application Dashboard</h1>
            <p className="mb-4">
                This area simulates the main application view. 
                The Settings Modal slides in from the right when toggled.
            </p>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
            >
                Open Settings
            </button>

            {/* The actual Settings Modal component */}
            <SettingsModal 
                isVisible={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
}

export default App;