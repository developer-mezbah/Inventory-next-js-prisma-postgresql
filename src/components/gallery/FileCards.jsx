import Image from "next/image";

const FileCard = ({
  image,
  filename,
  fileSize,
  onClick,
  isSelected,
  singleSelection,
}) => {

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
    <div
      onClick={onClick}
      className={`w-full p-4 border-2 rounded-lg shadow-md transition-all duration-300 ${
        isSelected ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
      } cursor-pointer`}
    >
      <Image
        width={400}
        height={400}
        src={image}
        alt={filename}
        className="w-full h-32 object-contain rounded-md mb-2 bg-[#eef0f2]"
      />
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600 truncate">
          {filename}
        </span>
        <span className="text-xs text-blue-500">{formatFileSize()}</span>
      </div>
    </div>
  );
};

export default FileCard;