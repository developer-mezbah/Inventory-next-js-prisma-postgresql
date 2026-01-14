"use client"


// Common Tailwind classes for the floating label input style
const inputClass = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
const labelClass = "absolute text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";

// Helper component for a single Floating Input Field
const FloatingInput = ({ id, type = "text", label, value, onChange, placeholder = "", min, step }) => (
    <div className="relative">
        <input
            type={type}
            id={id}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
            min={min}
            step={step}
        />
        <label
            htmlFor={id}
            className={labelClass}
        >
            {label}
        </label>
    </div>
);


export default function StockTab({ formData, onChange }) {


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening Quantity Field */}
                <FloatingInput
                    id="openingQuantity"
                    type="number"
                    label="Opening Quantity"
                    value={formData.openingQuantity}
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                />

                {/* At Price Field */}
                <FloatingInput
                    id="atPrice"
                    type="number"
                    label="At Price"
                    value={formData.atPrice}
                    onChange={onChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* As Of Date Field (Note: date inputs can be tricky with floating labels, but this is the attempt) */}
                <FloatingInput
                    id="asOfDate"
                    type="date"
                    label="As Of Date"
                    value={formData.asOfDate}
                    onChange={onChange}
                // Date inputs should not have a placeholder for the floating effect to work best
                />

                {/* Min Stock To Maintain Field */}
                <FloatingInput
                    id="minStock"
                    type="number"
                    label="Min Stock To Maintain"
                    value={formData.minStock}
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Location Field */}
            <div>
                <FloatingInput
                    id="location"
                    type="text"
                    label="Location"
                    value={formData.location}
                    onChange={onChange}
                    placeholder="e.g., Warehouse A, Shelf 3"
                />
            </div>
        </div>
    )
}