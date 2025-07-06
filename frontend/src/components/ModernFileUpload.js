import React, { useRef, useState } from "react";
import { IoCloudUploadSharp } from "react-icons/io5";

const ModernFileUpload = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${dragActive ? "border-[#800000] bg-[#f3f4f6]" : "border-gray-300 bg-white"}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      style={{ cursor: "pointer" }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center">
        <IoCloudUploadSharp className="w-12 h-12 text-[#800000] mb-2" />
        <span className="font-semibold text-gray-700">Drag & drop or click to upload</span>
        <span className="text-xs text-gray-500 mt-1">Supported: .txt, .doc</span>
        {fileName && <div className="mt-2 text-sm text-[#800000]">Selected: {fileName}</div>}
      </div>
    </div>
  );
};

export default ModernFileUpload; 