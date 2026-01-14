import useOutsideClick from "@/hook/useOutsideClick";
import CustomModal from "@components/Items/Category/CustomModal";
import { useCallback, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai"; // Using a common react-icons package, e.g., 'ai' for Ant Design Icons
import { FaTimes } from "react-icons/fa";

// Note: This component is simplified for demonstration.
// In a real app, you would manage state for selected categories and the dropdown open/close state.

const initialCategories = ["Category 1", "Grocery"];

const CategorySelector = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const handleCheckboxChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Helper to format the display text for selected categories
  const getDisplayText = () => {
    if (selectedCategories.length === 0) {
      return "";
    }
    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }
    return `${selectedCategories.length} selected`;
  };

  return (
    <div className=" relative">
      {/* Input/Dropdown Header */}
      <div
        className={`
          border ${isOpen ? "border-blue-600" : "border-gray-300"} 
          rounded-md p-2 
          shadow-sm 
          relative 
          cursor-pointer 
          hover:border-blue-500
          transition-colors
        `}
        onClick={toggleDropdown}
      >
        <label
          className={`
            absolute 
            left-2 
            transition-all 
            duration-200 
            bg-white 
            px-1 
            text-sm 
            ${
              selectedCategories.length > 0 || isOpen
                ? "-top-3 text-blue-600"
                : "top-1/2 -translate-y-1/2 text-gray-500"
            }
          `}
        >
          Category
        </label>

        <input
          type="text"
          readOnly
          value={getDisplayText()}
          className="w-full h-6 text-gray-800 focus:outline-none bg-transparent pt-1"
        />

        {/* Dropdown Arrow */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {/* A simple arrow icon using Tailwind or a React Icon */}
          <span className="text-gray-500 text-lg">
            &#9660; {/* Unicode down arrow */}
          </span>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute 
            z-10 
            mt-2 
            w-full 
            bg-white 
            border 
            border-gray-300 
            rounded-lg 
            shadow-lg 
            p-2
          "
        >
          {/* Add New Category Button */}
          <div
            onClick={openModal}
            className="flex items-center p-2 text-blue-600 cursor-pointer hover:bg-blue-50 rounded-md mb-2 "
          >
            <AiOutlinePlus className="text-xl mr-2" />
            <span className="font-medium">Add New Category</span>
          </div>

          {/* Separator if needed, but the design doesn't show one */}
          {/* <hr className="my-1 border-gray-200" /> */}

          {/* Category List */}
          <div className="space-y-1">
            {initialCategories.map((category) => (
              <label
                key={category}
                className="
                  flex 
                  items-center 
                  p-2 
                  cursor-pointer 
                  hover:bg-gray-50 
                  rounded-md
                "
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCheckboxChange(category)}
                  className="
                    form-checkbox 
                    h-5 
                    w-5 
                    text-blue-600 
                    border-gray-300 
                    rounded 
                    focus:ring-blue-500
                  "
                />
                <span className="ml-3 text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      <CustomModal isOpen={showModal} onClose={closeModal}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add Category</h2>
          <button
            onClick={closeModal}
            aria-label="Close modal"
            className="p-1 text-gray-400 rounded-full hover:bg-gray-50 hover:text-gray-600 transition"
          >
            {/* FaTimes (X icon) is used for the close button */}
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Input Field) */}
        <div className="p-6">
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter Category Name
          </label>
          <input
            id="categoryName"
            type="text"
            placeholder="e.g., Grocery"
            className="w-full px-4 py-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner"
          />
        </div>

        {/* Modal Footer (Action Button) */}
        <div className="p-6 pt-0">
          <button
            onClick={() => {
              // Simulate category creation logic
              console.log("Category created!");
              closeModal();
            }}
            className="w-full py-3 bg-red-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-red-700 transition duration-150 ease-in-out transform hover:scale-[1.01]"
          >
            Create
          </button>
        </div>
      </CustomModal>
    </div>
  );
};

export default CategorySelector;
