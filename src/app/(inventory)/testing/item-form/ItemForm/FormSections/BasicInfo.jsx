"use client";

import Media from "@/components/gallery/Media";
import useOutsideClick from "@/hook/useOutsideClick";
import { useState } from "react";
import { GrGallery } from "react-icons/gr";
import { IoClose } from "react-icons/io5";
import CategorySelector from "../CategorySelector";
import UnitBox from "../UnitBox";

export default function BasicInfo({ formData, onChange, type }) {
  const fieldLabel = type === "product" ? "Item Name" : "Service Name";
  const [baseUnit, setBaseUnit] = useState("None");
  const [secondaryUnit, setSecondaryUnit] = useState("None");
  const [activeDropdown, setActiveDropdown] = useState(null); // 'base' or 'secondary'
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [images, setImages] = useState([]);

  const dropdownRef = useOutsideClick(() => setShowUnitModal(false));

  const handleSave = () => {
    // Mock save logic
    alert(
      `Units Saved: Base Unit: ${baseUnit}, Secondary Unit: ${secondaryUnit}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="relative">
            <input
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              type="text"
              id="name"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <label
              htmlFor="name"
              className="absolute text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              {fieldLabel} <span className="text-destructive">*</span>
            </label>
          </div>
        </div>

        <div>
          <CategorySelector />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <input
              type="text"
              value={formData.code}
              onChange={(e) => onChange("code", e.target.value)}
              placeholder="e.g., SKU-001"
              id="skucode"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <label
              htmlFor="skucode"
              className="absolute text-md text-gray-500  duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              {type === "product" ? "Item Code" : "Service Code"}
            </label>
          </div>
        </div>

        <div>
          <div
            onClick={() => setShowUnitModal(!showUnitModal)}
            className="px-4 py-3  bg-blue-100  text-blue-700 font-medium rounded-lg shadow-sm  hover:bg-blue-200 transition-colors cursor-pointer"
          >
            Select Unit
          </div>
        </div>
        <div>
          <Media
            subTitle="Click to upload image PNG, JPG, GIF up to 5MB"
            images={images}
            setImages={setImages}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Image
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <GrGallery className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload image</p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, GIF up to 5MB
          </p>
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
                  selectedUnit={baseUnit}
                  onSelect={setBaseUnit}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />

                {/* SECONDARY UNIT Dropdown */}
                <UnitBox
                  id="secondary"
                  label="SECONDARY UNIT"
                  selectedUnit={secondaryUnit}
                  onSelect={setSecondaryUnit}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleSave}
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
