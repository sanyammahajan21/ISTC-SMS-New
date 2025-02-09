"use client";

import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [branchId, setBranchId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [message, setMessage] = useState("");

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("branchId", branchId);
    formData.append("gradeId", gradeId);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setMessage(result.message || result.error);
  };

  return (
    <div>
      <h2>Upload Excel File</h2>
      <input
        type="text"
        placeholder="Enter Branch ID"
        value={branchId}
        onChange={(e) => setBranchId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Grade ID"
        value={gradeId}
        onChange={(e) => setGradeId(e.target.value)}
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
}
