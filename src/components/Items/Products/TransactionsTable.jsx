"use client"

import { useState, useMemo, useEffect } from "react"
import { FaSearch, FaPrint, FaFilter } from "react-icons/fa"
import TransactionRow from "./TransactionRow"
import MobileTransactionAccordion from "./MobileTransactionAccordion"
import { PiFileXlsBold } from "react-icons/pi"

// Define the shape of the incoming prop data for clarity
// The incoming data is an array of objects structured like the example you provided.
// We'll map it to the structure used by the rest of the component (type, number, date, total, balance).

/**
 * @typedef {Object} RawTransaction
 * @property {string} id - The unique ID.
 * @property {string} createdAt - Creation date/time string.
 * @property {string} updatedAt - Update date/time string.
 * @property {string} date - The transaction date/time string.
 * @property {string} invoiceNo - The invoice number.
 * @property {string | null} name - The name (unused, but in raw data).
 * @property {string} paymentType - The type of payment.
 * @property {number} amount - The amount.
 * @property {number} balanceDue - The balance due.
 * @property {string} type - The transaction type (e.g., "Purchase").
 * @property {string | null} status - The status (unused, but in raw data).
 * @property {string | null} description - The description (unused, but in raw data).
 * @property {string} transactionId - The transaction reference ID.
 * @property {number | null} totalAmount - The total amount (can be null in raw data).
 * @property {number} taxRate - The tax rate.
 * @property {number} taxAmount - The tax amount.
 * @property {string | null} paymentDate - The payment date (can be null).
 * @property {string | null} paymentRef - The payment reference (can be null).
 * @property {string | null} cashAndBankId - Cash/Bank ID (can be null).
 * @property {string | null} cashAdjustmentId - Cash Adjustment ID (can be null).
 * @property {string} itemId - Item ID.
 * @property {string} partyId - Party ID.
 * @property {string} purchaseId - Purchase ID.
 * @property {string} companyId - Company ID.
 */

/**
 * @typedef {Object} DisplayTransaction
 * @property {string} id - The unique ID.
 * @property {string} type - The transaction type.
 * @property {string} number - The invoice number (mapped from invoiceNo).
 * @property {string} date - The formatted date.
 * @property {number} total - The total amount (mapped from amount).
 * @property {number} balance - The balance due (mapped from balanceDue).
 * @property {RawTransaction} rawData - The original raw data object.
 */


// Helper function to format the date from ISO string to 'MM/DD/YYYY'
const formatDate = (isoString) => {
    if (!isoString) return ""
    try {
        // We only care about the date part (e.g., YYYY-MM-DD)
        // If you need MM/DD/YYYY, this assumes the date string is parsable.
        // For a simple extraction:
        const datePart = isoString.split('T')[0] // '2025-11-26'
        const [year, month, day] = datePart.split('-')
        return `${month}/${day}/${year}` // '11/26/2025'
    } catch (error) {
        return "N/A"
    }
}

/**
 * Maps the incoming raw data structure to the expected display structure.
 * @param {RawTransaction[]} rawData - The data from props.
 * @returns {DisplayTransaction[]} The mapped array of transactions.
 */
const mapTransactions = (rawData) => {
    if (!Array.isArray(rawData)) return []

    return rawData.map((tx) => ({
        id: tx.id,
        type: tx.type || "N/A", // Use the 'type' field from your data
        number: tx.invoiceNo || "", // Use 'invoiceNo' for the display 'Number'
        date: formatDate(tx.date), // Format 'date' from the ISO string
        total: tx.amount || 0, // Use 'amount' for the display 'Total'
        balance: tx.balanceDue || 0, // Use 'balanceDue' for the display 'Balance'
        rawData: tx, // Keep the raw data if needed for details/actions
    }))
}

// Hardcoded TRANSACTIONS is removed as per request to use props
// const TRANSACTIONS = [...]

export default function TransactionsTable({ data }) {
    // Memoize the mapped transactions to avoid recalculation on every render
    const initialTransactions = useMemo(() => mapTransactions(data), [data])

    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
    const [filteredTransactions, setFilteredTransactions] = useState(initialTransactions)

    // Update filteredTransactions when initialTransactions changes (i.e., when 'data' prop changes)
    // This is crucial for redynamicizing the component.
    useEffect(() => {
        // Reset state or apply filtering/sorting on the new data set
        // For simplicity and preserving the current search/sort state, we re-apply them.
        let updatedList = initialTransactions

        // Re-apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            updatedList = updatedList.filter(
                (transaction) =>
                    transaction.type.toLowerCase().includes(term) ||
                    transaction.number.toLowerCase().includes(term) ||
                    transaction.date.includes(term),
            )
        }

        // Re-apply sort if a key is active
        if (sortConfig.key) {
            updatedList = sortData(updatedList, sortConfig.key, sortConfig.direction)
        }

        setFilteredTransactions(updatedList)
    }, [initialTransactions, searchTerm, sortConfig.key, sortConfig.direction])
    
    // Function to handle the actual sorting logic
    const sortData = (list, key, direction) => {
        return [...list].sort((a, b) => {
            if (key === "total" || key === "balance") {
                return direction === "asc" ? a[key] - b[key] : b[key] - a[key]
            }
            return direction === "asc"
                ? String(a[key]).localeCompare(String(b[key]))
                : String(b[key]).localeCompare(String(a[key]))
        })
    }


    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)

        const filtered = initialTransactions.filter(
            (transaction) =>
                transaction.type.toLowerCase().includes(term) ||
                transaction.number.toLowerCase().includes(term) ||
                transaction.date.includes(term),
        )

        // Apply current sort config to the newly filtered list
        const sorted = sortConfig.key ? sortData(filtered, sortConfig.key, sortConfig.direction) : filtered
        setFilteredTransactions(sorted)
    }

    const handleSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }

        const sorted = sortData(filteredTransactions, key, direction)

        setSortConfig({ key, direction })
        setFilteredTransactions(sorted)
    }

    return (
        <div className="w-full p-4">
            {/* Header with title and actions */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-gray-100 p-2.5 text-gray-700 hover:bg-gray-200 transition-colors">
                        <FaPrint size={18} />
                    </button>
                    <button>
                        <PiFileXlsBold className=" text-green-500 text-2xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2" />
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</span>
                                    <button onClick={() => handleSort("type")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Type</span>
                                    <button onClick={() => handleSort("number")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</span>
                                    <button onClick={() => handleSort("date")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</span>
                                    <button onClick={() => handleSort("total")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance</span>
                                    <button onClick={() => handleSort("balance")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((transaction, index) => (
                            <TransactionRow key={transaction.id} transaction={transaction} isAlternate={index % 2 === 0} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden space-y-3">
                {filteredTransactions.map((transaction) => (
                    <MobileTransactionAccordion key={transaction.id} transaction={transaction} />
                ))}
            </div>

            {/* Empty state */}
            {filteredTransactions.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                    <p className="text-gray-500">No transactions found</p>
                </div>
            )}
        </div>
    )
}