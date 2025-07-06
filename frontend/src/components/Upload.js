"use client";
import React, { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file.");
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to summarize");
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-[#800000]">Upload Document for Summarization</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} className="mb-4" />
        <button type="submit" className="bg-[#800000] text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Summarizing..." : "Upload & Summarize"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {summary && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <div className="font-semibold mb-2">Summary:</div>
          <div>{summary}</div>
        </div>
      )}
    </div>
  );
};

export default Upload;