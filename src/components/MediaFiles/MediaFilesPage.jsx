"use client";
import { useEffect, useState } from "react";
import BulkAction from "./BulkAction";
import SearchFiles from "./SearchFiles";
import SingleFile from "./SingleFile";
import SortBy from "./SortBy";
import UploadNewPage from "./UploadNewPage";
import Pagination from "../Pagination/Pagination";
import { useFetchData } from "@/hook/useFetchData";
import Loading from "../Loading";

const MediaFilesPage = () => {
  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/media/images", ["mediaImages"]);
  
  const [isUploadPage, setUploadPage] = useState(false);
  const [selectImages, setSelectImages] = useState([]);
  const [imageData, setImageData] = useState([]);

  // useEffect(() => {
  //   setImageData(data);
  // }, [data, imageData]);

  const paginationPerPage = 15;

  if (isInitialLoading) {
    return <Loading />;
  }
  //   if (!error) {
  //   return <p>Error loading data</p>;
  // }

  return data && !isUploadPage ? (
    <div>
      <div className="flex flex-wrap sm:gap-0 gap-2 justify-between items-center p-4 bg-white mt-5">
        <p className="text-gray-700 md:text-lg text-[13px] font-semibold">
          All uploaded files
        </p>
        <button
          onClick={() => setUploadPage(true)}
          className="md:px-6 px-3 md:py-2.5 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 whitespace-nowrap"
        >
          Upload New File
        </button>
      </div>

      <div className="overflow-x-hidden w-full md:mt-5 border shadow-lg rounded-2xl">
        <div className="flex gap-2 flex-wrap justify-between items-center py-4 px-3">
          <h2 className="font-medium sm:text-xl text-slate-600 md:pl-4 pl-1">
            All files
          </h2>
          <div className="flex gap-2 flex-wrap">
            <BulkAction selectImages={selectImages} refetch={refetch} />
            <SortBy
              data={data ? data : []}
              setData={setImageData}
              paginationPerPage={paginationPerPage}
            />
            <SearchFiles
              originalData={data ? data : []}
              imageData={imageData}
              setImageData={setImageData}
              paginationPerPage={paginationPerPage}
            />
          </div>
        </div>

        <div className={`flex gap-4 flex-wrap sm:pl-5`}>
          {imageData?.map((item, i) => (
            <SingleFile
              key={i}
              item={item}
              refetch={refetch}
              setSelectImages={setSelectImages}
              selectImages={selectImages}
            />
          ))}
        </div>
        <div className="mb-5">
         <Pagination
            itemsPerPage={paginationPerPage}
            data={data ? data : []}
            onPageChange={setImageData}
          />
        </div>
      </div>
    </div>
  ) : (
    <UploadNewPage setUploadPage={setUploadPage} imagesRefetch={refetch} />
  );
};

export default MediaFilesPage;