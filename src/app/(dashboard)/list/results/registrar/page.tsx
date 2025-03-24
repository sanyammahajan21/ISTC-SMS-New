"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Result {
  teacherId: string;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  studentCount: number;
  verified: boolean;
}

export default function RegistrarResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/results/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // Debugging log
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="bg-teal-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Uploaded Results</h1>

      <table className="w-full border-collapse border border-blue-900">
        <thead>
          <tr className="bg-white border border-blue-900">
            <th className="border p-2">Teacher</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Students</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Download</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((res, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{res.teacherName}</td>
                <td className="border p-2">{res.subjectName}</td>
                <td className="border p-2">{res.studentCount}</td>
                <td className={`border p-2 ${res.verified ? "text-green-600" : "text-red-600"}`}>
                  {res.verified ? "Verified" : "Unverified"}
                </td>
                <td className="border p-2">
                  <Link
                    href={`/api/results/export?teacherId=${res.teacherId}&subjectId=${res.subjectId}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Download Excel
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No results available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}