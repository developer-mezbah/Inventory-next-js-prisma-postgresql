"use client"

import { FiSearch } from "react-icons/fi"

export default function CompanyListHeader({ activeTab, setActiveTab, tabs, searchQuery, setSearchQuery }) {
  return (
    <header className="bg-gray-900 text-white">
      <div className="px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Company List</h1>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mt-6 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm sm:text-base font-medium transition ${
                activeTab === tab.id ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
