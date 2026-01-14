import Image from "next/image";
import { IoCloseOutline } from "react-icons/io5";

const PreviewImage = ({ image, fileSize, filename, id, setImages, images }) => {
  const handleDelete = () => {
    const filteredData = images.filter((item) => image !== item);
    setImages(filteredData);
  };

  
  const formatFileSize = () => {
    if (fileSize < 1024) {
      return `${fileSize} Bytes`;
    } else if (fileSize < 1024 * 1024) {
      return `${(fileSize / 1024).toFixed(2)} KB`;
    } else {
      return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  return (
    <div className="relative flex flex-col justify-between w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40 bg-white shadow-md rounded-lg p-2 border">
      <button
        onClick={handleDelete}
        className="absolute -top-3 -right-3 bg-gray-300 hover:bg-gray-400 rounded-full p-1"
        // onClick={() => setIsVisible(false)}
      >
        <IoCloseOutline className="w-5 h-5 text-blue-500" />
      </button>

      <Image
        className="w-full bg-[#eef0f2]"
        src={image}
        width={200}
        height={200}
        alt="modal iamge"
      />
      <div className="text-sm text-gray-700 mt-2">
        <p className="truncate font-semibold">{filename}</p>
        <p className="text-gray-500 truncate">{formatFileSize()}</p>
      </div>
    </div>
  );
};

export default PreviewImage;