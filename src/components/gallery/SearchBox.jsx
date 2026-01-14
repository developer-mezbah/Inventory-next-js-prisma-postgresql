import React, { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";


const SearchBox = ({ imageData, setImageData, originalData }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value === "") {
      setImageData(originalData);
    } else {
      const filteredData = originalData.filter((item) =>
        item.file_name.toLowerCase().includes(value)
      );
      setImageData(filteredData);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setImageData(originalData);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search your files"
        value={searchTerm}
        onChange={handleSearch}
        className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 md:min-w-[300px]"
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute right-2 top-1.5 bg-red-500 text-white px-2 py-1.5 rounded-md text-xl"
        >
          <IoCloseSharp />
        </button>
      )}
    </div>
  );
};

export default SearchBox;