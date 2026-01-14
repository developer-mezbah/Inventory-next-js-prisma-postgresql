"use client";
import { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import FileCard from "./FileCards";
import UploadNew from "./UploadNew";
import { toast } from "react-toastify";
import PreviewImage from "./PreviewImage";
import SearchBox from "./SearchBox";
import SelectOnlyToggle from "./SelectOnlyToggle";
import SortBy from "./SortBy";
import Loading from "../Loading";
import { useFetchData } from "@/hook/useFetchData";

const Media = ({ title, subTitle, setImages, images = [], multiImages }) => {
  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/media/images", ["mediaImages"]);
  const [imageData, setImageData] = useState(data ? data : []);
  const [activeTab, setActiveTab] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [{ title: "Select File" }, { title: "Upload New" }];
  const [selectedCards, setSelectedCards] = useState([]);
  const [singleSelection, setSingleSelection] = useState(true);

  const previewImages = imageData.filter((item) =>
    images.includes(item?.img_url)
  );

  useEffect(() => {
    if (multiImages) {
      setSingleSelection(false);
    }
    setSelectedCards(images || []);
  }, [multiImages, isOpen, images]);

  const handleCardClick = (url) => {
    if (singleSelection) {
      setSelectedCards([url]);
    } else {
      setSelectedCards((prevSelectedCards) => {
        if (prevSelectedCards.includes(url)) {
          return prevSelectedCards.filter((card) => card !== url);
        } else {
          return [...prevSelectedCards, url];
        }
      });
    }
  };

  const toggleSingleSelection = () => {
    setSingleSelection((prev) => !prev);
    if (singleSelection) {
      setSelectedCards([]);
    }
  };

  const addFiles = () => {
    if (selectedCards.length === 0) {
      return toast.error("Please, select images!");
    }
    const filteredData = imageData.filter((item) =>
      selectedCards.includes(item.img_url)
    );
    setImages(filteredData.map((item) => item?.img_url));
    setIsOpen(false);
  };

  useEffect(() => {
    setImageData(data);
  }, [data]);

  const paginationPerPage = 20;
  const [startNum, setStartNum] = useState(0);
  const [endNum, setEndNum] = useState(paginationPerPage);

  const handlePrev = () => {
    if (startNum > paginationPerPage) {
      setEndNum(endNum - paginationPerPage);
      setStartNum(startNum - paginationPerPage);
    } else {
      setEndNum(paginationPerPage);
      setStartNum(0);
    }
  };

  const handleNext = () => {
    if (data.length > endNum) {
      setEndNum(endNum + paginationPerPage);
      setStartNum(startNum + paginationPerPage);
    }
  };

  return (
    <div className="relative">
      <div className={`${title ? "mt-4" : "mt-0"} md:flex`}>
        {title && <p className="md:w-1/3 mb-1 text-sm">{title && title}</p>}
        <div
          className={`${title ? "md:w-2/3" : "md:w-full"} ${
            images.length !== 0 && "space-y-4"
          }`}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex text-sm border w-full rounded-lg text-[#84788D]"
          >
            <span className="py-3 px-5 border-r-2 rounded-l-[10px] bg-[#EEF0F2]">Browse</span>
            <span className="p-3 whitespace-nowrap">
              {!images.length
                ? "Choose File"
                : `${
                    images.length === 1
                      ? images.length + " file selected"
                      : images.length + " files selected"
                  } `}
            </span>
          </button>
          {images && (
            <div className={`flex gap-4 flex-wrap`}>
              {previewImages?.map((item, i) => (
                <PreviewImage
                  key={i}
                  image={item?.img_url}
                  fileSize={item?.file_size}
                  filename={item?.file_name}
                  id={item?._id}
                  setImages={setImages}
                  images={images}
                />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-600">{subTitle && subTitle}</p>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed z-40 inset-0 bg-black bg-opacity-50 transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl max-h-[95vh] overflow-hidden flex flex-col">
          <div className="flex justify-between px-3 bg-[#f2f3f8] pt-3 pb-1">
            <div className="flex gap-3">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`whitespace-nowrap rounded py-2 px-6 w-full text-left transition-all duration-300 ${
                    activeTab === index
                      ? "bg-white border-slate-400 border border-b-0 rounded-b-none"
                      : "border-transparent hover:border-slate-300 border"
                  }`}
                  onClick={() => {
                    setActiveTab(index);
                    refetch();
                  }}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl text-slate-500"
            >
              <IoCloseOutline />
            </button>
          </div>

          {activeTab === 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex gap-4 justify-between items-center sm:flex-nowrap flex-wrap px-3 mt-4 mb-3">
                <div className="flex gap-4 items-center sm:flex-nowrap flex-wrap">
                  <div className="w-64">
                    <SortBy data={data} setData={setImageData} />
                  </div>
                  <SelectOnlyToggle
                    originalData={data}
                    selectedItems={selectedCards}
                    setImageData={setImageData}
                  />
                </div>
                <div>
                  <SearchBox
                    imageData={imageData}
                    setImageData={setImageData}
                    originalData={data}
                  />
                </div>
              </div>
              <hr />
              <div className="sm:my-8 my-5 sm:px-5 px-2">
                {isInitialLoading ? (
                  <Loading />
                ) : (
                  <div className="overflow-y-auto max-h-[60vh] p-2">
                    <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 sm:gap-5 gap-3">
                      {imageData?.slice(startNum, endNum).map((item, i) => (
                        <FileCard
                          key={i}
                          image={item?.img_url}
                          filename={item?.file_name}
                          fileSize={item?.file_size}
                          onClick={() => handleCardClick(item?.img_url)}
                          isSelected={selectedCards.includes(item?.img_url)}
                          singleSelection={singleSelection}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="flex-1 overflow-y-auto p-4">
              <UploadNew />
            </div>
          )}

          <div className="bg-[#f2f3f8] sticky bottom-0 px-3 py-2 w-full flex flex-wrap justify-between items-center gap-3">
            <div className="flex sm:gap-5 gap-2 items-center flex-wrap">
              <div className="flex flex-col items-start">
                <span className="text-sm text-gray-700">
                  {selectedCards.length > 1
                    ? `${selectedCards.length} files selected`
                    : `${selectedCards.length} file selected`}
                </span>
                <button
                  onClick={() => setSelectedCards([])}
                  className="py-2 text-sm text-blue-500 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="space-x-2">
                <button
                  onClick={handlePrev}
                  className={`${
                    startNum === 0 ? "cursor-not-allowed" : ""
                  } px-4 py-2 text-sm bg-blue-500 text-slate-200 rounded-lg hover:bg-blue-800`}
                >
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  className={`${
                    endNum >= data.length ? "cursor-not-allowed" : ""
                  } px-4 py-2 text-sm bg-blue-500 text-slate-200 rounded-lg hover:bg-blue-800`}
                >
                  Next
                </button>
              </div>
            </div>

            <div>
              {activeTab === 0 ? (
                <button
                  onClick={addFiles}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
                >
                  Add Files
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab(0);
                    refetch();
                  }}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
                >
                  Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Media;