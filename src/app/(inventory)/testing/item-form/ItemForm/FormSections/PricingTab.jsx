"use client"

import { useState } from "react"
import { BiMinus, BiPlus } from "react-icons/bi"

export default function PricingTab({ formData, onChange }) {
    const [wholesalePrices, setWholesalePrices] = useState(false)
    return (
        <div className="space-y-8">
            {/* Sale Price */}
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
                        id="saleprice"
                        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />
                    <label
                        htmlFor="saleprice"
                        className="absolute text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                        Amount
                    </label>
                </div>
            </div>

            {/* Purchase Price */}
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
                        id="purprice"
                        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />
                    <label
                        htmlFor="purprice"
                        className="absolute text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                        Amount
                    </label>
                </div>
            </div>

            {/* Wholesale Prices */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    {wholesalePrices ? <button
                        onClick={() => setWholesalePrices(!wholesalePrices)} className="font-semibold text-foreground flex gap-1 items-center text-md cursor-pointer"><BiMinus className="w-4 h-4" /> Remove Wholesale Price</button> : <button
                        onClick={() => setWholesalePrices(!wholesalePrices)} className="font-semibold text-foreground flex gap-1 items-center text-md cursor-pointer"><BiPlus className="w-4 h-4" /> Add Wholesale Price</button>}

                </div>

                <div className="space-y-3">
                    {wholesalePrices && (
                        <div className="flex gap-3 animate-in">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        id="price2"
                                        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    />
                                    <label
                                        htmlFor="price2"
                                        className="absolute text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                    >
                                        Price
                                    </label>
                                </div>

                            </div>
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        id="minqty"
                                        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    />
                                    <label
                                        htmlFor="minqty"
                                        className="absolute text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
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
