"use client";

import { useState } from "react";

interface UploadSectionProps {
  title: string;
  onUpload: (branchId: string, gradeId: string, file: File | null) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ title, onUpload }) => {
  const [branchId, setBranchId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    if (!branchId || !gradeId) {
      setMessage("Please enter Branch ID and Grade ID.");
      return;
    }

    setLoading(true);
    setMessage(""); // Reset the message

    try {
      await onUpload(branchId, gradeId, file);
      setMessage("Upload successful.");
    } catch (error) {
      setMessage("An error occurred during the upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto mb-8">
      <h2 className="text-3xl font-extrabold text-blue-900 text-center mb-6">{title}</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter Branch ID"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-800 bg-white"
        />
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter Grade ID"
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-800 bg-white"
        />
      </div>

      <div className="mb-6">
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-800 bg-white"
        />
      </div>

      <button
        onClick={handleUpload}
        className={`w-full py-4 px-6 text-white font-semibold rounded-lg focus:outline-none transition-all ${loading ? 'bg-blue-900 cursor-not-allowed' : 'bg-blue-900 hover:bg-cyan-600'} transform hover:scale-105`}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <p
          className={`mt-6 text-center p-4 rounded-lg text-white ${
            message.includes("error") ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default function Upload() {
  const handleFileUpload = async (branchId: string, gradeId: string, file: File | null) => {
    const formData = new FormData();
    formData.append("file", file as Blob);
    formData.append("branchId", branchId);
    formData.append("gradeId", gradeId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        return result.message;
      } else {
        throw new Error(result.error || "Upload failed.");
      }
    } catch (error) {
      throw new Error("An error occurred during the upload.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-purple-50 p-10">
      <div className="w-full max-w-lg">
        <UploadSection title="Student Excel File" onUpload={handleFileUpload} />
        <UploadSection title="Teacher Excel File" onUpload={handleFileUpload} />
      </div>
    </div>
  );
}
