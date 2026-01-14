import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function BulkAction({ selectImages, refetch }) {
  const [isOpen, setIsOpen] = useState(false); // To manage dropdown visibility
  const [selectedOption, setSelectedOption] = useState("Bulk Action"); // To manage selected option

  const options = ["Delete selection"]; // Dropdown options

  // Ref for the dropdown menu
  const dropdownRef = useRef(null);

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Select an option and close the dropdown
  const selectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false); // Close the dropdown after selection
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Close dropdown if click is outside
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/media/delete`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_ids: selectImages }),
          }
        );

        const data = await response.json();

        if (!data.error) {
          refetch();
          toast.success("Images deleted successfully");
        } else {
          toast.error("Something went wrong!");
        }
      }else{

      }
    });
  };

  return (
    <div
      className="relative inline-block text-left sm:w-fit w-full"
      ref={dropdownRef}
    >
      <div className="flex justify-between items-center border text-sm rounded sm:px-4 border-gray-300 bg-white">
        <button
          onClick={toggleDropdown}
          className="inline-flex justify-between w-full rounded-md shadow-sm px-4 py-2 bg-white text-sm text-gray-700 hover:bg-gray-50 font-light"
        >
          {selectedOption}
          <svg
            className="-mr-1 ml-2 h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={handleDelete}
                className={`block whitespace-nowrap w-full text-left text-gray-700 px-4 py-2 text-sm mt-1 ${
                  selectedOption === option
                    ? "bg-blue-500"
                    : "text-gray-700 hover:bg-blue-500 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkAction;