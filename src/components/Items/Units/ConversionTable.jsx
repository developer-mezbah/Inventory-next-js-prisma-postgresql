"use client"

import { useState } from "react"
import { FaSearch } from "react-icons/fa"
import { IoClose } from "react-icons/io5"

// --- NEW DATA STRUCTURE ---
const STOCK_DATA = [
    {
        id: 1,
        conversion: "1 KILOGRAMS = 1000 GRAMMES",
    },
    {
        id: 2,
        conversion: "1 LITRE = 1000 MILLILITRE",
    },
    {
        id: 3,
        conversion: "1 DOZEN = 12 UNITS",
    },
    {
        id: 4,
        conversion: "1 GALLON = 4 QUARTS",
    },
]

// --- Simplified Row Component (for desktop table) ---
const StockRow = ({ item, isAlternate, index }) => (
    <tr className={`${isAlternate ? "bg-white" : "bg-gray-50"} border-b border-gray-200 hover:bg-gray-100 transition-colors`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {index}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item?.conversion}
        </td>
        {/* ACTION COLUMN REMOVED */}
    </tr>
)



export default function ConversionTable({ content, title }) {
    const [searchTerm, setSearchTerm] = useState("")
    
    const [filteredStock, setFilteredStock] = useState(content.map((item, index) => ({ conversion: item, id: index + 1 })))

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


    return (
        <div className="w-full p-4">
            {/* Header with title and actions */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900">{title || ""}</h1>
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
                            {searchTerm && <IoClose onClick={() => {
                                setFilteredStock(STOCK_DATA)
                                searchTerm && setSearchTerm("")
                            }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" size={18} />}
                        </div>
                    </div>
                </div>
            </div>



            {/* Desktop Table */}
            <div className="block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-3 text-left">
                                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer">
                                    SL NO:-
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors">
                                    Conversion
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map((item, index) => (
                            <StockRow key={item.id} item={item} isAlternate={index % 2 === 0} index={index + 1} />
                        ))}
                    </tbody>
                </table>
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