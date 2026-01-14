"use client";

import CategroyButton from "@/app/(inventory)/Categroy/CategoryButton";
import Media from "@/components/gallery/Media";
import useOutsideClick from "@/hook/useOutsideClick";
import { useEffect, useState } from "react"; // Added useEffect to sync units to formData
import { IoClose } from "react-icons/io5";
import UnitBox from "../UnitBox";

// Helper function to get the correct border class
const getBorderClass = (isError) =>
  isError
    ? "border-red-500 focus:border-red-500"
    : "border-gray-300 focus:border-blue-600";

export default function BasicInfo({
  formData,
  onChange,
  type,
  validationErrors,
  initialData,
}) {
  const fieldLabel = type === "product" ? "Item Name" : "Service Name";
  const fieldName = "itemName"; // Use the Prisma field name
  const descriptionName = "description"; // Use the Prisma field name

  // Initializing state from formData for units, then using onChange to update formData
  const [baseUnitLocal, setBaseUnitLocal] = useState(formData.baseUnit || "");
  const [secondaryUnitLocal, setSecondaryUnitLocal] = useState(
    formData.secondaryUnit || "None"
  );
  const [unitQty, setUnitQty] = useState(formData.unitQty || 0);
  const [showUnitModal, setShowUnitModal] = useState(false);
  // Using formData.images for images, or a local state for the uploader
  const [images, setImages] = useState(formData.images || []);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'base' or 'secondary'

  const dropdownRef = useOutsideClick(() => setShowUnitModal(false));

  // Sync image state to formData whenever images change locally
  useEffect(() => {
    onChange("images", images);
  }, [images]);

  // Sync unit state to formData when saved in modal
  const handleSaveUnits = () => {
    onChange("baseUnit", baseUnitLocal === "None" ? null : baseUnitLocal);
    onChange(
      "secondaryUnit",
      secondaryUnitLocal === "None" ? null : secondaryUnitLocal
    );
    onChange("unitQty", unitQty);
    setShowUnitModal(false);
  };

  // Update local unit states when formData changes (e.g., when loading existing data)
  useEffect(() => {
    setBaseUnitLocal(formData.baseUnit || "None");
    setSecondaryUnitLocal(formData.secondaryUnit || "None");
    setImages(formData.images || []);
  }, [formData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Item Name/Service Name - Required */}
        <div>
          <div className="relative">
            <input
              value={formData[fieldName]}
              onChange={(e) => onChange(fieldName, e.target.value)}
              placeholder={``}
              type="text"
              id={fieldName}
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(
                validationErrors[fieldName]
              )}`}
            />
            <label
              htmlFor={fieldName}
              className="absolute transition-all text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              {fieldLabel} <span className="text-red-500">*</span>
            </label>
          </div>
        </div>
        {/* Description - Required */}
        <div>
          <div className="relative">
            <input
              value={formData[descriptionName]}
              onChange={(e) => onChange(descriptionName, e.target.value)}
              placeholder={``}
              type="text"
              id={descriptionName}
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(
                validationErrors[descriptionName]
              )}`}
            />
            <label
              htmlFor={descriptionName}
              className="absolute text-md text-gray-500  duration-300 transform transition-all -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Description
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Item Code/Service Code - Optional */}
        <div>
          <div className="relative">
            <input
              type="text"
              value={formData.itemCode}
              onChange={(e) => onChange("itemCode", e.target.value)}
              placeholder="e.g., SKU-001"
              id="itemCode"
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 peer ${getBorderClass(
                validationErrors.itemCode
              )}`}
            />
            <label
              htmlFor="itemCode"
              className="absolute transition-all text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              {type === "product" ? "Item Code" : "Service Code"}
            </label>
          </div>
        </div>

        {/* Unit Selector */}
        <div>
          <div
            onClick={() => setShowUnitModal(true)}
            // Show red border if baseUnit is required and missing, though Prisma model allows null
            className={`px-4 py-3 bg-blue-100 text-blue-700 font-medium rounded-lg shadow-sm hover:bg-blue-200 transition-colors cursor-pointer border-2 ${getBorderClass(
              validationErrors.baseUnit
            )}`}
          >
            {baseUnitLocal === "None"
              ? "Select Unit"
              : `(${formData.baseUnit}) ${!unitQty > 0 ? "" : `= ${unitQty}`} ${
                  secondaryUnitLocal === "None" ? "" : `= ${secondaryUnitLocal}`
                }`}
          </div>
        </div>
        {/* Media Uploader */}
        <div>
          {/* Media component is assumed to manage images state locally and call onChange('images', ...) */}
          <Media
            subTitle="Click to upload image PNG, JPG, GIF up to 5MB"
            images={images}
            setImages={setImages}
          />
        </div>

        {/* Category Selector */}
        <div>
          {/* <CategorySelector /> */}
          <CategroyButton onChange={onChange} initialData={initialData} />
        </div>
      </div>

      {/* Unit Modal Container */}
      {showUnitModal && (
        <div className="fixed z-20 animate-in inset-0 bg-gray-900 bg-opacity-50 flex items-start justify-center p-4 pt-10 sm:pt-20">
          <div
            ref={dropdownRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-auto transform transition-all"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-800">
                Select Unit
              </h2>
              <button
                onClick={() => setShowUnitModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-full hover:bg-gray-200"
                aria-label="Close"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* BASE UNIT Dropdown */}
                <UnitBox
                  id="base"
                  label="BASE UNIT"
                  selectedUnit={baseUnitLocal}
                  onSelect={setBaseUnitLocal}
                  // Removed activeDropdown logic for simplicity, assuming UnitBox handles its own open/close
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />

                {/* SECONDARY UNIT Dropdown */}
                <UnitBox
                  id="secondary"
                  label="SECONDARY UNIT"
                  selectedUnit={secondaryUnitLocal}
                  onSelect={setSecondaryUnitLocal}
                  // Removed activeDropdown logic
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
              </div>
              {baseUnitLocal != "None" && secondaryUnitLocal != "None" ? (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Conversion Rates
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-blue-800 bg-white flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full border border-white bg-white flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-800" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <label htmlFor="unitQty" className="text-sm font-medium">
                        1 {baseUnitLocal} =
                      </label>
                      <input
                        type="number"
                        id="unitQty"
                        name="uniQty"
                        onChange={(e) => setUnitQty(e.target.value)}
                        value={unitQty}
                        className="w-16 p-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <span className="text-sm font-medium text-gray-500">
                        {secondaryUnitLocal}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleSaveUnits}
                className="px-6 py-2 text-white font-medium bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 uppercase tracking-wider"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
