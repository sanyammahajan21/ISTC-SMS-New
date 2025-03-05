"use client"; // Mark this as a Client Component

import { useRouter } from "next/navigation";

export default function Filters({
  branches,
  semesters,
  selectedBranchId,
  selectedSemester,
}: {
  branches: { id: number; name: string }[];
  semesters: { id: number; level: number }[]; // Fix: Corrected semester type
  selectedBranchId?: string;
  selectedSemester?: string;
}) {
  const router = useRouter();

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    const url = new URL(window.location.href);
    if (branchId) {
      url.searchParams.set("branchId", branchId);
    } else {
      url.searchParams.delete("branchId");
    }
    router.push(url.toString());
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semester = e.target.value;
    const url = new URL(window.location.href);
    if (semester) {
      url.searchParams.set("semester", semester);
    } else {
      url.searchParams.delete("semester");
    }
    router.push(url.toString());
  };

  return (
    <div className="flex items-center gap-2">
      {/* Branch Filter */}
      <select
        className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
        value={selectedBranchId || ""}
        onChange={handleBranchChange}
      >
        <option value="">All Branches</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      {/* Semester Filter */}
      <select
        className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
        value={selectedSemester || ""}
        onChange={handleSemesterChange}
      >
        <option value="">All Semesters</option>
        {semesters.map((sem) => (
          <option key={sem.id} value={sem.id}>
            Semester {sem.level}
          </option>
        ))}
      </select>
    </div>
  );
}
