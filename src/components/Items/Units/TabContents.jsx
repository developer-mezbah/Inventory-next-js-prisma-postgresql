import React, { useCallback, useState } from 'react'
import AddConversationModal from './AddConversationModal';
import ConversionTable from './ConversionTable';




const TabContents = ({ content }) => {
    // Mock state for demonstration purposes
    const [data] = useState({
        title: "Units"
    });
  const [isOpen, setIsOpen] = useState(false);

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
                            <span className="mr-1">{data.title}</span>
                        </div>

                        {/* Action/Status Icons (Right Side) */}
                        <div className="flex space-x-2 items-center">
                            <button
                                
        onClick={() => setIsOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out">
                                Add conversion
                            </button>
                        </div>
                    </div>
                </div>



                {/* Subtle Bottom Border (Matching the bottom line in the image) */}
                <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
                <ConversionTable content={content?.conversion} title={content?.label} />
            </div>

            {/* MoveCategory Modal */}
            {isOpen && <AddConversationModal onClose={() => setIsOpen(false)} />}
        </div>
    )
}

export default TabContents