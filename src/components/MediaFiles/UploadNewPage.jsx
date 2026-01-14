import { HiChevronLeft } from "react-icons/hi";
import UploadNew from "../gallery/UploadNew";

const UploadNewPage = ({ setUploadPage, imagesRefetch }) => {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center p-4 mt-5 bg-white">
        <p className="text-gray-700 sm:text-lg font-semibold">Upload New File</p>
        <button
          onClick={() => {
            setUploadPage(false);
            imagesRefetch();
          }}
          className="flex items-center text-gray-700 sm:text-lg font-medium hover:underline cursor-pointer"
        >
          <HiChevronLeft className="w-4 h-4 mr-1" />
          Back to uploaded files
        </button>
      </div>
      <UploadNew />
    </div>
  );
};

export default UploadNewPage;