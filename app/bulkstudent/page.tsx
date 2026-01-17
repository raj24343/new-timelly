"use client";

import { useState } from "react";

export default function BulkStudentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      alert("Select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("/api/student/bulk-upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    alert(`
Created: ${data.createdCount}
Failed: ${data.failedCount}
`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="font-semibold mb-4">Bulk Student Upload</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={upload}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload Excel"}
      </button>
    </div>
  );
}
