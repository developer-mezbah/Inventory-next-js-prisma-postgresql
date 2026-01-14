import React, { useState, useRef, useEffect } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';

// Simple Calendar Component (mimicking the provided image)
const CalendarPopover = ({ selectedDate, onSelectDate, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || Date.now()));
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 for Sunday, 1 for Monday

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const renderDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const startDay = firstDayOfMonth(currentMonth); // Adjust for desired start of week (Sunday=0 in JS)

        // Fill leading empty days
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="text-gray-400 p-2 text-center"></div>);
        }

        // Fill days of the month
        for (let i = 1; i <= totalDays; i++) {
            const day = i;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => { onSelectDate(date); onClose(); }}
                    className={`p-2 rounded-md transition-colors duration-150
            ${isSelected ? 'bg-yellow-400 text-gray-900 font-semibold' : ''}
            ${!isSelected && isToday ? 'bg-blue-100 text-blue-800' : ''}
            ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
            ${!isSelected && !isToday && !isToday && 'border border-gray-200'}
            text-sm text-center
          `}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div ref={calendarRef} className="absolute z-10 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4 text-gray-800 font-semibold">
                <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span className="text-blue-700">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 font-medium mb-2">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </div>
    );
};


const AdjustItem = ({ isVisible, onClose, item }) => {
    const [isAddingStock, setIsAddingStock] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState('Tbs');
    const [adjustmentDate, setAdjustmentDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);

    // 1. Create a ref for the modal content container
    const modalRef = useRef(null);

    // 2. Add useEffect to handle clicks outside the modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the ref exists AND the click is NOT inside the modal
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Add event listener to the document
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]); // Dependency array includes onClose

    if (!isVisible) return null;

    const handleToggle = () => {
        setIsAddingStock(!isAddingStock);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Stock Adjustment Submitted', {
            isAddingStock,
            selectedUnit,
            adjustmentDate: adjustmentDate.toLocaleDateString(),
            // ... other form values
        });
        onClose();
    };

    const unitOptions = ['Tbs', 'Pcs', 'Kg', 'Meters'];

    const formatSelectedDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };
    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center overflow-y-scroll" style={{ background: "rgba(0, 0, 0, .5)" }}>
            <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100">
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Stock Adjustment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition duration-150 cursor-pointer"
                        aria-label="Close"
                    >
                        <IoCloseSharp size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Stock Adjustment Toggle */}
                    <div className="flex items-center space-x-4 mb-6">
                        <span
                            className={`font-medium ${isAddingStock ? 'text-blue-600' : 'text-gray-500'}`}
                        >
                            Add Stock
                        </span>
                        <div
                            className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition duration-200 ease-in-out ${isAddingStock ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={handleToggle}
                        >
                            <span
                                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${isAddingStock ? 'translate-x-full' : 'translate-x-0'} border border-gray-200`}
                            ></span>
                        </div>
                        <span
                            className={`font-medium ${!isAddingStock ? 'text-red-600' : 'text-gray-500'}`}
                        >
                            Reduce Stock
                        </span>
                    </div>

                    {/* Item Name and Date */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                            <p className="mt-1 text-base font-semibold text-gray-900">
                                {item?.name || 'Product name'}
                            </p>
                        </div>
                        <div className="relative">
                            <label htmlFor="adjustmentDate" className="block text-sm font-medium text-blue-600">
                                Adjustment Date
                            </label>
                            <div
                                className="flex items-center border border-blue-500 rounded-md shadow-sm bg-white p-2 mt-1 cursor-pointer"
                                onClick={() => setShowCalendar(!showCalendar)}
                            >
                                <input
                                    type="text"
                                    id="adjustmentDate"
                                    readOnly
                                    value={formatSelectedDate(adjustmentDate)}
                                    className="w-full bg-white focus:outline-none text-gray-900 text-sm cursor-pointer"
                                />
                                <FaCalendarAlt className="text-gray-400 ml-2" />
                            </div>
                            {showCalendar && (
                                <CalendarPopover
                                    selectedDate={adjustmentDate}
                                    onSelectDate={setAdjustmentDate}
                                    onClose={() => setShowCalendar(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Input Fields (Total Qty, At Price, Details) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Total Qty with Dropdown */}
                        <div className="flex">
                            <input
                                type="number"
                                placeholder="Total Qty"
                                className="flex-grow p-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                                required
                            />
                            <select
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                                className="border border-gray-300 border-l-0 rounded-r-md bg-gray-50 p-2 shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {unitOptions.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* At Price */}
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="At Price"
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                            />
                        </div>
                        <br className='md:block hidden' />
                        {/* Details (now a textarea) */}
                        <div className="md:col-span-2"> {/* Increased column span for larger size */}
                            <textarea
                                placeholder="Details"
                                rows="4" // Make it 4 rows high by default
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm resize-y"
                            ></textarea>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium shadow-md transition duration-150 ease-in-out"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustItem;