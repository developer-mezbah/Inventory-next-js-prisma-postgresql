// components/NewCompanyModal.jsx
"use client";
import client_api from '@/utils/API_FETCH';
import { useState } from 'react';
import { BiLoader } from 'react-icons/bi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';

// You will need to install react-icons: npm install react-icons or yarn add react-icons

export default function NewCompanyModal({ isOpen, onClose, user, refetch }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleCreateCompany = async () => {
    if (!name) {
      return toast.error("Company name is required.");
    }
    setLoading(true);
    client_api.create("/api/company", "Token", {
      name: name || "New Company",
      userId: user?.id || null
    }).then((data) => {
      setName("");
      refetch(); // Refresh the company list after creating a new company
    }).catch((error) => {
      console.error("Error creating new company:", error);
    }).finally(() => {
      setLoading(false);
      onClose();
    });
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center">
            <HiOutlineBuildingOffice2 className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Company</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close modal"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Content) */}
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Enter the details for your new company.
          </p>
          {/* Example Form Field - You can expand this */}
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Acme Solutions Inc."
          />
        </div>

        {/* Modal Footer (Actions) */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            // In a real app, this would submit the form data
            onClick={handleCreateCompany}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {loading ? <span className='flex gap-1 items-center justify-center'><BiLoader/> Creating...</span> : "Create Company"}
          </button>
        </div>
      </div>
    </div>
  );
}