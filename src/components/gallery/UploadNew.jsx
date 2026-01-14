import Image from "next/image";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import Swal from "sweetalert2";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const UploadNew = () => {
  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isUploading, setUploading] = useState(false);

  // Calculate overall progress as the average of each file's progress
  const overallProgress = images.length
    ? Math.round(
        Object.values(uploadProgress).reduce((sum, curr) => sum + curr, 0) /
          images.length
      )
    : 0;

  const uploadImages = async (files) => {
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(
        `/api/media/images`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (response?.status === 500) {
        toast.error("Somothing went wrong!");
        setImages([]);
        setUploadComplete(false);
        setUploading(false);
      }
      const data = await response.json();

      // Images upload successfully
      if (data?.status === true) {
        setUploadComplete(true);
        setUploading(false);
      } else {
        toast.error("Somothing went wrong!");
        setUploading(false);
      }

      if (!response.ok) throw new Error(data.message || "Upload failed");

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const currentCount = images.length;
    const totalCount = currentCount + selectedFiles.length;

    if (selectedFiles.length > 10) {
      Swal.fire({
        icon: "warning",
        title: "Image Limit Reached",
        text: "You can upload a maximum of 10 images only.",
      });
      return;
    }

    const limitedFiles = selectedFiles.slice(0, 10 - currentCount);

    const validFiles = limitedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: `${
            file.name.length > 10
              ? file.name.substring(0, 10) + "..."
              : file.name
          } exceeds the 5MB limit.`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      uploadImages(validFiles);
      const newImages = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
      simulateUpload(newImages);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const selectedFiles = Array.from(event.dataTransfer.files);
    const currentCount = images.length;
    const totalCount = currentCount + selectedFiles.length;

    if (selectedFiles.length > 10) {
      Swal.fire({
        icon: "warning",
        title: "Image Limit Reached",
        text: "You can upload a maximum of 10 images only.",
      });
      return;
    }

    const limitedFiles = selectedFiles.slice(0, 10 - currentCount);

    const validFiles = limitedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: `${
            file.name.length > 10
              ? file.name.substring(0, 10) + "..."
              : file.name
          } exceeds the 5MB limit.`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      uploadImages(validFiles);
      const newImages = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
      simulateUpload(newImages);
    }
  };

  const simulateUpload = (files) => {
    files.forEach(({ file }) => {
      const totalSize = file.size;
      let uploadedSize = 0;

      const uploadInterval = setInterval(() => {
        if (uploadedSize < totalSize) {
          uploadedSize += totalSize / 10;
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [file.name]: Math.min((uploadedSize / totalSize) * 100, 100),
          }));
        } else {
          clearInterval(uploadInterval);
        }
      }, 500);
    });
  };

  const addNewImage = () => {
    if (uploadComplete) {
      setUploadComplete(false);
      setImages([]);
    }
  };

  return (
    <div className="p-2 border">
      <div className="flex items-center my-3 pb-3 border-b">
        <p className="w-full md:text-center md:text-lg text-[12px]">
          Upload Images
        </p>
        <button
          onClick={addNewImage}
          className="flex items-center md:px-4 px-2 md:py-2 py-1 bg-gray-100 text-blue-500 rounded-lg hover:bg-gray-200 whitespace-nowrap"
        >
          <AiOutlinePlus className="mr-2" />
          <span>Add more</span>
        </button>
      </div>

      {images.length === 0 && (
        <div
          className="border-4 border-dashed px-6 md:py-40 py-20 text-center w-full flex items-center justify-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{ backgroundColor: dragging ? "#f0f8ff" : "white" }}
        >
          <div>
            <p className="text-lg text-gray-500">
              Drop files here, paste, or{" "}
              <label
                htmlFor="file-upload"
                className="text-blue-500 cursor-pointer"
              >
                Browse
              </label>
            </p>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Display image previews without individual progress bars */}
      {images.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map(({ url, file }, index) => (
            <div key={index} className="relative">
              <Image
                width={1000}
                height={1000}
                src={url}
                alt="Uploaded preview"
                className="w-full md:h-[200px] object-contain rounded-md"
              />
              <p className="text-sm mt-2 text-center whitespace-normal">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Single overall progress bar at the bottom of the section */}
      {images.length > 0 && !uploadComplete && (
        <div className="mt-4">
          <div className="bg-gray-200 h-2 rounded-full">
            <div
              style={{ width: `${overallProgress}%` }}
              className="bg-green-500 h-2 rounded-full"
            ></div>
          </div>
          <p className="text-center mt-2">{overallProgress}% Uploading...</p>
        </div>
      )}

      {uploadComplete && (
        <div className="mt-4 text-center">
          <p className="text-green-500 font-semibold">All uploads complete</p>
          <div className="mt-2 w-full border-t-2 border-green-500"></div>
        </div>
      )}
      {isUploading && (
        <div className="text-slate-700 text-md text-center my-5">
          Uploading ... do not refresh page.
        </div>
      )}
    </div>
  );
};

export default UploadNew;