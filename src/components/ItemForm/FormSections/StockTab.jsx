"use client"


// Common Tailwind classes for the floating label input style
const inputClass = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
const labelClass = "absolute transition-all text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";

// Helper function to get the correct border class
const getBorderClass = (isError) =>
  isError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600"

// Helper component for a single Floating Input Field
const FloatingInput = ({ id, type = "text", label, value, onChange, placeholder = "", min, step, isRequired, isError }) => (
    <div className="relative">
        <input
            type={type}
            id={id}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} ${getBorderClass(isError)}`}
            min={min}
            step={step}
        />
        <label
            htmlFor={id}
            className={labelClass}
        >
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
    </div>
);


export default function StockTab({ formData, onChange, validationErrors }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening Quantity Field - Required */}
                <FloatingInput
                    id="openingQuantity"
                    type="number"
                    label="Opening Quantity"
                    value={formData.openingQuantity}
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                    isError={validationErrors.openingQuantity} // Error logic
                />

                {/* At Price Field - Required */}
                <FloatingInput
                    id="atPrice"
                    type="number"
                    label="At Price (Cost)"
                    value={formData.atPrice}
                    onChange={onChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    isError={validationErrors.atPrice} // Error logic
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* As Of Date Field - Required */}
                <FloatingInput
                    id="asOfDate"
                    type="date"
                    label="As Of Date"
                    value={formData.asOfDate}
                    onChange={onChange}
                    isError={validationErrors.asOfDate} // Error logic
                />

                {/* Min Stock To Maintain Field - Required */}
                <FloatingInput
                    id="minStockToMaintain" // Matches Prisma field
                    type="number"
                    label="Min Stock To Maintain"
                    value={formData.minStockToMaintain}
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                    isError={validationErrors.minStockToMaintain} // Error logic
                />
            </div>

            {/* Location Field - Optional */}
            <div>
                <FloatingInput
                    id="location"
                    type="text"
                    label="Location"
                    value={formData.location}
                    onChange={onChange}
                    placeholder="e.g., Warehouse A, Shelf 3"
                    isError={validationErrors.location} // Error logic
                />
            </div>
        </div>
    )
}