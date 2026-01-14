"use client"

import { useState, useEffect } from "react"
import { BiMinus, BiPlus } from "react-icons/bi"

// Helper function to get the correct border class
const getBorderClass = (isError) =>
  isError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600"

export default function PricingTab({ formData, onChange, validationErrors }) {
    // Determine if wholesale section should be shown based on formData.wholesalePrice or formData.minimumWholesaleQty
    // This allows loading existing data to show the section
    const initialWholesale = !!(formData.wholesalePrice || formData.minimumWholesaleQty)
    const [wholesalePrices, setWholesalePrices] = useState(initialWholesale)

    // Sync wholesalePrices state when formData changes (e.g., when loading existing data)
    useEffect(() => {
        setWholesalePrices(!!(formData.wholesalePrice || formData.minimumWholesaleQty))
    }, [formData.wholesalePrice, formData.minimumWholesaleQty])

    const toggleWholesale = () => {
        const newState = !wholesalePrices
        setWholesalePrices(newState)
        if (!newState) {
            // Clear the wholesale fields in formData when removing the section
            onChange("wholesalePrice", "")
            onChange("minimumWholesaleQty", "")
        }
    }

    return (
        <div className="space-y-8">
            {/* Sale Price - Optional */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Sale Price</h3>
                <div className="relative">
                    <input
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => onChange("salePrice", e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        id="salePrice" // Matches Prisma field
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(validationErrors.salePrice)}`}
                    />
                    <label
                        htmlFor="salePrice"
                        className="absolute transition-all text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                        Amount
                    </label>
                </div>
            </div>

            {/* Purchase Price - Optional */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Purchase Price</h3>
                <div className="relative">
                    <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => onChange("purchasePrice", e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        id="purchasePrice" // Matches Prisma field
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(validationErrors.purchasePrice)}`}
                    />
                    <label
                        htmlFor="purchasePrice"
                        className="absolute transition-all text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                        Amount
                    </label>
                </div>
            </div>

            {/* Wholesale Prices */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    {wholesalePrices ? (
                        <button
                            onClick={toggleWholesale}
                            className="font-semibold text-foreground flex gap-1 items-center text-md cursor-pointer"
                        >
                            <BiMinus className="w-4 h-4" /> Remove Wholesale Price
                        </button>
                    ) : (
                        <button
                            onClick={toggleWholesale}
                            className="font-semibold text-foreground flex gap-1 items-center text-md cursor-pointer"
                        >
                            <BiPlus className="w-4 h-4" /> Add Wholesale Price
                        </button>
                    )}

                </div>

                <div className="space-y-3">
                    {wholesalePrices && (
                        <div className="flex gap-3 animate-in">
                            {/* Wholesale Price - Optional */}
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.wholesalePrice}
                                        onChange={(e) => onChange("wholesalePrice", e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        id="wholesalePrice" // Matches Prisma field
                                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(validationErrors.wholesalePrice)}`}
                                    />
                                    <label
                                        htmlFor="wholesalePrice"
                                        className="absolute transition-all text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                    >
                                        Price
                                    </label>
                                </div>

                            </div>
                            {/* Minimum Wholesale Qty - Optional */}
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.minimumWholesaleQty}
                                        onChange={(e) => onChange("minimumWholesaleQty", e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        id="minimumWholesaleQty" // Matches Prisma field
                                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(validationErrors.minimumWholesaleQty)}`}
                                    />
                                    <label
                                        htmlFor="minimumWholesaleQty"
                                        className="absolute transition-all text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                    >
                                        Min Qty
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}