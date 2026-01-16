import React, { useRef, useState } from "react";

const CameraCapture = ({ onCapture }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Image file is too large. Please select an image under 10MB.");
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      onCapture(imageData);
    };
    reader.onerror = () => {
      alert("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    // Set camera input
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Capture or Upload Wound Image
      </h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag and drop area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }
        `}
      >
        <div className="text-6xl mb-4">📸</div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop image here or use buttons below
        </p>
        <p className="text-sm text-gray-500">Supports JPEG, PNG (max 10MB)</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={openCamera}
          className="py-4 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          aria-label="Take photo with camera"
        >
          <span className="text-2xl">📷</span>
          <span>Take Photo</span>
        </button>

        <button
          onClick={openFileDialog}
          className="py-4 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          aria-label="Upload image from device"
        >
          <span className="text-2xl">🖼️</span>
          <span>Upload Image</span>
        </button>
      </div>

      {/* Photo tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Photo Tips for Best Results</span>
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-6">
          <li className="list-disc">Ensure good lighting (avoid shadows)</li>
          <li className="list-disc">Hold camera steady to avoid blur</li>
          <li className="list-disc">Position wound in center of frame</li>
          <li className="list-disc">Get close enough to see wound clearly</li>
          <li className="list-disc">
            Clean away excess blood if safe to do so
          </li>
          <li className="list-disc">Minimum resolution: 400x400 pixels</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraCapture;
