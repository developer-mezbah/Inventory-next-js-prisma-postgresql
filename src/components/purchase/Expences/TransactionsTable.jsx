"use client"

import { useState } from "react"
import { FaSearch } from "react-icons/fa"
import { IoClose } from "react-icons/io5"

// --- NEW DATA STRUCTURE ---
const STOCK_DATA = [
    {
        id: 1,
        name: "Widget A",
        quantity: 150,
        stockValue: 1500.75, // Assuming this is a monetary value
    },
    {
        id: 2,
        name: "Gadget Pro",
        quantity: 75,
        stockValue: 4500.00,
    },
    {
        id: 3,
        name: "Gizmo Mini",
        quantity: 320,
        stockValue: 640.00,
    },
    {
        id: 4,
        name: "Super Tool X",
        quantity: 20,
        stockValue: 2000.50,
    },
]

// --- Simplified Row Component (for desktop table) ---
const StockRow = ({ item, isAlternate }) => (
    <tr className={`${isAlternate ? "bg-white" : "bg-gray-50"} border-b border-gray-200 hover:bg-gray-100 transition-colors`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {item.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item.quantity}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${item.stockValue.toFixed(2)}
        </td>
        {/* ACTION COLUMN REMOVED */}
    </tr>
)

// --- Simplified Mobile Accordion Component ---
const MobileStockAccordion = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm">
            <button
                className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{item.name}</span>
                <span className="text-sm text-gray-500">${item.stockValue.toFixed(2)}</span>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-1">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Quantity:</span> {item.quantity}
                    </p>
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Stock Value:</span> ${item.stockValue.toFixed(2)}
                    </p>
                    {/* ACTIONS BUTTON REMOVED */}
                </div>
            )}
        </div>
    );
}

export default function StockTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
    const [filteredStock, setFilteredStock] = useState(STOCK_DATA)

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)

        const filtered = STOCK_DATA.filter(
            (item) =>
                item.name.toLowerCase().includes(term) ||
                String(item.quantity).includes(term) ||
                String(item.stockValue).includes(term),
        )
        setFilteredStock(filtered)
    }

    const handleSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }

        const sorted = [...filteredStock].sort((a, b) => {
            if (key === "quantity" || key === "stockValue") {
                return direction === "asc" ? a[key] - b[key] : b[key] - a[key]
            }
            // Sort for 'name' (string)
            return direction === "asc"
                ? String(a[key]).localeCompare(String(b[key]))
                : String(b[key]).localeCompare(String(a[key]))
        })

        setSortConfig({ key, direction })
        setFilteredStock(sorted)
    }

    // Function to render sort arrow
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    return (
        <div className="w-full p-4">
            {/* Header with title and actions */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Stock</h1>
                <div className="md:w-1/3 items-center gap-2">
                    {/* Search bar */}
                    <div className="">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search stock by name, quantity, or value..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            { searchTerm &&<IoClose onClick={() => {
                                setFilteredStock(STOCK_DATA)
                                searchTerm && setSearchTerm("")
                            }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" size={18} />}
                        </div>
                    </div>
                </div>
            </div>



            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-3 text-left">
                                <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer">
                                    Name {getSortIndicator("name")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button onClick={() => handleSort("quantity")} className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors">
                                    Quantity {getSortIndicator("quantity")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                {/* No sort/filter button as requested */}
                                <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Stock Value
                                </span>
                            </th>
                            {/* ACTION COLUMN HEADER REMOVED */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map((item, index) => (
                            <StockRow key={item.id} item={item} isAlternate={index % 2 === 0} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden space-y-3">
                {filteredStock.map((item) => (
                    <MobileStockAccordion key={item.id} item={item} />
                ))}
            </div>

            {/* Empty state */}
            {filteredStock.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                    <p className="text-gray-500">No stock items found</p>
                </div>
            )}
        </div>
    )
}