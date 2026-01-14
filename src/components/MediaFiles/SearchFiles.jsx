import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const SearchFiles = ({ imageData, setImageData, originalData,paginationPerPage }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setImageData(originalData); // Reset to full data when input is empty
    } else {
      const filteredData = originalData.filter((image) =>
        image.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setImageData(filteredData);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setImageData(originalData.slice(0, paginationPerPage)); // Reset to original image data
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 mb-3 sm:w-fit w-full">
      <input
        type="text"
        placeholder="Search your files"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 w-full sm:w-[100px] text-white font-medium py-1.5 px-4 rounded-md hover:bg-blue-600 transition"
      >
        Search
      </button>
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="bg-red-500 w-full sm:w-[50px] text-white py-2 px-2 rounded-md hover:bg-red-600 transition flex items-center"
        >
          <AiOutlineClose className="mx-auto" size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchFiles;