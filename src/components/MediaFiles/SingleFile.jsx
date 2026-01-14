
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiCopy, FiDownload, FiTrash2 } from "react-icons/fi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SingleFile = ({ item, setSelectImages, selectImages, refetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const dropdownRef = useRef(null);
  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
          `/api/media/images`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_ids: [item?.public_id] }),
          }
        );

        const data = await response.json();
        if (data) {
          refetch();
          toast.success("Images deleted successfully");
        }
      }
    });
  };

  const copyImgUrl = async () => {
    try {
      await navigator.clipboard.writeText(item?.img_url);
      toast.success("Image url Copied.");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(item?.img_url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = item?.file_name; // Set the file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} Bytes`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // toggle select image for delete
  const handleSelect = () => {
    if (selectImages.includes(item?.public_id)) {
      const filter = selectImages.filter((urlId) => urlId !== item?.public_id);
      setSelectImages(filter);
    } else {
      setSelectImages([...selectImages, item?.public_id]);
    }
  };
  return (
    <div className="relative flex border flex-col justify-between w-full sm:w-44 md:w-52 lg:w-60 xl:w-72 bg-white shadow-md rounded-lg p-3">
      {/* Checkbox (Top Left) */}
      <input
        type="checkbox"
        checked={selectImages?.includes(item?.public_id)}
        onChange={handleSelect}
        className="absolute top-2.5 left-2.5 w-5 h-5 rounded cursor-pointer text-blue-500 border-gray-300"
      />

      {/* Three-dot button (Top Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1 right-1 bg-gray-300 opacity-80 hover:bg-gray-400 rounded-full p-1"
      >
        <HiOutlineDotsVertical className="w-5 h-5 text-blue-500" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-8 right-2 w-40 bg-white shadow-lg rounded-lg border p-2 transition-opacity duration-200 ease-in-out z-20"
        >
          <ul className="text-gray-700">
            {/* <li
              onClick={() => toast.warning("Functionality coming soon!")}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
            >
              <IoMdInformationCircleOutline className="w-4 h-4" />
              Details Info
            </li> */}
            <li
              onClick={downloadImage}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
            >
              <FiDownload className="w-4 h-4" />
              Download
            </li>
            <li
              onClick={copyImgUrl}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
            >
              <FiCopy className="w-4 h-4" />
              Copy Link
            </li>
            <li
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-100 cursor-pointer rounded"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </li>
          </ul>
        </div>
      )}

      {/* Image */}
      <Image
        className="w-full m-auto bg-gray-100 max-h-[200px] object-scale-down"
        src={item?.img_url}
        width={200}
        height={200}
        alt="modal image"
      />

      {/* File details */}
      <div className="text-sm text-gray-700 mt-2">
        <p className="truncate font-semibold">{item?.file_name}</p>
        {/* <p className="text-gray-500 truncate">{item?.file_size}</p> */}
        <p className="text-gray-500 truncate">
          {formatFileSize(item.file_size)}
        </p>
      </div>
    </div>
  );
};

export default SingleFile;