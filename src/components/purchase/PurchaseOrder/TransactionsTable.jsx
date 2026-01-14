"use client"

import { useState } from "react"
import { FaSearch, FaPrint, FaDownload, FaFilter } from "react-icons/fa"
import TransactionRow from "./TransactionRow"
import MobileTransactionAccordion from "./MobileTransactionAccordion"
import { PiFileXlsBold } from "react-icons/pi"
import { IoClose } from "react-icons/io5"
import { BiPlus } from "react-icons/bi"

const TRANSACTIONS = [
    {
        id: 1,
        date: "09/11/2025",
        invoiceNo: "INV-001",
        partyName: "Supplier A",
        paymentType: "Cash",
        amount: 100.0,
        balanceDue: 0.0,
    },
    {
        id: 2,
        date: "10/11/2025",
        invoiceNo: "INV-002",
        partyName: "Supplier B",
        paymentType: "Bank Transfer",
        amount: 250.5,
        balanceDue: 50.0,
    },
    {
        id: 3,
        date: "10/11/2025",
        invoiceNo: "INV-003",
        partyName: "Customer X",
        paymentType: "Credit Card",
        amount: 400.0,
        balanceDue: 0.0,
    },
    {
        id: 4,
        date: "11/11/2025",
        invoiceNo: "INV-004",
        partyName: "Supplier C",
        paymentType: "UPI",
        amount: 320.75,
        balanceDue: 20.0,
    },
    {
        id: 5,
        date: "11/11/2025",
        invoiceNo: "INV-005",
        partyName: "Customer Y",
        paymentType: "Cash",
        amount: 150.0,
        balanceDue: 0.0,
    },
    {
        id: 6,
        date: "12/11/2025",
        invoiceNo: "INV-006",
        partyName: "Supplier D",
        paymentType: "Bank Transfer",
        amount: 600.0,
        balanceDue: 100.0,
    },
    {
        id: 7,
        date: "12/11/2025",
        invoiceNo: "INV-007",
        partyName: "Customer Z",
        paymentType: "Credit Card",
        amount: 450.0,
        balanceDue: 0.0,
    },
    {
        id: 8,
        date: "13/11/2025",
        invoiceNo: "INV-008",
        partyName: "Supplier E",
        paymentType: "Cheque",
        amount: 700.0,
        balanceDue: 50.0,
    },
    {
        id: 9,
        date: "13/11/2025",
        invoiceNo: "INV-009",
        partyName: "Customer M",
        paymentType: "UPI",
        amount: 200.0,
        balanceDue: 0.0,
    },
    {
        id: 10,
        date: "14/11/2025",
        invoiceNo: "INV-010",
        partyName: "Supplier F",
        paymentType: "Bank Transfer",
        amount: 950.25,
        balanceDue: 150.0,
    },
];


export default function TransactionsTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
    const [filteredTransactions, setFilteredTransactions] = useState(TRANSACTIONS)

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)

        const filtered = TRANSACTIONS.filter(
            (transaction) =>
                transaction.type.toLowerCase().includes(term) ||
                transaction.number.toLowerCase().includes(term) ||
                transaction.date.includes(term),
        )
        setFilteredTransactions(filtered)
    }

    const handleSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }

        const sorted = [...filteredTransactions].sort((a, b) => {
            if (key === "total" || key === "balance") {
                return direction === "asc" ? a[key] - b[key] : b[key] - a[key]
            }
            return direction === "asc"
                ? String(a[key]).localeCompare(String(b[key]))
                : String(b[key]).localeCompare(String(a[key]))
        })

        setSortConfig({ key, direction })
        setFilteredTransactions(sorted)
    }

    return (
        <div className="w-full p-4">
            {/* Header with title and actions */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900">TRANSACTIONS</h1>
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
                                setFilteredTransactions(TRANSACTIONS)
                                searchTerm && setSearchTerm("")
                            }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" size={18} />}
                        </div>
                    </div>
                </div>
                <div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out">
                        <BiPlus className="w-4 h-4 mr-2" />
                        Add Purchase Order
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
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
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Invoice NO.</span>
                                    <button onClick={() => handleSort("invoiceNo")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Party Name</span>
                                    <button onClick={() => handleSort("partyName")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Type</span>
                                    <button onClick={() => handleSort("paymentType")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</span>
                                    <button onClick={() => handleSort("amount")} className="text-gray-400 hover:text-gray-600">
                                        <FaFilter size={16} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance Due</span>
                                    <button onClick={() => handleSort("balanceDue")} className="text-gray-400 hover:text-gray-600">
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
