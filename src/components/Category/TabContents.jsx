import React, { useCallback, useState } from 'react'
import TransactionsTable from './TransactionsTable';
import MoveCategoryModal from './MoveCategoryModal';




const TabContents = ({ subcategory, category,categoryName }) => {
    const [showMoveModal, setShowMoveModal] = useState(false);
    const openMoveModal = useCallback(() => setShowMoveModal(true), []);
    const closeMoveModal = useCallback(() => setShowMoveModal(false), []);


    return (
        <div className="font-inter antialiased">
            {/* Main Card Container */}
            <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex justify-between items-center">
                        {/* Title and Link Icon (Left Side) */}
                        <div className="flex items-center text-lg font-semibold text-gray-800">
                            <span className="mr-1">{categoryName || 'Category Name'}</span>
                        </div>

                        {/* Action/Status Icons (Right Side) */}
                        <div className="flex space-x-2 items-center">
                            <button
                                onClick={openMoveModal} className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out">
                                Move To This Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section - Phone Number Detail */}
                <div className="p-4 space-y-3 bg-white flex gap-3">
                    {/* Phone Number Label */}
                    <div className="text-md font-semibold text-gray-500">
                        Items
                    </div>
                    {/* Phone Number Value */}
                    <div className="text-xl font-semibold text-gray-600 -mt-1">
                        {category?.items && category?.items.length || 0}
                    </div>
                </div>

                {/* Subtle Bottom Border (Matching the bottom line in the image) */}
                <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
                <TransactionsTable data={category?.items || []} subcategory={subcategory} />
            </div>

            {/* MoveCategory Modal */}
            <MoveCategoryModal isOpen={showMoveModal} onClose={closeMoveModal} />
        </div>
    )
}

export default TabContents