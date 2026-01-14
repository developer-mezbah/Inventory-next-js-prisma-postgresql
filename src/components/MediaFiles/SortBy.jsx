import { useEffect, useRef, useState } from "react";

function SortBy({ data, setData, paginationPerPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Sort by");

  const options = [
    { label: "Sort by newest", value: "newest" },
    { label: "Sort by oldest", value: "oldest" },
    { label: "Sort by smallest", value: "smallest" },
    { label: "Sort by largest", value: "largest" },
  ];

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const sortData = (option) => {
    let sortedData = [...data];
    switch (option) {
      case "newest":
        sortedData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        sortedData.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "smallest":
        sortedData.sort((a, b) => a.file_size - b.file_size);
        break;
      case "largest":
        sortedData.sort((a, b) => b.file_size - a.file_size);
        break;
      default:
        break;
    }
    setData(sortedData.slice(0, paginationPerPage));
  };

  const selectOption = (option) => {
    setSelectedOption(option.label);
    setIsOpen(false);
    sortData(option.value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative sm:w-fit w-full inline-block text-left"
      ref={dropdownRef}
    >
      <div
        onClick={toggleDropdown}
        className="flex w-full justify-between items-center border text-sm rounded px-2 border-gray-300 cursor-pointer"
      >
        <p className="font-light text-gray-700 block sort-name whitespace-nowrap">
          {selectedOption}
        </p>
        <button className="inline-flex justify-between rounded-md shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 sort-name">
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
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1 whitespace-nowrap">
            {options.map((option) => (
              <a
                key={option.value}
                onClick={() => selectOption(option)}
                className={`block whitespace-nowrap px-4 py-2 text-sm sort-name mt-1 cursor-pointer ${
                  selectedOption === option.label
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-blue-500 hover:text-white"
                }`}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SortBy;