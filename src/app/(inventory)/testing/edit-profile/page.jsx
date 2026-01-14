"use client";
import { useState } from "react";
import { BiCamera, BiSave, BiUpload } from "react-icons/bi";
import { GrClose } from "react-icons/gr";

// Mock data for dropdowns
const mockBusinessTypes = ["Retail", "Service", "Manufacturing", "E-commerce"];
const mockBusinessCategories = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Software",
];

const InputField = ({
  label,
  id,
  value,
  onChange,
  placeholder = "Enter details",
  type = "text",
  readOnly = false,
}) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`
        p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
        ${readOnly ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
      `}
    />
  </div>
);

const SelectField = ({ label, id, options, value, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Component for the Profile Logo/Image Upload area
const ProfileLogoUploader = ({ logoUrl, onUploadClick }) => (
  <div className="flex justify-center mb-8">
    <div className="relative w-32 h-32">
      {/* Outer circle for styling */}
      <div className="w-full h-full rounded-full border-4 border-blue-500/20 flex items-center justify-center">
        {/* Inner logo container */}
        <div
          className={`w-28 h-28 rounded-full ${
            logoUrl ? "bg-gray-200" : "bg-blue-50"
          } flex items-center justify-center text-center p-2`}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Business Logo"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-blue-700 font-semibold text-sm">
              Add Logo
            </span>
          )}
        </div>
      </div>

      {/* Edit/Camera Button */}
      <button
        type="button"
        onClick={onUploadClick}
        className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-gray-300 text-gray-600 hover:text-blue-600 transition duration-150"
        aria-label="Upload logo"
      >
        <BiCamera className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Component for Signature Upload Area
const SignatureUploader = ({ onUploadClick }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-700">Add Signature</label>
    <div
      onClick={onUploadClick}
      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition duration-150"
    >
      <BiUpload className="w-6 h-6 mb-1" />
      <span className="text-sm">Upload Signature</span>
    </div>
  </div>
);

const App = () => {
  const [profile, setProfile] = useState({
    businessName: "Mezbah Uddin",
    phoneNumber: "01230392401",
    emailId: "developer.mezbah@gmail.com",
    businessType: "",
    businessCategory: "",
    pincode: "",
    businessAddress: "",
    logoUrl: null, // Placeholder for logo URL
    signatureUrl: null, // Placeholder for signature URL
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    console.log("Saving changes:", profile);
    // Add API call logic here
  };

  const handleCancel = () => {
    console.log("Cancelling changes...");
    // Add logic to revert changes or close the modal/view
  };

  // Mock function for file upload action
  const handleFileUpload = (field) => {
    // In a real app, this would open a file dialog and update the state (e.g., logoUrl)
    alert(`Initiating upload for ${field}. (Functionality TBD)`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-6 font-inter">
      {/* Main Form Container */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Profile</h1>
        </div>

        {/* Form Body - Responsive Layout */}
        <div className="p-6">
          {/* Logo Upload Section */}
          <ProfileLogoUploader
            logoUrl={profile.logoUrl}
            onUploadClick={() => handleFileUpload("logo")}
          />

          {/* Form Fields Grid: Responsive layout (1 column on mobile, 3 columns on tablet/desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6">
            {/* Column 1: Business Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                Business Details
              </h2>
              <InputField
                label="Business Name"
                id="businessName"
                value={profile.businessName}
                onChange={handleChange}
              />
              <InputField
                label="Phone Number"
                id="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                type="tel"
              />
              <InputField
                label="Email ID"
                id="emailId"
                value={profile.emailId}
                onChange={handleChange}
                type="email"
                readOnly // Simulating a non-editable field
              />
            </div>

            {/* Column 2: More Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                More Details
              </h2>
              <SelectField
                label="Business Type"
                id="businessType"
                options={mockBusinessTypes}
                value={profile.businessType}
                onChange={handleChange}
              />
              <SelectField
                label="Business Category"
                id="businessCategory"
                options={mockBusinessCategories}
                value={profile.businessCategory}
                onChange={handleChange}
              />
              <InputField
                label="Pincode"
                id="pincode"
                value={profile.pincode}
                onChange={handleChange}
                placeholder="Enter Pincode"
                type="number"
              />
            </div>

            {/* Column 3: Address and Signature */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                Business Address
              </h2>
              <div className="flex flex-col space-y-1">
                <textarea
                  id="businessAddress"
                  rows="4"
                  value={profile.businessAddress}
                  onChange={handleChange}
                  placeholder="Enter Business Address"
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <SignatureUploader
                onUploadClick={() => handleFileUpload("signature")}
              />
            </div>
          </div>
        </div>

        {/* Footer / Action Buttons */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150"
          >
            <GrClose className="w-4 h-4 mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
          >
            <BiSave className="w-4 h-4 mr-1" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
