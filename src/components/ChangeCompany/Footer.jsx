// Footer.jsx
"use client"

import { useState } from 'react';
// Import the new modal component
import NewCompanyModal from './NewCompanyModal'; 
// NOTE: Adjust the path above based on where you save NewCompanyModal.jsx

export default function Footer({refetch, user}) {
  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 px-6 py-6 mt-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Currently logged in with Email:</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium whitespace-nowrap">
                Restore backup
              </button>
              {/* Button to open the modal */}
              <button 
                onClick={openModal} // Handler to open the modal
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
              >
                New Company
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* The Modal Component */}
      <NewCompanyModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        user={user}
        refetch={refetch}
      />
    </>
  )
}