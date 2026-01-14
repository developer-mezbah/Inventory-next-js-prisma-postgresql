"use client"

import CompanyCard from "@/components/ChangeCompany/CompanyCard"
import CompanyListHeader from "@/components/ChangeCompany/CompanyListHeader"
import Footer from "@/components/ChangeCompany/Footer"
import useOutsideClick from "@/hook/useOutsideClick"
import { useState, useMemo, useEffect } from "react"
import { FiRefreshCw, FiDownload } from "react-icons/fi"

const mockCompanies = [
    {
        id: 1,
        name: "Mezbah Uddin",
        badge: "Current Company",
        badgeColor: "orange",
        lastSaleCreated: "09/11/2025 at 09:50 pm",
        syncStatus: "SYNC ON",
        isSyncOn: true,
    },
    {
        id: 2,
        name: "My Company",
        badge: null,
        lastSaleCreated: null,
        syncStatus: "SYNC OFF",
        isSyncOn: false,
    },
]

// Components for tab content (simulated)
const MyCompaniesContent = ({ filteredCompanies }) => (
    <div className="space-y-4">
        {/* Info and Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <p className="text-gray-600">Below are the company that are created by you</p>
            <div className="flex items-center gap-3">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition">
                    <FiDownload className="w-4 h-4" />
                    <span className="hidden sm:inline">Browse Files (.yjp)</span>
                    <span className="sm:hidden">.yjp</span>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                    <FiRefreshCw className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>

        {/* Company Cards */}
        {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => <CompanyCard key={company.id} company={company} />)
        ) : (
            <div className="text-center py-12">
                <p className="text-gray-500">No companies found</p>
            </div>
        )}
    </div>
)

const SharedCompaniesContent = () => {
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Function to toggle the dropdown state
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const dropdownRef = useOutsideClick(() => setIsDropdownOpen(false));

    return     (
    <div>
        <div className="p-4 sm:p-6 border rounded-lg shadow-xl bg-white space-y-4 mx-auto">
            {/* User Info Section (Email & Logout) */}
            <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center space-x-4">
                    {/* Email Display */}
                    <div>
                        <p className="text-sm text-gray-500">Currently Logged in with:</p>
                        <p className="font-semibold text-gray-800 truncate" title="email@gmail.com">email@gmail.com</p>
                    </div>
                </div>
                {/* Logout Button */}
                <button
                    className="px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition duration-150 ease-in-out"
                    onClick={() => console.log('Logging out...')} // Add your actual logout logic here
                >
                    Logout
                </button>
            </div>

            {/* Company Info Section with Dropdown */}
            <div className="relative flex justify-between items-center pt-2">
                {/* Company Name Display */}
                <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Current Company</span>
                    <span className="font-bold text-lg text-indigo-600">Company Name</span>
                </div>
                
                {/* Company Action Button (Three Dots) */}
                <button
                    className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out focus:outline-none"
                    onClick={toggleDropdown}
                >
                    {/* Heroicons "Dots Vertical" icon for better styling */}
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                </button>

                {/* Dropdown Menu (Conditional Rendering) */}
                {isDropdownOpen && (
                    <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 origin-top-right">
                        <div className="py-1">
                            <a 
                                href="#" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => { console.log('Switch Company'); setIsDropdownOpen(false); }}
                            >
                                Switch Company
                            </a>
                            <a 
                                href="#" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => { console.log('Company Settings'); setIsDropdownOpen(false); }}
                            >
                                Company Settings
                            </a>
                            <a 
                                href="#" 
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => { console.log('Leave Company'); setIsDropdownOpen(false); }}
                            >
                                Leave Company
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <div className="py-12 text-center text-gray-500">
            <p>Companies shared with you will appear here.</p>
            <p className="text-sm mt-2 text-gray-400">(Content for shared companies tab)</p>
        </div>
    </div>
)
}


export default function CompanyListPage() {
    const defaultTabId = "my-companies"
    const [activeTabUrlSegment, setActiveTabUrlSegment] = useState(defaultTabId)
    const [searchQuery, setSearchQuery] = useState("")
    const [companies] = useState(mockCompanies)

    // Use the URL hash to set the active tab on mount and hash change
    useEffect(() => {
        const handleHashChange = () => {
            // Remove the '#' from the hash, or use default if empty
            const hash = window.location.hash.substring(1) || defaultTabId
            setActiveTabUrlSegment(hash)
        }

        // Set initial active tab
        handleHashChange()

        // Listen for hash changes (e.g., back/forward buttons)
        window.addEventListener("hashchange", handleHashChange)

        return () => {
            window.removeEventListener("hashchange", handleHashChange)
        }
    }, [defaultTabId])

    const filteredCompanies = useMemo(() => {
        // Note: Only 'my-companies' currently uses the mock data and filter
        return companies.filter((company) =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [companies, searchQuery])

    // Define tabs with their URL segment and content component
    const tabsData = [
        {
            id: "shared", // URL segment: #shared
            label: "Companies Shared with Me",
            url: "#shared",
            tabcontent: <SharedCompaniesContent />,
        },
        {
            id: "my-companies", // URL segment: #my-companies (or default)
            label: "My Companies",
            url: "#my-companies",
            tabcontent: <MyCompaniesContent filteredCompanies={filteredCompanies} />,
        },
    ]

    // Function to change the tab (updates the URL hash)
    const handleTabChange = (tabId) => {
        if (activeTabUrlSegment !== tabId) {
            window.location.hash = tabId // This also triggers the useEffect 'hashchange' listener
        }
    }

    // Get the content for the currently active tab
    const activeTab = tabsData.find((tab) => tab.id === activeTabUrlSegment) || tabsData[1] // Default to 'My Companies'

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <CompanyListHeader
                activeTab={activeTab.id} // Pass the ID from the URL state
                setActiveTab={handleTabChange} // Pass the function to change the URL
                tabs={tabsData}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {/* Main Content */}
            <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
                {/* Render the content based on the active tab from the URL */}
                {activeTab.tabcontent}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}